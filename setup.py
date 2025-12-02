#!/usr/bin/env python3
"""
Setup script for Stock Analysis System
Installs dependencies and sets up the project
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print('='*60)
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print("✅ Success!")
        if result.stdout:
            print("Output:", result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stdout:
            print("Output:", e.stdout)
        if e.stderr:
            print("Error:", e.stderr)
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_python_dependencies():
    """Install Python dependencies"""
    print("\n🐍 Installing Python dependencies...")
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install requirements
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing Python packages"):
        return False
    
    return True

def install_frontend_dependencies():
    """Install frontend dependencies"""
    print("\n⚛️ Installing frontend dependencies...")
    
    # Check if Node.js is installed
    if not run_command("node --version", "Checking Node.js"):
        print("❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/")
        return False
    
    # Check if npm is installed
    if not run_command("npm --version", "Checking npm"):
        print("❌ npm is not installed. Please install npm")
        return False
    
    # Install frontend dependencies
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    if os.path.exists(frontend_dir):
        if not run_command(f"cd {frontend_dir} && npm install", "Installing frontend packages"):
            return False
    else:
        print("⚠️ Frontend directory not found, skipping frontend setup")
    
    return True

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating necessary directories...")
    
    directories = [
        "output",
        "logs",
        "data",
        "frontend/build"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def test_imports():
    """Test if all modules can be imported"""
    print("\n🧪 Testing imports...")
    
    test_modules = [
        "pandas",
        "numpy",
        "matplotlib",
        "plotly",
        "yfinance",
        "prophet",
        "sklearn",
        "fastapi",
        "uvicorn",
        "vaderSentiment",
        "textblob",
        "xgboost"
    ]
    
    failed_imports = []
    
    for module in test_modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError as e:
            print(f"❌ {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        return False
    
    print("\n✅ All modules imported successfully!")
    return True

def test_api():
    """Test if API can start"""
    print("\n🚀 Testing API startup...")
    
    try:
        # Test if API can be imported
        sys.path.append('.')
        from api.main import app
        print("✅ API module imported successfully")
        return True
    except Exception as e:
        print(f"❌ API import failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Stock Analysis System Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Install Python dependencies
    if not install_python_dependencies():
        print("\n❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Install frontend dependencies
    if not install_frontend_dependencies():
        print("\n⚠️ Frontend setup failed, but continuing...")
    
    # Test imports
    if not test_imports():
        print("\n❌ Some modules failed to import")
        print("Try running: pip install -r requirements.txt")
        sys.exit(1)
    
    # Test API
    if not test_api():
        print("\n❌ API test failed")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("🎉 Setup completed successfully!")
    print("="*60)
    
    print("\n📋 Next steps:")
    print("1. Start the API server:")
    print("   python api/main.py")
    print("\n2. Start the frontend (in another terminal):")
    print("   cd frontend && npm start")
    print("\n3. Open your browser to:")
    print("   http://localhost:3000")
    print("\n4. API documentation available at:")
    print("   http://localhost:8000/docs")
    
    print("\n🐳 Docker alternative:")
    print("   docker-compose up -d")
    
    print("\n📚 For more information, see README.md")

if __name__ == "__main__":
    main()