import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, Settings, User, Moon, Sun, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../providers/ThemeProvider";

export default function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <div className="h-14 border-b border-tv-border bg-tv-background-primary flex items-center px-4">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <span className="text-tv-blue font-bold text-xl mr-1">Trad</span>
          <span className="text-tv-text-primary font-bold text-xl">Bot</span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center mx-4 space-x-4">
        <NavItem href="/" label="Dashboard" active />
        <NavItem href="/strategies" label="Strategies" />
        <NavItem href="/backtesting" label="Backtesting" />
        <NavItem href="/analysis" label="Analysis" />
      </div>
      
      <div className="ml-auto flex items-center space-x-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="tv-input w-40 md:w-60 h-8 pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-tv-text-secondary h-4 w-4" />
        </div>
        
        <Button variant="ghost" size="icon" className="text-tv-text-secondary">
          <Bell size={18} />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-tv-text-secondary">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        
        <Button variant="ghost" size="icon" className="text-tv-text-secondary">
          <Settings size={18} />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-tv-text-secondary">
          <User size={18} />
        </Button>
        
        <Button variant="ghost" size="icon" className="md:hidden text-tv-text-secondary">
          <Menu size={18} />
        </Button>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  active?: boolean;
}

function NavItem({ href, label, active }: NavItemProps) {
  return (
    <Link 
      to={href} 
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active ? "text-tv-text-primary bg-tv-background-secondary" : "text-tv-text-secondary hover:text-tv-text-primary"
      }`}
    >
      {label}
    </Link>
  );
} 