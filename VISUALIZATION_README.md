# 📊 Enhanced Stock Visualization Features

This document describes the enhanced visualization capabilities added to the stock analysis project.

## 🚀 New Features

### 1. Sentiment-Enhanced Forecast Plots
- **File**: `visualization/plot_forecast.py` → `plot_forecast_with_sentiment()`
- **Features**:
  - Price forecast with confidence intervals
  - Sentiment-colored data points (red for negative, green for positive)
  - Separate sentiment score timeline
  - Dual-axis layout for comprehensive analysis

### 2. Volatility Analysis Plots
- **File**: `visualization/plot_forecast.py` → `plot_volatility_analysis()`
- **Features**:
  - Rolling volatility overlay on price chart
  - Volatility vs forecast confidence width comparison
  - Historical volatility trends
  - Risk assessment visualization

### 3. Interactive Dashboard
- **File**: `visualization/plot_forecast.py` → `create_interactive_dashboard()`
- **Features**:
  - Interactive Plotly charts
  - Multi-panel layout (Price, Sentiment, Volatility)
  - Hover tooltips and zoom capabilities
  - Exportable HTML dashboard

### 4. Export Functionality
- **File**: `visualization/plot_forecast.py` → `export_plots()`
- **Features**:
  - High-resolution PNG exports (300 DPI)
  - Interactive HTML dashboard export
  - Organized output directory structure

## 📁 Generated Files

When you run the visualization scripts, the following files are created in the `output/` directory:

```
output/
├── forecast_with_sentiment.png      # Main forecast with sentiment overlay
├── volatility_analysis.png          # Volatility vs confidence analysis
├── interactive_dashboard.html       # Interactive Plotly dashboard
├── sentiment_forecast_demo.png      # Demo sentiment plot
├── volatility_demo.png              # Demo volatility plot
└── interactive_demo.html            # Demo interactive dashboard
```

## 🛠️ Usage

### Basic Usage
```python
from visualization.plot_forecast import (
    plot_forecast_with_sentiment,
    plot_volatility_analysis,
    create_interactive_dashboard,
    export_plots
)
from modeling.prophet_model import load_features, train_prophet

# Load data and train model
df = load_features()
forecast = train_prophet(df)

# Create visualizations
fig1 = plot_forecast_with_sentiment(df, forecast)
fig2 = plot_volatility_analysis(df, forecast)
interactive_fig = create_interactive_dashboard(df, forecast)

# Export all plots
export_plots(df, forecast, 'output')
```

### Run Demo Script
```bash
python demo_visualizations.py
```

### Run Main Visualization
```bash
python visualization/plot_forecast.py
```

## 📊 Visualization Details

### Sentiment-Enhanced Forecast
- **Top Panel**: Price forecast with sentiment-colored scatter points
- **Bottom Panel**: Sentiment score timeline with zero-line reference
- **Colors**: Red (negative sentiment), Green (positive sentiment)
- **Features**: Confidence intervals, dual y-axes, grid lines

### Volatility Analysis
- **Top Panel**: Price forecast with volatility overlay (red line)
- **Bottom Panel**: Historical volatility vs forecast confidence width
- **Purpose**: Risk assessment and model confidence evaluation
- **Features**: Comparative analysis, trend identification

### Interactive Dashboard
- **Panel 1**: Stock price forecast with confidence bands
- **Panel 2**: Sentiment analysis timeline
- **Panel 3**: Volatility trends
- **Features**: Zoom, pan, hover tooltips, legend toggles

## 🔧 Dependencies

The enhanced visualization requires these additional packages:
- `plotly>=5.0.0` - Interactive charts
- `matplotlib>=3.5.0` - Static plots
- `numpy>=1.21.0` - Numerical operations

Install with:
```bash
pip install -r requirements.txt
```

## 📈 Key Insights

### Sentiment Analysis
- Visual correlation between sentiment and price movements
- Identification of sentiment-driven price patterns
- Market mood assessment over time

### Volatility Analysis
- Risk level assessment through rolling volatility
- Model confidence evaluation via confidence intervals
- Volatility clustering identification

### Interactive Features
- Real-time data exploration
- Customizable time ranges
- Detailed hover information
- Professional presentation format

## 🎯 Use Cases

1. **Investment Analysis**: Comprehensive stock analysis with multiple perspectives
2. **Risk Assessment**: Volatility and confidence interval analysis
3. **Market Sentiment**: Understanding market mood and its impact
4. **Presentation**: Professional charts for reports and presentations
5. **Research**: Interactive exploration of stock data patterns

## 🔄 Integration

The enhanced visualizations integrate seamlessly with the existing pipeline:
- Uses the same data from `load_features()`
- Compatible with Prophet model outputs
- Maintains existing functionality while adding new features
- Export-ready for various use cases

## 📝 Notes

- All plots are generated with high resolution (300 DPI) for publication quality
- Interactive dashboards work in any modern web browser
- PNG exports are optimized for both screen and print viewing
- The system handles missing data gracefully with proper error handling
