package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class MyGeoPointTest {
    @Test
    public void testMyGeoPointConstructor() {
        String wktGeoPoint = "POINT(-40.393 90.39)";
        MyGeoPoint geoPoint = new MyGeoPoint(wktGeoPoint);
        assertEquals(-40.393, geoPoint.latitude);
        assertEquals(90.39, geoPoint.longitude);
    }
}