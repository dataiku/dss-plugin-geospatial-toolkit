package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;

import java.awt.*;

import org.junit.jupiter.api.Test;
import org.w3c.dom.css.Rect;

class RectangleAreaGeneratorTest {
    @Test
    public void testEndPointCreation() {
        double width = 500;
        double height = 1000;
        RectangleAreaGenerator rectangularAreaGenerator = new RectangleAreaGenerator(width, height);
        MyGeoPoint center = new MyGeoPoint();
        center.longitude = 20.0;
        center.latitude = 40.0;
        String result = rectangularAreaGenerator.generateArea(center);
        System.out.println(result);
    }
}