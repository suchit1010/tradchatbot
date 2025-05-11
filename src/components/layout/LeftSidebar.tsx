
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Watchlist from "../widgets/Watchlist";
import AssetSelector from "../widgets/AssetSelector";

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState("watchlist");
  
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="watchlist" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full bg-tv-background-secondary grid grid-cols-2">
          <TabsTrigger value="watchlist" className={activeTab === "watchlist" ? "tv-tab-active" : "tv-tab"}>
            Watchlist
          </TabsTrigger>
          <TabsTrigger value="assets" className={activeTab === "assets" ? "tv-tab-active" : "tv-tab"}>
            Assets
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto p-1">
          {activeTab === "watchlist" ? <Watchlist /> : <AssetSelector />}
        </div>
      </Tabs>
    </div>
  );
}
