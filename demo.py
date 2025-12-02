#!/usr/bin/env python3
"""
Demo script for Stock Analysis System
Shows the system capabilities without starting the API server
"""

import sys
import os
sys.path.append('.')

def demo_data_ingestion():
    """Demo data ingestion capabilities"""
    print("\n" + "="*50)
    print("DATA INGESTION DEMO")
    print("="*50)
    
    from data_ingestion.stock_fetch import fetch_stock_data
    from data_ingestion.sentiment import get_sentiment_score
    from data_ingestion.news_sentiment import NewsSentimentAnalyzer
    
    # Fetch stock data
    print("Fetching AAPL stock data...")
    df = fetch_stock_data("AAPL", "7d", "1h")
    print(f"[OK] Fetched {df.shape[0]} data points")
    print(f"   Date range: {df['Datetime'].min()} to {df['Datetime'].max()}")
    print(f"   Price range: ${df['Close'].min():.2f} - ${df['Close'].max():.2f}")
    
    # Basic sentiment
    print("\nTesting sentiment analysis...")
    sample_texts = [
        "Apple stock is performing excellently with strong earnings",
        "Market concerns about Apple's future growth prospects",
        "Apple announces new product launch, investors optimistic"
    ]
    
    for text in sample_texts:
        score = get_sentiment_score(text)
        sentiment = "Positive" if score > 0.1 else "Negative" if score < -0.1 else "Neutral"
        print(f"   '{text[:50]}...' -> {score:.3f} ({sentiment})")
    
    # News sentiment
    print("\nTesting news sentiment analysis...")
    analyzer = NewsSentimentAnalyzer()
    sentiment_df = analyzer.get_sentiment_scores("AAPL", 3)
    print(f"[OK] Generated {len(sentiment_df)} days of sentiment data")
    print(f"   Average sentiment: {sentiment_df['sentiment_score'].mean():.3f}")

def demo_modeling():
    """Demo modeling capabilities"""
    print("\n" + "="*50)
    print("MODELING DEMO")
    print("="*50)
    
    from modeling.prophet_model import load_features, train_prophet
    from modeling.xgboost_model import train_xgboost_model, predict_xgboost
    
    # Load data with features
    print("Loading data with features...")
    df = load_features()
    print(f"[OK] Loaded {df.shape[0]} data points with {df.shape[1]} features")
    
    # Prophet model
    print("\nTraining Prophet model...")
    prophet_forecast = train_prophet(df)
    print(f"[OK] Prophet forecast: {len(prophet_forecast)} predictions")
    print(f"   Next 5 predictions:")
    for i in range(5):
        row = prophet_forecast.iloc[-(5-i)]
        print(f"   {row['ds'].strftime('%Y-%m-%d')}: ${row['yhat']:.2f} (${row['yhat_lower']:.2f} - ${row['yhat_upper']:.2f})")
    
    # XGBoost model
    print("\nTraining XGBoost model...")
    xgboost_results = train_xgboost_model(df)
    print(f"[OK] XGBoost trained successfully")
    print(f"   Test RMSE: {xgboost_results['test_rmse']:.4f}")
    print(f"   Test MAE: {xgboost_results['test_mae']:.4f}")
    
    # Feature importance
    print(f"\nTop 5 most important features:")
    for i, (_, row) in enumerate(xgboost_results['feature_importance'].head(5).iterrows()):
        print(f"   {i+1}. {row['feature']}: {row['importance']:.4f}")

