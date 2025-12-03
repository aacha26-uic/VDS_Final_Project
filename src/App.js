import React, { useState, useEffect } from "react";
import "./App.css";
import "./project.css";
import Project from "./Project";
import InfoOverlay from "./InfoOverlay";

function App() {

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoData, setInfoData] = useState({ title: "", description: "" });

  const openInfo = (title, description) => {
    setInfoData({ title, description });
    setInfoOpen(true);
  };


  return (
    <div className="App" style={{ margin: 0, padding: 0 }}>
      <InfoOverlay
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={infoData.title}
        description={infoData.description}
      />
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
          justifyContent: "center",
          gap: "0.5em",
          padding: "0 0.5em",
          boxSizing: "border-box",
          margin: 0,
        }}
      >
        <div className="main-info-button"
              onClick={() =>
                openInfo(
                  "Visualizing Speech and Biomarker Correlations in Alzheimer's Disease",
                  ""
                )
              }
        >Learn More</div>
        <h2 style={{ color: "white", margin: 0, fontSize: "1.5em", backgroundColor: "rgba(255, 0, 0, 0)" }}>
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
