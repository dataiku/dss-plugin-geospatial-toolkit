package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;

public class PolygonBuilder {

    StringBuilder wktPolygon;
    GeoPoint.Coords firstPoint;

    public PolygonBuilder(GeoPoint.Coords geopoint) {
        wktPolygon = new StringBuilder("POLYGON((");
        wktPolygon.append(geopoint.longitude).append(" ").append(geopoint.latitude);
        firstPoint = geopoint;
    }

    public void lineTo(GeoPoint.Coords geopoint){
        wktPolygon.append(",");
        wktPolygon.append(geopoint.longitude).append(" ").append(geopoint.latitude);
    }

    public String close() {
        lineTo(firstPoint);
        wktPolygon.append("))");
        return wktPolygon.toString();
    }
}
