"""
Word Cloud Analysis for Alzheimer's Disease Speech Data
========================================================
This script performs:
1. Text preprocessing and analysis from utterances
2. Frequency analysis and TF-IDF for word importance
3. Comparative word clouds (Normal vs Impaired)
4. Topic modeling to identify key themes
5. Word association analysis
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud, STOPWORDS
from collections import Counter
import re
import warnings
warnings.filterwarnings('ignore')

# NLP libraries
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer
    # Download required NLTK data
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
    try:
        nltk.data.find('corpora/wordnet')
    except LookupError:
        nltk.download('wordnet', quiet=True)
except ImportError:
    print("NLTK not installed. Using basic text processing.")
    nltk = None

from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation


# ============================================================================
# STOPWORDS CONFIGURATION
# ============================================================================

def get_comprehensive_stopwords():
    """
    Get comprehensive stopword list for meaningful word cloud analysis
    Combines NLTK stopwords with extensive custom additions
    """
    # Start with NLTK stopwords
    try:
        from nltk.corpus import stopwords
        stop_words = set(stopwords.words('english'))
    except:
        stop_words = set()
    
    # Add WordCloud default stopwords
    stop_words.update(STOPWORDS)
    
    # Add extensive custom stopwords for cleaner, more meaningful word clouds
    custom_stops = {
        # Pronouns - common but low semantic value
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 
        'you', 'your', 'yours', 'yourself', 'yourselves',
        'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
        
        # Articles and determiners
        'a', 'an', 'the', 'this', 'that', 'these', 'those',
        
        # Common verbs with little semantic meaning
        'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being',
        'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
        'would', 'should', 'could', 'ought', 'may', 'might', 'must', 'can', 'will', 'shall',
        
        # Prepositions and conjunctions (high frequency, low meaning)
        'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
        'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
        'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
        'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'so', 'than',
        
        # Common adverbs and quantifiers
        'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
        'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
        'only', 'own', 'same', 'too', 'very', 'just', 'now',
        
        # Interview/conversation fillers and discourse markers
        'uh', 'um', 'like', 'yeah', 'well', 'know', 'thing', 'okay', 'oh', 
        'actually', 'really', 'got', 'get', 'getting',
        'going', 'go', 'went', 'gone', 'come', 'came',
        
        # Numbers and temporal terms (often used generically in narratives)
        'one', 'two', 'three', 'four', 'five', 'first', 'second',
        'time', 'times', 'day', 'days', 'year', 'years',
        
        # Generic narrative connectors
        'lot', 'kind', 'something', 'someone', 'somewhere', 'anything', 'anyone', 'anywhere',
        'nothing', 'nobody', 'nowhere', 'everything', 'everyone', 'everywhere',
        
        # Other high-frequency, low-value words
        'said', 'say', 'says', 'saying', 'told', 'tell', 'think', 'thought',
        'want', 'wanted', 'make', 'made', 'making', 'take', 'took', 'taken'
    }
    stop_words.update(custom_stops)
    
    return stop_words


# ============================================================================
# 1. DATA LOADING AND PREPROCESSING
# ============================================================================

def load_speech_data():
    """
    Load utterance data and LIWC results
    """
    print("=" * 70)
    print("STEP 1: Loading Speech Data")
    print("=" * 70)
    
    try:
        # Load utterance data (contains actual speech text)
        utterance = pd.read_excel('../utterance_data.xlsx')
        print(f"✓ Utterance data: {utterance.shape}")
        
        # Load LIWC analysis (linguistic features)
        liwc = pd.read_excel('../LIWC-22 Results - participant - LIWC Analysis(1).xlsx')
        print(f"✓ LIWC data: {liwc.shape}")
        
        # Load linguistic outcomes
        linguistic = pd.read_excel('../linguistic_outcomes.xlsx')
        print(f"✓ Linguistic data: {linguistic.shape}")
        
        return utterance, liwc, linguistic
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return None, None, None


def preprocess_text(text):
    """
    Clean and preprocess text for word cloud analysis
    """
    if pd.isna(text):
        return ""
    
    # Convert to lowercase
    text = str(text).lower()
    
    # Remove special characters and digits
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Tokenize and lemmatize if NLTK available
    if nltk:
        try:
            tokens = word_tokenize(text)
            lemmatizer = WordNetLemmatizer()
            tokens = [lemmatizer.lemmatize(word) for word in tokens]
            
            # Use comprehensive stopword list
            stop_words = get_comprehensive_stopwords()
            
            # Filter tokens: remove stopwords and keep only meaningful words (length > 2)
            tokens = [word for word in tokens if word.lower() not in stop_words and len(word) > 2]
            text = ' '.join(tokens)
        except Exception as e:
            # If there's an error, at least do basic stopword removal
            stop_words = get_comprehensive_stopwords()
            tokens = text.split()
            tokens = [word for word in tokens if word.lower() not in stop_words and len(word) > 2]
            text = ' '.join(tokens)
    else:
        # Fallback: basic stopword removal without NLTK
        stop_words = get_comprehensive_stopwords()
        tokens = text.split()
        tokens = [word for word in tokens if word.lower() not in stop_words and len(word) > 2]
        text = ' '.join(tokens)
    
    return text


def prepare_corpus(utterance_data):
    """
    Prepare text corpus for analysis
    """
    print("\n" + "=" * 70)
    print("STEP 2: Preprocessing Text Corpus")
    print("=" * 70)
    
    # Extract diagnosis labels
    utterance_data['diagnosis'] = utterance_data['DX1'].apply(
        lambda x: 'Normal' if x == 'Normal' else 'Impaired'
    )
    
    # Preprocess all utterances
    print("  Processing text...")
    utterance_data['processed_text'] = utterance_data['utterance'].apply(preprocess_text)
    
    # Remove empty texts
    utterance_data = utterance_data[utterance_data['processed_text'].str.len() > 0]
    
    print(f"✓ Processed {len(utterance_data)} utterances")
    print(f"  Normal: {(utterance_data['diagnosis'] == 'Normal').sum()}")
    print(f"  Impaired: {(utterance_data['diagnosis'] == 'Impaired').sum()}")
    
    return utterance_data


# ============================================================================
# 2. WORD FREQUENCY ANALYSIS
# ============================================================================

def analyze_word_frequencies(corpus_df):
    """
    Analyze word frequencies for each group
    """
    print("\n" + "=" * 70)
    print("STEP 3: Word Frequency Analysis")
    print("=" * 70)
    
    results = {}
    
    for diagnosis in ['Normal', 'Impaired', 'All']:
        if diagnosis == 'All':
            texts = corpus_df['processed_text'].tolist()
        else:
            texts = corpus_df[corpus_df['diagnosis'] == diagnosis]['processed_text'].tolist()
        
        # Combine all texts
        combined_text = ' '.join(texts)
        
        # Count words
        words = combined_text.split()
        word_freq = Counter(words)
        
        results[diagnosis] = {
            'word_freq': word_freq,
            'total_words': len(words),
            'unique_words': len(word_freq),
            'top_words': word_freq.most_common(20)
        }
        
        print(f"\n--- {diagnosis} Group ---")
        print(f"  Total words: {results[diagnosis]['total_words']}")
        print(f"  Unique words: {results[diagnosis]['unique_words']}")
        print(f"  Top 10 words: {word_freq.most_common(10)}")
    
    return results


# ============================================================================
# 3. TF-IDF ANALYSIS
# ============================================================================

def compute_tfidf(corpus_df):
    """
    Compute TF-IDF scores to identify important words
    """
    print("\n" + "=" * 70)
    print("STEP 4: TF-IDF Analysis")
    print("=" * 70)
    
    # TF-IDF for each diagnosis group
    tfidf_results = {}
    
    for diagnosis in ['Normal', 'Impaired']:
        texts = corpus_df[corpus_df['diagnosis'] == diagnosis]['processed_text'].tolist()
        
        # Compute TF-IDF
        vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        # Get feature names and scores
        feature_names = vectorizer.get_feature_names_out()
        avg_scores = tfidf_matrix.mean(axis=0).A1
        
        # Create dataframe
        tfidf_df = pd.DataFrame({
            'word': feature_names,
            'tfidf_score': avg_scores
        }).sort_values('tfidf_score', ascending=False)
        
        tfidf_results[diagnosis] = tfidf_df
        
        print(f"\n--- {diagnosis} Top 15 TF-IDF Terms ---")
        print(tfidf_df.head(15).to_string(index=False))
    
    # Save TF-IDF results
    for diagnosis, df in tfidf_results.items():
        df.to_csv(f'tfidf_scores_{diagnosis.lower()}.csv', index=False)
        print(f"\n✓ Saved: tfidf_scores_{diagnosis.lower()}.csv")
    
    return tfidf_results


# ============================================================================
# 4. WORD CLOUD GENERATION
# ============================================================================

def generate_wordclouds(freq_results, tfidf_results):
    """
    Generate beautiful word clouds for visualization
    """
    print("\n" + "=" * 70)
    print("STEP 5: Generating Word Clouds")
    print("=" * 70)
    
    # Get comprehensive stopwords
    stop_words = get_comprehensive_stopwords()
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(20, 16))
    fig.suptitle('Word Cloud Analysis - Alzheimer\'s Disease Speech Patterns', 
                 fontsize=20, fontweight='bold', y=0.98)
    
    # Color schemes
    colormap_normal = 'Blues'
    colormap_impaired = 'Reds'
    colormap_all = 'viridis'
    
    # 1. Overall word cloud (frequency-based)
    ax = axes[0, 0]
    wordcloud = WordCloud(
        width=800, height=600,
        background_color='white',
        colormap=colormap_all,
        stopwords=stop_words,
        max_words=100,
        relative_scaling=0.5,
        min_font_size=10
    ).generate_from_frequencies(freq_results['All']['word_freq'])
    
    ax.imshow(wordcloud, interpolation='bilinear')
    ax.set_title('All Participants - Most Frequent Words', fontsize=16, fontweight='bold')
    ax.axis('off')
    
    # 2. Normal group (frequency-based)
    ax = axes[0, 1]
    wordcloud_normal = WordCloud(
        width=800, height=600,
        background_color='white',
        colormap=colormap_normal,
        stopwords=stop_words,
        max_words=80,
        relative_scaling=0.5,
        min_font_size=10
    ).generate_from_frequencies(freq_results['Normal']['word_freq'])
    
    ax.imshow(wordcloud_normal, interpolation='bilinear')
    ax.set_title('Normal Participants - Word Frequency', fontsize=16, fontweight='bold', color='#084594')
    ax.axis('off')
    
    # 3. Impaired group (frequency-based)
    ax = axes[1, 0]
    wordcloud_impaired = WordCloud(
        width=800, height=600,
        background_color='white',
        colormap=colormap_impaired,
        stopwords=stop_words,
        max_words=80,
        relative_scaling=0.5,
        min_font_size=10
    ).generate_from_frequencies(freq_results['Impaired']['word_freq'])
    
    ax.imshow(wordcloud_impaired, interpolation='bilinear')
    ax.set_title('Impaired (AD/MCI) Participants - Word Frequency', fontsize=16, fontweight='bold', color='#a50026')
    ax.axis('off')
    
    # 4. Differential word cloud (TF-IDF based)
    ax = axes[1, 1]
    # Combine top TF-IDF terms from both groups
    combined_tfidf = {}
    for word, score in zip(tfidf_results['Normal']['word'][:50], tfidf_results['Normal']['tfidf_score'][:50]):
        combined_tfidf[word] = score
    for word, score in zip(tfidf_results['Impaired']['word'][:50], tfidf_results['Impaired']['tfidf_score'][:50]):
        if word in combined_tfidf:
            combined_tfidf[word] = (combined_tfidf[word] + score) / 2
        else:
            combined_tfidf[word] = score
    
    wordcloud_tfidf = WordCloud(
        width=800, height=600,
        background_color='white',
        colormap='plasma',
        stopwords=stop_words,
        max_words=100,
        relative_scaling=0.5,
        min_font_size=10
    ).generate_from_frequencies(combined_tfidf)
    
    ax.imshow(wordcloud_tfidf, interpolation='bilinear')
    ax.set_title('Most Distinctive Terms (TF-IDF Based)', fontsize=16, fontweight='bold', color='#5e3c99')
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('wordcloud_analysis.png', dpi=300, bbox_inches='tight')
    print("\n✓ Saved: wordcloud_analysis.png")
    plt.close()
    
    # Generate individual high-res word clouds
    generate_individual_wordclouds(freq_results, tfidf_results)


def generate_individual_wordclouds(freq_results, tfidf_results):
    """
    Generate individual high-resolution word clouds
    """
    # Get comprehensive stopwords
    stop_words = get_comprehensive_stopwords()
    
    # Normal group - high res
    plt.figure(figsize=(12, 8))
    wordcloud_normal = WordCloud(
        width=1200, height=800,
        background_color='white',
        colormap='Blues',
        stopwords=stop_words,
        max_words=100,
        relative_scaling=0.5,
        min_font_size=12
    ).generate_from_frequencies(freq_results['Normal']['word_freq'])
    
    plt.imshow(wordcloud_normal, interpolation='bilinear')
    plt.title('Normal Participants - Speech Patterns', fontsize=18, fontweight='bold', pad=20)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('wordcloud_normal.png', dpi=300, bbox_inches='tight')
    print("✓ Saved: wordcloud_normal.png")
    plt.close()
    
    # Impaired group - high res
    plt.figure(figsize=(12, 8))
    wordcloud_impaired = WordCloud(
        width=1200, height=800,
        background_color='white',
        colormap='Reds',
        stopwords=stop_words,
        max_words=100,
        relative_scaling=0.5,
        min_font_size=12
    ).generate_from_frequencies(freq_results['Impaired']['word_freq'])
    
    plt.imshow(wordcloud_impaired, interpolation='bilinear')
    plt.title('Impaired (AD/MCI) Participants - Speech Patterns', fontsize=18, fontweight='bold', pad=20)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('wordcloud_impaired.png', dpi=300, bbox_inches='tight')
    print("✓ Saved: wordcloud_impaired.png")
    plt.close()


# ============================================================================
# 5. COMPARATIVE ANALYSIS
# ============================================================================

def comparative_word_analysis(freq_results, tfidf_results):
    """
    Compare word usage between Normal and Impaired groups
    """
    print("\n" + "=" * 70)
    print("STEP 6: Comparative Analysis")
    print("=" * 70)
    
    # Get top words from each group
    normal_words = set([word for word, count in freq_results['Normal']['top_words']])
    impaired_words = set([word for word, count in freq_results['Impaired']['top_words']])
    
    # Find unique and shared words
    unique_normal = normal_words - impaired_words
    unique_impaired = impaired_words - normal_words
    shared_words = normal_words & impaired_words
    
    print(f"\n--- Word Usage Comparison ---")
    print(f"  Unique to Normal: {len(unique_normal)} words")
    print(f"    Examples: {list(unique_normal)[:10]}")
    print(f"\n  Unique to Impaired: {len(unique_impaired)} words")
    print(f"    Examples: {list(unique_impaired)[:10]}")
    print(f"\n  Shared words: {len(shared_words)} words")
    print(f"    Examples: {list(shared_words)[:10]}")
    
    # Create comparison visualization
    create_comparison_chart(freq_results)
    
    # Save comparison data
    comparison_df = pd.DataFrame({
        'Category': ['Unique to Normal', 'Unique to Impaired', 'Shared'],
        'Count': [len(unique_normal), len(unique_impaired), len(shared_words)],
        'Examples': [
            ', '.join(list(unique_normal)[:15]),
            ', '.join(list(unique_impaired)[:15]),
            ', '.join(list(shared_words)[:15])
        ]
    })
    comparison_df.to_csv('word_comparison.csv', index=False)
    print("\n✓ Saved: word_comparison.csv")


def create_comparison_chart(freq_results):
    """
    Create bar chart comparing top words between groups
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    fig.suptitle('Top 15 Most Frequent Words by Group', fontsize=16, fontweight='bold')
    
    # Normal group
    normal_top = freq_results['Normal']['top_words'][:15]
    words_n, counts_n = zip(*normal_top)
    ax1.barh(range(len(words_n)), counts_n, color='#2171b5')
    ax1.set_yticks(range(len(words_n)))
    ax1.set_yticklabels(words_n)
    ax1.set_xlabel('Frequency', fontsize=12)
    ax1.set_title('Normal Participants', fontsize=14, fontweight='bold', color='#084594')
    ax1.invert_yaxis()
    
    # Impaired group
    impaired_top = freq_results['Impaired']['top_words'][:15]
    words_i, counts_i = zip(*impaired_top)
    ax2.barh(range(len(words_i)), counts_i, color='#cb181d')
    ax2.set_yticks(range(len(words_i)))
    ax2.set_yticklabels(words_i)
    ax2.set_xlabel('Frequency', fontsize=12)
    ax2.set_title('Impaired (AD/MCI) Participants', fontsize=14, fontweight='bold', color='#a50026')
    ax2.invert_yaxis()
    
    plt.tight_layout()
    plt.savefig('word_frequency_comparison.png', dpi=300, bbox_inches='tight')
    print("✓ Saved: word_frequency_comparison.png")
    plt.close()


