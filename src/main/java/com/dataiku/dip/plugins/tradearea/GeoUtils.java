package com.dataiku.dip.plugins.tradearea;

public class GeoUtils {

    static double degreesToRadians = Math.PI/180;
    static double radiansToDegrees = 180/Math.PI;
    // earth radius in km
    static double earthRadius = 6378.137;

    public static MyGeoPoint computeDestinationPoint(double startLat, double startLong, double bearing, double distance){
        /*
        Given a starting point latitude and longitude, compute latitude and longitude of the unique final point defined as the
        projection of the starting point on a circle of radius equal to `distance` (km) and with an angle equal to `bearing` (degrees).
        A bearing angle of 0 will result to output point being at North of starting point
        A bearing angle of 90 will result to output point being at West of starting point ...

        Input:
            startLat: Latitude angle of the starting point in degrees
            startLong: Longitude angle of the starting point in degrees
            bearing: Bearing angle in degrees (0 is north, 90 is west ... ), angle can be any real number
            distance: Distance in kilometers

        Output:
            endPoint: The resulting geopoint

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
