import pickle

pickle_path = '/Users/thibaultdesfontaines/Library/DataScienceStudio/dss_home/plugins/dev/geospatial-toolkit/tests/input.pickle'

with open(pickle_path, 'rb') as handle:
    params = pickle.load(handle)

print(params)
