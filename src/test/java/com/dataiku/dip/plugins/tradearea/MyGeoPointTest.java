package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class MyGeoPointTest {
    @Test
    public void testMyGeoPointConstructor() {
        String wktGeoPoint = "POINT(-73.97237 40.64749)";
        MyGeoPoint geoPoint = new MyGeoPoint(wktGeoPoint);
        assertEquals(40.64749, geoPoint.latitude);
        assertEquals(-73.97237, geoPoint.longitude);
    }
}