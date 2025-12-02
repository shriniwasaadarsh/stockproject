# 📈 Stock Analysis System

A comprehensive stock analysis and prediction system with real-time sentiment analysis, machine learning models, and REST API.

## 🌟 Features

### 🔄 Real Sentiment Integration
- **VADER & TextBlob** sentiment analysis
- **News headline** processing
- **Real-time sentiment** scoring
- **API integration** (NewsAPI, Alpha Vantage)

### 📊 Advanced Evaluation
- **RMSE, MAPE, MAE** metrics
- **Directional accuracy** analysis
- **Baseline comparisons** (Naive, Moving Average, Linear Trend)
- **Confidence interval** coverage
- **Volatility prediction** accuracy

### 🌐 REST API
- **FastAPI**-based endpoints
- **Real-time forecasts**
- **Interactive plots**
- **Model evaluation**
- **Caching system**
- **Background tasks**

### 🚀 Production Ready
- **Docker** containerization
- **Scheduled tasks**
- **Health monitoring**
- **Scalable architecture**
- **Cloud deployment** ready

## 🏗️ Architecture

```
stock_project2/
├── data_ingestion/          # Data collection modules
│   ├── stock_fetch.py      # Stock data from yfinance
│   ├── sentiment.py        # Basic sentiment analysis
│   └── news_sentiment.py   # Real news sentiment (VADER/TextBlob)
├── feature_engineering/     # Feature creation
│   └── feature.py          # Sentiment + rolling features
├── modeling/               # ML models
│   └── prophet_model.py    # Prophet forecasting
├── evaluation/             # Model evaluation
│   ├── metrics.py          # Evaluation metrics
│   └── evaluate_models.py  # Comprehensive evaluation
├── visualization/          # Plotting and charts
│   └── plot_forecast.py    # Enhanced visualizations
├── api/                    # REST API
│   ├── main.py            # FastAPI application
│   └── client_example.py  # API client example
├── scripts/               # Automation
│   └── scheduler.py       # Scheduled tasks
└── output/               # Generated files
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd stock_project2

# Run automated setup
python setup.py

# Start API server
python api/main.py

# Start frontend (in another terminal)
cd frontend && npm start
```

### Option 2: Docker (Production)

```bash
# Clone repository
git clone <repository-url>
cd stock_project2

# Start all services
docker-compose up -d

# Check API
curl http://localhost:8000/health
```

### Option 3: Manual Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install

# Run API server
python api/main.py

# Run frontend (in another terminal)
cd frontend && npm start

# Run evaluation
python evaluation/evaluate_models.py

# Run scheduler
python scripts/scheduler.py
```

### Option 4: Test Everything

```bash
# Run comprehensive tests
python test_system.py
```

## 📡 API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/forecast` | POST | Get stock forecast (Prophet/XGBoost) |
| `/evaluate` | POST | Evaluate models |
| `/sentiment` | POST | Sentiment analysis |
| `/plots/{type}` | GET | Generate plots |
| `/metrics/{ticker}` | GET | Get cached metrics |

### Example API Usage

```python
import requests

# Get forecast with Prophet
response = requests.post("http://localhost:8000/forecast", json={
    "ticker": "AAPL",
    "days": 30,
    "use_real_sentiment": True,
    "model_type": "prophet"
})
forecast = response.json()

# Get forecast with XGBoost
response = requests.post("http://localhost:8000/forecast", json={
    "ticker": "AAPL",
    "days": 30,
    "use_real_sentiment": True,
    "model_type": "xgboost"
})
forecast = response.json()

# Get sentiment analysis
response = requests.post("http://localhost:8000/sentiment", json={
    "ticker": "AAPL",
    "days_back": 7
})
sentiment = response.json()
```

## 🖥️ Frontend Dashboard

### React Dashboard Features
- **Real-time stock forecasts** with Prophet and XGBoost models
- **Interactive charts** using Recharts
- **Sentiment analysis** visualization
- **Model comparison** and evaluation metrics
- **Responsive design** for mobile and desktop
- **Live data updates** from the API

