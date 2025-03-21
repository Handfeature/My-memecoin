import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { COIN_NAME, COIN_SYMBOL } from "@/lib/constants";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
  // Note: recharts doesn't actually have Candlestick components - we'll implement our own
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Loader2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart2,
  RefreshCw,
  ShoppingCart,
  DollarSign
} from "lucide-react";

// Type definitions
type TradingPair = {
  id: number;
  baseAsset: string;
  quoteAsset: string;
  pairSymbol: string;
  minTradeAmount: number;
  maxTradeAmount: number | null;
  tradingFee: number | null;
  isActive: boolean | null;
};

type MarketData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type OrderBookEntry = {
  price: number;
  amount: number;
};

type OrderBook = {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
};

// Order form validation schema
const orderSchema = z.object({
  tradingPairId: z.number().positive(),
  type: z.enum(["Market", "Limit"]),
  side: z.enum(["Buy", "Sell"]),
  price: z.number().positive().optional(),
  amount: z.number().positive(),
});

export default function TradingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [chartType, setChartType] = useState<string>("candle");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Limit");
  const [orderSide, setOrderSide] = useState<"Buy" | "Sell">("Buy");

  // Fetch trading pairs
  const {
    data: tradingPairs,
    isLoading: isLoadingPairs,
    isError: isPairsError,
  } = useQuery({
    queryKey: ["/api/trading/pairs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/trading/pairs");
      const data = await res.json();
      return data.pairs as TradingPair[];
    },
  });

  // Set initial selected pair when pairs are loaded
  useEffect(() => {
    if (tradingPairs && tradingPairs.length > 0 && !selectedPair) {
      setSelectedPair(tradingPairs[0]);
    }
  }, [tradingPairs, selectedPair]);

  // Fetch market data for selected pair and timeframe
  const {
    data: marketData,
    isLoading: isLoadingMarketData,
    isError: isMarketDataError,
    refetch: refetchMarketData,
  } = useQuery({
    queryKey: ["/api/trading/market-data", selectedPair?.pairSymbol, timeframe],
    queryFn: async () => {
      if (!selectedPair) return null;
      const res = await apiRequest(
        "GET",
        `/api/trading/market-data/${selectedPair.pairSymbol}/${timeframe}`
      );
      const data = await res.json();
      return data.data as MarketData[];
    },
    enabled: !!selectedPair,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch order book for selected pair
  const {
    data: orderBook,
    isLoading: isLoadingOrderBook,
    isError: isOrderBookError,
    refetch: refetchOrderBook,
  } = useQuery({
    queryKey: ["/api/trading/order-book", selectedPair?.pairSymbol],
    queryFn: async () => {
      if (!selectedPair) return null;
      const res = await apiRequest(
        "GET",
        `/api/trading/order-book/${selectedPair.pairSymbol}`
      );
      const data = await res.json();
      return data.orderBook as OrderBook;
    },
    enabled: !!selectedPair,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch user orders if logged in
  const {
    data: userOrders,
    isLoading: isLoadingOrders,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["/api/trading/orders"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", `/api/trading/orders?userId=${user.id}`);
      const data = await res.json();
      return data.orders;
    },
    enabled: !!user,
  });

  // Form for placing orders
  const orderForm = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      tradingPairId: selectedPair?.id || 0,
      type: orderType,
      side: orderSide,
      amount: 0,
    },
  });

  // Update form when selected pair, order type or side changes
  useEffect(() => {
    if (selectedPair) {
      orderForm.setValue("tradingPairId", selectedPair.id);
    }
    orderForm.setValue("type", orderType);
    orderForm.setValue("side", orderSide);
  }, [selectedPair, orderType, orderSide, orderForm]);

  // Place order mutation
  const placeTradeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof orderSchema>) => {
      if (!user) throw new Error("You must be logged in to trade");
      // Include user ID in the data payload instead of headers
      const res = await apiRequest("POST", "/api/trading/orders", {
        ...data,
        userId: user.id
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order placed successfully",
        description: `Your ${orderSide.toLowerCase()} order has been placed.`,
      });
      refetchOrders();
      refetchOrderBook();
      orderForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle order submission
  const onOrderSubmit = (data: z.infer<typeof orderSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place orders",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    const formattedData = { ...data };
    // If market order, remove price
    if (data.type === "Market") {
      delete formattedData.price;
    }
    
    placeTradeMutation.mutate(formattedData);
  };

  // Calculate current price from market data
  const currentPrice = marketData?.length
    ? marketData[marketData.length - 1].close
    : 0;

  // Calculate price change percentage
  const priceChange = marketData?.length && marketData.length > 1
    ? ((marketData[marketData.length - 1].close - marketData[0].close) / marketData[0].close) * 100
    : 0;

  // Format price with appropriate decimal places
  const formatPrice = (price: number) => {
    if (price < 0.0001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-foreground/60 flex items-center justify-center">
                <span className="text-background font-bold text-xs">{COIN_SYMBOL}</span>
              </div>
              <span className="font-bold text-lg hidden md:inline-block">{COIN_NAME}</span>
            </div>
            
            <div className="hidden md:flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Home</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/trade")}>Trade</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/rewards")}>Rewards</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/news")}>News</Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>
                Log In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Trading pair selector and price info */}
        <div className="lg:col-span-12 bg-card rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-4 items-center">
            <Select
              value={selectedPair?.pairSymbol || ""}
              onValueChange={(value) => {
                const pair = tradingPairs?.find((p) => p.pairSymbol === value);
                if (pair) setSelectedPair(pair);
              }}
              disabled={isLoadingPairs}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select pair" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Trading Pairs</SelectLabel>
                  {tradingPairs?.map((pair) => (
                    <SelectItem key={pair.id} value={pair.pairSymbol}>
                      {pair.pairSymbol}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {selectedPair && !isLoadingMarketData && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    ${formatPrice(currentPrice)}
                  </span>
                  <span
                    className={`text-sm ${
                      priceChange >= 0 ? "text-green-500" : "text-red-500"
                    } flex items-center`}
                  >
                    {priceChange >= 0 ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {Math.abs(priceChange).toFixed(2)}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  24h Volume: {marketData?.reduce((sum, item) => sum + item.volume, 0).toLocaleString()} {selectedPair.baseAsset}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchMarketData();
                refetchOrderBook();
                if (user) refetchOrders();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            {timeframe && (
              <div className="flex border rounded-md">
                {["1H", "1D", "1W", "1M", "ALL"].map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className="h-8 px-2"
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex border rounded-md">
              <Button
                variant={chartType === "candle" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType("candle")}
                className="h-8 px-2"
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "line" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
                className="h-8 px-2"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-8 bg-card rounded-lg p-4">
          <div className="h-[400px] w-full">
            {isLoadingMarketData ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isMarketDataError ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-destructive">Failed to load market data</p>
              </div>
            ) : marketData && marketData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "candle" ? (
                  <BarChart
                    data={marketData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis
                      dataKey="time"
                      tickFormatter={(time) => {
                        const date = new Date(time);
                        if (timeframe === "1H")
                          return date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        if (timeframe === "1D")
                          return date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        return date.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(value) => formatPrice(value)}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `$${formatPrice(Number(value))}`,
                        "",
                      ]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        if (timeframe === "1H" || timeframe === "1D")
                          return date.toLocaleString();
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Bar name="High" dataKey="high" fill="#22c55e" />
                    <Bar name="Low" dataKey="low" fill="#ef4444" />
                  </BarChart>
                ) : (
                  <LineChart
                    data={marketData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="time"
                      tickFormatter={(time) => {
                        const date = new Date(time);
                        if (timeframe === "1H")
                          return date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        if (timeframe === "1D")
                          return date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        return date.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(value) => formatPrice(value)}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `$${formatPrice(Number(value))}`,
                        "",
                      ]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        if (timeframe === "1H" || timeframe === "1D")
                          return date.toLocaleString();
                        return date.toLocaleDateString();
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Order form and book */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          {/* Order form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Place Order</CardTitle>
              <CardDescription>
                Trade {selectedPair?.baseAsset || ""} with{" "}
                {selectedPair?.quoteAsset || ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex border rounded-md mb-4">
                  <Button
                    variant={orderSide === "Buy" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderSide("Buy")}
                    className={`w-1/2 ${
                      orderSide === "Buy" ? "bg-green-600 hover:bg-green-700" : ""
                    }`}
                  >
                    Buy
                  </Button>
                  <Button
                    variant={orderSide === "Sell" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderSide("Sell")}
                    className={`w-1/2 ${
                      orderSide === "Sell" ? "bg-red-600 hover:bg-red-700" : ""
                    }`}
                  >
                    Sell
                  </Button>
                </div>

                <div className="flex border rounded-md mb-6">
                  <Button
                    variant={orderType === "Limit" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setOrderType("Limit")}
                    className="w-1/2"
                  >
                    Limit
                  </Button>
                  <Button
                    variant={orderType === "Market" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setOrderType("Market")}
                    className="w-1/2"
                  >
                    Market
                  </Button>
                </div>
              </div>

              <Form {...orderForm}>
                <form
                  onSubmit={orderForm.handleSubmit(onOrderSubmit)}
                  className="space-y-4"
                >
                  {orderType === "Limit" && (
                    <FormField
                      control={orderForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ({selectedPair?.quoteAsset})</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.00000001"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? undefined : value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={orderForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ({selectedPair?.baseAsset})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(isNaN(value) ? 0 : value);
                            }}
                          />
                        </FormControl>
                        {selectedPair && (
                          <FormDescription className="text-xs">
                            Min: {selectedPair.minTradeAmount.toLocaleString()}{" "}
                            {selectedPair.baseAsset}
                            {selectedPair.maxTradeAmount && (
                              <>
                                , Max: {selectedPair.maxTradeAmount.toLocaleString()}{" "}
                                {selectedPair.baseAsset}
                              </>
                            )}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {orderType === "Limit" && orderForm.watch("price") && orderForm.watch("amount") && (
                    <div className="flex justify-between text-sm py-2 border-t border-b">
                      <span className="text-muted-foreground">Total:</span>
                      <span>
                        {(orderForm.watch("price")! * orderForm.watch("amount")).toFixed(4)}{" "}
                        {selectedPair?.quoteAsset}
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedPair || placeTradeMutation.isPending}
                    variant={orderSide === "Buy" ? "default" : "destructive"}
                  >
                    {placeTradeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : orderSide === "Buy" ? (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy {selectedPair?.baseAsset}
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Sell {selectedPair?.baseAsset}
                      </>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => navigate("/auth")}
                      >
                        Log in
                      </Button>{" "}
                      to start trading
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Order book */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Book</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingOrderBook ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isOrderBookError ? (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-destructive">Failed to load order book</p>
                </div>
              ) : orderBook ? (
                <div className="text-sm">
                  {/* Asks (Sell orders) - sorted from highest to lowest */}
                  <div className="max-h-[200px] overflow-y-auto">
                    {orderBook.asks
                      .sort((a, b) => b.price - a.price)
                      .map((ask, i) => (
                        <div
                          key={`ask-${i}`}
                          className="flex justify-between p-1 hover:bg-muted/50 text-red-500"
                        >
                          <span>{formatPrice(ask.price)}</span>
                          <span>{ask.amount.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>

                  {/* Current price indicator */}
                  <div className="p-2 border-y bg-muted/50 flex justify-between font-medium">
                    <span>${formatPrice(currentPrice)}</span>
                    <span
                      className={
                        priceChange >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {priceChange >= 0 ? "+" : ""}
                      {priceChange.toFixed(2)}%
                    </span>
                  </div>

                  {/* Bids (Buy orders) - sorted from highest to lowest */}
                  <div className="max-h-[200px] overflow-y-auto">
                    {orderBook.bids
                      .sort((a, b) => b.price - a.price)
                      .map((bid, i) => (
                        <div
                          key={`bid-${i}`}
                          className="flex justify-between p-1 hover:bg-muted/50 text-green-500"
                        >
                          <span>{formatPrice(bid.price)}</span>
                          <span>{bid.amount.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent trades and user orders */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Market trades */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Market Trades</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Trades would be displayed here */}
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Market trades will appear here</p>
              </div>
            </CardContent>
          </Card>

          {/* User orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!user ? (
                <div className="h-40 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground mb-2">Log in to view your orders</p>
                  <Button size="sm" onClick={() => navigate("/auth")}>
                    Go to Login
                  </Button>
                </div>
              ) : isLoadingOrders ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isOrdersError ? (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-destructive">Failed to load your orders</p>
                </div>
              ) : userOrders && userOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs border-b">
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Pair</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order: any) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-2 text-left">
                            <span className={`text-xs font-medium ${
                              order.side === "Buy" ? "text-green-500" : "text-red-500"
                            }`}>
                              {order.side} {order.type}
                            </span>
                          </td>
                          <td className="p-2 text-left text-xs">
                            {tradingPairs?.find(p => p.id === order.tradingPairId)?.pairSymbol || order.tradingPairId}
                          </td>
                          <td className="p-2 text-right text-xs">
                            {order.price ? formatPrice(order.price) : "Market"}
                          </td>
                          <td className="p-2 text-right text-xs">
                            {order.amount.toLocaleString()} 
                            <span className="text-muted-foreground">
                              {order.filled ? ` (${order.filled} filled)` : ''}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "Filled" 
                                ? "bg-green-500/10 text-green-500" 
                                : order.status === "Open" 
                                ? "bg-blue-500/10 text-blue-500"
                                : order.status === "Partial"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-red-500/10 text-red-500"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-muted-foreground">You haven't placed any orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}