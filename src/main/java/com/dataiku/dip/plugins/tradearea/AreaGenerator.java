package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.pivot.backend.common.datebinner.MonthOfYearGroupedBinner;
import com.vividsolutions.jts.geom.util.GeometryTransformer;

abstract class AreaGenerator {

    public abstract String generateArea(MyGeoPoint geopoint);

}

class RectangleAreaGenerator extends AreaGenerator {
    double width;
    double height;
    double radius;

    public RectangleAreaGenerator(double width, double height){
        this.width = width;
        this.height = height;
        this.radius = Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2));
    }

    public String generateArea(MyGeoPoint center) {
        System.out.println("Generating an Rectangular area");
        double startLat = center.latitude;
        double startLong = center.longitude;
        MyGeoPoint initGeoPoint = null;
        MyGeoPoint tmpGeoPoint;
        StringBuilder str = new StringBuilder();
        str.append("MULTIPOLYGON((");
        double alpha = Math.atan(this.height/this.width);
        double[] angles = {90-alpha, 90+alpha, 270-alpha, 270+alpha};
        double angle;
        for (int i = 0; i < angles.length; i++){
            angle = angles[i];
            tmpGeoPoint = GeoUtils.computeDestinationPoint(startLat, startLong, angle, this.radius);
            str.append(tmpGeoPoint.latitude + " " + tmpGeoPoint.longitude + ",");
            if (i==0){
                initGeoPoint = tmpGeoPoint;
            }
            str.append(initGeoPoint.latitude + " " + initGeoPoint.longitude + ",");
        }
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
        System.out.println("Generating an Circular area");
        double startLat = center.latitude;
        double startLong = center.longitude;
        MyGeoPoint initGeoPoint = null;
        MyGeoPoint tmpGeoPoint;
        StringBuilder str = new StringBuilder();
        str.append("MULTIPOLYGON((");
        for (int i = 0; i < 12; i++){
            tmpGeoPoint = GeoUtils.computeDestinationPoint(startLat, startLong, 30*i, this.radius);
            str.append(tmpGeoPoint.latitude + " " + tmpGeoPoint.longitude + ",");
            if (i==0){
                initGeoPoint = tmpGeoPoint;
            }
        }
        str.append(initGeoPoint.latitude + " " + initGeoPoint.longitude + ",");
        str.append("))");
        return str.toString();

    }
}
