package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;

import java.awt.*;

import org.junit.jupiter.api.Test;
import org.w3c.dom.css.Rect;

class RectangleAreaGeneratorTest {
    @Test
    public void testEndPointCreation() {
        double width = 8;
        double height = 5;
        RectangleAreaGenerator rectangularAreaGenerator = new RectangleAreaGenerator(width, height);
        MyGeoPoint center = new MyGeoPoint();
        center.longitude = -73.97237;
        center.latitude = 40.64749;
        String actualResult = rectangularAreaGenerator.generateArea(center);
        String expectedResult = "POLYGON((-73.92499527158498 40.66993820380617,-73.92502714572096 40.62502244905512,-74.01971285427905 40.62502244905512,-74.01974472841503 40.66993820380617,-73.92499527158498 40.66993820380617))";
        assertEquals(expectedResult, actualResult);
    }
}