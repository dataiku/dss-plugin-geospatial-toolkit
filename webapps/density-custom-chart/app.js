/*
    Front-end application logic, using predefined structure for the DSS custom chart.
 */

// Variables specific to the custom web app in DSS
let webAppDesc = dataiku.getWebAppDesc()['chart']
var webAppConfig = {};
var filters = {};
var plugin_config = {};

// Mechanism to filter the number of calls during auto-refresh
var globalCallbackNum = 0;
var waitingTime;

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

var mymap = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(mymap);


window.parent.postMessage("sendConfig", "*");

window.addEventListener('message', function(event) {
    if (event.data) {

        // Receiving event from user
        event_data = JSON.parse(event.data);
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

        var plugin_config = {
            dataset_name: webAppConfig['dataset'],
            geopoint_column_name: webAppConfig['geopoint']
        };
        console.log("debugg: Web Ap Config ", webAppConfig);

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
                                return [e, lat[i], 0.1];
                            });
                            console.log("debug:: ", lat);
                            // dataPoints is an array of arrays: [[lat, lng, intensity]...]
                            var heat = L.heatLayer(dataPoints, {radius: 25}).addTo(mymap);
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