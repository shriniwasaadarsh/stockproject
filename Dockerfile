# Multi-stage Dockerfile for Stock Analysis System
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional packages for sentiment analysis and XGBoost
RUN pip install --no-cache-dir vaderSentiment textblob xgboost

# Copy application code
COPY . .

# Create output directory
RUN mkdir -p output

# Development stage
FROM base as development

# Install development dependencies
RUN pip install --no-cache-dir \
    pytest \
    pytest-cov \
    black \
    flake8 \
    mypy

# Expose port for API
EXPOSE 8000

# Default command for development
CMD ["python", "api/main.py"]

# Production stage
FROM base as production

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Change ownership of app directory
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command
CMD ["gunicorn", "api.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]

# API-only stage
FROM base as api

# Install only API dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    gunicorn

# Copy only API-related files
COPY api/ ./api/
COPY data_ingestion/ ./data_ingestion/
COPY feature_engineering/ ./feature_engineering/
COPY modeling/ ./modeling/
COPY evaluation/ ./evaluation/
COPY visualization/ ./visualization/

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# API command
CMD ["python", "api/main.py"]

