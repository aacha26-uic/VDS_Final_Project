import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import CorrelationOverlay from "./CorrelationOverlay";

function CorrelationMatrix() {
  const [n, setN] = useState(10);
  const [data, setData] = useState(null);
  const [overlayData, setOverlayData] = useState(null);
  const svgRef = useRef(null);
  const outerRef = useRef(null);
  const [lockedHeight, setLockedHeight] = useState(null);
  // track if legend animation has already run (only run on first mount / refresh)
  const legendAnimatedRef = useRef(false);

  function stripParticipantLabel(s) {
    try {
      return String(s).replace(/\s*\(participant\)/gi, "");
    } catch (err) {
      return s;
    }
  }

  useEffect(() => {
    // Load the full dataset and compute correlations using data.csv, then pick top features
    fetch("/data.csv")
      .then((r) => r.text())
      .then((txt) => {
        const raw = d3.csvParse(txt);
        if (!raw || raw.length === 0) {
          setData(null);
          return;
        }

        // helper to decide numeric columns
        const exclude = new Set(["file", "utterance", "DX1", "DX2"]);
        const allKeys = Object.keys(raw[0]);
        const candidates = allKeys.filter((k) => !exclude.has(k));

        const numericCols = candidates.filter((col) => {
          let count = 0;
          for (let i = 0; i < raw.length; i++) {
            const v = raw[i][col];
            if (v == null) continue;
            const num = parseFloat(v);
            if (!isNaN(num) && isFinite(num)) count++;
          }
          // require at least 75% numeric rows to be considered numeric
          return count >= raw.length * 0.75;
        });

        // Collect numeric arrays
        const numericData = {};
        numericCols.forEach((c) => {
          numericData[c] = raw.map((row) => {
            const v = parseFloat(row[c]);
            return isNaN(v) ? null : v;
          });
        });

        // Pearson correlation for two arrays with possible nulls
        function pearson(a, b) {
          const n = a.length;
          let sumA = 0,
            sumB = 0,
            sumAB = 0,
            sumA2 = 0,
            sumB2 = 0,
            count = 0;
          for (let i = 0; i < n; i++) {
            const ai = a[i];
            const bi = b[i];
            if (ai == null || bi == null) continue;
            sumA += ai;
            sumB += bi;
            sumAB += ai * bi;
            sumA2 += ai * ai;
            sumB2 += bi * bi;
            count++;
          }
          if (count <= 1) return 0;
          const cov = sumAB - (sumA * sumB) / count;
          const denom = Math.sqrt(
            (sumA2 - (sumA * sumA) / count) * (sumB2 - (sumB * sumB) / count)
          );
          if (denom === 0) return 0;
          return cov / denom;
        }

        // if not enough numeric columns, abort
        if (numericCols.length < 2) {
          setData(null);
          return;
        }

        // Compute full correlation matrix for numeric cols
        const matrix = [];
        for (let i = 0; i < numericCols.length; i++) {
          matrix[i] = [];
          const a = numericData[numericCols[i]];
          for (let j = 0; j < numericCols.length; j++) {
            const b = numericData[numericCols[j]];
            matrix[i][j] = pearson(a, b);
          }
        }

        // compute importance for each column: mean absolute correlation (excluding self)
        const importance = numericCols.map((col, idx) => {
          let s = 0;
          for (let j = 0; j < matrix[idx].length; j++) {
            if (j === idx) continue;
            s += Math.abs(matrix[idx][j]);
          }
          return { col, idx, score: s / (matrix[idx].length - 1) };
        });

        // Select top 10 by default by score
        importance.sort((a, b) => b.score - a.score);
        const topN = 10;
        const selected = importance.slice(0, topN).map((d) => d.idx);
        const header = selected.map((i) => numericCols[i]);
        const topMatrix = selected.map((i) =>
          selected.map((j) => matrix[i][j])
        );

        setData({
          header,
          matrix: topMatrix,
          allNumericCols: numericCols,
          fullMatrix: matrix,
        });
        // ensure the selected `n` doesn't exceed available features
        setN((prev) => Math.min(prev, header.length));
      })
      .catch((err) => {
        console.error("Failed to load/parse data.csv", err);
        setData(null);
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    const m = Math.min(n, data.header.length);
    const header = data.header.slice(0, m);
    const mat = data.matrix.slice(0, m).map((r) => r.slice(0, m));

    // increase left/top padding to shift matrix right and give room for rotated labels
    // dedicated paddings so horizontal shift doesn't shrink cells
    const leftPadding = 80; // controls horizontal offset (move matrix right)
    const rightPadding = 40; // space on the right
    const topPadding = 110; // space above matrix for rotated labels
    const bottomPadding = 50; // space below matrix
    // compute cell size from usable width independent of leftPadding so shifting
    // horizontally doesn't shrink the cells. reservedLeft is the minimum left
    // margin considered when sizing; leftPadding will act as a translation.
    const reservedLeftForSize = 40;
    const usableWidth = Math.max(100, w - reservedLeftForSize - rightPadding);
    const size = Math.min(
      usableWidth / m,
      (h - topPadding - bottomPadding) / m
    );
    const cx = leftPadding;

    // color scale: use RdBu diverging palette (blue=positive, red=negative)
    const color = (v) => {
      const t = (v + 1) / 2; // map -1..1 to 0..1
      return d3.interpolateRdBu(1 - t);
    };

    // draw cells
    function stripParticipantLabel(s) {
      try {
        return String(s).replace(/\s*\(participant\)/gi, "");
      } catch (err) {
        return s;
      }
    }

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        const x = cx + j * size;
        const y = topPadding + i * size;
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", size - 2);
        rect.setAttribute("height", size - 2);
        const v = mat[i][j];
        rect.setAttribute("fill", color(v));
        rect.setAttribute("stroke", "rgba(255,255,255,0.03)");
        rect.setAttribute("class", "corr-cell");
        rect.style.cursor = "pointer";
        rect.addEventListener("mouseenter", (e) => {
          showTooltip(
            e,
            `${stripParticipantLabel(header[i])} × ${stripParticipantLabel(
              header[j]
            )}: ${v.toFixed(3)}`
          );
        });
        rect.addEventListener("mouseleave", hideTooltip);
        rect.addEventListener("click", () => {
          setOverlayData({
            variable1: header[i],
            variable2: header[j],
            correlation: v,
            pValue: null, // We don't have p-values in the current data
          });
        });
        svg.appendChild(rect);
      }
    }

    // labels
    for (let i = 0; i < m; i++) {
      const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
      // top labels - rotated and centered above each column
      const topX = cx + i * size + size / 2;
      // move labels further up so they don't touch the card title
      const topY = topPadding - 27; // previously -14
      // position via transform only so rotation pivots around the center
      tx.setAttribute("transform", `translate(${topX}, ${topY}) rotate(-55)`);
      tx.setAttribute("text-anchor", "middle");
      tx.setAttribute("fill", "#111");
      tx.setAttribute("font-size", "11");
      tx.textContent = stripParticipantLabel(header[i]);
      svg.appendChild(tx);

      const ty = document.createElementNS("http://www.w3.org/2000/svg", "text");
      ty.setAttribute("x", leftPadding - 18);
      ty.setAttribute("y", topPadding + i * size + size / 2 + 4);
      ty.setAttribute("text-anchor", "end");
      ty.setAttribute("fill", "#111");
      ty.setAttribute("font-size", "12");
      ty.textContent = stripParticipantLabel(header[i]);
      svg.appendChild(ty);
    }

    // === Vertical Gradient Legend (RdBu, current colors) ===
    const gridLeft = cx;
    const gridTop = topPadding;
    const gridSize = m * size;
    const legendMargin = 10;
    const legendWidth = 12;
    const legendHeight = gridSize;
    const legendX = gridLeft + gridSize + legendMargin;
    const legendY = gridTop;

    const d3svg = d3.select(svg);
    const defs = d3svg.append("defs");
    const grad = defs
      .append("linearGradient")
      .attr("id", "corrLegend")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    // build gradient with current color function (top=+1 blue-ish, bottom=-1 purple-ish)
    d3.range(0, 1.001, 0.05).forEach((p) => {
      const v = 1 - 2 * p; // map 0..1 -> 1..-1
      grad
        .append("stop")
        .attr("offset", `${p * 100}%`)
        .attr("stop-color", color(v));
    });

    // legend bar with clip-path for upward "water fill" animation
    const clipId = "corrLegendClip";
    defs
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", legendX)
      // start with zero height at bottom so it can rise
      .attr("y", legendY + legendHeight)
      .attr("width", legendWidth)
      .attr("height", 0);

    d3svg
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("rx", 2)
      .attr("fill", "url(#corrLegend)")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .attr("clip-path", `url(#${clipId})`);

    // perform animation only once (initial mount / page refresh)
    if (!legendAnimatedRef.current) {
      d3svg
        .select(`#${clipId} rect`)
        .transition()
        .duration(1800)
        .ease(d3.easeCubicOut)
        .attr("y", legendY)
        .attr("height", legendHeight)
        .on("end", () => {
          legendAnimatedRef.current = true;
        });
    } else {
      // if already animated (e.g., changing n), just set final state immediately
      d3svg
        .select(`#${clipId} rect`)
        .attr("y", legendY)
        .attr("height", legendHeight);
    }

    // ticks and labels
    [1, 0, -1].forEach((val) => {
      const y = legendY + ((1 - val) / 2) * legendHeight;
      d3svg
        .append("line")
        .attr("x1", legendX + legendWidth)
        .attr("x2", legendX + legendWidth + 4)
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", "#111")
        .attr("stroke-width", 1);
      d3svg
        .append("text")
        .attr("x", legendX + legendWidth + 6)
        .attr("y", y + 3)
        .attr("fill", "#111")
        .attr("font-size", 11)
        .text(val);
    });
  }, [data, n]);

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

  // tooltip helpers
  function showTooltip(e, text) {
    let tip = document.getElementById("app-tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "app-tooltip";
      tip.style.position = "fixed";
      tip.style.padding = "6px 8px";
      tip.style.background = "rgba(0,0,0,0.8)";
      tip.style.color = "#fff";
      tip.style.borderRadius = "6px";
      tip.style.pointerEvents = "none";
      // ensure the tooltip always appears above SVG elements
      tip.style.zIndex = 9999;
      // layout niceties to avoid clipping/overflow
      tip.style.maxWidth = "320px";
      tip.style.whiteSpace = "nowrap";
      tip.style.overflow = "hidden";
      tip.style.textOverflow = "ellipsis";
      document.body.appendChild(tip);
    }
    tip.textContent = text;
    // prefer client coordinates (viewport) so we can clamp within the svg/card
    const clientX = e.clientX ?? e.pageX;
    const clientY = e.clientY ?? e.pageY;
    // position just to the right/below the cursor by default
    let left = clientX + 12;
    let top = clientY + 12;
    tip.style.display = "block";
    tip.style.left = left + "px";
    tip.style.top = top + "px";

    // clamp tooltip so it doesn't overflow outside the svg/card area
    try {
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const tipW = tip.offsetWidth || 160;
        const tipH = tip.offsetHeight || 28;
        const rightEdge = rect.left + rect.width;
        const bottomEdge = rect.top + rect.height;
        // if tooltip would overflow right edge, move it to the left of the cursor
        if (left + tipW > rightEdge) {
          left = clientX - tipW - 12;
        }
        // if still overflowing left side of svg, clamp to svg left
        if (left < rect.left + 4) left = rect.left + 4;
        // if tooltip would overflow bottom edge, move it above the cursor
        if (top + tipH > bottomEdge) {
          top = clientY - tipH - 12;
        }
        // ensure tooltip doesn't go above the svg top boundary
        if (top < rect.top + 4) top = rect.top + 4;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
      }
    } catch (err) {
      // if anything goes wrong, fallback to default placement (no-op)
      // console.warn(err);
    }
  }
  function hideTooltip() {
    const tip = document.getElementById("app-tooltip");
    if (tip) tip.style.display = "none";
  }

  return (
    <div
      ref={outerRef}
      className="correlation-matrix-container"
      style={{
        height: lockedHeight ? `${lockedHeight}px` : "100%",
      }}
    >
      <div className="interactive-3d-wrapper interactive-mount">
        <svg
          ref={svgRef}
          style={{
            width: "100%",
            height: lockedHeight ? `${lockedHeight}px` : "100%",
            display: "block",
          }}
        />
      </div>

      {/* move controls after svg so they render on top of rotated labels */}
      <div className="correlation-matrix-controls">
        <span style={{ marginRight: 6, fontSize: 13 }}>Top features:</span>
        <select value={n} onChange={(e) => setN(parseInt(e.target.value))}>
          {[5, 8, 10]
            .filter((opt) => !data || opt <= data.header.length)
            .map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
        </select>
      </div>

      <div className="correlation-matrix-info">
        Click cells for detailed correlation analysis
      </div>

      {/* Correlation Overlay */}
      {overlayData && (
        <CorrelationOverlay
          data={overlayData}
          onClose={() => setOverlayData(null)}
        />
      )}
    </div>
  );
}

export default CorrelationMatrix;
