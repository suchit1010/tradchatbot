require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// Proxy middleware settings
// AI Agent Service
app.use('/api/ai', createProxyMiddleware({
  target: process.env.AI_SERVICE_URL || 'http://localhost:8001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ai': '/api',
  },
}));

// Strategy Service
app.use('/api/strategy', createProxyMiddleware({
  target: process.env.STRATEGY_SERVICE_URL || 'http://localhost:8002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/strategy': '/api',
  },
}));

// Execution Service
app.use('/api/execution', createProxyMiddleware({
  target: process.env.EXECUTION_SERVICE_URL || 'http://localhost:8003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/execution': '/api',
  },
}));

// Market Data Service
app.use('/api/market-data', createProxyMiddleware({
  target: process.env.MARKET_DATA_SERVICE_URL || 'http://localhost:8004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/market-data': '/api',
  },
}));

// Socket.IO implementation
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle client subscribing to market data
  socket.on('subscribe', (symbol) => {
    console.log(`Client subscribed to ${symbol}`);
    socket.join(symbol);
    
    // Example: Emit mock price updates every 3 seconds
    if (!global.intervals) global.intervals = {};
    
    if (!global.intervals[symbol]) {
      global.intervals[symbol] = setInterval(() => {
        const mockPrice = (Math.random() * 1000).toFixed(2);
        io.to(symbol).emit('price_update', {
          symbol,
          price: mockPrice,
          timestamp: new Date()
        });
      }, 3000);
    }
  });
  
  // Handle client unsubscribing
  socket.on('unsubscribe', (symbol) => {
    console.log(`Client unsubscribed from ${symbol}`);
    socket.leave(symbol);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
}); 