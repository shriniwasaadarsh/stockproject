"""
Example client for the Stock Analysis API
Demonstrates how to use the API endpoints
"""

import requests
import json
import pandas as pd
from datetime import datetime

class StockAnalysisClient:
    """Client for interacting with the Stock Analysis API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def health_check(self):
        """Check API health"""
        response = self.session.get(f"{self.base_url}/health")
        return response.json()
    
    def get_forecast(self, ticker: str = "AAPL", days: int = 30, use_real_sentiment: bool = True):
        """Get stock price forecast"""
        payload = {
            "ticker": ticker,
            "days": days,
            "use_real_sentiment": use_real_sentiment
        }
        
        response = self.session.post(f"{self.base_url}/forecast", json=payload)
        response.raise_for_status()
        return response.json()
    
    def evaluate_models(self, ticker: str = "AAPL", train_ratio: float = 0.8, use_real_sentiment: bool = True):
        """Evaluate model performance"""
        payload = {
            "ticker": ticker,
            "train_ratio": train_ratio,
            "use_real_sentiment": use_real_sentiment
        }
        
        response = self.session.post(f"{self.base_url}/evaluate", json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_sentiment(self, ticker: str = "AAPL", days_back: int = 7):
        """Get sentiment analysis"""
        payload = {
            "ticker": ticker,
            "days_back": days_back
        }
        
        response = self.session.post(f"{self.base_url}/sentiment", json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_plot(self, plot_type: str, ticker: str = "AAPL"):
        """Get plot file"""
        params = {"ticker": ticker}
        response = self.session.get(f"{self.base_url}/plots/{plot_type}", params=params)
        response.raise_for_status()
        return response.content
    
    def get_all_plots(self, ticker: str = "AAPL"):
        """Get all plots"""
        params = {"ticker": ticker}
        response = self.session.get(f"{self.base_url}/plots/all", params=params)
        response.raise_for_status()
        return response.json()
    
    def get_metrics(self, ticker: str = "AAPL"):
        """Get cached metrics"""
        response = self.session.get(f"{self.base_url}/metrics/{ticker}")
        response.raise_for_status()
        return response.json()
    
    def clear_cache(self):
        """Clear API cache"""
        response = self.session.get(f"{self.base_url}/cache/clear")
        response.raise_for_status()
        return response.json()

def demo_api_usage():
    """Demonstrate API usage"""
    print("Stock Analysis API Client Demo")
    print("=" * 40)
    
    # Initialize client
    client = StockAnalysisClient()
    
    try:
        # Health check
        print("\n1. Health Check:")
        health = client.health_check()
        print(f"   Status: {health['status']}")
        
        # Get forecast
        print("\n2. Getting Forecast:")
        forecast = client.get_forecast(ticker="AAPL", days=7)
        print(f"   Ticker: {forecast['ticker']}")
        print(f"   Predictions: {len(forecast['predictions'])} days")
        print(f"   RMSE: {forecast['metrics'].get('RMSE', 'N/A'):.4f}")
        
        # Evaluate models
        print("\n3. Evaluating Models:")
        evaluation = client.evaluate_models(ticker="AAPL")
        print(f"   Best Model: {evaluation['best_model']}")
        print(f"   Models Evaluated: {len(evaluation['model_metrics'])}")
        
        # Get sentiment
        print("\n4. Sentiment Analysis:")
        sentiment = client.get_sentiment(ticker="AAPL", days_back=3)
        print(f"   Average Sentiment: {sentiment['average_sentiment']:.4f}")
        print(f"   Data Points: {len(sentiment['sentiment_data'])}")
        
        # Get metrics
        print("\n5. Cached Metrics:")
        try:
            metrics = client.get_metrics(ticker="AAPL")
            print(f"   Cached at: {metrics['cached_at']}")
            print(f"   Best Model: {metrics['best_model']}")
        except requests.exceptions.HTTPError as e:
            print(f"   No cached metrics: {e}")
        
        # Cache status
        print("\n6. Cache Status:")
        cache_status = client.session.get(f"{client.base_url}/cache/status").json()
        print(f"   Cache Entries: {cache_status['total_entries']}")
        
        print("\n✅ API Demo completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the server is running.")
        print("   Start the server with: python api/main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def save_forecast_to_csv(forecast_data, filename="forecast.csv"):
    """Save forecast data to CSV"""
    predictions = forecast_data['predictions']
    
    df = pd.DataFrame(predictions)
    df['date'] = pd.to_datetime(df['date'])
    df = df.set_index('date')
    
    df.to_csv(filename)
    print(f"Forecast saved to {filename}")

def create_forecast_plot(forecast_data, filename="forecast_plot.png"):
    """Create a simple forecast plot"""
    import matplotlib.pyplot as plt
    
    predictions = forecast_data['predictions']
    dates = [pd.to_datetime(p['date']) for p in predictions]
    prices = [p['predicted_price'] for p in predictions]
    lower = [p['lower_bound'] for p in predictions]
    upper = [p['upper_bound'] for p in predictions]
    
    plt.figure(figsize=(12, 6))
    plt.plot(dates, prices, 'b-', label='Predicted Price', linewidth=2)
    plt.fill_between(dates, lower, upper, alpha=0.3, color='blue', label='Confidence Interval')
    plt.title(f"Stock Forecast - {forecast_data['ticker']}")
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Plot saved to {filename}")

if __name__ == "__main__":
    demo_api_usage()
    
    # Example of saving data
    try:
        client = StockAnalysisClient()
        forecast = client.get_forecast(ticker="AAPL", days=14)
        
        # Save to CSV
        save_forecast_to_csv(forecast, "aapl_forecast.csv")
        
        # Create plot
        create_forecast_plot(forecast, "aapl_forecast.png")
        
    except Exception as e:
        print(f"Error in data saving: {e}")

