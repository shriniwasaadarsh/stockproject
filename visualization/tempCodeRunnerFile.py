import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from modeling.prophet_model import load_features, train_prophet

def plot_forecast_with_sentiment(df, forecast):
    """Enhanced forecast plot with sentiment overlays"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 10), height_ratios=[3, 1])
    
    # Main price plot
    ax1.plot(df['ds'], df['y'], label='Actual Price', color='black', linewidth=2)
    ax1.plot(forecast['ds'], forecast['yhat'], label='Forecast', color='blue', linewidth=2)
    ax1.fill_between(forecast['ds'], forecast['yhat_lower'], forecast['yhat_upper'], 
                     color='lightblue', alpha=0.3, label='Confidence Interval')
    
    # Sentiment overlay
    ax1_twin = ax1.twinx()
    sentiment_colors = ['red' if x < 0 else 'green' for x in df['Sentiment']]
    ax1_twin.scatter(df['ds'], df['y'], c=sentiment_colors, alpha=0.6, s=30, label='Sentiment')
    ax1_twin.set_ylabel('Price (Sentiment Colored)', fontsize=10)
    