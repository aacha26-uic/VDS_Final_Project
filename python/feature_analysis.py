"""
Feature Analysis and ML Prediction for Alzheimer's Disease
============================================================
This script performs:
1. Data cleaning and preprocessing from Excel files
2. Feature importance analysis to identify top predictive features
3. Correlation matrix computation
4. ML model training for AD prediction
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# 1. DATA LOADING AND CLEANING
# ============================================================================

def load_and_clean_data():
    """
    Load Excel files and perform initial cleaning
    """
    print("=" * 70)
    print("STEP 1: Loading and Cleaning Data")
    print("=" * 70)
    
    # Load the data files
    try:
        demographic = pd.read_excel('../demographic(1).xlsx')
        full_data = pd.read_excel('../fullData(1).xlsx')
        linguistic = pd.read_excel('../linguistic_outcomes.xlsx')
        utterance = pd.read_excel('../utterance_data.xlsx')
        
        print(f"✓ Demographic data: {demographic.shape}")
        print(f"✓ Full data: {full_data.shape}")
        print(f"✓ Linguistic outcomes: {linguistic.shape}")
        print(f"✓ Utterance data: {utterance.shape}")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please ensure all Excel files are in the parent directory")
        return None
    
    # Display column names for understanding
    print("\n--- Demographic Columns ---")
    print(demographic.columns.tolist())
    
    print("\n--- Full Data Columns ---")
    print(full_data.columns.tolist()[:20], "... (showing first 20)")
    
    print("\n--- Linguistic Columns ---")
    print(linguistic.columns.tolist())
    
    # Check for missing values
    print("\n--- Missing Values Summary ---")
    print(f"Demographic: {demographic.isnull().sum().sum()} total missing")
    print(f"Full Data: {full_data.isnull().sum().sum()} total missing")
    print(f"Linguistic: {linguistic.isnull().sum().sum()} total missing")
    
    return {
        'demographic': demographic,
        'full_data': full_data,
        'linguistic': linguistic,
        'utterance': utterance
    }


def merge_and_prepare_data(data_dict):
    """
    Merge datasets and prepare for ML analysis
    """
    print("\n" + "=" * 70)
    print("STEP 2: Merging and Preparing Data")
    print("=" * 70)
    
    # Identify common key columns (usually participant ID)
    # Adjust based on actual column names
    demographic = data_dict['demographic']
    full_data = data_dict['full_data']
    linguistic = data_dict['linguistic']
    
    # Merge datasets (adjust merge keys based on actual data)
    # This is a template - modify based on your actual column names
    try:
        # Example merge - adjust column names as needed
        merged_data = full_data.copy()
        
        print(f"✓ Merged dataset shape: {merged_data.shape}")
        
        # Remove rows with excessive missing values
        threshold = 0.5  # Remove rows with >50% missing
        merged_data = merged_data.dropna(thresh=int(threshold * merged_data.shape[1]))
        print(f"✓ After removing sparse rows: {merged_data.shape}")
        
        # Fill remaining missing values with median for numeric columns
        numeric_cols = merged_data.select_dtypes(include=[np.number]).columns
        merged_data[numeric_cols] = merged_data[numeric_cols].fillna(
            merged_data[numeric_cols].median()
        )
        
        print(f"✓ Missing values handled")
        
        return merged_data
        
    except Exception as e:
        print(f"Error during merging: {e}")
        return None


# ============================================================================
# 2. FEATURE IMPORTANCE ANALYSIS
# ============================================================================

def identify_top_features(X, y, n_features=10):
    """
    Identify top N most predictive features using multiple methods
    """
    print("\n" + "=" * 70)
    print(f"STEP 3: Identifying Top {n_features} Predictive Features")
    print("=" * 70)
    
    feature_scores = pd.DataFrame(index=X.columns)
    
    # Method 1: Random Forest Feature Importance
    print("\n--- Method 1: Random Forest Importance ---")
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X, y)
    feature_scores['RF_Importance'] = rf.feature_importances_
    
    # Method 2: F-statistic (ANOVA)
    print("--- Method 2: F-statistic (ANOVA) ---")
    f_scores, _ = f_classif(X, y)
    feature_scores['F_Score'] = f_scores
    
    # Method 3: Mutual Information
    print("--- Method 3: Mutual Information ---")
    mi_scores = mutual_info_classif(X, y, random_state=42)
    feature_scores['MI_Score'] = mi_scores
    
    # Normalize scores to 0-1 range
    for col in feature_scores.columns:
        feature_scores[col] = (feature_scores[col] - feature_scores[col].min()) / \
                              (feature_scores[col].max() - feature_scores[col].min())
    
    # Average across methods
    feature_scores['Average_Score'] = feature_scores.mean(axis=1)
    
    # Get top features
    top_features = feature_scores.nlargest(n_features, 'Average_Score')
    
    print("\n✓ Top 10 Most Predictive Features:")
    print(top_features.sort_values('Average_Score', ascending=False))
    
    return top_features.index.tolist(), feature_scores


def compute_correlation_matrix(X, top_features, save_plot=True):
    """
    Compute and visualize correlation matrix for top features
    """
    print("\n" + "=" * 70)
    print("STEP 4: Computing Correlation Matrix")
    print("=" * 70)
    
    # Select top features
    X_top = X[top_features]
    
    # Compute correlation matrix
    corr_matrix = X_top.corr()
    
    print(f"\n✓ Correlation Matrix computed ({len(top_features)} x {len(top_features)})")
    print("\nCorrelation Matrix:")
    print(corr_matrix)
    
    if save_plot:
        # Visualize correlation matrix
        plt.figure(figsize=(12, 10))
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0,
                    square=True, linewidths=1, cbar_kws={"shrink": 0.8},
                    fmt='.2f')
        plt.title('Correlation Matrix - Top 10 Predictive Features', 
                  fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.savefig('correlation_matrix_top10.png', dpi=300, bbox_inches='tight')
        print("\n✓ Correlation matrix plot saved: correlation_matrix_top10.png")
        plt.close()
    
    return corr_matrix


# ============================================================================
# 3. MACHINE LEARNING MODELS
# ============================================================================

def train_ml_models(X, y, top_features):
    """
    Train multiple ML models and compare performance
    """
    print("\n" + "=" * 70)
    print("STEP 5: Training ML Models")
    print("=" * 70)
    
    # Use only top features
    X_top = X[top_features]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_top, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Define models
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        
        # Train model
        model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1] if hasattr(model, 'predict_proba') else None
        
        # Cross-validation score
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        
        # Metrics
        results[name] = {
            'model': model,
            'cv_score': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'test_score': model.score(X_test_scaled, y_test),
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }
        
        print(f"  Cross-validation Score: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
        print(f"  Test Score: {model.score(X_test_scaled, y_test):.3f}")
        
        if y_pred_proba is not None:
            auc = roc_auc_score(y_test, y_pred_proba)
            print(f"  AUC-ROC: {auc:.3f}")
            results[name]['auc'] = auc
        
        print("\n  Classification Report:")
        print(classification_report(y_test, y_pred))
    
    # Find best model
    best_model_name = max(results, key=lambda k: results[k]['cv_score'])
    print(f"\n✓ Best Model: {best_model_name}")
    print(f"  CV Score: {results[best_model_name]['cv_score']:.3f}")
    
    return results, X_test, y_test, scaler


# ============================================================================
# 4. MAIN EXECUTION
# ============================================================================

def main():
    """
    Main execution function
    """
    print("\n" + "=" * 70)
    print("ALZHEIMER'S DISEASE FEATURE ANALYSIS AND PREDICTION")
    print("=" * 70)
    
    # Step 1: Load and clean data
    data_dict = load_and_clean_data()
    if data_dict is None:
        return
    
    # Step 2: Merge and prepare
    merged_data = merge_and_prepare_data(data_dict)
    if merged_data is None:
        return
    
    # Step 3: Prepare features and target
    # NOTE: Adjust 'AD_status' to your actual target column name
    # Common names: 'AD_status', 'diagnosis', 'group', 'label', 'class'
    print("\n" + "=" * 70)
    print("STEP 2.5: Preparing Features and Target")
    print("=" * 70)
    print("\nAvailable columns:")
    print(merged_data.columns.tolist())
    
    # Target column: DX1 contains diagnosis (Normal, Prob AD, MCI variants)
    target_col = 'DX1'
    
    if target_col not in merged_data.columns:
        print(f"\n⚠ WARNING: '{target_col}' not found in data!")
        print("Please modify the 'target_col' variable with the correct column name.")
        print("\nSearching for potential target columns...")
        potential_targets = [col for col in merged_data.columns 
                           if any(word in col.lower() for word in 
                                ['status', 'diagnosis', 'group', 'label', 'class', 'ad'])]
        if potential_targets:
            print(f"Potential target columns: {potential_targets}")
        return
    
    # Separate features and target
    X = merged_data.drop(columns=[target_col])
    y = merged_data[target_col]
    
    # Display original class distribution
    print(f"\n✓ Original class distribution:")
    print(y.value_counts())
    
    # Convert to binary classification: Normal vs Impaired (AD/MCI)
    # This handles the class imbalance issue (81 Normal vs only 3 Prob AD)
    print("\n⚠ Converting to binary classification: Normal vs Impaired (AD/MCI)")
    y_binary = y.apply(lambda x: 'Normal' if x == 'Normal' else 'Impaired')
    print(f"\n✓ Binary class distribution:")
    print(y_binary.value_counts())
    
    # Encode target
    le = LabelEncoder()
    y = le.fit_transform(y_binary)
    print(f"✓ Target encoded: {le.classes_} → {[0, 1]}")
    
    # Select only numeric features
    X = X.select_dtypes(include=[np.number])
    
    # CRITICAL: Remove any remaining columns with NaN/inf values
    # Check for NaN values
    cols_with_nan = X.columns[X.isnull().any()].tolist()
    if cols_with_nan:
        print(f"\n⚠ Removing {len(cols_with_nan)} columns with NaN values")
        X = X.drop(columns=cols_with_nan)
    
    # Check for infinite values
    cols_with_inf = X.columns[np.isinf(X).any()].tolist()
    if cols_with_inf:
        print(f"⚠ Removing {len(cols_with_inf)} columns with infinite values")
        X = X.drop(columns=cols_with_inf)
    
    # Final safety: fill any remaining NaN with 0
    X = X.fillna(0)
    
    # Replace any remaining inf with large numbers
    X = X.replace([np.inf, -np.inf], 0)
    
    print(f"\n✓ Feature matrix (cleaned): {X.shape}")
    print(f"✓ Final target distribution: {pd.Series(y).value_counts().to_dict()}")
    
    # Step 4: Identify top features
    top_features, feature_scores = identify_top_features(X, y, n_features=10)
    
    # Save feature scores
    feature_scores.to_csv('feature_importance_scores.csv')
    print("\n✓ Feature scores saved: feature_importance_scores.csv")
    
    # Step 5: Compute correlation matrix
    corr_matrix = compute_correlation_matrix(X, top_features)
    corr_matrix.to_csv('correlation_matrix_top10.csv')
    print("✓ Correlation matrix saved: correlation_matrix_top10.csv")
    
    # Step 6: Train ML models
    results, X_test, y_test, scaler = train_ml_models(X, y, top_features)
    
    # Save cleaned data
    cleaned_data = merged_data.copy()
    cleaned_data.to_csv('cleaned_merged_data.csv', index=False)
    print("\n✓ Cleaned data saved: cleaned_merged_data.csv")
    
    print("\n" + "=" * 70)
    print("ANALYSIS COMPLETE!")
    print("=" * 70)
    print("\nGenerated files:")
    print("  1. correlation_matrix_top10.png - Heatmap visualization")
    print("  2. correlation_matrix_top10.csv - Correlation values")
    print("  3. feature_importance_scores.csv - Feature importance metrics")
    print("  4. cleaned_merged_data.csv - Preprocessed dataset")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
