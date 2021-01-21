import dataiku
from flask import request
import simplejson as json
import traceback
import logging
import numpy as np
from geodata import format_geodata

from dku_data_processing.format import fetch_geo_data


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
        logger.info("Backend received configuration: {}".format(config))

        dataset_name = config.get('datasetName', None)
        details_column_name = config.get('detailsColumnName', None)
        geopoint_column_name = config.get('geopointColumnName', None)
        tooltip_columns_names = config.get('tooltipColumnName', None)
        filters = config.get('filters', None)
        geodata = fetch_geo_data(dataiku.Dataset(dataset_name), geopoint_column_name, details_column_name, tooltip_columns_names, filters)
        return json.dumps(geodata, ignore_nan=True, default=convert_numpy_int64_to_int)

    except Exception as e:
        logging.error(traceback.format_exc())
        return str(e), 500
