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
        String result = rectangularAreaGenerator.generateArea(center);
        System.out.println(result);
    }
}