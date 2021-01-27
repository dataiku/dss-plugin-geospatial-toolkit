
import pdb

import dataikuapi
import dataiku
import logging
from dku_data_processing.filtering import filter_dataframe
import json
from dku_data_processing.format import fetch_geo_data

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def test_dataset_retrieval_performance():

    with open('./credentials.json', 'r') as file:
        dss_config = json.load(file)['credentials']

    # Configure DSS connection
    dku_client = dataikuapi.DSSClient(
        host="{}:{}".format(dss_config['DKU_HOST'], dss_config['DKU_PORT']),
        api_key=dss_config['DKU_API_KEY'])
    dataiku.set_remote_dss(
        "{}:{}".format(dss_config['DKU_HOST'], dss_config['DKU_PORT']),
        dss_config['DKU_API_KEY'])
    dataiku.set_default_project_key('PLUGINDVPGEOSPATIALTOOLKIT')
    dku_client.list_projects()
    project = dku_client.get_project('PLUGINDVPGEOSPATIALTOOLKIT')

    dataset_name = 'new_york_city_airbnb_prepared'

    dss_dataset = dataiku.Dataset(dataset_name)

    geopoint = 'GeoPoint'
    detail = 'price'
    tooltips = [{'column': 'reviews_per_month', 'type': 'NUMERICAL', 'treatAsAlphanum': False, 'isA': 'ua', 'adminLevel': 0}]
    filters = [{'filterType': 'ALPHANUM_FACET', 'column': 'neighbourhood_group', 'columnType': 'ALPHANUM', 'isA': 'filter', 'excludedValues': {}, 'explicitExclude': False}]
    geo_data = fetch_geo_data(dss_dataset, geopoint, detail, tooltips, filters)
    assert len(geo_data) == 1000
    assert True


def test_dataset_retrieval_performance_2():

    with open('./credentials.json', 'r') as file:
        dss_config = json.load(file)['credentials']

    # Configure DSS connection
    dku_client = dataikuapi.DSSClient(
        host="{}:{}".format(dss_config['DKU_HOST'], dss_config['DKU_PORT']),
        api_key=dss_config['DKU_API_KEY'])
    dataiku.set_remote_dss(
        "{}:{}".format(dss_config['DKU_HOST'], dss_config['DKU_PORT']),
        dss_config['DKU_API_KEY'])
    dataiku.set_default_project_key('PLUGINDVPGEOSPATIALTOOLKIT')
    dku_client.list_projects()
    project = dku_client.get_project('PLUGINDVPGEOSPATIALTOOLKIT')

    dataset_name = 'new_york_city_airbnb_prepared'

    dss_dataset = dataiku.Dataset(dataset_name)

    geopoint = 'latitude'
    detail = 'price'
    tooltips = [{'column': 'reviews_per_month', 'type': 'NUMERICAL', 'treatAsAlphanum': False, 'isA': 'ua', 'adminLevel': 0}]
    filters = [{'filterType': 'ALPHANUM_FACET', 'column': 'neighbourhood_group', 'columnType': 'ALPHANUM', 'isA': 'filter', 'excludedValues': {}, 'explicitExclude': False}]
    geo_data = fetch_geo_data(dss_dataset, geopoint, detail, tooltips, filters)
    assert len(geo_data) == 0
