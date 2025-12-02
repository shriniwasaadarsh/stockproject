"""
Evaluation metrics for stock prediction models
Includes RMSE, MAPE, directional accuracy, and baseline comparisons
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

class ModelEvaluator:
    """Comprehensive model evaluation for stock predictions"""
    
    def __init__(self):
        self.metrics = {}
        self.baseline_metrics = {}
    
    def calculate_rmse(self, actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculate Root Mean Square Error"""
        return np.sqrt(mean_squared_error(actual, predicted))
    
    def calculate_mape(self, actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculate Mean Absolute Percentage Error"""
        # Avoid division by zero
        actual = np.where(actual == 0, 1e-8, actual)
        return np.mean(np.abs((actual - predicted) / actual)) * 100
    
    def calculate_mae(self, actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculate Mean Absolute Error"""
        return mean_absolute_error(actual, predicted)
    
    def calculate_directional_accuracy(self, actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculate directional accuracy (percentage of correct direction predictions)"""
        if len(actual) < 2 or len(predicted) < 2:
            return 0.0
        
        # Calculate actual and predicted changes
        actual_changes = np.diff(actual)
        predicted_changes = np.diff(predicted)
        
        # Count correct directional predictions
        correct_directions = np.sum(
            (actual_changes > 0) == (predicted_changes > 0)
        )
        
        return (correct_directions / len(actual_changes)) * 100
    
    def calculate_volatility_accuracy(self, actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculate how well the model predicts volatility patterns"""
        actual_vol = np.std(actual)
        predicted_vol = np.std(predicted)
        
        if actual_vol == 0:
            return 100.0 if predicted_vol == 0 else 0.0
        
        return max(0, 100 - abs(actual_vol - predicted_vol) / actual_vol * 100)
    
    def calculate_confidence_interval_coverage(self, actual: np.ndarray, 
                                            lower_bound: np.ndarray, 
                                            upper_bound: np.ndarray) -> float:
        """Calculate percentage of actual values within confidence intervals"""
        if len(actual) != len(lower_bound) or len(actual) != len(upper_bound):
            return 0.0
        
        within_bounds = np.sum(
            (actual >= lower_bound) & (actual <= upper_bound)
        )
        
        return (within_bounds / len(actual)) * 100
    
    def evaluate_model(self, actual: np.ndarray, predicted: np.ndarray, 
                      lower_bound: Optional[np.ndarray] = None,
                      upper_bound: Optional[np.ndarray] = None) -> Dict[str, float]:
        """Comprehensive model evaluation"""
        metrics = {
            'RMSE': self.calculate_rmse(actual, predicted),
            'MAE': self.calculate_mae(actual, predicted),
            'MAPE': self.calculate_mape(actual, predicted),
            'Directional_Accuracy': self.calculate_directional_accuracy(actual, predicted),
            'Volatility_Accuracy': self.calculate_volatility_accuracy(actual, predicted)
        }
        
        if lower_bound is not None and upper_bound is not None:
            metrics['Confidence_Coverage'] = self.calculate_confidence_interval_coverage(
                actual, lower_bound, upper_bound
            )
        
        return metrics
    
    def naive_baseline(self, data: np.ndarray, forecast_periods: int) -> np.ndarray:
        """Simple naive baseline (last value repeated)"""
        if len(data) == 0:
            return np.zeros(forecast_periods)
        
        last_value = data[-1]
        return np.full(forecast_periods, last_value)
    
    def moving_average_baseline(self, data: np.ndarray, window: int, 
                               forecast_periods: int) -> np.ndarray:
        """Moving average baseline"""
        if len(data) < window:
            return self.naive_baseline(data, forecast_periods)
        
        ma_value = np.mean(data[-window:])
        return np.full(forecast_periods, ma_value)
    
    def linear_trend_baseline(self, data: np.ndarray, forecast_periods: int) -> np.ndarray:
        """Linear trend baseline"""
        if len(data) < 2:
            return self.naive_baseline(data, forecast_periods)
        
        x = np.arange(len(data))
        y = data
        
        # Fit linear trend
        coeffs = np.polyfit(x, y, 1)
        
        # Extend trend into future
        future_x = np.arange(len(data), len(data) + forecast_periods)
        future_y = coeffs[0] * future_x + coeffs[1]
        
        return future_y
    
    def evaluate_baselines(self, train_data: np.ndarray, test_data: np.ndarray) -> Dict[str, Dict[str, float]]:
        """Evaluate multiple baseline models"""
        baselines = {}
        
        # Naive baseline
        naive_pred = self.naive_baseline(train_data, len(test_data))
        baselines['Naive'] = self.evaluate_model(test_data, naive_pred)
        
        # Moving average baselines
        for window in [3, 5, 10]:
            if len(train_data) >= window:
                ma_pred = self.moving_average_baseline(train_data, window, len(test_data))
                baselines[f'MA_{window}'] = self.evaluate_model(test_data, ma_pred)
        
        # Linear trend baseline
        linear_pred = self.linear_trend_baseline(train_data, len(test_data))
        baselines['Linear_Trend'] = self.evaluate_model(test_data, linear_pred)
        
        return baselines
    
    def compare_models(self, actual: np.ndarray, predictions: Dict[str, np.ndarray]) -> pd.DataFrame:
        """Compare multiple models and return results as DataFrame"""
        results = []
        
        for model_name, predicted in predictions.items():
            metrics = self.evaluate_model(actual, predicted)
            metrics['Model'] = model_name
            results.append(metrics)
        
        return pd.DataFrame(results)
    
    def plot_evaluation(self, actual: np.ndarray, predictions: Dict[str, np.ndarray], 
                       title: str = "Model Comparison") -> plt.Figure:
        """Plot actual vs predicted values for multiple models"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle(title, fontsize=16)
        
        # Time series plot
        ax1 = axes[0, 0]
        x = np.arange(len(actual))
        ax1.plot(x, actual, 'k-', label='Actual', linewidth=2)
        
        colors = ['blue', 'red', 'green', 'orange', 'purple']
        for i, (model_name, predicted) in enumerate(predictions.items()):
            if len(predicted) == len(actual):
                ax1.plot(x, predicted, '--', color=colors[i % len(colors)], 
                        label=model_name, alpha=0.8)
        
        ax1.set_title('Time Series Comparison')
        ax1.set_xlabel('Time')
        ax1.set_ylabel('Price')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Scatter plot (actual vs predicted)
        ax2 = axes[0, 1]
        for i, (model_name, predicted) in enumerate(predictions.items()):
            if len(predicted) == len(actual):
                ax2.scatter(actual, predicted, alpha=0.6, 
                           color=colors[i % len(colors)], label=model_name)
        
        # Perfect prediction line
        min_val = min(actual.min(), min(p.min() for p in predictions.values() if len(p) == len(actual)))
        max_val = max(actual.max(), max(p.max() for p in predictions.values() if len(p) == len(actual)))
        ax2.plot([min_val, max_val], [min_val, max_val], 'k--', alpha=0.5)
        
        ax2.set_title('Actual vs Predicted')
        ax2.set_xlabel('Actual')
        ax2.set_ylabel('Predicted')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        # Error distribution
        ax3 = axes[1, 0]
        for i, (model_name, predicted) in enumerate(predictions.items()):
            if len(predicted) == len(actual):
                errors = actual - predicted
                ax3.hist(errors, alpha=0.6, bins=20, 
                        color=colors[i % len(colors)], label=model_name)
        
        ax3.set_title('Error Distribution')
        ax3.set_xlabel('Error')
        ax3.set_ylabel('Frequency')
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # Metrics comparison
        ax4 = axes[1, 1]
        metrics_df = self.compare_models(actual, predictions)
        
        # Select key metrics for visualization
        key_metrics = ['RMSE', 'MAPE', 'Directional_Accuracy']
        available_metrics = [m for m in key_metrics if m in metrics_df.columns]
        
        if available_metrics:
            x_pos = np.arange(len(metrics_df))
            width = 0.25
            
            for i, metric in enumerate(available_metrics):
                ax4.bar(x_pos + i * width, metrics_df[metric], width, 
                       label=metric, alpha=0.8)
            
            ax4.set_title('Metrics Comparison')
            ax4.set_xlabel('Models')
            ax4.set_ylabel('Metric Value')
            ax4.set_xticks(x_pos + width)
            ax4.set_xticklabels(metrics_df['Model'], rotation=45)
            ax4.legend()
            ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        return fig
    
    def generate_report(self, actual: np.ndarray, predictions: Dict[str, np.ndarray]) -> str:
        """Generate a comprehensive evaluation report"""
        report = []
        report.append("=" * 60)
        report.append("STOCK PREDICTION MODEL EVALUATION REPORT")
        report.append("=" * 60)
        
        # Model comparison
        metrics_df = self.compare_models(actual, predictions)
        
        report.append(f"\nData Points: {len(actual)}")
        report.append(f"Models Evaluated: {len(predictions)}")
        
        report.append("\n" + "-" * 40)
        report.append("PERFORMANCE METRICS")
        report.append("-" * 40)
        
        # Format metrics table
        for _, row in metrics_df.iterrows():
            report.append(f"\n{row['Model']}:")
            for metric, value in row.items():
                if metric != 'Model':
                    if 'Accuracy' in metric or 'Coverage' in metric:
                        report.append(f"  {metric}: {value:.2f}%")
                    else:
                        report.append(f"  {metric}: {value:.4f}")
        
        # Best model analysis
        if 'RMSE' in metrics_df.columns:
            best_rmse_idx = metrics_df['RMSE'].idxmin()
            best_rmse_model = metrics_df.loc[best_rmse_idx, 'Model']
            report.append(f"\nBest RMSE: {best_rmse_model} ({metrics_df.loc[best_rmse_idx, 'RMSE']:.4f})")
        
        if 'Directional_Accuracy' in metrics_df.columns:
            best_dir_idx = metrics_df['Directional_Accuracy'].idxmax()
            best_dir_model = metrics_df.loc[best_dir_idx, 'Model']
            report.append(f"Best Directional Accuracy: {best_dir_model} ({metrics_df.loc[best_dir_idx, 'Directional_Accuracy']:.2f}%)")
        
        report.append("\n" + "=" * 60)
        
        return "\n".join(report)

def evaluate_prophet_model(actual: np.ndarray, forecast_df: pd.DataFrame) -> Dict[str, float]:
    """Evaluate Prophet model specifically"""
    evaluator = ModelEvaluator()
    
    # Extract predictions and confidence intervals
    predicted = forecast_df['yhat'].values
    lower_bound = forecast_df['yhat_lower'].values
    upper_bound = forecast_df['yhat_upper'].values
    
    # Ensure same length
    min_len = min(len(actual), len(predicted))
    actual = actual[:min_len]
    predicted = predicted[:min_len]
    lower_bound = lower_bound[:min_len]
    upper_bound = upper_bound[:min_len]
    
    return evaluator.evaluate_model(actual, predicted, lower_bound, upper_bound)

if __name__ == "__main__":
    # Test the evaluator
    evaluator = ModelEvaluator()
    
    # Generate sample data
    np.random.seed(42)
    actual = np.cumsum(np.random.randn(100)) + 100
    predicted = actual + np.random.randn(100) * 0.5
    
    # Test metrics
    metrics = evaluator.evaluate_model(actual, predicted)
    print("Sample Metrics:")
    for metric, value in metrics.items():
        print(f"{metric}: {value:.4f}")
    
    # Test baselines
    train_data = actual[:80]
    test_data = actual[80:]
    baselines = evaluator.evaluate_baselines(train_data, test_data)
    
    print("\nBaseline Comparison:")
    for model, metrics in baselines.items():
        print(f"\n{model}:")
        for metric, value in metrics.items():
            print(f"  {metric}: {value:.4f}")

