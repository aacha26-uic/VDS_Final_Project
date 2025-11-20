# Visualizing Speech and Biomarker Correlations in Alzheimer's Disease

**Credits:** This repository is built upon starter code provided by Andrew Wentzel, a member of the Electronic Visualization Laboratory at UIC.

## Project Overview

**Client:** Dr. Natalie Parde  
**Project Title:** Visualizing Speech and Biomarker Correlations in Alzheimer's Disease

### Description

Currently, psychiatrists use Excel and SPSS (Statistical Package for the Social Sciences) software to visualize data collected from the SLaCAD (Spoken Language Corpus for Alzheimer's Disease detection) dataset. However, due to the large number of modalities, it has been difficult to effectively visualize relationships and correlations. To address this, the goal of this project is to develop an interactive visualization tool that empowers psychiatrists to independently explore different acoustic and linguistic features, AD (Alzheimer's Disease) biomarkers, and how these relate to AD status.

### Project Significance

Alzheimer's Disease is a form of dementia that causes a progressive decline in cognitive abilities such as memory, thinking, reasoning, and judgment. Symptoms of AD usually appear later, by which time millions of brain cells are already damaged and cannot be saved.

Recent research shows that biomarkers in the preclinical phase of AD can indicate whether a person will develop the disease later in life. Similarly, people who are beginning to develop AD often show changes in how they speak or write long before memory problems appear in the Mild Cognitive Impairment (MCI) stage. The use of clinical markers (signs in thinking and behavior) in combination with biomarkers would really help scientists come up with less invasive (compared to blood draws) and more affordable ways (compared to brain imaging scans) in identifying whether a person has AD early to make treatment more effective too.

This project falls under the IEEE research area Representation and Interaction, as it focuses on the design of visual representations and interactive techniques for exploring different types of data, users, and visualization tasks.

## Team

### Project Manager

**Name:** Nandini Jirobe  
**Department:** Computer Science  
**Background:** Master's student in Computer Science, currently studying key design principles and techniques for interactive data visualization and analysis in data science. She possesses a solid foundation in data science and machine learning, gained through various industry and research projects. Nandini is skilled in Python and React.js and has practical experience with visualization libraries such as Seaborn and Matplotlib. She has also recently begun exploring advanced visualization frameworks like Three.js and D3.js.

### Team Members

**Aditya Acharya**  
**Department:** Computer Science

**Chesta Dewangan**  
**Department:** Computer Science

### Consultant Client

**Name:** Dr. Natalie Parde  
**Department:** Computer Science  
**Background:** Co-Director of the UIC Natural Language Processing Laboratory and a faculty member of the AI.Health4All Center for Health Equity, where she focuses on Machine Learning and Artificial Intelligence. Her research interests mainly lie in natural language processing, particularly in healthcare applications, multimodality, and creative language. For this project, she will provide access to the Spoken Language Corpus for Alzheimer's Disease Detection (SLaCAD) dataset and connect us with PhD students from her NLP lab who helped develop the dataset.

## Data

