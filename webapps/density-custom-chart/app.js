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


function GeoDensityChart(){

    var _initialised = false;
    var _foo = 9;
    var _mapId = 'mapid';
    var _mapPointer;
    var _svgPointer;
    var _quadtree;
    var _closestMarker;
    var _heatMapLayer;
    var _position;

    var _intensity;
    var _radius;
    var _gradient;

    Object.defineProperty(this, 'foo', {
        get: function(){ return _foo;},
        set: function(val){ _foo = val;}
    });

    Object.defineProperty(this, 'initialised', {
        get: function(){ return _initialised;},
        set: function(val){ _initialised = val;}
    });

    Object.defineProperty(this, 'intensity', {
        get: function(){ return _intensity;},
        set: function(val){ _intensity = val;}
    });

    Object.defineProperty(this, 'radius', {
        get: function(){ return _radius;},
        set: function(val){ _radius = val;}
    });

    Object.defineProperty(this, 'gradient', {
        get: function(){ return _gradient;},
        set: function(val){ _gradient = val;}
    });

    Object.defineProperty(this, 'mapPointer', {
        get: function(){ return _mapPointer;}
    });

    this.do = function(val){
        _foo += val;
    }

    this.initialiseMap = function(){
        _mapPointer = L.map(_mapId).setView([48.8444529, 2.3718228], 5);
    }

    this.addLeafletLayer = function(){
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v10',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(_mapPointer).set;
    }

    this.addMousePosition = function(){
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
        _position = new Position();
        _mapPointer.addControl(_position);
    }

    this.addScatterPlotLayer = function(){
        L.svg({clickable:true}).addTo(_mapPointer);
        const overlay = d3.select(_mapPointer.getPanes().overlayPane);
        _svgPointer = overlay.select('svg').attr("pointer-events", "auto");
    }

    this.addSearchTrigger = function(){
        _mapPointer.addEventListener('mousemove', (event) => {
            let lat = Math.round(event.latlng.lat * 100000) / 100000;
            let long = Math.round(event.latlng.lng * 100000) / 100000;
            _position.updateHTML(lat, long);
            console.log('Reading lat long for quadtree search:', lat, long);
            if (!_quadtree) {
                throw new Error("Quadtree is undefined")
            }
            var closestMarker = _quadtree.find(lat, long, 10);
            if (!closestMarker) {
                console.warn('Quadtree not able to find closest point');
            }
            console.log('closestMarker:', closestMarker);
            _closestMarker = {lat: closestMarker[0], long: closestMarker[1], tooltip: Math.random()};
            this.displayLocal(tooltip);
            console.log("localMarkers=", closestMarker);
        });
    }

    this.displayLocal = function(tooltip){
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
        _svgPointer.selectAll("myCircles")
            .attr("pointer-events", "visible")
            .data([_closestMarker])
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                // TODO: The following line should be moved to other location with access to `d`
                tooltip.html("<ul><b>Latitude</b>: "+d.lat+"</ul>"+"<ul><b>Longitude</b>: "+d.long+"</ul>"+"<ul><b>Tooltip</b>: "+d.tooltip+"</ul>")
                return _mapPointer.latLngToLayerPoint([d.lat, d.long]).x
            })
            .attr("cy", function(d) {
                return _mapPointer.latLngToLayerPoint([d.lat, d.long]).y
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

    this.addUpdateEvent = function(){
        _mapPointer.on('moveend', function(){
            d3.selectAll("circle")
                .attr("cx", function(d){ return _mapPointer.latLngToLayerPoint([d.lat, d.long]).x })
                .attr("cy", function(d){ return _mapPointer.latLngToLayerPoint([d.lat, d.long]).y })
        })
    }

    this.updateMapVisualisation = function(geopoints){
        /*
         * Do an update of the map visualisation
         * Global variables:
         *      geopoints
         *      quadtree
         *      initial
         */
        console.log("Call to updateMapVisualisation ...");
        if (_initialised){
            console.log("updateMapVisualisation: Remove existing layer");
            _heatMapLayer.remove();
        }
        console.log("updateMapVisualisation geopoints=", geopoints);
        _quadtree = d3.quadtree()
            // TODO: Recheck limit
            .extent([[-100, -100], [100, 100]])
            .addAll(geopoints);
        console.log("Done building quadtree.");
        // Compute the weighted geopoints array of shape ( , 3)
        var wgeopoints = [];
        for (var i = 0; i < geopoints.length; i++) {
            wgeopoints.push([geopoints[i][0], geopoints[i][1], _intensity]);
        }
        _heatMapLayer = L.heatLayer(wgeopoints, {radius: _radius, gradient: _gradient});
        // Add layer to global object main map (leaflet target map)
        _heatMapLayer.addTo(_mapPointer);
        _initialised = true;
    }
}

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

var tooltip = d3.select("#tooltip") // tooltip for the information of the point
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("This tooltip is meant to be visible on hover of datapoints")
    .style("z-index", 1000);

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
            geopoint_column_name: webAppConfig['geopoint'],
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
