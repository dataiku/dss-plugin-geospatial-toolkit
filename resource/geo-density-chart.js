

function GeoDensityChart(){

    let _initialised = false;
    let _mapId = 'mapid';
    let _mapPointer;
    let _svgPointer;
    let _quadtree;
    let _closestMarker;
    let _heatMapLayer;
    let _position;
    let _tooltip;

    let _intensity;
    let _radius;
    let _gradient;


    Object.defineProperty(this, 'initialised', {
        get: function(){ return _initialised;},
        set: function(val){ _initialised = val;}
    });

        Object.defineProperty(this, 'tooltip', {
        get: function(){ return _tooltip;},
        set: function(val){ _tooltip = val;}
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
                let latlng = L.DomUtil.create('div', 'mouseposition');
                this._latlng = latlng;
                return latlng;
            },

            updateHTML: function(lat, lng) {
                let latlng = lat + " " + lng;
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
            let closestMarker = this.getNeighbors(lat, long, 2);
            if (!closestMarker) {
                console.warn('Quadtree not able to find closest point');
            }
            _closestMarker = [];
            closestMarker.forEach(function (item, index) {
                _closestMarker.push({lat: item[0], long: item[1], tooltip: Math.random()});
            });
            console.log("_closestMarker:", _closestMarker);
            this.displayLocal(_tooltip);
            console.log("localMarkers=", closestMarker);
        });
    }

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
    }

    this.getNeighbors = function(lat, long, mode=0){
        if (mode === 1){
            return _quadtree.find(lat, long, 10)
        } else if (mode === 2){
            console.log("Searching for the points with getNeighbors ...");
            let searchRadius = 0.001;
            return this.search(_quadtree, lat-searchRadius, long-searchRadius,
                lat+searchRadius, long+searchRadius)
        }
    }

    this.displayLocal = function(){
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
        d3.selectAll("circle").remove();
        // Define the d3 dynamics around the geospatial data points (rendering and events)
        _svgPointer.selectAll("myCircles")
            .attr("pointer-events", "visible")
            .data(_closestMarker)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                // TODO: The following line should be moved to other location with access to `d`
                _tooltip.html("<div>Lon: <strong>" + d.long + "</strong><br>Lat: <strong>"+d.lat+"</strong><hr>Hello</div>")
                return _mapPointer.latLngToLayerPoint([d.lat, d.long]).x
            })
            .attr("cy", function(d) {
                return _mapPointer.latLngToLayerPoint([d.lat, d.long]).y
            })
            .attr("id", "circleBasicTooltip")
            .on('mouseover', function() { // handle the event user mouse is over the circle data point
                _tooltip.style("visibility", "visible")
                    .style("left", (d3.event.pageX + 50) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                d3.select(this).transition()
                    .duration('50')
                    .attr("fill", "red")
                    .attr('r', 10)
            })
            .on('mouseout', function() { // handle
                _tooltip.style("visibility", "hidden")
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
        let wgeopoints = [];
        for (let i = 0; i < geopoints.length; i++) {
            wgeopoints.push([geopoints[i][0], geopoints[i][1], _intensity]);
        }
        _heatMapLayer = L.heatLayer(wgeopoints, {radius: _radius, gradient: _gradient});
        // Add layer to global object main map (leaflet target map)
        _heatMapLayer.addTo(_mapPointer);
        _initialised = true;
    }
}