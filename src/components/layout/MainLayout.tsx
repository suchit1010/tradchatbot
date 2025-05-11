
import { useState } from "react";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel";
import TopNavbar from "./TopNavbar";
import BottomPanel from "./BottomPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-tv-background-primary">
      <TopNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar with Toggle */}
        {!isMobile && (
          <>
            <div 
              className={`tv-sidebar transition-all duration-300 ${
                leftSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
              }`}
            >
              {leftSidebarOpen && <LeftSidebar />}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-tv-background-secondary border border-tv-border rounded-r-md border-l-0"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            >
              {leftSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>
          </>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
        
        {/* Right Panel with Toggle */}
        {!isMobile && (
          <>
            <div
              className={`tv-panel transition-all duration-300 ${
                rightPanelOpen ? "w-80" : "w-0 opacity-0 overflow-hidden"
              }`}
            >
              {rightPanelOpen && <RightPanel />}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-tv-background-secondary border border-tv-border rounded-l-md border-r-0"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
            >
              {rightPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </>
        )}
      </div>
      
      <BottomPanel />
    </div>
  );
}
