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
data_path = os.path.join(current_dir, 'C:\\Users\\nandi\\CS529\\Final_Project\\VDS_Final_Project\\public\\data.csv')

df = pd.read_csv(data_path)
print(df.columns)

# start with simple features
features_simple = [
    'tokens(participant)',
    'age',
    'gender',
    'educ'
]

X_simple = df[features_simple].copy()

X_simple = pd.get_dummies(X_simple, columns=['gender'], drop_first=True)
# AD status
y = df['DX1']

scaler = StandardScaler()
X_simple_scaled = scaler.fit_transform(X_simple)

# split for training and testing
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(
    X_simple_scaled, y, test_size=0.2, stratify=y, random_state=42
)

# logistic regression 
model_simple = LogisticRegression(
    multi_class='multinomial',
    solver='lbfgs',
    max_iter=1000,
    class_weight='balanced', 
    random_state=42
)

# model fit
model_simple.fit(X_train_s, y_train_s)

y_pred_s = model_simple.predict(X_test_s)
print("Simple Model")
print("Confusion Matrix:")
print(confusion_matrix(y_test_s, y_pred_s))
print("Classification Report:")
print(classification_report(y_test_s, y_pred_s))
coef_df_s = pd.DataFrame(model_simple.coef_, columns=X_simple.columns, index=model_simple.classes_)
print("Coefficients (simple):")
print(coef_df_s)

# expand features list to include more features than simple
features_expanded = [
    'tokens(participant)',
    'uniquetokens(participant)',
    'TTR(participant)',
    'MATTR(participant)',
    'VERB(participant)',
    'PROPN(participant)',
    'NUM(participant)',
    'AUX(participant)',
    'CCONJ(participant)',
    'AB40_LUMI',
    'AB42_LUMI',
    'P_TAU_LUMI',
    'T_TAU_LUMI',
    'AB42_AB40Ratio',
    'tTau_AB42Ratio',
    'pTau_AB42Ratio'
]

X_exp = df[features_expanded].copy()
X_exp_scaled = scaler.fit_transform(X_exp)

# split for training and testing
X_train_e, X_test_e, y_train_e, y_test_e = train_test_split(
    X_exp_scaled, y, test_size=0.2, stratify=y, random_state=42
)

# print("this is X_train_e", X_train_e)

# logistic regression
model_expanded = LogisticRegression(
    multi_class='multinomial',
    solver='lbfgs',
    max_iter=1000,
    class_weight='balanced',
    random_state=42
)

# fit the model
model_expanded.fit(X_train_e, y_train_e)

y_pred_e = model_expanded.predict(X_test_e)
print("\nExpanded Model")
print("Confusion Matrix:")
print(confusion_matrix(y_test_e, y_pred_e))
print("Classification Report:")
print(classification_report(y_test_e, y_pred_e))
coef_df_e = pd.DataFrame(model_expanded.coef_, columns=X_exp.columns, index=model_expanded.classes_)
print("Coefficients (expanded):")
print(coef_df_e)

# final report
print("\nTokens coefficient (simple model):")
print(coef_df_s[['tokens(participant)']])
print("Tokens coefficient (expanded model):")
print(coef_df_e[['tokens(participant)']])

# predicting probability
token_min = int(df['tokens(participant)'].min())
token_max = int(df['tokens(participant)'].max())
token_range = np.linspace(token_min, token_max, num=100)

typical_vals = {
    'uniquetokens(participant)': df['uniquetokens(participant)'].median(),
    'TTR(participant)': df['TTR(participant)'].median(),
    'MATTR(participant)': df['MATTR(participant)'].median(),
    'VERB(participant)': df['VERB(participant)'].median(),
    'PROPN(participant)': df['PROPN(participant)'].median(),
    'NUM(participant)': df['NUM(participant)'].median(),
    'AUX(participant)': df['AUX(participant)'].median(),
    'CCONJ(participant)': df['CCONJ(participant)'].median(),
    'AB40_LUMI': df['AB40_LUMI'].median(),
    'AB42_LUMI': df['AB42_LUMI'].median(),
    'P_TAU_LUMI': df['P_TAU_LUMI'].median(),
    'T_TAU_LUMI': df['T_TAU_LUMI'].median(),
    'AB42_AB40Ratio': df['AB42_AB40Ratio'].median(),
    'tTau_AB42Ratio': df['tTau_AB42Ratio'].median(),
    'pTau_AB42Ratio': df['pTau_AB42Ratio'].median()
}

print("Typical values for features (excluding tokens):")
print(typical_vals)

pred_rows = []
for t in token_range:
    row = {feat: typical_vals[feat] for feat in typical_vals}
    row['tokens(participant)'] = t
    pred_rows.append(row)
pred_df = pd.DataFrame(pred_rows)

pred_scaled = scaler.transform(pred_df[features_expanded])

probs = model_expanded.predict_proba(pred_scaled) 
# print("This is the output of model_expanded.predict_proba(pred_scaled):", probs)
probs_df = pd.DataFrame(probs, columns=model_expanded.classes_)
probs_df['tokens(participant)'] = token_range
# print("This is the output of model_expanded.predict_proba(pred_scaled):", probs_df)

# testing
# print(probs_df.head())


# import pickle
# pickle.dump(model_expanded, open("tokens_vs_ADstatus_analysis.pkl", "wb"))
# model = pickle.load(open("tokens_vs_ADstatus_analysis.pkl", "rb"))
# print(model.feature_names_in_)



feature_means_brain_model={
    "tokens(participant)": 632.0,
    "uniquetokens(participant)": 248.5,
    "TTR(participant)": 0.371693437, 
    "MATTR(participant)": 0.9897507465,
    "VERB(participant)": 75.8953488372093,
    "PROPN(participant)": 20.0,
    "NUM(participant)": 10.0,
    "AUX(participant)": 47.73255813953488,
    "CCONJ(participant)": 35.0,
    "AB40_LUMI": 11410.4,
    "AB42_LUMI": 788.0,
    "P_TAU_LUMI": 39.25,
    "T_TAU_LUMI": 316.5, 
    "AB42_AB40Ratio": 0.0866841479872977,
    "tTau_AB42Ratio": 0.3271804698034205,
    "pTau_AB42Ratio": 0.0385401194692728
  }

model_expanded_prediction = model_expanded.predict_proba(pd.DataFrame([feature_means_brain_model], columns=features_expanded))
print("Model expanded prediction on mean feature values:")
print(model_expanded_prediction)