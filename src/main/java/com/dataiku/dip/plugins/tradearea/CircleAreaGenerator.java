package com.dataiku.dip.plugins.tradearea;

public class CircleAreaGenerator {

    public String generateCircleArea(MyGeoPoint center, double radius){
        double startLat = center.latitude;
        double startLong = center.longitude;
        MyGeoPoint initGeoPoint = null;
        MyGeoPoint tmpGeoPoint;
        StringBuilder str = new StringBuilder();
        str.append("MULTIPOLYGON((");
        GeoUtils geoUtils = new GeoUtils();
        for (int i = 0; i < 12; i++){
            tmpGeoPoint = geoUtils.computeDestinationPoint(startLat, startLong, 30*i, radius);
            str.append(tmpGeoPoint.latitude + " " + tmpGeoPoint.longitude + ",");
            if (i==0){
                initGeoPoint = tmpGeoPoint;
            }
        }
        str.append(initGeoPoint.latitude + " " + initGeoPoint.longitude + ",");
        str.append("))");
        return str.toString();
    };
}
