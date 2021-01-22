package com.dataiku.dip.plugins.tradearea;

import java.awt.geom.Area;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.dataiku.dip.datalayer.Column;
import com.dataiku.dip.datalayer.Processor;
import com.dataiku.dip.datalayer.Row;
import com.dataiku.dip.datalayer.SingleInputSingleOutputRowProcessor;
import com.dataiku.dip.shaker.model.StepParams;
import com.dataiku.dip.shaker.processors.Category;
import com.dataiku.dip.shaker.processors.ProcessorMeta;
import com.dataiku.dip.shaker.processors.ProcessorTag;
import com.dataiku.dip.shaker.server.ProcessorDesc;
import com.dataiku.dip.shaker.text.Labelled;
import com.dataiku.dip.shaker.types.GeoPoint;
import com.dataiku.dip.util.ParamDesc;
import com.dataiku.dip.utils.DKULogger;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Sets;

public class TradeAreaProcessor extends SingleInputSingleOutputRowProcessor implements Processor {

    public static final double MILES_TO_KM = 1.6093444978925633;

    public static class Parameter implements StepParams {
        private static final long serialVersionUID = -1;
        public String inputColumn;
        public String outputColumn;
        /**
         * Custom parameters declaration of the processor
         */
        public UnitMode unitMode;
        public ShapeMode shapeMode;
        public double radius;
        public double width;
        public double height;

        @Override
        public void validate() throws IllegalArgumentException {
            TradeAreaProcessor.validate(unitMode, shapeMode, radius, height, width);
        }
    }

    public enum ShapeMode implements Labelled {
        // Options on the shape of polygons
        RECTANGLE {
            public String getLabel() { return "Rectangle";}
        },
        CIRCLE {
            public String getLabel() { return "Circle";}
        }
    }

    public enum UnitMode implements Labelled {
        // Options on the unit of the distances
        MILES {
            public String getLabel() { return "Miles";}
        },
        KILOMETERS {
            public String getLabel() { return "Kilometers";}
        }
    }



    public static final ProcessorMeta<TradeAreaProcessor, Parameter> META = new ProcessorMeta<TradeAreaProcessor, Parameter>() {

        @Override
        public String getName() {
            return "TradeAreaProcessor";
        }

        @Override
        public String getDocPage() {
            return "trade-area-processor";
        }

        @Override
        public Category getCategory() {
            return Category.TRANSFORMATION;
        }

        @Override
        public Set<ProcessorTag> getTags() {
            return Sets.newHashSet(ProcessorTag.GEOGRAPHIC);
        }

        @Override
        public String getHelp() {
            return "This processor performs trade area creation. For each input geospatial point, a spatial polygon is" +
                    " created around it, delimiting the zone covered by the point. " +
                    "The shape area of the polygon can be either rectangular or circular (Using an approximate)." +
                    "\n \n" +
                    "# Input column\n" +
                    "Contains the geopoints on which the trade area is centered\n \n" +
                    "# Output column\n" +
                    "Contains created trade areas in the WKT format\n\n"+
                    "# Trade area creation options\n" +
                    "Select the unit of distances from:\n" +
                    "* Kilometers\n" +
                    "* Miles\n\n" +
                    "Select the shape of trade area from:\n" +
                    "* Rectangular\n" +
                    "* Circular\n\n";
        }

        @Override
        public Class<Parameter> stepParamClass() {
            return Parameter.class;
        }

        @Override
        public ProcessorDesc describe() {
            // UI creation using ParamDesc
            return ProcessorDesc.withGenericForm(this.getName(), actionVerb("Create") + " trade area zone")
                    .withMNEColParam("inputColumn", "Input column")
                    .withColParam("outputColumn", "Output column")
                    .withParam(ParamDesc.advancedSelect("unitMode", "Distance unit", "", UnitMode.class).withDefaultValue(UnitMode.KILOMETERS))
                    .withParam(ParamDesc.advancedSelect("shapeMode", "Shape", "", ShapeMode.class).withDefaultValue(ShapeMode.CIRCLE))
                    .withParam(ParamDesc.doubleP("radius", "Radius"))
                    .withParam(ParamDesc.doubleP("width", "Width"))
                    .withParam(ParamDesc.doubleP("height", "Height"));
        }

        @Override
        public TradeAreaProcessor build(TradeAreaProcessor.Parameter parameter) throws Exception {
            return new TradeAreaProcessor(parameter);
        }
    };

    public TradeAreaProcessor(Parameter params) {
        this.params = params;
    }

    private final Parameter params;
    private Column outputColumn;
    private Column cd;
    private AreaGenerator generator;

    @Override
    public void processRow(Row row) throws Exception {
        String str = row.get(cd);
        // Handle null in input
        if (str == null || str.equals("")) {
            getProcessorOutput().emitRow(row);
            return;
        }

        String output = "";
        // Actual row to row processing
        // str should be a WKT description of the input geospatial point
        // example: POINT(-73.9723 40.64749) where -73.9723 is a longitude, 40.64749 is a latitude
        GeoPoint.Coords coords = GeoPoint.convert(str);
        if (coords != null){
            output = generator.generateArea(coords);
        }

        // Handle null in output
        if (output != null) {
            row.put(outputColumn, output);
        }

        getProcessorOutput().emitRow(row);
    }

    @Override
    public void postProcess() throws Exception {
        getProcessorOutput().lastRowEmitted();
    }

    @Override
    public void init() throws Exception {
        cd = getCf().column(params.inputColumn, ProcessorRole.INPUT_COLUMN);
        if (!StringUtils.isBlank(params.outputColumn)) {
            outputColumn = getCf().column(params.outputColumn, ProcessorRole.OUTPUT_COLUMN);
        } else {
            outputColumn = cd;
        }
        generator = newGenerator(params.unitMode, params.shapeMode, params.radius, params.height, params.width);
    }

    @VisibleForTesting
    static AreaGenerator newGenerator(UnitMode unitMode, ShapeMode shapeMode, double radius, double height, double width) {
        logger.info("Instantiated new generator.");
        logger.infoV("Got width=", width);
        logger.infoV("Got height=", height);

        if (unitMode == UnitMode.MILES){
            logger.info("Distances are expressed in miles.");
            radius *= MILES_TO_KM;
            width *= MILES_TO_KM;
            height *= MILES_TO_KM;
        } else {
            logger.info("Distances are expressed in kilometers.");
        }
        switch (shapeMode) {
            case RECTANGLE:
                logger.info("Instantiating a Rectangular Area Generator.");
                return new RectangleAreaGenerator(width, height);
            case CIRCLE:
                logger.info("Instantiating a Circular Area Generator.");
                return new CircleAreaGenerator(radius);
            default:
                throw new IllegalArgumentException("Invalid processing mode: " + shapeMode);
            }
    }

    static void validate(UnitMode unitMode, ShapeMode shapeMode, double radius, double height, double width){
        AreaGenerator areaGenerator = newGenerator(unitMode, shapeMode, radius, height, width);
    }


    private static DKULogger logger = DKULogger.getLogger("dku");
}
