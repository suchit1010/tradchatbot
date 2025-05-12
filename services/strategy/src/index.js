require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const mongoose = require('mongoose');
const { SMA, RSI, MACD, BollingerBands } = require('technicalindicators');

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

// MongoDB Connection (if using MongoDB)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info('MongoDB connected'))
    .catch(err => logger.error('MongoDB connection error', { error: err }));
}

// Strategy model schema
const strategySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  code: { type: String, required: true },
  userId: String,
  symbol: String,
  timeframe: String,
  parameters: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create model if using MongoDB
const Strategy = process.env.MONGODB_URI ? mongoose.model('Strategy', strategySchema) : null;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'strategy' });
});

// Create a new strategy
app.post('/api/strategies', async (req, res) => {
  try {
    const { name, description, code, userId, symbol, timeframe, parameters } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    // If MongoDB is connected, save to database
    if (Strategy) {
      const strategy = new Strategy({
        name,
        description,
        code,
        userId,
        symbol,
        timeframe,
        parameters
      });
      
      await strategy.save();
      logger.info(`Strategy created: ${name}`);
      return res.status(201).json(strategy);
    } 
    
    // If no database, return mock response
    logger.info(`Strategy created (mock): ${name}`);
    return res.status(201).json({
      id: Math.random().toString(36).substring(7),
      name,
      description,
      code,
      userId,
      symbol,
      timeframe,
      parameters,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    logger.error('Error creating strategy', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all strategies
app.get('/api/strategies', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // If MongoDB is connected, fetch from database
    if (Strategy) {
      const query = userId ? { userId } : {};
      const strategies = await Strategy.find(query).sort('-createdAt');
      return res.status(200).json(strategies);
    }
    
    // If no database, return mock strategies
    return res.status(200).json([
      {
        id: '1',
        name: 'Moving Average Crossover',
        description: 'Simple MA crossover strategy',
        symbol: 'BINANCE:BTCUSDT',
        timeframe: '1D',
        userId: userId || 'user1',
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'RSI Overbought/Oversold',
        description: 'RSI based mean reversion strategy',
        symbol: 'BINANCE:ETHUSDT',
        timeframe: '4H',
        userId: userId || 'user1',
        createdAt: new Date()
      }
    ]);
  } catch (error) {
    logger.error('Error fetching strategies', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get strategy by ID
app.get('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If MongoDB is connected, fetch from database
    if (Strategy) {
      const strategy = await Strategy.findById(id);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      return res.status(200).json(strategy);
    }
    
    // If no database, return mock strategy
    return res.status(200).json({
      id,
      name: 'Moving Average Crossover',
      description: 'Simple MA crossover strategy',
      code: `
//@version=5
strategy("MA Crossover", overlay=true)

// Inputs
fastLength = input(9, "Fast Length")
slowLength = input(21, "Slow Length")
stopLoss = input(5, "Stop Loss %") / 100

// Calculate MAs
fastMA = ta.sma(close, fastLength)
slowMA = ta.sma(close, slowLength)

// Plot
plot(fastMA, "Fast MA", color.blue)
plot(slowMA, "Slow MA", color.red)

// Entry conditions
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Execute trades
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.entry("Short", strategy.short)

// Stop Loss
strategy.exit("Stop Loss", from_entry="Long", loss=stopLoss * strategy.position_avg_price)
strategy.exit("Stop Loss", from_entry="Short", loss=stopLoss * strategy.position_avg_price)
      `,
      symbol: 'BINANCE:BTCUSDT',
      timeframe: '1D',
      parameters: {
        fastLength: 9,
        slowLength: 21,
        stopLoss: 5
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    logger.error('Error fetching strategy', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update strategy
app.put('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, code, symbol, timeframe, parameters } = req.body;
    
    // If MongoDB is connected, update in database
    if (Strategy) {
      const strategy = await Strategy.findById(id);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      strategy.name = name || strategy.name;
      strategy.description = description || strategy.description;
      strategy.code = code || strategy.code;
      strategy.symbol = symbol || strategy.symbol;
      strategy.timeframe = timeframe || strategy.timeframe;
      strategy.parameters = parameters || strategy.parameters;
      strategy.updatedAt = new Date();
      
      await strategy.save();
      logger.info(`Strategy updated: ${id}`);
      return res.status(200).json(strategy);
    }
    
    // If no database, return success message
    logger.info(`Strategy updated (mock): ${id}`);
    return res.status(200).json({
      id,
      name: name || 'Moving Average Crossover',
      description: description || 'Simple MA crossover strategy',
      code: code || 'strategy code here',
      symbol: symbol || 'BINANCE:BTCUSDT',
      timeframe: timeframe || '1D',
      parameters: parameters || {},
      updatedAt: new Date()
    });
  } catch (error) {
    logger.error('Error updating strategy', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete strategy
app.delete('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If MongoDB is connected, delete from database
    if (Strategy) {
      const strategy = await Strategy.findById(id);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      await Strategy.findByIdAndDelete(id);
      logger.info(`Strategy deleted: ${id}`);
      return res.status(204).send();
    }
    
    // If no database, return success
    logger.info(`Strategy deleted (mock): ${id}`);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting strategy', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Backtest a strategy
app.post('/api/backtest', async (req, res) => {
  try {
    const { symbol, timeframe, startDate, endDate, parameters, strategyType } = req.body;
    
    if (!symbol || !timeframe || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters. Symbol, timeframe, startDate, and endDate are required.' 
      });
    }

    // In a real implementation, you would:
    // 1. Fetch historical market data for the given symbol and timeframe
    // 2. Run the strategy algorithm on this data
    // 3. Calculate performance metrics
    
    // For this example, we'll return simulated backtest results
    logger.info(`Backtest executed for ${symbol} (${timeframe})`);
    
    // Simulate different results based on strategy type
    let profitFactor = 1.5;
    let winRate = 0.55;
    let drawdown = 15;
    
    if (strategyType === 'trend_following') {
      profitFactor = 1.8;
      winRate = 0.48;
      drawdown = 18;
    } else if (strategyType === 'mean_reversion') {
      profitFactor = 1.6;
      winRate = 0.62;
      drawdown = 12;
    } else if (strategyType === 'breakout') {
      profitFactor = 2.1;
      winRate = 0.42;
      drawdown = 22;
    }
    
    // Randomize the results slightly
    const randomizeFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    
    const trades = [];
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    const timeRange = endTimestamp - startTimestamp;
    
    // Generate sample trades
    for (let i = 0; i < 50; i++) {
      const isWin = Math.random() < winRate;
      const tradeTime = new Date(startTimestamp + Math.random() * timeRange);
      const entryPrice = 1000 + Math.random() * 9000;
      const exitPrice = isWin 
        ? entryPrice * (1 + Math.random() * 0.1) 
        : entryPrice * (1 - Math.random() * 0.05);
      
      trades.push({
        id: i + 1,
        time: tradeTime,
        type: Math.random() > 0.5 ? 'long' : 'short',
        entryPrice,
        exitPrice,
        profit: exitPrice - entryPrice,
        profitPercentage: ((exitPrice - entryPrice) / entryPrice) * 100,
        duration: Math.floor(Math.random() * 48) + 1 // hours
      });
    }
    
    // Calculate returns
    const returns = trades.map(t => t.profitPercentage);
    const totalReturn = returns.reduce((sum, val) => sum + val, 0) * randomizeFactor;
    
    return res.status(200).json({
      symbol,
      timeframe,
      startDate,
      endDate,
      results: {
        totalTrades: trades.length,
        winningTrades: trades.filter(t => t.profit > 0).length,
        losingTrades: trades.filter(t => t.profit <= 0).length,
        winRate: winRate * randomizeFactor,
        profitFactor: profitFactor * randomizeFactor,
        totalReturn: totalReturn,
        annualizedReturn: (totalReturn / 365) * 
          ((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
        maxDrawdown: drawdown * randomizeFactor,
        sharpeRatio: 1.2 * randomizeFactor,
        volatility: 25 * randomizeFactor
      },
      trades: trades.sort((a, b) => a.time - b.time) // Sort trades by time
    });
  } catch (error) {
    logger.error('Error running backtest', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Technical indicator calculations
app.post('/api/indicators', (req, res) => {
  try {
    const { indicator, data, params } = req.body;
    
    if (!indicator || !data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    let result;
    
    switch (indicator.toLowerCase()) {
      case 'sma':
        result = SMA.calculate({
          period: params?.period || 14,
          values: data
        });
        break;
      
      case 'rsi':
        result = RSI.calculate({
          period: params?.period || 14,
          values: data
        });
        break;
        
      case 'macd':
        result = MACD.calculate({
          fastPeriod: params?.fastPeriod || 12,
          slowPeriod: params?.slowPeriod || 26,
          signalPeriod: params?.signalPeriod || 9,
          values: data
        });
        break;
        
      case 'bollingerbands':
        result = BollingerBands.calculate({
          period: params?.period || 20,
          stdDev: params?.stdDev || 2,
          values: data
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported indicator' });
    }
    
    return res.status(200).json({ indicator, result });
  } catch (error) {
    logger.error('Error calculating indicator', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  logger.info(`Strategy service running on port ${PORT}`);
  console.log(`Strategy service running on port ${PORT}`);
}); 