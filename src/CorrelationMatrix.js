import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import * as d3 from "d3";

function CorrelationMatrix() {
  const [n, setN] = useState(10);
  const [data, setData] = useState(null);
  const svgRef = useRef(null);
  const outerRef = useRef(null);
  const [lockedHeight, setLockedHeight] = useState(null);

  useEffect(() => {
    fetch("/correlation_matrix_top10.csv")
      .then((r) => r.text())
      .then((txt) => {
        const lines = txt.trim().split("\n");
        const header = lines[0].split(",").slice(1);
        const rows = lines.slice(1).map((l) => l.split(","));
        const matrix = rows.map((r) => r.slice(1).map((x) => parseFloat(x)));
        setData({ header, matrix });
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    const header = data.header.slice(0, n);
    const mat = data.matrix.slice(0, n).map((r) => r.slice(0, n));

    // increase left/top padding to shift matrix right and give room for rotated labels
    // dedicated paddings so horizontal shift doesn't shrink cells
    const leftPadding = 82; // controls horizontal offset (move matrix right)
    const rightPadding = 40; // space on the right
    const topPadding = 100; // space above matrix for rotated labels
    const bottomPadding = 40; // space below matrix
    // compute cell size from usable width independent of leftPadding so shifting
    // horizontally doesn't shrink the cells. reservedLeft is the minimum left
    // margin considered when sizing; leftPadding will act as a translation.
    const reservedLeftForSize = 40;
    const usableWidth = Math.max(100, w - reservedLeftForSize - rightPadding);
    const size = Math.min(
      usableWidth / n,
      (h - topPadding - bottomPadding) / n
    );
    const cx = leftPadding;

    // color scale using d3 interpolate (diverging)
    const color = (v) => {
      const t = (v + 1) / 2; // map -1..1 to 0..1
      return d3.interpolateRdBu(1 - t); // RdBu reversed so blue=positive red=negative
    };

    // draw cells
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
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
        rect.style.cursor = "default";
        rect.addEventListener("mouseenter", (e) => {
          showTooltip(e, `${header[i]} × ${header[j]}: ${v.toFixed(3)}`);
        });
        rect.addEventListener("mouseleave", hideTooltip);
        svg.appendChild(rect);
      }
    }

    // labels
    for (let i = 0; i < n; i++) {
      const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
      // top labels - rotated and centered above each column
      const topX = cx + i * size + size / 2;
      const topY = topPadding - 14; // move labels a bit higher
      // position via transform only so rotation pivots around the center
      tx.setAttribute("transform", `translate(${topX}, ${topY}) rotate(-55)`);
      tx.setAttribute("text-anchor", "middle");
      tx.setAttribute("fill", "#cbd5e1");
      tx.setAttribute("font-size", "10");
      tx.textContent = header[i];
      svg.appendChild(tx);

      const ty = document.createElementNS("http://www.w3.org/2000/svg", "text");
      ty.setAttribute("x", leftPadding - 18);
      ty.setAttribute("y", topPadding + i * size + size / 2 + 4);
      ty.setAttribute("text-anchor", "end");
      ty.setAttribute("fill", "#cbd5e1");
      ty.setAttribute("font-size", "11");
      ty.textContent = header[i];
      svg.appendChild(ty);
    }
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
      style={{
        width: "100%",
        height: lockedHeight ? `${lockedHeight}px` : "100%",
        position: "relative",
        overflow: "auto",
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

      {/* move controls after svg so they render on top of rotated labels */}
      <div
        style={{
          position: "absolute",
          // position within the container bounds (not outside with negative top)
          top: 1,
          right: 8,
          zIndex: 1000,
          color: "#cbd5e1",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0,0,0,0.25)",
          padding: "6px 8px",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        }}
      >
        <span style={{ marginRight: 6, fontSize: 13 }}>Top features:</span>
        <select
          value={n}
          onChange={(e) => setN(parseInt(e.target.value))}
          style={{
            marginLeft: 6,
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#fff",
            color: "#111",
          }}
        >
          <option value={5}>5</option>
          <option value={8}>8</option>
          <option value={10}>10</option>
        </select>
      </div>

      <div
        style={{
          position: "absolute",
          left: 8,
          bottom: 8,
          color: "#cbd5e1",
          fontSize: "0.8em",
        }}
      >
        Hover cells to see correlation value
      </div>
    </div>
  );
}

export default CorrelationMatrix;
