
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Sample asset categories and symbols
const ASSET_CATEGORIES = {
  crypto: [
    { symbol: "BINANCE:BTCUSDT", name: "Bitcoin" },
    { symbol: "BINANCE:ETHUSDT", name: "Ethereum" },
    { symbol: "BINANCE:SOLUSDT", name: "Solana" },
    { symbol: "BINANCE:BNBUSDT", name: "BNB" },
    { symbol: "BINANCE:ADAUSDT", name: "Cardano" },
    { symbol: "BINANCE:DOGEUSDT", name: "Dogecoin" },
  ],
  stocks: [
    { symbol: "NASDAQ:AAPL", name: "Apple Inc." },
    { symbol: "NASDAQ:MSFT", name: "Microsoft" },
    { symbol: "NASDAQ:GOOGL", name: "Alphabet" },
    { symbol: "NASDAQ:AMZN", name: "Amazon" },
    { symbol: "NYSE:DIS", name: "Disney" },
  ],
  forex: [
    { symbol: "FX:EURUSD", name: "EUR/USD" },
    { symbol: "FX:GBPUSD", name: "GBP/USD" },
    { symbol: "FX:USDJPY", name: "USD/JPY" },
    { symbol: "FX:AUDUSD", name: "AUD/USD" },
  ],
  indices: [
    { symbol: "INDEX:SPX", name: "S&P 500" },
    { symbol: "INDEX:IXIC", name: "Nasdaq" },
    { symbol: "INDEX:DJI", name: "Dow Jones" },
    { symbol: "INDEX:NKY", name: "Nikkei 225" },
  ],
};

export default function AssetSelector() {
  const [activeCategory, setActiveCategory] = useState("crypto");
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredAssets = ASSET_CATEGORIES[activeCategory as keyof typeof ASSET_CATEGORIES].filter(
    (asset) => 
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full">
      <Tabs 
        defaultValue="crypto" 
        className="w-full" 
        onValueChange={setActiveCategory}
      >
        <TabsList className="w-full bg-tv-background-secondary grid grid-cols-4">
          <TabsTrigger 
            value="crypto" 
            className={activeCategory === "crypto" ? "tv-tab-active" : "tv-tab"}
          >
            Crypto
          </TabsTrigger>
          <TabsTrigger 
            value="stocks" 
            className={activeCategory === "stocks" ? "tv-tab-active" : "tv-tab"}
          >
            Stocks
          </TabsTrigger>
          <TabsTrigger 
            value="forex" 
            className={activeCategory === "forex" ? "tv-tab-active" : "tv-tab"}
          >
            Forex
          </TabsTrigger>
          <TabsTrigger 
            value="indices" 
            className={activeCategory === "indices" ? "tv-tab-active" : "tv-tab"}
          >
            Indices
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="p-2">
        <div className="relative">
          <Input
            className="tv-input pl-8 w-full h-8"
            placeholder={`Search ${activeCategory}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-tv-text-secondary h-4 w-4" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <div 
              key={asset.symbol} 
              className="flex items-center p-2 hover:bg-tv-hover cursor-pointer"
            >
              <div>
                <div className="text-tv-text-primary text-sm">{asset.name}</div>
                <div className="text-tv-text-secondary text-xs">{asset.symbol}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-tv-text-secondary">
            No assets found
          </div>
        )}
      </div>
    </div>
  );
}
