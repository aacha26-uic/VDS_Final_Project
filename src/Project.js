import React, { useState } from "react";
import "./App.css";
import "./project.css"; 
import Blob from "./components/blobTutorial";
import { Canvas } from "@react-three/fiber";
import { ReactComponent as BrainIcon } from './resources/brain.svg';
import lowADBlob from './resources/low_ad_blob.png';
import medADBlob from './resources/med_ad_blob.png';
import highADBlob from './resources/high_ad_blob.png';
import KnobSlider from "./components/gauge";
import PatientProfile from "./components/PatientProfile";
import CorrelationBiomarkerAD from "./components/CorrelationBiomarkerAD";
        

function Project() {
  // By fault the topmost section of the data visualization system will be open
  const [showTopSection, setShowTopSection] = useState(true);
  // By default the guage value will be 60, useState returns a funciton for setGuageValue
  const [gaugeValue, setGaugeValue] = useState(60); 

  return (
    <div className="full-dv-layout">
      {/* Background glow layer */}
      <div className="background-glow"></div>
      {/* Toggle Button */}
      <button className="toggle-button"
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
      </button>

      {/* Left section - Vertical Heatmap */}
      <div className="left-section">
        <div style={{ margin: "0px", padding: "10px 0 0 0" }}>
          <h4
            style={{
              color: "black",
              margin: "0px",          
              padding: "0px", 
              lineHeight: "1.2",
              textAlign: "center"
            }}
          >
            CORRELATIONS B/W BIOMARKERS & AD STATUS
          </h4>
        </div>
        <CorrelationBiomarkerAD/>
        <div className="blob"> 
          <Canvas camera = {{position: [0.0, 0.0, 8.0]}}>
            <Blob score = {29}/>
          </Canvas>
          <div className= "blobLegend">
            <div className= "blobLegend1"><img src={lowADBlob}/><p>HC</p></div>
            <div className= "blobLegend2"><img src={medADBlob}/><p>MCI</p></div>
            <div className= "blobLegend3"><img src={highADBlob}/><p>AD</p></div>
          </div>
        </div>
      </div>

      {/* Right section - Brain/Stats top and 3 cards bottom */}
      <div className="right-section">
        {/* Top - Brain and Stats */}
        {showTopSection && (
          <div className="brains_and_dials" >
            <div>
              <h1>Relationship Between Conversation Length and AD Status</h1>
            </div>

            <div className="brains">
              <div className="brain1">
                <BrainIcon className="brain1" />
                <div className= "brain1-prob">
                  <p >{Math.round(gaugeValue/0.32)}%</p>
                </div>
                <div>
                  <p>AD Status: HC</p>
                  <p>MoCA Range: 20-30</p>
                </div>
                
              </div>
              <div className="brain2">
                <BrainIcon className="brain2" />
                <div className= "brain2-prob">
                  <p >{Math.round(gaugeValue/0.43)}%</p>
                </div>
                <div>
                  <p>AD Status: MCI </p>
                  <p>MoCA Range:10-20</p>
                </div>
              </div>
              <div className="brain3">
                <BrainIcon className="brain3" />
                <div className= "brain3-prob">
                  <p>{Math.round(gaugeValue/0.4)}%</p>
                </div>
                <div>
                  <p>AD Status: AD</p>
                  <p>MoCA Range: 0-10</p>
                </div>
              </div>
              <div className="dial"> 
                <KnobSlider value={gaugeValue} onChange={setGaugeValue} />
                <div>
                  <p>Number of Tokens</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom - Three cards */}
        <div className="bottom-3-cards">

          {/* Participant Profile Card */}
          <div className="participant-profile-card">
            <h4 style={{color: "black"}}>PATIENT PROFILE</h4>
            <PatientProfile/>
          </div>

          {/* Word Clouds Card */}
          <div className="word-cloud-card">
            <h4>☁️ Word Clouds</h4>
            <p>Topic Distribution by AD Group</p>
          </div>

          {/* Correlation Matrix Card */}
          <div className="correlation-matrix-card">
            <h4>📊 Correlation Matrix</h4>
            <p>Feature-Biomarker Trends</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;
