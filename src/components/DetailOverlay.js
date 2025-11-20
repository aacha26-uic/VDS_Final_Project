import React, { useEffect } from "react";

function DetailOverlay({ data, onClose }) {
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

  const { word, condition, frequency, allFrequencies } = data;

  return (
    <div className="detail-overlay-backdrop" onClick={onClose}>
      <div
        className="detail-overlay-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-overlay-header">
          <h3>Word Analysis: "{word}"</h3>
          <button className="detail-overlay-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-overlay-body">
          {condition === "all" ? (
            <div>
              <div className="detail-section">
                <h4>Frequency Distribution Across Conditions</h4>
                <div className="frequency-breakdown">
                  <div className="frequency-item hc">
                    <div className="frequency-label">
                      <span className="condition-indicator hc"></span>
                      HC (Healthy Control)
                    </div>
                    <div className="frequency-value">
                      {allFrequencies.hc.toFixed(4)}
                    </div>
                    <div className="frequency-bar">
                      <div
                        className="frequency-fill hc"
                        style={{
                          width: `${
                            (allFrequencies.hc /
                              Math.max(
                                allFrequencies.hc,
                                allFrequencies.mci,
                                allFrequencies.ad
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="frequency-item mci">
                    <div className="frequency-label">
                      <span className="condition-indicator mci"></span>
                      MCI (Mild Cognitive Impairment)
                    </div>
                    <div className="frequency-value">
                      {allFrequencies.mci.toFixed(4)}
                    </div>
                    <div className="frequency-bar">
                      <div
                        className="frequency-fill mci"
                        style={{
                          width: `${
                            (allFrequencies.mci /
                              Math.max(
                                allFrequencies.hc,
                                allFrequencies.mci,
                                allFrequencies.ad
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="frequency-item ad">
                    <div className="frequency-label">
                      <span className="condition-indicator ad"></span>
                      AD (Alzheimer's Disease)
                    </div>
                    <div className="frequency-value">
                      {allFrequencies.ad.toFixed(4)}
                    </div>
                    <div className="frequency-bar">
                      <div
                        className="frequency-fill ad"
                        style={{
                          width: `${
                            (allFrequencies.ad /
                              Math.max(
                                allFrequencies.hc,
                                allFrequencies.mci,
                                allFrequencies.ad
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>How These Values Were Calculated</h4>
                <p>
                  These frequencies represent the normalized TF-IDF (Term
                  Frequency-Inverse Document Frequency) scores for the word "
                  <strong>{word}</strong>" across different patient groups.
                </p>
                <ul>
                  <li>
                    <strong>TF-IDF</strong> measures how important a word is to
                    a document relative to a collection of documents
                  </li>
                  <li>
                    <strong>Higher values</strong> indicate the word appears
                    more frequently and distinctively in that condition group
                  </li>
                  <li>
                    <strong>Values range from 0 to 1</strong>, normalized across
                    all words in the dataset
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="detail-section">
                <h4>Condition: {condition.toUpperCase()}</h4>
                <div className="single-frequency">
                  <div className="frequency-value-large">
                    {frequency.toFixed(4)}
                  </div>
                  <div className="frequency-explanation">
                    TF-IDF Score for "{word}" in {condition.toUpperCase()} group
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Context & Comparison</h4>
                <div className="comparison-grid">
                  <div className="comparison-item">
                    <span className="comparison-label">HC:</span>
                    <span className="comparison-value">
                      {allFrequencies.hc.toFixed(4)}
                    </span>
                  </div>
                  <div className="comparison-item">
                    <span className="comparison-label">MCI:</span>
                    <span className="comparison-value">
                      {allFrequencies.mci.toFixed(4)}
                    </span>
                  </div>
                  <div className="comparison-item">
                    <span className="comparison-label">AD:</span>
                    <span className="comparison-value">
                      {allFrequencies.ad.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Interpretation</h4>
                <p>
                  This word appears{" "}
                  {frequency > 0.1
                    ? "frequently"
                    : frequency > 0.05
                    ? "moderately"
                    : "infrequently"}{" "}
                  in the {condition.toUpperCase()} group's speech patterns.
                </p>
                <p>
                  The TF-IDF methodology helps identify words that are
                  characteristic of specific patient groups in Alzheimer's
                  disease research.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailOverlay;
