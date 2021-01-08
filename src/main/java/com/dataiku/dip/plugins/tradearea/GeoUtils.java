package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;

public class GeoUtils {

    double degreesToRadians = Math.PI/180;
    double radiansToDegrees = 180/Math.PI;
    double earthRadius = 6378137;

    public MyGeoPoint computeDestinationPoint(double startLat, double startLong, double bearing, double distance){
        // Expecting latitude, longitude and bearing in degrees here
        // Expecting distance in meters
        startLat *= degreesToRadians;
        startLong *= degreesToRadians;
        bearing *= degreesToRadians;
        double endLat = Math.asin(
                Math.sin(startLat)*Math.cos(distance/earthRadius) +
                Math.cos(startLat)*Math.sin(distance/earthRadius)*Math.cos(bearing)
                );
        double endLong = startLong + Math.atan2(
                Math.sin(bearing)*Math.sin(distance/earthRadius)*Math.cos(startLat),
                Math.cos(distance/earthRadius)-Math.sin(startLat)*Math.sin(endLat)
                );
        MyGeoPoint endPoint = new MyGeoPoint();
        endPoint.latitude = radiansToDegrees*endLat;
        endPoint.longitude = radiansToDegrees*endLong;
        return endPoint;
    }
}
