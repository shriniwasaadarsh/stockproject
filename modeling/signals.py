"""
Automated signal generation for algorithmic trading
Risk management through anomaly detection
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta

def generate_trading_signals(df: pd.DataFrame, forecast: pd.DataFrame) -> Dict:
    """
    Generate automated trading signals based on predictions and technical indicators
    
    Signals:
    - BUY: Strong upward trend predicted
    - SELL: Strong downward trend predicted
    - HOLD: Neutral or uncertain
    """
    signals = []
    signal_strength = []
    
    if len(forecast) < 2:
        return {"signals": [], "summary": {}}
    
    # Calculate price change predictions
    price_changes = forecast['yhat'].pct_change().fillna(0)
    
    # Calculate volatility
    volatility = df['Volatility'].iloc[-1] if 'Volatility' in df.columns else 0
    
    # Get sentiment if available
    sentiment = df['Sentiment'].iloc[-1] if 'Sentiment' in df.columns else 0
    
    for i in range(len(forecast)):
        pred_change = price_changes.iloc[i] if i < len(price_changes) else 0
        confidence_width = forecast.iloc[i]['yhat_upper'] - forecast.iloc[i]['yhat_lower']
        confidence_ratio = confidence_width / forecast.iloc[i]['yhat'] if forecast.iloc[i]['yhat'] > 0 else 1
        
        # Signal generation logic
        if pred_change > 0.02 and confidence_ratio < 0.1 and sentiment > 0.1:
            signal = "STRONG_BUY"
            strength = min(100, (pred_change * 1000 + (sentiment * 50) + (1 - confidence_ratio) * 50))
        elif pred_change > 0.01 and confidence_ratio < 0.15:
            signal = "BUY"
            strength = min(100, (pred_change * 500 + (1 - confidence_ratio) * 30))
        elif pred_change < -0.02 and confidence_ratio < 0.1 and sentiment < -0.1:
            signal = "STRONG_SELL"
            strength = min(100, abs(pred_change * 1000 + (sentiment * 50) + (1 - confidence_ratio) * 50))
        elif pred_change < -0.01 and confidence_ratio < 0.15:
            signal = "SELL"
            strength = min(100, abs(pred_change * 500 + (1 - confidence_ratio) * 30))
        else:
            signal = "HOLD"
            strength = 50 - abs(pred_change * 100)
        
        signals.append({
            "date": forecast.iloc[i]['ds'].isoformat() if hasattr(forecast.iloc[i]['ds'], 'isoformat') else str(forecast.iloc[i]['ds']),
            "signal": signal,
            "strength": float(max(0, min(100, strength))),
            "predicted_change": float(pred_change * 100),
            "confidence": float(1 - confidence_ratio)
        })
        signal_strength.append(strength)
    
    # Summary statistics
    buy_signals = sum(1 for s in signals if 'BUY' in s['signal'])
    sell_signals = sum(1 for s in signals if 'SELL' in s['signal'])
    hold_signals = sum(1 for s in signals if s['signal'] == 'HOLD')
    
    avg_strength = np.mean(signal_strength) if signal_strength else 50
    
    return {
        "signals": signals,
        "summary": {
            "total_signals": len(signals),
            "buy_signals": buy_signals,
            "sell_signals": sell_signals,
            "hold_signals": hold_signals,
            "average_strength": float(avg_strength),
            "recommendation": "STRONG_BUY" if buy_signals > sell_signals * 2 and avg_strength > 70 else
                            "BUY" if buy_signals > sell_signals and avg_strength > 60 else
                            "STRONG_SELL" if sell_signals > buy_signals * 2 and avg_strength > 70 else
                            "SELL" if sell_signals > buy_signals and avg_strength > 60 else
                            "HOLD"
        }
    }

def detect_anomalies(df: pd.DataFrame, forecast: pd.DataFrame) -> Dict:
    """
    Detect anomalies for risk management
    Uses statistical methods to identify unusual patterns
    """
    anomalies = []
    
    if len(df) < 10:
        return {"anomalies": [], "risk_level": "LOW"}
    
    # Calculate z-scores for recent prices
    recent_prices = df['y'].tail(20).values
    mean_price = np.mean(recent_prices)
    std_price = np.std(recent_prices)
    
    if std_price == 0:
        return {"anomalies": [], "risk_level": "LOW"}
    
    # Check for price anomalies
    current_price = df['y'].iloc[-1]
    z_score = (current_price - mean_price) / std_price
    
    if abs(z_score) > 2:
        anomalies.append({
            "type": "PRICE_ANOMALY",
            "severity": "HIGH" if abs(z_score) > 3 else "MEDIUM",
            "description": f"Price deviation of {z_score:.2f} standard deviations",
            "current_price": float(current_price),
            "expected_range": [float(mean_price - 2*std_price), float(mean_price + 2*std_price)]
        })
    
    # Check for volatility anomalies
    if 'Volatility' in df.columns:
        recent_vol = df['Volatility'].tail(20).values
        mean_vol = np.mean(recent_vol)
        std_vol = np.std(recent_vol)
        
        if std_vol > 0:
            current_vol = df['Volatility'].iloc[-1]
            vol_z_score = (current_vol - mean_vol) / std_vol
            
            if vol_z_score > 2:
                anomalies.append({
                    "type": "VOLATILITY_SPIKE",
                    "severity": "HIGH" if vol_z_score > 3 else "MEDIUM",
                    "description": f"Volatility spike detected: {vol_z_score:.2f} standard deviations",
                    "current_volatility": float(current_vol),
                    "average_volatility": float(mean_vol)
                })
    
    # Check for sentiment anomalies
    if 'Sentiment' in df.columns:
        recent_sentiment = df['Sentiment'].tail(20).values
        mean_sentiment = np.mean(recent_sentiment)
        std_sentiment = np.std(recent_sentiment)
        
        if std_sentiment > 0:
            current_sentiment = df['Sentiment'].iloc[-1]
            sent_z_score = abs(current_sentiment - mean_sentiment) / std_sentiment
            
            if sent_z_score > 2:
                anomalies.append({
                    "type": "SENTIMENT_SHIFT",
                    "severity": "MEDIUM",
                    "description": f"Significant sentiment shift detected",
                    "current_sentiment": float(current_sentiment),
                    "average_sentiment": float(mean_sentiment)
                })
    
    # Determine overall risk level
    high_risk_count = sum(1 for a in anomalies if a['severity'] == 'HIGH')
    medium_risk_count = sum(1 for a in anomalies if a['severity'] == 'MEDIUM')
    
    if high_risk_count > 0:
        risk_level = "HIGH"
    elif medium_risk_count >= 2:
        risk_level = "MEDIUM"
    elif len(anomalies) > 0:
        risk_level = "LOW"
    else:
        risk_level = "LOW"
    
    return {
        "anomalies": anomalies,
        "risk_level": risk_level,
        "anomaly_count": len(anomalies)
    }

def calculate_portfolio_metrics(tickers: List[str], weights: List[float], 
                               price_data: Dict[str, pd.DataFrame]) -> Dict:
    """
    Calculate portfolio optimization metrics
    """
    if len(tickers) != len(weights) or abs(sum(weights) - 1.0) > 0.01:
        return {"error": "Invalid portfolio configuration"}
    
    portfolio_returns = []
    portfolio_volatility = []
    valid_tickers = []
    valid_weights = []
    
    for ticker, weight in zip(tickers, weights):
        if ticker not in price_data:
            continue
        
        df = price_data[ticker]
        
        # Check for 'y' column (already processed) or 'Close' column (raw data)
        price_col = 'y' if 'y' in df.columns else 'Close' if 'Close' in df.columns else None
        
        if price_col is None or len(df) < 2:
            continue
        
        # Calculate returns
        returns = df[price_col].pct_change().dropna()
        if len(returns) == 0:
            continue
            
        portfolio_returns.append(returns * weight)
        valid_tickers.append(ticker)
        valid_weights.append(weight)
        
        # Get volatility if available
        if 'Volatility' in df.columns:
            portfolio_volatility.append(df['Volatility'].iloc[-1] * weight)
        else:
            # Calculate volatility from returns
            vol = returns.std() if len(returns) > 0 else 0
            portfolio_volatility.append(vol * weight)
    
    if not portfolio_returns:
        return {"error": "No valid data for portfolio calculation. Please ensure all tickers have valid price data."}
    
    # Align all return series to same index
    try:
        # Get common index
        common_index = portfolio_returns[0].index
        for ret in portfolio_returns[1:]:
            common_index = common_index.intersection(ret.index)
        
        if len(common_index) == 0:
            return {"error": "No overlapping dates for portfolio calculation"}
        
        # Align all returns to common index
        aligned_returns = [ret.loc[common_index] for ret in portfolio_returns]
        
        # Combine returns
        combined_returns = pd.concat(aligned_returns, axis=1).sum(axis=1)
        
        # Calculate metrics
        total_return = float(combined_returns.sum() * 100)  # Convert to percentage
        avg_return = float(combined_returns.mean() * 100)  # Convert to percentage
        portfolio_vol = float(combined_returns.std() * 100)  # Convert to percentage
        sharpe_ratio = float(avg_return / portfolio_vol) if portfolio_vol > 0 else 0
        
        return {
            "total_return": total_return,
            "average_return": avg_return,
            "volatility": portfolio_vol,
            "sharpe_ratio": sharpe_ratio,
            "portfolio_volatility": float(sum(portfolio_volatility) * 100) if portfolio_volatility else portfolio_vol,
            "tickers": valid_tickers,
            "weights": valid_weights
        }
    except Exception as e:
        return {"error": f"Error calculating portfolio metrics: {str(e)}"}

