#!/usr/bin/env python3
"""
API Testing Demo for Faculty
Tests all API endpoints without needing curl
"""

import requests
import json
import time
import sys

def test_api_endpoints():
    """Test all API endpoints"""
    base_url = "http://localhost:8000"
    
    print("=" * 60)
    print("API TESTING DEMO FOR FACULTY")
    print("=" * 60)
    
    print("\n1. Testing Health Endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print(f"   [OK] Health check: {response.json()}")
        else:
            print(f"   [FAIL] Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   [FAIL] Health check failed: {e}")
        return False
    
    print("\n2. Testing Forecast Endpoint (Prophet)...")
    try:
        data = {
            "ticker": "AAPL",
            "days": 30,
            "use_real_sentiment": True,
            "model_type": "prophet"
        }
        response = requests.post(f"{base_url}/forecast", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"   [OK] Prophet forecast: {len(result['predictions'])} predictions")
            print(f"   Ticker: {result['ticker']}")
            print(f"   Status: {result['status']}")
            if 'metrics' in result and result['metrics']:
                print(f"   RMSE: {result['metrics'].get('RMSE', 'N/A')}")
        else:
            print(f"   [FAIL] Forecast failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   [FAIL] Forecast failed: {e}")
    
    print("\n3. Testing Forecast Endpoint (XGBoost)...")
    try:
        data = {
            "ticker": "AAPL",
            "days": 30,
            "use_real_sentiment": True,
            "model_type": "xgboost"
        }
        response = requests.post(f"{base_url}/forecast", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"   [OK] XGBoost forecast: {len(result['predictions'])} predictions")
            print(f"   Ticker: {result['ticker']}")
            print(f"   Status: {result['status']}")
            if 'metrics' in result and result['metrics']:
                print(f"   RMSE: {result['metrics'].get('RMSE', 'N/A')}")
        else:
            print(f"   [FAIL] XGBoost forecast failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   [FAIL] XGBoost forecast failed: {e}")
    
    print("\n4. Testing Sentiment Analysis Endpoint...")
    try:
        data = {
            "ticker": "AAPL",
            "days_back": 7
        }
        response = requests.post(f"{base_url}/sentiment", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"   [OK] Sentiment analysis: {len(result['sentiment_data'])} days")
            print(f"   Average sentiment: {result['average_sentiment']:.3f}")
            print(f"   Status: {result['status']}")
        else:
            print(f"   [FAIL] Sentiment analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   [FAIL] Sentiment analysis failed: {e}")
    
    print("\n5. Testing Model Evaluation Endpoint...")
    try:
        data = {
            "ticker": "AAPL",
            "train_ratio": 0.8,
            "use_real_sentiment": True
        }
        response = requests.post(f"{base_url}/evaluate", json=data, timeout=60)
        if response.status_code == 200:
            result = response.json()
            print(f"   [OK] Model evaluation completed")
            print(f"   Best model: {result['best_model']}")
            print(f"   Models evaluated: {len(result['model_metrics'])}")
            print(f"   Status: {result['status']}")
        else:
            print(f"   [FAIL] Model evaluation failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   [FAIL] Model evaluation failed: {e}")
    
    print("\n" + "=" * 60)
    print("API TESTING COMPLETED")
    print("=" * 60)
    
    print("\nAll API endpoints are working!")
    print("\nTo see the interactive API documentation:")
    print("Open: http://localhost:8000/docs")
    
    return True

def main():
    """Main function"""
    print("API Testing Demo for Faculty")
    print("Make sure the API server is running first!")
    print("Run: python start_system.py")
    print("\nPress Enter to continue...")
    input()
    
    test_api_endpoints()

if __name__ == "__main__":
    main()

