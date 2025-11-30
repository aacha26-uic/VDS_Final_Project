import React from "react";
import "./project.css";

export default function InfoOverlay ({isOpen, onClose, title, description}){
    if (!isOpen) return null;

    return (
        <div className="info-overlay">
            <div className="info-modal">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );
};