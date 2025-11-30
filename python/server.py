from fastapi import FastAPI
import joblib
import numpy as np

model = joblib.load("logistic_regression_model.joblib")

class_names = ['HC', 'AD', 'MCI']

app = FastAPI()

@app.get("/")

def read_root():
    return {"message": "Welcome to the Classification API"}

@app.post("/predict_blobStatus/")
def predict_blobStatus(features: list):
    features_array = np.array(features).reshape(1, -1)
    prediction = model.predict(features_array)
    class_name = class_names[int(prediction[0])]
    return {"prediction": class_name}