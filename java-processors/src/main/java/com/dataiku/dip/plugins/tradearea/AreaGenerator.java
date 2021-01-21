package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;
import com.dataiku.dip.utils.DKULogger;

/**
 * Abstract class expected by TradeAreaProcessor to generate the polygons
 */
abstract class AreaGenerator {

    public abstract String generateArea(GeoPoint.Coords coords);

}

/**
 * Generates a rectangular area centered on an input geopoint coordinates.
 * The parameters width, height, radius are expected to be in kilometers.
 * If using miles in the processor, those distances must be converted to miles before.
 */
class RectangleAreaGenerator extends AreaGenerator {

    double width;
    double height;
    double radius;
    double diagonalAngle;

    private static DKULogger logger = DKULogger.getLogger("dku");

    public RectangleAreaGenerator(double width, double height){
        if (width <= 0 || height <= 0){
            logger.info("Rectangle Area Generator: Received invalid parameters as input."+" width="+width+" height="+height);
            // Skip variable assignation if bad input
        } else {
            this.width = width;
            this.height = height;
            // Compute the radius based on half the width and height
            this.radius = Math.sqrt(Math.pow(width/2, 2)+Math.pow(height/2, 2));
            this.diagonalAngle = Math.atan(this.height/this.width)*180/Math.PI;
        }
    }

    /**
     * Generate a rectangular trade area centered on an input geopoint coordonates.
     * @param center: Coordinates of the center geopoint
     * @return The rectangular trade area expressed as a WKT polygon (string)
     */
    public String generateArea(GeoPoint.Coords center) {
        if (this.radius<=0 || this.width<=0 || this.height<=0){
            logger.info("Rectangle Area Generator: Detected invalid input parameter. Distance input parameters should be greater than zero.");
            logger.info("radius="+this.radius);
            logger.info("width="+this.width);
            logger.info("height="+this.height);
            return null;
        }
        GeoPoint.Coords initCoords = null;
        // Declaration of the final result
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Computation of the diagonal angle of the rectangle (Must be in degree and Math.atan is radian)
        double[] angles = {90-this.diagonalAngle, 90+this.diagonalAngle, 270-this.diagonalAngle, 270+this.diagonalAngle};
        // Compute the latitude longitude of the four corners and fill the polygon String
        for (int i = 0; i < angles.length; i++){
            double angle = angles[i];
            GeoPoint.Coords tmpCoords;
            tmpCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, angle, this.radius);
            str.append(tmpCoords.longitude).append(" ").append(tmpCoords.latitude).append(",");
            if (i==0){
                initCoords = tmpCoords;
            }
        }
        // Close the polygon by adding initial geopoint
        str.append(initCoords.longitude).append(" ").append(initCoords.latitude).append("))");
        return str.toString();
    }
}

/**
 * Generates a circular area centered on an input geopoint coordinates.
 * The parameter radius are expected to be in kilometers.
 * If using miles in the processor, those distances must be converted to miles before.
 */
class CircleAreaGenerator extends AreaGenerator {
    static final int NB_OF_EDGES = 12;

    double radius;

    public CircleAreaGenerator(double radius){
        this.radius = radius;
    }

    /**
     * Generate an almost circular area approximated with 12 points
     * @param center: The center of the trade area as a geospatial instance coordinates
     * @return The circular trade area expressed as a WKT POLYGON (String `POLYGON((long1 lat1,long2 lat2, ...))`)
     */
    public String generateArea(GeoPoint.Coords center) {
        if (this.radius<=0){
            logger.info("Circular Area Generator: Detected invalid radius as input. Radius parameter should be greater than zero. Got radius=" + this.radius);
            return null;
        }
        GeoPoint.Coords initCoords = null;
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Compute the points on circle, angle step is set to 30 degrees as there are 12 points
        for (int i = 0; i < NB_OF_EDGES; i++){
            GeoPoint.Coords tmpCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, 30*i, this.radius);
            str.append(tmpCoords.longitude).append(" ").append(tmpCoords.latitude).append(",");
            if (i==0){
                initCoords = tmpCoords;
            }
        }
        // Close the polygon using the initial point
        str.append(initCoords.longitude).append(" ").append(initCoords.latitude);
        str.append("))");
        return str.toString();
    }

    private static DKULogger logger = DKULogger.getLogger("dku");

}
