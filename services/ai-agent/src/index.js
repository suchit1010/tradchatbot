require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const OpenAI = require('openai');
const winston = require('winston');

// Initialize Express app
const app = express();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  res.status(200).json({ status: 'ok', service: 'ai-agent' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, symbol } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Convert messages to OpenAI format
    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add system message with context about the trading platform
    openaiMessages.unshift({
      role: 'system',
      content: `You are an AI trading assistant for TradBot, an advanced trading platform. 
      You provide analysis, strategy suggestions, and insights about financial markets.
      The user is currently viewing the ${symbol || 'BINANCE:BTCUSDT'} chart.
      Be concise, accurate, and helpful. When discussing trading strategies, always mention risks.
      You can provide code snippets for Pine Script trading strategies when asked.`
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Get the AI response
    const aiResponse = completion.choices[0].message;
    
    // Log the interaction (not including full messages for privacy)
    logger.info(`Chat request processed for symbol: ${symbol}, tokens: ${completion.usage.total_tokens}`);
    
    return res.status(200).json({
      role: aiResponse.role,
      content: aiResponse.content,
      timestamp: new Date(),
      usage: completion.usage,
    });
  } catch (error) {
    logger.error('Error processing chat request', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Strategy generation endpoint
app.post('/api/generate-strategy', async (req, res) => {
  try {
    const { symbol, timeframe, strategyType, parameters } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Create a detailed prompt for strategy generation
    const prompt = `Generate a Pine Script trading strategy for ${symbol} on the ${timeframe || '1D'} timeframe.
    Strategy type: ${strategyType || 'trend following'}
    Additional parameters: ${JSON.stringify(parameters || {})}
    
    The code should be properly formatted, commented, and follow Pine Script best practices.
    Include risk management and position sizing.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in algorithmic trading and Pine Script. Generate only valid, working Pine Script code with no additional explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more deterministic code generation
      max_tokens: 2000,
    });

    // Extract the code from the response
    const generatedCode = completion.choices[0].message.content;
    
    logger.info(`Strategy generated for ${symbol}, type: ${strategyType}`);
    
    return res.status(200).json({
      code: generatedCode,
      symbol,
      timeframe: timeframe || '1D',
      strategyType: strategyType || 'trend following',
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error generating strategy', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Market analysis endpoint
app.post('/api/analyze-market', async (req, res) => {
  try {
    const { symbol, marketData } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Create a prompt for market analysis
    const prompt = `Analyze the current market conditions for ${symbol} based on the following data:
    ${JSON.stringify(marketData || {})}
    
    Provide a concise analysis including:
    1. Current trend identification
    2. Key support and resistance levels
    3. Relevant technical indicators (RSI, MACD, etc.)
    4. Trading volume analysis
    5. Short-term price outlook
    
    Format your response in a clear, structured manner.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert market analyst. Provide concise, data-driven analysis with actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const analysis = completion.choices[0].message.content;
    
    logger.info(`Market analysis provided for ${symbol}`);
    
    return res.status(200).json({
      analysis,
      symbol,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error analyzing market', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  logger.info(`AI Agent service running on port ${PORT}`);
  console.log(`AI Agent service running on port ${PORT}`);
}); 