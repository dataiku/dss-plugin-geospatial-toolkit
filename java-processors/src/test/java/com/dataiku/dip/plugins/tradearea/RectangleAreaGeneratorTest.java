package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;

import java.awt.*;

import org.junit.jupiter.api.Test;
import org.w3c.dom.css.Rect;

import com.dataiku.dip.shaker.types.GeoPoint;

class RectangleAreaGeneratorTest {
    @Test
    public void testStandardGenerator() {
        double width = 8;
        double height = 5;
        RectangleAreaGenerator rectangularAreaGenerator = new RectangleAreaGenerator(width, height);
        GeoPoint.Coords coords = new GeoPoint.Coords(40.64749, -73.97237);
        String actualResult = rectangularAreaGenerator.generateArea(coords);
        String expectedResult = "POLYGON((-73.92499527158498 40.66993820380617,-73.92502714572096 40.62502244905512,-74.01971285427905 40.62502244905512,-74.01974472841503 40.66993820380617,-73.92499527158498 40.66993820380617))";
        assertEquals(expectedResult, actualResult);
    }

    @Test
    public void testInvalidInput() {
        double width = 8;
        double height = 5;
        RectangleAreaGenerator generator = new RectangleAreaGenerator(width, height);
        String actualResult = generator.generateArea(null);
        assertNull(actualResult);
    }

    @Test
    public void testInvalidFormat() {
        double width = 8;
        double height = 5;
        String actualResult = null;
        RectangleAreaGenerator generator = new RectangleAreaGenerator(width, height);
        String str = "POINT(-73.9723, 40.64749)";
        GeoPoint.Coords coords = GeoPoint.convert(str);
        System.out.println(coords);
        if (coords != null){
            actualResult = generator.generateArea(coords);
        }
        assertNull(actualResult);
    }

    @Test
    public void testInvalidRange() {
        double width = 8;
        double height = 5;
        String actualResult = null;
        RectangleAreaGenerator generator = new RectangleAreaGenerator(width, height);
        String str = "POINT(-73.9723 1000)";
        GeoPoint.Coords coords = GeoPoint.convert(str);
        System.out.println(coords);
        if (coords != null){
            actualResult = generator.generateArea(coords);
        }
        assertNotNull(actualResult);
    }

    @Test
    public void testNullDistances() {
        double width = 0;
        double height = 0;
        String actualResult = null;
        RectangleAreaGenerator generator = new RectangleAreaGenerator(width, height);
        String str = "POINT(-73.9723 40.64749)";
        GeoPoint.Coords coords = GeoPoint.convert(str);
        System.out.println(coords);
        if (coords != null){
            actualResult = generator.generateArea(coords);
        }
        assertNull(actualResult);
    }
}