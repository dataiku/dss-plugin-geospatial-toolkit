package com.dataiku.dip.plugins.tradearea;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.dataiku.dip.shaker.types.GeoPoint;

class CircleAreaGeneratorTest {
    @Test
    public void testEndPointCreation() {
        double radius = 1;
        CircleAreaGenerator circleAreaGenerator = new CircleAreaGenerator(radius);
        GeoPoint.Coords coords = GeoPoint.convert("POINT(-73.9723 40.64749)");
        String actualOutput = circleAreaGenerator.generateArea(coords);
        String expectedOutput = "POLYGON((-73.9723 40.656473152841194,-73.96637946127979 40.65526948739145,-73.96204583147922 40.65198112292776,-73.96046030303773 40.64748939540198,-73.96204721167005 40.6429979701752,-73.96638084147067 40.639710210309524,-73.9723 40.638506847158794,-73.97821915852934 40.639710210309524,-73.98255278832995 40.6429979701752,-73.98413969696227 40.64748939540198,-73.98255416852079 40.65198112292776,-73.97822053872022 40.65526948739145,-73.9723 40.656473152841194))";
        assertEquals(expectedOutput, actualOutput);
    }
}