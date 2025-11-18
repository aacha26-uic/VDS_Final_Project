import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// CSF biomarkers (tTau_AB42Ratio, AB42_AB40Ratio) & Plasma (P_TAU_LUMI) biomarker
const biomarkers = [
    { key: "tTau_AB42Ratio", label: "CSF1" },
    { key: "AB42_AB40Ratio", label: "CSF2" },
    { key: "P_TAU_LUMI", label: "Plasma" }
];
// DX1 (Normal, MCI, Prob AD) - AD groups
const groups = ["Normal", "MCI", "Prob AD"];

// Linguistic biomarkers for sliders
const linguisticFeatures = [
    "AUX(participant)", "VERB(participant)",
    "CCONJ(participant)", "NUM(participant)",
    "PROPN(participant)", "TTR(participant)", "MATTR(participant)"
];

const CorrelationBiomarkerAD = () => {

    const heatmapRef = useRef();

    const [data, setData] = useState([]);
    const [sliderValues, setSliderValues] = useState({});

    useEffect(() => {
        d3.csv("/data.csv").then((raw) => {

            // parsing the strings to numeric: https://observablehq.com/@dakoop/reading-in-data-learn-js-data
            const parsedToNumeric  = raw.map(r => {
                const out = { ...r };
                biomarkers.forEach(b => { out[b.key] = +r[b.key]; });
                linguisticFeatures.forEach(f => { out[f] = r[f] === "" ? NaN : +r[f]; });
                return out;
            });
            setData(parsedToNumeric);

            // initializing the mean as sliders default
            const initialValues = {};
            linguisticFeatures.forEach(f => {
                const vals = parsedToNumeric.map(d => +d[f]).filter(v => !isNaN(v));
                initialValues[f] = vals.length ? d3.mean(vals) : 0;
            });
            setSliderValues(initialValues);
        })
    }, []);

    // to get range of each linguistic feature
    const getRange =(feature) => {
        const vals = data.map(d => +d[feature]).filter(v => !isNaN(v));
        let min = vals.length ? d3.min(vals) : 0;
        let max = vals.length ? d3.max(vals) : 1;
        return { min, max };
    };

    // to render a slider: https://d3.workergnome.com/examples/basic_events/?utm_source=chatgpt.com
    const renderSlider = (feature) => {
        const { min, max } = getRange(feature);
        return (
          <div key={feature} className="slider-row">
            <label>{feature.split("(")[0]}</label>
            <input
              type="range"
              min={min}
              max={max}
              step={(max - min) / 200}
              value={sliderValues[feature] ?? 0}
              onChange={(e) => setSliderValues(prev => ({ ...prev, [feature]: +e.target.value }))}
            />
            <span>{(sliderValues[feature] ?? 0).toFixed(3)}</span>
          </div>
        );
      };
    
    
    return (
        <div className="correlation-biomarkers">
            {/* <svg ref={heatmapRef} className="heatmap" /> */}
            <h5 className="slider-title">Linguistic Feature Sliders</h5>
            <div className="slider-columns">

                {/* Left column */}
                <div className="column">
                    {linguisticFeatures.slice(0, 4).map(f => renderSlider(f))}
                </div>

                {/* Right column */}
                <div className="column">
                    {linguisticFeatures.slice(4).map(f => renderSlider(f))}
                </div>
            </div>
        </div>
    );
}

export default CorrelationBiomarkerAD;