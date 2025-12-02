#!/usr/bin/env python3
"""
Quick Demo for Faculty - Stock Analysis System
Simple demonstration without Unicode issues
"""

import sys
import os
sys.path.append('.')

def main():
    print("=" * 60)
    print("STOCK ANALYSIS SYSTEM - FACULTY DEMO")
    print("=" * 60)
    
    print("\nSystem Overview:")
    print("- Real-time stock data fetching")
    print("- Sentiment analysis (VADER + TextBlob)")
    print("- Prophet time series forecasting")
    print("- XGBoost machine learning model")
    print("- FastAPI RESTful backend")
    print("- React frontend dashboard")
    print("- Docker containerization")
    
    print("\n" + "=" * 60)
    print("DEMONSTRATION")
    print("=" * 60)
    
    try:
        # Test data ingestion
        print("\n1. Testing Data Ingestion...")
        from data_ingestion.stock_fetch import fetch_stock_data
        from data_ingestion.sentiment import get_sentiment_score
        
        df = fetch_stock_data("AAPL", "7d", "1h")
        print(f"   [OK] Fetched {df.shape[0]} data points")
        print(f"   Price range: ${df['Close'].min():.2f} - ${df['Close'].max():.2f}")
        
        score = get_sentiment_score("Apple stock shows strong performance")
        print(f"   [OK] Sentiment analysis working: {score:.3f}")
        
        # Test modeling
        print("\n2. Testing Machine Learning Models...")
        from modeling.prophet_model import load_features, train_prophet
        from modeling.xgboost_model import train_xgboost_model
        
        df_features = load_features()
        print(f"   [OK] Loaded {df_features.shape[0]} data points with {df_features.shape[1]} features")
        
        prophet_forecast = train_prophet(df_features)
        print(f"   [OK] Prophet model: {len(prophet_forecast)} predictions")
        
        xgboost_results = train_xgboost_model(df_features)
        print(f"   [OK] XGBoost model: RMSE {xgboost_results['test_rmse']:.4f}")
        
        # Test API
        print("\n3. Testing API Server...")
        from api.main import app
        print("   [OK] FastAPI server ready")
        print("   Available endpoints: /forecast, /evaluate, /sentiment, /health")
        
        # Test evaluation
        print("\n4. Testing Model Evaluation...")
        from evaluation.metrics import ModelEvaluator
        import numpy as np
        
        evaluator = ModelEvaluator()
        actual = np.array([100, 101, 102, 103, 104])
        predicted = np.array([100.5, 101.2, 101.8, 102.5, 103.1])
        metrics = evaluator.evaluate_model(actual, predicted)
        print(f"   [OK] Evaluation metrics: RMSE {metrics['RMSE']:.4f}")
        
        print("\n" + "=" * 60)
        print("DEMO COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
        print("\nAll systems are working properly!")
        print("\nTo start the full system:")
        print("1. Run: python start_system.py")
        print("2. Open: http://localhost:8000/docs")
        print("3. For frontend: cd frontend && npm start")
        
        print("\nKey Results:")
        print(f"- Stock data: {df.shape[0]} points fetched")
        print(f"- Prophet predictions: {len(prophet_forecast)} forecasts")
        print(f"- XGBoost RMSE: {xgboost_results['test_rmse']:.4f}")
        print(f"- Sentiment analysis: Working")
        print(f"- API server: Ready")
        print(f"- Evaluation: Working")
        
    except Exception as e:
        print(f"\n[ERROR] Demo failed: {e}")
        print("Please check that all dependencies are installed:")
        print("pip install -r requirements.txt")

if __name__ == "__main__":
    main()

