package com.dataiku.dip.plugins.tradearea;

import com.dataiku.dip.utils.DKULogger;

public class MyGeoPoint {
    /*
    A helper class for abstraction and parsing of geospatial points. Might be redundant or already implemented in the DSS.
    (See dataiku.dip.shaker.datatypes)

    Properties:
        latitude: Latitude in degrees
        longitude: Longitude in degrees
     */
    double latitude;
    double longitude;

    public MyGeoPoint(){
    }

    public MyGeoPoint(String wktGeoPoint){
        /*
        Constructor of a geopoint taking as input the Well Known Text representation of a geopoint.
        Will parse the incoming string and set properties accordingly.

        Input:
            String wktGeoPoint: A Well Known Text description of the input geopoint.
                example: POINT(-73.9723 40.64749) where -73.9723 is a longitude, 40.64749 is a latitude

         */
        if (!wktGeoPoint.contains("POINT")){
            logger.info("Invalid geopoint format detected in following value: "+wktGeoPoint+" Expecting POINT(longitude, latitude)");
        }
        // Extract the inner space delimited latitude/longitude substring
        wktGeoPoint = wktGeoPoint.substring(6, wktGeoPoint.length()-1);
        String[] splitStr = wktGeoPoint.split("\\s+");
        String parsedLong = splitStr[0];
        String parsedLat = splitStr[1];
        latitude = Double.parseDouble(parsedLat);
        longitude = Double.parseDouble(parsedLong);
        if (latitude > 90 || latitude < -90){
            logger.info(String.format("Detected invalid geopoint latitude. Got latitude=%f. Should be in range [-90, 90]", latitude));
        }
        if (longitude > 180 || longitude < -180){
            logger.info(String.format("Detected invalid geopoint longitude. Got longitude=%f. Should be in range [-180, 180]", longitude));
        }
    }

    private static DKULogger logger = DKULogger.getLogger("dku");
}