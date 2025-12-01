# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import json
import pickle
import numpy as np

model = pickle.load(open("model.pkl", "rb"))

with open("metadata.json", "r") as f:
    meta = json.load(f)

BIOMARKERS = meta["biomarkers"]
LINGUISTIC = meta["linguistic"]
FEATURE_MEANS = meta["feature_means"]
LABEL_MAP = meta["label_map"]

GROUPS = ["Normal", "Prob AD", "MCI"]

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
        "Prob AD": float(probs[1]),
        "MCI": float(probs[2]),
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