def demo_evaluation():
    """Demo evaluation capabilities"""
    print("\n" + "="*50)
    print("EVALUATION DEMO")
    print("="*50)
    
    from evaluation.metrics import ModelEvaluator
    from modeling.prophet_model import load_features, train_prophet
    from modeling.xgboost_model import train_xgboost_model
    import numpy as np
    
    # Load data
    df = load_features()
    
    # Split data
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]
    
    print(f"Training set: {len(train_df)} points")
    print(f"Test set: {len(test_df)} points")
    
    # Train models
    print("\nTraining models...")
    prophet_forecast = train_prophet(train_df)
    xgboost_results = train_xgboost_model(train_df)
    
    # Get predictions
    prophet_pred = prophet_forecast['yhat'].values[-len(test_df):]
    xgboost_pred = xgboost_results['y_pred_test']
    actual = test_df['y'].values
    
    # Evaluate
    evaluator = ModelEvaluator()
    
    print("\nModel Performance Comparison:")
    print("-" * 40)
    
    # Prophet metrics
    prophet_metrics = evaluator.evaluate_model(actual, prophet_pred)
    print("Prophet Model:")
    for metric, value in prophet_metrics.items():
        if 'Accuracy' in metric:
            print(f"  {metric}: {value:.2f}%")
        else:
            print(f"  {metric}: {value:.4f}")
    
    # XGBoost metrics
    xgboost_metrics = evaluator.evaluate_model(actual, xgboost_pred)
    print("\nXGBoost Model:")
    for metric, value in xgboost_metrics.items():
        if 'Accuracy' in metric:
            print(f"  {metric}: {value:.2f}%")
        else:
            print(f"  {metric}: {value:.4f}")
    
    # Find best model
    if prophet_metrics['RMSE'] < xgboost_metrics['RMSE']:
        print(f"\n🏆 Best Model: Prophet (RMSE: {prophet_metrics['RMSE']:.4f})")
    else:
        print(f"\n🏆 Best Model: XGBoost (RMSE: {xgboost_metrics['RMSE']:.4f})")

def demo_visualization():
    """Demo visualization capabilities"""
    print("\n" + "="*50)
    print("VISUALIZATION DEMO")
    print("="*50)
    
    from visualization.plot_forecast import (
        plot_forecast_with_sentiment,
        plot_volatility_analysis,
        create_interactive_dashboard,
        export_plots
    )
    from modeling.prophet_model import load_features, train_prophet
    
    # Load data and create forecast
    df = load_features()
    forecast = train_prophet(df)
    
    print("Creating visualizations...")
    
    # Create plots
    fig1 = plot_forecast_with_sentiment(df, forecast)
    print("[OK] Forecast with sentiment plot created")
    
    fig2 = plot_volatility_analysis(df, forecast)
    print("[OK] Volatility analysis plot created")
    
    interactive_fig = create_interactive_dashboard(df, forecast)
    print("[OK] Interactive dashboard created")
    
    # Export plots
    export_plots(df, forecast, "output/demo_plots")
    print("[OK] All plots exported to output/demo_plots/")
    
    print("\nGenerated files:")
    print("  - forecast_with_sentiment.png")
    print("  - volatility_analysis.png")
    print("  - interactive_dashboard.html")

def main():
    """Main demo function"""
    print("Stock Analysis System - Demo")
    print("=" * 60)
    print("This demo shows the capabilities of the stock analysis system")
    print("without starting the API server.")
    
    try:
        demo_data_ingestion()
        demo_modeling()
        demo_evaluation()
        demo_visualization()
        
        print("\n" + "="*60)
        print("DEMO COMPLETED SUCCESSFULLY!")
        print("="*60)
        
        print("\nSystem capabilities demonstrated:")
        print("[OK] Real-time stock data fetching")
        print("[OK] Sentiment analysis (VADER + TextBlob)")
        print("[OK] Prophet time series forecasting")
        print("[OK] XGBoost machine learning")
        print("[OK] Model evaluation and comparison")
        print("[OK] Interactive visualizations")
        print("[OK] Comprehensive metrics")
        
        print("\nTo start the full system:")
        print("1. Run: python start_system.py")
        print("2. Open: http://localhost:8000/docs")
        print("3. For frontend: cd frontend && npm start")
        
    except Exception as e:
        print(f"\nDemo failed: {e}")
        print("Please check that all dependencies are installed:")
        print("pip install -r requirements.txt")

if __name__ == "__main__":
    main()
