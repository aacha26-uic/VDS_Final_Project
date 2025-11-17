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
    "AUX(participant)": "1",
    "VERB(participant)": "2",
    "CCONJ(participant)": "3",
    "NUM(participant)": "4",
    "PROPN(participant)": "5",
    "TTR(participant)": "6",
    "MATTR(participant)": "7"
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
    const [selectedPatient, setSelectedPatient] = useState("ALL");
    const [data, setData] = useState([]);

    useEffect(() => {
        d3.csv("/data.csv").then((raw) => {
            setData(raw);
        })
    }, []);

    useEffect(() => {
        if (data.length === 0) return;

        let filtered = data;

        if (selectedPatient !== "ALL") {
            filtered = data.filter((d) => d.REGTRYID === selectedPatient);
        } else {
            filtered = data.filter((d) => d.DX1 === selectedGroup);
        }

        const averages = linguisticFeatures.map((feature) => ({
            feature,
            value: d3.mean(filtered, (d) => +d[feature]) || 0,
        }));

        const width = 350;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 50, left: 40 };

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
                selectedPatient === "ALL"
                    ? groupColors[selectedGroup] // group
                    : "#95B8C7" // single patient
            )
            .on("mouseover", function (event, d) {
                const tooltip = d3.select(tooltipRef.current);
                const container = containerRef.current.getBoundingClientRect();
                const bar = this.getBoundingClientRect();

                tooltip
                    .style("opacity", 1)
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
                d3.select(tooltipRef.current).style("opacity", 0);
            });

        // x axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
                d3.axisBottom(x).tickFormat((d) => d.split("(")[0])
            )
            .selectAll("text")
            .style("fill", "black")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");
            
        svg.selectAll(".domain").attr("stroke", "black");
        svg.selectAll(".tick line").attr("stroke", "black");

        // y axis
        svg
            .append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.selectAll("text").style("fill", "black");
        svg.selectAll(".domain").attr("stroke", "black");
        svg.selectAll(".tick line").attr("stroke", "black");

        // labels
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .style("fill", "#000000")
            .style("font-size", "12px")
            .text("Linguistic Features");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(15, ${height / 2}) rotate(-90)`)
            .style("fill", "#000000")
            .style("font-size", "12px")
            .text("Mean Value");

    }, [data, selectedGroup, selectedPatient]);


    const patientIDs = [...new Set(data.map((d) => d.REGTRYID))];

    return (
        <div
            ref={containerRef}
            style={{ position: "relative", width: "100%", height: "100%" }}
        >
            {/* AD group selection */}
            <div style={{ marginBottom: "10px", color: "#000000" }}>
                {groups.map((g) => (
                    <label key={g} style={{ marginRight: "15px" }}>
                        <input
                            type="radio"
                            name="dx-group"
                            value={g}
                            checked={selectedGroup === g}
                            disabled={selectedPatient !== "ALL"}
                            onChange={() => setSelectedGroup(g)}
                            style={{ marginRight: "5px" }}
                        />
                        {g}
                    </label>
                ))}
            </div>

            {/* patient selection */}
            <div style={{ marginBottom: "10px", color: "#ffffff" }}>
                <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    style={{
                        padding: "4px 8px",
                        background: "#0f172a",
                        color: "#d1fae5",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                    }}
                >
                    <option value="ALL">All Patients</option>
                    {patientIDs.map((id) => (
                        <option key={id} value={id}>{id}</option>
                    ))}
                </select>
            </div>

            {/* tooltip */}
            <div
                ref={tooltipRef}
                style={{
                    position: "absolute",
                    background: "rgba(0,0,0,0.8)",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    pointerEvents: "none",
                    opacity: 0,
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    transition: "opacity 0.2s",
                }}
            ></div>

            <svg ref={svgRef} id="profile-chart" />
        </div>
    );

};

export default PatientProfile;