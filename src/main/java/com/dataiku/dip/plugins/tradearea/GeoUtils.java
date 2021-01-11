package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.shaker.types.GeoPoint;

public class GeoUtils {

    static double degreesToRadians = Math.PI/180;
    static double radiansToDegrees = 180/Math.PI;
    // Earth radius in Km
    static double earthRadius = 6378.137;

    public static MyGeoPoint computeDestinationPoint(double startLat, double startLong, double bearing, double distance){
        /*
            Args:
                startLat: Latitude angle in degrees
                startLong: Longitude angle in degrees
                bearing: Bearing angle in degrees (0 is north, 90 is west ... )
                distance: Distance in kilometers
         */
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
