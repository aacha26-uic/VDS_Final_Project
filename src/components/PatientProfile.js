import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// linguistic festures 
const linguisticFeatures = [
    "AUX(participant)", "VERB(participant)",
    "CCONJ(participant)", "NUM(participant)",
    "PROPN(participant)", "TTR(participant)", "MATTR(participant)"
];

// decribes the scale for each variable
const featureDescriptions = {
    "AUX(participant)": "Number of auxiliary verbs",
    "VERB(participant)": "Number of verb tokens",
    "CCONJ(participant)": "Number of conjunctions",
    "NUM(participant)": "Tokens associated with numbers",
    "PROPN(participant)": "Number of proper noun tokens",
    "TTR(participant)": "Type token ratios: ratio of unique tokens divided by the total number of tokens",
    "MATTR(participant)": "Moving-average TTR"
};

// AD groups for filter
const groups = ["Normal", "MCI", "Prob AD"];

// colors for each AD group
const groupColors = {
    "Normal": "#7cbadc",
    "MCI": "#4585c1",
    "Prob AD": "#5459AC"
  };

const PatientProfile = () => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const containerRef = useRef();

    const [selectedGroup, setSelectedGroup] = useState("Normal");
    const [selectedPatient, setSelectedPatient] = useState("");
    const [data, setData] = useState([]);
    const [viewMode, setViewMode] = useState("group");

    useEffect(() => {
        d3.csv("/data.csv").then((raw) => {
            setData(raw);
            const ids = [...new Set(raw.map((d) => d.REGTRYID))];
            if (ids.length) setSelectedPatient(ids[0]);
        })
    }, []);

    useEffect(() => {
        if (data.length === 0) return;

        let filtered = data;

        if (viewMode === "individual" && selectedPatient) {
            // one patient
            filtered = data.filter((d) => d.REGTRYID === selectedPatient);
          } else {
            // group view
            filtered = data.filter((d) => d.DX1 === selectedGroup);
        }

        const averages = linguisticFeatures.map((feature) => ({
            feature,
            value: d3.mean(filtered, (d) => +d[feature]) || 0,
        }));

        const width = 420
        const height = 380;
        const margin = { top: 20, right: 20, bottom: 80, left: 53 };

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove();

        const x = d3
            .scaleBand()
            .domain(averages.map((d) => d.feature))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(averages, (d) => d.value)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // bars
        svg
            .selectAll("rect")
            .data(averages)
            .join("rect")
            .attr("x", (d) => x(d.feature))
            .attr("y", (d) => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", (d) => y(0) - y(d.value))
            .attr("fill",
                viewMode === "group"
                    ? groupColors[selectedGroup] // group
                    : "#95B8C7" // single patient
            )
            .on("mouseover", function (event, d) {
                const tooltip = d3.select(tooltipRef.current);
                const container = containerRef.current.getBoundingClientRect();
                const bar = this.getBoundingClientRect();

                tooltip
                    .style("opacity", 1)
                    .style("visibility", "visible")
                    .html(`
                        <b>${d.feature.split("(")[0]}</b><br/>
                        X: ${d.feature}<br/>
                        Y: ${d.value.toFixed(3)}<br/>
                        <span style="opacity:0.8">${featureDescriptions[d.feature] || ""}</span>
                    `);

                const left = bar.left - container.left + bar.width / 2;
                const top = bar.top - container.top - 35;

                tooltip
                    .style("left", `${left}px`)
                    .style("top", `${top}px`)
                    .style("transform", "translateX(-50%)");
            })
            .on("mouseout", function () {
                d3.select(tooltipRef.current).style("opacity", 0).style("visibility", "hidden");
            });


        // x axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
                d3.axisBottom(x).tickFormat((d) => d.split("(")[0])
            )
            .selectAll("text")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");

        // y axis
        svg
            .append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // labels
        svg.append("text")
            .attr("class", "main-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - 3)
            .text("Linguistic Features");

        svg.append("text")
            .attr("class", "main-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(15, ${height / 2}) rotate(-90)`)
            .text("Mean Value");

    }, [data, selectedGroup, selectedPatient, viewMode]);


    const patientIDs = [...new Set(data.map((d) => d.REGTRYID))];

    return (
        <div
            ref={containerRef}
            style={{ position: "relative", width: "100%", height: "100%"}}
            >
            {/* toggle: Group vs Individual */}
            <div className="view-toggle">
                <button
                    className={viewMode === "group" ? "active" : ""}
                    onClick={() => setViewMode("group")}
                >
                    AD Status
                </button>

                <button
                    className={viewMode === "individual" ? "active" : ""}
                    onClick={() => setViewMode("individual")}
                >
                    Individual
                </button>
            </div>

            {/* AD group selection (only in group mode) */}
            {viewMode === "group" && (
                <div className="controls radio-group" style={{ marginBottom: "8px" }}>
                {groups.map((g) => (
                    <label key={g} className="radio-item">
                    <input
                        type="radio"
                        name="dx-group"
                        value={g}
                        checked={selectedGroup === g}
                        onChange={() => setSelectedGroup(g)}
                    />
                    <span>{g}</span>
                    </label>
                ))}
                </div>
            )}

            {/* patient selection (only in individual mode) */}
            {viewMode === "individual" && (
                <div style={{ marginBottom: "10px", color: "#000" }}>
                <select
                    className="patient-select"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                >
                    {patientIDs.map((id) => (
                    <option key={id} value={id}>
                        {id}
                    </option>
                    ))}
                </select>
                </div>
            )}

            {/* tooltip */}
            <div ref={tooltipRef} className="tooltip" style={{ opacity: 0 }} />

            <svg ref={svgRef} id="profile-chart" />
        </div>
    );

};

export default PatientProfile;