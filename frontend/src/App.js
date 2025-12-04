import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Select, Button, Spin, Alert, Tabs, Statistic, Tag, Table, InputNumber, Divider, Space, Tooltip, Progress, Input, message, Badge, List, Timeline, Modal, Drawer } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { 
  StockOutlined, RiseOutlined, BarChartOutlined, HeartOutlined, 
  WarningOutlined, DollarOutlined, SignalFilled, SafetyOutlined,
  SunOutlined, MoonOutlined, PlusOutlined, CloseOutlined, 
  BellOutlined, ExperimentOutlined, SwapOutlined, BulbOutlined,
  PlayCircleOutlined, FileTextOutlined, TrophyOutlined, ThunderboltOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticker, setTicker] = useState('AAPL');
  const [modelType, setModelType] = useState('prophet');
  const [forecastData, setForecastData] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);
  const [signals, setSignals] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [portfolioTickers, setPortfolioTickers] = useState(['AAPL', 'GOOGL']);
  const [portfolioWeights, setPortfolioWeights] = useState([0.5, 0.5]);
  const [portfolioData, setPortfolioData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Make tickers dynamic with state
  const [tickers, setTickers] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'JPM', 'V', 'WMT']);
  const [newTicker, setNewTicker] = useState('');
  
  // New states for advanced features
  const [newsData, setNewsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [backtestData, setBacktestData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);
  const [paperTradeAccount, setPaperTradeAccount] = useState(null);
  const [tradeRecommendation, setTradeRecommendation] = useState(null);
  const [finalRecommendation, setFinalRecommendation] = useState(null);
  const [enhancedSignals, setEnhancedSignals] = useState(null);
  const [showNewsDrawer, setShowNewsDrawer] = useState(false);
  const [compareTickersList, setCompareTickersList] = useState(['AAPL', 'GOOGL', 'MSFT']);
  const [paperTradeForm, setPaperTradeForm] = useState({ ticker: 'AAPL', action: 'BUY', shares: 10, price: 0 });
  
  // Function to add a new ticker
  const addTicker = () => {
    const tickerUpper = newTicker.trim().toUpperCase();
    if (!tickerUpper) {
      message.warning('Please enter a ticker symbol');
      return;
    }
    if (tickers.includes(tickerUpper)) {
      message.warning('Ticker already exists');
      return;
    }
    if (!/^[A-Z]{1,10}$/.test(tickerUpper)) {
      message.warning('Please enter a valid ticker symbol (1-5 letters)');
      return;
    }
    setTickers([...tickers, tickerUpper]);
    setNewTicker('');
    message.success(`Added ${tickerUpper} to the list`);
  };
  
  // Function to remove a ticker
  const removeTicker = (tickerToRemove) => {
    if (tickers.length <= 1) {
      message.warning('Must have at least one ticker');
      return;
    }
    setTickers(tickers.filter(t => t !== tickerToRemove));
    // If the removed ticker was selected, switch to the first remaining ticker
    if (ticker === tickerToRemove) {
      setTicker(tickers.filter(t => t !== tickerToRemove)[0]);
    }
    message.success(`Removed ${tickerToRemove} from the list`);
  };

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/forecast', {
        ticker: ticker,
        days: 30,
        use_real_sentiment: true,
        model_type: modelType
      });
      setForecastData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  const fetchSentiment = async () => {
    try {
      const response = await axios.post('/sentiment', {
        ticker: ticker,
        days_back: 7
      });
      setSentimentData(response.data);
    } catch (err) {
      console.error('Failed to fetch sentiment:', err);
    }
  };

  const fetchEvaluation = async () => {
    try {
      const response = await axios.post('/evaluate', {
        ticker: ticker,
        train_ratio: 0.8,
        use_real_sentiment: true
      });
      setEvaluationData(response.data);
    } catch (err) {
      console.error('Failed to fetch evaluation:', err);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await axios.post('/signals', {
        ticker: ticker,
        days: 30,
        use_real_sentiment: true,
        model_type: modelType
      });
      // Ensure signals is properly structured
      if (response.data && response.data.signals) {
        setSignals(response.data);
      } else {
        setSignals(null);
      }
    } catch (err) {
      console.error('Failed to fetch signals:', err);
      setSignals(null);
    }
  };

  const fetchAnomalies = async () => {
    try {
      const response = await axios.post('/anomalies', {
        ticker: ticker,
        days: 30,
        use_real_sentiment: true,
        model_type: modelType
      });
      setAnomalies(response.data);
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.post('/portfolio', {
        tickers: portfolioTickers,
        weights: portfolioWeights
      });
      setPortfolioData(response.data);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  };

  // New fetch functions for advanced features
  const fetchNews = async () => {
    try {
      const response = await axios.post('/news', {
        ticker: ticker,
        days_back: 7
      });
      setNewsData(response.data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.post('/alerts', {
        ticker: ticker,
        days: 30,
        model_type: modelType
      });
      setAlertsData(response.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const fetchBacktest = async () => {
    try {
      const response = await axios.post('/backtest', {
        ticker: ticker,
        initial_capital: 10000
      });
      setBacktestData(response.data);
    } catch (err) {
      console.error('Failed to fetch backtest:', err);
    }
  };

  const fetchComparison = async () => {
    try {
      const response = await axios.post('/compare', {
        tickers: compareTickersList
      });
      setComparisonData(response.data);
    } catch (err) {
      console.error('Failed to fetch comparison:', err);
    }
  };

  const fetchMarketInsights = async () => {
    try {
      const response = await axios.post('/market-insights', {
        ticker: ticker,
        days: 30,
        model_type: modelType
      });
      setMarketInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch market insights:', err);
    }
  };

  const fetchPaperTradeAccount = async () => {
    try {
      const response = await axios.get('/paper-trade/account');
      setPaperTradeAccount(response.data);
    } catch (err) {
      console.error('Failed to fetch paper trade account:', err);
    }
  };

  const fetchTradeRecommendation = async () => {
    try {
      const response = await axios.post('/paper-trade/recommendation', {
        ticker: ticker,
        days: 30,
        model_type: modelType
      });
      setTradeRecommendation(response.data);
      setPaperTradeForm(prev => ({ ...prev, price: response.data.entry_price }));
    } catch (err) {
      console.error('Failed to fetch trade recommendation:', err);
    }
  };

  const executePaperTrade = async () => {
    try {
      const response = await axios.post('/paper-trade', {
        ticker: paperTradeForm.ticker,
        action: paperTradeForm.action,
        shares: paperTradeForm.shares,
        price: paperTradeForm.price
      });
      if (response.data.status === 'success') {
        message.success(`${paperTradeForm.action} order executed successfully!`);
        fetchPaperTradeAccount();
      }
    } catch (err) {
      message.error(err.response?.data?.detail || 'Trade execution failed');
    }
  };

  const fetchFinalRecommendation = async () => {
    try {
      const response = await axios.post('/final-recommendation', {
        ticker: ticker,
        days: 30,
        model_type: modelType
      });
      setFinalRecommendation(response.data);
    } catch (err) {
      console.error('Failed to fetch final recommendation:', err);
    }
  };

  const fetchEnhancedSignals = async () => {
    try {
      const response = await axios.post('/signals-enhanced', {
        ticker: ticker,
        days: 30,
        model_type: modelType
      });
      setEnhancedSignals(response.data);
    } catch (err) {
      console.error('Failed to fetch enhanced signals:', err);
    }
  };

  useEffect(() => {
    fetchForecast();
    fetchSentiment();
    fetchEvaluation();
    fetchSignals();
    fetchAnomalies();
    fetchNews();
    fetchAlerts();
    fetchMarketInsights();
    fetchFinalRecommendation();
    fetchEnhancedSignals();
    fetchPaperTradeAccount();
    fetchTradeRecommendation();
  }, [ticker, modelType]);

  useEffect(() => {
    if (portfolioTickers.length > 0 && portfolioWeights.length === portfolioTickers.length) {
      fetchPortfolio();
    }
  }, [portfolioTickers, portfolioWeights]);

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const formatChartData = () => {
    if (!forecastData?.predictions) return [];
    
    return forecastData.predictions.map((pred, index) => ({
      date: moment(pred.date).format('MMM DD'),
      predicted: pred.predicted_price,
      lower: pred.lower_bound,
      upper: pred.upper_bound,
      day: index + 1
    }));
  };

  const formatSentimentChartData = () => {
    if (!sentimentData?.sentiment_data) return [];
    
    return sentimentData.sentiment_data.map(item => ({
      date: moment(item.date).format('MMM DD'),
      sentiment: item.sentiment_score,
      headlines: item.headline_count
    }));
  };

  const formatSignalsChartData = () => {
    if (!signals?.signals) return [];
    
    return signals.signals.map((signal, index) => ({
      date: moment(signal.date).format('MMM DD'),
      strength: signal.strength,
      signal: signal.signal,
      change: signal.predicted_change
    }));
  };

  const getSentimentColor = (score) => {
    if (score > 0.1) return '#52c41a';
    if (score < -0.1) return '#ff4d4f';
    return '#faad14';
  };

  const getSentimentLabel = (score) => {
    if (score > 0.1) return 'Positive';
    if (score < -0.1) return 'Negative';
    return 'Neutral';
  };

  const getSignalColor = (signal) => {
    if (signal.includes('STRONG_BUY') || signal.includes('BUY')) return '#52c41a';
    if (signal.includes('STRONG_SELL') || signal.includes('SELL')) return '#ff4d4f';
    return '#faad14';
  };

  const getRiskColor = (level) => {
    if (level === 'HIGH') return '#ff4d4f';
    if (level === 'MEDIUM') return '#faad14';
    return '#52c41a';
  };

  const [signalFilter, setSignalFilter] = useState('all');
  const [signalSortField, setSignalSortField] = useState('date');
  const [signalSortOrder, setSignalSortOrder] = useState('asc');

  const signalColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return signalSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      },
      sortOrder: signalSortField === 'date' ? (signalSortOrder === 'asc' ? 'ascend' : 'descend') : null,
    },
    {
      title: 'Signal',
      dataIndex: 'signal',
      key: 'signal',
      filters: [
        { text: 'STRONG_BUY', value: 'STRONG_BUY' },
        { text: 'BUY', value: 'BUY' },
        { text: 'HOLD', value: 'HOLD' },
        { text: 'SELL', value: 'SELL' },
        { text: 'STRONG_SELL', value: 'STRONG_SELL' },
      ],
      onFilter: (value, record) => record.signal === value,
      render: (signal) => <Tag color={getSignalColor(signal)}>{signal}</Tag>
    },
    {
      title: 'Strength',
      dataIndex: 'strength',
      key: 'strength',
      sorter: (a, b) => signalSortOrder === 'asc' ? a.strength - b.strength : b.strength - a.strength,
      sortOrder: signalSortField === 'strength' ? (signalSortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (strength) => (
        <div>
          <Progress 
            percent={strength} 
            size="small" 
            status={strength > 70 ? 'success' : strength > 40 ? 'active' : 'exception'}
            format={(percent) => `${percent.toFixed(1)}%`}
          />
        </div>
      )
    },
    {
      title: 'Predicted Change',
      dataIndex: 'change',
      key: 'change',
      sorter: (a, b) => signalSortOrder === 'asc' ? a.change - b.change : b.change - a.change,
      sortOrder: signalSortField === 'change' ? (signalSortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (change) => (
        <span style={{ color: change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#faad14' }}>
          {change > 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      )
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      sorter: (a, b) => signalSortOrder === 'asc' ? (a.confidence || 0) - (b.confidence || 0) : (b.confidence || 0) - (a.confidence || 0),
      sortOrder: signalSortField === 'confidence' ? (signalSortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (confidence) => confidence ? `${(confidence * 100).toFixed(1)}%` : 'N/A'
    }
  ];

  // Apply dark mode styles
  const themeStyles = darkMode ? {
    background: '#141414',
    color: '#fff',
    cardBackground: '#1f1f1f',
    textColor: '#fff',
    borderColor: '#434343',
    headerBg: '#1f1f1f',
    inputBg: '#262626',
    tableBg: '#1f1f1f',
    tableHeaderBg: '#262626'
  } : {
    background: '#f5f5f5',
    color: '#000',
    cardBackground: '#fff',
    textColor: '#000',
    borderColor: '#d9d9d9',
    headerBg: '#fff',
    inputBg: '#fff',
    tableBg: '#fff',
    tableHeaderBg: '#fafafa'
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh', background: themeStyles.background }}>
      <Header style={{ 
        background: darkMode ? '#1f1f1f' : '#fff', 
        padding: '0 24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        borderBottom: `1px solid ${themeStyles.borderColor}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StockOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
            <h1 style={{ margin: 0, color: darkMode ? '#1890ff' : '#1890ff' }}>Stock Analysis & Trading Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Select
              value={ticker}
              onChange={setTicker}
              style={{ width: 140 }}
              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="Add ticker"
                      value={newTicker}
                      onChange={e => setNewTicker(e.target.value.toUpperCase())}
                      onPressEnter={addTicker}
                      style={{ width: 100 }}
                      maxLength={10}
                    />
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      onClick={addTicker}
                    >
                      Add
                    </Button>
                  </Space>
                </>
              )}
            >
              {tickers.map(t => (
                <Option key={t} value={t}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t}</span>
                    {tickers.length > 1 && (
                      <CloseOutlined 
                        style={{ color: '#ff4d4f', fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTicker(t);
                        }}
                      />
                    )}
                  </div>
                </Option>
              ))}
            </Select>
            <Select
              value={modelType}
              onChange={setModelType}
              style={{ width: 120 }}
            >
              <Option value="prophet">Prophet</Option>
              <Option value="xgboost">XGBoost</Option>
            </Select>
            <Button 
              type="text" 
              icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => setDarkMode(!darkMode)}
              style={{ fontSize: '20px', color: darkMode ? '#faad14' : '#1890ff' }}
            />
            <Button type="primary" onClick={fetchForecast} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>
      </Header>

      <Content className="dashboard-container" style={{ background: themeStyles.background, color: themeStyles.textColor }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
          />
        )}

        {/* Investment Recommendation Card - Prominent Display */}
        {forecastData && signals?.signals?.summary && (
          <Card 
            style={{ 
              marginBottom: 24, 
              background: (signals.signals.summary.recommendation || '').includes('BUY') ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' :
                          (signals.signals.summary.recommendation || '').includes('SELL') ? 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' :
                          'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col span={16}>
                <h2 style={{ color: 'white', margin: 0, fontSize: 28, fontWeight: 'bold' }}>
                  💰 Investment Recommendation for {ticker}
                </h2>
                <div style={{ marginTop: 16, fontSize: 18 }}>
                  <strong style={{ fontSize: 32, color: 'white', display: 'block', marginBottom: 12 }}>
                    {signals.signals.summary.recommendation || 'HOLD'}
                  </strong>
                  {forecastData.predictions && forecastData.predictions.length > 0 && (
                    <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <p style={{ color: 'white', margin: '8px 0', fontSize: 16 }}>
                        <strong>Current Prediction:</strong> ${(forecastData.predictions[0]?.predicted_price || 0).toFixed(2)}
                      </p>
                      <p style={{ color: 'white', margin: '8px 0', fontSize: 16 }}>
                        <strong>30-Day Forecast:</strong> ${(forecastData.predictions[forecastData.predictions.length - 1]?.predicted_price || 0).toFixed(2)}
                      </p>
                      <p style={{ color: 'white', margin: '8px 0', fontSize: 16 }}>
                        <strong>Expected Change:</strong> {
                          forecastData.predictions[0]?.predicted_price > 0 ? 
                          (((forecastData.predictions[forecastData.predictions.length - 1]?.predicted_price || 0) - (forecastData.predictions[0]?.predicted_price || 0)) / (forecastData.predictions[0]?.predicted_price || 1) * 100).toFixed(2) : 
                          '0.00'
                        }%
                      </p>
                    </div>
                  )}
                </div>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Statistic
                  title={<span style={{ color: 'white', fontSize: 16 }}>Signal Strength</span>}
                  value={signals.signals.summary.average_strength || 0}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: 'white', fontSize: 48, fontWeight: 'bold' }}
                />
                <div style={{ marginTop: 16, color: 'white', background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ margin: '4px 0', fontSize: 14 }}>Buy Signals: {signals.signals.summary.buy_signals || 0}</p>
                  <p style={{ margin: '4px 0', fontSize: 14 }}>Sell Signals: {signals.signals.summary.sell_signals || 0}</p>
                  <p style={{ margin: '4px 0', fontSize: 14 }}>Hold Signals: {signals.signals.summary.hold_signals || 0}</p>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        <Tabs defaultActiveKey="forecast" size="large" style={{ marginTop: 24 }}>
          <TabPane tab={<span><RiseOutlined />Price Forecast</span>} key="forecast">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={`${ticker} Price Forecast (${modelType.toUpperCase()})`} 
                  className="chart-container"
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor }}
                >
                  {loading ? (
                    <div className="loading-container">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={formatChartData()}>
                        <defs>
                          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value, name) => [
                            `$${value.toFixed(2)}`, 
                            name === 'predicted' ? 'Predicted Price' : name
                          ]}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="upper" 
                          stroke="#87d068" 
                          fillOpacity={0}
                          strokeDasharray="5 5"
                          name="Upper Bound"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="lower" 
                          stroke="#ff7875" 
                          fillOpacity={0}
                          strokeDasharray="5 5"
                          name="Lower Bound"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#1890ff" 
                          strokeWidth={2}
                          fill="url(#colorPredicted)"
                          name="Predicted Price"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </Col>
            </Row>

            {forecastData?.metrics && (
              <Row gutter={[24, 24]}>
                <Col span={6}>
                  <Card 
                    className="metric-card"
                    style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                    bodyStyle={{ background: themeStyles.cardBackground }}
                  >
                    <Statistic
                      title={<span style={{ color: themeStyles.textColor }}>RMSE</span>}
                      value={forecastData.metrics.RMSE || 0}
                      precision={4}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card 
                    className="metric-card"
                    style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                    bodyStyle={{ background: themeStyles.cardBackground }}
                  >
                    <Statistic
                      title={<span style={{ color: themeStyles.textColor }}>MAE</span>}
                      value={forecastData.metrics.MAE || 0}
                      precision={4}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card 
                    className="metric-card"
                    style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                    bodyStyle={{ background: themeStyles.cardBackground }}
                  >
                    <Statistic
                      title={<span style={{ color: themeStyles.textColor }}>Directional Accuracy</span>}
                      value={forecastData.metrics.Directional_Accuracy || 0}
                      precision={2}
                      suffix="%"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card 
                    className="metric-card"
                    style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                    bodyStyle={{ background: themeStyles.cardBackground }}
                  >
                    <Statistic
                      title={<span style={{ color: themeStyles.textColor }}>Volatility Accuracy</span>}
                      value={forecastData.metrics.Volatility_Accuracy || 0}
                      precision={2}
                      suffix="%"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>

          <TabPane tab={<span><SignalFilled />Trading Signals</span>} key="signals">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={`${ticker} Automated Trading Signals`} 
                  className="chart-container"
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor }}
                >
                  {signals?.signals?.summary && (
                    <div style={{ marginBottom: 24 }}>
                      <Row gutter={[16, 16]}>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic
                              title={<span style={{ color: themeStyles.textColor }}>Recommendation</span>}
                              value={signals.signals.summary.recommendation || 'HOLD'}
                              valueStyle={{ color: getSignalColor(signals.signals.summary.recommendation || 'HOLD'), fontSize: 24 }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic
                              title={<span style={{ color: themeStyles.textColor }}>Buy Signals</span>}
                              value={signals.signals.summary.buy_signals || 0}
                              suffix={`/ ${signals.signals.summary.total_signals || 0}`}
                              valueStyle={{ color: themeStyles.textColor }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic
                              title={<span style={{ color: themeStyles.textColor }}>Sell Signals</span>}
                              value={signals.signals.summary.sell_signals || 0}
                              suffix={`/ ${signals.signals.summary.total_signals || 0}`}
                              valueStyle={{ color: themeStyles.textColor }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic
                              title={<span style={{ color: themeStyles.textColor }}>Average Strength</span>}
                              value={signals.signals.summary.average_strength || 0}
                              precision={1}
                              suffix="%"
                              valueStyle={{ color: themeStyles.textColor }}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )}
                  {(() => {
                    // Safely extract and format signals array
                    const signalsArray = signals?.signals?.signals;
                    if (Array.isArray(signalsArray) && signalsArray.length > 0) {
                      // Filter signals
                      let filteredSignals = signalsArray;
                      if (signalFilter !== 'all') {
                        filteredSignals = signalsArray.filter(s => s.signal === signalFilter);
                      }
                      
                      // Ensure each item has a unique key
                      const formattedSignals = filteredSignals.map((s, idx) => ({
                        ...s,
                        key: s.date || `signal-${idx}`,
                        date: s.date || `Date ${idx + 1}`,
                        signal: s.signal || 'HOLD',
                        strength: s.strength || 0,
                        change: s.predicted_change || 0,
                        confidence: s.confidence || 0
                      }));
                      
                      return (
                        <div>
                          <Space style={{ marginBottom: 16 }}>
                            <span style={{ color: themeStyles.textColor, fontWeight: 'bold' }}>Filter by Signal:</span>
                            <Select
                              value={signalFilter}
                              onChange={setSignalFilter}
                              style={{ width: 150 }}
                            >
                              <Option value="all">All Signals</Option>
                              <Option value="STRONG_BUY">STRONG_BUY</Option>
                              <Option value="BUY">BUY</Option>
                              <Option value="HOLD">HOLD</Option>
                              <Option value="SELL">SELL</Option>
                              <Option value="STRONG_SELL">STRONG_SELL</Option>
                            </Select>
                            <span style={{ color: themeStyles.textColor, marginLeft: 16 }}>
                              Showing {formattedSignals.length} of {signalsArray.length} signals
                            </span>
                          </Space>
                          <Table 
                            dataSource={formattedSignals} 
                            columns={signalColumns} 
                            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} signals` }}
                            rowKey="key"
                            onChange={(pagination, filters, sorter) => {
                              if (sorter.field) {
                                setSignalSortField(sorter.field);
                                setSignalSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
                              }
                            }}
                            style={{ background: themeStyles.tableBg }}
                            className={darkMode ? 'dark-table' : ''}
                          />
                        </div>
                      );
                    } else if (!signals) {
                      return (
                        <div className="loading-container">
                          <Spin size="large" />
                          <p style={{ marginTop: 16 }}>Loading trading signals...</p>
                        </div>
                      );
                    } else {
                      return (
                        <Alert
                          message="No Signals Available"
                          description="Trading signals will appear here once data is loaded."
                          type="info"
                          showIcon
                        />
                      );
                    }
                  })()}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><SafetyOutlined />Risk Management</span>} key="risk">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>{ticker} Anomaly Detection & Risk Analysis</span>}
                  className="chart-container"
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor, borderBottom: `1px solid ${themeStyles.borderColor}` }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  {anomalies?.anomalies && (
                    <div>
                      <div style={{ marginBottom: 24 }}>
                        <Tag color={getRiskColor(anomalies.risk_level)} style={{ fontSize: 16, padding: '8px 16px' }}>
                          Risk Level: {anomalies.risk_level}
                        </Tag>
                        <span style={{ marginLeft: 16, color: themeStyles.textColor }}>Anomalies Detected: {anomalies.anomaly_count || 0}</span>
                      </div>
                      {anomalies.anomalies.length > 0 ? (
                        <div>
                          {anomalies.anomalies.map((anomaly, index) => (
                            <Alert
                              key={index}
                              message={anomaly.type}
                              description={anomaly.description}
                              type={anomaly.severity === 'HIGH' ? 'error' : 'warning'}
                              showIcon
                              style={{ marginBottom: 16 }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Alert
                          message="No Anomalies Detected"
                          description="The stock is operating within normal parameters."
                          type="success"
                          showIcon
                        />
                      )}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><HeartOutlined />Sentiment Analysis</span>} key="sentiment">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>{ticker} Market Sentiment Analysis</span>}
                  className="chart-container"
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor, borderBottom: `1px solid ${themeStyles.borderColor}` }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  {sentimentData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatSentimentChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[-1, 1]} />
                        <RechartsTooltip 
                          formatter={(value, name) => [
                            name === 'sentiment' ? value.toFixed(3) : value,
                            name === 'sentiment' ? 'Sentiment Score' : 'Headlines'
                          ]}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="sentiment" 
                          stroke="#722ed1" 
                          strokeWidth={2}
                          name="Sentiment Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="loading-container">
                      <Spin size="large" />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            {sentimentData && (
              <Row gutter={[24, 24]}>
                <Col span={8}>
                  <Card 
                    className="metric-card"
                    style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                    bodyStyle={{ background: themeStyles.cardBackground }}
                  >
                    <Statistic
                      title={<span style={{ color: themeStyles.textColor }}>Average Sentiment</span>}
                      value={sentimentData.average_sentiment || 0}
                      precision={3}
                      valueStyle={{ 
                        color: getSentimentColor(sentimentData.average_sentiment) 
                      }}
                    />
                    <div style={{ marginTop: 8, color: themeStyles.textColor, opacity: 0.7 }}>
                      {getSentimentLabel(sentimentData.average_sentiment)}
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card 
                    className="metric-card"
                    style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                    bodyStyle={{ background: themeStyles.cardBackground }}
                  >
                    <Statistic
                      title={<span style={{ color: themeStyles.textColor }}>Total Headlines</span>}
                      value={sentimentData.sentiment_data?.reduce((sum, item) => sum + item.headline_count, 0) || 0}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card 
                    className="metric-card"
                    style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                    bodyStyle={{ background: themeStyles.cardBackground }}
                  >
                    <Statistic
                      title={<span style={{ color: themeStyles.textColor }}>Analysis Date</span>}
                      value={moment(sentimentData.analysis_date).format('MMM DD, YYYY')}
                      valueStyle={{ color: themeStyles.textColor, opacity: 0.7 }}
                    />
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>

          <TabPane tab={<span><DollarOutlined />Portfolio</span>} key="portfolio">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>Portfolio Optimization & Analysis</span>}
                  className="chart-container"
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor, borderBottom: `1px solid ${themeStyles.borderColor}` }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  <Alert
                    message="Portfolio Optimization Guide"
                    description="Create a diversified portfolio by selecting multiple stocks and assigning weights (percentages). Total weights must equal 100%. Click 'Analyze Portfolio' to see performance metrics including returns, volatility, and Sharpe ratio."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <Card 
                        title={<span style={{ color: themeStyles.textColor }}>Portfolio Configuration</span>}
                        size="small"
                        style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                        headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                        bodyStyle={{ background: themeStyles.cardBackground }}
                      >
                        <div style={{ marginBottom: 16 }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            {portfolioTickers.map((t, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Select
                                  value={t}
                                  onChange={(value) => {
                                    const newTickers = [...portfolioTickers];
                                    newTickers[idx] = value;
                                    setPortfolioTickers(newTickers);
                                  }}
                                  style={{ width: '45%' }}
                                  placeholder="Select Stock"
                                >
                                  {tickers.map(ticker => (
                                    <Option key={ticker} value={ticker}>{ticker}</Option>
                                  ))}
                                </Select>
                                <InputNumber
                                  value={portfolioWeights[idx]}
                                  onChange={(value) => {
                                    const newWeights = [...portfolioWeights];
                                    newWeights[idx] = value || 0;
                                    setPortfolioWeights(newWeights);
                                  }}
                                  min={0}
                                  max={1}
                                  step={0.05}
                                  formatter={value => `${((value || 0) * 100).toFixed(0)}%`}
                                  parser={value => (value.replace('%', '') / 100) || 0}
                                  style={{ width: '35%' }}
                                  placeholder="Weight"
                                />
                                <Button 
                                  danger 
                                  size="small"
                                  onClick={() => {
                                    if (portfolioTickers.length > 1) {
                                      const newTickers = portfolioTickers.filter((_, i) => i !== idx);
                                      const newWeights = portfolioWeights.filter((_, i) => i !== idx);
                                      // Normalize weights
                                      const total = newWeights.reduce((sum, w) => sum + (w || 0), 0);
                                      const normalized = total > 0 ? newWeights.map(w => (w || 0) / total) : newWeights.map(() => 1 / newWeights.length);
                                      setPortfolioTickers(newTickers);
                                      setPortfolioWeights(normalized);
                                    }
                                  }}
                                  disabled={portfolioTickers.length <= 1}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </Space>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                          <Space>
                            <Button 
                              type="dashed" 
                              onClick={() => {
                                setPortfolioTickers([...portfolioTickers, 'AAPL']);
                                setPortfolioWeights([...portfolioWeights, 0]);
                              }}
                              disabled={portfolioTickers.length >= 5}
                            >
                              + Add Stock
                            </Button>
                            <span style={{ color: themeStyles.textColor, fontWeight: 'bold' }}>
                              Total Weight: {(portfolioWeights.reduce((sum, w) => sum + (w || 0), 0) * 100).toFixed(1)}%
                            </span>
                          </Space>
                        </div>
                        
                        {Math.abs(portfolioWeights.reduce((sum, w) => sum + (w || 0), 0) - 1.0) > 0.01 && (
                          <Alert
                            message="Warning"
                            description="Portfolio weights must sum to 100%. Current total is not 100%."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                        )}
                        
                        <Button 
                          onClick={fetchPortfolio} 
                          type="primary" 
                          block
                          disabled={Math.abs(portfolioWeights.reduce((sum, w) => sum + (w || 0), 0) - 1.0) > 0.01}
                        >
                          Analyze Portfolio
                        </Button>
                      </Card>
                    </Col>
                    
                    <Col span={12}>
                      {portfolioData?.portfolio && !portfolioData.portfolio.error ? (
                        <Card 
                          title={<span style={{ color: themeStyles.textColor }}>Portfolio Performance Metrics</span>}
                          size="small"
                          style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                          headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                          bodyStyle={{ background: themeStyles.cardBackground }}
                        >
                          <Row gutter={[16, 16]}>
                            <Col span={12}>
                              <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                                <Statistic
                                  title={<span style={{ color: themeStyles.textColor }}>Total Return</span>}
                                  value={portfolioData.portfolio.total_return || 0}
                                  precision={2}
                                  suffix="%"
                                  valueStyle={{ 
                                    color: (portfolioData.portfolio.total_return || 0) > 0 ? '#52c41a' : '#ff4d4f', 
                                    fontSize: 24 
                                  }}
                                />
                                <Tooltip title="Total return over the analysis period">
                                  <span style={{ color: themeStyles.textColor, fontSize: 12, opacity: 0.7 }}>ℹ️</span>
                                </Tooltip>
                              </Card>
                            </Col>
                            <Col span={12}>
                              <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                                <Statistic
                                  title={<span style={{ color: themeStyles.textColor }}>Average Return</span>}
                                  value={portfolioData.portfolio.average_return || 0}
                                  precision={2}
                                  suffix="%"
                                  valueStyle={{ fontSize: 20, color: themeStyles.textColor }}
                                />
                                <Tooltip title="Average daily return">
                                  <span style={{ color: themeStyles.textColor, fontSize: 12, opacity: 0.7 }}>ℹ️</span>
                                </Tooltip>
                              </Card>
                            </Col>
                            <Col span={12}>
                              <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                                <Statistic
                                  title={<span style={{ color: themeStyles.textColor }}>Sharpe Ratio</span>}
                                  value={portfolioData.portfolio.sharpe_ratio || 0}
                                  precision={2}
                                  valueStyle={{ fontSize: 20, color: themeStyles.textColor }}
                                />
                                <Tooltip title="Risk-adjusted return measure. Higher is better (typically >1 is good)">
                                  <span style={{ color: themeStyles.textColor, fontSize: 12, opacity: 0.7 }}>ℹ️</span>
                                </Tooltip>
                              </Card>
                            </Col>
                            <Col span={12}>
                              <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                                <Statistic
                                  title={<span style={{ color: themeStyles.textColor }}>Volatility</span>}
                                  value={portfolioData.portfolio.volatility || 0}
                                  precision={2}
                                  suffix="%"
                                  valueStyle={{ fontSize: 20, color: themeStyles.textColor }}
                                />
                                <Tooltip title="Portfolio risk measure. Lower is better">
                                  <span style={{ color: themeStyles.textColor, fontSize: 12, opacity: 0.7 }}>ℹ️</span>
                                </Tooltip>
                              </Card>
                            </Col>
                          </Row>
                          
                          <Divider style={{ borderColor: themeStyles.borderColor }} />
                          
                          <div style={{ marginTop: 16 }}>
                            <h5 style={{ color: themeStyles.textColor, marginBottom: 16 }}>Portfolio Composition:</h5>
                            {portfolioData.portfolio.tickers && portfolioData.portfolio.weights && 
                              portfolioData.portfolio.tickers.map((t, idx) => {
                                const weight = portfolioData.portfolio.weights[idx] || 0;
                                return (
                                  <div key={idx} style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                      <span style={{ color: themeStyles.textColor, fontWeight: 'bold' }}>{t}</span>
                                      <span style={{ color: themeStyles.textColor }}>{(weight * 100).toFixed(1)}%</span>
                                    </div>
                                    <Progress 
                                      percent={weight * 100} 
                                      showInfo={false}
                                      strokeColor={idx % 2 === 0 ? '#1890ff' : '#52c41a'}
                                    />
                                  </div>
                                );
                              })
                            }
                          </div>
                        </Card>
                      ) : portfolioData?.portfolio?.error ? (
                        <Alert
                          message="Portfolio Analysis Error"
                          description={portfolioData.portfolio.error}
                          type="error"
                          showIcon
                        />
                      ) : (
                        <Card 
                          style={{ 
                            textAlign: 'center', 
                            padding: '40px 0', 
                            background: themeStyles.cardBackground,
                            borderColor: themeStyles.borderColor
                          }}
                        >
                          <p style={{ color: themeStyles.textColor, fontSize: 16 }}>
                            Configure your portfolio on the left and click "Analyze Portfolio" to see detailed performance metrics
                          </p>
                        </Card>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><BarChartOutlined />Model Benchmark</span>} key="evaluation">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>{ticker} Model Evaluation & Benchmarking</span>}
                  className="chart-container"
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor, borderBottom: `1px solid ${themeStyles.borderColor}` }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  {evaluationData ? (
                    <div>
                      <h3 style={{ color: themeStyles.textColor, marginBottom: 16 }}>
                        Best Model: <Tag color="green">{evaluationData.best_model || 'N/A'}</Tag>
                      </h3>
                      <div style={{ marginTop: 16 }}>
                        {Object.entries(evaluationData.model_metrics || {}).map(([model, metrics]) => (
                          <Card 
                            key={model} 
                            size="small" 
                            style={{ 
                              marginBottom: 8, 
                              background: themeStyles.cardBackground, 
                              borderColor: themeStyles.borderColor 
                            }}
                            headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                            bodyStyle={{ background: themeStyles.cardBackground }}
                          >
                            <h4 style={{ color: themeStyles.textColor }}>{model}</h4>
                            <Row gutter={[16, 8]}>
                              {Object.entries(metrics || {}).map(([metric, value]) => (
                                <Col span={6} key={metric}>
                                  <Statistic
                                    title={<span style={{ color: themeStyles.textColor, fontSize: 12 }}>{metric}</span>}
                                    value={value || 0}
                                    precision={metric.includes('Accuracy') || metric.includes('Coverage') ? 2 : 4}
                                    suffix={metric.includes('Accuracy') || metric.includes('Coverage') ? '%' : ''}
                                    valueStyle={{ fontSize: '14px', color: themeStyles.textColor }}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="loading-container">
                      <Spin size="large" />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* NEW: Alerts Tab */}
          <TabPane tab={<span><BellOutlined />Alerts</span>} key="alerts">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>{ticker} Trading Alerts</span>}
                  extra={<Badge count={alertsData?.alert_count || 0} />}
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  {alertsData?.alerts && alertsData.alerts.length > 0 ? (
                    <div>
                      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                          <Card size="small" style={{ background: '#ff4d4f22', border: '1px solid #ff4d4f' }}>
                            <Statistic title="High Priority" value={alertsData.high_priority_count || 0} valueStyle={{ color: '#ff4d4f' }} prefix={<ExclamationCircleOutlined />} />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small" style={{ background: '#faad1422', border: '1px solid #faad14' }}>
                            <Statistic title="Medium Priority" value={alertsData.medium_priority_count || 0} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small" style={{ background: '#52c41a22', border: '1px solid #52c41a' }}>
                            <Statistic title="Low Priority" value={alertsData.low_priority_count || 0} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
                          </Card>
                        </Col>
                      </Row>
                      <Timeline>
                        {alertsData.alerts.map((alert, idx) => (
                          <Timeline.Item 
                            key={idx} 
                            color={alert.severity === 'HIGH' ? 'red' : alert.severity === 'MEDIUM' ? 'orange' : 'green'}
                          >
                            <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                              <h4 style={{ color: themeStyles.textColor, margin: 0 }}>{alert.title}</h4>
                              <p style={{ color: themeStyles.textColor, opacity: 0.8, margin: '8px 0' }}>{alert.message}</p>
                              <Tag color={alert.severity === 'HIGH' ? 'red' : alert.severity === 'MEDIUM' ? 'orange' : 'green'}>
                                {alert.severity}
                              </Tag>
                              <div style={{ marginTop: 8, padding: '8px', background: themeStyles.inputBg, borderRadius: '4px' }}>
                                <strong style={{ color: themeStyles.textColor }}>Recommendation: </strong>
                                <span style={{ color: themeStyles.textColor }}>{alert.recommendation}</span>
                              </div>
                            </Card>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </div>
                  ) : (
                    <Alert message="No alerts at this time" description="All indicators are within normal ranges." type="success" showIcon />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* NEW: Backtesting Tab */}
          <TabPane tab={<span><ExperimentOutlined />Backtest</span>} key="backtest">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>{ticker} Backtesting Results</span>}
                  extra={<Button type="primary" onClick={fetchBacktest}>Run Backtest</Button>}
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  <Alert 
                    message="What is Backtesting?" 
                    description="Backtesting simulates how a trading strategy would have performed on historical data. It helps validate prediction models before using them for real trading." 
                    type="info" 
                    showIcon 
                    style={{ marginBottom: 24 }} 
                  />
                  {backtestData ? (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic 
                              title={<span style={{ color: themeStyles.textColor }}>Initial Capital</span>}
                              value={backtestData.initial_capital || 10000}
                              prefix="$"
                              valueStyle={{ color: themeStyles.textColor }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic 
                              title={<span style={{ color: themeStyles.textColor }}>Final Value</span>}
                              value={backtestData.final_value || 0}
                              prefix="$"
                              precision={2}
                              valueStyle={{ color: (backtestData.total_return || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic 
                              title={<span style={{ color: themeStyles.textColor }}>Strategy Return</span>}
                              value={backtestData.total_return || 0}
                              suffix="%"
                              precision={2}
                              valueStyle={{ color: (backtestData.total_return || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic 
                              title={<span style={{ color: themeStyles.textColor }}>Prediction Accuracy</span>}
                              value={backtestData.prediction_accuracy || 0}
                              suffix="%"
                              precision={1}
                              valueStyle={{ color: (backtestData.prediction_accuracy || 0) >= 50 ? '#52c41a' : '#ff4d4f' }}
                            />
                          </Card>
                        </Col>
                      </Row>
                      <Divider />
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Performance Comparison</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <p style={{ color: themeStyles.textColor }}><strong>Buy & Hold Return:</strong> {(backtestData.buy_hold_return || 0).toFixed(2)}%</p>
                            <p style={{ color: themeStyles.textColor }}><strong>Strategy Outperformance:</strong> 
                              <Tag color={(backtestData.outperformance || 0) >= 0 ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                                {(backtestData.outperformance || 0) >= 0 ? '+' : ''}{(backtestData.outperformance || 0).toFixed(2)}%
                              </Tag>
                            </p>
                            <p style={{ color: themeStyles.textColor }}><strong>Verdict:</strong> {backtestData.performance_verdict}</p>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Trade Statistics</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <p style={{ color: themeStyles.textColor }}><strong>Total Trades:</strong> {backtestData.total_trades || 0}</p>
                            <p style={{ color: themeStyles.textColor }}><strong>Correct Predictions:</strong> {backtestData.predictions_correct || 0} / {backtestData.predictions_total || 0}</p>
                          </Card>
                        </Col>
                      </Row>
                      {backtestData.trades && backtestData.trades.length > 0 && (
                        <>
                          <Divider>Recent Trades</Divider>
                          <Table 
                            dataSource={backtestData.trades.map((t, i) => ({ ...t, key: i }))}
                            columns={[
                              { title: 'Date', dataIndex: 'date', key: 'date', render: d => moment(d).format('MMM DD, HH:mm') },
                              { title: 'Action', dataIndex: 'action', key: 'action', render: a => <Tag color={a === 'BUY' ? 'green' : 'red'}>{a}</Tag> },
                              { title: 'Price', dataIndex: 'price', key: 'price', render: p => `$${p.toFixed(2)}` },
                              { title: 'Shares', dataIndex: 'shares', key: 'shares' },
                              { title: 'Cash After', dataIndex: 'capital_after', key: 'capital_after', render: c => `$${c.toFixed(2)}` }
                            ]}
                            pagination={false}
                            size="small"
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Button type="primary" size="large" onClick={fetchBacktest} icon={<ExperimentOutlined />}>
                        Run Backtest Simulation
                      </Button>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* NEW: Stock Comparison Tab */}
          <TabPane tab={<span><SwapOutlined />Compare</span>} key="compare">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>Stock Comparison</span>}
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  <div style={{ marginBottom: 24 }}>
                    <Space>
                      <Select 
                        mode="multiple" 
                        value={compareTickersList} 
                        onChange={setCompareTickersList}
                        style={{ minWidth: 300 }}
                        placeholder="Select stocks to compare"
                      >
                        {tickers.map(t => <Option key={t} value={t}>{t}</Option>)}
                      </Select>
                      <Button type="primary" onClick={fetchComparison}>Compare</Button>
                    </Space>
                  </div>
                  {comparisonData?.comparison && comparisonData.comparison.length > 0 ? (
                    <div>
                      <Table 
                        dataSource={comparisonData.comparison.map((c, i) => ({ ...c, key: i }))}
                        columns={[
                          { title: 'Ticker', dataIndex: 'ticker', key: 'ticker', render: t => <Tag color="blue">{t}</Tag> },
                          { title: 'Price', dataIndex: 'current_price', key: 'price', render: p => `$${p.toFixed(2)}` },
                          { title: 'Daily Return', dataIndex: 'daily_return', key: 'daily', render: r => <span style={{ color: r >= 0 ? '#52c41a' : '#ff4d4f' }}>{r >= 0 ? '+' : ''}{r.toFixed(2)}%</span> },
                          { title: 'Total Return', dataIndex: 'total_return', key: 'total', render: r => <span style={{ color: r >= 0 ? '#52c41a' : '#ff4d4f' }}>{r >= 0 ? '+' : ''}{r.toFixed(2)}%</span> },
                          { title: 'Volatility', dataIndex: 'volatility', key: 'vol', render: v => `${v.toFixed(2)}%` },
                          { title: 'Sharpe Ratio', dataIndex: 'sharpe_ratio', key: 'sharpe', render: s => s.toFixed(2) },
                          { title: 'Sentiment', dataIndex: 'sentiment', key: 'sentiment', render: s => <Tag color={s > 0.1 ? 'green' : s < -0.1 ? 'red' : 'orange'}>{s.toFixed(3)}</Tag> }
                        ]}
                        pagination={false}
                      />
                      {comparisonData.recommendations && (
                        <Alert 
                          message="Comparison Insights"
                          description={comparisonData.recommendations.interpretation}
                          type="info"
                          showIcon
                          style={{ marginTop: 16 }}
                        />
                      )}
                    </div>
                  ) : (
                    <Alert message="Select stocks and click Compare" type="info" showIcon />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* NEW: Market Insights Tab */}
          <TabPane tab={<span><BulbOutlined />Insights</span>} key="insights">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>{ticker} Market Insights</span>}
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  {marketInsights ? (
                    <Row gutter={[24, 24]}>
                      <Col span={8}>
                        <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Trend Analysis</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                          <Statistic 
                            value={marketInsights.trend_analysis?.trend || 'N/A'}
                            valueStyle={{ color: marketInsights.trend_analysis?.trend?.includes('BULL') ? '#52c41a' : marketInsights.trend_analysis?.trend?.includes('BEAR') ? '#ff4d4f' : '#faad14', fontSize: 18 }}
                          />
                          <p style={{ color: themeStyles.textColor, marginTop: 8, fontSize: 12 }}>{marketInsights.trend_analysis?.description}</p>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Momentum</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                          <Statistic 
                            value={marketInsights.momentum_analysis?.momentum || 'N/A'}
                            valueStyle={{ color: marketInsights.momentum_analysis?.momentum?.includes('POSITIVE') ? '#52c41a' : '#ff4d4f', fontSize: 18 }}
                          />
                          <p style={{ color: themeStyles.textColor, marginTop: 8, fontSize: 12 }}>{marketInsights.momentum_analysis?.insight}</p>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Volatility</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                          <Statistic 
                            value={marketInsights.volatility_analysis?.assessment || 'N/A'}
                            valueStyle={{ color: marketInsights.volatility_analysis?.assessment === 'LOW' ? '#52c41a' : marketInsights.volatility_analysis?.assessment === 'HIGH' ? '#ff4d4f' : '#faad14', fontSize: 18 }}
                          />
                          <p style={{ color: themeStyles.textColor, marginTop: 8, fontSize: 12 }}>{marketInsights.volatility_analysis?.insight}</p>
                        </Card>
                      </Col>
                      <Col span={24}>
                        <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Key Price Levels</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                          <Row gutter={16}>
                            <Col span={8}><Statistic title="Resistance" value={marketInsights.key_levels?.resistance || 0} prefix="$" precision={2} valueStyle={{ color: '#ff4d4f' }} /></Col>
                            <Col span={8}><Statistic title="Current" value={marketInsights.current_price || 0} prefix="$" precision={2} valueStyle={{ color: '#1890ff' }} /></Col>
                            <Col span={8}><Statistic title="Support" value={marketInsights.key_levels?.support || 0} prefix="$" precision={2} valueStyle={{ color: '#52c41a' }} /></Col>
                          </Row>
                        </Card>
                      </Col>
                      <Col span={24}>
                        <Alert 
                          message={`Overall Outlook: ${marketInsights.overall_outlook?.sentiment || 'N/A'}`}
                          description={`Confidence: ${marketInsights.overall_outlook?.confidence || 'N/A'}. Volume trend: ${marketInsights.volume_analysis?.trend || 'N/A'}. ${marketInsights.volume_analysis?.insight || ''}`}
                          type={marketInsights.overall_outlook?.sentiment === 'BULLISH' ? 'success' : marketInsights.overall_outlook?.sentiment === 'BEARISH' ? 'error' : 'info'}
                          showIcon
                        />
                      </Col>
                    </Row>
                  ) : (
                    <Spin size="large" />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* NEW: Paper Trading Tab */}
          <TabPane tab={<span><PlayCircleOutlined />Paper Trade</span>} key="paper-trade">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>Execute Paper Trade</span>}
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  <Alert 
                    message="Paper Trading" 
                    description="Practice trading without risking real money. All trades are simulated." 
                    type="info" 
                    showIcon 
                    style={{ marginBottom: 16 }} 
                  />
                  {tradeRecommendation && (
                    <Card size="small" style={{ marginBottom: 16, background: tradeRecommendation.recommendation === 'BUY' ? '#52c41a22' : tradeRecommendation.recommendation === 'SELL' ? '#ff4d4f22' : '#faad1422' }}>
                      <h4 style={{ color: themeStyles.textColor }}>AI Recommendation: {tradeRecommendation.recommendation}</h4>
                      <p style={{ color: themeStyles.textColor }}>{tradeRecommendation.rationale}</p>
                      {tradeRecommendation.stop_loss && <p style={{ color: themeStyles.textColor }}><strong>Stop Loss:</strong> ${tradeRecommendation.stop_loss} | <strong>Take Profit:</strong> ${tradeRecommendation.take_profit}</p>}
                    </Card>
                  )}
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Select value={paperTradeForm.ticker} onChange={v => setPaperTradeForm({ ...paperTradeForm, ticker: v })} style={{ width: '100%' }}>
                      {tickers.map(t => <Option key={t} value={t}>{t}</Option>)}
                    </Select>
                    <Select value={paperTradeForm.action} onChange={v => setPaperTradeForm({ ...paperTradeForm, action: v })} style={{ width: '100%' }}>
                      <Option value="BUY">BUY</Option>
                      <Option value="SELL">SELL</Option>
                    </Select>
                    <InputNumber placeholder="Shares" value={paperTradeForm.shares} onChange={v => setPaperTradeForm({ ...paperTradeForm, shares: v })} style={{ width: '100%' }} min={1} />
                    <InputNumber placeholder="Price" value={paperTradeForm.price} onChange={v => setPaperTradeForm({ ...paperTradeForm, price: v })} style={{ width: '100%' }} min={0.01} step={0.01} prefix="$" />
                    <Button type="primary" block onClick={executePaperTrade} icon={<PlayCircleOutlined />}>
                      Execute {paperTradeForm.action} Order
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>Account Summary</span>}
                  extra={<Button onClick={fetchPaperTradeAccount}>Refresh</Button>}
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  {paperTradeAccount ? (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col span={12}><Statistic title="Cash" value={paperTradeAccount.cash || 100000} prefix="$" precision={2} valueStyle={{ color: themeStyles.textColor }} /></Col>
                        <Col span={12}><Statistic title="Total Value" value={paperTradeAccount.total_value || 100000} prefix="$" precision={2} valueStyle={{ color: '#1890ff' }} /></Col>
                        <Col span={12}><Statistic title="Total P&L" value={paperTradeAccount.total_pnl || 0} prefix="$" precision={2} valueStyle={{ color: (paperTradeAccount.total_pnl || 0) >= 0 ? '#52c41a' : '#ff4d4f' }} /></Col>
                        <Col span={12}><Statistic title="Total Trades" value={paperTradeAccount.trade_count || 0} valueStyle={{ color: themeStyles.textColor }} /></Col>
                      </Row>
                      {paperTradeAccount.positions && paperTradeAccount.positions.length > 0 && (
                        <>
                          <Divider>Open Positions</Divider>
                          {paperTradeAccount.positions.map((pos, idx) => (
                            <Card key={idx} size="small" style={{ marginBottom: 8, background: themeStyles.inputBg }}>
                              <Row justify="space-between">
                                <Col><Tag color="blue">{pos.ticker}</Tag></Col>
                                <Col>{pos.shares} shares @ ${pos.avg_cost?.toFixed(2)}</Col>
                                <Col>Value: ${pos.current_value?.toFixed(2)}</Col>
                              </Row>
                            </Card>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <Alert message="Starting Capital: $100,000" type="info" showIcon />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* NEW: Final Recommendation Tab */}
          <TabPane tab={<span><TrophyOutlined />Final Call</span>} key="final">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                {finalRecommendation ? (
                  <Card 
                    style={{ 
                      background: finalRecommendation.final_recommendation?.includes('BUY') ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' :
                                finalRecommendation.final_recommendation?.includes('SELL') ? 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' :
                                'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                      border: 'none',
                      borderRadius: 12
                    }}
                  >
                    <Row gutter={[24, 24]} align="middle">
                      <Col span={12}>
                        <h1 style={{ color: 'white', fontSize: 48, margin: 0 }}>
                          {finalRecommendation.final_recommendation?.includes('STRONG_BUY') ? '🚀' : 
                           finalRecommendation.final_recommendation?.includes('BUY') ? '📈' :
                           finalRecommendation.final_recommendation?.includes('STRONG_SELL') ? '📉' :
                           finalRecommendation.final_recommendation?.includes('SELL') ? '⬇️' : '⏸️'}
                          {finalRecommendation.final_recommendation}
                        </h1>
                        <p style={{ color: 'white', fontSize: 20, margin: '16px 0' }}>
                          {ticker} @ ${finalRecommendation.current_price?.toFixed(2)}
                        </p>
                        <Tag color="rgba(255,255,255,0.3)" style={{ color: 'white', fontSize: 16, padding: '4px 12px' }}>
                          Confidence: {finalRecommendation.confidence}
                        </Tag>
                      </Col>
                      <Col span={12}>
                        <Card style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}>
                          <Statistic 
                            title={<span style={{ color: 'white' }}>Composite Score</span>}
                            value={finalRecommendation.composite_score || 0}
                            precision={3}
                            valueStyle={{ color: 'white', fontSize: 36 }}
                          />
                          <p style={{ color: 'white', margin: '8px 0' }}>
                            Predicted Change: {finalRecommendation.components?.forecast?.predicted_change || 0}%
                          </p>
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                ) : (
                  <Spin size="large" />
                )}
              </Col>
              {finalRecommendation && (
                <>
                  <Col span={24}>
                    <Card 
                      title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>Decision Reasoning</span>}
                      style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                      headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                      bodyStyle={{ background: themeStyles.cardBackground }}
                    >
                      <List
                        dataSource={finalRecommendation.reasoning || []}
                        renderItem={item => (
                          <List.Item style={{ color: themeStyles.textColor, borderColor: themeStyles.borderColor }}>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" title={<span style={{ color: themeStyles.textColor }}>News Sentiment</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                      <Statistic value={finalRecommendation.components?.news_sentiment?.impact || 'N/A'} valueStyle={{ color: finalRecommendation.components?.news_sentiment?.score > 0 ? '#52c41a' : '#ff4d4f' }} />
                      <Progress percent={Math.abs((finalRecommendation.components?.news_sentiment?.score || 0) * 100)} size="small" />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Trading Signals</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                      <Statistic value={finalRecommendation.components?.signals?.recommendation || 'N/A'} valueStyle={{ color: finalRecommendation.components?.signals?.recommendation?.includes('BUY') ? '#52c41a' : '#ff4d4f' }} />
                      <p style={{ color: themeStyles.textColor, fontSize: 12 }}>Buy: {finalRecommendation.components?.signals?.buy_signals} | Sell: {finalRecommendation.components?.signals?.sell_signals}</p>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Risk Level</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                      <Statistic value={finalRecommendation.components?.risk?.level || 'N/A'} valueStyle={{ color: finalRecommendation.components?.risk?.level === 'LOW' ? '#52c41a' : finalRecommendation.components?.risk?.level === 'HIGH' ? '#ff4d4f' : '#faad14' }} />
                      <p style={{ color: themeStyles.textColor, fontSize: 12 }}>Anomalies: {finalRecommendation.components?.risk?.anomalies || 0}</p>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" title={<span style={{ color: themeStyles.textColor }}>Market Trend</span>} style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                      <Statistic value={finalRecommendation.components?.trend?.direction || 'N/A'} valueStyle={{ color: finalRecommendation.components?.trend?.direction?.includes('BULL') ? '#52c41a' : '#ff4d4f', fontSize: 14 }} />
                      <p style={{ color: themeStyles.textColor, fontSize: 12 }}>Momentum: {finalRecommendation.components?.trend?.momentum}</p>
                    </Card>
                  </Col>
                  {finalRecommendation.alerts && finalRecommendation.alerts.length > 0 && (
                    <Col span={24}>
                      <Card title={<span style={{ color: themeStyles.textColor }}>Active Alerts</span>} size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                        {finalRecommendation.alerts.map((alert, idx) => (
                          <Alert key={idx} message={alert.title} description={alert.recommendation} type={alert.severity === 'HIGH' ? 'error' : 'warning'} showIcon style={{ marginBottom: 8 }} />
                        ))}
                      </Card>
                    </Col>
                  )}
                </>
              )}
            </Row>
          </TabPane>

          {/* NEW: News Tab */}
          <TabPane tab={<span><FileTextOutlined />News</span>} key="news">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={<span style={{ color: themeStyles.textColor, fontSize: 18, fontWeight: 'bold' }}>{ticker} News Analysis</span>}
                  style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}
                  headStyle={{ background: themeStyles.cardBackground, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}
                  bodyStyle={{ background: themeStyles.cardBackground }}
                >
                  {newsData ? (
                    <div>
                      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                          <Card size="small" style={{ background: themeStyles.cardBackground, borderColor: themeStyles.borderColor }}>
                            <Statistic title="Total Headlines" value={newsData.total_headlines || 0} valueStyle={{ color: themeStyles.textColor }} />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: '#52c41a22', border: '1px solid #52c41a' }}>
                            <Statistic title="Positive" value={newsData.sentiment_summary?.positive_count || 0} valueStyle={{ color: '#52c41a' }} />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: '#ff4d4f22', border: '1px solid #ff4d4f' }}>
                            <Statistic title="Negative" value={newsData.sentiment_summary?.negative_count || 0} valueStyle={{ color: '#ff4d4f' }} />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ background: '#faad1422', border: '1px solid #faad14' }}>
                            <Statistic title="Neutral" value={newsData.sentiment_summary?.neutral_count || 0} valueStyle={{ color: '#faad14' }} />
                          </Card>
                        </Col>
                      </Row>
                      <Alert 
                        message={`Sentiment: ${newsData.recommendation_impact}`}
                        description={newsData.overall_interpretation}
                        type={newsData.recommendation_impact === 'BUY' ? 'success' : newsData.recommendation_impact === 'SELL' ? 'error' : 'info'}
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                      <List
                        itemLayout="horizontal"
                        dataSource={newsData.news_items?.slice(0, 10) || []}
                        renderItem={item => (
                          <List.Item style={{ borderColor: themeStyles.borderColor }}>
                            <List.Item.Meta
                              avatar={
                                <Tag color={item.sentiment_label === 'POSITIVE' ? 'green' : item.sentiment_label === 'NEGATIVE' ? 'red' : 'orange'}>
                                  {item.sentiment_score?.toFixed(2)}
                                </Tag>
                              }
                              title={<span style={{ color: themeStyles.textColor }}>{item.headline}</span>}
                              description={
                                <div>
                                  <p style={{ color: themeStyles.textColor, opacity: 0.7, margin: 0 }}>{item.summary}</p>
                                  <Space style={{ marginTop: 4 }}>
                                    <Tag>{item.category}</Tag>
                                    <Tag>{item.source}</Tag>
                                    <span style={{ color: themeStyles.textColor, opacity: 0.5, fontSize: 12 }}>{moment(item.date).format('MMM DD, HH:mm')}</span>
                                  </Space>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  ) : (
                    <Spin size="large" />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
}

export default App;
