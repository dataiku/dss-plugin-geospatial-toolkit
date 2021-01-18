import pdb
import numpy as np
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def format_geodata(df, geopoint, detail_column_name, tooltip):
    logger.info("format_geodata: {}".format(detail_column_name))

    coordinates = list(df[geopoint].values)
    # TODO: Use regexp
    df['long_'] = [eval(i[6:-1].split(' ')[0]) for i in coordinates]
    df['lat_'] = [eval(i[6:-1].split(' ')[1]) for i in coordinates]
    df['detail_'] = round(df[detail_column_name] / np.sum(df[detail_column_name]), 3)
    series = df.to_dict(orient='records')
    datapoints = []
    for i in range(len(df)):
        datapoints.append({
            "lat": series[i]['lat_'],
            "long": series[i]['long_'],
            "detail": series[i]['detail_'],
            "tooltip": {col_['column']: series[i][col_['column']] for col_ in tooltip}
        })
    return datapoints
