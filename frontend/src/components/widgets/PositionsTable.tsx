import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { XIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  lastUpdated: string;
}

interface Order {
  id: string;
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  price: number | null;
  status: string;
  filledQuantity: number;
  averagePrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function PositionsTable() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState({
    positions: true,
    orders: true,
    history: true
  });
  const [activeTab, setActiveTab] = useState<string>('positions');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(prev => ({ ...prev, positions: true }));
        const response = await fetch('/api/execution/positions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch positions');
        }
        
        const data = await response.json();
        setPositions(data);
      } catch (error) {
        console.error('Error fetching positions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load positions. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(prev => ({ ...prev, positions: false }));
      }
    };
    
    const fetchOrders = async () => {
      try {
        setLoading(prev => ({ ...prev, orders: true }));
        const response = await fetch('/api/execution/orders');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    
    const fetchOrderHistory = async () => {
      try {
        setLoading(prev => ({ ...prev, history: true }));
        const response = await fetch('/api/execution/order-history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }
        
        const data = await response.json();
        setOrderHistory(data);
      } catch (error) {
        console.error('Error fetching order history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order history. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(prev => ({ ...prev, history: false }));
      }
    };
    
    fetchPositions();
    fetchOrders();
    fetchOrderHistory();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(() => {
      if (activeTab === 'positions') fetchPositions();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'history') fetchOrderHistory();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [activeTab, toast]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/execution/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      
      // Update orders list
      setOrders(orders.filter(order => order.id !== orderId));
      
      // Refresh order history
      const historyResponse = await fetch('/api/execution/order-history');
      if (historyResponse.ok) {
        const data = await historyResponse.json();
        setOrderHistory(data);
      }
      
      toast({
        title: 'Order canceled',
        description: 'Order has been successfully canceled',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined) return 'Market';
    
    // Show more decimal places for lower priced assets
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    if (price < 10000) return price.toFixed(2);
    return price.toFixed(0);
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filled':
        return 'bg-green-500 hover:bg-green-600';
      case 'partially_filled':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'canceled':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-slate-500 hover:bg-slate-600';
    }
  };
  
  const getSideColor = (side: string) => {
    return side.toLowerCase() === 'buy' ? 'text-green-500' : 'text-red-500';
  };

  const renderPositionsTable = () => {
    if (loading.positions) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }
    
    if (positions.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          No open positions found. Start trading to see your positions here.
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Avg. Price</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Unrealized P/L</TableHead>
            <TableHead>Realized P/L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.symbol}>
              <TableCell className="font-medium">{position.symbol}</TableCell>
              <TableCell>{position.quantity}</TableCell>
              <TableCell>${formatPrice(position.averagePrice)}</TableCell>
              <TableCell>${(position.quantity * position.averagePrice).toFixed(2)}</TableCell>
              <TableCell className={position.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                ${position.unrealizedPnl.toFixed(2)}
              </TableCell>
              <TableCell className={position.realizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                ${position.realizedPnl.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  const renderOrdersTable = () => {
    if (loading.orders) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }
    
    if (orders.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          No active orders. Place a trade to see your orders here.
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.symbol}</TableCell>
              <TableCell className="capitalize">{order.type}</TableCell>
              <TableCell className={getSideColor(order.side)}>{order.side.toUpperCase()}</TableCell>
              <TableCell>${formatPrice(order.price)}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>
                <Badge variant="default" className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'N/A'}
              </TableCell>
              <TableCell>
                {order.status !== 'filled' && order.status !== 'canceled' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCancelOrder(order.id)}
                    className="p-1 h-7 w-7"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  const renderOrderHistoryTable = () => {
    if (loading.history) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }
    
    if (orderHistory.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          No order history found. Start trading to see your history here.
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Filled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderHistory.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.symbol}</TableCell>
              <TableCell className="capitalize">{order.type}</TableCell>
              <TableCell className={getSideColor(order.side)}>{order.side.toUpperCase()}</TableCell>
              <TableCell>
                {order.averagePrice ? `$${formatPrice(order.averagePrice)}` : `$${formatPrice(order.price)}`}
              </TableCell>
              <TableCell>{order.filledQuantity} / {order.quantity}</TableCell>
              <TableCell>
                <Badge variant="default" className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Positions & Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="positions">
              Positions
            </TabsTrigger>
            <TabsTrigger value="orders">
              Active Orders
            </TabsTrigger>
            <TabsTrigger value="history">
              Order History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="positions" className="m-0">
            <div className="overflow-x-auto">
              {renderPositionsTable()}
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="m-0">
            <div className="overflow-x-auto">
              {renderOrdersTable()}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="m-0">
            <div className="overflow-x-auto">
              {renderOrderHistoryTable()}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 