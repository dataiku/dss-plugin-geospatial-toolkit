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
        String actualOutput = circleAreaGenerator.generateArea(center);
        String expectedOutput = "POLYGON((-73.97237 40.656473152841194,-73.96644946127978 40.65526948739145,-73.96211583147921 40.65198112292776,-73.96053030303773 40.64748939540198,-73.96211721167005 40.6429979701752,-73.96645084147066 40.639710210309524,-73.97237 40.638506847158794,-73.97828915852934 40.639710210309524,-73.98262278832995 40.6429979701752,-73.98420969696227 40.64748939540198,-73.98262416852079 40.65198112292776,-73.97829053872022 40.65526948739145,-73.97237 40.656473152841194))";
        assertEquals(expectedOutput, actualOutput);
    }
}