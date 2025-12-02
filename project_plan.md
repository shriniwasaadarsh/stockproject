"""
Build a full-stack real-time stock prediction web app with integrated sentiment analysis.

📥 DATA INGESTION
- Fetch live stock prices from API or database:
  ['datetime', 'open', 'high', 'low', 'close', 'volume']
- Fetch real-time tweets, news headlines, or articles about the stock:
  ['datetime', 'headline']
- Apply sentiment analysis to each headline/tweet:
  → Output: sentiment_score ∈ [-1, +1]

🔧 DATA TRANSFORMATION & FEATURE ENGINEERING
- Merge stock price and sentiment data on datetime
- Aggregate sentiment scores (hourly/daily average)
- Compute rolling stock features:
  - 7-day and 14-day moving averages of 'close'
  - Rolling standard deviation of 'close'
  - Lag features: previous day 'close', previous 3-day average
- Include aggregated sentiment features as model inputs

📈 MODELING
- Time-series model: Prophet
  - Add 'sentiment_score' as external regressor
- Regression model: XGBoost
  - Input: rolling stock features + sentiment features
- Evaluate both models using:
  - RMSE, MAE, Directional Accuracy

🧾 PREDICTION LOGGING SCHEMA
- Store model predictions and evaluation metrics:
  ['datetime', 'predicted_price', 'actual_price', 'model_name', 'error_metrics']
  → error_metrics = {'RMSE': float, 'MAE': float}

🌐 BACKEND ARCHITECTURE
- Use FastAPI or Flask for RESTful API
- Endpoints:
  - /predict → returns latest predictions
  - /features → returns computed features
  - /sentiment → returns sentiment scores
  - /metrics → returns model evaluation metrics
- Connect to PostgreSQL or MongoDB for persistent storage
- Use Celery + Redis for scheduled tasks (hourly/daily retraining)

🖥️ FRONTEND DASHBOARD
- Use React or Next.js for frontend
- Pages:
  - Home: Overview of current stock prediction
  - Chart: Interactive line chart of actual vs predicted prices
  - Sentiment: Trend chart of sentiment scores
  - Metrics: Display RMSE, MAE, directional accuracy
- Features:
  - Toggle between Prophet and XGBoost predictions
  - Filter by date/time range
  - Tooltip with prediction error and model name
  - Responsive design for mobile and desktop

🔐 AUTHENTICATION
- Add user login/signup with JWT-based auth
- Allow users to save favorite stocks and view personalized dashboards

🔁 AUTOMATION
- Schedule pipeline to run hourly/daily:
  - Fetch new data
  - Update features
  - Retrain models
  - Update predictions
  - Refresh dashboard
- Use cron jobs or Airflow for orchestration

📡 DEPLOYMENT
- Containerize with Docker
- Deploy backend on AWS EC2 or Azure App Service
- Host frontend on Vercel or Netlify
- Use GitHub Actions for CI/CD

📊 SENTIMENT SOURCES
- Use Twitter API, News API, RSS feeds, or web scraping
- Apply NLP sentiment scoring (e.g., VADER, TextBlob, FinBERT)

📱 API ACCESS
- Expose predictions and features via REST API
- Allow external apps to query:
  - /api/predict?stock=XYZ
  - /api/sentiment?stock=XYZ
  - /api/features?stock=XYZ
"""
