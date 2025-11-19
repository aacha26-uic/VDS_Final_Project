"""
Generate data for radial word cloud with HC, MCI, and AD groups
This script creates word frequency data for each condition group
"""

import pandas as pd
import numpy as np
import json

def create_radial_wordcloud_data():
    """
    Create sample data for radial word cloud visualization
    Each word will have frequencies for HC, MCI, and AD groups
    """
    
    # Load existing data to get word lists
    try:
        normal_df = pd.read_csv('tfidf_scores_normal.csv')
        impaired_df = pd.read_csv('tfidf_scores_impaired.csv')
    except:
        print("Could not load existing CSV files, creating sample data")
        normal_df = pd.DataFrame({'word': [], 'tfidf_score': []})
        impaired_df = pd.DataFrame({'word': [], 'tfidf_score': []})
    
    # Get top words from both groups
    all_words = set()
    if len(normal_df) > 0:
        all_words.update(normal_df['word'].head(30).tolist())
    if len(impaired_df) > 0:
        all_words.update(impaired_df['word'].head(30).tolist())
    
    # If no data available, create sample words
    if len(all_words) == 0:
        all_words = {
            'remember', 'back', 'college', 'house', 'school', 'people', 'time', 'family',
            'work', 'home', 'car', 'friends', 'wedding', 'husband', 'wife', 'children',
            'mother', 'father', 'years', 'life', 'good', 'little', 'never', 'always',
            'think', 'know', 'right', 'mean', 'thats', 'didnt', 'dont', 'gonna',
            'room', 'event', 'married', 'germany', 'west', 'within', 'uhm', 'put'
        }
    
    # Create data structure for radial visualization
    radial_data = []
    
    word_list = list(all_words)[:40]  # Limit to 40 words max
    
    for word in word_list:
        # Simulate different frequencies for each group
        # In real implementation, this would come from actual data analysis
        
        # Base frequency (random for simulation)
        base_freq = np.random.random() * 0.1
        
        # Create variations for each group
        hc_freq = base_freq * (0.8 + np.random.random() * 0.4)  # HC: 0.8-1.2x base
        mci_freq = base_freq * (0.9 + np.random.random() * 0.6)  # MCI: 0.9-1.5x base  
        ad_freq = base_freq * (1.0 + np.random.random() * 0.8)  # AD: 1.0-1.8x base
        
        # Some words might be more prevalent in certain conditions
        if word in ['remember', 'forget', 'memory', 'confusion', 'think', 'know']:
            # Memory-related words more frequent in impaired groups
            mci_freq *= 1.5
            ad_freq *= 2.0
            hc_freq *= 0.7
        elif word in ['work', 'career', 'active', 'energy', 'college', 'school']:
            # Activity words more frequent in healthy controls
            hc_freq *= 1.5
            mci_freq *= 0.9
            ad_freq *= 0.6
        elif word in ['back', 'thats', 'uhm', 'didnt', 'mean']:
            # Common filler words might be more frequent in MCI
            mci_freq *= 1.3
            ad_freq *= 1.1
            hc_freq *= 0.8
        elif word in ['house', 'home', 'family', 'wife', 'husband']:
            # Personal/family words might show different patterns
            hc_freq *= 1.2
            mci_freq *= 1.4
            ad_freq *= 0.9
        
        radial_data.append({
            'word': word,
            'hc': round(hc_freq, 4),
            'mci': round(mci_freq, 4), 
            'ad': round(ad_freq, 4),
            'total': round(hc_freq + mci_freq + ad_freq, 4)
        })
    
    # Sort by total frequency
    radial_data.sort(key=lambda x: x['total'], reverse=True)
    
    # Save as CSV
    df = pd.DataFrame(radial_data)
    df.to_csv('radial_wordcloud_data.csv', index=False)
    
    # Also save as JSON for easier JavaScript consumption
    with open('radial_wordcloud_data.json', 'w') as f:
        json.dump(radial_data, f, indent=2)
    
    print(f"Generated radial word cloud data with {len(radial_data)} words")
    print("Top 10 words by total frequency:")
    for i, item in enumerate(radial_data[:10]):
        print(f"{i+1}. {item['word']}: HC={item['hc']:.3f}, MCI={item['mci']:.3f}, AD={item['ad']:.3f}")
    
    return radial_data

if __name__ == "__main__":
    create_radial_wordcloud_data()