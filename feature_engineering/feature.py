import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from data_ingestion.stock_fetch import fetch_stock_data
from data_ingestion.sentiment import get_sentiment_score
from data_ingestion.news_sentiment import get_real_sentiment_score

def simulate_sentiment_data(stock_df, use_real_sentiment=True, ticker="AAPL"):
    """
    Add sentiment data to stock dataframe
    Can use real news sentiment or simulated sentiment
    """
    sentiment = []
    
    if use_real_sentiment:
        # Use real news sentiment analysis
        try:
            from data_ingestion.news_sentiment import NewsSentimentAnalyzer
            analyzer = NewsSentimentAnalyzer()
            sentiment_df = analyzer.get_sentiment_scores(ticker, days_back=7)
            
            # Map sentiment to stock timestamps
            for dt in stock_df['Datetime']:
                # Find closest sentiment date
                target_date = pd.to_datetime(dt).date()
                matching_rows = sentiment_df[sentiment_df['date'].dt.date == target_date]
                
                if not matching_rows.empty:
                    score = float(matching_rows['sentiment_score'].iloc[0])
                else:
                    # Use most recent sentiment if no exact match
                    score = float(sentiment_df['sentiment_score'].iloc[-1]) if not sentiment_df.empty else 0.0
                
                sentiment.append(score)
                
        except Exception as e:
            print(f"Real sentiment analysis failed: {e}")
            print("Falling back to simulated sentiment...")
            use_real_sentiment = False
    
    if not use_real_sentiment:
        # Fallback to simulated sentiment
        for dt in stock_df['Datetime']:
            text = f"Market update at {dt}"  # Placeholder text
            score = get_sentiment_score(text)
            sentiment.append(score)
    
    stock_df['Sentiment'] = sentiment
    return stock_df

def add_rolling_features(df, window=3):
    df['MA_Close'] = df['Close'].rolling(window=window).mean()
    df['Volatility'] = df['Close'].rolling(window=window).std()
    return df

if __name__ == "__main__":
    df = fetch_stock_data()
    df = simulate_sentiment_data(df)
    df = add_rolling_features(df)
    print(df.head())
