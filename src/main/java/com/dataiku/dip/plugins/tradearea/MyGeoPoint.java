package com.dataiku.dip.plugins.tradearea;

public class MyGeoPoint {
    // WARNING: Existing class GeoPoint in dataiku dip shaker datatypes
    double latitude;
    double longitude;

    public MyGeoPoint(){
    }

    public MyGeoPoint(String wktGeoPoint){
        /*
        Parse a Well Known Text representation of a point to latitude/longitude properties:
            wktGeoPoint: POINT(-73.9723 40.64749)
            Here, -73.9723 is a longitude, 40.64749 is a latitude
         */
        wktGeoPoint = wktGeoPoint.substring(6, wktGeoPoint.length()-1);
        String[] splitStr = wktGeoPoint.split("\\s+");
        String parsedLong = splitStr[0];
        String parsedLat = splitStr[1];
        latitude = Double.parseDouble(parsedLat);
        longitude = Double.parseDouble(parsedLong);
    }
}
