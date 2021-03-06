import logging

from collections import defaultdict

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def get_unique_column_name(df, prefix=""):
    """
    This function generates a name that will be a column in the input dataframe and hence should be checked
     in order not to generate an overwrite of a column. The generated name will start with the string `prefix`.

    :param df: Input DataFrame
    :param prefix: A user selected prefix
    :return: A valid name to add as a DataFrame column avoiding potential overwrite of a column
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
