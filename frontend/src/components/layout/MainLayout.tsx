import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import TopNavbar from "./TopNavbar";

interface MainLayoutProps {
  children: React.ReactNode;
  leftPanelContent?: React.ReactNode;
  rightPanelContent?: React.ReactNode;
  bottomPanelContent?: React.ReactNode;
}

export default function MainLayout({
  children,
  leftPanelContent,
  rightPanelContent,
  bottomPanelContent,
}: MainLayoutProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-tv-background-primary">
      <TopNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar with Toggle */}
        <div 
          className={`tv-sidebar transition-all duration-300 border-r ${
            leftSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          {leftSidebarOpen && leftPanelContent}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-tv-background-secondary border border-tv-border rounded-r-md border-l-0"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        >
          {leftSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {/* Right Panel with Toggle */}
        <div
          className={`tv-panel transition-all duration-300 border-l ${
            rightPanelOpen ? "w-80" : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          {rightPanelOpen && rightPanelContent}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-tv-background-secondary border border-tv-border rounded-l-md border-r-0"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          {rightPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      {/* Bottom Panel with Toggle */}
      <div
        className={`tv-panel transition-all duration-300 border-t ${
          bottomPanelOpen ? "h-60" : "h-0 opacity-0 overflow-hidden"
        }`}
      >
        {bottomPanelOpen && bottomPanelContent}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-60 left-1/2 transform -translate-x-1/2 z-10 bg-tv-background-secondary border border-tv-border rounded-t-md border-b-0"
        onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
      >
        {bottomPanelOpen ? <ChevronLeft className="rotate-90" size={16} /> : <ChevronRight className="rotate-90" size={16} />}
      </Button>
    </div>
  );
} 