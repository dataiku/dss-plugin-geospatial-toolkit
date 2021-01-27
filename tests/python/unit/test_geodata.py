import numpy as np
import pandas as pd
import pdb


def convert_numpy_int64_to_int(o):
    if isinstance(o, np.int64):
        return int(o)
    raise TypeError


def test_wkt_parser():
    wkt_point = "POINT(-45 59)"
    result = wkt_parser(wkt_point)
    
    assert False


def test_extract_lat_long():
    coordinates = ['POINT(-73.97237 40.64749)', 'POINT(-73.98377 40.75362)', 'POINT(-73.9419 40.80902)']
    lat, long_ = extract_lat_long(coordinates)
    assert False


def test_extract_lat_long_invalid():
    coordinates = [None, 'POINT(-73.98377 40.75362)', 'POINT(-73.9419 40.80902)']
    lat, long_ = extract_lat_long(coordinates)
    assert False


def test_format_geodata():
    data = {
        'id': {0: 2539, 1: 2595, 2: 3647},
        'name': {0: 'Clean & quiet apt home by the park', 1: 'Skylit Midtown Castle', 2: 'THE VILLAGE OF HARLEM....NEW YORK !'},
        'host_id': {0: 2787, 1: 2845, 2: 4632},
        'host_name': {0: 'John', 1: 'Jennifer', 2: 'Elisabeth'},
        'neighbourhood_group': {0: 'Brooklyn', 1: 'Manhattan', 2: 'Manhattan'},
        'neighbourhood': {0: 'Kensington', 1: 'Midtown', 2: 'Harlem'},
        'latitude': {0: 40.647490000000005, 1: 40.75362, 2: 40.809020000000004},
        'longitude': {0: -73.97237, 1: -73.98376999999999, 2: -73.9419},
        'room_type': {0: 'Private room', 1: 'Entire home/apt', 2: 'Private room'},
        'price': {0: 149, 1: 225, 2: 150},
        'minimum_nights': {0: 1, 1: 1, 2: 3},
        'number_of_reviews': {0: 9, 1: 45, 2: 0},
        'last_review': {0: '2018-10-19', 1: '2019-05-21', 2: np.nan}, 'reviews_per_month': {0: 0.21, 1: 0.38, 2: np.nan},
        'calculated_host_listings_count': {0: 6, 1: 2, 2: 1},
        'availability_365': {0: 365, 1: 355, 2: 365},
        'coordinates': {0: 'POINT(-73.97237 40.64749)', 1: 'POINT(-73.98377 40.75362)', 2: 'POINT(-73.9419 40.80902)'}
        }
    df = pd.DataFrame.from_dict(data)
    tooltips = [{'column': 'latitude', 'type': 'NUMERICAL', 'treatAsAlphanum': False, 'isA': 'ua', 'adminLevel': 0},
                {'column': 'longitude', 'type': 'NUMERICAL', 'treatAsAlphanum': False, 'isA': 'ua', 'adminLevel': 0}]
    details = 'price'
    geodata = format_geodata(df=df, geopoint='coordinates', detail_column_name=details, tooltip=tooltips)
    assert len(geodata) == 3
    assert 'lat' in geodata[0].keys()
    assert 'long' in geodata[0].keys()
    assert 'detail' in geodata[0].keys()
    assert 'tooltip' in geodata[0].keys()


def test_format_geodata_invalid_detail():
    data = {
        'id': {0: 2539, 1: 2595, 2: 3647},
        'name': {0: 'Clean & quiet apt home by the park', 1: 'Skylit Midtown Castle', 2: 'THE VILLAGE OF HARLEM....NEW YORK !'},
        'host_id': {0: 2787, 1: 2845, 2: 4632},
        'host_name': {0: 'John', 1: 'Jennifer', 2: 'Elisabeth'},
        'neighbourhood_group': {0: 'Brooklyn', 1: 'Manhattan', 2: 'Manhattan'},
        'neighbourhood': {0: 'Kensington', 1: 'Midtown', 2: 'Harlem'},
        'latitude': {0: 40.647490000000005, 1: 40.75362, 2: 40.809020000000004},
        'longitude': {0: -73.97237, 1: -73.98376999999999, 2: -73.9419},
        'room_type': {0: 'Private room', 1: 'Entire home/apt', 2: 'Private room'},
        'price': {0: 149, 1: 225, 2: 150},
        'minimum_nights': {0: 1, 1: 1, 2: 3},
        'number_of_reviews': {0: 9, 1: 45, 2: 0},
        'last_review': {0: '2018-10-19', 1: '2019-05-21', 2: np.nan}, 'reviews_per_month': {0: 0.21, 1: 0.38, 2: np.nan},
        'calculated_host_listings_count': {0: 6, 1: 2, 2: 1},
        'availability_365': {0: 365, 1: 355, 2: 365},
        'coordinates': {0: 'POINT(-73.97237 40.64749)', 1: 'POINT(-73.98377 40.75362)', 2: 'POINT(-73.9419 40.80902)'}
        }
    df = pd.DataFrame.from_dict(data)
    tooltips = [{'column': 'room_type'},
                {'column': 'longitude'}]
    details = 'room_type'
    geodata = format_geodata(df=df, geopoint='coordinates', detail_column_name=details, tooltip=tooltips)
    
    assert len(geodata) == 3
    assert 'lat' in geodata[0].keys()
    assert 'long' in geodata[0].keys()
    assert 'detail' in geodata[0].keys()
    assert 'tooltip' in geodata[0].keys()


