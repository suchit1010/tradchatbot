import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TradeFormProps {
  symbol: string;
  price?: number;
}

interface OrderResponse {
  id: string;
  symbol: string;
  side: string;
  type: string;
  status: string;
  filledQuantity: number;
  averagePrice: number | null;
}

export default function TradeForm({ symbol, price = 0 }: TradeFormProps) {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState('0.01');
  const [limitPrice, setLimitPrice] = useState(price.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [timeInForce, setTimeInForce] = useState('GTC');
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [leverageEnabled, setLeverageEnabled] = useState(false);
  const [leverage, setLeverage] = useState([1]);
  const { toast } = useToast();

  // Update limit price when market price changes
  useEffect(() => {
    if (price > 0) {
      setLimitPrice(price.toString());
      // Set stop price 5% below market for buy, 5% above for sell
      const stopPriceValue = side === 'buy' 
        ? price * 0.95
        : price * 1.05;
      setStopPrice(stopPriceValue.toFixed(2));
    }
  }, [price, side]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^(\d+)?(\.\d*)?$/.test(value) || value === '') {
      setQuantity(value);
    }
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^(\d+)?(\.\d*)?$/.test(value) || value === '') {
      setLimitPrice(value);
    }
  };

  const handleStopPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^(\d+)?(\.\d*)?$/.test(value) || value === '') {
      setStopPrice(value);
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const prc = orderType === 'market' ? price : parseFloat(limitPrice) || 0;
    const total = qty * prc;
    
    if (leverageEnabled) {
      return (total / leverage[0]).toFixed(2);
    }
    
    return total.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }
    
    if ((orderType === 'limit' || orderType === 'stop_limit') && 
        (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid limit price',
        variant: 'destructive',
      });
      return;
    }
    
    if ((orderType === 'stop' || orderType === 'stop_limit') && 
        (!stopPrice || parseFloat(stopPrice) <= 0)) {
      toast({
        title: 'Invalid stop price',
        description: 'Please enter a valid stop price',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const orderData = {
        symbol,
        side,
        type: orderType,
        quantity: parseFloat(quantity),
        price: orderType === 'market' ? undefined : parseFloat(limitPrice),
        stopPrice: (orderType === 'stop' || orderType === 'stop_limit') 
          ? parseFloat(stopPrice) 
          : undefined,
        timeInForce: advancedOptions ? timeInForce : 'GTC',
        leverage: leverageEnabled ? leverage[0] : undefined
      };
      
      const response = await fetch('/api/execution/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }
      
      const result = await response.json();
      setOrderResult(result);
      
      toast({
        title: 'Order submitted',
        description: `${side.toUpperCase()} order has been placed successfully`,
        variant: 'default',
      });
      
      // Reset form after successful order
      setQuantity('0.01');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order failed',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Trade {symbol.split(':')[1]}</CardTitle>
        <CardDescription>Place an order on {symbol.split(':')[0]}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Buy/Sell Tabs */}
            <Tabs 
              value={side} 
              onValueChange={setSide} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger 
                  value="buy" 
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Buy
                </TabsTrigger>
                <TabsTrigger 
                  value="sell" 
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  Sell
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Order Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger id="orderType">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                  <SelectItem value="stop_limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="text"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Enter quantity"
                className="w-full"
              />
            </div>
            
            {/* Limit Price (for limit and stop-limit orders) */}
            {(orderType === 'limit' || orderType === 'stop_limit') && (
              <div className="space-y-2">
                <Label htmlFor="limitPrice">Limit Price</Label>
                <Input
                  id="limitPrice"
                  type="text"
                  value={limitPrice}
                  onChange={handleLimitPriceChange}
                  placeholder="Enter limit price"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Stop Price (for stop and stop-limit orders) */}
            {(orderType === 'stop' || orderType === 'stop_limit') && (
              <div className="space-y-2">
                <Label htmlFor="stopPrice">Stop Price</Label>
                <Input
                  id="stopPrice"
                  type="text"
                  value={stopPrice}
                  onChange={handleStopPriceChange}
                  placeholder="Enter stop price"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Leverage Option */}
            <div className="flex items-center space-x-2">
              <Switch
                id="leverage"
                checked={leverageEnabled}
                onCheckedChange={setLeverageEnabled}
              />
              <Label htmlFor="leverage">Use Leverage</Label>
            </div>
            
            {/* Leverage Slider */}
            {leverageEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Leverage: {leverage[0]}x</Label>
                </div>
                <Slider
                  value={leverage}
                  onValueChange={setLeverage}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Advanced Options Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="advanced"
                checked={advancedOptions}
                onCheckedChange={setAdvancedOptions}
              />
              <Label htmlFor="advanced">Advanced Options</Label>
            </div>
            
            {/* Advanced Options */}
            {advancedOptions && (
              <div className="space-y-2">
                <Label htmlFor="timeInForce">Time In Force</Label>
                <Select value={timeInForce} onValueChange={setTimeInForce}>
                  <SelectTrigger id="timeInForce">
                    <SelectValue placeholder="Select time in force" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GTC">Good Till Cancelled</SelectItem>
                    <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                    <SelectItem value="FOK">Fill or Kill</SelectItem>
                    <SelectItem value="DAY">Day Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Order Summary */}
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md space-y-2">
              <div className="text-sm font-semibold">Order Summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Market Price:</div>
                <div className="text-right">${price.toFixed(2)}</div>
                
                <div className="text-gray-500">Order Type:</div>
                <div className="text-right capitalize">{orderType}</div>
                
                <div className="text-gray-500">Quantity:</div>
                <div className="text-right">{quantity || '0'}</div>
                
                <div className="text-gray-500">Total Value:</div>
                <div className="text-right">${calculateTotal()}</div>
                
                {leverageEnabled && (
                  <>
                    <div className="text-gray-500">Leverage:</div>
                    <div className="text-right">{leverage[0]}x</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className={`w-full mt-4 ${side === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol.split(':')[1]}`}
          </Button>
        </form>
      </CardContent>
      
      {/* Show order result */}
      {orderResult && (
        <CardFooter className="block space-y-2 border-t pt-4">
          <div className="text-sm font-semibold">Order Placed</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Order ID:</div>
            <div className="text-right">{orderResult.id.substring(0, 8)}</div>
            
            <div className="text-gray-500">Status:</div>
            <div className="text-right capitalize">{orderResult.status}</div>
            
            {orderResult.filledQuantity > 0 && (
              <>
                <div className="text-gray-500">Filled:</div>
                <div className="text-right">{orderResult.filledQuantity}</div>
                
                <div className="text-gray-500">Avg. Price:</div>
                <div className="text-right">${orderResult.averagePrice?.toFixed(2) || 'N/A'}</div>
              </>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 