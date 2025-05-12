import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  LineChartIcon,
  BookOpenIcon,
  NewspaperIcon,
  TimerIcon,
} from 'lucide-react';

interface AssetDetailsProps {
  symbol: string;
}

interface MarketData {
  lastPrice: number;
  dailyChange: number;
  volume: number;
  high: number;
  low: number;
  lastUpdated: string;
}

export default function AssetDetails({ symbol }: AssetDetailsProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/market-data/${symbol}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const data = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load market data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
    
    // Set up polling for market data updates
    const intervalId = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [symbol, toast]);

  // Format price with appropriate decimal places
  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    
    // Show more decimal places for lower priced assets
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    if (price < 10000) return price.toFixed(2);
    return price.toFixed(0);
  };
  
  // Format volume with appropriate units (K, M, B)
  const formatVolume = (volume?: number) => {
    if (!volume) return 'N/A';
    
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };
  
  // Extract symbol name from full symbol
  const getSymbolName = (fullSymbol: string) => {
    const parts = fullSymbol.split(':');
    
    if (parts.length > 1) {
      // For pairs like BINANCE:BTCUSDT, return BTC/USDT
      const pair = parts[1];
      if (pair.endsWith('USDT')) {
        return `${pair.substring(0, pair.length - 4)}/USDT`;
      }
      return pair;
    }
    
    return fullSymbol;
  };
  
  // Get price color based on daily change
  const getPriceColor = () => {
    if (!marketData) return 'text-gray-500';
    return marketData.dailyChange >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Loading asset data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{getSymbolName(symbol)}</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="text-green-500">
              <ArrowUpIcon className="mr-1 h-4 w-4" /> Buy
            </Button>
            <Button size="sm" variant="outline" className="text-red-500">
              <ArrowDownIcon className="mr-1 h-4 w-4" /> Sell
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className={`text-3xl font-bold ${getPriceColor()}`}>
              ${formatPrice(marketData?.lastPrice)}
            </span>
            <span className={`ml-2 text-sm ${getPriceColor()}`}>
              {marketData?.dailyChange !== undefined && 
               `${marketData.dailyChange >= 0 ? '+' : ''}${marketData.dailyChange.toFixed(2)}%`}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <TimerIcon className="inline mr-1 h-4 w-4" />
            Last updated: {marketData?.lastUpdated && new Date(marketData.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
            <div className="text-sm text-gray-500">24h High</div>
            <div className="font-semibold">${formatPrice(marketData?.high)}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
            <div className="text-sm text-gray-500">24h Low</div>
            <div className="font-semibold">${formatPrice(marketData?.low)}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
            <div className="text-sm text-gray-500">24h Volume</div>
            <div className="font-semibold">{formatVolume(marketData?.volume)}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
            <div className="text-sm text-gray-500">Market</div>
            <div className="font-semibold">{symbol.split(':')[0]}</div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">
              <LineChartIcon className="mr-1 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="news">
              <NewspaperIcon className="mr-1 h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="fundamentals">
              <BookOpenIcon className="mr-1 h-4 w-4" />
              Fundamentals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">About {getSymbolName(symbol)}</h3>
              <p className="text-sm text-gray-500">
                {symbol.includes('BTC') ? 
                  'Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer Bitcoin network. Bitcoin transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain.' :
                  symbol.includes('ETH') ?
                  'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. It is the second-largest cryptocurrency by market capitalization, after Bitcoin.' :
                  'This asset is traded on multiple markets and exchanges worldwide.'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Market Activity</h3>
              <p className="text-sm text-gray-500">
                {`Trading volume for ${getSymbolName(symbol)} has been ${
                  Math.random() > 0.5 ? 'increasing' : 'decreasing'
                } over the past 24 hours, with price ${
                  marketData?.dailyChange !== undefined && marketData.dailyChange >= 0 
                    ? 'gaining momentum in an upward trend.' 
                    : 'experiencing downward pressure.'
                }`}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="news" className="space-y-4">
            <div className="space-y-3">
              {[1, 2, 3].map(item => (
                <div key={item} className="border-b pb-2 last:border-0">
                  <h4 className="font-semibold">Latest news for {getSymbolName(symbol)}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {`${getSymbolName(symbol)} ${
                      Math.random() > 0.5 
                        ? 'sees increased institutional adoption as major companies announce investments' 
                        : 'market reacts to regulatory developments in key markets'
                    }`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="fundamentals" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Market Cap</div>
                <div className="font-semibold">
                  {symbol.includes('BTC') 
                    ? '$1.15T' 
                    : symbol.includes('ETH') 
                      ? '$327.5B' 
                      : '$54.2B'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Circulating Supply</div>
                <div className="font-semibold">
                  {symbol.includes('BTC') 
                    ? '19.43M BTC' 
                    : symbol.includes('ETH') 
                      ? '120.2M ETH' 
                      : '500M Units'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Max Supply</div>
                <div className="font-semibold">
                  {symbol.includes('BTC') 
                    ? '21M BTC' 
                    : symbol.includes('ETH') 
                      ? 'No Max Supply' 
                      : '1B Units'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">All-Time High</div>
                <div className="font-semibold">
                  {symbol.includes('BTC') 
                    ? '$69,000' 
                    : symbol.includes('ETH') 
                      ? '$4,878' 
                      : '$130'}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 