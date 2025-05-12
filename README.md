# TradBot - Trading Assistant Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-06B6D4?logo=tailwindcss)

A modern trading analysis platform with AI-powered assistant capabilities. This application offers real-time charts, market data, and personalized trading insights all in one place.

![TradBot Screenshot](https://via.placeholder.com/800x450.png?text=TradBot+Trading+Platform)

## 🚀 Features

- **Interactive TradingView Charts**: Real-time market data visualization using the TradingView widget
- **AI-powered Trading Assistant**: Get instant answers to your trading questions with contextual awareness
- **Customizable Watchlist**: Track your favorite assets across crypto, stocks, forex, and indices
- **Asset Selector**: Easily browse and switch between different financial instruments
- **Responsive Layout**: Collapsible panels and sidebars for optimized screen real estate
- **Dark Mode Support**: Easy on the eyes during those late-night trading sessions

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v6
- **State Management**: React Query for async state management
- **Charts**: TradingView Widget Integration

## 📊 Components Overview

### Widgets
- **TradingViewChart**: Interactive price chart with technical indicators
- **AIChat**: Trading assistant that provides market insights and answers questions
- **Watchlist**: Display and track assets with real-time price changes
- **AssetSelector**: Browse and select trading instruments by category

### Layout
- **MainLayout**: Responsive application layout with collapsible panels
- **TopNavbar**: Application header with navigation controls
- **LeftSidebar**: Contains asset selector and other navigation elements
- **RightPanel**: Houses the AI chat assistant
- **BottomPanel**: Additional trading controls and information

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tradbot.git

# Navigate to the project directory
cd tradbot

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun run dev
```

The application will be available at http://localhost:5173

## 🏗️ Building for Production

```bash
# Create optimized production build
npm run build
# or
bun run build

# Preview production build locally
npm run preview
# or
bun run preview
```

## 🧩 Project Structure

```
src/
├── components/         # UI components
│   ├── layout/         # Layout components
│   ├── providers/      # Context providers
│   ├── ui/             # shadcn/ui components
│   └── widgets/        # Trading-specific widgets
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
