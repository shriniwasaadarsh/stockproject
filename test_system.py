#!/usr/bin/env python3
"""
Comprehensive test script for Stock Analysis System
Tests all components and integrations
"""

import sys
import os
import time
import requests
import subprocess
import threading
from datetime import datetime

# Add project root to path
sys.path.append('.')

def test_data_ingestion():
    """Test data ingestion modules"""
    print("\nTesting Data Ingestion...")
    
    try:
        from data_ingestion.stock_fetch import fetch_stock_data
        df = fetch_stock_data("AAPL", "7d", "1h")
        print(f"[OK] Stock fetch: {df.shape[0]} rows, {df.shape[1]} columns")
        
        from data_ingestion.sentiment import get_sentiment_score
        score = get_sentiment_score("Apple stock is performing well")
        print(f"[OK] Basic sentiment: {score:.3f}")
        
        from data_ingestion.news_sentiment import NewsSentimentAnalyzer
        analyzer = NewsSentimentAnalyzer()
        sentiment_df = analyzer.get_sentiment_scores("AAPL", 3)
        print(f"[OK] News sentiment: {len(sentiment_df)} days of data")
        
        return True
    except Exception as e:
        print(f"❌ Data ingestion failed: {e}")
        return False

def test_feature_engineering():
    """Test feature engineering"""
    print("\n🔧 Testing Feature Engineering...")
    
    try:
        from feature_engineering.feature import simulate_sentiment_data, add_rolling_features
        from data_ingestion.stock_fetch import fetch_stock_data
        
        df = fetch_stock_data("AAPL", "7d", "1h")
        df = simulate_sentiment_data(df, use_real_sentiment=False)
        df = add_rolling_features(df)
        
        print(f"✅ Features created: {df.shape[1]} columns")
        print(f"✅ Sentiment column: {'Sentiment' in df.columns}")
        print(f"✅ Rolling features: {'MA_Close' in df.columns}")
        
        return True
    except Exception as e:
        print(f"❌ Feature engineering failed: {e}")
        return False

def test_modeling():
    """Test modeling modules"""
    print("\n🤖 Testing Modeling...")
    
    try:
        from modeling.prophet_model import load_features, train_prophet
        df = load_features()
        print(f"✅ Prophet data loaded: {df.shape[0]} rows")
        
        forecast = train_prophet(df)
        print(f"✅ Prophet forecast: {len(forecast)} predictions")
        
        from modeling.xgboost_model import train_xgboost_model, predict_xgboost
        if len(df) >= 50:  # XGBoost needs more data
            model_results = train_xgboost_model(df)
            print(f"✅ XGBoost trained: RMSE={model_results['test_rmse']:.4f}")
            
            predictions = predict_xgboost(model_results, df, 30)
            print(f"✅ XGBoost predictions: {len(predictions)} forecasts")
        else:
            print("⚠️ Insufficient data for XGBoost testing")
        
        return True
    except Exception as e:
        print(f"❌ Modeling failed: {e}")
        return False

def test_evaluation():
    """Test evaluation modules"""
    print("\n📈 Testing Evaluation...")
    
    try:
        from evaluation.metrics import ModelEvaluator
        import numpy as np
        
        evaluator = ModelEvaluator()
        
        # Test with sample data
        actual = np.array([100, 101, 102, 103, 104])
        predicted = np.array([100.5, 101.2, 101.8, 102.5, 103.1])
        
        metrics = evaluator.evaluate_model(actual, predicted)
        print(f"✅ Metrics calculated: {len(metrics)} metrics")
        print(f"✅ RMSE: {metrics['RMSE']:.4f}")
        print(f"✅ MAE: {metrics['MAE']:.4f}")
        
        return True
    except Exception as e:
        print(f"❌ Evaluation failed: {e}")
        return False

