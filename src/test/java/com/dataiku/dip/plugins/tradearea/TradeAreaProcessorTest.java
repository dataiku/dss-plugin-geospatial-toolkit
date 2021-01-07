package com.dataiku.dip.plugins.tradearea;
import com.dataiku.dip.plugins.tradearea.TradeAreaProcessor.ProcessingMode;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;


public class TradeAreaProcessorTest {
    @Test
    public void testHexadecimalToDecimal() {
        assertEquals(sample("qwerty"), "qwerty: Hello");
    }


    private static String sample(String str) {
        return convert(ProcessingMode.KILOMETERS, str);
    }

    private static String convert(ProcessingMode processingMode, String str) {
        return TradeAreaProcessor.newGenerator(processingMode).generate(str);
    }
}