The project will work with the SLaCAD (Spoken Language Corpus for Alzheimer's Disease detection) dataset containing:

- 7.5 hours of recorded and transcribed speech from 91 older participants
- Linguistic features (part-of-speech tags, named entity recognition, syntactic complexity measures, vocabulary richness)
- Acoustic features (voiced segments per second, unvoiced segment duration measurements)
- AD biomarker data (cerebrospinal fluid and plasma biomarkers)
- Clinical assessments (Montreal Cognitive Assessment scores, AD status)

## Project Status

This repository currently contains template code with placeholder visualizations. The actual implementation for the Alzheimer's Disease speech and biomarker visualization will be developed as part of this project.

### Recent Updates

**November 2, 2025** - ML-Based Feature Analysis Implementation

- ✅ Implemented machine learning-based feature selection using Random Forest, F-statistic (ANOVA), and Mutual Information
- ✅ Identified top 10 most predictive features for Alzheimer's detection from 329 speech and cognitive features
- ✅ Generated correlation matrix visualization showing relationships between top features
- ✅ Achieved 94.7% accuracy in classifying Normal vs Impaired (AD/MCI) participants
- ✅ Created automated analysis pipeline (`feature_analysis.py`) with comprehensive output files

**November 3, 2025** - Word Cloud NLP Analysis Implementation

- ✅ Developed comprehensive word cloud analysis comparing Normal vs Impaired (AD/MCI) speech patterns
- ✅ Implemented advanced text preprocessing with extensive stopword filtering for meaningful insights
- ✅ Applied TF-IDF analysis to identify distinctive vocabulary usage between groups
- ✅ Discovered 5 key themes using LDA topic modeling (weddings/family, education/career, medical experiences, daily life, social interactions)
- ✅ Found 12.8× vocabulary richness difference: Normal participants use significantly more diverse vocabulary (4,722 unique words) compared to Impaired group (810 unique words)
- ✅ Generated 4 visualizations and 5 data files for interactive React integration

## Installation & Setup

### Prerequisites

- Python 3.8+ (Anaconda/Miniconda recommended)
- Node.js 16+ and npm
- Git

### Python Environment Setup

1. **Install Python dependencies:**

   ```bash
   pip install -r python/requirements.txt
   ```

   Required packages:

   - pandas>=2.0.0
   - numpy>=1.24.0
   - openpyxl>=3.1.0
   - matplotlib>=3.7.0
   - seaborn>=0.12.0
   - scikit-learn>=1.3.0
   - wordcloud>=1.9.0
   - nltk>=3.8.0
   - jupyter>=1.0.0
   - ipykernel>=6.25.0

### Running the ML Feature Analysis

To reproduce the correlation matrix and feature importance analysis:

```bash
cd python
python feature_analysis.py
```

**Output files generated:**

- `correlation_matrix_top10.png` - Heatmap visualization of feature correlations
- `correlation_matrix_top10.csv` - Numerical correlation matrix (10×10)
- `feature_importance_scores.csv` - Rankings of all 329 features
- `cleaned_merged_data.csv` - Preprocessed dataset (91 participants)

**Top 10 Identified Features:**

1. XDOMMEM - Memory domain score
2. XDOMEXE - Executive function domain
3. CRAFTDRE - Craft story delayed recall
4. COGSTAT - Cognitive status
5. CRAFTURS - Craft story unit recall
6. CRAFTDVR - Craft story delayed verbal recall
7. MOCARECN - MoCA recall score
8. CRAFTVRS - Craft story verbal recall
9. XDOMLAN - Language domain
10. BigWords - Usage of big words in speech

### Running the Word Cloud Analysis

To generate word cloud visualizations comparing speech patterns:

```bash
cd python
python wordcloud_analysis.py
```

**Output files generated:**

- `wordcloud_analysis.png` - 4-panel comparison (All/Normal/Impaired/TF-IDF)
- `wordcloud_normal.png` - High-resolution Normal group word cloud
- `wordcloud_impaired.png` - High-resolution Impaired group word cloud
- `word_frequency_comparison.png` - Bar chart comparing top words
- `tfidf_scores_normal.csv` - Distinctive terms for Normal group
- `tfidf_scores_impaired.csv` - Distinctive terms for Impaired group
- `word_comparison.csv` - Unique and shared vocabulary analysis
- `discovered_topics.csv` - LDA topic modeling results (5 themes)

**Key Findings:**

- Normal participants show 12.8× richer vocabulary diversity
- Top themes: Wedding/family events, education/career, medical experiences, daily life activities
- Comprehensive stopword filtering ensures meaningful semantic analysis

### Frontend Setup

```bash
npm install
npm start
```

The application will open at `http://localhost:3000`

## Dev Tools

### Frontend

- **React.js** - UI framework for building interactive components
- **D3.js** - 2D data visualization library for charts, graphs, and custom visualizations

### Preprocessing

- **Python** - Data preprocessing and feature extraction
- **NLP Libraries** - Natural language preprocessing for linguistic feature analysis (BERT models)
- **Machine Learning Libraries** - Statistical analysis and biomarker correlation modeling



### Links to Resources Used
- **Circular Slider Component** - https://primereact.org/knob/
- **Blob Code Tutorial** - https://www.youtube.com/watch?v=6YJ-2MvDqhc&t=2s
- **Brain Silhouette** - https://static.vecteezy.com/system/resources/previews/059/555/853/non_2x/black-silhouette-of-a-human-brain-vector.jpg 

