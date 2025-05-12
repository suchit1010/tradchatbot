import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Info } from "lucide-react";
import { Button } from "../ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  symbol?: string;
}

export default function AIChat({ symbol = "BINANCE:BTCUSDT" }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your trading assistant. I can help with market analysis, trading strategies, and more. What would you like to know about ${symbol}?`,
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

  // Update welcome message when symbol changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([
        {
          role: "assistant",
          content: `Hello! I'm your trading assistant. I can help with market analysis, trading strategies, and more. What would you like to know about ${symbol}?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [symbol, messages]);
  
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
    
    // In a real implementation, this would call your AI service backend
    // For now, we'll simulate a response
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: getAIResponse(input, symbol),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };
  
  const getAIResponse = (userInput: string, symbol: string): string => {
    // Simple simulation of AI responses based on input keywords
    const userInputLower = userInput.toLowerCase();
    const assetName = symbol.split(":")[1]?.replace("USDT", "") || "Bitcoin";
    
    if (userInputLower.includes("rsi") || userInputLower.includes("oversold")) {
      return `Based on the current ${symbol} chart, the RSI is at 42.3, which is neither oversold nor overbought. The asset is in a neutral territory according to this indicator.`;
    } else if (userInputLower.includes("trend") || userInputLower.includes("moving average")) {
      return `${symbol} is currently in a downtrend on the 1-day timeframe. The price is below the 50-day moving average. I'd recommend waiting for a confirmation of trend reversal before considering long positions.`;
    } else if (userInputLower.includes("strategy") || userInputLower.includes("trade")) {
      return `For ${symbol}, a potential strategy could be to look for entries near support levels with a stop loss below the recent low. Set targets at the next resistance levels. However, be aware of the current market volatility.`;
    } else if (userInputLower.includes("volume")) {
      return `The 24-hour trading volume for ${symbol} is significantly higher than the 7-day average. This increased volume could indicate stronger market interest.`;
    } else if (userInputLower.includes("generate") || userInputLower.includes("code") || userInputLower.includes("script")) {
      return `Here's a simple Pine Script for a basic moving average crossover strategy for ${symbol}:\n\n\`\`\`pine\n//@version=5\nstrategy("MA Crossover", overlay=true)\n\nfastLength = input(9, "Fast MA Length")\nslowLength = input(21, "Slow MA Length")\n\nfastMA = ta.sma(close, fastLength)\nslowMA = ta.sma(close, slowLength)\n\nplotMA1 = plot(fastMA, "Fast MA", color.blue)\nplotMA2 = plot(slowMA, "Slow MA", color.red)\n\nif (ta.crossover(fastMA, slowMA))\n    strategy.entry("Long", strategy.long)\n\nif (ta.crossunder(fastMA, slowMA))\n    strategy.entry("Short", strategy.short)\n\`\`\``;
    } else {
      return `I see you're looking at ${symbol}. To provide better assistance, I can help with technical analysis, trading strategies, risk management, or generate Pine Script code. Just let me know what specific aspect you're interested in!`;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-tv-background-secondary p-2 border-b border-tv-border flex items-center">
        <Sparkles className="h-4 w-4 mr-2 text-tv-purple" />
        <span className="text-sm font-medium text-tv-text-primary">AI Trading Assistant</span>
        <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
          <Info className="h-4 w-4 text-tv-text-secondary" />
        </Button>
      </div>
      
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
                  : "bg-tv-background-secondary border border-tv-border text-tv-text-primary"
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
            <div className="max-w-[85%] rounded-lg p-3 bg-tv-background-secondary border border-tv-border">
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
          <input
            className="tv-input flex-1"
            placeholder="Ask about trading, strategies, analysis..."
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
            Analyzing: {symbol}
          </span>
        </div>
      </div>
    </div>
  );
} 