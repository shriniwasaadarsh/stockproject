import yfinance as yf
import pandas as pd

def fetch_stock_data(ticker="AAPL", period="7d", interval="1h"):
    print("Fetching data...")  # ✅ Debug print
    data = yf.download(ticker, period=period, interval=interval)
    data.reset_index(inplace=True)
    
    # Flatten multi-level columns if they exist
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = [col[0] if col[1] == ticker else col[0] for col in data.columns]
    
    return data[['Datetime', 'Open', 'High', 'Low', 'Close', 'Volume']]

if __name__ == "__main__":
    df = fetch_stock_data()
    print("Data fetched:")
    print(df.head())
