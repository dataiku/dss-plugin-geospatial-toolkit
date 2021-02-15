package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.dataiku.dip.shaker.types.GeoPoint;

class CircleAreaGeneratorTest {
    @Test
    public void testStandardGenerator() {
        double radius = 2;
        CircleAreaGenerator circleAreaGenerator = new CircleAreaGenerator(radius);
        GeoPoint.Coords coords = new GeoPoint.Coords(40.64749, -73.97237);
        String actualResult = circleAreaGenerator.generateArea(coords);
        String expectedResult = "POLYGON((-73.97237 40.66545630568238,-73.96052754172119 40.66304867233032,-73.95186028264165 40.656471338692555,-73.9486906065045 40.64748758160799,-73.95186580340483 40.638505033719284,-73.96053306248504 40.63193011847352,-73.97237 40.629523694317605,-73.98420693751495 40.63193011847352,-73.99287419659517 40.638505033719284,-73.9960493934955 40.64748758160799,-73.99287971735835 40.656471338692555,-73.98421245827882 40.66304867233032,-73.97237 40.66545630568238))";
        assertEquals(expectedResult, actualResult);
    }

    @Test
    public void testInvalidInput() {
        double radius = 9;
        CircleAreaGenerator generator = new CircleAreaGenerator(radius);
        String actualResult = generator.generateArea(null);
        assertNull(actualResult);
    }

    @Test
    public void testNullDistances() {
        double radius = 0;
        CircleAreaGenerator generator = new CircleAreaGenerator(radius);
        String str = "POINT(-73.9723 40.64749)";
        GeoPoint.Coords coords = GeoPoint.convert(str);
        String actualResult = generator.generateArea(coords);
        // TODO: Assess necessity to fail on null
        // assertNull(actualResult);
        assertNotNull(actualResult);
    }
}