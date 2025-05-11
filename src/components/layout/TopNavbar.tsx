
import { Search, ChevronDown, BarChart2, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "../providers/ThemeProvider";

export default function TopNavbar() {
  const { theme, toggleTheme } = useTheme();
  
  const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W", "1M"];
  
  return (
    <div className="tv-navbar flex items-center h-14 px-4 shrink-0">
      <div className="flex items-center space-x-4">
        <div className="font-bold text-tv-text-primary text-lg">
          TradingView Lens
        </div>
        
        <div className="relative">
          <Input
            className="tv-input pl-8 w-64 h-8"
            placeholder="Search Symbol..."
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-tv-text-secondary h-4 w-4" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-8">
        {timeframes.map((tf) => (
          <Button
            key={tf}
            variant="ghost"
            className="h-8 px-2 text-tv-text-secondary hover:text-tv-text-primary hover:bg-tv-hover"
          >
            {tf}
          </Button>
        ))}
      </div>
      
      <div className="ml-auto flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8">
              <BarChart2 className="mr-1 h-4 w-4" />
              Indicators
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="tv-dropdown">
            <DropdownMenuItem className="tv-dropdown-item">Moving Average</DropdownMenuItem>
            <DropdownMenuItem className="tv-dropdown-item">RSI</DropdownMenuItem>
            <DropdownMenuItem className="tv-dropdown-item">MACD</DropdownMenuItem>
            <DropdownMenuItem className="tv-dropdown-item">Bollinger Bands</DropdownMenuItem>
            <DropdownMenuItem className="tv-dropdown-item">Volume</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" className="h-8">
          <Settings className="mr-1 h-4 w-4" />
          Settings
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
