"""
This module handles the call to backend for retrieving data that will
be displayed in the chart and the processing of this data as a DataFrame.

"""

import logging
import numpy as np
import re

from dku_data_processing.filtering import filter_dataframe
from utils.df_column_naming import get_unique_column_name

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def convert_numpy_int64_to_int(o):
    if isinstance(o, np.int64):
        return int(o)
    raise TypeError


def normalize(x):
    """
    Linear scaling of the values to set the percentile 12.5% to 0 and the percentile 87.5% to 1.
    Doing such lower the impact of outliers on color scale.

    :param x: Array of values to normalize
    :return: the normalized array of values
    """
    left_percentile = np.percentile(x, 12.5)
    right_percentile = np.percentile(x, 87.5)
    if left_percentile == right_percentile:
        return np.ones(len(x))
    else:
        x_scaled = (x - left_percentile) / (right_percentile - left_percentile)
    return x_scaled


def wkt_parser(wkt_point):
    """
    Parsing function of the Well Known Text point representation

    :param wkt_point: <str>
        example: `POINT(-73.97237 40.64749)`
    :return: A couple of values (longitude, latitude)
    """
    if wkt_point is None:
        return None, None
    result = re.findall("POINT\(\s?(\S+)\s+(\S+)\s?\)", str(wkt_point))
    if len(result) < 1:
        return None, None
    else:
        return result[0]


def prepare_df_to_display(df, detail, filters, geopoint, tooltips):
    """
    Extract minimum amount of columns and values to send to front-end.
    Apply filters, compute normalization, parse latitude, longitude and build tooltip.

    :param df: Input DataFrame
    :param detail: Optional single column name of the column on which color will be computed
    :param filters: Optional list of filters to apply to the DataFrame to select values
    :param geopoint: Name of the column containing GeoPoint WKT objects
    :param tooltips: List of columns to include in the tooltip value that will be displayed
    :return: Data to send to front-end
    """
    # Get filtered dataframe
    if filters:
        df = filter_dataframe(df, filters)
    if df.empty:
        # Handle case where dataframe is empty after filtering
        return []

    new_detail_column = get_unique_column_name(df, "detail")

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

    new_longitude_column = get_unique_column_name(df, "longitude")
    new_latitude_column = get_unique_column_name(df, "latitude")

    # Parse longitude and latitude from WKT geopoint column
    parsed_lat_long_df = df[geopoint].apply(wkt_parser)
    df[new_longitude_column] = parsed_lat_long_df.apply(lambda x: x[0]).apply(convert)
    df[new_latitude_column] = parsed_lat_long_df.apply(lambda x: x[1]).apply(convert)

    # Handle tooltip
    tooltip_column_to_keep = set()
    if tooltips:
        for col_ in tooltips:
            tooltip_column_to_keep.add(col_['column'])
    tooltip_column_to_keep = list(tooltip_column_to_keep)
    tooltip_df = df[tooltip_column_to_keep]

    df = df[[new_latitude_column, new_longitude_column, new_detail_column]]
    new_tooltip_column = get_unique_column_name(df, 'tooltip')
    df[new_tooltip_column] = tooltip_df.to_dict(orient='records')
    df = df.rename(columns={new_latitude_column: "lat", new_longitude_column: "long",
                            new_detail_column: "detail", new_tooltip_column: "tooltip"})
    df = df.dropna(subset=['lat', 'long'])

    geodata_object = df.to_dict(orient='records')

    return geodata_object


def get_geodata_from_dataset(dss_dataset, geopoint, detail, tooltips, filters):
    """
    Get the selected geospatial data that will be sent to front-end based on
    necessary columns.

    :param dss_dataset: DSS dataset from which values are extracted
    :param geopoint:
    :param detail:
    :param tooltips:
    :param filters:
    :return:
    """
    schema = dss_dataset.read_schema()
    column_names = [dss_column['name'] for dss_column in schema]
    columns_to_retrieve = set()

    if geopoint is None:
        logger.warning("The column containing the geopoint must be specified.")
        return []

    if geopoint not in column_names:
        logger.warning("The column containing the geopoint must be part of the dataset.")
        return []

    columns_to_retrieve.add(geopoint)

    if (tooltips is not None) and (tooltips != []):
        for col_ in tooltips:
            columns_to_retrieve.add(col_['column'])

    if detail is not None:
        columns_to_retrieve.add(detail)

    if (filters is not None) and (filters != []):
        for col_ in filters:
            columns_to_retrieve.add(col_['column'])

    # Sampling should be the same as DSS by default
    df = dss_dataset.get_dataframe(sampling='head', limit=10000)
    df = df[list(columns_to_retrieve)]

    geodata_object = prepare_df_to_display(df, detail, filters, geopoint, tooltips)

    return geodata_object
