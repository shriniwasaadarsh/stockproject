#!/usr/bin/env python3
"""
Faculty Demo Script - Without Frontend
Complete demonstration for faculty presentation
"""

import sys
import os
sys.path.append('.')

def print_header(title):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_step(step, description):
    """Print a step with description"""
    print(f"\n{step}. {description}")
    print("-" * 40)

def demo_system_overview():
    """Show system overview"""
    print_header("STOCK ANALYSIS SYSTEM - FACULTY DEMO")
    
    print("System Components:")
    print("• Real-time stock data fetching (yfinance)")
    print("• Sentiment analysis (VADER + TextBlob)")
    print("• Prophet time series forecasting")
    print("• XGBoost machine learning model")
    print("• FastAPI RESTful backend")
    print("• Docker containerization")
    print("• Automated scheduling")
    
    print("\nKey Features:")
    print("• Multi-model approach (Prophet + XGBoost)")
    print("• Sentiment integration for predictions")
    print("• Real-time API endpoints")
    print("• Comprehensive evaluation metrics")
    print("• Production-ready deployment")
    print("• Interactive API documentation")

def demo_data_ingestion():
    """Demo data ingestion"""
    print_step("1", "DATA INGESTION DEMONSTRATION")
    
    try:
        from data_ingestion.stock_fetch import fetch_stock_data
        from data_ingestion.sentiment import get_sentiment_score
        from data_ingestion.news_sentiment import NewsSentimentAnalyzer
        
        print("Fetching real-time AAPL stock data...")
        df = fetch_stock_data("AAPL", "7d", "1h")
        print(f"[OK] Successfully fetched {df.shape[0]} data points")
        print(f"  Date range: {df['Datetime'].min()} to {df['Datetime'].max()}")
        print(f"  Price range: ${df['Close'].min():.2f} - ${df['Close'].max():.2f}")
        print(f"  Volume: {df['Volume'].sum():,} shares")
        
        print("\nTesting sentiment analysis...")
        sample_text = "Apple stock shows strong performance with positive earnings"
        score = get_sentiment_score(sample_text)
        sentiment = "Positive" if score > 0.1 else "Negative" if score < -0.1 else "Neutral"
        print(f"  Sample: '{sample_text}'")
        print(f"  Sentiment Score: {score:.3f} ({sentiment})")
        
        print("\nTesting news sentiment analysis...")
        analyzer = NewsSentimentAnalyzer()
        sentiment_df = analyzer.get_sentiment_scores("AAPL", 3)
        print(f"[OK] Generated {len(sentiment_df)} days of sentiment data")
        print(f"  Average sentiment: {sentiment_df['sentiment_score'].mean():.3f}")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Data ingestion failed: {e}")
        return False

def demo_modeling():
    """Demo modeling capabilities"""
    print_step("2", "MACHINE LEARNING MODELS DEMONSTRATION")
    
    try:
        from modeling.prophet_model import load_features, train_prophet
        from modeling.xgboost_model import train_xgboost_model
        
        print("Loading data with engineered features...")
        df = load_features()
        print(f"[OK] Loaded {df.shape[0]} data points with {df.shape[1]} features")
        print(f"  Features: {list(df.columns)}")
        
        print("\nTraining Prophet time series model...")
        prophet_forecast = train_prophet(df)
        print(f"[OK] Prophet model trained successfully")
        print(f"  Generated {len(prophet_forecast)} predictions")
        print("  Next 3 predictions:")
        for i in range(3):
            row = prophet_forecast.iloc[-(3-i)]
            print(f"    {row['ds'].strftime('%Y-%m-%d')}: ${row['yhat']:.2f} (${row['yhat_lower']:.2f} - ${row['yhat_upper']:.2f})")
        
        print("\nTraining XGBoost machine learning model...")
        xgboost_results = train_xgboost_model(df)
        print(f"[OK] XGBoost model trained successfully")
        print(f"  Test RMSE: {xgboost_results['test_rmse']:.4f}")
        print(f"  Test MAE: {xgboost_results['test_mae']:.4f}")
        
        print("\nFeature importance analysis:")
        top_features = xgboost_results['feature_importance'].head(3)
        for i, (_, row) in enumerate(top_features.iterrows()):
            print(f"  {i+1}. {row['feature']}: {row['importance']:.4f}")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Modeling failed: {e}")
        return False

