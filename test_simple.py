#!/usr/bin/env python3
"""
Simple test script for Stock Analysis System
Tests core functionality without emojis
"""

import sys
import os

# Add project root to path
sys.path.append('.')

def test_imports():
    """Test if all modules can be imported"""
    print("Testing imports...")
    
    test_modules = [
        "pandas",
        "numpy", 
        "matplotlib",
        "yfinance",
        "prophet",
        "sklearn",
        "fastapi",
        "uvicorn",
        "vaderSentiment",
        "textblob"
    ]
    
    failed_imports = []
    
    for module in test_modules:
        try:
            __import__(module)
            print(f"[OK] {module}")
        except ImportError as e:
            print(f"[FAIL] {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"Failed to import: {', '.join(failed_imports)}")
        return False
    
    print("All modules imported successfully!")
    return True

def test_data_ingestion():
    """Test data ingestion"""
    print("\nTesting data ingestion...")
    
    try:
        from data_ingestion.stock_fetch import fetch_stock_data
        df = fetch_stock_data("AAPL", "7d", "1h")
        print(f"[OK] Stock fetch: {df.shape[0]} rows, {df.shape[1]} columns")
        
        from data_ingestion.sentiment import get_sentiment_score
        score = get_sentiment_score("Apple stock is performing well")
        print(f"[OK] Basic sentiment: {score:.3f}")
        
        return True
    except Exception as e:
        print(f"[FAIL] Data ingestion: {e}")
        return False

def test_modeling():
    """Test modeling"""
    print("\nTesting modeling...")
    
    try:
        from modeling.prophet_model import load_features, train_prophet
        df = load_features()
        print(f"[OK] Prophet data loaded: {df.shape[0]} rows")
        
        forecast = train_prophet(df)
        print(f"[OK] Prophet forecast: {len(forecast)} predictions")
        
        return True
    except Exception as e:
        print(f"[FAIL] Modeling: {e}")
        return False

def test_api():
    """Test API imports"""
    print("\nTesting API...")
    
    try:
        from api.main import app
        print("[OK] API module imported successfully")
        return True
    except Exception as e:
        print(f"[FAIL] API import: {e}")
        return False

def main():
    """Main test function"""
    print("Stock Analysis System - Simple Test")
    print("=" * 50)
    
    tests = [
        ("Imports", test_imports),
        ("Data Ingestion", test_data_ingestion),
        ("Modeling", test_modeling),
        ("API", test_api),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            success = test_func()
            results[test_name] = success
        except Exception as e:
            print(f"[FAIL] {test_name} crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results.items():
        status = "[PASS]" if success else "[FAIL]"
        print(f"{test_name:<20} {status}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\nAll tests passed! System is ready to use.")
        print("\nNext steps:")
        print("1. Run: python api/main.py")
        print("2. Open: http://localhost:8000/docs")
    else:
        print(f"\n{total - passed} tests failed. Please check the errors above.")

if __name__ == "__main__":
    main()

