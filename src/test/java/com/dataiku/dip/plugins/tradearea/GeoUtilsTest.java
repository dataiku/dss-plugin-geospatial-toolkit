package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class GeoUtilsTest {
    @Test
    public void testEndPointCreation() {
        MyGeoPoint startPoint = new MyGeoPoint();
        startPoint.latitude = 40.64749;
        startPoint.longitude = -73.97237;
        double bearing = 90;
        double distance = 1000;
        MyGeoPoint endPoint = new MyGeoPoint();
        endPoint = GeoUtils.computeDestinationPoint(startPoint.latitude, startPoint.longitude, bearing, distance);
        assertEquals(40.04682164884027, endPoint.latitude);
        assertEquals(-62.20307170738441, endPoint.longitude);
    }
}