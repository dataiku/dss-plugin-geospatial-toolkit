/*
Provide a logical layer between leaflet and the Dataiku custom chart environment

Usage example:
chartHandler = new GeoDensityChart();
chartHandler.initialiseMap();
chartHandler.addLeafletLayer();
chartHandler.addMousePosition();
chartHandler.addScatterPlotLayer();
chartHandler.addSearchTrigger();
chartHandler.addUpdateEvent();
// Then pass this object to the full update function
 */


function colorToGradient(color){
    var gradient;
    switch(color) {
        case "yellow":
            gradient = {
                0.0: 'blue',
                0.5: 'white',
                1.0: 'yellow'
            }
            break;
        case "blue":
            gradient = {
                0.0: 'red',
                0.5: 'white',
                1.0: 'blue'
            }
            break;
        case "red":
            gradient = {
                0.0: 'blue',
                0.5: 'white',
                1.0: 'red'
            }
            break;
        default:
            gradient = 0;
    }
    return gradient;
}

/*
    Geospatial Density Plot:
    Front-end application logic, using predefined structure for the DSS custom chart.
 */


chartHandler = new GeoDensityChart();
chartHandler.initialiseMap();
chartHandler.addLeafletLayer();
chartHandler.addMousePosition();
chartHandler.addScatterPlotLayer();

var tooltip = d3.select("#tooltip") // tooltip for the information of the point
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("This tooltip is meant to be visible on hover of datapoints")
    .style("z-index", 1000);

chartHandler.tooltip = tooltip;

chartHandler.addSearchTrigger();
chartHandler.addUpdateEvent();

// Variables specific to the custom web app in DSS
let webAppDesc = dataiku.getWebAppDesc()['chart']
var webAppConfig = {};
var filters = {};
var plugin_config = {};


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}



function fullUpdate(plugin_config, filters) {
    /*
     * Query backend to load the geospatial data, pass filters or argument if necessary
     * By default, update the global variable geopoints with the returned data from the backend
     *
     */
    document.getElementById("spinner").style.display = "block";
    var tempGeopoints = [];
    dataiku.webappBackend.get('get_geo_data', {
        "config": JSON.stringify(plugin_config),
        "filters": JSON.stringify(filters)
    })
        .then(function(data){
            lat = data['lat'];
            long = data['long'];
            tooltip_data = data['tooltip'];
            console.log("Receiving this tooltip: ", tooltip_data);
            for (var i = 0; i < lat.length; i++) {
                tempGeopoints.push([lat[i], long[i]]);
            }
            console.log("fullUpdate tempGeopoints=", tempGeopoints);
            // Update the global variable geopoints
            chartHandler.updateMapVisualisation(tempGeopoints);
            chartHandler.initialised = true;
        }).catch(error => {
        console.error(error);
        dataiku.webappMessages.displayFatalError(error);
    });
    document.getElementById("spinner").style.display = "none";
    console.log("Done fullUpdate.");
}

// Do the full chart initialisation here



// Main rendering loop
window.parent.postMessage("sendConfig", "*");
window.addEventListener('message', function(event) {

    if (event.data) {

        // Receiving event from user
        eventData = JSON.parse(event.data);
        console.log("Received event data from user ... ", eventData);
        webAppConfig = eventData['webAppConfig']
        filters = eventData['filters']
        console.log("Received WebApp Config: ", webAppConfig);

        // Fetch parameters for plugin visualisation
        var plugin_config = {
            dataset_name: webAppConfig['dataset'],
            geopoint_column_name: webAppConfig['geopoint_column_name'],
            tooltip_column_name: webAppConfig['tooltip'],
            intensity: webAppConfig['intensity'],
            color: webAppConfig['color'],
            maptile: webAppConfig['maptile'],
            radius: webAppConfig['radius']
        };

        chartHandler.intensity = plugin_config['intensity']/100;
        chartHandler.radius = plugin_config['radius'];
        chartHandler.gradient = colorToGradient(plugin_config['color']);


        console.log("Receiving plugin config: ", plugin_config);
        fullUpdate(plugin_config, filters);
        document.getElementById("spinner").style.display = "none";
    }
});
