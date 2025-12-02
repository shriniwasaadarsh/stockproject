import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Select, Button, Spin, Alert, Tabs, Statistic, Tag, Table, InputNumber, Divider, Space, Tooltip, Progress, Input, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';
import { 
  StockOutlined, RiseOutlined, BarChartOutlined, HeartOutlined, 
  WarningOutlined, DollarOutlined, SignalFilled, SafetyOutlined,
  SunOutlined, MoonOutlined, PlusOutlined, CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Header, Content } = Layout;
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
    if (!/^[A-Z]{1,5}$/.test(tickerUpper)) {
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

  useEffect(() => {
    fetchForecast();
    fetchSentiment();
    fetchEvaluation();
    fetchSignals();
    fetchAnomalies();
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
                      maxLength={5}
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
        </Tabs>
      </Content>
    </Layout>
  );
}

export default App;
