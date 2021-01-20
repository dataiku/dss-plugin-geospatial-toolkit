package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;
import com.dataiku.dip.utils.DKULogger;

abstract class AreaGenerator {
    /*
    An abstract class expected by the TradeAreaProcessor to generate the polygons
     */

    public abstract String generateArea(GeoPoint.Coords coords);

}

class RectangleAreaGenerator extends AreaGenerator {
    /*
    Generates a rectangular area centered on an input geopoint coordinates.
    The parameters width, height, radius are expected to be in kilometers.
    If using miles in the processor, those distances must be converted to miles before.
     */

    double width;
    double height;
    double radius;
    double diagonalAngle;

    private static DKULogger logger = DKULogger.getLogger("dku");

    public RectangleAreaGenerator(double width, double height){
        if (width < 0 || height < 0){
            logger.info("Received invalid parameters as input for RectangleAreaGenerator."+" width="+width+" height="+height);
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
     *
     * @param center
     * @return
     */
    public String generateArea(GeoPoint.Coords center) {
        /*
        Generate a rectangular trade area centered on an input geopoint coordonates.

        Input:
            GeoPoint.Coords center : Coordinates of the center geopoint
        Output:
            The rectangular trade area expressed as a WKT polygon (string)
            example: `POLYGON((long1 lat1,long2 lat2, ...))`
         */
        if (this.radius<=0 || this.width<=0 || this.height<=0){
            // TODO: Display the Rectangle or Circular to know which one it is
            logger.info("Detected invalid input parameter. Distance input parameters should be greater than zero.");
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
            double angle;
            angle = angles[i];
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

class CircleAreaGenerator extends AreaGenerator {
    /*
    Generates a circular area centered on an input geopoint coordinates.
    The parameter radius are expected to be in kilometers.
    If using miles in the processor, those distances must be converted to miles before.
     */

    double radius;

    public CircleAreaGenerator(double radius){
        this.radius = radius;
    }

    public String generateArea(GeoPoint.Coords center) {
        /*
        Generate an almost circular area approximated with 12 points

        Input:
            GeoPoint.Coords center: The center of the trade area as a geospatial instance coordinates
        Output:
            The circular trade area expressed as a WKT POLYGON (String)
            example: `POLYGON((long1 lat1,long2 lat2, ...))`
         */
        if (this.radius<=0){
            logger.info("Detected invalid radius as input. Radius parameter should be greater than zero.");
            return null;
        }
        GeoPoint.Coords initCoords = null;
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Compute the points on circle, angle step is set to 30 degrees as there are 12 points
        for (int i = 0; i < 12; i++){
            GeoPoint.Coords tmpCoords;
            tmpCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, 30*i, this.radius);
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
