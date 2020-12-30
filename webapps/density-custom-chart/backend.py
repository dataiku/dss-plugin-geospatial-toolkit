import dataiku
from flask import request
import simplejson as json
import traceback
import logging
import numpy as np

from dku_filtering.filtering import filter_dataframe

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def convert_numpy_int64_to_int(o):
    if isinstance(o, np.int64):
        return int(o)
    raise TypeError


@app.route('/get_geo_data')
def get_geo_data():
    """
    Get the column of geopoints and send lat/long series to front end for display
    :return:
    """
    logger.info("Calling backend - get_geo_data... ")
    try:
        config = json.loads(request.args.get('config', None))
        logger.info("Configuration {}".format(config))
        # TODO: Investigate the filters in the display
        tooltip_column_name = config.get('tooltip_column_name', None)
        logger.info("Got following tooltip column: {}".format(tooltip_column_name))
        filters = json.loads(request.args.get('filters', None))
        # Do filtering on the columns

        #
        logger.info("Filters {}".format(filters))
        # TODO: Input sanitizer
        dataset_name = config.get('dataset_name')
        geopoint_column_name = config.get('geopoint_column_name')
        # Fetch dataset from name
        # TODO: Secure call to API
        df = dataiku.Dataset(dataset_name).get_dataframe(limit=100000)
        if len(filters) > 0:  # apply filters to dataframe
            df = filter_dataframe(df, filters)

        tooltip = ['A sample tooltip' for i in range(len(df))]
        coordinates = list(df[geopoint_column_name].values)
        long = [eval(i[6:-1].split(' ')[0]) for i in coordinates]
        lat = [eval(i[6:-1].split(' ')[1]) for i in coordinates]
        if df.empty:
            raise Exception("Dataframe is empty")
        return json.dumps({'lat': lat, 'long': long, 'tooltip': tooltip}, ignore_nan=True, default=convert_numpy_int64_to_int)
    except Exception as e:
        logging.error(traceback.format_exc())
        return str(e), 500