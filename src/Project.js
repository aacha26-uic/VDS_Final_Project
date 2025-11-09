import React, { useState } from "react";
import "./App.css";
import WordCloudViz from "./WordCloudViz";
import CorrelationMatrix from "./CorrelationMatrix";

function Project() {
  const [showTopSection, setShowTopSection] = useState(true);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        padding: "0.5em",
        display: "flex",
        gap: "0.5em",
        boxSizing: "border-box",
        fontFamily: "'Poppins', sans-serif",
        background:
          "radial-gradient(circle at 20% 20%, #0f172a 0%, #1e293b 60%, #0a0a0a 100%)",
        color: "#f1f5f9",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 💫 Background glow layer */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "20%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
          filter: "blur(90px)",
          zIndex: 0,
          animation: "pulse 6s infinite alternate",
        }}
      ></div>

      {/* Toggle Button */}
      <button
        onClick={() => setShowTopSection(!showTopSection)}
        style={{
          position: "absolute",
          top: "0.75em",
          right: "0.75em",
          zIndex: 10,
          padding: "0.3em 0.6em",
          borderRadius: "10px",
          background:
            "linear-gradient(120deg, rgba(59,130,246,0.5), rgba(147,51,234,0.4))",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#bfdbfe",
          fontWeight: 600,
          fontSize: "0.8em",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = "0 6px 15px rgba(59,130,246,0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
        }}
      >
        {showTopSection ? "Hide Analysis ▲" : "Show Analysis ▼"}
      </button>

      {/* Left section - Vertical Heatmap */}
      <div
        style={{
          width: "25%",
          height: "100%",
          borderRadius: "25px",
          background:
            "linear-gradient(180deg, rgba(30,58,138,0.4), rgba(17,24,39,0.3))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3
            style={{ color: "#93c5fd", fontWeight: 600, marginBottom: "0.5em" }}
          >
            🔥 Correlation Heatmaps
          </h3>
          <p style={{ color: "#cbd5e1", fontSize: "0.9em" }}>
            with Sliders and MoCA Score Visual Aspects
          </p>
        </div>
      </div>

      {/* Right section - Brain/Stats top and 3 cards bottom */}
      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.5em",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Top - Brain and Stats */}
        {showTopSection && (
          <div
            style={{
              height: "45%",
              width: "100%",
              borderRadius: "25px",
              background:
                "linear-gradient(120deg, rgba(30,64,175,0.4), rgba(147,51,234,0.3))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  color: "#bfdbfe",
                  fontWeight: 600,
                  marginBottom: "0.3em",
                }}
              >
                🧠 Brain Encoding Dials
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9em" }}>
                Linguistic Features vs AD Status
              </p>
            </div>
          </div>
        )}

        {/* Bottom - Three cards */}
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            gap: "0.5em",
          }}
        >
          {/* Participant Profile Card */}
          <div
            style={{
              flex: 1,
              borderRadius: "25px",
              background:
                "linear-gradient(120deg, rgba(22,163,74,0.35), rgba(34,197,94,0.2))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5em",
              overflow: "hidden",
            }}
          >
            <h4
              style={{ margin: "0.5em 0", color: "#bbf7d0", fontWeight: 600 }}
            >
              👤 Participant Profile
            </h4>
            <p
              style={{
                margin: "0.25em 0",
                fontSize: "0.9em",
                color: "#d1fae5",
              }}
            >
              Linguistic Features
            </p>
          </div>

          {/* Word Clouds Card */}
          <div
            style={{
              flex: 1,
              borderRadius: "25px",
              background:
                "linear-gradient(120deg, rgba(59,130,246,0.35), rgba(30,64,175,0.25))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5em",
              overflow: "hidden",
            }}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <h4
                style={{ margin: "0.5em 0", color: "#bfdbfe", fontWeight: 600 }}
              >
                ☁️ Word Clouds
              </h4>
              <p
                style={{
                  margin: "0.25em 0",
                  fontSize: "0.9em",
                  color: "#dbeafe",
                }}
              >
                Topic Distribution by AD Group
              </p>
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  height: "calc(100% - 56px)",
                  paddingTop: "0.5em",
                }}
              >
                <WordCloudViz />
              </div>
            </div>
          </div>

          {/* Correlation Matrix Card */}
          <div
            style={{
              flex: 1,
              borderRadius: "25px",
              background:
                "linear-gradient(120deg, rgba(88,28,135,0.35), rgba(147,51,234,0.25))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5em",
              overflow: "hidden",
            }}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <h4
                style={{ margin: "0.5em 0", color: "#c084fc", fontWeight: 600 }}
              >
                📊 Correlation Matrix
              </h4>
              <p
                style={{
                  margin: "0.25em 0",
                  fontSize: "0.9em",
                  color: "#e9d5ff",
                }}
              >
                Feature-Biomarker Trends
              </p>
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  height: "calc(100% - 56px)",
                  paddingTop: "0.5em",
                }}
              >
                <CorrelationMatrix />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;
