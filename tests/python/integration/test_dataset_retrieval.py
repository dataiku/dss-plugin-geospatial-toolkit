import pdb

import dataikuapi
import dataiku
import logging
from dku_data_processing.filtering import filter_dataframe
import json
from dku_data_processing.format import fetch_geo_data

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def test_dataset_filtering_min_bound():

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
    tooltips = [{'column': 'id', 'type': 'NUMERICAL', 'treatAsAlphanum': False, 'isA': 'ua', 'adminLevel': 0}]
    filters = [{'filterType': 'NUMERICAL_FACET', 'column': 'id', 'columnType': 'NUMERICAL', 'minValue': 1337790.3543999998,
      'isA': 'filter', 'excludedValues': {}, 'explicitExclude': False, 'maxValue': None}]
    geo_data = fetch_geo_data(dss_dataset, geopoint, detail, tooltips, filters)
    for datapoint in geo_data:
        assert datapoint['tooltip']['id'] > 1337790.3543999998


def test_dataset_filtering_min_max_bound():

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
    tooltips = [{'column': 'id', 'type': 'NUMERICAL', 'treatAsAlphanum': False, 'isA': 'ua', 'adminLevel': 0}]
    filters = [{'filterType': 'NUMERICAL_FACET', 'column': 'id', 'columnType': 'NUMERICAL', 'minValue': 1337790.35,
      'isA': 'filter', 'excludedValues': {}, 'explicitExclude': False, 'maxValue': 4269945}]
    geo_data = fetch_geo_data(dss_dataset, geopoint, detail, tooltips, filters)
    for datapoint in geo_data:
        assert datapoint['tooltip']['id'] > 1337790.3543999998
        assert datapoint['tooltip']['id'] < 4269945


def test_dataset_numerical_filter_as_string():

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
    filters = [{'column': 'id', 'type': 'NUMERICAL', 'label': 'id', 'cacheable': True, '__justDragDropped': True,
     'columnType': 'NUMERICAL', 'filterType': 'ALPHANUM_FACET', 'isA': 'filter', 'excludedValues': {}, 'minValue': None,
     'maxValue': None}]
    geo_data = fetch_geo_data(dss_dataset, geopoint, detail, tooltips, filters)
    assert len(geo_data) > 0
