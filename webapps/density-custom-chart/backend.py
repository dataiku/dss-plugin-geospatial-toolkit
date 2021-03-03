import dataiku
import logging
import simplejson as json
import traceback


from dku_data_processing.format import get_geodata_from_dataset, convert_numpy_int64_to_int
from flask import request

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


@app.route('/get_geo_data', methods = ['POST'])
def get_geo_data():
    """
    Retrieve geospatial data based on user input parameters to be displayed in the chart.

    :return:
    """
    logger.info("Calling backend - get_geo_data... ")
    try:
        # Configuration
        received_request_body = request.get_json()
        config = received_request_body.get('config', None)

        logger.info("Backend received configuration: {}".format(config))

        dataset_name = config.get('datasetName', None)
        details_column_name = config.get('detailsColumnName', None)
        geopoint_column_name = config.get('geopointColumnName', None)
        tooltip_columns_names = config.get('tooltipColumnName', None)
        filters = config.get('filters', None)
        geodata = get_geodata_from_dataset(dataiku.Dataset(dataset_name), geopoint_column_name, details_column_name, tooltip_columns_names, filters)
        return json.dumps(geodata, ignore_nan=True, default=convert_numpy_int64_to_int)

    except Exception as e:
        logging.error(traceback.format_exc())
        return str(e), 500
