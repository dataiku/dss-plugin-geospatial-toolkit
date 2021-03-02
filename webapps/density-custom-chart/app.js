/**
 *
 *
 */

const errorMessage = "No geodata column, please select a valid geodata column.";

function showErrorMessage(type, error){
    if (type === "fatal"){
        $('#error-message').attr("class", "fatal-error-message-style");
    } else {
        $('#error-message').attr("class", "error-message-style");
    }
    dataiku.webappMessages.displayFatalError(error);
}

function hideErrorMessage(){
    $("#error-message").text = "";
    $("#error-warning-view").hide();
}

function hideSpinner(){
    $("#spinner").hide();
}

function setConfigEvent(webAppConfig, configEvent, eventData, filters) {
    if (!('chart' in webAppConfig)) {
        configEvent.maptile = 'cartodb-positron';
    } else {
        configEvent.maptile = webAppConfig['chart']['def']['mapOptions']['tilesLayer'];
    }

    configEvent.intensity = webAppConfig['intensity'];
    configEvent.radius = webAppConfig['radius'];
    configEvent.colorPalette = eventData['colorOptions']['colorPalette'];

    configEvent.datasetName = webAppConfig['dataset'];
    configEvent.detailsColumnName = webAppConfig['details_column_name'];
    configEvent.tooltipColumnName = eventData['uaTooltip'];
    configEvent.filters = filters;
    configEvent.geopointColumnName = webAppConfig['geopoint_column_name'];
}

/**
 * Main request to backend when data needs to be updated. (Non-blocking and potentially long)
 * @param configEvent : The config object used to deduce actions from user parameters
 * @param chartHandler : The chart handler object used to interact with map and layers in front end
 */
function updateCoreData(configEvent, chartHandler) {
    // Launch spinner
    $("#spinner").show();
    console.log("Starting query of server to fetch core data ....");
    dataiku.webappBackend.get('get_geo_data', {
        "config": JSON.stringify(configEvent.getConfigAsJson())
    })
        .then(function(data){
            console.log("Finished query of server to fetch core data");
            chartHandler.clear();
            console.log("Received data:", data);
            if (data.length !== 0){
                let tempGeopoints = data.map(d => [d.lat, d.long, d.detail, d.tooltip]);
                chartHandler.coreData = tempGeopoints;
                chartHandler.render();
                if (configEvent.needMapCentering) {
                    console.log("Trying to center map.");
                    chartHandler.centerMap();
                    configEvent.needMapCentering = false;
                }
                chartHandler.initialised = true;
                hideErrorMessage();
                hideSpinner();
            } else {
                console.log("Received no data");
                showErrorMessage("fatal", errorMessage);
                hideSpinner();
            }
        }).catch(error => {
            console.error("Caught error:", error);
            showErrorMessage("fatal", error);
            hideSpinner();
        });
}

// Initialise the map object
chartHandler = new GeoDensityChart();
chartHandler.initialiseMap();
chartHandler.addLeafletLayer();
chartHandler.addMousePosition();
chartHandler.addScatterPlotLayer();
chartHandler.addSearchTrigger();
chartHandler.addUpdateEvent();

// Variables specific to the custom web app in DSS
let webAppConfig = {};
let filters = {};

configEvent = new ConfigEvent();

// Main rendering loop
let eventData;
window.parent.postMessage("sendConfig", "*");



window.addEventListener('message', function(event) {

    if (event.data) {

        // Receiving event from user
        eventData = JSON.parse(event.data);
        console.log("EventData", eventData);
        webAppConfig = eventData['webAppConfig'];
        filters = eventData['filters'];

        setConfigEvent(webAppConfig, configEvent, eventData, filters);

        let colorPalette = configEvent.colorPalette;
        chartHandler.colorPalette = colorPalette;
        chartHandler.intensity = configEvent.intensity;
        chartHandler.radius = configEvent.radius;
        chartHandler.gradient = convertPaletteToGradient(colorPalette);

        if (configEvent.needCoreDataUpdate){
            console.log("Request of a full backend recompute of the data");
            updateCoreData(configEvent, chartHandler);
            configEvent.needCoreDataUpdate = false;
        } else {
            if (chartHandler.coreData.length){
                chartHandler.render();
            }
        }

        if (!configEvent.geopointColumnName){
            console.log("Display warning");
            showErrorMessage("warning", errorMessage);
        } else {
            console.log("Hide warning");
            $("#error-warning-view").hide();
        }

        chartHandler.setLeafletMaptile(configEvent.maptile);
    }
});
