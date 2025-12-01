# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import json
import pickle
import numpy as np
import pandas as pd

model = pickle.load(open("model.pkl", "rb"))
blob_model = pickle.load(open("linguisticFeatures_vs_ADstatus.pkl", "rb"))

with open("metadata.json", "r") as f:
    meta = json.load(f)

BIOMARKERS = meta["biomarkers"]
LINGUISTIC = meta["linguistic"]
FEATURE_MEANS = meta["feature_means"]
LABEL_MAP = meta["label_map"]

GROUPS = ["Normal", "MCI", "Prob AD"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SliderInput(BaseModel):
    sliders: Dict[str, float]

def compute_probabilities(sliders):    
    row = {}

    for b in BIOMARKERS:
        row[b] = FEATURE_MEANS[b]

    for f in LINGUISTIC:
        row[f] = sliders.get(f, FEATURE_MEANS[f])

    x_vec = np.array([row[c] for c in BIOMARKERS + LINGUISTIC]).reshape(1, -1)

    probs = model.predict_proba(x_vec)[0]

    return {
        "Normal": float(probs[0]),
        "MCI": float(probs[1]),
        "Prob AD": float(probs[2]),
    }


def correlation_matrix(probabilities):
    matrix = []
    for b in BIOMARKERS:
        for g in GROUPS:
            matrix.append({
                "biomarker": b,
                "group": g,
                "value": probabilities[g]
            })
    return matrix

@app.post("/predict")
def predict(input_data: SliderInput):
    sliders = input_data.sliders
    probs = compute_probabilities(sliders)
    matrix = correlation_matrix(probs)
    return matrix


@app.post("/blob_predict")
def get_blob_model(input_data: SliderInput):
    try:
        # Slider Input is a dictionary of feature names to values (str: float)
        # blob model predicts whether a person has AD based on linguistic features only. Output is 0, 1, or 2 corresponding to Normal, MCI, Prob AD
        # The features must be in the same order as the model was trained on
        feature_order = ['AUX(participant)', 'CCONJ(participant)', 'NUM(participant)',
                        'PROPN(participant)', 'VERB(participant)', 'TTR(participant)',
                        'MATTR(participant)']
        features_df = pd.DataFrame([input_data.sliders], columns=feature_order)

        model_prediction = blob_model.predict(features_df)[0]
        if model_prediction not in [0, 1, 2]:
            return {"Error": "Model prediction out of expected range."}
        prediction = GROUPS[model_prediction] 
        output = {"prediction": prediction, "prediction_value": int(model_prediction)}
        return output
    except Exception as e:
        return {"Error": str(e)}



