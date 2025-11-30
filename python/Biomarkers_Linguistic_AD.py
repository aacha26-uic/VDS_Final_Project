import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
import json
import pickle

BIOMARKERS = [
    { "key": "tTau_AB42Ratio", "label": "CSF1" },
    { "key": "AB42_AB40Ratio", "label": "CSF2" },
    { "key": "P_TAU_LUMI", "label": "Plasma" }
]

LINGUISTIC = [
    "AUX(participant)", "VERB(participant)", "CCONJ(participant)",
    "NUM(participant)", "PROPN(participant)", "TTR(participant)", "MATTR(participant)"
]
GROUPS = ["Normal", "MCI", "Prob AD"]
LABEL_MAP = {"Normal": 0, "MCI": 1, "Prob AD": 2}

BIOMARKER_KEYS = [b["key"] for b in BIOMARKERS]

def load_data():
    df = pd.read_csv("../public/data.csv")
    columms = BIOMARKER_KEYS + LINGUISTIC + ["DX1"]
    df = df.dropna(subset=columms)
    df["y"] = df["DX1"].map(LABEL_MAP)
    return df

def train_model(df):
    feature_cols = BIOMARKER_KEYS + LINGUISTIC
    X = df[feature_cols].values
    y = df["y"].values

    model = LogisticRegression(multi_class="multinomial", solver="lbfgs", max_iter=2000)
    model.fit(X, y)

    return model

if __name__ == "__main__":
    df = load_data()
    model = train_model(df)

    pickle.dump(model, open("model.pkl", "wb"))

    # save metadata (needed by server)
    metadata = {
        "biomarkers": BIOMARKER_KEYS,
        "linguistic": LINGUISTIC,
        "label_map": LABEL_MAP,
        "feature_means": {col: float(df[col].mean()) for col in BIOMARKER_KEYS + LINGUISTIC}
    }

    with open("metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("Training finished.")
    print("Saved model.pkl and metadata.json")