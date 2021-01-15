package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;

abstract class AreaGenerator {
    /*
    An abstract class expected by the TradeAreaProcessor to generate the polygons
     */

    public abstract String generateArea(GeoPoint.Coords coords);

}

class RectangleAreaGenerator extends AreaGenerator {
    /*
    A rectangular area generator that generate a rectangular area centered on a geopoint.
    The parameters width, height, radius are expected to be in kilometers.
    If using miles in the processor, those distances must be converted distances before.
     */

    double width;
    double height;
    double radius;

    public RectangleAreaGenerator(double width, double height){
        this.width = width;
        this.height = height;
        // Compute the radius based on half the width and height
        this.radius = Math.sqrt(Math.pow(width/2, 2)+Math.pow(height/2, 2));
    }

    public String generateArea(GeoPoint.Coords center) {
        /*
        Generate a rectangular trade area centered on an input geopoint `center`.

        Input:
            MyGeoPoint center : The center of the trade area as a GeoPoint instance
        Output:
            The rectangular trade area expressed as a Well Known Text POLYGON (Java String)
            example: `POLYGON((long1 lat1,long2 lat2, ...))`
         */
        if (this.radius==0 || this.width==0 || this.height==0){
            return null;
        }
        GeoPoint.Coords initCoords = null;
        // Declaration of the final result
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Computation of the diagonal angle of the rectangle (Must be in degree and Math.atan is radian)
        double diagonalAngle = Math.atan(this.height/this.width)*180/Math.PI;
        double[] angles = {90-diagonalAngle, 90+diagonalAngle, 270-diagonalAngle, 270+diagonalAngle};
        // Compute the latitude longitude of the four corners and fill the polygon String
        for (int i = 0; i < angles.length; i++){
            double angle;
            angle = angles[i];
            GeoPoint.Coords tmpCoords;
            tmpCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, angle, this.radius);
            str.append(tmpCoords.longitude + " " + tmpCoords.latitude + ",");
            if (i==0){
                initCoords = tmpCoords;
            }
        }
        // Close the polygon by adding initial geopoint
        str.append(initCoords.longitude + " " + initCoords.latitude);
        str.append("))");
        return str.toString();
    }
}

class CircleAreaGenerator extends AreaGenerator {
    /*
    A rectangular area generator that generate a circular area centered on a geopoint.
    The parameter `radius` is expected to be in kilometers.
    If using miles in the processor, those distances must be converted distances before.
     */

    double radius;

    public CircleAreaGenerator(double radius){
        this.radius = radius;
    }

    public String generateArea(GeoPoint.Coords center) {
        /*
        Generate an almost circular area approximated with 12 points

        Input:
            MyGeoPoint center : The center of the trade area as a GeoPoint instance
        Output:
            The circular trade area expressed as a Well Known Text POLYGON (Java String)
            example: `POLYGON((long1 lat1,long2 lat2, ...))`
         */
        if (this.radius==0){
            return null;
        }
        GeoPoint.Coords initCoords = null;
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Compute the points on circle, angle step is set to 30 degrees as there are 12 points
        for (int i = 0; i < 12; i++){
            GeoPoint.Coords tmpCoords;
            tmpCoords = GeoUtils.computeDestinationPoint(center.latitude, center.longitude, 30*i, this.radius);
            str.append(tmpCoords.longitude + " " + tmpCoords.latitude + ",");
            if (i==0){
                initCoords = tmpCoords;
            }
        }
        // Close the polygon using the initial point
        str.append(initCoords.longitude + " " + initCoords.latitude);
        str.append("))");
        return str.toString();
    }
}
