import logging
import random
import string

from collections import defaultdict

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s Custom Chart Geospatial Density  | %(levelname)s - %(message)s')


def get_random_key():
    len_key = 10
    return ''.join(random.choices(string.ascii_letters + string.digits, k=len_key))


def get_new_column_name(df, prefix):
    """
    Generate a column name starting by prefix that is not already
    existing in the DataFrame.
    :param df:
    :param prefix:
    :return:
    """
    name_is_taken = defaultdict(bool)
    columns = list(df.columns)
    for column in columns:
        name_is_taken[column] = True
    if not name_is_taken[prefix]:
        return prefix
    for iteration in range(2*len(columns)):
        generated_name = prefix + "_" + get_random_key()
        if not name_is_taken[generated_name]:
            return generated_name
    raise ValueError("Impossible to generate a name starting by {} from the dataset.".format(prefix))
