

function ConfigEvent(){
    /*
    Minimal configuration of event handling received by the front end
    Optimize recompute of the geo-density chart in order to avoid recomputing
    Will contain an inner logic with setter and getter and result should there be a backend call or not.

    There are 4 columns parameters that needs to be rendered:
    - datasetName
    - detailsColumnName
    - geopoint_column_name
    - tooltipColumnName
    */

    // Variables for geo density
    let _color;
    let _intensity;
    let _colorPalette;
    let _maptile;
    let _radius;


    // Variables
    let _datasetName;
    let _geopointColumnName;
    let _detailsColumnName;
    let _filters = [];
    let _tooltipColumnName = [];

    // At start need backend compute since there is no data available
    let _needCoreDataUpdate = false;

    Object.defineProperty(this, 'needCoreDataUpdate', {
        get: function(){
            return _needCoreDataUpdate;
        },
        set: function(val){
            _needCoreDataUpdate = val;
        }
    });

    // Variables that does not need any update from the backend

    Object.defineProperty(this, 'color', {
        get: function(){ return _color;},
        set: function(val){ _color = val;}
    });

    Object.defineProperty(this, 'intensity', {
        get: function(){ return _intensity;},
        set: function(val){ _intensity = val;}
    });

    Object.defineProperty(this, 'colorPalette', {
        get: function(){ return _colorPalette;},
        set: function(val){ _colorPalette = val;}
    });

    Object.defineProperty(this, 'maptile', {
        get: function(){ return _maptile;},
        set: function(val){ _maptile = val;}
    });

    Object.defineProperty(this, 'radius', {
        get: function(){ return _radius;},
        set: function(val){ _radius = val;}
    });

    // Columns that contains core aspect related to inner data upon which the chart is relying
    // datasetName, detailsColumnName, geopoint_column_name, tooltipColumnName

    Object.defineProperty(this, 'datasetName', {
        get: function(){
            return _datasetName;
        },
        set: function(val){
            if (_datasetName !== val){
                console.log("Detected changes for parameter datasetName, old value:", _datasetName, " - new value:", val);
                _datasetName = val;
                if (!val){
                    console.log("Detected empty datasetName");
                }
            }
        }
    });

    Object.defineProperty(this, 'detailsColumnName', {
        get: function(){
            return _detailsColumnName;
            },
        set: function(val){
            if (_detailsColumnName !== val){
                console.log("Detected changes for parameter detailsColumnName, old value:", _detailsColumnName, " - new value:", val);
                _detailsColumnName = val;
                _needCoreDataUpdate = true;
                if (!val){
                    console.log("Detected empty detailsColumnName");
                }
            }
        }
    });

    Object.defineProperty(this, 'geopointColumnName', {
        get: function(){
            return _geopointColumnName;
        },
        set: function(val){
            if (_geopointColumnName !== val){
                console.log("Detected changes for parameter geopointColumnName, old value:", _geopointColumnName, " - new value:", val);
                _geopointColumnName = val;
                _needCoreDataUpdate = true;
                if (!val){
                    console.log("Detected empty geopointColumnName");
                }
            }
        }
    });

    Object.defineProperty(this, 'tooltipColumnName', {
        get: function(){
            return _tooltipColumnName;
        },
        set: function(val){
            if (!isEqual(_tooltipColumnName, val)){
                console.log("Detected changes for parameter tooltipColumnName, old value:", _tooltipColumnName, " - new value:", val);
                _tooltipColumnName = val;
                _needCoreDataUpdate = true;
                if (!val){
                    console.log("Detected empty tooltipColumnName");
                }
            }
        }
    });

    Object.defineProperty(this, 'filters', {
        get: function(){
            return _filters;
        },
        set: function(val){
            if (!isEqual(_filters, val)){
                console.log("Detected changes for parameter filters, old value:", _filters, " - new value:", val);
                _filters = val;
                _needCoreDataUpdate = true;
                if (!val){
                    console.log("Detected empty filters");
                }
            }
        }
    });

    this.getConfigAsJson = function(){
        return {
            "color": _color, "intensity": _intensity, "colorPalette": _colorPalette,
            "maptile": _maptile, "radius": _radius, "datasetName": _datasetName,
            "detailsColumnName": _detailsColumnName, "filters": _filters, "geopointColumnName": _geopointColumnName,
            "tooltipColumnName": _tooltipColumnName, "needCoreDataUpdate": _needCoreDataUpdate}
    }
}
