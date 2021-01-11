package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class CircleAreaGeneratorTest {
    @Test
    public void testEndPointCreation() {
        double radius = 1;
        CircleAreaGenerator circleAreaGenerator = new CircleAreaGenerator(radius);
        MyGeoPoint center = new MyGeoPoint();
        center.longitude = -73.97237;
        center.latitude = 40.64749;
        String result = circleAreaGenerator.generateArea(center);
        System.out.println(result);
    }
}