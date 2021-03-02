/**

 GeoDensityChart:

 Provide a logical layer between Leaflet and the Dataiku custom chart environment.

 USAGE:

     Initialise the map:
         chartHandler = new GeoDensityChart();
         chartHandler.initialiseMap();
         chartHandler.addLeafletLayer();
         chartHandler.addMousePosition();
         chartHandler.addScatterPlotLayer();
         chartHandler.addSearchTrigger();
         chartHandler.addUpdateEvent();

     Update parameters:
         chartHandler.colorPalette = colorPalette;
         chartHandler.intensity = configEvent.intensity;
         chartHandler.radius = configEvent.radius;
         chartHandler.gradient = convertPaletteToGradient(colorPalette);

     Update visualisation:
        chartHandler.render()

 */

function GeoDensityChart(){

    let _initialised = false;
    let _mapId = 'mapid';
    let _mapPointer;
    let _svgPointer;
    let _quadtree;
    let _closestMarker;
    let _heatMapLayer;
    let _position;
    let _coreData = [];

    let _intensity;
    let _radius;
    let _gradient;
    let _colorPalette;

    Object.defineProperty(this, 'emptyDisplay', {
        get: function(){ return (!_coreData || _coreData.length === 0);}
    });

    Object.defineProperty(this, 'initialised', {
        get: function(){ return _initialised;},
        set: function(val){ _initialised = val;}
    });

    Object.defineProperty(this, 'coreData', {
        get: function(){ return _coreData;},
        set: function(val){ _coreData = val;}
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

    Object.defineProperty(this, 'colorPalette', {
        get: function(){ return _colorPalette;},
        set: function(val){ _colorPalette = val;}
    });

    Object.defineProperty(this, 'mapPointer', {
        get: function(){ return _mapPointer;}
    });

    /**
     * Part of the initialisation of the chart
     */
    this.initialiseMap = function(){
        const defaultCoords = [42, -17];
        _mapPointer = L.map(_mapId).setView(defaultCoords, 1);
    };

    /**
     * Part of the initialisation of the chart
     */
    this.centerMap = function(){
        if (!_coreData || _coreData.length < 1){
            return
        }
        _mapPointer.setView([_coreData[0][0], _coreData[0][1]], 10);
    };

    /**
     * Part of the initialisation of the chart
     */
    this.addLeafletLayer = function(){
        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            id: 'light_all',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(_mapPointer).set;
    };

    /**
     * Update the Leaflet style of the map based on the UI input parameter.
     * For now, only support two kind of types.
     * @param mapTile
     */
    this.setLeafletMaptile = function(mapTile){
        // Iterate in the layers of the map
        _mapPointer.eachLayer(function(layer){
            if (layer.options.id){
                console.log("[MapTile] Received previous maptile id:", layer.options.id);
                let url;
                let newBaseMap;
                console.log("[MapTile] Received asked maptile id", mapTile);
                switch (mapTile) {
                    case 'cartodb-positron':
                        url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png';
                        newBaseMap = "light_all";
                        break;
                    case 'cartodb-dark':
                        url = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png';
                        newBaseMap = "dark_all";
                        break;
                }
                let previousBaseMap = layer.options.id;
                if (previousBaseMap !== newBaseMap){
                    console.log("[MapTile] Building new map tilelayer with id", newBaseMap);
                    _mapPointer.removeLayer(layer);
                    L.tileLayer(url, {
                        maxZoom: 18,
                        attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                        id: newBaseMap,
                        tileSize: 512,
                        zoomOffset: -1
                    }).addTo(_mapPointer).set;
                }
            }
        });
    };

    /**
     * Add link to the mouse position event to keep track of the mouse
     */
    this.addMousePosition = function(){
        let Position = L.Control.extend({
            _container: null,
            options: {
                position: 'bottomleft'
            },

            onAdd: function (map) {
                let latlng = L.DomUtil.create('div', 'mouseposition');
                this._latlng = latlng;
                return latlng;
            },

            updateHTML: function(lat, lng) {
                let latlng = lat + " " + lng;
                // this._latlng.innerHTML = "LatLng: " + latlng;
            }
        });
        _position = new Position();
        _mapPointer.addControl(_position);
    };

    /**
     * Part of the initialisation of the chart:
     * Add the scatter plot overlay over the map to display closest point.
     * The overlay is a svg keeping track of the mouse position
     */
    this.addScatterPlotLayer = function(){
        L.svg({clickable:true}).addTo(_mapPointer);
        const overlay = d3.select(_mapPointer.getPanes().overlayPane);
        _svgPointer = overlay.select('svg').attr("pointer-events", "auto");
    };

    /**
     * Part of the initialisation of the chart:
     * Analyse the mouse event to compute the neighborhood of the cursor.
     * The neighborhood can either be the closest point or a set of points at
     * fixed distance from the cursor.
     */
    this.addSearchTrigger = function(){
        _mapPointer.addEventListener('mousemove', (event) => {
            let lat = Math.round(event.latlng.lat * 100000) / 100000;
            let long = Math.round(event.latlng.lng * 100000) / 100000;
            _position.updateHTML(lat, long);
            console.log('Reading lat long for quadtree search:', lat, long);
            // Compute the neighborhood based on the pre-built quadtree
            let closestMarker = this.getNeighbors(lat, long, 1);
            if (!closestMarker) {
                console.warn('Quadtree not able to find closest point');
            }
            _closestMarker = [];
            console.log("Closest marker:", closestMarker);
            closestMarker.forEach(function (item, index) {
                _closestMarker.push({lat: item[0], long: item[1], tooltip: item[3]});
            });
            console.log("_closestMarker:", _closestMarker);
            this.displayLocal();
            console.log("localMarkers=", closestMarker);
        });
    };

    /**
     * Custom function to search for a set of point in a rectangle around a center coordinate.
     * @param quadtree
     * @param xmin
     * @param ymin
     * @param xmax
     * @param ymax
     * @returns {[]}
     */
    this.search = function(quadtree, xmin, ymin, xmax, ymax) {
        const results = [];
        quadtree.visit(function(node, x1, y1, x2, y2) {
            if (!node.length) {
                do {
                    let d = node.data;
                    if (d[0] >= xmin && d[0] < xmax && d[1] >= ymin && d[1] < ymax) {
                        results.push(d);
                    }
                } while (node === node.next);
            }
            return x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin;
        });
        console.log("Results:", results);
        return results;
    };

    /**
     * Compute the closest point(s) with respect to the type of neighborhood expected
     * @param lat: Center point latitude
     * @param long: Center point longitude
     * @param mode:
     *      1 - Closest point from cursor (None if no point at all)
     *      2 - The set of points in the rectangular search window with fixed search radius (None if no points in search window)
     * @returns {*[]|(*|number|bigint)[]}
     */
    this.getNeighbors = function(lat, long, mode=1){
        // If no quadtree defined or quadtree is empty return no neighbors
        if (!_quadtree || _quadtree.size() === 0){
            return [];
        }
        if (mode === 1){
            console.log('Quadtree results', _quadtree.find(lat, long, 10));
            return [_quadtree.find(lat, long, 10)]
        } else if (mode === 2){
            console.log("Searching for the points with getNeighbors ...");
            let searchRadius = 0.001;
            return this.search(_quadtree, lat-searchRadius, long-searchRadius,
                lat+searchRadius, long+searchRadius)
        }
    };

    /**
     * Display the neighborhood on svg overlay
     */
    this.displayLocal = function(){

        console.log("Call to displayLocal ...");
        d3.selectAll("circle").remove();
        // Define the d3 dynamics around the geospatial data points (rendering and events)
        var popup = L.popup()
            .setLatLng(L.latLng(_closestMarker[0].lat, _closestMarker[0].long))
            .setContent(formatTooltip(_closestMarker[0]));
        popup.openOn(_mapPointer);

        _svgPointer.selectAll("myCircles")
            .attr("pointer-events", "visible")
            .data(_closestMarker)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return _mapPointer.latLngToLayerPoint([d.lat, d.long]).x
            })
            .attr("cy", function(d) {
                return _mapPointer.latLngToLayerPoint([d.lat, d.long]).y
            })
            .attr("id", "circleBasicTooltip")
            .on('mouseover', function() { // handle the event user mouse is over the circle data point
                popup.openOn(_mapPointer);
                d3.select(this).transition()
                    .duration('50')
                    .attr("fill", "red")
                    .attr('r', 10);
            })
            .on('mouseout', function() { // handle
                d3.select(this).transition()
                    .duration('150')
                    .attr("r", 5)
            })
            // potentially useless
            .attr("r", 5)
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
            .attr("fill", "transparent")
    };

    this.addUpdateEvent = function(){
        _mapPointer.on('moveend', function(){
            d3.selectAll("circle")
                .attr("cx", function(d){ return _mapPointer.latLngToLayerPoint([d.lat, d.long]).x })
                .attr("cy", function(d){ return _mapPointer.latLngToLayerPoint([d.lat, d.long]).y })
        })
    };

    /**
     * Render the heatmap. Take into account pre-stored geospatial data and visual layout parameters.
     */
    this.render = function(){
        _quadtree = d3.quadtree()
            .addAll(_coreData);
        if (_initialised){
            console.log("updateMapVisualisation: Remove existing layer");
            _heatMapLayer.remove();
        }
        let weightedGeopoints = [];
        for (let i = 0; i < _coreData.length; i++) {
            weightedGeopoints.push([_coreData[i][0], _coreData[i][1], _coreData[i][2]*_intensity]);
        }
        _heatMapLayer = L.heatLayer(weightedGeopoints, {radius: _radius, gradient: _gradient});
        // Add layer to global object main map (leaflet target map)
        _heatMapLayer.addTo(_mapPointer);
        _initialised = true;
    };

    /**
     * Clear heatmap layer.
     */
    this.clear = function(){
        _coreData = [];
        _quadtree = null;
        // Clear a leaflet layer if it has been initialised
        if (_initialised){
            _heatMapLayer.remove();
        }
    }
}


/**
 * Format the tooltip to be displayed in HTML
 * tooltip = {"reviews_per_month": 0.92, "room_type": "Private Room"};
 * @param tooltip
 * @returns {string}
 */
function formatTooltip(closestMarker){
    let tooltipHTML = `<div>Lon: <strong>${closestMarker.long}</strong><br>Lat: <strong>${closestMarker.lat}</strong>`
    if (!closestMarker?.tooltip || !Object.keys(closestMarker.tooltip).length) {
        return tooltipHTML
    }
    tooltipHTML += "<hr>";
    for (const [key, value]  of Object.entries(closestMarker.tooltip)) {
        tooltipHTML += `${key}: <b>${value}</b><br>`
    }
    return tooltipHTML
}
