import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import TradingViewChart from "../components/widgets/TradingViewChart";
import AIChat from "../components/widgets/AIChat";
import Watchlist from "../components/widgets/Watchlist";
import AssetSelector from "../components/widgets/AssetSelector";

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");

  return (
    <MainLayout 
      leftPanelContent={<AssetSelector onSelectSymbol={setSelectedSymbol} />}
      rightPanelContent={<AIChat symbol={selectedSymbol} />}
      bottomPanelContent={<Watchlist onSelectSymbol={setSelectedSymbol} />}
    >
      <div className="h-full w-full flex flex-col">
        <div className="flex-1 min-h-0">
          <TradingViewChart symbol={selectedSymbol} interval="1D" />
        </div>
      </div>
    </MainLayout>
  );
} 