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
        String expectedResult = "POLYGON((-73.87758864980181 40.692367032096044,-73.87771614626718 40.60253557932358,-74.06702385373282 40.60253557932358,-74.0671513501982 40.692367032096044,-73.87758864980181 40.692367032096044))";
        assertEquals(expectedResult, actualResult);
    }
}