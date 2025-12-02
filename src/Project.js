import React, { useState, useEffect } from "react";
import WordCloudViz from "./components/WordCloudViz";
import CorrelationMatrix from "./components/CorrelationMatrix";
import InfoOverlay from "./InfoOverlay";
import "./project.css";
import Blob from "./components/blobTutorial";
import { Canvas } from "@react-three/fiber";
import { ReactComponent as BrainIcon } from "./resources/brain.svg";
import lowADBlob from "./resources/low_ad_blob.png";
import medADBlob from "./resources/med_ad_blob.png";
import highADBlob from "./resources/high_ad_blob.png";
import KnobSlider from "./components/gauge";
import PatientProfile from "./components/PatientProfile";
import CorrelationBiomarkerAD from "./components/CorrelationBiomarkerAD";

function Project() {
  // By fault the topmost section of the data visualization system will be open
  const [showTopSection, setShowTopSection] = useState(true);
  // By default the guage value will be 60, useState returns a funciton for setGuageValue
  const [gaugeValue, setGaugeValue] = useState(0);
  const [sliderValues, setSliderValues] = useState({});

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoData, setInfoData] = useState({ title: "", description: "" });

  const openInfo = (title, description) => {
    setInfoData({ title, description });
    setInfoOpen(true);
  };

  // This what will store the brain model prediction probabilities for different AD statuses
  const [brain_model_prediction, setBrainModelPrediction] = useState({
    "Normal": 0,
    "Prob AD": 0,
    "MCI": 0
  });

  // This will fetch brain model predictions based on the current gauge value
  useEffect(() => {  
      if (gaugeValue === null || gaugeValue === undefined) return;
      fetch("http://127.0.0.1:8000/brain_predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({"num_tokens": gaugeValue })
      })
      .then(res => res.json())
      .then(data => {
       setBrainModelPrediction({
        "Normal": data["Normal"],
        "Prob AD": data["Prob AD"],
        "MCI": data["MCI"]})
      })
      .catch(err => console.error("Error:", err));
  
  }, [gaugeValue]);

  return (
    <div className="full-dv-layout">
      <InfoOverlay
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={infoData.title}
        description={infoData.description}
      />
      <InfoOverlay
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={infoData.title}
        description={infoData.description}
      />
      {/* Background glow layer */}
      <div className="background-glow"></div>
      {/* Toggle Button - COMMENTED OUT */}
      {/* <button
        className="toggle-button"
        onClick={() => setShowTopSection(!showTopSection)}
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
      </button> */}

      {/* Left section - Vertical Heatmap */}
      <div className="left-section">
        <div>
          <div className="info-button"
              onClick={() =>
                openInfo(
                  "Linguistic Feature Impact on Biomarkers and AD Status",
                  "Use the sliders to adjust linguistic feature values. The heatmap shows how AD statuses relate to biomarker levels, while the blob visualization changes shape and color to reflect AD status based on the selected features."
                )
              }
          >i</div>
          <h1>Linguistic Feature Impact<br/>on Biomarkers and AD Status</h1>
          </div>
          <div className="left-components">
          <CorrelationBiomarkerAD sliderValues={sliderValues} setSliderValues={setSliderValues}/>
          <div className="blob"> 
            <Canvas camera = {{position: [0.0, 0.0, 8.0]}}>
              <Blob sliderValues={sliderValues} setSliderValues={setSliderValues}/>
            </Canvas>
            <div className= "blobLegend">
              <div className="blobLegendTitle"><h4>Alzheimer’s Disease Status</h4></div>
              <div className= "blobLegend1"><img src={lowADBlob}/><p>Normal</p></div>
              <div className= "blobLegend2"><img src={medADBlob}/><p>Prob AD</p></div>
              <div className= "blobLegend3"><img src={highADBlob}/><p>MCI</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right section - 3 cards top and Brain/Stats bottom */}
      <div className="right-section">
        {/* Top - Three cards */}
        <div className="top-3-cards">
          {/* Participant Profile Card */}
          <div className="participant-profile-card">
            <h1>Patient Profile</h1>
            <PatientProfile />
          </div>

          {/* Word Clouds Card */}
          <div className="word-cloud-card">
            <div className="word-cloud-card-content">
              <div className="word-cloud-card-header">
                <h1 className="word-cloud-card-title">Word Clouds</h1>
                <div
                  className="info-button"
                  onClick={() =>
                    openInfo(
                      "What is TF-IDF?",
                      "TF-IDF (Term Frequency-Inverse Document Frequency) measures how important words are to different groups. It shows linguistic patterns unique to each condition. Hover over words to see TF-IDF values.\n\nClick for more detailed explanations.\n\nNote: more saturated or darker ring segments indicate higher relative frequency/TF-IDF (stronger signal)."
                    )
                  }
                >
                  i
                </div>
              </div>
              <div className="word-cloud-visualization">
                <WordCloudViz />
              </div>
            </div>
          </div>

          {/* Correlation Matrix Card */}
          <div className="correlation-matrix-card">
            <div className="correlation-matrix-card-content">
              <div className="correlation-matrix-card-header">
                <h1 className="correlation-matrix-card-title">
                  Correlation Matrix
                </h1>
                <div
                  className="info-button"
                  onClick={() =>
                    openInfo(
                      "Correlation Matrix",
                      "These numbers show how two things move together. If a number is close to 1, those two measures tend to increase together. If it's close to -1, one increases while the other decreases. If it's near 0, there's no clear link. Bigger numbers (closer to 1 or -1) mean a stronger relationship. Hover over a cell to see its exact value.\n\nClick for a clearer example if you'd like to learn more.\n\nNote: deeper or more saturated colors indicate stronger correlations (values closer to -1 or +1)."
                    )
                  }
                >
                  i
                </div>
              </div>
              <div className="correlation-matrix-visualization">
                <CorrelationMatrix />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Brain and Stats */}
        <div className="brains_and_dials">
          <div>
            <h1>Relationship Between Conversation Length and AD Status</h1>
          </div>

          <div className="brains">
            <div className="dial">
              <KnobSlider value={gaugeValue} onChange={setGaugeValue} />
              <div>
                <p>Number of Tokens</p>
              </div>
            </div>
            <div className="brain1">
              <BrainIcon className="brain1" />
              <div className="brain1-prob">
                <p>{Math.round(gaugeValue / 0.32)}%</p>
              </div>
              <div>
                <p>AD Status: HC</p>
                <p>MoCA Range: 20-30</p>
              </div>
            </div>
            <div className="brain2">
              <BrainIcon className="brain2" />
              <div className="brain2-prob">
                <p>{Math.round(gaugeValue / 0.43)}%</p>
              </div>
              <div>
                <p>AD Status: MCI </p>
                <p>MoCA Range:10-20</p>
              </div>
            </div>
            <div className="brain3">
              <BrainIcon className="brain3" />
              <div className="brain3-prob">
                <p>{Math.round(gaugeValue / 0.4)}%</p>
              </div>
              <div>
                <p>AD Status: AD</p>
                <p>MoCA Range: 0-10</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;
