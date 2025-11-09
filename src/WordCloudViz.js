import React, { useEffect, useState, useRef } from "react";
import cloud from "d3-cloud";
import * as d3 from "d3";
import "./App.css";

// Improved WordCloud using d3-cloud for layout
function WordCloudViz() {
  const [group, setGroup] = useState("Normal");
  const [useTfidf, setUseTfidf] = useState(true);
  const [maxWords, setMaxWords] = useState(40);
  const [words, setWords] = useState([]);
  const svgRef = useRef(null);
  const outerRef = useRef(null);
  const [lockedHeight, setLockedHeight] = useState(null);

  useEffect(() => {
    const path = `/tfidf_scores_${group.toLowerCase()}.csv`;
    fetch(path)
      .then((r) => r.text())
      .then((txt) => {
        const rows = txt.trim().split("\n").slice(1);
        const parsed = rows.map((r) => {
          const parts = r.split(",");
          const word = parts.slice(0, parts.length - 1).join(",");
          const tfidf = parts[parts.length - 1];
          return { word: word.replace(/"/g, ""), value: parseFloat(tfidf) };
        });
        setWords(parsed);
      })
      .catch((err) => {
        console.warn("Could not load TF-IDF CSV", err);
        setWords([]);
      });
  }, [group, useTfidf]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || words.length === 0) return;

    const width = svgEl.clientWidth;
    const height = svgEl.clientHeight;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const slice = words.slice(0, Math.min(maxWords, words.length));
    const values = slice.map((d) => d.value);
    const vmin = Math.min(...values);
    const vmax = Math.max(...values);

    // map tf-idf to font size
    const fontSize = (d) => 12 + ((d.value - vmin) / (vmax - vmin + 1e-9)) * 48;

    const layout = cloud()
      .size([width, height])
      .words(
        slice.map((d) => ({ text: d.word, value: d.value, size: fontSize(d) }))
      )
      .padding(4)
      .rotate(() =>
        Math.random() > 0.85 ? (Math.random() > 0.5 ? 90 : -45) : 0
      )
      .font("Impact")
      .fontSize((d) => d.size)
      .on("end", draw);

    layout.start();

    function draw(wordsLayout) {
      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      g.selectAll("text")
        .data(wordsLayout)
        .enter()
        .append("text")
        .style("font-family", "Impact")
        .style("font-size", (d) => `${d.size}px`)
        .style(
          "fill",
          (d) => (group === "Normal" ? d3.interpolateBlues(d.value) : "#e63946") // use a clear red for Impaired
        )
        .attr("text-anchor", "middle")
        .attr(
          "transform",
          (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
        )
        .text((d) => d.text)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this).style("font-weight", "700").style("fill", "#fff");
          showTooltip(event, `${d.text} — ${d.value.toFixed(3)}`);
        })
        .on("mouseleave", function (event, d) {
          d3.select(this)
            .style("font-weight", "400")
            .style("fill", (d) =>
              group === "Normal" ? d3.interpolateBlues(d.value) : "#e63946"
            );
          hideTooltip();
        })
        .on("click", (event, d) => {
          showPersistentInfo(d);
        });
    }

    let tip = null;
    function showTooltip(e, text) {
      if (!tip) {
        tip = document.createElement("div");
        tip.id = "wordcloud-tooltip";
        tip.style.position = "fixed";
        tip.style.padding = "6px 8px";
        tip.style.background = "rgba(0,0,0,0.85)";
        tip.style.color = "#fff";
        tip.style.borderRadius = "6px";
        tip.style.pointerEvents = "none";
        // ensure tooltip appears above SVG/text elements
        tip.style.zIndex = 10000;
        tip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
        tip.style.whiteSpace = "nowrap";
        tip.style.maxWidth = "360px";
        tip.style.overflow = "hidden";
        tip.style.textOverflow = "ellipsis";
        document.body.appendChild(tip);
      }
      tip.textContent = text;
      // place tooltip slightly above the mouse so it doesn't sit under the hovered word
      tip.style.left = e.pageX + 12 + "px";
      tip.style.top = e.pageY - 28 + "px";
      tip.style.display = "block";
    }

    function hideTooltip() {
      const el = document.getElementById("wordcloud-tooltip");
      if (el) el.style.display = "none";
    }

    function showPersistentInfo(datum) {
      // clarify what the shown score represents (TF-IDF when enabled)
      const label = useTfidf ? "TF-IDF score" : "score";
      alert(`${datum.text}\n${label}: ${datum.value.toFixed(4)}`);
    }

    // cleanup on unmount
    return () => {
      svg.selectAll("*").remove();
      const el = document.getElementById("wordcloud-tooltip");
      if (el) el.remove();
    };
  }, [words, maxWords, group, useTfidf]);

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
      style={{
        width: "100%",
        height: lockedHeight ? `${lockedHeight}px` : "100%",
        position: "relative",
        overflow: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 5,
          display: "flex",
          gap: "0.5em",
          alignItems: "center",
        }}
      >
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          style={{ padding: "0.3em", borderRadius: 8 }}
        >
          <option>Normal</option>
          <option>Impaired</option>
        </select>
        <label style={{ color: "#cbd5e1", fontSize: "0.85em" }}>
          <input
            type="checkbox"
            checked={useTfidf}
            onChange={(e) => setUseTfidf(e.target.checked)}
          />{" "}
          Use TF-IDF
        </label>
        <label style={{ color: "#cbd5e1", fontSize: "0.85em" }}>
          Max
          <input
            type="range"
            min="10"
            max="80"
            value={maxWords}
            onChange={(e) => setMaxWords(parseInt(e.target.value))}
            style={{ marginLeft: 6 }}
          />
        </label>
      </div>

      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: lockedHeight ? `${lockedHeight}px` : "100%",
          display: "block",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 8,
          bottom: 8,
          color: "#cbd5e1",
          fontSize: "0.8em",
        }}
      >
        Tip: hover words for details — click for more info
      </div>
    </div>
  );
}

export default WordCloudViz;
