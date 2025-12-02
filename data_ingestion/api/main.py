"""
FastAPI-based REST API for Stock Analysis System
Provides endpoints for forecasts, plots, metrics, and real-time data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import asyncio
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our modules
from modeling.prophet_model import load_features, train_prophet
from modeling.xgboost_model import train_xgboost_model, predict_xgboost
from modeling.signals import generate_trading_signals, detect_anomalies, calculate_portfolio_metrics
from evaluation.metrics import ModelEvaluator, evaluate_prophet_model
from data_ingestion.news_sentiment import NewsSentimentAnalyzer
from data_ingestion.stock_fetch import fetch_stock_data
from visualization.plot_forecast import (
    plot_forecast_with_sentiment,
    plot_volatility_analysis,
    create_interactive_dashboard,
    export_plots
)
import matplotlib.pyplot as plt

# Initialize FastAPI app
app = FastAPI(
    title="Stock Analysis API",
    description="Comprehensive stock analysis and prediction API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ForecastRequest(BaseModel):
    ticker: str = "AAPL"
    days: int = 30
    use_real_sentiment: bool = True
    model_type: str = "prophet"  # "prophet" or "xgboost"

class EvaluationRequest(BaseModel):
    ticker: str = "AAPL"
    train_ratio: float = 0.8
    use_real_sentiment: bool = True

class SentimentRequest(BaseModel):
    ticker: str = "AAPL"
    days_back: int = 7

class PortfolioRequest(BaseModel):
    tickers: List[str]
    weights: List[float]

class ForecastResponse(BaseModel):
    ticker: str
    forecast_date: str
    predictions: List[Dict]
    metrics: Dict
    status: str

class EvaluationResponse(BaseModel):
    ticker: str
    evaluation_date: str
    model_metrics: Dict
    best_model: str
    status: str

# Global cache for storing results
cache = {}

# Dynamic ticker list for background updates
monitored_tickers = ["AAPL", "GOOGL", "MSFT", "TSLA"]

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Stock Analysis API",
        "version": "2.0.0",
        "endpoints": {
            "forecast": "/forecast - Stock price forecasting",
            "evaluate": "/evaluate - Model evaluation and benchmarking",
            "sentiment": "/sentiment - Market sentiment analysis",
            "signals": "/signals - Automated trading signals",
            "anomalies": "/anomalies - Risk management and anomaly detection",
            "portfolio": "/portfolio - Portfolio optimization",
            "plots": "/plots - Visualization generation",
            "tickers": "/tickers - Get monitored tickers",
            "tickers/add": "/tickers/add - Add ticker to monitoring",
            "tickers/remove": "/tickers/remove - Remove ticker from monitoring",
            "tickers/update": "/tickers/update - Update monitored ticker list",
            "health": "/health - Health check"
        }
    }

@app.get("/favicon.ico")
async def favicon():
    """Favicon endpoint to prevent 404 errors"""
    from fastapi.responses import Response
    return Response(status_code=204)  # No Content

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/forecast", response_model=ForecastResponse)
async def get_forecast(request: ForecastRequest):
    """Get stock price forecast using Prophet or XGBoost model"""
    try:
        # Load data with specific ticker
        from data_ingestion.stock_fetch import fetch_stock_data
        from feature_engineering.feature import simulate_sentiment_data, add_rolling_features
        
        # Fetch stock data for the requested ticker
        stock_df = fetch_stock_data(ticker=request.ticker)
        stock_df = simulate_sentiment_data(stock_df, ticker=request.ticker)
        stock_df = add_rolling_features(stock_df)
        df = stock_df.rename(columns={'Datetime': 'ds', 'Close': 'y'})
        df['y'] = pd.to_numeric(df['y'], errors='coerce')
        df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
        df = df.dropna()
        
        if request.model_type.lower() == "xgboost":
            # Train XGBoost model
            model_results = train_xgboost_model(df)
            forecast = predict_xgboost(model_results, df, request.days)
            
            # Get recent predictions
            recent_forecast = forecast.tail(request.days)
            
            # Calculate basic metrics
            evaluator = ModelEvaluator()
            if len(df) > 0:
                actual = df['y'].values[-min(len(df), len(recent_forecast)):]
                predicted = recent_forecast['yhat'].values[-len(actual):]
                metrics = evaluator.evaluate_model(actual, predicted)
            else:
                metrics = {}
                
        else:
            # Train Prophet model (default)
            forecast = train_prophet(df)
            
            # Get recent predictions
            recent_forecast = forecast.tail(request.days)
            
            # Calculate basic metrics
            evaluator = ModelEvaluator()
            if len(df) > 0:
                actual = df['y'].values[-min(len(df), len(recent_forecast)):]
                predicted = recent_forecast['yhat'].values[-len(actual):]
                metrics = evaluator.evaluate_model(actual, predicted)
            else:
                metrics = {}
        
        # Format predictions
        predictions = []
        for _, row in recent_forecast.iterrows():
            predictions.append({
                "date": row['ds'].isoformat(),
                "predicted_price": float(row['yhat']),
                "lower_bound": float(row['yhat_lower']),
                "upper_bound": float(row['yhat_upper']),
                "confidence_width": float(row['yhat_upper'] - row['yhat_lower'])
            })
        
        # Cache results
        cache_key = f"forecast_{request.ticker}_{request.days}_{request.model_type}"
        cache[cache_key] = {
            "forecast": recent_forecast,
            "metrics": metrics,
            "timestamp": datetime.now()
        }
        
        return ForecastResponse(
            ticker=request.ticker,
            forecast_date=datetime.now().isoformat(),
            predictions=predictions,
            metrics=metrics,
            status="success"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_models(request: EvaluationRequest):
    """Evaluate models and compare performance"""
    try:
        # Load data
        df = load_features()
        
        # Split data
        split_idx = int(len(df) * request.train_ratio)
        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]
        
        if len(test_df) == 0:
            raise HTTPException(status_code=400, detail="Insufficient data for evaluation")
        
        # Train Prophet model
        prophet_model = train_prophet(train_df)
        
        # Get predictions for test period
        test_predictions = prophet_model['yhat'].values[-len(test_df):]
        test_actual = test_df['y'].values
        
        # Evaluate Prophet model
        evaluator = ModelEvaluator()
        prophet_metrics = evaluator.evaluate_model(test_actual, test_predictions)
        
        # Train and evaluate XGBoost model
        try:
            xgboost_results = train_xgboost_model(train_df)
            xgboost_predictions = xgboost_results['y_pred_test']
            xgboost_metrics = evaluator.evaluate_model(test_actual, xgboost_predictions)
        except Exception as e:
            print(f"XGBoost training failed: {e}")
            xgboost_metrics = {}
        
        # Evaluate baselines
        baselines = evaluator.evaluate_baselines(train_df['y'].values, test_actual)
        
        # Find best model
        all_metrics = {"Prophet": prophet_metrics}
        if xgboost_metrics:
            all_metrics["XGBoost"] = xgboost_metrics
        all_metrics.update(baselines)
        
        # Find best model by RMSE
        best_model = "Prophet"
        best_rmse = prophet_metrics.get('RMSE', float('inf'))
        
        for model_name, metrics in all_metrics.items():
            if model_name != "Prophet" and metrics.get('RMSE', float('inf')) < best_rmse:
                best_rmse = metrics['RMSE']
                best_model = model_name
        
        # Cache results
        cache_key = f"evaluation_{request.ticker}"
        cache[cache_key] = {
            "metrics": all_metrics,
            "best_model": best_model,
            "timestamp": datetime.now()
        }
        
        return EvaluationResponse(
            ticker=request.ticker,
            evaluation_date=datetime.now().isoformat(),
            model_metrics=all_metrics,
            best_model=best_model,
            status="success"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model evaluation failed: {str(e)}")

@app.post("/sentiment")
async def get_sentiment_analysis(request: SentimentRequest):
    """Get sentiment analysis for a ticker"""
    try:
        analyzer = NewsSentimentAnalyzer()
        sentiment_df = analyzer.get_sentiment_scores(request.ticker, request.days_back)
        
        # Format response
        sentiment_data = []
        for _, row in sentiment_df.iterrows():
            sentiment_data.append({
                "date": row['date'].isoformat(),
                "sentiment_score": float(row['sentiment_score']),
                "headline_count": int(row['headline_count'])
            })
        
        return {
            "ticker": request.ticker,
            "analysis_date": datetime.now().isoformat(),
            "sentiment_data": sentiment_data,
            "average_sentiment": float(sentiment_df['sentiment_score'].mean()),
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

@app.get("/plots/{plot_type}")
async def get_plots(plot_type: str, ticker: str = "AAPL"):
    """Generate and return plot files"""
    try:
        # Load data
        df = load_features()
        forecast = train_prophet(df)
        
        # Generate plots based on type
        if plot_type == "sentiment":
            fig = plot_forecast_with_sentiment(df, forecast)
            filename = f"forecast_with_sentiment_{ticker}.png"
        elif plot_type == "volatility":
            fig = plot_volatility_analysis(df, forecast)
            filename = f"volatility_analysis_{ticker}.png"
        elif plot_type == "interactive":
            interactive_fig = create_interactive_dashboard(df, forecast)
            interactive_fig.write_html(f"output/interactive_{ticker}.html")
            return FileResponse(f"output/interactive_{ticker}.html", media_type="text/html")
        else:
            raise HTTPException(status_code=400, detail="Invalid plot type")
        
        # Save plot
        os.makedirs("output", exist_ok=True)
        filepath = f"output/{filename}"
        fig.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close(fig)
        
        return FileResponse(filepath, media_type="image/png")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plot generation failed: {str(e)}")

@app.get("/plots/all")
async def get_all_plots(ticker: str = "AAPL"):
    """Generate all plots and return as zip file"""
    try:
        # Load data
        df = load_features()
        forecast = train_prophet(df)
        
        # Export all plots
        export_plots(df, forecast, f"output/{ticker}_plots")
        
        # Return directory listing
        plot_files = []
        output_dir = f"output/{ticker}_plots"
        if os.path.exists(output_dir):
            for file in os.listdir(output_dir):
                if file.endswith(('.png', '.html')):
                    plot_files.append(f"{output_dir}/{file}")
        
        return {
            "ticker": ticker,
            "generated_plots": plot_files,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plot generation failed: {str(e)}")

@app.post("/signals")
async def get_trading_signals(request: ForecastRequest):
    """Get automated trading signals for a ticker"""
    try:
        # Load data with specific ticker
        from data_ingestion.stock_fetch import fetch_stock_data
        from feature_engineering.feature import simulate_sentiment_data, add_rolling_features
        
        stock_df = fetch_stock_data(ticker=request.ticker)
        stock_df = simulate_sentiment_data(stock_df, ticker=request.ticker)
        stock_df = add_rolling_features(stock_df)
        df = stock_df.rename(columns={'Datetime': 'ds', 'Close': 'y'})
        df['y'] = pd.to_numeric(df['y'], errors='coerce')
        df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
        df = df.dropna()
        
        forecast = train_prophet(df) if request.model_type.lower() != "xgboost" else predict_xgboost(
            train_xgboost_model(df), df, request.days
        )
        
        signals = generate_trading_signals(df, forecast)
        
        return {
            "ticker": request.ticker,
            "signals": signals,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signal generation failed: {str(e)}")

@app.post("/anomalies")
async def get_anomalies(request: ForecastRequest):
    """Detect anomalies for risk management"""
    try:
        # Load data with specific ticker
        from data_ingestion.stock_fetch import fetch_stock_data
        from feature_engineering.feature import simulate_sentiment_data, add_rolling_features
        
        stock_df = fetch_stock_data(ticker=request.ticker)
        stock_df = simulate_sentiment_data(stock_df, ticker=request.ticker)
        stock_df = add_rolling_features(stock_df)
        df = stock_df.rename(columns={'Datetime': 'ds', 'Close': 'y'})
        df['y'] = pd.to_numeric(df['y'], errors='coerce')
        df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
        df = df.dropna()
        
        forecast = train_prophet(df) if request.model_type.lower() != "xgboost" else predict_xgboost(
            train_xgboost_model(df), df, request.days
        )
        
        anomalies = detect_anomalies(df, forecast)
        
        return {
            "ticker": request.ticker,
            "anomalies": anomalies,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.post("/portfolio")
async def analyze_portfolio(request: PortfolioRequest):
    """Analyze portfolio optimization"""
    try:
        if len(request.tickers) != len(request.weights):
            raise HTTPException(status_code=400, detail="Number of tickers must match number of weights")
        
        if abs(sum(request.weights) - 1.0) > 0.01:
            raise HTTPException(status_code=400, detail="Weights must sum to 1.0")
        
        # Fetch data for all tickers
        price_data = {}
        for ticker in request.tickers:
            try:
                df = fetch_stock_data(ticker)
                from feature_engineering.feature import simulate_sentiment_data, add_rolling_features
                df = simulate_sentiment_data(df, ticker=ticker)
                df = add_rolling_features(df)
                price_data[ticker] = df
            except Exception as e:
                print(f"Error fetching data for {ticker}: {e}")
        
        portfolio_metrics = calculate_portfolio_metrics(request.tickers, request.weights, price_data)
        
        return {
            "portfolio": portfolio_metrics,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio analysis failed: {str(e)}")

@app.get("/metrics/{ticker}")
async def get_metrics(ticker: str = "AAPL"):
    """Get cached metrics for a ticker"""
    cache_key = f"evaluation_{ticker}"
    
    if cache_key not in cache:
        raise HTTPException(status_code=404, detail="No cached metrics found. Run evaluation first.")
    
    cached_data = cache[cache_key]
    
    # Check if cache is still fresh (within 1 hour)
    if datetime.now() - cached_data['timestamp'] > timedelta(hours=1):
        raise HTTPException(status_code=410, detail="Cached metrics expired. Run evaluation again.")
    
    return {
        "ticker": ticker,
        "metrics": cached_data['metrics'],
        "best_model": cached_data['best_model'],
        "cached_at": cached_data['timestamp'].isoformat(),
        "status": "success"
    }

@app.get("/cache/clear")
async def clear_cache():
    """Clear all cached data"""
    global cache
    cache.clear()
    return {"message": "Cache cleared successfully", "status": "success"}

@app.get("/cache/status")
async def cache_status():
    """Get cache status and statistics"""
    cache_info = {}
    for key, value in cache.items():
        cache_info[key] = {
            "timestamp": value['timestamp'].isoformat(),
            "age_minutes": (datetime.now() - value['timestamp']).total_seconds() / 60
        }
    
    return {
        "total_entries": len(cache),
        "cache_info": cache_info,
        "status": "success"
    }

@app.get("/tickers")
async def get_monitored_tickers():
    """Get the list of tickers being monitored for background updates"""
    global monitored_tickers
    return {
        "monitored_tickers": monitored_tickers,
        "count": len(monitored_tickers),
        "status": "success"
    }

@app.post("/tickers/add")
async def add_monitored_ticker(ticker: str):
    """Add a ticker to the monitored list for background updates"""
    global monitored_tickers
    
    ticker_upper = ticker.upper().strip()
    
    if not ticker_upper:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")
    
    if ticker_upper in monitored_tickers:
        return {
            "message": f"{ticker_upper} is already being monitored",
            "monitored_tickers": monitored_tickers,
            "status": "info"
        }
    
    monitored_tickers.append(ticker_upper)
    logger.info(f"Added {ticker_upper} to monitored tickers")
    
    return {
        "message": f"Added {ticker_upper} to monitored list",
        "monitored_tickers": monitored_tickers,
        "status": "success"
    }

@app.delete("/tickers/remove")
async def remove_monitored_ticker(ticker: str):
    """Remove a ticker from the monitored list"""
    global monitored_tickers
    
    ticker_upper = ticker.upper().strip()
    
    if ticker_upper not in monitored_tickers:
        raise HTTPException(status_code=404, detail=f"{ticker_upper} is not in the monitored list")
    
    if len(monitored_tickers) <= 1:
        raise HTTPException(status_code=400, detail="Cannot remove the last monitored ticker")
    
    monitored_tickers.remove(ticker_upper)
    logger.info(f"Removed {ticker_upper} from monitored tickers")
    
    return {
        "message": f"Removed {ticker_upper} from monitored list",
        "monitored_tickers": monitored_tickers,
        "status": "success"
    }

@app.put("/tickers/update")
async def update_monitored_tickers(tickers: List[str]):
    """Update the entire list of monitored tickers"""
    global monitored_tickers
    
    if not tickers:
        raise HTTPException(status_code=400, detail="Ticker list cannot be empty")
    
    # Validate and clean tickers
    cleaned_tickers = [t.upper().strip() for t in tickers if t.strip()]
    
    if not cleaned_tickers:
        raise HTTPException(status_code=400, detail="No valid tickers provided")
    
    old_tickers = monitored_tickers.copy()
    monitored_tickers = cleaned_tickers
    logger.info(f"Updated monitored tickers from {old_tickers} to {monitored_tickers}")
    
    return {
        "message": "Monitored ticker list updated",
        "old_tickers": old_tickers,
        "new_tickers": monitored_tickers,
        "status": "success"
    }

# Background task for periodic updates
async def periodic_update():
    """Background task to update forecasts periodically"""
    while True:
        try:
            # Update forecasts for monitored tickers (dynamically updated list)
            global monitored_tickers
            
            logger.info(f"Running background update for tickers: {monitored_tickers}")
            
            for ticker in monitored_tickers:
                try:
                    # Fetch and cache data for each ticker
                    from data_ingestion.stock_fetch import fetch_stock_data
                    from feature_engineering.feature import simulate_sentiment_data, add_rolling_features
                    
                    stock_df = fetch_stock_data(ticker=ticker)
                    stock_df = simulate_sentiment_data(stock_df, ticker=ticker)
                    stock_df = add_rolling_features(stock_df)
                    df = stock_df.rename(columns={'Datetime': 'ds', 'Close': 'y'})
                    df['y'] = pd.to_numeric(df['y'], errors='coerce')
                    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
                    df = df.dropna()
                    
                    forecast = train_prophet(df)
                    
                    # Cache the forecast
                    cache_key = f"forecast_{ticker}_30_prophet"
                    cache[cache_key] = {
                        "forecast": forecast,
                        "timestamp": datetime.now()
                    }
                    
                    logger.info(f"Background update completed for {ticker}")
                    
                except Exception as e:
                    logger.error(f"Background update failed for {ticker}: {e}")
            
            # Wait 1 hour before next update
            await asyncio.sleep(3600)
            
        except Exception as e:
            logger.error(f"Background task error: {e}")
            await asyncio.sleep(300)  # Wait 5 minutes on error

@app.on_event("startup")
async def startup_event():
    """Startup event to initialize background tasks"""
    # Start background update task
    asyncio.create_task(periodic_update())
    print("Stock Analysis API started successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event"""
    print("Stock Analysis API shutting down...")

if __name__ == "__main__":
    # When running directly, use the correct module path for reload to work
    # When running via uvicorn module: uvicorn data_ingestion.api.main:app
    uvicorn.run(
        "data_ingestion.api.main:app",  # Use module path for reload support
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

