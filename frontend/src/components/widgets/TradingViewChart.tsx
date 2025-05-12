import { useEffect, useRef, useState } from "react";

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: "light" | "dark";
  autosize?: boolean;
}

export default function TradingViewChart({
  symbol = "BINANCE:BTCUSDT",
  interval = "D",
  theme = "dark",
  autosize = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    // Create script element for TradingView Widget
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && containerRef.current) {
        new window.TradingView.widget({
          autosize,
          symbol,
          interval,
          timezone: "Etc/UTC",
          theme,
          style: "1",
          locale: "en",
          toolbar_bg: theme === "dark" ? "#131722" : "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current.id,
          disabled_features: ["use_localstorage_for_settings"],
          enabled_features: ["study_templates"],
          studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
        });
        setChartLoaded(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, interval, theme, autosize]);

  return (
    <div className="w-full h-full bg-tv-background-primary relative">
      <div 
        id="tradingview_widget_container" 
        ref={containerRef} 
        className="w-full h-full"
      />
      {!chartLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-tv-background-primary">
          <div className="text-tv-text-secondary animate-pulse-slow">Loading chart...</div>
        </div>
      )}
    </div>
  );
}

// Add TradingView types
declare global {
  interface Window {
    TradingView: {
      widget: new (config: any) => any;
    };
  }
} 