# ============================================================================
# 6. TOPIC MODELING (LDA)
# ============================================================================

def perform_topic_modeling(corpus_df, n_topics=5):
    """
    Use Latent Dirichlet Allocation to identify topics
    """
    print("\n" + "=" * 70)
    print("STEP 7: Topic Modeling (LDA)")
    print("=" * 70)
    
    texts = corpus_df['processed_text'].tolist()
    
    # Create document-term matrix
    vectorizer = CountVectorizer(max_features=200, min_df=2)
    doc_term_matrix = vectorizer.fit_transform(texts)
    
    # Fit LDA model
    lda = LatentDirichletAllocation(n_components=n_topics, random_state=42)
    lda.fit(doc_term_matrix)
    
    # Get topics
    feature_names = vectorizer.get_feature_names_out()
    
    print(f"\n--- Discovered {n_topics} Topics ---")
    topics_data = []
    
    for topic_idx, topic in enumerate(lda.components_):
        top_indices = topic.argsort()[-10:][::-1]
        top_words = [feature_names[i] for i in top_indices]
        top_weights = [topic[i] for i in top_indices]
        
        print(f"\nTopic {topic_idx + 1}:")
        print(f"  Top words: {', '.join(top_words)}")
        
        topics_data.append({
            'Topic': f'Topic {topic_idx + 1}',
            'Top_Words': ', '.join(top_words),
            'Weights': ', '.join([f'{w:.3f}' for w in top_weights])
        })
    
    # Save topics
    topics_df = pd.DataFrame(topics_data)
    topics_df.to_csv('discovered_topics.csv', index=False)
    print("\n✓ Saved: discovered_topics.csv")
    
    return lda, vectorizer