def test_format_geodata_invalid_geocolumn():
    data = {
        'id': {0: 2539, 1: 2595, 2: 3647},
        'name': {0: 'Clean & quiet apt home by the park', 1: 'Skylit Midtown Castle', 2: 'THE VILLAGE OF HARLEM....NEW YORK !'},
        'host_id': {0: 2787, 1: 2845, 2: 4632},
        'host_name': {0: 'John', 1: 'Jennifer', 2: 'Elisabeth'},
        'neighbourhood_group': {0: 'Brooklyn', 1: 'Manhattan', 2: 'Manhattan'},
        'neighbourhood': {0: 'Kensington', 1: 'Midtown', 2: 'Harlem'},
        'latitude': {0: 40.647490000000005, 1: 40.75362, 2: 40.809020000000004},
        'longitude': {0: -73.97237, 1: -73.98376999999999, 2: -73.9419},
        'room_type': {0: 'Private room', 1: 'Entire home/apt', 2: 'Private room'},
        'price': {0: 149, 1: 225, 2: 150},
        'minimum_nights': {0: 1, 1: 1, 2: 3},
        'number_of_reviews': {0: 9, 1: 45, 2: 0},
        'last_review': {0: '2018-10-19', 1: '2019-05-21', 2: np.nan}, 'reviews_per_month': {0: 0.21, 1: 0.38, 2: np.nan},
        'calculated_host_listings_count': {0: 6, 1: 2, 2: 1},
        'availability_365': {0: 365, 1: 355, 2: 365},
        'coordinates': {0: 'POINT(-73.97237 40.64749)', 1: 'POINT(-73.98377 40.75362)', 2: 'POINT(-73.9419 40.80902)'}
        }
    df = pd.DataFrame.from_dict(data)
    tooltips = []
    details = None
    geodata = format_geodata(df=df, geopoint='room_type', detail_column_name=details, tooltip=tooltips)
    assert len(geodata) == 0


def test_format_geodata_invalid_geocolumn_2():
    data = {
        'id': {0: 2539, 1: 2595, 2: 3647},
        'name': {0: 'Clean & quiet apt home by the park', 1: 'Skylit Midtown Castle', 2: 'THE VILLAGE OF HARLEM....NEW YORK !'},
        'host_id': {0: 2787, 1: 2845, 2: 4632},
        'host_name': {0: 'John', 1: 'Jennifer', 2: 'Elisabeth'},
        'neighbourhood_group': {0: 'Brooklyn', 1: 'Manhattan', 2: 'Manhattan'},
        'neighbourhood': {0: 'Kensington', 1: 'Midtown', 2: 'Harlem'},
        'latitude': {0: 40.647490000000005, 1: 40.75362, 2: 40.809020000000004},
        'longitude': {0: -73.97237, 1: -73.98376999999999, 2: -73.9419},
        'room_type': {0: 'Private room', 1: 'Entire home/apt', 2: 'Private room'},
        'price': {0: 149, 1: 225, 2: 150},
        'minimum_nights': {0: 1, 1: 1, 2: 3},
        'number_of_reviews': {0: 9, 1: 45, 2: 0},
        'last_review': {0: '2018-10-19', 1: '2019-05-21', 2: np.nan}, 'reviews_per_month': {0: 0.21, 1: 0.38, 2: np.nan},
        'calculated_host_listings_count': {0: 6, 1: 2, 2: 1},
        'availability_365': {0: 365, 1: 355, 2: 365},
        'coordinates': {0: 'POINT(-73.97237 40.64749)', 1: 'POINT(-73.98377 40.75362)', 2: 'POINT(-73.9419 40.80902)'}
        }
    df = pd.DataFrame.from_dict(data)
    tooltips = []
    details = None
    geodata = format_geodata(df=df, geopoint='longitude', detail_column_name=details, tooltip=tooltips)
    geo_data = fetch_geo_data(dss_dataset, geopoint, detail, tooltips, filters)
    pdb.set_trace()
    assert len(geodata) == 0
