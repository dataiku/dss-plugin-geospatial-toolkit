package com.dataiku.dip.plugins.tradearea;

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
import com.dataiku.dip.util.ParamDesc;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Sets;
import sun.font.Decoration;


public class TradeAreaProcessor extends SingleInputSingleOutputRowProcessor implements Processor {

    public static class Parameter implements StepParams {
        private static final long serialVersionUID = -1;
        public String inputColumn;
        public String outputColumn;
        public UnitMode unitMode;
        public ShapeMode shapeMode;
        public double radius;
        public double width;
        public double height;

        @Override
        public void validate() throws IllegalArgumentException {
            // Throw an exception if the processingMode is invalid.
            // TODO: Check creating a new generator based on the processing mode
        }
    }

    public enum ShapeMode implements Labelled {
        RECTANGLE {
            public String getLabel() { return "Rectangle";}
        },
        CIRCLE {
            public String getLabel() { return "Circle";}
        }
    }

    public enum UnitMode implements Labelled {
        MILES {
            public String getLabel() { return "Distance metrics in Miles";}
        },
        KILOMETERS {
            public String getLabel() { return "Distance metrics in Kilometers";}
        },
        METERS {
            public String getLabel() { return "Distance metrics in Meters";}
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
            return "This processor performs trade area creation." +
                    "\n \n" +
                    "# Input column\n" +
                    "Contains the geopoints on which the trade area is centered\n \n" +
                    "# Trade Area Creation\n" +
                    "Select the processing mode to / from:\n" +
                    "* Kilometers\n" +
                    "* Miles\n" +
                    "* Meters\n \n" +
                    "# Output column\n" +
                    "Contains created trade areas";
        }

        @Override
        public Class<Parameter> stepParamClass() {
            return Parameter.class;
        }

        @Override
        public ProcessorDesc describe() {
            // TODO: Create the appropriate UI here (inspect the ParamDesc option for the UI to know whats available)
            return ProcessorDesc.withGenericForm(this.getName(), actionVerb("Create") + " trade area zone")
                    .withMNEColParam("inputColumn", "Input column")
                    .withParam(ParamDesc.advancedSelect("unitMode", "Distance unit", "", UnitMode.class).withDefaultValue(UnitMode.KILOMETERS))
                    .withParam(ParamDesc.advancedSelect("shapeMode", "Shape", "", ShapeMode.class).withDefaultValue(ShapeMode.CIRCLE))
                    .withParam(ParamDesc.doubleP("radius", "Radius"))
                    .withParam(ParamDesc.doubleP("width", "Width"))
                    .withParam(ParamDesc.doubleP("height", "Height"))
                    .withColParam("outputColumn", "Output column");
        }

        @Override
        public TradeAreaProcessor build(TradeAreaProcessor.Parameter parameter) throws Exception {
            return new TradeAreaProcessor(parameter);
        }
    };

    public TradeAreaProcessor(Parameter params) {
        this.params = params;
    }

    private Parameter params;
    private Column outputColumn;
    private Column cd;
    // TODO: Declare a generator here
    private AreaGenerator generator;

    @Override
    public void processRow(Row row) throws Exception {
        String str = row.get(cd);
        if (str == null || str.equals("")) {
            getProcessorOutput().emitRow(row);
            return;
        }

        // TODO: Instantiate here the core processing on an input string
        MyGeoPoint centerGeoPoint = new MyGeoPoint(str);
        String output = generator.generateArea(centerGeoPoint);

        if (output.length() != 0) {
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
        System.out.println("ShapeMode:" + params.shapeMode);
        generator = newGenerator(params.shapeMode, params.radius, params.height, params.width);
    }

    @VisibleForTesting
    static AreaGenerator newGenerator(ShapeMode shapeMode, double radius, double height, double width) {
        switch (shapeMode) {
        case RECTANGLE:
            return new RectangleAreaGenerator(width, height);
        case CIRCLE:
            return new CircleAreaGenerator(radius);
        default:
            throw new IllegalArgumentException("Invalid processing mode: " + shapeMode);
        }
    }

    // TODO: Access the parameters here and create the appropriate generator
    // Circle/Rectangular
    // Give the parameters to the function new generator to instantiate the right object afterward
    // TODO: Select the right instance of the abstract class a the used conversion function

}