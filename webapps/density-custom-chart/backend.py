import dataiku
from flask import request
import simplejson as json
import traceback
import logging
import numpy as np
from geodata import format_geodata
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

        # Configuration
        config = json.loads(request.args.get('config', None))
        logger.info("Configuration {}".format(config))
        tooltip_column_name = config.get('tooltip_column_name', None)
        logger.info("Got following tooltip column: {}".format(tooltip_column_name))
        filters = json.loads(request.args.get('filters', None))
        dataset_name = config.get('dataset_name')
        geopoint_column_name = config.get('geopoint_column_name')
        logger.info("geopoint_column_name={}".format(geopoint_column_name))

        # Fetch dataset from name
        df = dataiku.Dataset(dataset_name).get_dataframe(limit=100000)

        # Filtering
        if filters:
            df = filter_dataframe(df, filters)
        logger.info("df={}".format(df.head()))

        # Visualisation needs the following: coordinates, tooltip, intensity
        geopoint_column_name = config.get('geopoint_column_name', None)
        details_column_name = config.get('details_column_name', None)
        tooltip_column_names = config.get('tooltip_column_name', None)

        # Format rows
        geodata = format_geodata(df, geopoint_column_name, details_column_name, tooltip_column_names)

        if df.empty:
            raise Exception("Dataframe is empty")

        return json.dumps(geodata, ignore_nan=True, default=convert_numpy_int64_to_int)
    except Exception as e:
        logging.error(traceback.format_exc())
        return str(e), 500