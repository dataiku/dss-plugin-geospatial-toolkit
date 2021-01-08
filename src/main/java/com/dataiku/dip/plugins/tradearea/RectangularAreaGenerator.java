package com.dataiku.dip.plugins.tradearea;

public class RectangularAreaGenerator {

    public String generateRectangularArea(MyGeoPoint center, double width, double height){
        double startLat = center.latitude;
        double startLong = center.longitude;
        MyGeoPoint initGeoPoint = null;
        MyGeoPoint tmpGeoPoint;
        StringBuilder str = new StringBuilder();
        str.append("MULTIPOLYGON((");
        GeoUtils geoUtils = new GeoUtils();
        double radius = Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2));
        double alpha = Math.atan(height/width);
        double[] angles = {90-alpha, 90+alpha, 270-alpha, 270+alpha};
        double angle;
        for (int i = 0; i < angles.length; i++){
            angle = angles[i];
            tmpGeoPoint = geoUtils.computeDestinationPoint(startLat, startLong, angle, radius);
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
