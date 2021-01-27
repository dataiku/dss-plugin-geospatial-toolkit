import dataiku
import dataikuapi
import pdb

from dataiku import Dataset

import re
import logging
import numpy as np
from dku_data_processing.filtering import filter_dataframe

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def normalize(x):
    """
    Will normalize data to have 75% of the values between 0 and 1
    """
    x_scaled = (x - np.percentile(x, 12.5)) / (np.percentile(x, 87.5) - np.percentile(x, 12.5))
    return x_scaled


def wkt_parser(wkt_point):
    if wkt_point is None:
        return (None, None)
    result = re.findall("POINT\(\s?(\S+)\s+(\S+)\s?\)", str(wkt_point))
    if len(result) < 1:
        return (None, None)
    else:
        return result[0]


def fetch_geo_data(dss_dataset: Dataset, geopoint, detail, tooltips, filters):
    """

    :param dss_dataset:
    :param geopoint:
    :param details:
    :param tooltip:
    :param filters:
    :return:
    """

    schema = dss_dataset.read_schema()

    column_names = [dss_column['name'] for dss_column in schema]

    column_to_retrieves = set()

    if geopoint is None:
        logger.warning("The column containing the geopoint must be specified.")
        return []

    if geopoint not in column_names:
        logger.warning("The column containing the geopoint must be part of the dataset.")
        return []

    column_to_retrieves.add(geopoint)

    if (tooltips is not None) and (tooltips != []):
        for col_ in tooltips:
            column_to_retrieves.add(col_['column'])

    if detail is not None:
        column_to_retrieves.add(detail)

    if (filters is not None) and (filters != []):
        for col_ in filters:
            column_to_retrieves.add(col_['column'])

    df = dss_dataset.get_dataframe(limit=5000, columns=column_to_retrieves)

    if (filters is not None) and (filters != []):
        df = filter_dataframe(df, filters)

    if (detail is None) or (df.dtypes[detail] not in ['int64', 'float64']):
        df['detail_'] = 1
    else:
        df['detail_'] = normalize(df[detail].values)

    def convert(x):
        if x is not None:
            return float(x)
        else:
            return None

    parsed_lat_long_df = df[geopoint].apply(wkt_parser)
    df['longitude_'] = parsed_lat_long_df.apply(lambda x: x[0]).apply(lambda x: convert(x))
    df['latitude_'] = parsed_lat_long_df.apply(lambda x: x[1]).apply(lambda x: convert(x))
    df = df.drop(geopoint, axis=1)

    tooltip_column_to_keep = set()
    if (tooltips is not None) and (tooltips != []):
        for col_ in tooltips:
            tooltip_column_to_keep.add(col_['column'])
    tooltip_column_to_keep = list(tooltip_column_to_keep)

    tooltip_df = df[tooltip_column_to_keep]
    df = df[['latitude_', 'longitude_', 'detail_']]

    df['tooltip_'] = tooltip_df.to_dict(orient='records')
    df = df.rename(columns={"latitude_": "lat", "longitude_": "long", "detail_": "detail", "tooltip_": "tooltip"})

    df = df.dropna(subset=['lat', 'long'])

    geodata_object = df.to_dict(orient='records')

    return geodata_object
