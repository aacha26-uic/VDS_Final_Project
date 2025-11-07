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
    'age',
    'gender',
    'educ',
    'AB40_LUMI',
    'AB42_LUMI',
    'P_TAU_LUMI',
    'T_TAU_LUMI',
    'AB42_AB40Ratio',
    'tTau_AB42Ratio',
    'pTau_AB42Ratio'
]

X_exp = df[features_expanded].copy()
X_exp = pd.get_dummies(X_exp, columns=['gender'], drop_first=True)
X_exp_scaled = scaler.fit_transform(X_exp)

# split for training and testing
X_train_e, X_test_e, y_train_e, y_test_e = train_test_split(
    X_exp_scaled, y, test_size=0.2, stratify=y, random_state=42
)

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