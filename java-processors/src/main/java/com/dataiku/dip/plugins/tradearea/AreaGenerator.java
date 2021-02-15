package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;
import com.dataiku.dip.utils.DKULogger;

/**
 * Abstract class expected by TradeAreaProcessor to generate the polygons
 */
abstract class AreaGenerator {

    private static DKULogger logger = DKULogger.getLogger("dku");

    public abstract String generateArea(GeoPoint.Coords coords);

    public static void checkInputParams(TradeAreaProcessor.UnitMode unitMode, TradeAreaProcessor.ShapeMode shapeMode,
                                           double radius, double height, double width){

        // Check shapeMode
        switch (shapeMode) {
        case RECTANGLE:
            if (width <= 0 || height <= 0) {
                logger.info("Rectangle Area Generator: Received invalid parameters as input.");
                logger.infoV("Got width= {}", width);
                logger.infoV("Got height= {}", height);
            }
            break;
        case CIRCLE:
            if (radius <= 0) {
                logger.info("Circle Area Generator: Received invalid parameters as input.");
                logger.infoV("Got radius= {}", radius);
            }
            break;
        default:
            throw new IllegalArgumentException("Invalid processing mode: " + shapeMode);
        }

        // Check unitMode
        switch (unitMode) {
        case MILES:
            logger.info("Detected unit distance = MILES");
            break;
        case KILOMETERS:
            logger.info("Detected unit distance = KILOMETERS");
            break;
        default:
            throw new IllegalArgumentException("Invalid unit distance mode: " + unitMode);
        }
    };

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
        this.width = width;
        this.height = height;
        if (this.width <= 0 || this.height <= 0){
            logger.info("Rectangle Area Generator: Received invalid parameters as input.");
            logger.infoV("Got width= {}", width);
            logger.infoV("Got height= {}", height);
        } else {
            // Compute the radius based on half the width and height
            this.radius = Math.sqrt(Math.pow(width/2, 2)+Math.pow(height/2, 2));
            this.diagonalAngle = Math.atan(this.height/this.width);
        }
    }

    /**
     * Generate a rectangular trade area centered on an input geopoint coordonates.
     * @param center: Coordinates of the center geopoint
     * @return The rectangular trade area expressed as a WKT polygon (string)
     */
    public String generateArea(GeoPoint.Coords center) {
        if (this.width <= 0 || this.height <= 0){
            return null;
        }
        if (center == null){
            return null;
        }

        // Declaration of the final result
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Computation of the diagonal angle of the rectangle (Must be in degree and Math.atan is radian)
        double[] angles = {Math.PI/2-this.diagonalAngle, Math.PI/2+this.diagonalAngle, (3*Math.PI/2)-this.diagonalAngle, (3*Math.PI/2)+this.diagonalAngle};
        // Compute the latitude longitude of the four corners and fill the polygon String

        int i = 0;
        double angle = angles[i];
        GeoPoint.Coords initCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, angle, this.radius);
        PolygonBuilder polygonBuilder = new PolygonBuilder(initCoords);

        for (i = 1; i < angles.length; i++){
            angle = angles[i];
            GeoPoint.Coords tmpCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, angle, this.radius);
            polygonBuilder.lineTo(tmpCoords);
        }
        return polygonBuilder.close();
    }
}

/**
 * Generates a circular area centered on an input geopoint coordinates.
 * The parameter radius are expected to be in kilometers.
 * If using miles in the processor, those distances must be converted to miles before.
 */
class CircleAreaGenerator extends AreaGenerator {
    static final int NB_OF_EDGES = 12;
    static final double ANGLE_STEP = 2*Math.PI/NB_OF_EDGES;

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
        if (this.radius <= 0){
            return null;
        }
        if (center == null){
            return null;
        }

        // Compute the points on circle, angle step is set to 30 degrees as there are 12 points
        GeoPoint.Coords initCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, 0, this.radius);
        PolygonBuilder polygonBuilder = new PolygonBuilder(initCoords);

        for (int i = 1; i < NB_OF_EDGES; i++){
            GeoPoint.Coords tmpCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, ANGLE_STEP*i, this.radius);
            polygonBuilder.lineTo(tmpCoords);
        }

        return polygonBuilder.close();
    }

    private static DKULogger logger = DKULogger.getLogger("dku");

}
