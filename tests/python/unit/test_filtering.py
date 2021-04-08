import numpy as np
import pandas as pd
import pdb

from dku_data_processing.filtering import filter_dataframe


def generate_sample_df():
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
        'last_review': {0: '2018-10-19', 1: '2019-05-21', 2: np.nan},
        'reviews_per_month': {0: 0.21, 1: 0.38, 2: np.nan},
        'calculated_host_listings_count': {0: 6, 1: 2, 2: 1},
        'availability_365': {0: 365, 1: 355, 2: 365},
        'coordinates': {0: 'POINT(-73.97237 40.64749)', 1: np.nan, 2: 'POINT(-73.9419 40.80902)'}
        }
    df = pd.DataFrame.from_dict(data)
    return df


# TODO: Run those tests


# def test_filter_dataframe_date_facet_min():
#     df = generate_sample_df()
#     filters = [{'filterType': 'DATE_FACET', 'column': 'last_review', 'columnType': 'DATE',
#                 'dateFilterType': 'RANGE', 'minValue': 1397529094738, 'isA': 'filter', 'excludedValues': {},
#                 'explicitExclude': False, 'maxValue': None}]
#     filtered_df = filter_dataframe(df, filters)
#     assert True


# def test_filter_dataframe_date_facet():
#     df = generate_sample_df()
#     filters = [{'column': 'last_review_parsed', 'type': 'DATE', 'label': 'last_review_parsed', 'cacheable': True,
#                 '__justDragDropped': True, 'columnType': 'DATE', 'filterType': 'DATE_FACET',
#                 'dateFilterType': 'QUARTER_OF_YEAR', 'isA': 'filter', 'excludedValues': {'0': True},
#                 'minValue': 1392381193847, 'maxValue': None}]
#     filtered_df = filter_dataframe(df, filters)
#     assert True
#
#


def test_filter_dataframe_numerical_facet_no_extrema():
    df = generate_sample_df()
    filters = [{'column': 'id', 'type': 'NUMERICAL', 'label': 'id', 'cacheable': True, '__justDragDropped': True, 'columnType': 'NUMERICAL', 'filterType': 'NUMERICAL_FACET', 'isA': 'filter', 'excludedValues': {}, 'minValue': None, 'maxValue': None}]
    filtered_df = filter_dataframe(df, filters)
    assert len(filtered_df) == 3


def test_filter_dataframe_numerical_facet_w_extrema():
    df = generate_sample_df()
    filters = [{'column': 'id', 'type': 'NUMERICAL', 'label': 'id', 'cacheable': True, '__justDragDropped': True, 'columnType': 'NUMERICAL', 'filterType': 'NUMERICAL_FACET', 'isA': 'filter', 'excludedValues': {}, 'minValue': 3000, 'maxValue': None}]
    filtered_df = filter_dataframe(df, filters)
    assert len(filtered_df) == 1


# def test_filter_dataframe_alphanum_facet_w_extrema():
#     df = generate_sample_df()
#     filters = [{'column': 'id', 'type': 'NUMERICAL', 'label': 'id', 'cacheable': True, '__justDragDropped': True, 'columnType': 'NUMERICAL', 'filterType': 'ALPHANUM_FACET', 'isA': 'filter', 'excludedValues': {}, 'minValue': 2900, 'maxValue': 3000}]
#     filtered_df = filter_dataframe(df, filters)
#     assert len(filtered_df) == 0


def test_filter_dataframe_alphanum_excluded_values():
    df = generate_sample_df()
    filters = [{'column': 'host_name', 'type': 'ALPHANUM', 'label': 'host_name', 'cacheable': True, '__justDragDropped': True, 'columnType': 'ALPHANUM', 'filterType': 'ALPHANUM_FACET', 'isA': 'filter', 'excludedValues': {'Elisabeth': True}}]
    filtered_df = filter_dataframe(df, filters)
    assert len(filtered_df) == 2


