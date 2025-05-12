import { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import TradingViewChart from "../components/widgets/TradingViewChart";
import AIChat from "../components/widgets/AIChat";
import Watchlist from "../components/widgets/Watchlist";
import AssetSelector from "../components/widgets/AssetSelector";
import AssetDetails from "../components/widgets/AssetDetails";
import TradeForm from "../components/widgets/TradeForm";
import PositionsTable from "../components/widgets/PositionsTable";

interface MarketData {
  lastPrice: number;
  dailyChange: number;
  volume: number;
  high: number;
  low: number;
  lastUpdated: string;
}

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [viewMode, setViewMode] = useState<'trading' | 'positions'>('trading');

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`/api/market-data/${selectedSymbol}`);
        
        if (response.ok) {
          const data = await response.json();
          setMarketData(data);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };
    
    fetchMarketData();
    
    // Refresh market data every 15 seconds
    const intervalId = setInterval(fetchMarketData, 15000);
    
    return () => clearInterval(intervalId);
  }, [selectedSymbol]);

  const handleViewModeChange = (mode: 'trading' | 'positions') => {
    setViewMode(mode);
  };

  return (
    <MainLayout 
      leftPanelContent={<AssetSelector onSelectSymbol={setSelectedSymbol} />}
      rightPanelContent={<AIChat symbol={selectedSymbol} />}
      bottomPanelContent={<Watchlist onSelectSymbol={setSelectedSymbol} />}
    >
      <div className="h-full w-full flex flex-col">
        {/* Top section with chart */}
        <div className="flex-1 min-h-0 mb-4">
          <TradingViewChart symbol={selectedSymbol} interval="1D" />
        </div>
        
        {/* Bottom section with tabs for trading and positions */}
        <div className="flex flex-col md:flex-row gap-4 h-[500px]">
          {/* Left side - Asset details */}
          <div className="w-full md:w-1/3">
            <AssetDetails symbol={selectedSymbol} />
          </div>
          
          {/* Middle - Trade or Positions */}
          <div className="w-full md:w-1/3">
            {viewMode === 'trading' ? (
              <TradeForm 
                symbol={selectedSymbol}
                price={marketData?.lastPrice || 0}
              />
            ) : (
              <PositionsTable />
            )}
            
            {/* Toggle buttons for view mode */}
            <div className="flex mt-4 justify-center">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`rounded-l-lg px-4 py-2 text-sm font-medium ${
                    viewMode === 'trading' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-200`}
                  onClick={() => handleViewModeChange('trading')}
                >
                  Trading
                </button>
                <button
                  type="button"
                  className={`rounded-r-lg px-4 py-2 text-sm font-medium ${
                    viewMode === 'positions' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-200`}
                  onClick={() => handleViewModeChange('positions')}
                >
                  Positions
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side - AI Assistant */}
          <div className="w-full md:w-1/3">
            <div className="h-full overflow-hidden">
              <AIChat symbol={selectedSymbol} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 