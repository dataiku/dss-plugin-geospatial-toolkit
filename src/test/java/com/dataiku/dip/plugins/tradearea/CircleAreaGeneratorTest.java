package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class CircleAreaGeneratorTest {
    @Test
    public void testEndPointCreation() {
        CircleAreaGenerator circleAreaGenerator = new CircleAreaGenerator();
        MyGeoPoint center = new MyGeoPoint();
        center.longitude = 20.0;
        center.latitude = 40.0;
        double radius = 1000;
        String result = circleAreaGenerator.generateCircleArea(center, radius);
        System.out.println(result);
    }
}