/*
    Geospatial Density Plot:
    Front-end application logic, using predefined structure for the DSS custom chart.
 */

// Variables specific to the custom web app in DSS
// TODO: Keep as is
let webAppDesc = dataiku.getWebAppDesc()['chart']
var webAppConfig = {};
var filters = {};
var plugin_config = {};

// Mechanism to filter the number of calls during auto-refresh
var globalCallbackNum = 0;
var waitingTime = 0.2;

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// Instantiate the map
var mainmap = L.map('mapid')

console.log('Instantiate leaflet map ...')

// TODO: Persisting usage token ? (Should it be parametrised ?)
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(mainmap);

// Initialization of storage variables
var heat;
var gradient = {
    0.0: 'white',
    0.5: 'pink',
    1.0: 'black' };
var radius;
var geopoints;
var initial = true;
var needBackendCompute = true;
var eventData;
var intensity;
var lat;
var long;


// Init range and sliders
var rangeIntensity = document.getElementById("rangeIntensity");
// Update the current slider value (each time you drag the slider handle)
rangeIntensity.oninput = function() {
    intensity = this.value / 100;
    updateMapVisualisation(heat, lat, long, gradient, radius, intensity, initial);
    initial = false;
}

var rangeRadius = document.getElementById("rangeRadius");
// Update the current slider value (each time you drag the slider handle)
rangeRadius.oninput = function() {
    radius = this.value/10;
    updateMapVisualisation(heat, lat, long, gradient, radius, intensity, initial);
    initial = false;
}

function updateMapVisualisation(targetLayer, lat, long, gradient, radius, intensity, initial){
    // Feed visualisation with leaflet parameters
    console.log("updateMapVisualisation");
    console.log("Updating only the visualisation on the map");
    if (!initial){
        targetLayer.remove();
    }
    var geopoints = long.map(function(e, i) {
        return [e, lat[i], intensity];
    });
    targetLayer = L.heatLayer(geopoints, {radius: radius, gradient: gradient});
    // Add layer to global object mainmap (leaflet target map)
    targetLayer.addTo(mainmap);
    if (initial){
        console.log("geopoints=", geopoints);
        var sampleGeoPoint = geopoints[0];
        mainmap.setView([sampleGeoPoint[0], sampleGeoPoint[1]], 13);
    }
    heat = targetLayer;
}

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
            geopoint_column_name: webAppConfig['geopoint'],
            tooltip_column_name: webAppConfig['tooltip_column'],

            intensity: webAppConfig['intensity'],
            color_palette: webAppConfig['color_palette'],
            radius: webAppConfig['radius'],

            sample_advanced_parameters: webAppConfig['sample_advanced_parameters']
        };
        radius = plugin_config['radius'];
        gradient = plugin_config['gradient'];

        console.log("Receiving plugin config: ", plugin_config);
        document.getElementById("spinner").style.display = "block";

        // Detect user changes
        globalCallbackNum += 1;
        var thisCallbackNum = globalCallbackNum;
        // Low pass filtering on user callbacks to avoid recomputing

        sleep(waitingTime).then(() => {  // waiting before calling backend that no new callback was called during a small time interval
            if (thisCallbackNum !== globalCallbackNum) {  // another callback incremented globalThreadNum during the time interval
                console.log(`backend not called - overridden by new callback`);
            } else {
                console.log(`calling backend`);
                if (needBackendCompute || initial){
                    dataiku.webappBackend.get('get_geo_data', {
                        "config": JSON.stringify(plugin_config),
                        "filters": JSON.stringify(filters)
                    })
                        .then(function(data){
                            console.log("Got response from backend ...");
                            console.log("debug:: ", data);
                            lat = data['lat'];
                            long = data['long'];
                            updateMapVisualisation(heat, lat, long, gradient, radius, intensity, initial)
                            initial = false;
                        }).catch(error => {
                        console.error(error);
                        document.getElementById("spinner").style.display = "none";
                        dataiku.webappMessages.displayFatalError(error);
                    });
                } else if (!initial) {
                    updateMapVisualisation(heat, lat, long, gradient, radius, intensity, initial)
                    initial = false;
                }
                document.getElementById("spinner").style.display = "none";
            }
        });
    }
});