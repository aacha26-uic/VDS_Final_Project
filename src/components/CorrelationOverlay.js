import React, { useEffect } from "react";

function CorrelationOverlay({ data, onClose }) {
  // Close overlay on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!data) return null;

  const { variable1, variable2, correlation, pValue } = data;

  // Determine correlation strength
  const absCorr = Math.abs(correlation);
  let strength, description, color;

  if (absCorr >= 0.7) {
    strength = "High";
    description = "Strong relationship";
    color = "#d32f2f";
  } else if (absCorr >= 0.3) {
    strength = "Medium";
    description = "Moderate relationship";
    color = "#f57c00";
  } else {
    strength = "Low";
    description = "Weak relationship";
    color = "#388e3c";
  }

  const direction = correlation > 0 ? "Positive" : "Negative";

  return (
    <div className="correlation-overlay-backdrop" onClick={onClose}>
      <div
        className="correlation-overlay-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="correlation-overlay-header">
          <h3>Correlation Analysis</h3>
          <button className="correlation-overlay-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="correlation-overlay-body">
          <div className="correlation-section">
            <h4>Variables</h4>
            <div className="variable-pair">
              <div className="variable">{variable1}</div>
              <div className="correlation-arrow">↔</div>
              <div className="variable">{variable2}</div>
            </div>
          </div>

          <div className="correlation-section">
            <h4>Correlation Value</h4>
            <div className="correlation-value-display">
              <div className="correlation-number" style={{ color }}>
                {correlation.toFixed(4)}
              </div>
              <div className="correlation-strength">
                <span className={`strength-badge ${strength.toLowerCase()}`}>
                  {strength} {direction} Correlation
                </span>
              </div>
            </div>
          </div>

          <div className="correlation-section">
            <h4>Interpretation</h4>
            <div className="interpretation">
              <p>
                This correlation coefficient indicates a{" "}
                <strong>{description.toLowerCase()}</strong> between {variable1}{" "}
                and {variable2}.
              </p>
              <p>
                {direction === "Positive"
                  ? "As one variable increases, the other tends to increase as well."
                  : "As one variable increases, the other tends to decrease."}
              </p>
              {pValue && (
                <p>
                  <strong>Statistical Significance:</strong> p-value ={" "}
                  {pValue.toFixed(4)}
                  {pValue < 0.05
                    ? " (statistically significant)"
                    : " (not statistically significant)"}
                </p>
              )}
            </div>
          </div>

          <div className="correlation-section">
            <h4>Calculation Method</h4>
            <div className="methodology">
              <p>
                The correlation coefficient was calculated using Pearson's
                correlation formula:
              </p>
              <div className="formula">
                r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)²Σ(yi - ȳ)²]
              </div>
              <p>
                This measures the linear relationship strength between the two
                variables on a scale from -1 to +1.
              </p>
            </div>
          </div>

          <div className="correlation-section">
            <h4>Strength Guide</h4>
            <div className="strength-guide">
              <div className="strength-item">
                <span className="strength-range high">0.7 - 1.0</span>
                <span className="strength-desc">Strong correlation</span>
              </div>
              <div className="strength-item">
                <span className="strength-range medium">0.3 - 0.7</span>
                <span className="strength-desc">Moderate correlation</span>
              </div>
              <div className="strength-item">
                <span className="strength-range low">0.0 - 0.3</span>
                <span className="strength-desc">Weak correlation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CorrelationOverlay;
