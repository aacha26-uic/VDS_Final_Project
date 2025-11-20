import React, { useEffect, useRef, useState, useCallback } from "react";
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

const CorrelationBiomarkerAD = ({ sliderValues, setSliderValues }) => {

    const heatmapRef = useRef();

    const [data, setData] = useState([]);
    // const [sliderValues, setSliderValues] = useState({});
    const [corrMatrix, setCorrMatrix] = useState([]);

    // correlation matrix - will change once model is ready
    const generateCorrMatrix = useCallback(() => {
        return biomarkers.flatMap((b) =>
            groups.map((g) => {
                const sliderEffect = Object.values(sliderValues).reduce((a,v) => a + v, 0) * 0.0005;
                const value = Math.min(1, Math.max(0, Math.random() * 0.6 + 0.2 + sliderEffect));
                return { biomarker: b.label, group: g, value };
            })
        );
    }, [sliderValues]);

    useEffect(() => {
        d3.csv("/data.csv").then((raw) => {

            // parsing the strings to numeric
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

            // setCorrMatrix(generateCorrMatrix());
        })
    }, [setSliderValues]);

    useEffect(() => {
        if (!Object.keys(sliderValues).length) return;
        setCorrMatrix(generateCorrMatrix());
    }, [generateCorrMatrix, sliderValues]);

    // heatmap
    useEffect(() => {
        if (!corrMatrix.length) return;

        const rawSvg = d3.select(heatmapRef.current);
        rawSvg.selectAll("*").remove();

        const width = 400;
        const height = 300;
        const cellSize = 100;

        const margin = { top: 40, right: 40, bottom: 120, left: 120 };

        const svg = rawSvg
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        const color = d3.scaleLinear()
            .domain([0, 1])
            .range(["#efddff", "#301934"]);

        // cells
        g.selectAll(".cell")
            .data(corrMatrix)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("x", d => groups.indexOf(d.group) * cellSize)
            .attr("y", d => biomarkers.findIndex(b => b.label === d.biomarker) * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", d => color(d.value));

        // labels for AD groups
        g.selectAll(".groupLabel")
            .data(groups)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", (d, i) => i * cellSize + cellSize / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(d => d);

        // label for biomarkers
        g.selectAll(".bioLabel")
            .data(biomarkers)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", -15)
            .attr("y", (d, i) => i * cellSize + cellSize / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text(d => d.label);
    }, [corrMatrix]);

    // to get range of each linguistic feature
    const getRange =(feature) => {
        const vals = data.map(d => +d[feature]).filter(v => !isNaN(v));
        let min = vals.length ? d3.min(vals) : 0;
        let max = vals.length ? d3.max(vals) : 1;
        return { min, max };
    };

    // to render a slider
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

              // this will change as well
              onChange={(e) => {
                    const newVal = +e.target.value;
                    setSliderValues(prev => {
                        const updated = { ...prev, [feature]: newVal };
                        setCorrMatrix(generateCorrMatrix());
                        return updated;
                    });
              }}
            />
            <span>{(sliderValues[feature] ?? 0).toFixed(3)}</span>
          </div>
        );
      };
    
    return (
        <div className="correlation-biomarkers">
            <svg ref={heatmapRef} className="heatmap" />            
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