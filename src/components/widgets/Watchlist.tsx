
import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Sample watchlist data
const INITIAL_WATCHLIST = [
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin", price: 64245.32, change: 1.24 },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum", price: 1835.8, change: 0.75 },
  { symbol: "BINANCE:SOLUSDT", name: "Solana", price: 147.81, change: 0.63 },
  { symbol: "BINANCE:BNBUSDT", name: "BNB", price: 553.2, change: -0.32 },
  { symbol: "BINANCE:ADAUSDT", name: "Cardano", price: 0.453, change: -1.12 },
  { symbol: "BINANCE:XRPUSDT", name: "XRP", price: 0.5432, change: -0.55 },
  { symbol: "BINANCE:DOGEUSDT", name: "Dogecoin", price: 0.1737, change: 0.88 },
  { symbol: "NYSE:SPY", name: "S&P 500 ETF", price: 5606.90, change: -0.77 },
  { symbol: "NASDAQ:NDX", name: "Nasdaq 100", price: 19791.35, change: -0.88 },
];

export default function Watchlist() {
  const [watchlistItems, setWatchlistItems] = useState(INITIAL_WATCHLIST);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredItems = watchlistItems.filter(
    (item) => 
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 flex">
        <div className="relative flex-1">
          <Input
            className="tv-input pl-8 w-full h-8"
            placeholder="Search Watchlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-tv-text-secondary h-4 w-4" />
        </div>
        <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex border-y border-tv-border py-1 px-2 text-xs text-tv-text-secondary">
        <div className="flex-1">Symbol</div>
        <div className="w-20 text-right">Last</div>
        <div className="w-16 text-right">Chg%</div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div 
              key={item.symbol} 
              className="flex items-center p-2 hover:bg-tv-hover cursor-pointer"
            >
              <div className="flex-1">
                <div className="text-tv-text-primary text-sm">{item.name}</div>
                <div className="text-tv-text-secondary text-xs">{item.symbol}</div>
              </div>
              <div className="w-20 text-right text-tv-text-primary text-sm">
                {item.price.toLocaleString()}
              </div>
              <div 
                className={`w-16 text-right text-sm ${
                  item.change >= 0 ? "text-tv-green" : "text-tv-red"
                }`}
              >
                {item.change >= 0 ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />}
                {Math.abs(item.change).toFixed(2)}%
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-tv-text-secondary">
            No symbols found
          </div>
        )}
      </div>
    </div>
  );
}
