import logging

from collections import defaultdict

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def get_new_column_name(df, prefix=""):
    """
    Generate a column name starting by prefix that is not already existing in the DataFrame.

    :param df: Input DataFrame
    :param prefix: A user selected prefix
    :return: A valid name to add as a DataFrame column
    """
    name_is_taken = defaultdict(bool)
    columns = list(df.columns)
    for column in columns:
        name_is_taken[column] = True
    if not name_is_taken[prefix]:
        return prefix
    for suffix in range(len(columns)+1):
        generated_name = prefix + "_" + str(suffix)
        if not name_is_taken[generated_name]:
            return generated_name
