import pdb
import numpy as np
import logging
import re
import pandas as pd

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def normalize(x):
    x_scaled = (x - np.percentile(x, 25)) / (np.percentile(x, 75) - np.percentile(x, 25))
    return x_scaled


def wkt_parser(wkt_point):
    if wkt_point is None:
        return (None, None)
    result = re.findall("POINT\(\s?(\S+)\s+(\S+)\s?\)", wkt_point)
    if len(result) < 1:
        return (None, None)
    else:
        return result[0]


def extract_lat_long(coordinates):
    def convert(x):
        if x is not None:
            return float(x)
        else:
            return None
    coords_tuples = [wkt_parser(x) for x in coordinates]
    long_ = list(map(convert, [x[0] for x in coords_tuples]))
    lat = list(map(convert, [x[1] for x in coords_tuples]))
    return long_, lat


def format_geodata(df, geopoint, detail_column_name, tooltip):
    """
    Extract only necessary data for density visualisation rendering.

    :param df: The input DataFrame
    :param geopoint: Name of the geopoint column
    :param detail_column_name: Name of the column containing the numeric detail feature (intensity), can be equal to None
    :param tooltip: Names of the columns that needs to appear on the tooltip
    :return:
    """
    logger.info("Call format_geodata: {}".format(detail_column_name))
    coordinates = list(df[geopoint].values)
    # Initialise empty dataframe for temporary storage
    copy_df = pd.DataFrame()
    copy_df['longitude'], copy_df['latitude'] = extract_lat_long(coordinates)

    # If no detail column is provided, return 1 for the intensity by default
    # if detail column is not specified or not numeric
    if detail_column_name is None or df.dtypes[detail_column_name] not in ['int64', 'float64']:
        copy_df['detail_'] = [1 for i in range(len(df))]
    else:
        # Store detail of columns
        copy_df['detail_'] = normalize(df[detail_column_name].values)

    for tooltip_ in tooltip:
        copy_df[tooltip_['column']] = list(df[tooltip_['column']].values)

    series = copy_df.to_dict(orient='records')
    datapoints = []
    for i in range(len(copy_df)):
        datapoints.append({
            "lat": series[i]['latitude'],
            "long": series[i]['longitude'],
            "detail": series[i]['detail_'],
            "tooltip": {col_['column']: series[i][col_['column']] for col_ in tooltip}
        })
    return datapoints
