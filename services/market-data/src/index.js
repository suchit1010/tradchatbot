require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const axios = require('axios');
const WebSocket = require('ws');

// Initialize Express app
const app = express();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Mock market data cache
const marketDataCache = {
  'BINANCE:BTCUSDT': {
    lastPrice: 50000 + Math.random() * 5000,
    dailyChange: (Math.random() * 10) - 5,
    volume: Math.random() * 1000000000,
    high: 55000,
    low: 48000,
    lastUpdated: new Date()
  },
  'BINANCE:ETHUSDT': {
    lastPrice: 3000 + Math.random() * 500,
    dailyChange: (Math.random() * 10) - 5,
    volume: Math.random() * 500000000,
    high: 3500,
    low: 2800,
    lastUpdated: new Date()
  }
};

// WebSocket connections for real-time price updates
const symbolConnections = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'market-data' });
});

// Get current market data for a symbol
app.get('/api/market-data/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Check if we have cached data for this symbol
    if (marketDataCache[symbol]) {
      return res.status(200).json(marketDataCache[symbol]);
    }
    
    // If not in cache, return a mock response
    const mockData = {
      lastPrice: 1000 + Math.random() * 9000,
      dailyChange: (Math.random() * 10) - 5,
      volume: Math.random() * 1000000000,
      high: 10000,
      low: 9000,
      lastUpdated: new Date()
    };
    
    // Add to cache for future requests
    marketDataCache[symbol] = mockData;
    
    return res.status(200).json(mockData);
  } catch (error) {
    logger.error('Error fetching market data', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get historical data for a symbol
app.get('/api/historical/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe, limit } = req.query;
    
    const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
    
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({ 
        error: 'Invalid timeframe', 
        validTimeframes 
      });
    }
    
    // Generate historical candles
    const candles = [];
    const now = new Date();
    let price = symbol.includes('BTC') ? 50000 : 3000;
    
    // Determine time increment based on timeframe
    let timeIncrement;
    switch(timeframe) {
      case '1m': timeIncrement = 60 * 1000; break;
      case '5m': timeIncrement = 5 * 60 * 1000; break;
      case '15m': timeIncrement = 15 * 60 * 1000; break;
      case '30m': timeIncrement = 30 * 60 * 1000; break;
      case '1h': timeIncrement = 60 * 60 * 1000; break;
      case '4h': timeIncrement = 4 * 60 * 60 * 1000; break;
      case '1d': timeIncrement = 24 * 60 * 60 * 1000; break;
      case '1w': timeIncrement = 7 * 24 * 60 * 60 * 1000; break;
    }
    
    // Generate mock candles
    for (let i = 0; i < (limit || 100); i++) {
      const timestamp = new Date(now.getTime() - (i * timeIncrement));
      const volatility = price * 0.02; // 2% volatility per candle
      
      // Simulate price movements with some trend and randomness
      const trend = Math.sin(i / 10) * volatility * 0.5;
      const randomMove = (Math.random() - 0.5) * volatility;
      price = price + trend + randomMove;
      
      const open = price;
      const high = open * (1 + (Math.random() * 0.01));
      const low = open * (1 - (Math.random() * 0.01));
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * volatility * 0.5;
      const volume = Math.random() * 1000000;
      
      candles.unshift({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    return res.status(200).json({
      symbol,
      timeframe,
      candles
    });
  } catch (error) {
    logger.error('Error fetching historical data', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get multiple symbols market data
app.post('/api/market-data/batch', (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    const results = {};
    
    symbols.forEach(symbol => {
      if (marketDataCache[symbol]) {
        results[symbol] = marketDataCache[symbol];
      } else {
        // Create mock data for new symbols
        const mockData = {
          lastPrice: 1000 + Math.random() * 9000,
          dailyChange: (Math.random() * 10) - 5,
          volume: Math.random() * 1000000000,
          high: 10000,
          low: 9000,
          lastUpdated: new Date()
        };
        
        // Add to cache for future requests
        marketDataCache[symbol] = mockData;
        results[symbol] = mockData;
      }
    });
    
    return res.status(200).json(results);
  } catch (error) {
    logger.error('Error fetching batch market data', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Search for symbols
app.get('/api/symbols/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Sample symbols list
    const allSymbols = [
      { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', type: 'crypto' },
      { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', type: 'crypto' },
      { symbol: 'BINANCE:ADAUSDT', name: 'Cardano', type: 'crypto' },
      { symbol: 'BINANCE:SOLUSDT', name: 'Solana', type: 'crypto' },
      { symbol: 'BINANCE:DOGEUSDT', name: 'Dogecoin', type: 'crypto' },
      { symbol: 'NASDAQ:AAPL', name: 'Apple Inc.', type: 'stock' },
      { symbol: 'NASDAQ:MSFT', name: 'Microsoft Corporation', type: 'stock' },
      { symbol: 'NASDAQ:AMZN', name: 'Amazon.com, Inc.', type: 'stock' },
      { symbol: 'NYSE:TSLA', name: 'Tesla, Inc.', type: 'stock' },
      { symbol: 'NYSE:V', name: 'Visa Inc.', type: 'stock' }
    ];
    
    // Filter symbols based on query
    const filteredSymbols = allSymbols.filter(item => 
      item.symbol.toLowerCase().includes(query.toLowerCase()) || 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return res.status(200).json(filteredSymbols);
  } catch (error) {
    logger.error('Error searching symbols', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 8004;
app.listen(PORT, () => {
  logger.info(`Market Data service running on port ${PORT}`);
  console.log(`Market Data service running on port ${PORT}`);
}); 