import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prophet import Prophet
import pandas as pd
from feature_engineering.feature import simulate_sentiment_data, add_rolling_features
from data_ingestion.stock_fetch import fetch_stock_data

def load_features():
    # Get stock data and add features
    df = fetch_stock_data()
    df = simulate_sentiment_data(df)
    df = add_rolling_features(df)
    
    # Prepare data for Prophet (rename columns and select required ones)
    df = df.rename(columns={'Datetime': 'ds', 'Close': 'y'})
    
    # Ensure y column is numeric and ds is datetime (timezone-naive)
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
    
    # Remove any rows with NaN values
    df = df.dropna()
    
    print(f"Data shape: {df.shape}")
    print(f"Data types:\n{df.dtypes}")
    print(f"Sample data:\n{df.head()}")
    
    return df

def train_prophet(df):
    model = Prophet()
    # Use only the required columns for Prophet training
    prophet_df = df[['ds', 'y']].copy()
    model.fit(prophet_df)
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    return forecast

def main():
    df = load_features()
    forecast = train_prophet(df)
    print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail())

if __name__ == "__main__":
    main()
