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

// Definition of global variables across rendering loop
var initial = true; //
var quadtree; // quadtree for optimized search of neighbors
var tooltip = d3.select("#tooltip") // tooltip for the information of the point
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("This tooltip is meant to be visible on hover of datapoints")
    .style("z-index", 1000);
var singleValueTemplate = "<ul></ul>";
var heat; // Leaflet layer for the heatmap
var countUpdateMap = 0;

// Density map parameter
var gradient = 0;
var radius = 50;
var intensity = 0.5;
var geopoints;

// Leaf map definition
var mainmap = L.map('mapid').setView([48.8444529, 2.3718228], 5); // center position + zoom
console.log('Instantiate leaflet map ...')
// TODO: Persisting usage token ? (Should it be parametrised ?)
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(mainmap).set;

// Helper for mouse position on map
let Position = L.Control.extend({
    _container: null,
    options: {
        position: 'bottomleft'
    },

    onAdd: function (map) {
        var latlng = L.DomUtil.create('div', 'mouseposition');
        this._latlng = latlng;
        return latlng;
    },

    updateHTML: function(lat, lng) {
        var latlng = lat + " " + lng;
        this._latlng.innerHTML = "LatLng: " + latlng;
    }
});
position = new Position();
mainmap.addControl(position);

// Add a second clickable layer for user interaction with scatter plot over the density map
L.svg({clickable:true}).addTo(mainmap);
const overlay = d3.select(mainmap.getPanes().overlayPane)
const svg = overlay.select('svg').attr("pointer-events", "auto")

mainmap.addEventListener('mousemove', (event) => {
    let lat = Math.round(event.latlng.lat * 100000) / 100000;
    let long = Math.round(event.latlng.lng * 100000) / 100000;
    this.position.updateHTML(lat, long);
    console.log('Reading lat long for quadtree search:', lat, long);
    if (!quadtree) {
        throw new Error("Quadtree is undefined")
    }
    var closestMarker = quadtree.find(lat, long, 10);
    if (!closestMarker) {
        console.warn('Quadtree not able to find closest point');
    }
    console.log('closestMarker:', closestMarker);
    displayLocal(svg, {lat: closestMarker[0], long: closestMarker[1] });
    console.log("localMarkers=", closestMarker);
});


function displayLocal(svg, closestMarker){
    /*
     * Display only the local neighbors of the mouse. Rendering of the full scatter plot is too
     * resource intensive, therefore use this function to display a scatter plot of one point only.
     * Can be extended to several points based on quadtree methods.
     *
     * Inputs:
     *      svg: A link to the HTML element containing the D3 scatter plot layer
     *      closestMarker: The single element we need to display using the scatter plot
     *          example: [-45.873, 3.894]
     */
    console.log("Call to displayLocal ...");
    // Define the d3 dynamics around the geospatial data points (rendering and events)
    // We
    svg.selectAll("myCircles")
        .attr("pointer-events", "visible")
        .data([closestMarker])
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            // TODO: The following line should be moved to other location with access to `d`
            tooltip.html("<ul><b>Latitude</b>: "+d.lat+"</ul>"+"<ul><b>Longitude</b>: "+d.long+"</ul>")
            return mainmap.latLngToLayerPoint([d.lat, d.long]).x
        })
        .attr("cy", function(d) {
            return mainmap.latLngToLayerPoint([d.lat, d.long]).y
        })
        .attr("id", "circleBasicTooltip")
        .on('mouseover', function() { // handle the event user mouse is over the circle data point
            tooltip.style("visibility", "visible")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            d3.select(this).transition()
                .duration('50')
                .attr("fill", "red")
                .attr('r', 10)
                .attr("stroke", "black")
                .attr("stroke-width", 3)
                .attr("fill-opacity", .4)
        })
        .on('mouseout', function() { // handle
            tooltip.style("visibility", "hidden")
            d3.select(this).transition()
                .duration('150')
                .attr("r", 5)
                .attr("fill", "transparent")
                .attr("fill-opacity", 0)
                .attr("stroke", 0)
                .attr("stroke-width", 0)
        })
        // potentially useless
        .attr("r", 5)
        .attr("fill", "transparent")
        .attr("fill-opacity", 0)
        .attr("stroke", 0)
        .attr("stroke-width", 0)
}

// Function that update circle position if something change
function update() {
    // TODO: Check the d3 id selector
    d3.selectAll("circle")
        .attr("cx", function(d){ return mainmap.latLngToLayerPoint([d.lat, d.long]).x })
        .attr("cy", function(d){ return mainmap.latLngToLayerPoint([d.lat, d.long]).y })
}

// TODO: remove
// If the user change the map (zoom or drag), I update circle position:
mainmap.on("moveend", update);

// TODO: remove testing
plugin_config = {dataset_name: "new_york_city_airbnb_prepared", geopoint_column_name: "coordinates", intensity: 53, radius: 1};
filters = {misc: "true"};

// TODO: remove
// Slider for the range intensity
var rangeIntensity = document.getElementById("rangeIntensity");
rangeIntensity.oninput = function() {
    intensity = this.value / 100;
    console.log("rangeIntensity=", intensity);
    // Update only visualisation when the intensity slider is updated
    fullUpdate(plugin_config, filters);
    initial = false;
}

function updateMapVisualisation(targetLayer, gradient, radius, intensity, initial){
    /*
     * Do an update of the map visualisation
     * Global variables:
     *      geopoints
     *      quadtree
     *      initial
     */
    console.log("Call to updateMapVisualisation ...");

    if (!initial){
        console.log("updateMapVisualisation: Remove existing layer");
        targetLayer.remove();
    }
    console.log("updateMapVisualisation geopoints=", geopoints);
    quadtree = d3.quadtree()
        // TODO: Recheck limit
        .extent([[-100, -100], [100, 100]])
        .addAll(geopoints);
    console.log("Done building quadtree.");

    // Compute the weighted geopoints array of shape ( , 3)
    var wgeopoints = [];
    for (var i = 0; i < geopoints.length; i++) {
        wgeopoints.push([geopoints[i][0], geopoints[i][1], intensity]);
    }

    targetLayer = L.heatLayer(wgeopoints, {radius: radius, gradient: gradient});
    // Add layer to global object main map (leaflet target map)
    targetLayer.addTo(mainmap);
    // Update the global variable
    heat = targetLayer;
    // Set global variable initial to false
    initial = false;
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
            for (var i = 0; i < lat.length; i++) {
                tempGeopoints.push([lat[i], long[i]]);
            }
            console.log("fullUpdate tempGeopoints=", tempGeopoints);
            // Update the global variable geopoints
            geopoints = tempGeopoints;
            console.log("Calling updateMapVisualisation with argument: initial=", initial);
            updateMapVisualisation(heat, gradient, radius, intensity, initial);
            initial = false;
        }).catch(error => {
        console.error(error);
        dataiku.webappMessages.displayFatalError(error);
    });
    document.getElementById("spinner").style.display = "none";
    console.log("Done fullUpdate.");
}



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
            geopoint_column_name: webAppConfig['geopoint'],
            tooltip_column_name: webAppConfig['tooltip_column'],
            intensity: webAppConfig['intensity'],
            color_palette: webAppConfig['color_palette'],
            radius: webAppConfig['radius'],
            sample_advanced_parameters: webAppConfig['sample_advanced_parameters']
        };

        radius = plugin_config['radius'];

        fullUpdate(plugin_config, filters);

        console.log("Receiving plugin config: ", plugin_config);
        document.getElementById("spinner").style.display = "none";
    }
});
