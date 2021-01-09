package com.dataiku.dip.plugins.tradearea;

public class MyGeoPoint {
    // WARNING: Existing class GeoPoint in dataiku dip shaker datatypes
    double latitude;
    double longitude;

    public MyGeoPoint(){
    }

    public MyGeoPoint(String wktGeoPoint){
        wktGeoPoint = wktGeoPoint.substring(6, wktGeoPoint.length()-1);
        String[] splitStr = wktGeoPoint.split("\\s+");
        String parsedLat = splitStr[0];
        String parsedLong = splitStr[1];
        latitude = Double.parseDouble(parsedLat);
        longitude = Double.parseDouble(parsedLong);
    }
}
