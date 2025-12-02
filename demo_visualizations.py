#!/usr/bin/env python3
"""
Demo script for enhanced stock visualization features
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from visualization.plot_forecast import (
    plot_forecast_with_sentiment, 
    plot_volatility_analysis, 
    create_interactive_dashboard,
    export_plots
)
from modeling.prophet_model import load_features, train_prophet

def main():
    print("Enhanced Stock Visualization Demo")
    print("=" * 50)
    
    # Load data and train model
    print("Loading data and training Prophet model...")
    df = load_features()
    forecast = train_prophet(df)
    
    print(f"Data loaded: {df.shape[0]} data points")
    print(f"Model trained: {forecast.shape[0]} forecast points")
    
    # Create individual visualizations
    print("\nCreating enhanced visualizations...")
    
    # 1. Sentiment-enhanced forecast
    print("1. Creating sentiment-enhanced forecast plot...")
    fig1 = plot_forecast_with_sentiment(df, forecast)
    fig1.savefig('output/sentiment_forecast_demo.png', dpi=300, bbox_inches='tight')
    print("   Saved: output/sentiment_forecast_demo.png")
    
    # 2. Volatility analysis
    print("2. Creating volatility analysis plot...")
    fig2 = plot_volatility_analysis(df, forecast)
    fig2.savefig('output/volatility_demo.png', dpi=300, bbox_inches='tight')
    print("   Saved: output/volatility_demo.png")
    
    # 3. Interactive dashboard
    print("3. Creating interactive dashboard...")
    interactive_fig = create_interactive_dashboard(df, forecast)
    interactive_fig.write_html('output/interactive_demo.html')
    print("   Saved: output/interactive_demo.html")
    
    # Export all plots
    print("\nExporting all plots...")
    export_plots(df, forecast, 'output')
    
    print("\nDemo completed successfully!")
    print("\nGenerated files:")
    print("forecast_with_sentiment.png - Price forecast with sentiment overlays")
    print("volatility_analysis.png - Volatility vs confidence intervals")
    print("interactive_dashboard.html - Interactive Plotly dashboard")
    print("Additional demo files in output/ directory")

if __name__ == "__main__":
    main()
