"""
Filtering module used for applying filters on data in the backend.

Handle a variety of different filtering techniques based on the type of the filter. The main
function of the module is filter_dataframe(df, filters) that filter the DataFrame based on filters
received from the front-end.

"""

import logging
import pandas as pd

from functools import reduce

DKU_NO_VALUE = '___dku_no_value___'

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def numerical_filter(df, filter_):
    """
    Compute an boolean condition setting which rows of DataFrame `df` should remain based on
    the numerical filter defined in the dict `filter_`.

    :param df: Pandas DataFrame containing core data
    :param filter_: Dictionary defining the filters
    :return: conditions: An intermediary object containing stating if the row is kept or not
    """
    conditions = []
    minimum_bound = filter_.get("minValue", None)
    maximum_bound = filter_.get("maxValue", None)
    if minimum_bound:
        conditions += [df[filter_['column']] >= minimum_bound]
    if maximum_bound:
        conditions += [df[filter_['column']] <= maximum_bound]
    return conditions


def alphanum_filter(df, filter_):
    """
    Compute an boolean condition setting which rows of DataFrame `df` should remain based on
    the alphanum filter defined in the dict `filter_`.

    :param df: Pandas DataFrame containing core data
    :param filter_: Dictionary defining the filters
    :return: conditions: An intermediary object containing stating if the row is kept or not
    """
    conditions = []
    excluded_values = []
    for k, v in filter_['excludedValues'].items():
        if k != DKU_NO_VALUE:
            if v:
                excluded_values += [k]
        else:
            if v:
                conditions += [~df[filter_['column']].isnull()]
    if excluded_values:
        if filter_['columnType'] == 'NUMERICAL':
            excluded_values = [float(x) for x in excluded_values]
        conditions += [~df[filter_['column']].isin(excluded_values)]
    return conditions


def date_filter(df, filter_):
    """
    Compute an boolean condition setting which rows of DataFrame `df` should remain based on
    the date filter defined in the dict `filter_`.

    :param df: Pandas DataFrame containing core data
    :param filter_: Dictionary defining the filters
    :return: conditions: An intermediary object containing stating if the row is kept or not
    """
    if filter_["dateFilterType"] == "RANGE":
        return date_range_filter(df, filter_)
    else:
        return special_date_filter(df, filter_)


def date_range_filter(df, filter_):
    """
    Build the intermediate conditions object that represents the filters applied on the DataFrame.

    :param df:
    :param filter_:
    :return:
    """
    conditions = []
    if filter_["minValue"]:
        conditions += [df[filter_['column']] >= pd.Timestamp(filter_['minValue'], unit='ms')]
    if filter_["maxValue"]:
        conditions += [df[filter_['column']] <= pd.Timestamp(filter_['maxValue'], unit='ms')]
    return conditions


def special_date_filter(df, filter_):
    """
    Handle a specific set of filters for dates expressed using specific fields.

    :param df:
    :param filter_:
    :return:
    """
    conditions = []
    excluded_values = []
    for k, v in filter_['excludedValues'].items():
        if v:
            excluded_values += [k]
    if excluded_values:
        if filter_["dateFilterType"] == "YEAR":
            conditions += [~df[filter_['column']].dt.year.isin(excluded_values)]
        elif filter_["dateFilterType"] == "QUARTER_OF_YEAR":
            conditions += [~df[filter_['column']].dt.quarter.isin([int(k)+1 for k in excluded_values])]
        elif filter_["dateFilterType"] == "MONTH_OF_YEAR":
            conditions += [~df[filter_['column']].dt.month.isin([int(k)+1 for k in excluded_values])]
        elif filter_["dateFilterType"] == "WEEK_OF_YEAR":
            conditions += [~df[filter_['column']].dt.week.isin([int(k)+1 for k in excluded_values])]
        elif filter_["dateFilterType"] == "DAY_OF_MONTH":
            conditions += [~df[filter_['column']].dt.day.isin([int(k)+1 for k in excluded_values])]
        elif filter_["dateFilterType"] == "DAY_OF_WEEK":
            conditions += [~df[filter_['column']].dt.dayofweek.isin(excluded_values)]
        elif filter_["dateFilterType"] == "HOUR_OF_DAY":
            conditions += [~df[filter_['column']].dt.hour.isin(excluded_values)]
        else:
            raise Exception("Unknown date filter.")

    return conditions


def apply_filter_conditions(df, conditions):
    """
    Filter a DataFrame based on the conditions generated computed from the filters.

    :param df:
    :param conditions: Conditions computed from filters
    :return: Filtered DataFrame
    """
    if len(conditions) == 0:
        return df
    elif len(conditions) == 1:
        return df[conditions[0]]
    else:
        return df[reduce(lambda c1, c2: c1 & c2, conditions[1:], conditions[0])]


def filter_dataframe(df, filters):
    """
    Filter a DataFrame based on the raw input filters.

    :param df:
    :param filters:
    :return: Filtered DataFrame
    """
    for filter_ in filters:
        try:
            if filter_["filterType"] == "NUMERICAL_FACET":
                df = apply_filter_conditions(df, numerical_filter(df, filter_))
            elif filter_["filterType"] == "ALPHANUM_FACET":
                df = apply_filter_conditions(df, alphanum_filter(df, filter_))
            elif filter_["filterType"] == "DATE_FACET":
                df = apply_filter_conditions(df, date_filter(df, filter_))
        except Exception as e:
            raise Exception("Error with filter on column {} - {}".format(filter_["column"], e))
    if df.empty:
        logger.info("DataFrame is empty after filtering")
    return df
