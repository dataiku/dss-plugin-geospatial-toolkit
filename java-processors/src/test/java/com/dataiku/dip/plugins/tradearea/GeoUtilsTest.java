package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.dataiku.dip.shaker.types.GeoPoint;

public class GeoUtilsTest {
    @Test
    public void testEndPointCreation() {
        GeoPoint.Coords coords = new GeoPoint.Coords(40.64749, -73.97237);
        double bearing = Math.PI/2;
        double distance = 1000;
        GeoPoint.Coords endPoint = GeoUtils.computeDestinationPoint(coords.latitude, coords.longitude, bearing, distance);
        assertEquals(40.04682164884027, endPoint.latitude);
        assertEquals(-62.20307170738441, endPoint.longitude);
    }
}