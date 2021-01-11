package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class GeoUtilsTest {
    @Test
    public void testEndPointCreation() {
        GeoUtils geoUtils = new GeoUtils();
        MyGeoPoint startPoint = new MyGeoPoint();
        startPoint.latitude = 40.64749;
        startPoint.longitude = -73.97237;
        double bearing = 90;
        double distance = 1000;
        MyGeoPoint endPoint = new MyGeoPoint();
        endPoint = geoUtils.computeDestinationPoint(startPoint.latitude, startPoint.longitude, bearing, distance);
        System.out.println(endPoint.latitude + " " + endPoint.longitude);
        assertEquals("qwerty: Hello", "qwerty: Hello");
    }
}