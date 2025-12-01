# This file will be used to analyze Number of tokens vs AD Status (3 separately) 

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
import os

# load the cleaned dataset
current_dir = os.path.dirname(__file__)
data_path = os.path.join(current_dir, 'data.csv')

df = pd.read_csv(data_path)
print(df.columns)

# target column and token column
token_col = "tokens(participant)"
target_col = "DX1"

X = df[[token_col]].copy()
y = df[[target_col]]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# split for training and testing
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(
    X_scaled, y, test_size=0.2, stratify=y, random_state=42
)

# logistic regression 
model = LogisticRegression(
    multi_class='multinomial',
    solver='lbfgs',
    max_iter=1000,
    class_weight='balanced', 
    random_state=42
)

# model fit
model.fit(X_train_s, y_train_s)

y_pred_s = model.predict(X_test_s)
print("Confusion Matrix:")
print(confusion_matrix(y_test_s, y_pred_s))
print("Classification Report:")
print(classification_report(y_test_s, y_pred_s))
coef_df = pd.DataFrame(model.coef_, columns=X.columns, index=model.classes_)
print("Coefficients:")
print(coef_df)

token_min = int(df[token_col].min())
token_max = int(df[token_col].max())

token_range = np.linspace(token_min, token_max, num=100)

token_df =  pd.DataFrame({token_col: token_range})
token_scaled = scaler.transform(token_df[[token_col]])

probs = model.predict_proba(token_scaled)

probs_df = pd.DataFrame(probs, columns=model.classes_)
probs_df[token_col] = token_range

print("\nProbability of AD groups based on tokens")
print(probs_df.head())


# import pickle
# pickle.dump(model_expanded, open("tokens_vs_ADstatus_analysis.pkl", "wb"))
# model = pickle.load(open("tokens_vs_ADstatus_analysis.pkl", "rb"))
# print(model.feature_names_in_)



# feature_means_brain_model={
#     "uniquetokens(participant)": 248.5,
#     "TTR(participant)": 0.371693437, 
#     "MATTR(participant)": 0.9897507465,
#     "VERB(participant)": 75.8953488372093,
#     "PROPN(participant)": 20.0,
#     "NUM(participant)": 10.0,
#     "AUX(participant)": 47.73255813953488,
#     "CCONJ(participant)": 35.0,
#     "AB40_LUMI": 11410.4,
#     "AB42_LUMI": 788.0,
#     "P_TAU_LUMI": 39.25,
#     "T_TAU_LUMI": 316.5, 
#     "AB42_AB40Ratio": 0.0866841479872977,
#     "tTau_AB42Ratio": 0.3271804698034205,
#     "pTau_AB42Ratio": 0.0385401194692728
# }