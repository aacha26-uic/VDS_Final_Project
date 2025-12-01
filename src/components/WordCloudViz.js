import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import DetailOverlay from "./DetailOverlay";

// Radial Word Cloud with 3 rings for HC, MCI, AD conditions
function WordCloudViz() {
  const [showCondition, setShowCondition] = useState("all");
  const [maxWords, setMaxWords] = useState(8);
  const [wordsData, setWordsData] = useState([]);
  const [overlayData, setOverlayData] = useState(null);
  const svgRef = useRef(null);
  const outerRef = useRef(null);
  const [lockedHeight, setLockedHeight] = useState(null);

  useEffect(() => {
    fetch("/radial_wordcloud_data.json")
      .then((r) => r.json())
      .then((data) => {
        setWordsData(data);
      })
      .catch((err) => {
        console.warn("Could not load radial word cloud data", err);
        setWordsData([]);
      });
  }, []);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || wordsData.length === 0) return;

    const width = svgEl.clientWidth;
    const height = svgEl.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 20; // slightly larger overall chart

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    // Take top words by total frequency
    const topWords = wordsData.slice(0, maxWords);

    // Define ring radii (more inner space; equal ring thickness)
    const innerRadius = maxRadius * 0.35; // expand center for word labels
    const ring1Radius = maxRadius * 0.5; // HC ring (same thickness as others)
    const ring2Radius = maxRadius * 0.65; // MCI ring
    const ring3Radius = maxRadius * 0.8; // AD ring

    // Color scheme for white card background: light blue, dark blue, purple
    const colors = {
      hc: "#60A5FA", // light blue
      mci: "#1E40AF", // dark blue
      ad: "#7C3AED", // purple
    };
    const conditionLabels = {
      hc: "Normal (Healthy)",
      mci: "MCI (Mild Cognitive Impairment)",
      ad: "AD (Alzheimer's Disease)",
    };

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Draw ring backgrounds
    const ringData = [
      {
        inner: innerRadius,
        outer: ring1Radius,
        condition: "hc",
        label: "Normal",
      },
      {
        inner: ring1Radius,
        outer: ring2Radius,
        condition: "mci",
        label: "MCI",
      },
      { inner: ring2Radius, outer: ring3Radius, condition: "ad", label: "AD" },
    ];

    // Add ring backgrounds
    g.selectAll(".ring-bg")
      .data(ringData)
      .enter()
      .append("path")
      .attr("class", "ring-bg")
      .attr("d", (d) => {
        const arc = d3
          .arc()
          .innerRadius(d.inner)
          .outerRadius(d.outer)
          .startAngle(0)
          .endAngle(2 * Math.PI);
        return arc();
      })
      .attr("fill", "rgba(0,0,0,0.03)")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    // Add ring labels with maximum visibility (original position)
    g.selectAll(".ring-label")
      .data(ringData)
      .enter()
      .append("text")
      .attr("class", "ring-label")
      // original position: centered at the top of each ring
      .attr("x", 0)
      .attr("y", (d) => -(d.inner + d.outer) / 2)
      .attr("text-anchor", "middle")
      .attr("text-rendering", "geometricPrecision")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#111")
      .attr("stroke", "none")
      .attr("stroke-width", "0px")
      .attr("opacity", 1)
      .style("paint-order", "stroke fill")
      .style("pointer-events", "none")
      .text((d) => d.label);

    // Calculate segments for each word
    const angleStep = (2 * Math.PI) / topWords.length;

    topWords.forEach((word, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;

      // Determine which rings to light up based on word frequency in each condition
      const conditions = ["hc", "mci", "ad"];
      const wordFreqs = [word.hc, word.mci, word.ad];
      const maxFreq = Math.max(...wordFreqs);
      const threshold = maxFreq * 0.3; // Only show rings above 30% of max frequency

      conditions.forEach((condition, condIdx) => {
        const freq = wordFreqs[condIdx];
        const ringInfo = ringData[condIdx];

        if (
          freq > threshold &&
          (showCondition === "all" || showCondition === condition)
        ) {
          // Calculate opacity based on frequency
          const opacity = 0.3 + (freq / maxFreq) * 0.7;

          // Draw ring segment
          const arc = d3
            .arc()
            .innerRadius(ringInfo.inner)
            .outerRadius(ringInfo.outer)
            .startAngle(startAngle)
            .endAngle(endAngle);

          g.append("path")
            .attr("d", arc)
            .attr("fill", colors[condition])
            .attr("opacity", opacity)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.3)
            .attr("class", "radial-segment")
            .style("cursor", "pointer")
            .on("mouseenter", function (event) {
              d3.select(this).attr("opacity", Math.min(opacity + 0.3, 1));
              showTooltip(
                event,
                `${word.word} (${
                  conditionLabels[condition] || condition.toUpperCase()
                }): ${freq.toFixed(3)}`
              );
            })
            .on("mouseleave", function () {
              d3.select(this).attr("opacity", opacity);
              hideTooltip();
            })
            .on("click", function () {
              showPersistentInfo(word, condition);
            });
        }
      });

      // center words are handled after segments
    });

    // Draw center words matching the number of sections to avoid gaps
    const wordCount = topWords.length;
    const fontPx = Math.max(9, 13 - (wordCount - 4) * 0.6); // 4->13px, 10->~9px
    for (let idx = 0; idx < wordCount; idx++) {
      const w = topWords[idx];
      const angle = idx * angleStep + angleStep / 2; // align with section center
      const textRadiusFactor =
        wordCount >= 10 ? 0.84 : wordCount >= 8 ? 0.82 : 0.78;
      let textRadius = innerRadius * textRadiusFactor; // spacing from center edge
      const x = Math.cos(angle - Math.PI / 2) * textRadius;
      const y = Math.sin(angle - Math.PI / 2) * textRadius;

      const tSel = g
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("text-rendering", "geometricPrecision")
        .attr("font-size", `${fontPx}px`)
        .attr("font-weight", "bold")
        .attr("fill", "#111")
        .attr("class", "radial-center-word")
        .text(w.word)
        .style("cursor", "pointer")
        .on("mouseenter", function (event) {
          d3.select(this)
            .attr("font-size", `${fontPx + 1}px`)
            .attr("fill", "#ff7a00");
          showTooltip(
            event,
            `${w.word}: Normal=${w.hc.toFixed(3)}, MCI=${w.mci.toFixed(
              3
            )}, AD=${w.ad.toFixed(3)}`
          );
        })
        .on("mouseleave", function () {
          d3.select(this).attr("font-size", `${fontPx}px`).attr("fill", "#111");
          hideTooltip();
        })
        .on("click", function () {
          showPersistentInfo(w, "all");
        });

      // Minimal overlap avoidance: nudge radially if immediate neighbor overlaps
      try {
        if (idx > 0) {
          const prev = g.selectAll(".radial-center-word").nodes()[idx - 1];
          const curr = tSel.node();
          if (prev && curr) {
            const pb = prev.getBBox();
            let cb = curr.getBBox();
            const overlaps = !(
              pb.x + pb.width < cb.x ||
              cb.x + cb.width < pb.x ||
              pb.y + pb.height < cb.y ||
              cb.y + cb.height < pb.y
            );
            if (overlaps) {
              const shift = Math.max(6, fontPx * 0.7);
              // alternate direction to avoid piling outward only
              const dir = idx % 2 === 0 ? 1 : -1;
              textRadius = textRadius + dir * shift;
              const nx = Math.cos(angle - Math.PI / 2) * textRadius;
              const ny = Math.sin(angle - Math.PI / 2) * textRadius;
              tSel.attr("x", nx).attr("y", ny);
              // recheck; if still overlaps, apply second small nudge
              cb = tSel.node().getBBox();
              const still = !(
                pb.x + pb.width < cb.x ||
                cb.x + cb.width < pb.x ||
                pb.y + pb.height < cb.y ||
                cb.y + cb.height < pb.y
              );
              if (still) {
                textRadius = textRadius + dir * shift * 0.6;
                const nx2 = Math.cos(angle - Math.PI / 2) * textRadius;
                const ny2 = Math.sin(angle - Math.PI / 2) * textRadius;
                tSel.attr("x", nx2).attr("y", ny2);
              }
            }
          }
        }
      } catch (e) {
        // ignore bbox errors in some browsers/environments
      }
    }

    // Ensure ring labels render above any segments so they don't get obscured
    g.selectAll(".ring-label")
      .attr("display", (d) =>
        showCondition === "all" || d.condition === showCondition
          ? "block"
          : "none"
      )
      .raise();

    let tip = null;
    function showTooltip(e, text) {
      if (!tip) {
        tip = document.createElement("div");
        tip.id = "radial-tooltip";
        tip.style.position = "fixed";
        tip.style.padding = "6px 8px";
        tip.style.background = "rgba(0,0,0,0.85)";
        tip.style.color = "#fff";
        tip.style.borderRadius = "6px";
        tip.style.pointerEvents = "none";
        tip.style.zIndex = 10000;
        tip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
        tip.style.whiteSpace = "nowrap";
        tip.style.maxWidth = "360px";
        tip.style.overflow = "hidden";
        tip.style.textOverflow = "ellipsis";
        document.body.appendChild(tip);
      }
      tip.textContent = text;
      tip.style.left = e.pageX + 12 + "px";
      tip.style.top = e.pageY - 28 + "px";
      tip.style.display = "block";
    }

    function hideTooltip() {
      const el = document.getElementById("radial-tooltip");
      if (el) el.style.display = "none";
    }

    function showPersistentInfo(word, condition) {
      setOverlayData({
        word: word.word,
        condition: condition,
        frequency: condition !== "all" ? word[condition] : null,
        allFrequencies: {
          hc: word.hc,
          mci: word.mci,
          ad: word.ad,
        },
      });
    }

    // cleanup on unmount
    return () => {
      svg.selectAll("*").remove();
      const el = document.getElementById("radial-tooltip");
      if (el) el.remove();
    };
  }, [wordsData, maxWords, showCondition]);

  // Capture initial rendered height once (when the card is in its original "card" form)
  // and lock the SVG drawing area to that height so when the parent grows (e.g. after
  // hiding the top analysis) the visual area remains the same and internal content
  // becomes scrollable instead of expanding the card visually.
  useEffect(() => {
    if (lockedHeight) return; // already captured
    const el = outerRef.current;
    if (!el) return;
    // allow the layout to settle (in case fonts or images load) before measuring
    const measure = () => {
      const h = el.clientHeight;
      if (h && h > 30) setLockedHeight(h);
    };
    // try a couple of times shortly after mount
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 250);
    // also measure on next animation frame
    const raf = requestAnimationFrame(measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
    };
  }, [lockedHeight]);

  return (
    <div
      ref={outerRef}
      className="word-cloud-container"
      style={{
        height: lockedHeight ? `${lockedHeight}px` : "100%",
      }}
    >
      {/* Slider in original top-right position */}
      <div className="word-cloud-controls">
        <label className="word-cloud-slider-label">
          Words
          <input
            type="range"
            min="4"
            max="10"
            value={maxWords}
            onChange={(e) => setMaxWords(parseInt(e.target.value))}
            style={{ marginLeft: 6 }}
          />
          {maxWords}
        </label>
      </div>

      {/* Dropdown in bottom-right position */}
      <div className="word-cloud-dropdown">
        <select
          value={showCondition}
          onChange={(e) => setShowCondition(e.target.value)}
        >
          <option value="all">All Conditions</option>
          <option value="hc">Normal (Healthy) Only</option>
          <option value="mci">MCI Only</option>
          <option value="ad">AD Only</option>
        </select>
      </div>

      <div
        className="interactive-3d-wrapper interactive-mount"
        onMouseMove={(e) => {
          const wrapper = e.currentTarget;
          const rect = wrapper.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          const rotX = y * -3;
          const rotY = x * 3;
          const svgEl = wrapper.querySelector("svg");
          if (svgEl)
            svgEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }}
        onMouseLeave={(e) => {
          const svgEl = e.currentTarget.querySelector("svg");
          if (svgEl) svgEl.style.transform = "rotateX(0deg) rotateY(0deg)";
        }}
      >
        <svg
          ref={svgRef}
          style={{
            width: "100%",
            height: lockedHeight ? `${lockedHeight}px` : "100%",
            display: "block",
          }}
        />
      </div>

      <div className="word-cloud-info">
        <div>
          Radial rings: Normal (light blue) | MCI (dark blue) | AD (purple)
        </div>
        <div>Hover segments or center words for details</div>
      </div>

      {/* Legend */}
      <div className="word-cloud-legend">
        <div className="legend-item">
          <div
            className="legend-color-box"
            style={{ backgroundColor: "#60A5FA" }}
          ></div>
          <span>Normal (Healthy)</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color-box"
            style={{ backgroundColor: "#1E40AF" }}
          ></div>
          <span>MCI (Mild Cognitive Impairment)</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color-box"
            style={{ backgroundColor: "#7C3AED" }}
          ></div>
          <span>AD (Alzheimer's Disease)</span>
        </div>
      </div>

      {/* Detail Overlay */}
      {overlayData && (
        <DetailOverlay
          data={overlayData}
          onClose={() => setOverlayData(null)}
        />
      )}
    </div>
  );
}

export default WordCloudViz;
