import dataiku
from flask import request
import simplejson as json
import traceback
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


@app.route('/get_geo_data')
def get_geo_data():
    """
    Get the column of geopoints and send lat/long series to front end for display
    :return:
    """
    logger.info("Calling backend - get_geo_data... ")
    try:
        config = json.loads(request.args.get('config', None))
        # TODO: Investigate the filters in the display
        filters = json.loads(request.args.get('filters', None))
        logger.info("Configuration {}".format(config))
        # TODO: Input sanitizer
        dataset_name = config.get('dataset_name')
        geopoint_column_name = config.get('geopoint_column_name')
        # Fetch dataset from name
        # TODO: Secure call to API
        df = dataiku.Dataset(dataset_name).get_dataframe(limit=100000)
        coordinates = list(df[geopoint_column_name].values)
        lat = [eval(i[6:-1].split(' ')[0]) for i in coordinates]
        long = [eval(i[6:-1].split(' ')[1]) for i in coordinates]
        if df.empty:
            raise Exception("Dataframe is empty")
        return json.dumps({'lat': lat, 'long': long})
    except Exception as e:
        logging.error(traceback.format_exc())
        return str(e), 500