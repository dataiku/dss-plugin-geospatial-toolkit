(function() {
    'use strict';

    var injector = angular.element("body").injector();
    var ShakerProcessorsInfo = injector.get("ShakerProcessorsInfo");

    var conversionModes = {
        "BINARY_TO_DECIMAL": "binary to decimal",
        "HEXA_TO_DECIMAL": "hexa to decimal",
        "DECIMAL_TO_BINARY": "decimal to binary",
        "DECIMAL_TO_HEXA": "decimal to hexa",
        "HEXA_TO_BINARY": "hexa to binary",
        "BINARY_TO_HEXA": "binary to hexa"
    }

    var getDescription = function(params) {
        if (!params["processingMode"] || params["processingMode"].length == 0) return null;
        if (params["processingMode"] in conversionModes) {
            return " from " +  conversionModes[params["processingMode"]]
        } else {
            return null;
        }
    }

    ShakerProcessorsInfo.map["TradeAreaProcessor"] = {
        "description": function(type, params) {
            if (!params["inputColumn"] || params["inputColumn"].length == 0) return null;
            return "Convert data in column <strong>{0}</strong>".format(sanitize(params["inputColumn"])) + getDescription(params);
        },
        "icon": "icon-superscript"
    }

})();