def test_visualization():
    """Test visualization modules"""
    print("\n📊 Testing Visualization...")
    
    try:
        from visualization.plot_forecast import (
            plot_forecast_with_sentiment,
            plot_volatility_analysis,
            create_interactive_dashboard
        )
        from modeling.prophet_model import load_features, train_prophet
        
        df = load_features()
        forecast = train_prophet(df)
        
        # Test matplotlib plots
        fig1 = plot_forecast_with_sentiment(df, forecast)
        print("✅ Matplotlib forecast plot created")
        
        fig2 = plot_volatility_analysis(df, forecast)
        print("✅ Matplotlib volatility plot created")
        
        # Test plotly dashboard
        interactive_fig = create_interactive_dashboard(df, forecast)
        print("✅ Interactive dashboard created")
        
        return True
    except Exception as e:
        print(f"❌ Visualization failed: {e}")
        return False

def start_api_server():
    """Start API server in background"""
    print("\n🚀 Starting API server...")
    
    try:
        # Start API server in background
        process = subprocess.Popen([
            sys.executable, "api/main.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        time.sleep(10)
        
        # Check if server is running
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("✅ API server started successfully")
                return process
            else:
                print(f"❌ API server health check failed: {response.status_code}")
                process.terminate()
                return None
        except requests.exceptions.RequestException as e:
            print(f"❌ API server not responding: {e}")
            process.terminate()
            return None
            
    except Exception as e:
        print(f"❌ Failed to start API server: {e}")
        return None

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API Endpoints...")
    
    api_process = start_api_server()
    if not api_process:
        return False
    
    try:
        base_url = "http://localhost:8000"
        
        # Test health endpoint
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test forecast endpoint
        forecast_data = {
            "ticker": "AAPL",
            "days": 30,
            "use_real_sentiment": True,
            "model_type": "prophet"
        }
        response = requests.post(f"{base_url}/forecast", json=forecast_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Forecast endpoint: {len(data['predictions'])} predictions")
        else:
            print(f"❌ Forecast endpoint failed: {response.status_code}")
            return False
        
        # Test sentiment endpoint
        sentiment_data = {
            "ticker": "AAPL",
            "days_back": 7
        }
        response = requests.post(f"{base_url}/sentiment", json=sentiment_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sentiment endpoint: {len(data['sentiment_data'])} days")
        else:
            print(f"❌ Sentiment endpoint failed: {response.status_code}")
            return False
        
        # Test evaluation endpoint
        eval_data = {
            "ticker": "AAPL",
            "train_ratio": 0.8,
            "use_real_sentiment": True
        }
        response = requests.post(f"{base_url}/evaluate", json=eval_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Evaluation endpoint: {len(data['model_metrics'])} models")
        else:
            print(f"❌ Evaluation endpoint failed: {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ API testing failed: {e}")
        return False
    finally:
        if api_process:
            api_process.terminate()
            print("🛑 API server stopped")

def test_scheduler():
    """Test scheduler module"""
    print("\n⏰ Testing Scheduler...")
    
    try:
        from scripts.scheduler import StockAnalysisScheduler
        
        scheduler = StockAnalysisScheduler()
        print("✅ Scheduler initialized")
        
        # Test individual methods
        scheduler.health_check()
        print("✅ Health check method working")
        
        return True
    except Exception as e:
        print(f"❌ Scheduler testing failed: {e}")
        return False

def main():
    """Main test function"""
    print("Stock Analysis System - Comprehensive Test")
    print("=" * 60)
    
    tests = [
        ("Data Ingestion", test_data_ingestion),
        ("Feature Engineering", test_feature_engineering),
        ("Modeling", test_modeling),
        ("Evaluation", test_evaluation),
        ("Visualization", test_visualization),
        ("Scheduler", test_scheduler),
        ("API Endpoints", test_api_endpoints),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"Running: {test_name}")
        print('='*60)
        
        try:
            success = test_func()
            results[test_name] = success
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("📋 TEST SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name:<20} {status}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! System is ready to use.")
        print("\nNext steps:")
        print("1. Run: python api/main.py")
        print("2. Open: http://localhost:8000/docs")
        print("3. For frontend: cd frontend && npm start")
    else:
        print(f"\n⚠️ {total - passed} tests failed. Please check the errors above.")
        print("Try running: python setup.py")

if __name__ == "__main__":
    main()
