(function() {
    'use strict';

    var injector = angular.element("body").injector();
    var ShakerProcessorsInfo = injector.get("ShakerProcessorsInfo");

    var unitModes = {
        "KILOMETERS": "kilometers",
        "MILES": "miles"
    }

    var shapeModes = {
        "RECTANGLE": "rectangular",
        "CIRCLE": "circular"
    }

    var getShapeDescription = function(params){
        if (!params["shapeMode"] || params["shapeMode"].length === 0) return null;
        if (params["shapeMode"] in shapeModes) {
            return " " +  shapeModes[params["shapeMode"]]
        } else {
            return null;
        }
    }

    var getDimensionDescription = function(params){
        if (!params["shapeMode"] || params["shapeMode"].length === 0) return null;
        if (!(params["shapeMode"] in shapeModes)) {
            return null
        } else {
            switch (params["shapeMode"]) {
                case "RECTANGLE":
                    return " with width=" + sanitize(params["width"]) + ", height=" + sanitize(params["height"]);
                case "CIRCLE":
                    return "with radius=" + sanitize(params["radius"]);
                default:
                    return null
            }
        }
    }

    var getUnitDescription = function(params){
        if (!params["unitMode"] || params["unitMode"].length === 0) return null;
        if (!(params["unitMode"] in unitModes)) {
            return null
        } else {
            switch (params["unitMode"]) {
                case "KILOMETERS":
                    return " kilometers";
                case "MILES":
                    return " miles";
                default:
                    return null
            }
        }
    }


    ShakerProcessorsInfo.map["TradeAreaProcessor"] = {
        "description": function(type, params) {
            if (!params["inputColumn"] || params["inputColumn"].length === 0) return "Choose an input geopoint column.";
            return " <strong>{0}</strong> ".format(sanitize("Generate a " + getShapeDescription(params) + " trade area")) + " centered on "
                 + sanitize(params["inputColumn"]) + " " + getDimensionDescription(params) + getUnitDescription(params);
        },
        "icon": "icon-globe"
    }

})();