import pandas as pd

from utils.df_column_naming import get_unique_column_name


def test_get_unique_column_name_standard():
    df = pd.DataFrame({
        'name': [None],
        'age': [None],
        'id': [None]
    })
    column_name = get_unique_column_name(df, 'name')
    assert column_name == 'name_0'


def test_get_unique_column_name_complex():
    df = pd.DataFrame({
        'name': [None],
        'name_0': [None],
        'name_1': [None],
        'name_2': [None]
    })
    column_name = get_unique_column_name(df, 'name')
    assert column_name == 'name_3'
