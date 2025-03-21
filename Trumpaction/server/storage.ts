import { 
  users, type User, type InsertUser, 
  subscribers, type Subscriber, type InsertSubscriber,
  tradingPairs, type TradingPair, type InsertTradingPair,
  orders, type Order, type InsertOrder,
  trades, type Trade, type InsertTrade,
  rewardsEvents, type RewardsEvent, type InsertRewardsEvent,
  rewardsTiers, type RewardsTier, type InsertRewardsTier,
  newsArticles, type NewsArticle, type InsertNewsArticle
} from "@shared/schema";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersByTradeVolume(limit: number): Promise<User[]>;
  getUsersByRewardsPoints(limit: number): Promise<User[]>;
  verifyUser(verificationToken: string): Promise<User | undefined>;
  resetPassword(resetToken: string, newPassword: string): Promise<boolean>;
  generateResetToken(email: string): Promise<string | undefined>;
  
  // Trading pair methods
  getTradingPair(id: number): Promise<TradingPair | undefined>;
  getTradingPairBySymbol(symbol: string): Promise<TradingPair | undefined>;
  getAllTradingPairs(activeOnly?: boolean): Promise<TradingPair[]>;
  createTradingPair(tradingPair: InsertTradingPair): Promise<TradingPair>;
  updateTradingPair(id: number, data: Partial<TradingPair>): Promise<TradingPair | undefined>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrdersByTradingPair(pairId: number, status?: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;
  
  // Trade methods
  getTrade(id: number): Promise<Trade | undefined>;
  getUserTrades(userId: number): Promise<Trade[]>;
  getTradesByTradingPair(pairId: number): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  
  // Rewards methods
  getRewardsEvent(id: number): Promise<RewardsEvent | undefined>;
  getUserRewardsEvents(userId: number): Promise<RewardsEvent[]>;
  createRewardsEvent(event: InsertRewardsEvent): Promise<RewardsEvent>;
  getUserRewardsTier(userId: number): Promise<RewardsTier | undefined>;
  getAllRewardsTiers(): Promise<RewardsTier[]>;
  createRewardsTier(tier: InsertRewardsTier): Promise<RewardsTier>;
  
  // News methods
  getNewsArticle(id: number): Promise<NewsArticle | undefined>;
  getPublishedNewsArticles(limit?: number): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: number, data: Partial<NewsArticle>): Promise<NewsArticle | undefined>;
  
  // Subscriber methods
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;
  unsubscribe(email: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tradingPairs: Map<number, TradingPair>;
  private orders: Map<number, Order>;
  private trades: Map<number, Trade>;
  private rewardsEvents: Map<number, RewardsEvent>;
  private rewardsTiers: Map<number, RewardsTier>;
  private newsArticles: Map<number, NewsArticle>;
  private subscribers: Map<number, Subscriber>;

  private userCurrentId: number;
  private tradingPairCurrentId: number;
  private orderCurrentId: number;
  private tradeCurrentId: number;
  private rewardsEventCurrentId: number;
  private rewardsTierCurrentId: number;
  private newsArticleCurrentId: number;
  private subscriberCurrentId: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.tradingPairs = new Map();
    this.orders = new Map();
    this.trades = new Map();
    this.rewardsEvents = new Map();
    this.rewardsTiers = new Map();
    this.newsArticles = new Map();
    this.subscribers = new Map();

    // Initialize IDs
    this.userCurrentId = 1;
    this.tradingPairCurrentId = 1;
    this.orderCurrentId = 1;
    this.tradeCurrentId = 1;
    this.rewardsEventCurrentId = 1;
    this.rewardsTierCurrentId = 1;
    this.newsArticleCurrentId = 1;
    this.subscriberCurrentId = 1;

    // Initialize with some default trading pairs
    this.createTradingPair({
      baseAsset: "T&E",
      quoteAsset: "SOL",
      pairSymbol: "T&E/SOL",
      minTradeAmount: 100,
      maxTradeAmount: 1000000,
      tradingFee: 0.001,
      isActive: true
    });

    this.createTradingPair({
      baseAsset: "T&E",
      quoteAsset: "USDC",
      pairSymbol: "T&E/USDC",
      minTradeAmount: 100,
      maxTradeAmount: 1000000,
      tradingFee: 0.001,
      isActive: true
    });

    this.createTradingPair({
      baseAsset: "T&E",
      quoteAsset: "BTC",
      pairSymbol: "T&E/BTC",
      minTradeAmount: 100,
      maxTradeAmount: 1000000,
      tradingFee: 0.001,
      isActive: true
    });

    // Initialize reward tiers
    this.createRewardsTier({
      name: "Bronze",
      pointsRequired: 0,
      tradingFeeDiscount: 0,
      additionalBenefits: ["Access to basic features"],
      icon: "🥉"
    });

    this.createRewardsTier({
      name: "Silver",
      pointsRequired: 1000,
      tradingFeeDiscount: 0.1,
      additionalBenefits: ["10% trading fee discount", "Priority support"],
      icon: "🥈"
    });

    this.createRewardsTier({
      name: "Gold",
      pointsRequired: 5000,
      tradingFeeDiscount: 0.2,
      additionalBenefits: ["20% trading fee discount", "Priority support", "Early access to new features"],
      icon: "🥇"
    });

    this.createRewardsTier({
      name: "Platinum",
      pointsRequired: 10000,
      tradingFeeDiscount: 0.3,
      additionalBenefits: ["30% trading fee discount", "VIP support", "Early access to new features", "Exclusive airdrops"],
      icon: "💎"
    });
  }

  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    // Generate a referral code based on username
    const referralCode = `${insertUser.username.slice(0, 5).toUpperCase()}${id}`;
    
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now,
      twoFactorEnabled: false,
      isVerified: false,
      totalTradingVolume: 0,
      rewardsPoints: 0,
      referralCode
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByTradeVolume(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.totalTradingVolume - a.totalTradingVolume)
      .slice(0, limit);
  }

  async getUsersByRewardsPoints(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.rewardsPoints - a.rewardsPoints)
      .slice(0, limit);
  }

  async verifyUser(verificationToken: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (user) => user.verificationToken === verificationToken
    );
    
    if (user) {
      const updatedUser = { 
        ...user, 
        isVerified: true, 
        verificationToken: undefined,
        updatedAt: new Date()
      };
      this.users.set(user.id, updatedUser);
      return updatedUser;
    }
    
    return undefined;
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
    const user = Array.from(this.users.values()).find(
      (user) => user.resetPasswordToken === resetToken && 
        user.resetPasswordExpires && 
        user.resetPasswordExpires > new Date()
    );
    
    if (user) {
      const updatedUser = { 
        ...user, 
        password: newPassword, 
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
        updatedAt: new Date()
      };
      this.users.set(user.id, updatedUser);
      return true;
    }
    
    return false;
  }

  async generateResetToken(email: string): Promise<string | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    
    // Generate random token
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    // Token expires in 1 hour
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);
    
    const updatedUser = { 
      ...user,
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
      updatedAt: new Date()
    };
    
    this.users.set(user.id, updatedUser);
    return resetToken;
  }

  // TRADING PAIR METHODS
  async getTradingPair(id: number): Promise<TradingPair | undefined> {
    return this.tradingPairs.get(id);
  }

  async getTradingPairBySymbol(symbol: string): Promise<TradingPair | undefined> {
    return Array.from(this.tradingPairs.values()).find(
      (pair) => pair.pairSymbol === symbol
    );
  }

  async getAllTradingPairs(activeOnly = true): Promise<TradingPair[]> {
    const pairs = Array.from(this.tradingPairs.values());
    return activeOnly ? pairs.filter(pair => pair.isActive) : pairs;
  }

  async createTradingPair(tradingPair: InsertTradingPair): Promise<TradingPair> {
    const id = this.tradingPairCurrentId++;
    const pair: TradingPair = { ...tradingPair, id };
    this.tradingPairs.set(id, pair);
    return pair;
  }

  async updateTradingPair(id: number, data: Partial<TradingPair>): Promise<TradingPair | undefined> {
    const pair = await this.getTradingPair(id);
    if (!pair) return undefined;

    const updatedPair = { ...pair, ...data };
    this.tradingPairs.set(id, updatedPair);
    return updatedPair;
  }

  // ORDER METHODS
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getOrdersByTradingPair(pairId: number, status?: string): Promise<Order[]> {
    let orders = Array.from(this.orders.values()).filter(
      (order) => order.tradingPairId === pairId
    );
    
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    
    return orders;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const now = new Date();
    
    const newOrder: Order = {
      ...order,
      id,
      filled: 0,
      status: order.type === "Market" ? "Filled" : "Open", // Market orders are filled immediately in this mock
      createdAt: now,
      updatedAt: now
    };
    
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, ...data, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // TRADE METHODS
  async getTrade(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async getUserTrades(userId: number): Promise<Trade[]> {
    // Get all of the user's orders
    const userOrders = await this.getUserOrders(userId);
    const userOrderIds = userOrders.map(order => order.id);
    
    // Find trades where the user was either buyer or seller
    return Array.from(this.trades.values()).filter(
      (trade) => userOrderIds.includes(trade.buyOrderId) || userOrderIds.includes(trade.sellOrderId)
    );
  }

  async getTradesByTradingPair(pairId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(
      (trade) => trade.tradingPairId === pairId
    );
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const id = this.tradeCurrentId++;
    const now = new Date();
    
    const newTrade: Trade = {
      ...trade,
      id,
      timestamp: now
    };
    
    this.trades.set(id, newTrade);
    
    // Update orders
    const buyOrder = await this.getOrder(trade.buyOrderId);
    const sellOrder = await this.getOrder(trade.sellOrderId);
    
    if (buyOrder) {
      await this.updateOrder(buyOrder.id, {
        filled: (buyOrder.filled || 0) + trade.amount,
        status: (buyOrder.filled || 0) + trade.amount >= buyOrder.amount ? "Filled" : "Partial"
      });
    }
    
    if (sellOrder) {
      await this.updateOrder(sellOrder.id, {
        filled: (sellOrder.filled || 0) + trade.amount,
        status: (sellOrder.filled || 0) + trade.amount >= sellOrder.amount ? "Filled" : "Partial"
      });
    }
    
    // Update user trading volumes
    if (buyOrder) {
      const buyer = await this.getUser(buyOrder.userId);
      if (buyer) {
        await this.updateUser(buyer.id, {
          totalTradingVolume: (buyer.totalTradingVolume || 0) + trade.totalValue
        });
      }
    }
    
    if (sellOrder) {
      const seller = await this.getUser(sellOrder.userId);
      if (seller) {
        await this.updateUser(seller.id, {
          totalTradingVolume: (seller.totalTradingVolume || 0) + trade.totalValue
        });
      }
    }
    
    return newTrade;
  }

  // REWARDS METHODS
  async getRewardsEvent(id: number): Promise<RewardsEvent | undefined> {
    return this.rewardsEvents.get(id);
  }

  async getUserRewardsEvents(userId: number): Promise<RewardsEvent[]> {
    return Array.from(this.rewardsEvents.values()).filter(
      (event) => event.userId === userId
    );
  }

  async createRewardsEvent(event: InsertRewardsEvent): Promise<RewardsEvent> {
    const id = this.rewardsEventCurrentId++;
    const now = new Date();
    
    const newEvent: RewardsEvent = {
      ...event,
      id,
      createdAt: now
    };
    
    this.rewardsEvents.set(id, newEvent);
    
    // Update user's reward points
    const user = await this.getUser(event.userId);
    if (user) {
      await this.updateUser(user.id, {
        rewardsPoints: (user.rewardsPoints || 0) + event.points
      });
    }
    
    return newEvent;
  }

  async getUserRewardsTier(userId: number): Promise<RewardsTier | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const tiers = await this.getAllRewardsTiers();
    
    // Sort tiers by points required in descending order
    const sortedTiers = tiers.sort((a, b) => b.pointsRequired - a.pointsRequired);
    
    // Find the highest tier the user qualifies for
    for (const tier of sortedTiers) {
      if (user.rewardsPoints >= tier.pointsRequired) {
        return tier;
      }
    }
    
    // If no tier found (should not happen if there's a tier with 0 points)
    return tiers[0];
  }

  async getAllRewardsTiers(): Promise<RewardsTier[]> {
    return Array.from(this.rewardsTiers.values());
  }

  async createRewardsTier(tier: InsertRewardsTier): Promise<RewardsTier> {
    const id = this.rewardsTierCurrentId++;
    
    const newTier: RewardsTier = {
      ...tier,
      id
    };
    
    this.rewardsTiers.set(id, newTier);
    return newTier;
  }

  // NEWS METHODS
  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async getPublishedNewsArticles(limit?: number): Promise<NewsArticle[]> {
    const publishedArticles = Array.from(this.newsArticles.values())
      .filter(article => article.isPublished)
      .sort((a, b) => {
        const dateA = a.publishDate || new Date(0);
        const dateB = b.publishDate || new Date(0);
        return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
      });
    
    return limit ? publishedArticles.slice(0, limit) : publishedArticles;
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.newsArticleCurrentId++;
    
    const newArticle: NewsArticle = {
      ...article,
      id
    };
    
    this.newsArticles.set(id, newArticle);
    return newArticle;
  }

  async updateNewsArticle(id: number, data: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const article = await this.getNewsArticle(id);
    if (!article) return undefined;

    const updatedArticle = { ...article, ...data };
    this.newsArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  // SUBSCRIBER METHODS
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberCurrentId++;
    const now = new Date();
    
    const subscriber: Subscriber = { 
      ...insertSubscriber, 
      id,
      subscribedAt: now,
      isActive: true
    };
    
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email
    );
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values()).filter(
      (subscriber) => subscriber.isActive
    );
  }

  async unsubscribe(email: string): Promise<boolean> {
    const subscriber = await this.getSubscriberByEmail(email);
    if (!subscriber) return false;
    
    const updatedSubscriber = { ...subscriber, isActive: false };
    this.subscribers.set(subscriber.id, updatedSubscriber);
    return true;
  }
}

export const storage = new MemStorage();
