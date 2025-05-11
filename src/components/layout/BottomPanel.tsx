
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function BottomPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className={`tv-bottom-panel transition-all duration-300 ${
        isExpanded ? "h-64" : "h-10"
      }`}
    >
      <div 
        className="border-b border-tv-border cursor-pointer flex justify-center items-center h-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-16 h-1 bg-tv-border rounded-full" />
      </div>
      
      {isExpanded && (
        <Tabs defaultValue="orders" className="w-full h-[calc(100%-2.5rem)]">
          <TabsList className="border-b border-tv-border bg-transparent">
            <TabsTrigger className="tv-tab data-[state=active]:tv-tab-active" value="orders">Orders</TabsTrigger>
            <TabsTrigger className="tv-tab data-[state=active]:tv-tab-active" value="strategy">Strategy</TabsTrigger>
            <TabsTrigger className="tv-tab data-[state=active]:tv-tab-active" value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="p-4 h-full">
            <div className="text-tv-text-secondary">No active orders</div>
          </TabsContent>
          <TabsContent value="strategy" className="p-4 h-full">
            <div className="text-tv-text-secondary">No active strategies</div>
          </TabsContent>
          <TabsContent value="notes" className="p-4 h-full">
            <textarea 
              className="w-full h-full bg-transparent border border-tv-border rounded p-2 text-tv-text-primary"
              placeholder="Add your trading notes here..."
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
