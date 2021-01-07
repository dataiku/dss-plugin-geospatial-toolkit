package com.dataiku.dip.plugins.tradearea;

import java.math.BigInteger;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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


public class TradeAreaProcessor extends SingleInputSingleOutputRowProcessor implements Processor {

    public static class Parameter implements StepParams {
        private static final long serialVersionUID = -1;
        public String inputColumn;
        public String outputColumn;
        public ProcessingMode processingMode;

        @Override
        public void validate() throws IllegalArgumentException {
            // Throw an exception if the processingMode is invalid.
            TradeAreaProcessor.newGenerator(processingMode);
        }
    }

    public enum ProcessingMode implements Labelled {
        KILOMETERS {
            public String getLabel() {
                return "Kilometers";
            }
        },
        MILES {
            public String getLabel() {
                return "Miles";
            }
        },
        METERS {
            public String getLabel() {
                return "Meters";
            }
        },
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
            return Sets.newHashSet(ProcessorTag.RESHAPING, ProcessorTag.MATH);
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
            return ProcessorDesc.withGenericForm(this.getName(), actionVerb("Create") + " trade area zone")
                    .withMNEColParam("inputColumn", "Input column")
                    .withParam(ParamDesc.advancedSelect("processingMode", "Conversion", "", ProcessingMode.class).withDefaultValue(ProcessingMode.KILOMETERS))
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
    private Generator selectedGenerator;
    private Column outputColumn;
    private Column cd;

    @Override
    public void processRow(Row row) throws Exception {
        String str = row.get(cd);
        if (str == null || str.equals("")) {
            getProcessorOutput().emitRow(row);
            return;
        }

        String output = selectedGenerator.generate(str);
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
        selectedGenerator = newGenerator(params.processingMode);
    }

    @VisibleForTesting
    static Generator newGenerator(ProcessingMode processingMode) {
        switch (processingMode) {
        case KILOMETERS:
            return new TradeAreaFromKm();
        case MILES:
            return new TradeAreaFromMiles();
        case METERS:
            return new TradeAreaFromMeters();
        default:
            throw new IllegalArgumentException("Invalid processing mode: " + processingMode);
        }
    }

    @VisibleForTesting
    static abstract class Generator {

        abstract String generate(String toConvert);

        String generate(String str, double radius) {
            if (str == null) {
                throw new NullPointerException("str cannot be null");
            }
            return str + ": Hello";
        }
    }

    private static class TradeAreaFromKm extends Generator {
        @Override
        public String generate(String str) {
            return generate(str, 80);
        }
    }

    private static class TradeAreaFromMiles extends Generator {
        @Override
        public String generate(String str) {
            return generate(str, 90);
        }
    }

    private static class TradeAreaFromMeters extends Generator {
        @Override
        public String generate(String str) {
            return generate(str, 100);
        }
    }


}