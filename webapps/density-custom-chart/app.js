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

var initDisplay = true;
var heat;

// Mechanism to filter the number of calls during auto-refresh
// TODO: Keep as is
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

console.log('Done instantiating leaflet map ...');

window.parent.postMessage("sendConfig", "*");

window.addEventListener('message', function(event) {

    if (event.data) {

        // Receiving event from user
        event_data = JSON.parse(event.data);
        console.log("Received event data from user ... ", event_data);
        // Compare new configuration to the stored configuration to avoid recomputing
        var same_filters = isEqual(filters, event_data['filters'])
        var same_webappconfig = isEqual(webAppConfig, event_data['webAppConfig'])

        if (same_webappconfig && same_filters) {
            // Ignore any event similar to window resizing
            return;
        } else {
            webAppConfig = event_data['webAppConfig']
            filters = event_data['filters']
        }

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
        console.log("Receiving plugin config: ", plugin_config);

        document.getElementById("spinner").style.display = "block"

        // Fetch view options
        var chart_height = document.body.getBoundingClientRect().height;
        var chart_width = document.body.getBoundingClientRect().width;
        var scale_ratio = Math.max(Math.min(chart_width/chart_height, 2), 0.5);

        // Detect user changes
        globalCallbackNum += 1;
        var thisCallbackNum = globalCallbackNum;
        // Low pass filtering on user callbacks to avoid recomputing
        sleep(waitingTime).then(() => {  // waiting before calling backend that no new callback was called during a small time interval
            if (thisCallbackNum !== globalCallbackNum) {  // another callback incremented globalThreadNum during the time interval
                console.log(`backend not called - overridden by new callback`);
            } else {
                console.log(`calling backend`);
                dataiku.webappBackend.get('get_geo_data',
                    {
                        "config": JSON.stringify(plugin_config),
                        "filters": JSON.stringify(filters),
                        "scale_ratio": scale_ratio})
                    .then(
                        function(data){
                            console.log("Got response from backend ...");
                            console.log("debug:: ", data);
                            var lat = data['lat'];
                            var long = data['long'];
                            var dataPoints = long.map(function(e, i) {
                                return [e, lat[i], plugin_config['intensity']/100];
                            });

                            var radius = plugin_config['radius'];

                            var gradient;
                            console.log("Plugin config ", plugin_config);
                            switch (plugin_config['color_palette']) {
                                case 1:
                                    gradient = {
                                        0.0: 'white',
                                        0.5: 'pink',
                                        1.0: 'black' };
                                    break;
                                case 2:
                                    gradient = {
                                        0.0: 'black',
                                        0.5: 'yellow',
                                        1.0: 'red' };
                                    break;
                                default:
                                    console.log("Default gradient color");
                            }

                            // dataPoints is an array of arrays: [[lat, lng, intensity]...]
                            if (!initDisplay){
                                heat.remove();
                            }

                            heat = L.heatLayer(dataPoints,
                                {
                                    radius: radius,
                                    gradient: gradient
                                });
                            heat.addTo(mainmap);

                            if  (initDisplay){
                                mainmap.setView([long[1], lat[1]], 13);
                                initDisplay = false;
                            }
                            document.getElementById("spinner").style.display = "none";
                        }
                    ).catch(error => {
                        console.warn("just catched an error")
                        document.getElementById("spinner").style.display = "none";
                        dataiku.webappMessages.displayFatalError(error);
                });
            }
        });
    }
});