import React, { useEffect } from "react";
import "./project.css";
export default function InfoOverlay({ isOpen, onClose, title, description }) {
  // Keep hooks at top-level; guard logic inside effect so hooks aren't called conditionally
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="info-overlay">
      <div
        className="info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="infoModalTitle"
      >
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close info dialog"
        >
          ×
        </button>
        <h2 id="infoModalTitle">{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
