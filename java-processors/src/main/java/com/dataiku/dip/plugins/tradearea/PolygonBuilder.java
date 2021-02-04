package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;

/**
 * A WKT polygon builder that handle sequential add of points.
 * A polygon starts with a first geopoint specified in the constructor, the result WKT string is built.
 * To add points to the polygon, method lineTo is called as many time as there are geopoints to add.
 * Once all distinct points have been added to the polygon, use method close to close the polygon
 * (the geopoint that was an input of the constructor is added again at the end.)
 */
public class PolygonBuilder {

    final StringBuilder wktPolygon;
    final GeoPoint.Coords firstPoint;

    /**
     * Instantiate a WKT polygon in a StringBuilder
     * @param geopoint
     */
    public PolygonBuilder(GeoPoint.Coords geopoint) {
        wktPolygon = new StringBuilder("POLYGON((");
        wktPolygon.append(geopoint.longitude).append(" ").append(geopoint.latitude);
        firstPoint = geopoint;
    }

    /**
     * Add a geopoint to the WKT String.
     * This method should be called at least once.
     * @param geopoint
     */
    public void lineTo(GeoPoint.Coords geopoint){
        wktPolygon.append(",");
        wktPolygon.append(geopoint.longitude).append(" ").append(geopoint.latitude);
    }

    /**
     * Add the initial geopoint used in the constructor
     * to the WKT result String again in order to have a
     * closed polygon.
     * @return
     */
    public String close() {
        lineTo(firstPoint);
        wktPolygon.append("))");
        return wktPolygon.toString();
    }
}
