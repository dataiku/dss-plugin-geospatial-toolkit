package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.pivot.backend.common.datebinner.MonthOfYearGroupedBinner;
import com.vividsolutions.jts.geom.util.GeometryTransformer;

abstract class AreaGenerator {

    public abstract String generateArea(MyGeoPoint geopoint);

}

class RectangleAreaGenerator extends AreaGenerator {
    /*
    All values width, height, radius are expected in kilometers
    If using miles, must convert distances before those operations
     */
    double width;
    double height;
    double radius;

    public RectangleAreaGenerator(double width, double height){
        this.width = width;
        this.height = height;
        this.radius = Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2));
    }

    public String generateArea(MyGeoPoint center) {
        /*
        Generate a rectangular trade area from a MyGeoPoint object

        Input:
            MyGeoPoint center : The center of the trade area as a GeoPoint instance
        Output:
            The rectangular trade area expressed as a Well Known Text POLYGON (Java String)
            example: POLYGON((long1 lat1,long2 lat2, ...))
         */
        double startLat = center.latitude;
        double startLong = center.longitude;
        // Must initialize variable
        MyGeoPoint initGeoPoint = null;
        MyGeoPoint tmpGeoPoint;
        // Declaration of the final result
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Computation of the diagonal angle of the rectangle (Must be in degree and Math.atan is radian)
        double alpha = Math.atan(this.height/this.width)*180/Math.PI;
        double[] angles = {90-alpha, 90+alpha, 270-alpha, 270+alpha};
        double angle;
        // Compute the latitude longitude of the four corners and fill the polygon String
        for (int i = 0; i < angles.length; i++){
            angle = angles[i];
            tmpGeoPoint = GeoUtils.computeDestinationPoint(startLat, startLong, angle, this.radius);
            str.append(tmpGeoPoint.longitude + " " + tmpGeoPoint.latitude + ",");
            if (i==0){
                initGeoPoint = tmpGeoPoint;
            }
        }
        // Close the polygon by adding initial geopoint
        str.append(initGeoPoint.longitude + " " + initGeoPoint.latitude);
        str.append("))");
        return str.toString();
    }
}

class CircleAreaGenerator extends AreaGenerator {
    double radius;

    public CircleAreaGenerator(double radius){
        this.radius = radius;
    }

    public String generateArea(MyGeoPoint center) {
        /*
        Generate an almost circular area approximated with 12 points
        Input:
            MyGeoPoint center : The center of the trade area as a GeoPoint instance
        Output:
            The circular trade area expressed as a Well Known Text POLYGON (Java String)
            example: POLYGON((long1 lat1,long2 lat2, ...))
         */
        double startLat = center.latitude;
        double startLong = center.longitude;
        MyGeoPoint initGeoPoint = null;
        MyGeoPoint tmpGeoPoint;
        StringBuilder str = new StringBuilder();
        str.append("POLYGON((");
        // Compute the points on circle, angle step is set to 30 degrees as there are 12 points
        for (int i = 0; i < 12; i++){
            tmpGeoPoint = GeoUtils.computeDestinationPoint(startLat, startLong, 30*i, this.radius);
            str.append(tmpGeoPoint.longitude + " " + tmpGeoPoint.latitude + ",");
            if (i==0){
                initGeoPoint = tmpGeoPoint;
            }
        }
        // Close the polygon using the initial point
        str.append(initGeoPoint.longitude + " " + initGeoPoint.latitude);
        str.append("))");
        return str.toString();
    }
}
