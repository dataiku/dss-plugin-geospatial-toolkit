package com.dataiku.dip.plugins.tradearea;
import com.dataiku.dip.PluginEntryPoint;
import com.dataiku.dip.shaker.processors.BaseProcessorsFactory;

public class Plugin extends PluginEntryPoint {
    public void load() throws Exception {
        BaseProcessorsFactory.addProcessor(this, TradeAreaProcessor.META);
    }
}