# ============================================================================
# 7. MAIN EXECUTION
# ============================================================================

def main():
    """
    Main execution function
    """
    print("\n" + "=" * 70)
    print("WORD CLOUD ANALYSIS - ALZHEIMER'S DISEASE SPEECH")
    print("=" * 70)
    
    # Step 1: Load data
    utterance, liwc, linguistic = load_speech_data()
    if utterance is None:
        return
    
    # Step 2: Prepare corpus
    corpus_df = prepare_corpus(utterance)
    
    # Step 3: Frequency analysis
    freq_results = analyze_word_frequencies(corpus_df)
    
    # Step 4: TF-IDF analysis
    tfidf_results = compute_tfidf(corpus_df)
    
    # Step 5: Generate word clouds
    generate_wordclouds(freq_results, tfidf_results)
    
    # Step 6: Comparative analysis
    comparative_word_analysis(freq_results, tfidf_results)
    
    # Step 7: Topic modeling
    lda_model, vectorizer = perform_topic_modeling(corpus_df, n_topics=5)
    
    print("\n" + "=" * 70)
    print("ANALYSIS COMPLETE!")
    print("=" * 70)
    print("\nGenerated files:")
    print("  1. wordcloud_analysis.png - 4-panel word cloud comparison")
    print("  2. wordcloud_normal.png - High-res Normal group word cloud")
    print("  3. wordcloud_impaired.png - High-res Impaired group word cloud")
    print("  4. word_frequency_comparison.png - Bar chart comparison")
    print("  5. tfidf_scores_normal.csv - TF-IDF scores for Normal group")
    print("  6. tfidf_scores_impaired.csv - TF-IDF scores for Impaired group")
    print("  7. word_comparison.csv - Unique and shared word analysis")
    print("  8. discovered_topics.csv - LDA topic modeling results")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