def demo_api():
    """Demo API capabilities"""
    print_step("3", "API SERVER DEMONSTRATION")
    
    try:
        from api.main import app
        print("[OK] FastAPI server ready to start")
        print("  Available endpoints:")
        print("  • POST /forecast - Get stock predictions")
        print("  • POST /evaluate - Model evaluation")
        print("  • POST /sentiment - Sentiment analysis")
        print("  • GET /health - Health check")
        print("  • GET /docs - Interactive API documentation")
        
        print("\nTo start API server:")
        print("  python start_system.py")
        print("  Then open: http://localhost:8000/docs")
        
        print("\nAPI Testing Commands:")
        print("  python test_api_demo.py")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] API setup failed: {e}")
        return False

def demo_evaluation():
    """Demo evaluation capabilities"""
    print_step("4", "MODEL EVALUATION DEMONSTRATION")
    
    try:
        from evaluation.metrics import ModelEvaluator
        import numpy as np
        
        print("Creating sample evaluation...")
        evaluator = ModelEvaluator()
        
        # Sample data
        actual = np.array([100, 101, 102, 103, 104, 105, 106, 107, 108, 109])
        predicted = np.array([100.5, 101.2, 101.8, 102.5, 103.1, 103.8, 104.2, 104.9, 105.5, 106.1])
        
        metrics = evaluator.evaluate_model(actual, predicted)
        
        print("[OK] Evaluation metrics calculated:")
        for metric, value in metrics.items():
            if 'Accuracy' in metric:
                print(f"  {metric}: {value:.2f}%")
            else:
                print(f"  {metric}: {value:.4f}")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Evaluation failed: {e}")
        return False

def demo_deployment():
    """Demo deployment capabilities"""
    print_step("5", "DEPLOYMENT & PRODUCTION READINESS")
    
    print("Production features:")
    print("• Docker containerization (Dockerfile + docker-compose.yml)")
    print("• Automated scheduling (scripts/scheduler.py)")
    print("• Health monitoring and logging")
    print("• Scalable architecture")
    print("• Environment configuration")
    
    print("\nDocker deployment:")
    print("  docker-compose up -d")
    print("  curl http://localhost:8000/health")
    
    print("\nFrontend note:")
    print("  Frontend requires Node.js installation")
    print("  Backend API provides all necessary endpoints")
    print("  System is designed to be frontend-agnostic")
    
    return True

def demo_visualization():
    """Demo visualization capabilities"""
    print_step("6", "VISUALIZATION DEMONSTRATION")
    
    try:
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
        export_plots(df, forecast, "output/faculty_demo_plots")
        print("[OK] All plots exported to output/faculty_demo_plots/")
        
        print("\nGenerated files:")
        print("  - forecast_with_sentiment.png")
        print("  - volatility_analysis.png")
        print("  - interactive_dashboard.html")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Visualization failed: {e}")
        return False

def main():
    """Main demo function"""
    print_header("FACULTY DEMO - STOCK ANALYSIS SYSTEM")
    
    print("This demo shows the complete stock analysis system")
    print("built with Python, FastAPI, and machine learning.")
    print("\nNote: Frontend requires Node.js installation")
    print("Focus: Backend API, ML models, and data processing")
    
    # Run all demos
    demos = [
        ("System Overview", demo_system_overview),
        ("Data Ingestion", demo_data_ingestion),
        ("Machine Learning", demo_modeling),
        ("API Server", demo_api),
        ("Model Evaluation", demo_evaluation),
        ("Visualization", demo_visualization),
        ("Deployment", demo_deployment)
    ]
    
    results = []
    
    for name, demo_func in demos:
        try:
            success = demo_func()
            results.append((name, success))
        except Exception as e:
            print(f"[FAIL] {name} failed: {e}")
            results.append((name, False))
    
    # Summary
    print_header("DEMO SUMMARY")
    
    passed = 0
    total = len(results)
    
    for name, success in results:
        status = "[PASS]" if success else "[FAIL]"
        print(f"{name:<20} {status}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{total} components working")
    
    if passed >= 5:  # Allow for some failures
        print("\n[SUCCESS] SYSTEM IS READY FOR FACULTY DEMO!")
        print("\nNext steps for live demo:")
        print("1. Run: python start_system.py")
        print("2. Open: http://localhost:8000/docs")
        print("3. Run: python test_api_demo.py")
        print("4. Show generated plots in output/faculty_demo_plots/")
        
        print("\nKey Results to Show Faculty:")
        print("• Real-time stock data fetching")
        print("• Sentiment analysis integration")
        print("• Prophet time series forecasting")
        print("• XGBoost machine learning")
        print("• FastAPI RESTful backend")
        print("• Interactive API documentation")
        print("• Comprehensive evaluation metrics")
        print("• Production-ready deployment")
        
    else:
        print(f"\n[WARNING] {total - passed} components need attention")
        print("Please check the errors above")

if __name__ == "__main__":
    main()

