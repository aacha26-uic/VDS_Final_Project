import React from "react";
import "./App.css";
import "./Project.css";
import Project from "./Project";

function App() {
  return (
    <div className="App" style={{ margin: 0, padding: 0 }}>
      <div
        className={"header"}
        style={{
          height: "2em",
          width: "100vw",
          background:
            "radial-gradient(circle at 20% 20%, #0f172a 0%, #1e293b 60%, #0a0a0a 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
          padding: "0 0.5em",
          boxSizing: "border-box",
          margin: 0,
        }}
      >
        <h2 style={{ color: "white", margin: 0, fontSize: "1.2em" }}>
          Visualizing Speech and Biomarker Correlations in Alzheimer's Disease
        </h2>
      </div>
      <div
        className={"body"}
        style={{
          height: "calc(100vh - 2em)",
          width: "100vw",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <Project />
      </div>
    </div>
  );
}

export default App;
