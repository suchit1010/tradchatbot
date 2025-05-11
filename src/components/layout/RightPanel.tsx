
import { useState } from "react";
import AIChat from "../widgets/AIChat";

export default function RightPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-tv-border">
        <h3 className="font-semibold text-tv-text-primary">AI Assistant</h3>
      </div>
      <div className="flex-1 overflow-hidden">
        <AIChat />
      </div>
    </div>
  );
}
