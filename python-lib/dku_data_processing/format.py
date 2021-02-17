import logging
import numpy as np
import re

from dku_data_processing.filtering import filter_dataframe
from utils.df_column_naming import get_new_column_name

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def normalize(x):
    """
    Will normalize data to have 75% of the values between 0 and 1
    """
    left_percentile = np.percentile(x, 12.5)
    right_percentile = np.percentile(x, 87.5)
    if left_percentile == right_percentile:
        return np.ones(len(x))
    else:
        x_scaled = (x - left_percentile) / (right_percentile - left_percentile)
    return x_scaled


def wkt_parser(wkt_point):
    if wkt_point is None:
        return (None, None)
    result = re.findall("POINT\(\s?(\S+)\s+(\S+)\s?\)", str(wkt_point))
    if len(result) < 1:
        return (None, None)
    else:
        return result[0]


def extract_df(df, detail, filters, geopoint, tooltips):
    """

    Extract and select only necessary data to send to front-end.
    Handle the filtering, normalizing, parsing and the tooltip.

    :param detail:
    :param df:
    :param filters:
    :param geopoint:
    :param tooltips:
    """
    # Get filtered dataframe
    if filters:
        df = filter_dataframe(df, filters)
    if df.empty:
        # Handle case where dataframe is empty after filtering
        return []

    new_detail_column = get_new_column_name(df, "detail")

    # Get normalized detail column
    if (detail is None) or (df.dtypes[detail] not in ['int64', 'float64']):
        df[new_detail_column] = 1
    else:
        df[new_detail_column] = normalize(df[detail].values)
    if (detail is not None) and (df.dtypes[detail] not in ['int64', 'float64']):
        raise ValueError("The detail column should be a int or float type.")

    def convert(x):
        if x is not None:
            return float(x)
        else:
            return None

    new_longitude_column = get_new_column_name(df, "longitude")
    new_latitude_column = get_new_column_name(df, "latitude")

    # Parse longitude and latitude from WKT geopoint column
    parsed_lat_long_df = df[geopoint].apply(wkt_parser)
    df[new_longitude_column] = parsed_lat_long_df.apply(lambda x: x[0]).apply(lambda x: convert(x))
    df[new_latitude_column] = parsed_lat_long_df.apply(lambda x: x[1]).apply(lambda x: convert(x))

    # Handle tooltip
    tooltip_column_to_keep = set()
    if (tooltips is not None) and (tooltips != []):
        for col_ in tooltips:
            tooltip_column_to_keep.add(col_['column'])
    tooltip_column_to_keep = list(tooltip_column_to_keep)
    tooltip_df = df[tooltip_column_to_keep]

    df = df[[new_latitude_column, new_longitude_column, new_detail_column]]
    new_tooltip_column = get_new_column_name(df, 'tooltip')
    df[new_tooltip_column] = tooltip_df.to_dict(orient='records')
    df = df.rename(columns={new_latitude_column: "lat", new_longitude_column: "long",
                            new_detail_column: "detail", new_tooltip_column: "tooltip"})
    df = df.dropna(subset=['lat', 'long'])

    geodata_object = df.to_dict(orient='records')

    return geodata_object


def fetch_geo_data(dss_dataset, geopoint, detail, tooltips, filters):
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

    df = dss_dataset.get_dataframe(limit=1000000, columns=column_to_retrieves)

    geodata_object = extract_df(df, detail, filters, geopoint, tooltips)

    return geodata_object


