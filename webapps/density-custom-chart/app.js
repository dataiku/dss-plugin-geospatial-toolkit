/**
 *
 *
 */

const errorMessage = "No geodata column, please select a valid geodata column";

// Declare tooltip div that will be used for tooltip display
let tooltip = d3.select("#tooltip") // tooltip for the information of the point
    .append("div")
    .attr("class", "tooltip");

// Initialise the map object
chartHandler = new GeoDensityChart();
chartHandler.initialiseMap();
chartHandler.addLeafletLayer();
chartHandler.addMousePosition();
chartHandler.addScatterPlotLayer();
chartHandler.tooltip = tooltip;
chartHandler.addSearchTrigger();
chartHandler.addUpdateEvent();

// Variables specific to the custom web app in DSS
let webAppConfig = {};
let filters = {};


/**
 * Main request to backend when data needs to be updated. (Non-blocking and potentially long)
 * @param configEvent : The config object used to deduce actions from user parameters
 * @param chartHandler : The chart handler object used to interact with map and layers in front end
 */
function updateCoreData(configEvent, chartHandler) {

    console.log("Starting query of server to fetch core data ....");
    dataiku.webappBackend.get('get_geo_data', {
        "config": JSON.stringify(configEvent.getConfigAsJson())
    })
        .then(function(data){
            console.log("Finished query of server to fetch core data");
            chartHandler.clear();
            console.log("Received data:", data);
            if (data.length !== 0){
                let tempGeopoints = [];
                for (let i = 0; i < data.length; i++) {
                    tempGeopoints.push([data[i]['lat'], data[i]['long'], data[i]['detail'], data[i]['tooltip']]);
                }
                chartHandler.coreData = tempGeopoints;
                chartHandler.render();
                if (configEvent.needMapCentering) {
                    console.log("Trying to center map.");
                    chartHandler.centerMap();
                    configEvent.needMapCentering = false;
                }
                chartHandler.initialised = true;
                document.getElementById("error-message").text = "";
                document.getElementById("error-warning-view").style.display = "none";
                document.getElementById("spinner").style.display = "none";
            } else {
                console.log("Received no data");
                $('#error-message').css("background-color", "red");
                dataiku.webappMessages.displayFatalError(errorMessage);
                document.getElementById("spinner").style.display = "none";
            }
        }).catch(error => {
            console.error("Caught error:", error);
            $('#error-message').css("background-color", "red");
            dataiku.webappMessages.displayFatalError(error);
            document.getElementById("spinner").style.display = "none";
    });
}

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

        if (!('chart' in webAppConfig)){
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

        let colorPalette = configEvent.colorPalette;
        chartHandler.colorPalette = colorPalette;
        chartHandler.intensity = configEvent.intensity;
        chartHandler.radius = configEvent.radius;
        chartHandler.gradient = convertPaletteToGradient(colorPalette);

        if (configEvent.needCoreDataUpdate){
            $("#spinner").show();
            console.log("Request of a full backend recompute of the data");
            updateCoreData(configEvent, chartHandler);
            configEvent.needCoreDataUpdate = false;
        } else {
            if (chartHandler.coreData.length !== 0){
                chartHandler.render();
            }
        }

        if (!configEvent.geopointColumnName){
            console.log("Display warning");
            $('#error-message').css("background-color", "#28a9dd");
            dataiku.webappMessages.displayFatalError(errorMessage);
        } else {
            console.log("Hide warning");
            $("#error-warning-view").hide();
        }

        chartHandler.setLeafletMaptile(configEvent.maptile);
    }
});
