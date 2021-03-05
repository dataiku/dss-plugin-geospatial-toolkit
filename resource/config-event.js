/**
 * Handle event configuration sent by front-end, compute logic behind columns selection and
 * data querying for the backend. Derive necessity of recomputing the whole data or not and hence
 * optimize time of computation behind chart display.
 * @constructor
 */
function ConfigEvent() {

    // UI controls parameters
    let _color;
    let _intensity;
    let _colorPalette;
    let _maptile;
    let _radius;


    // Columns parameters
    let _datasetName;
    let _geopointColumnName;
    let _detailsColumnName;
    let _filters = [];
    let _tooltipColumnName = [];

    // Variables used for state computation

    let _needCoreDataUpdate = false;
    let _needMapCentering = true;

    Object.defineProperty(this, 'needMapCentering', {
        get: function () {
            return _needMapCentering;
        },
        set: function (val) {
            _needMapCentering = val;
        }
    });

    Object.defineProperty(this, 'needCoreDataUpdate', {
        get: function () {
            return _needCoreDataUpdate;
        },
        set: function (val) {
            _needCoreDataUpdate = val;
        }
    });

    // Variables used for storage of UI parameters

    Object.defineProperty(this, 'color', {
        get: function () {
            return _color;
        },
        set: function (val) {
            _color = val;
        }
    });

    Object.defineProperty(this, 'intensity', {
        get: function () {
            return _intensity;
        },
        set: function (val) {
            _intensity = val;
        }
    });

    Object.defineProperty(this, 'colorPalette', {
        get: function () {
            return _colorPalette;
        },
        set: function (val) {
            _colorPalette = val;
        }
    });

    Object.defineProperty(this, 'maptile', {
        get: function () {
            return _maptile;
        },
        set: function (val) {
            _maptile = val;
        }
    });

    Object.defineProperty(this, 'radius', {
        get: function () {
            return _radius;
        },
        set: function (val) {
            _radius = val;
        }
    });

    // Columns that contains core aspect related to inner data upon which the chart is relying

    Object.defineProperty(this, 'datasetName', {
        get: function () {
            return _datasetName;
        },
        set: function (val) {
            if (_datasetName !== val) {
                console.log("Detected changes for parameter datasetName, old value:", _datasetName, " - new value:", val);
                _datasetName = val;
                if (!val) {
                    console.log("Detected empty datasetName");
                }
            }
        }
    });

    Object.defineProperty(this, 'detailsColumnName', {
        get: function () {
            return _detailsColumnName;
        },
        set: function (val) {
            if (!val) {
                console.log("Detected empty detailsColumnName");
            } else {
                _needCoreDataUpdate = true;
            }
        }
    });

    Object.defineProperty(this, 'geopointColumnName', {
        get: function () {
            return _geopointColumnName;
        },
        set: function (val) {

            if (_geopointColumnName !== val) {
                console.log("Detected changes for parameter geopointColumnName, old value:", _geopointColumnName, " - new value:", val);
                _geopointColumnName = val;
                if (!val) {
                    // New value of the geopointColumnName is empty
                    console.log("Detected empty geopointColumnName");
                    _needCoreDataUpdate = false;
                } else {
                    _needCoreDataUpdate = true;
                    _needMapCentering = true;
                    console.log("Detected new geopoint column input.")
                }

            }
        }
    });

    Object.defineProperty(this, 'tooltipColumnName', {
        get: function () {
            return _tooltipColumnName;
        },
        set: function (val) {
            if (!isEqual(_tooltipColumnName, val)) {
                console.log("Detected changes for parameter tooltipColumnName, old value:", _tooltipColumnName, " - new value:", val);
                _tooltipColumnName = val;
                _needCoreDataUpdate = true;
                if (!val) {
                    console.log("Detected empty tooltipColumnName");
                }
            }
        }
    });

    Object.defineProperty(this, 'filters', {
        get: function () {
            return _filters;
        },
        set: function (val) {
            if (!isEqual(_filters, val)) {
                console.log("Detected changes for parameter filters, old value:", _filters, " - new value:", val);
                _filters = val;
                _needCoreDataUpdate = true;
                if (!val) {
                    console.log("Detected empty filters");
                }
            }
        }
    });

    this.getConfigAsJson = function () {
        return {
            "datasetName": _datasetName,
            "detailsColumnName": _detailsColumnName,
            "filters": _filters,
            "geopointColumnName": _geopointColumnName,
            "tooltipColumnName": _tooltipColumnName
        }
    }
}
