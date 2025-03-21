import { useState } from "react";
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
  PieChart,
  Pie,
  Cell,
  Legend
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
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Clock, 
  Loader2, 
  ChevronRight,
  Copy,
  Check,
  Wallet,
  CreditCard,
  BarChart2,
  History,
  Bell,
  Shield,
  ArrowRight,
  RefreshCw,
  QrCode
} from "lucide-react";

// Profile update form schema
const profileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  walletAddress: z.string().optional(),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, logoutMutation, isLoading: isLoadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedReferral, setCopiedReferral] = useState(false);

  // If not logged in, redirect to auth page
  if (!isLoadingAuth && !user) {
    navigate("/auth");
    return null;
  }

  // Fetch user's trading history
  const {
    data: tradingHistory,
    isLoading: isLoadingHistory,
    isError: isHistoryError
  } = useQuery({
    queryKey: ["/api/trading/trades"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", "/api/trading/trades", undefined, {
        "user-id": String(user.id),
      });
      const data = await res.json();
      return data.trades;
    },
    enabled: !!user,
  });

  // Fetch user's orders
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isOrdersError
  } = useQuery({
    queryKey: ["/api/trading/orders"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", "/api/trading/orders", undefined, {
        "user-id": String(user.id),
      });
      const data = await res.json();
      return data.orders;
    },
    enabled: !!user,
  });

  // Fetch user's rewards data
  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    isError: isRewardsError
  } = useQuery({
    queryKey: ["/api/rewards"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", "/api/rewards", undefined, {
        "user-id": String(user.id),
      });
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      walletAddress: user?.walletAddress || "",
    },
  });

  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      if (!user) throw new Error("Not authenticated");
      const res = await apiRequest("POST", `/api/auth/profile`, data, {
        "user-id": String(user.id),
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      if (!user) throw new Error("Not authenticated");
      const res = await apiRequest("POST", `/api/auth/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }, {
        "user-id": String(user.id),
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  // Copy referral code to clipboard
  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Referral code copied to clipboard",
      });
    }
  };

  // Calculate portfolio allocation data for pie chart
  const portfolioData = [
    { name: COIN_SYMBOL, value: 75 },
    { name: 'SOL', value: 15 },
    { name: 'USDC', value: 10 },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      }
    });
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
            <Button variant="ghost" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-1" />
              )}
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard layout */}
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 py-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="text-center mt-2">
                <CardTitle>{user?.username}</CardTitle>
                <CardDescription>
                  {user?.fullName || "Member"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                  <div className="font-medium">{user?.totalTradingVolume?.toLocaleString() || 0} {COIN_SYMBOL}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Rewards Points</div>
                  <div className="font-medium">{user?.rewardsPoints?.toLocaleString() || 0} pts</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Member Since</div>
                  <div className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>

                {/* Referral code */}
                {user?.referralCode && (
                  <div className="pt-2 mt-2 border-t">
                    <div className="text-sm font-medium mb-2">Referral Code</div>
                    <div className="flex">
                      <Input 
                        value={user.referralCode} 
                        readOnly 
                        className="rounded-r-none border-r-0"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-l-none border-l-0"
                        onClick={copyReferralCode}
                      >
                        {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share this code to earn 100 points per referral
                    </p>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <Button className="w-full justify-between" onClick={() => navigate("/trade")}>
                    Trade Now
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation links */}
          <Card className="mt-4">
            <CardContent className="p-0">
              <div>
                <Button 
                  variant={activeTab === "overview" ? "secondary" : "ghost"}
                  className="justify-start w-full px-4 py-6 rounded-none border-b"
                  onClick={() => setActiveTab("overview")}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Overview
                </Button>
                <Button 
                  variant={activeTab === "orders" ? "secondary" : "ghost"}
                  className="justify-start w-full px-4 py-6 rounded-none border-b"
                  onClick={() => setActiveTab("orders")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Orders & History
                </Button>
                <Button 
                  variant={activeTab === "wallet" ? "secondary" : "ghost"}
                  className="justify-start w-full px-4 py-6 rounded-none border-b"
                  onClick={() => setActiveTab("wallet")}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </Button>
                <Button 
                  variant={activeTab === "security" ? "secondary" : "ghost"}
                  className="justify-start w-full px-4 py-6 rounded-none border-b"
                  onClick={() => setActiveTab("security")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </Button>
                <Button 
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="justify-start w-full px-4 py-6 rounded-none"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-9">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Portfolio Value Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$12,456.78</div>
                    <div className="flex items-center text-sm text-green-500">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                      <span>+5.23% (24h)</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Trading Volume Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trading Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {user?.totalTradingVolume?.toLocaleString() || 0} {COIN_SYMBOL}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lifetime total
                    </div>
                  </CardContent>
                </Card>

                {/* Rewards Tier Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rewards Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingRewards ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : rewardsData?.currentTier?.name || "Bronze"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user?.rewardsPoints?.toLocaleString() || 0} points earned
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>
                    Your investment growth over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { name: 'Jan', value: 4000 },
                          { name: 'Feb', value: 3000 },
                          { name: 'Mar', value: 5000 },
                          { name: 'Apr', value: 2780 },
                          { name: 'May', value: 5890 },
                          { name: 'Jun', value: 6390 },
                          { name: 'Jul', value: 9490 },
                          { name: 'Aug', value: 11000 },
                          { name: 'Sep', value: 12500 },
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8884d8" 
                          fill="url(#colorValue)" 
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Distribution and Recent Trades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Portfolio Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Distribution</CardTitle>
                    <CardDescription>
                      Asset allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={portfolioData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {portfolioData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Trades */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Trades</CardTitle>
                    <CardDescription>
                      Your latest transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingHistory ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : isHistoryError ? (
                      <div className="text-center p-6 text-destructive">
                        Failed to load trading history
                      </div>
                    ) : tradingHistory && tradingHistory.length > 0 ? (
                      <div className="space-y-3">
                        {tradingHistory.slice(0, 5).map((trade: any) => (
                          <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className={`font-medium ${trade.side === 'Buy' ? 'text-green-500' : 'text-red-500'}`}>
                                {trade.side} {trade.amount} {COIN_SYMBOL}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(trade.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${trade.price}</div>
                              <div className="text-xs text-muted-foreground">
                                Total: ${(trade.price * trade.amount).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground mb-3">No recent trades</p>
                        <Button onClick={() => navigate("/trade")}>Start Trading</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Orders & History Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Orders</CardTitle>
                  <CardDescription>
                    Active and past orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : isOrdersError ? (
                    <div className="text-center p-6 text-destructive">
                      Failed to load orders
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Pair</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <span className={order.side === 'Buy' ? 'text-green-500' : 'text-red-500'}>
                                {order.side} {order.type}
                              </span>
                            </TableCell>
                            <TableCell>{order.tradingPairId}</TableCell>
                            <TableCell>{order.amount.toLocaleString()}</TableCell>
                            <TableCell>{order.price ? `$${order.price}` : 'Market'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'Filled' ? 'bg-green-500/10 text-green-500' : 
                                order.status === 'Open' ? 'bg-blue-500/10 text-blue-500' :
                                order.status === 'Partial' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {order.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground mb-3">No orders found</p>
                      <Button onClick={() => navigate("/trade")}>Place an Order</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>
                    Your completed trades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : isHistoryError ? (
                    <div className="text-center p-6 text-destructive">
                      Failed to load trading history
                    </div>
                  ) : tradingHistory && tradingHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Side</TableHead>
                          <TableHead>Pair</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tradingHistory.map((trade: any) => (
                          <TableRow key={trade.id}>
                            <TableCell>
                              {new Date(trade.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span className={trade.side === 'Buy' ? 'text-green-500' : 'text-red-500'}>
                                {trade.side}
                              </span>
                            </TableCell>
                            <TableCell>{trade.tradingPairId}</TableCell>
                            <TableCell>{trade.amount.toLocaleString()}</TableCell>
                            <TableCell>${trade.price}</TableCell>
                            <TableCell>${(trade.price * trade.amount).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">No trading history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Wallet</CardTitle>
                  <CardDescription>
                    Manage your crypto assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{COIN_SYMBOL}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">10,000,000</div>
                        <div className="text-sm text-muted-foreground">≈ $3,270.00</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">SOL</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">12.5</div>
                        <div className="text-sm text-muted-foreground">≈ $950.00</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">USDC</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">750.00</div>
                        <div className="text-sm text-muted-foreground">≈ $750.00</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Wallet Address</h3>
                    {user?.walletAddress ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex">
                          <Input 
                            value={user.walletAddress} 
                            readOnly 
                            className="rounded-r-none border-r-0"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-l-none border-l-0"
                            onClick={() => {
                              navigator.clipboard.writeText(user.walletAddress!);
                              toast({
                                title: "Copied to clipboard",
                                description: "Wallet address copied to clipboard",
                              });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This is your Solana wallet address for deposits and withdrawals
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-muted-foreground mb-2">No wallet address connected</p>
                        <Button onClick={() => setActiveTab("settings")}>
                          Add Wallet Address
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Deposit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Deposit Funds</DialogTitle>
                            <DialogDescription>
                              Send funds to your wallet address
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex justify-center">
                              <div className="p-2 border rounded-lg inline-block">
                                <QrCode className="h-40 w-40" />
                              </div>
                            </div>
                            {user?.walletAddress ? (
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Your Wallet Address</label>
                                <div className="flex">
                                  <Input 
                                    value={user.walletAddress} 
                                    readOnly 
                                    className="rounded-r-none border-r-0"
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="rounded-l-none border-l-0"
                                    onClick={() => {
                                      navigator.clipboard.writeText(user.walletAddress!);
                                      toast({
                                        title: "Copied to clipboard",
                                        description: "Wallet address copied to clipboard",
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Send {COIN_SYMBOL} or other Solana-based tokens to this address
                                </p>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground">
                                <p>You need to add a wallet address in settings first</p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setActiveTab("settings")}>
                              Manage Wallet
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                            Withdraw
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Withdraw Funds</DialogTitle>
                            <DialogDescription>
                              Withdraw your funds to an external wallet
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-center text-muted-foreground mb-4">
                              This feature is coming soon! Withdrawals are currently in development.
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Your deposits and withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your deposit and withdrawal history will appear here
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Your current password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : "Change Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                          {user?.twoFactorEnabled ? "Enabled" : "Not enabled"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>
                    Recent account access
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Login history not available</h3>
                  <p className="text-muted-foreground">
                    This feature is coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wallet Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Solana wallet address" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Enter your Solana wallet address for deposits and withdrawals
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Notification settings</h3>
                  <p className="text-muted-foreground mb-4">
                    Notification preferences will be available soon
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delete Account</CardTitle>
                  <CardDescription>
                    Permanently delete your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <h3 className="font-medium text-destructive mb-2">Warning: This action cannot be undone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deleting your account will remove all your data, including trading history and rewards.
                      Any funds in your account should be withdrawn first.
                    </p>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Textarea 
                            placeholder="Please tell us why you're leaving (optional)"
                            className="min-h-[100px]"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button variant="destructive">
                            Delete Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}