# 🚀 Deployment Guide

This guide covers deploying the Stock Analysis System in various environments.

## 📋 Prerequisites

- Python 3.8+ or Docker
- Git
- API keys for news services (optional)

## 🐳 Docker Deployment (Recommended)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd stock_project2

# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f stock-api
```

### Available Services

- **stock-api**: Main API service (port 8000)
- **stock-api-dev**: Development API (port 8001)
- **stock-scheduler**: Scheduled tasks
- **redis**: Caching (optional)
- **postgres**: Database (optional)
- **nginx**: Reverse proxy (optional)

### Environment Variables

Create a `.env` file:

```bash
# API Keys (optional)
NEWS_API_KEY=your_news_api_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key

# Database (if using postgres profile)
POSTGRES_PASSWORD=your_secure_password

# Other settings
PYTHONPATH=/app
```

### Service Profiles

```bash
# Development with hot reload
docker-compose --profile dev up

# With caching and database
docker-compose --profile cache --profile database up

# With nginx reverse proxy
docker-compose --profile nginx up

# With scheduler
docker-compose --profile scheduler up
```

## 🐍 Python Deployment

### Local Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Install the package
pip install -e .

# Run API server
python api/main.py

# Run evaluation
python evaluation/evaluate_models.py

# Run scheduler
python scripts/scheduler.py
```

### Production Setup

```bash
# Install with production dependencies
pip install -e ".[deployment]"

# Run with Gunicorn
gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Run scheduler as service
python scripts/scheduler.py
```

## ☁️ Cloud Deployment

### AWS ECS

1. **Build and push Docker image**:
```bash
# Build image
docker build -t stock-analysis-api .

# Tag for ECR
docker tag stock-analysis-api:latest <account>.dkr.ecr.<region>.amazonaws.com/stock-analysis:latest

# Push to ECR
docker push <account>.dkr.ecr.<region>.amazonaws.com/stock-analysis:latest
```

2. **Create ECS Task Definition**:
```json
{
  "family": "stock-analysis",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "stock-api",
      "image": "<account>.dkr.ecr.<region>.amazonaws.com/stock-analysis:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEWS_API_KEY",
          "value": "your_api_key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/stock-analysis",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run

```bash
# Build and push to GCR
docker build -t gcr.io/<project-id>/stock-analysis .
docker push gcr.io/<project-id>/stock-analysis

# Deploy to Cloud Run
gcloud run deploy stock-analysis \
  --image gcr.io/<project-id>/stock-analysis \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000
```

### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry <registry-name> --image stock-analysis .

# Deploy to ACI
az container create \
  --resource-group <resource-group> \
  --name stock-analysis \
  --image <registry-name>.azurecr.io/stock-analysis:latest \
  --ports 8000 \
  --environment-variables NEWS_API_KEY=your_key
```

## 🔧 Configuration

### API Configuration

The API can be configured via environment variables:

```bash
# Server settings
HOST=0.0.0.0
PORT=8000
WORKERS=4

# API keys
NEWS_API_KEY=your_news_api_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key

# Caching
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://user:pass@localhost/stock_analysis
```

### Scheduler Configuration

The scheduler can be configured in `scripts/scheduler.py`:

```python
# Tickers to analyze
tickers = ["AAPL", "GOOGL", "MSFT", "TSLA"]

# Update frequencies
FORECAST_UPDATE_INTERVAL = "1 hour"
SENTIMENT_UPDATE_INTERVAL = "2 hours"
EVALUATION_INTERVAL = "1 day"
```

## 📊 Monitoring

### Health Checks

```bash
# API health
curl http://localhost:8000/health

# Cache status
curl http://localhost:8000/cache/status

# Metrics
curl http://localhost:8000/metrics/AAPL
```

### Logging

Logs are written to:
- `logs/scheduler.log` - Scheduler logs
- Docker logs via `docker-compose logs`
- Application logs via FastAPI logging

### Metrics Collection

The API provides metrics endpoints:
- `/health` - System health
- `/metrics/{ticker}` - Model performance metrics
- `/cache/status` - Cache statistics

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy Stock Analysis API

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

## 🛡️ Security

### API Security

- Use HTTPS in production
- Implement API key authentication
- Rate limiting
- Input validation
- CORS configuration

### Data Security

- Encrypt sensitive data
- Secure API keys
- Database encryption
- Regular security updates

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale API instances
docker-compose up --scale stock-api=3

# Load balancer configuration
# Use nginx or cloud load balancer
```

### Vertical Scaling

```yaml
# docker-compose.yml
services:
  stock-api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 🚨 Troubleshooting

### Common Issues

1. **API not starting**:
   - Check port availability
   - Verify dependencies
   - Check logs

2. **Scheduler not running**:
   - Check Python path
   - Verify permissions
   - Check log files

3. **Memory issues**:
   - Increase container memory
   - Optimize data processing
   - Use streaming for large datasets

### Debug Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f stock-api

# Execute commands in container
docker-compose exec stock-api bash

# Check API endpoints
curl http://localhost:8000/docs
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Prophet Documentation](https://facebook.github.io/prophet/)
- [Plotly Documentation](https://plotly.com/python/)

