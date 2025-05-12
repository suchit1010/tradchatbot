require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

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

// In-memory storage for orders and positions
const orders = [];
const positions = new Map();
const orderHistory = [];

// Order statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  FILLED: 'filled',
  PARTIAL: 'partially_filled',
  CANCELED: 'canceled',
  REJECTED: 'rejected'
};

// Order types
const ORDER_TYPE = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'execution' });
});

// Create new order
app.post('/api/orders', (req, res) => {
  try {
    const { 
      symbol, 
      side, 
      type, 
      quantity, 
      price, 
      stopPrice, 
      timeInForce, 
      userId 
    } = req.body;
    
    // Validate required fields
    if (!symbol || !side || !type || !quantity) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        requiredFields: ['symbol', 'side', 'type', 'quantity'] 
      });
    }
    
    // Validate side
    if (!['buy', 'sell'].includes(side.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid side value', 
        allowedValues: ['buy', 'sell'] 
      });
    }
    
    // Validate order type
    if (!Object.values(ORDER_TYPE).includes(type.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid order type', 
        allowedValues: Object.values(ORDER_TYPE) 
      });
    }
    
    // Validate price for limit orders
    if ((type === ORDER_TYPE.LIMIT || type === ORDER_TYPE.STOP_LIMIT) && !price) {
      return res.status(400).json({ 
        error: 'Price is required for limit orders' 
      });
    }
    
    // Validate stop price for stop orders
    if ((type === ORDER_TYPE.STOP || type === ORDER_TYPE.STOP_LIMIT) && !stopPrice) {
      return res.status(400).json({ 
        error: 'Stop price is required for stop orders' 
      });
    }
    
    // Create new order
    const order = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      symbol,
      side: side.toLowerCase(),
      type: type.toLowerCase(),
      quantity: parseFloat(quantity),
      price: price ? parseFloat(price) : null,
      stopPrice: stopPrice ? parseFloat(stopPrice) : null,
      timeInForce: timeInForce || 'GTC', // Good Till Canceled by default
      status: ORDER_STATUS.PENDING,
      filledQuantity: 0,
      averagePrice: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionPrice: null
    };
    
    // Process order (simulate execution)
    setTimeout(() => {
      // Simulate random price near requested price or current market price
      const executionPrice = price 
        ? price * (0.98 + Math.random() * 0.04) // ±2% from requested price
        : (symbol.includes('BTC') ? 50000 : 3000) * (0.98 + Math.random() * 0.04);
      
      order.status = ORDER_STATUS.FILLED;
      order.filledQuantity = order.quantity;
      order.averagePrice = executionPrice;
      order.executionPrice = executionPrice;
      order.updatedAt = new Date();
      
      // Update position
      updatePosition(order);
      
      // Move to order history
      orderHistory.push(order);
      const orderIndex = orders.findIndex(o => o.id === order.id);
      if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
      }
      
      logger.info(`Order filled: ${order.id}`);
    }, 2000);
    
    // Add to orders list
    orders.push(order);
    
    logger.info(`Order created: ${order.id}`);
    return res.status(201).json(order);
  } catch (error) {
    logger.error('Error creating order', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update position based on executed order
function updatePosition(order) {
  const { symbol, side, filledQuantity, averagePrice } = order;
  
  // Get current position
  let position = positions.get(symbol) || {
    symbol,
    quantity: 0,
    averagePrice: 0,
    unrealizedPnl: 0,
    realizedPnl: 0,
    lastUpdated: new Date()
  };
  
  // Calculate new position
  if (side === 'buy') {
    const totalValue = (position.quantity * position.averagePrice) + (filledQuantity * averagePrice);
    position.quantity += filledQuantity;
    position.averagePrice = totalValue / position.quantity;
  } else if (side === 'sell') {
    if (position.quantity >= filledQuantity) {
      // Calculate realized PnL from this sale
      const realizedPnlFromSale = filledQuantity * (averagePrice - position.averagePrice);
      position.realizedPnl += realizedPnlFromSale;
      position.quantity -= filledQuantity;
      
      // If all positions closed, reset average price
      if (position.quantity === 0) {
        position.averagePrice = 0;
      }
    } else {
      // Short position
      const previousPosition = position.quantity;
      const realizedPnlFromSale = previousPosition * (averagePrice - position.averagePrice);
      
      position.realizedPnl += realizedPnlFromSale;
      position.quantity = filledQuantity - previousPosition;
      position.averagePrice = averagePrice;
    }
  }
  
  position.lastUpdated = new Date();
  positions.set(symbol, position);
}

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    const { userId, symbol, status } = req.query;
    
    let filteredOrders = [...orders];
    
    // Filter by userId if provided
    if (userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === userId);
    }
    
    // Filter by symbol if provided
    if (symbol) {
      filteredOrders = filteredOrders.filter(order => order.symbol === symbol);
    }
    
    // Filter by status if provided
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    return res.status(200).json(filteredOrders);
  } catch (error) {
    logger.error('Error fetching orders', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check active orders
    const order = orders.find(order => order.id === id);
    
    if (order) {
      return res.status(200).json(order);
    }
    
    // Check order history
    const historicalOrder = orderHistory.find(order => order.id === id);
    
    if (historicalOrder) {
      return res.status(200).json(historicalOrder);
    }
    
    return res.status(404).json({ error: 'Order not found' });
  } catch (error) {
    logger.error('Error fetching order', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Cancel order
app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[orderIndex];
    
    // Check if order can be canceled
    if (order.status === ORDER_STATUS.FILLED) {
      return res.status(400).json({ error: 'Cannot cancel a filled order' });
    }
    
    // Cancel order
    order.status = ORDER_STATUS.CANCELED;
    order.updatedAt = new Date();
    
    // Move to order history
    orderHistory.push(order);
    orders.splice(orderIndex, 1);
    
    logger.info(`Order canceled: ${id}`);
    return res.status(200).json(order);
  } catch (error) {
    logger.error('Error canceling order', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get order history
app.get('/api/order-history', (req, res) => {
  try {
    const { userId, symbol, limit } = req.query;
    
    let filteredHistory = [...orderHistory];
    
    // Filter by userId if provided
    if (userId) {
      filteredHistory = filteredHistory.filter(order => order.userId === userId);
    }
    
    // Filter by symbol if provided
    if (symbol) {
      filteredHistory = filteredHistory.filter(order => order.symbol === symbol);
    }
    
    // Sort by creation date (newest first)
    filteredHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limit results if requested
    if (limit) {
      filteredHistory = filteredHistory.slice(0, parseInt(limit));
    }
    
    return res.status(200).json(filteredHistory);
  } catch (error) {
    logger.error('Error fetching order history', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get positions
app.get('/api/positions', (req, res) => {
  try {
    const { userId, symbol } = req.query;
    
    let positionsList = Array.from(positions.values());
    
    // Filter by symbol if provided
    if (symbol) {
      positionsList = positionsList.filter(position => position.symbol === symbol);
    }
    
    return res.status(200).json(positionsList);
  } catch (error) {
    logger.error('Error fetching positions', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get position by symbol
app.get('/api/positions/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    
    const position = positions.get(symbol);
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    return res.status(200).json(position);
  } catch (error) {
    logger.error('Error fetching position', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 8003;
app.listen(PORT, () => {
  logger.info(`Execution service running on port ${PORT}`);
  console.log(`Execution service running on port ${PORT}`);
}); 