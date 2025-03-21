import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { COIN_NAME, COIN_SYMBOL } from "@/lib/constants";
import { motion } from "framer-motion";

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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Medal, 
  Award, 
  Sparkles, 
  Star, 
  Users, 
  Clock, 
  Loader2, 
  ChevronUp,
  Gift,
  Zap,
  BarChart4,
  Coins
} from "lucide-react";

// Type definitions
type RewardsTier = {
  id: number;
  name: string;
  pointsRequired: number;
  tradingFeeDiscount: number | null;
  additionalBenefits: string[] | null;
  icon: string | null;
};

type User = {
  id: number;
  username: string;
  fullName: string | null;
  rewardsPoints: number | null;
  totalTradingVolume: number | null;
  referralCode: string | null;
  referredUsers?: number;
};

type RewardsEvent = {
  id: number;
  createdAt: Date | string;
  points: number;
  userId: number;
  eventType: string;
  description: string;
};

export default function RewardsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch rewards tiers
  const {
    data: rewardsTiers,
    isLoading: isLoadingTiers,
    isError: isTiersError,
  } = useQuery({
    queryKey: ["/api/rewards/tiers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/rewards/tiers");
      const data = await res.json();
      return data.tiers as RewardsTier[];
    },
  });

  // Fetch user's rewards if logged in
  const {
    data: userRewards,
    isLoading: isLoadingUserRewards,
    isError: isUserRewardsError,
  } = useQuery({
    queryKey: ["/api/rewards"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", "/api/rewards", undefined, {
        "user-id": String(user.id),
      });
      const data = await res.json();
      return {
        events: data.events as RewardsEvent[],
        currentTier: data.currentTier as RewardsTier,
        nextTier: data.nextTier as RewardsTier | null,
        pointsToNextTier: data.pointsToNextTier as number | null,
      };
    },
    enabled: !!user,
  });

  // Fetch leaderboard
  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
    isError: isLeaderboardError,
  } = useQuery({
    queryKey: ["/api/rewards/leaderboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/rewards/leaderboard");
      const data = await res.json();
      return {
        topTraders: data.topTraders as User[],
        topReferrers: data.topReferrers as User[],
      };
    },
  });

  // Get user's current tier
  const userTier = userRewards?.currentTier;
  const nextTier = userRewards?.nextTier;
  const userPoints = user?.rewardsPoints || 0;
  const pointsToNext = userRewards?.pointsToNextTier || 0;
  const progressPercentage = nextTier 
    ? ((userPoints - (userTier?.pointsRequired || 0)) / 
       (nextTier.pointsRequired - (userTier?.pointsRequired || 0)) * 100)
    : 100;

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

      {/* Hero section */}
      <section className="bg-gradient-to-b from-primary/20 to-background py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-4">Rewards Program</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Trade {COIN_SYMBOL}, earn points, unlock exclusive benefits and climb the leaderboard
            </p>
            
            {!user && (
              <Button size="lg" onClick={() => navigate("/auth")}>
                Join Now
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto p-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 mb-8 w-full max-w-md mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tiers">Tiers</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Current tier card */}
              <Card className="md:col-span-7">
                <CardHeader>
                  <CardTitle>Your Rewards Status</CardTitle>
                  <CardDescription>
                    Current tier benefits and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="text-center p-6">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Join the Rewards Program</h3>
                      <p className="text-muted-foreground mb-4">
                        Log in or create an account to start earning rewards
                      </p>
                      <Button onClick={() => navigate("/auth")}>
                        Log In / Sign Up
                      </Button>
                    </div>
                  ) : isLoadingUserRewards ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : isUserRewardsError ? (
                    <div className="text-center p-6 text-destructive">
                      Failed to load rewards data
                    </div>
                  ) : userTier ? (
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-full">
                          {userTier.name === "Bronze" ? (
                            <Medal className="h-8 w-8 text-amber-700" />
                          ) : userTier.name === "Silver" ? (
                            <Medal className="h-8 w-8 text-gray-400" />
                          ) : userTier.name === "Gold" ? (
                            <Trophy className="h-8 w-8 text-yellow-500" />
                          ) : userTier.name === "Platinum" ? (
                            <Award className="h-8 w-8 text-cyan-500" />
                          ) : (
                            <Star className="h-8 w-8 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{userTier.name} Tier</h3>
                          <p className="text-muted-foreground">
                            {userPoints.toLocaleString()} points total
                          </p>
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-3 mb-6">
                        <h4 className="font-medium">Your Benefits:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
                            <Coins className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Trading Fee Discount</p>
                              <p className="text-sm text-muted-foreground">
                                {userTier.tradingFeeDiscount}% off all trades
                              </p>
                            </div>
                          </div>
                          
                          {userTier.additionalBenefits?.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-card rounded-lg border">
                              <Gift className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{benefit.split(':')[0]}</p>
                                <p className="text-sm text-muted-foreground">
                                  {benefit.split(':')[1] || ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress to next tier */}
                      {nextTier ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress to {nextTier.name}</span>
                            <span>{pointsToNext.toLocaleString()} points needed</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Keep trading to unlock the {nextTier.name} tier and receive
                            {nextTier.tradingFeeDiscount}% trading fee discounts
                            and additional benefits.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-primary/10 rounded-lg text-center">
                          <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
                          <p className="font-medium">You've reached the highest tier!</p>
                          <p className="text-sm text-muted-foreground">
                            Enjoy all the premium benefits available
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">No rewards data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* How to earn points */}
              <Card className="md:col-span-5">
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                  <CardDescription>
                    Complete these activities to earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full mt-0.5">
                      <BarChart4 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-0.5">Trading Volume</h3>
                      <p className="text-sm text-muted-foreground">
                        Earn 1 point for every 1,000 {COIN_SYMBOL} traded
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full mt-0.5">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-0.5">Daily Logins</h3>
                      <p className="text-sm text-muted-foreground">
                        Earn 5 points for logging in each day
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full mt-0.5">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-0.5">Referrals</h3>
                      <p className="text-sm text-muted-foreground">
                        Earn 100 points for each friend who signs up and trades
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full mt-0.5">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-0.5">Special Events</h3>
                      <p className="text-sm text-muted-foreground">
                        Participate in community events for bonus points
                      </p>
                    </div>
                  </div>
                </CardContent>
                {user && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/trade")}>
                      Start Trading
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* Recent rewards activity */}
              {user && (
                <Card className="md:col-span-12">
                  <CardHeader>
                    <CardTitle>Recent Rewards Activity</CardTitle>
                    <CardDescription>
                      Your most recent point earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUserRewards ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : userRewards?.events && userRewards.events.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userRewards.events.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="font-medium">
                                {new Date(event.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{event.eventType}</TableCell>
                              <TableCell>{event.description}</TableCell>
                              <TableCell className="text-right">
                                <span className="text-green-500 font-medium">
                                  +{event.points}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No recent rewards activity</p>
                        <Button variant="link" onClick={() => navigate("/trade")}>
                          Start trading to earn rewards
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers">
            <div className="space-y-6">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2">Reward Tiers & Benefits</h2>
                <p className="text-muted-foreground">
                  Climb the tiers to unlock better trading conditions and exclusive perks
                </p>
              </div>

              {isLoadingTiers ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : isTiersError ? (
                <div className="text-center p-12 text-destructive">
                  Failed to load tiers data
                </div>
              ) : rewardsTiers && rewardsTiers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {rewardsTiers.map((tier) => (
                    <Card 
                      key={tier.id} 
                      className={`overflow-hidden ${
                        userTier?.id === tier.id ? 'border-primary ring-1 ring-primary' : ''
                      }`}
                    >
                      <div className={`
                        h-2 w-full 
                        ${tier.name === 'Bronze' ? 'bg-amber-700' : ''}
                        ${tier.name === 'Silver' ? 'bg-gray-400' : ''}
                        ${tier.name === 'Gold' ? 'bg-yellow-500' : ''}
                        ${tier.name === 'Platinum' ? 'bg-cyan-500' : ''}
                        ${tier.name === 'Diamond' ? 'bg-purple-500' : ''}
                      `}/>
                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                          {tier.name === "Bronze" ? (
                            <Medal className="h-8 w-8 text-amber-700" />
                          ) : tier.name === "Silver" ? (
                            <Medal className="h-8 w-8 text-gray-400" />
                          ) : tier.name === "Gold" ? (
                            <Trophy className="h-8 w-8 text-yellow-500" />
                          ) : tier.name === "Platinum" ? (
                            <Award className="h-8 w-8 text-cyan-500" />
                          ) : (
                            <Star className="h-8 w-8 text-purple-500" />
                          )}
                        </div>
                        <CardTitle>{tier.name}</CardTitle>
                        <CardDescription>
                          {tier.pointsRequired.toLocaleString()} points required
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center space-y-4 pt-2">
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="font-medium text-xl">{tier.tradingFeeDiscount}%</p>
                          <p className="text-sm text-muted-foreground">Trading fee discount</p>
                        </div>
                        
                        <div className="space-y-2">
                          {tier.additionalBenefits?.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 justify-center text-sm">
                              <ChevronUp className="h-4 w-4 text-green-500" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pb-4">
                        {userTier?.id === tier.id ? (
                          <Badge variant="outline" className="w-full justify-center">
                            Current Tier
                          </Badge>
                        ) : user && userPoints >= tier.pointsRequired ? (
                          <Badge className="w-full justify-center bg-green-500">
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-full justify-center text-muted-foreground">
                            {user ? `${tier.pointsRequired - userPoints} points to unlock` : "Log in to track progress"}
                          </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12">
                  <p className="text-muted-foreground">No tiers data available</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <div className="space-y-6">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2">Community Leaderboard</h2>
                <p className="text-muted-foreground">
                  The top traders and contributors in our community
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Traders */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart4 className="h-5 w-5 text-primary" />
                      <CardTitle>Top Traders</CardTitle>
                    </div>
                    <CardDescription>
                      Ranked by trading volume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLeaderboard ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : isLeaderboardError ? (
                      <div className="text-center p-6 text-destructive">
                        Failed to load leaderboard data
                      </div>
                    ) : leaderboard?.topTraders && leaderboard.topTraders.length > 0 ? (
                      <div className="space-y-2">
                        {leaderboard.topTraders.map((trader, index) => (
                          <div 
                            key={trader.id} 
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              index === 0 ? 'bg-yellow-500/10' :
                              index === 1 ? 'bg-gray-400/10' :
                              index === 2 ? 'bg-amber-700/10' : 'bg-card'
                            } ${user?.id === trader.id ? 'border border-primary' : 'border'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-7 text-center font-bold">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {trader.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{trader.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  Volume: {trader.totalTradingVolume?.toLocaleString() || 0} {COIN_SYMBOL}
                                </p>
                              </div>
                            </div>
                            {index < 3 && (
                              <Badge variant={
                                index === 0 ? 'default' : 
                                index === 1 ? 'secondary' : 
                                'outline'
                              }>
                                {index === 0 ? 'Legend' : index === 1 ? 'Expert' : 'Pro'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No leaderboard data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle>Top Referrers</CardTitle>
                    </div>
                    <CardDescription>
                      Ranked by successful referrals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLeaderboard ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : isLeaderboardError ? (
                      <div className="text-center p-6 text-destructive">
                        Failed to load leaderboard data
                      </div>
                    ) : leaderboard?.topReferrers && leaderboard.topReferrers.length > 0 ? (
                      <div className="space-y-2">
                        {leaderboard.topReferrers.map((referrer, index) => (
                          <div 
                            key={referrer.id} 
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              index === 0 ? 'bg-yellow-500/10' :
                              index === 1 ? 'bg-gray-400/10' :
                              index === 2 ? 'bg-amber-700/10' : 'bg-card'
                            } ${user?.id === referrer.id ? 'border border-primary' : 'border'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-7 text-center font-bold">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {referrer.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{referrer.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  Referrals: {referrer.referredUsers || 0} users
                                </p>
                              </div>
                            </div>
                            {index < 3 && (
                              <Badge variant={
                                index === 0 ? 'default' : 
                                index === 1 ? 'secondary' : 
                                'outline'
                              }>
                                {index === 0 ? 'Ambassador' : index === 1 ? 'Influencer' : 'Networker'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No referral data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Join call-to-action */}
              {!user && (
                <Card className="mt-8 bg-primary/5">
                  <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Want to see your name on the leaderboard?</h3>
                      <p className="text-muted-foreground mb-0">
                        Create an account to start trading and earning rewards
                      </p>
                    </div>
                    <Button size="lg" onClick={() => navigate("/auth")}>
                      Join Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}