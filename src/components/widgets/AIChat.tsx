
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your trading assistant. I can help with market analysis, trading strategies, and more. What would you like to know about ETHUSDT?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI response (in a real app, this would call your AI service)
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };
  
  const getAIResponse = (userInput: string): string => {
    // Simple simulation of AI responses
    const userInputLower = userInput.toLowerCase();
    
    if (userInputLower.includes("rsi") || userInputLower.includes("oversold")) {
      return "Based on the current ETHUSDT chart, the RSI is at 42.3, which is neither oversold nor overbought. The asset is in a neutral territory according to this indicator.";
    } else if (userInputLower.includes("trend") || userInputLower.includes("moving average")) {
      return "ETHUSDT is currently in a downtrend on the 1-day timeframe. The price is below the 50-day moving average of $1,870. I'd recommend waiting for a confirmation of trend reversal before considering long positions.";
    } else if (userInputLower.includes("strategy") || userInputLower.includes("trade")) {
      return "For ETHUSDT, a potential strategy could be to look for entries around the $1,750 support level with a stop loss below $1,700. Set targets at the $1,900 and $2,000 resistance levels. However, be aware that the broader market sentiment is currently bearish.";
    } else if (userInputLower.includes("volume")) {
      return "The 24-hour trading volume for ETHUSDT is $3.2 billion, which is 15% higher than the 7-day average. This increased volume could indicate stronger market interest.";
    } else {
      return "I see you're looking at ETHUSDT on a 1-day timeframe. Currently, ETH is trading at $1,835.80, down 0.75% in the last 24 hours. Key support levels are at $1,750 and $1,700, with resistance at $1,900 and $2,000. Would you like specific technical analysis or strategy suggestions?";
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div 
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === "user" 
                  ? "bg-tv-blue text-white" 
                  : "bg-tv-background-primary border border-tv-border text-tv-text-primary"
              }`}
            >
              <div className="flex items-center mb-1">
                {msg.role === "assistant" ? (
                  <Sparkles className="h-4 w-4 mr-1 text-tv-purple" />
                ) : (
                  <User className="h-4 w-4 mr-1" />
                )}
                <span className="text-xs">
                  {msg.role === "assistant" ? "AI Assistant" : "You"}
                </span>
                <span className="text-xs ml-auto opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-3 bg-tv-background-primary border border-tv-border">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-1 text-tv-purple" />
                <span className="text-xs">AI Assistant</span>
              </div>
              <div className="mt-2 flex space-x-1">
                <div className="h-2 w-2 bg-tv-text-secondary rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-tv-text-secondary rounded-full animate-pulse delay-150"></div>
                <div className="h-2 w-2 bg-tv-text-secondary rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-tv-border">
        <div className="flex items-center">
          <Input
            className="tv-input flex-1"
            placeholder="Ask about current chart..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="ml-2 bg-tv-blue hover:bg-opacity-90" 
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-tv-text-secondary text-center">
          <span className="flex items-center justify-center">
            <Sparkles className="h-3 w-3 mr-1 text-tv-purple" />
            Context: ETHUSDT 1D Chart
          </span>
        </div>
      </div>
    </div>
  );
}
