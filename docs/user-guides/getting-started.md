# Getting Started with TradBot

This guide will help you set up and run the TradBot trading platform on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher) or **bun**
- **Docker** and **Docker Compose** (for running the full stack)
- **Git** (for version control)

## Clone the Repository

```bash
# Clone the repository
git clone https://github.com/suchit1010/tradbot.git

# Navigate to the project directory
cd tradbot
```

## Setup Options

You have two options for running TradBot:

### Option 1: Run Frontend Only (Quickest)

If you want to quickly see the UI without setting up the backend services, you can run just the frontend:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000 with mock data.

### Option 2: Run the Full Stack (Recommended)

For the complete experience with all features, run the full stack using Docker Compose:

```bash
# Create a copy of the example .env file
cp .env.example .env

# Edit the .env file to add your OpenAI API key
# OPENAI_API_KEY=your_key_here

# Start all services with Docker Compose
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000

## Development Setup

If you want to develop and run the services individually:

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### API Gateway Development

```bash
cd services/api-gateway
npm install
npm run dev
```

### AI Agent Service Development

```bash
cd services/ai-agent
npm install
npm run dev
```

### Strategy Service Development

```bash
cd services/strategy
npm install
npm run dev
```

## Project Structure

```
tradbot/
├── frontend/                 # React frontend application
├── services/                 # Backend microservices
│   ├── api-gateway/          # API Gateway service
│   ├── ai-agent/             # AI Agent service
│   ├── strategy/             # Strategy service
│   ├── execution/            # Execution service
│   └── market-data/          # Market Data service
├── docs/                     # Documentation
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project overview
```

## Available API Endpoints

### API Gateway (http://localhost:8000)

- **GET /health** - Health check endpoint
- **WebSocket /ws** - WebSocket connection for real-time updates

### AI Agent Service (proxied through API Gateway)

- **POST /api/ai/chat** - Chat with AI assistant
- **POST /api/ai/generate-strategy** - Generate trading strategy code
- **POST /api/ai/analyze-market** - Analyze market conditions

### Strategy Service (proxied through API Gateway)

- **GET /api/strategy/strategies** - Get all strategies
- **POST /api/strategy/strategies** - Create a new strategy
- **GET /api/strategy/strategies/:id** - Get strategy by ID
- **PUT /api/strategy/strategies/:id** - Update strategy
- **DELETE /api/strategy/strategies/:id** - Delete strategy
- **POST /api/strategy/backtest** - Run backtest on a strategy

## Next Steps

- Check out the [System Architecture](../architecture/system-architecture.md) to understand how the system works
- Review the component documentation in the `/docs` directory
- Try creating and backtesting a simple trading strategy
- Customize the UI by modifying the frontend code

## Troubleshooting

### Common Issues

1. **Connection refused to backend services**
   - Ensure Docker is running
   - Check that all services are up with `docker-compose ps`

2. **OpenAI API errors**
   - Verify your API key is correct in `.env`
   - Check rate limits on your OpenAI account

3. **Frontend not connecting to backend**
   - Ensure API Gateway is running
   - Check proxy settings in `frontend/vite.config.ts`

### Getting Help

If you encounter any issues not covered in this guide, please:
1. Check the [Issues](https://github.com/your-username/tradbot/issues) section
2. Create a new issue with detailed information about the problem 