### Dashboard Pages
- **Forecast Tab** - Price predictions with confidence intervals
- **Sentiment Tab** - Sentiment analysis over time
- **Evaluation Tab** - Model performance comparison

### Access Dashboard
```bash
# Start frontend
cd frontend && npm start

# Open browser to
http://localhost:3000
```

## 📊 Visualization Features

### Enhanced Plots
- **Sentiment overlays** on price charts
- **Volatility analysis** vs confidence intervals
- **Interactive dashboards** with Plotly
- **High-resolution exports** (PNG, HTML)

### Plot Types
- `forecast_with_sentiment` - Price + sentiment analysis
- `volatility_analysis` - Volatility vs confidence
- `interactive` - Interactive Plotly dashboard

## 🔧 Configuration

### Environment Variables

```bash
# API Keys (optional)
NEWS_API_KEY=your_news_api_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key

# Server Settings
HOST=0.0.0.0
PORT=8000
WORKERS=4
```

### Scheduler Configuration

The scheduler runs automatically and handles:
- **Hourly forecast updates** during market hours
- **Sentiment analysis** every 2 hours
- **Model evaluation** daily at 6 PM
- **Health checks** every 15 minutes
- **Data cleanup** weekly

## 📈 Model Performance

### Evaluation Metrics
- **RMSE** - Root Mean Square Error
- **MAPE** - Mean Absolute Percentage Error
- **Directional Accuracy** - Correct direction predictions
- **Volatility Accuracy** - Volatility prediction quality
- **Confidence Coverage** - Actual values within intervals

### Baseline Comparisons
- **Naive Baseline** - Last value repeated
- **Moving Average** - 3, 5, 10 period averages
- **Linear Trend** - Linear regression trend

## 🐳 Docker Deployment

### Services Available

```bash
# Main API service
docker-compose up stock-api

# Development with hot reload
docker-compose --profile dev up

# With caching and database
docker-compose --profile cache --profile database up

# With scheduler
docker-compose --profile scheduler up
```

### Multi-stage Build
- **base** - Core dependencies
- **development** - Dev tools + hot reload
- **production** - Optimized for production
- **api** - API-only minimal image

## ☁️ Cloud Deployment

### AWS ECS
```bash
# Build and push to ECR
docker build -t stock-analysis-api .
docker tag stock-analysis-api:latest <account>.dkr.ecr.<region>.amazonaws.com/stock-analysis:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/stock-analysis:latest
```

### Google Cloud Run
```bash
# Deploy to Cloud Run
gcloud run deploy stock-analysis \
  --image gcr.io/<project-id>/stock-analysis \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📊 Example Usage

### Python Client

```python
from api.client_example import StockAnalysisClient

client = StockAnalysisClient("http://localhost:8000")

# Get forecast
forecast = client.get_forecast(ticker="AAPL", days=30)
print(f"Forecast for {forecast['ticker']}: {len(forecast['predictions'])} days")

# Evaluate models
evaluation = client.evaluate_models(ticker="AAPL")
print(f"Best model: {evaluation['best_model']}")

# Get sentiment
sentiment = client.get_sentiment(ticker="AAPL")
print(f"Average sentiment: {sentiment['average_sentiment']:.4f}")
```

### Command Line

```bash
# Run forecast
stock-forecast

# Run evaluation
stock-evaluate

# Run API server
stock-api

# Run demo
stock-demo
```

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=.

# Run specific module
pytest evaluation/tests/

# Run API tests
pytest api/tests/
```

## 📚 Documentation

- [API Documentation](http://localhost:8000/docs) - Interactive API docs
- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Visualization Guide](VISUALIZATION_README.md) - Plotting features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Facebook Prophet** for time series forecasting
- **VADER** for sentiment analysis
- **FastAPI** for the web framework
- **yfinance** for stock data
- **Plotly** for interactive visualizations

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API docs at `/docs`

---

**Built with ❤️ for the financial analysis community**

