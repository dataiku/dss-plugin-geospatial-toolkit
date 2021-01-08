package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;

import java.awt.*;

import org.junit.jupiter.api.Test;
import org.w3c.dom.css.Rect;

class RectangularAreaGeneratorTest {
    @Test
    public void testEndPointCreation() {
        RectangularAreaGenerator rectangularAreaGenerator = new RectangularAreaGenerator();
        MyGeoPoint center = new MyGeoPoint();
        center.longitude = 20.0;
        center.latitude = 40.0;
        double width = 500;
        double height = 1000;
        String result = rectangularAreaGenerator.generateRectangularArea(center, width, height);
        System.out.println(result);
    }
}