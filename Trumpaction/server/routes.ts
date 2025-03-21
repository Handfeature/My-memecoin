import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSubscriberSchema, 
  insertUserSchema, 
  insertOrderSchema,
  insertNewsArticleSchema, 
  insertRewardsEventSchema 
} from "@shared/schema";
import { z } from "zod";

// Extend the insertUserSchema with additional validation
const registerUserSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email format"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Middleware for API error handling
const apiErrorHandler = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error("API Error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid data provided", 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      message: "Server error occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Authentication middleware (simple version)
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get user ID from session (in a real app, this would use JWT or session)
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const user = await storage.getUser(Number(userId));
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication" });
    }
    
    // Set user in request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// For demonstration, simulate market data
const generateMarketData = (pairSymbol: string, timeframe: string) => {
  const now = Date.now();
  const data = [];
  const basePrice = 0.0000327;
  
  // Generate different amounts of data based on timeframe
  let dataPoints = 24;
  let interval = 60 * 60 * 1000; // 1 hour in ms
  
  if (timeframe === '1H') {
    dataPoints = 60;
    interval = 60 * 1000; // 1 minute
  } else if (timeframe === '1D') {
    dataPoints = 24;
    interval = 60 * 60 * 1000; // 1 hour
  } else if (timeframe === '1W') {
    dataPoints = 7;
    interval = 24 * 60 * 60 * 1000; // 1 day
  } else if (timeframe === '1M') {
    dataPoints = 30;
    interval = 24 * 60 * 60 * 1000; // 1 day
  } else if (timeframe === 'ALL') {
    dataPoints = 90;
    interval = 24 * 60 * 60 * 1000; // 1 day
  }
  
  for (let i = 0; i < dataPoints; i++) {
    const time = now - (dataPoints - i) * interval;
    const volatility = 0.2; // 20% volatility
    
    // Random price with some trend
    const randomFactor = 1 + ((Math.random() - 0.5) * volatility);
    const trendFactor = 1 + (i / dataPoints) * 0.1; // Slight uptrend
    const price = basePrice * randomFactor * trendFactor;
    
    // Random volume
    const volume = Math.floor(Math.random() * 1000000) + 500000;
    
    data.push({
      time: new Date(time).toISOString(),
      open: price * (1 - Math.random() * 0.02),
      high: price * (1 + Math.random() * 0.02),
      low: price * (1 - Math.random() * 0.03),
      close: price,
      volume
    });
  }
  
  return data;
};

// Simulate order book data
const generateOrderBook = (pairSymbol: string) => {
  const basePrice = 0.0000327;
  const bids = [];
  const asks = [];
  
  // Generate some bid orders (buy orders below current price)
  for (let i = 1; i <= 20; i++) {
    const priceReduction = i * 0.000001;
    const price = basePrice - priceReduction;
    const amount = Math.floor(Math.random() * 5000000) + 1000000;
    bids.push({ price, amount });
  }
  
  // Generate some ask orders (sell orders above current price)
  for (let i = 1; i <= 20; i++) {
    const priceIncrease = i * 0.000001;
    const price = basePrice + priceIncrease;
    const amount = Math.floor(Math.random() * 5000000) + 1000000;
    asks.push({ price, amount });
  }
  
  return {
    bids,
    asks
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up declared extension of Request
  app.use((req, res, next) => {
    req.user = null;
    next();
  });

  //==================================================
  // AUTH ROUTES
  //==================================================
  
  // Register new user
  app.post("/api/auth/register", apiErrorHandler(async (req: Request, res: Response) => {
    const validatedData = registerUserSchema.parse(req.body);
    
    // Check if username or email already exists
    const existingUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    // In a real app, we would hash the password here
    const { confirmPassword, ...userData } = validatedData;
    
    // Create user
    const user = await storage.createUser(userData);
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    
    return res.status(201).json({ 
      message: "User registered successfully", 
      user: userWithoutPassword 
    });
  }));
  
  // Login user
  app.post("/api/auth/login", apiErrorHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    // Find user
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // In a real app, we would create a session or JWT here
    // For demo, we'll just return the user ID which can be used as a fake token
    
    const { password: userPassword, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
      message: "Login successful", 
      user: userWithoutPassword 
    });
  }));
  
  // Request password reset
  app.post("/api/auth/request-reset", apiErrorHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    
    // Generate reset token
    const resetToken = await storage.generateResetToken(email);
    
    if (!resetToken) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ message: "If your email is registered, you will receive a reset link" });
    }
    
    // In a real app, would send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`);
    
    return res.status(200).json({ 
      message: "If your email is registered, you will receive a reset link",
      // Only for demo purposes, normally wouldn't return this
      token: resetToken
    });
  }));
  
  // Reset password
  app.post("/api/auth/reset-password", apiErrorHandler(async (req: Request, res: Response) => {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }
    
    // Reset password
    const success = await storage.resetPassword(token, password);
    
    if (!success) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    return res.status(200).json({ message: "Password reset successful" });
  }));
  
  // Get current user profile
  app.get("/api/auth/profile", authMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const { password, ...userWithoutPassword } = req.user;
    
    return res.status(200).json({ user: userWithoutPassword });
  }));
  
  //==================================================
  // TRADING ROUTES
  //==================================================
  
  // Get all trading pairs
  app.get("/api/trading/pairs", apiErrorHandler(async (req: Request, res: Response) => {
    const pairs = await storage.getAllTradingPairs();
    return res.status(200).json({ pairs });
  }));
  
  // Get market data for a pair
  app.get("/api/trading/market-data/:symbol/:timeframe", apiErrorHandler(async (req: Request, res: Response) => {
    const { symbol, timeframe } = req.params;
    
    if (!symbol || !timeframe) {
      return res.status(400).json({ message: "Symbol and timeframe required" });
    }
    
    // Get pair
    const pair = await storage.getTradingPairBySymbol(symbol);
    
    if (!pair) {
      return res.status(404).json({ message: "Trading pair not found" });
    }
    
    // Generate market data
    const marketData = generateMarketData(symbol, timeframe);
    
    return res.status(200).json({ 
      pair,
      timeframe,
      data: marketData
    });
  }));
  
  // Get order book for a pair
  app.get("/api/trading/order-book/:symbol", apiErrorHandler(async (req: Request, res: Response) => {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ message: "Symbol required" });
    }
    
    // Get pair
    const pair = await storage.getTradingPairBySymbol(symbol);
    
    if (!pair) {
      return res.status(404).json({ message: "Trading pair not found" });
    }
    
    // Generate order book
    const orderBook = generateOrderBook(symbol);
    
    return res.status(200).json({ 
      pair,
      orderBook
    });
  }));
  
  // Place order (requires auth)
  app.post("/api/trading/orders", authMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const validatedData = insertOrderSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    
    // Get trading pair
    const pair = await storage.getTradingPair(validatedData.tradingPairId);
    
    if (!pair) {
      return res.status(404).json({ message: "Trading pair not found" });
    }
    
    // Validate amount
    if (validatedData.amount < pair.minTradeAmount) {
      return res.status(400).json({ 
        message: `Order amount below minimum (${pair.minTradeAmount})` 
      });
    }
    
    if (pair.maxTradeAmount && validatedData.amount > pair.maxTradeAmount) {
      return res.status(400).json({ 
        message: `Order amount above maximum (${pair.maxTradeAmount})` 
      });
    }
    
    // Validate price for limit orders
    if (validatedData.type === 'Limit' && !validatedData.price) {
      return res.status(400).json({ message: "Price required for limit orders" });
    }
    
    // Create order
    const order = await storage.createOrder(validatedData);
    
    // For market orders, simulate execution
    if (order.type === 'Market') {
      // Create a matching order and trade
      const matchingOrderData = {
        userId: 999, // System user
        tradingPairId: order.tradingPairId,
        type: 'Limit',
        side: order.side === 'Buy' ? 'Sell' : 'Buy',
        price: validatedData.price || 0.0000327, // Use current price if not provided
        amount: order.amount,
      };
      
      const matchingOrder = await storage.createOrder(matchingOrderData);
      
      // Create trade
      const tradeData = {
        buyOrderId: order.side === 'Buy' ? order.id : matchingOrder.id,
        sellOrderId: order.side === 'Sell' ? order.id : matchingOrder.id,
        tradingPairId: order.tradingPairId,
        price: validatedData.price || 0.0000327,
        amount: order.amount,
        totalValue: (validatedData.price || 0.0000327) * order.amount,
        fee: (validatedData.price || 0.0000327) * order.amount * pair.tradingFee
      };
      
      await storage.createTrade(tradeData);
      
      // Create rewards event
      const rewardsData = {
        userId: req.user.id,
        eventType: 'Trade',
        points: Math.floor(tradeData.totalValue / 100), // 1 point per $100 traded
        description: `Earned points for trading ${order.amount} ${pair.baseAsset}`
      };
      
      await storage.createRewardsEvent(rewardsData);
    }
    
    return res.status(201).json({ 
      message: "Order placed successfully", 
      order
    });
  }));
  
  // Get user orders (requires auth)
  app.get("/api/trading/orders", authMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const orders = await storage.getUserOrders(req.user.id);
    return res.status(200).json({ orders });
  }));
  
  // Get user trades (requires auth)
  app.get("/api/trading/trades", authMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const trades = await storage.getUserTrades(req.user.id);
    return res.status(200).json({ trades });
  }));
  
  //==================================================
  // REWARDS ROUTES
  //==================================================
  
  // Get user rewards (requires auth)
  app.get("/api/rewards", authMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const tier = await storage.getUserRewardsTier(req.user.id);
    const events = await storage.getUserRewardsEvents(req.user.id);
    
    return res.status(200).json({ 
      points: req.user.rewardsPoints,
      tier,
      events
    });
  }));
  
  // Get leaderboard
  app.get("/api/rewards/leaderboard", apiErrorHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const users = await storage.getUsersByRewardsPoints(limit);
    
    // Remove sensitive information
    const leaderboard = users.map(user => ({
      id: user.id,
      username: user.username,
      rewardsPoints: user.rewardsPoints,
      tier: null // Will be populated below
    }));
    
    // Get tier for each user
    for (let i = 0; i < leaderboard.length; i++) {
      leaderboard[i].tier = await storage.getUserRewardsTier(leaderboard[i].id);
    }
    
    return res.status(200).json({ leaderboard });
  }));
  
  // Get all reward tiers
  app.get("/api/rewards/tiers", apiErrorHandler(async (req: Request, res: Response) => {
    const tiers = await storage.getAllRewardsTiers();
    return res.status(200).json({ tiers });
  }));
  
  //==================================================
  // NEWS ROUTES
  //==================================================
  
  // Get published news articles
  app.get("/api/news", apiErrorHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const articles = await storage.getPublishedNewsArticles(limit);
    return res.status(200).json({ articles });
  }));
  
  // Get a specific news article
  app.get("/api/news/:id", apiErrorHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    
    const article = await storage.getNewsArticle(id);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    // Only return published articles unless admin
    if (!article.isPublished && (!req.user || req.user.id !== 1)) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    return res.status(200).json({ article });
  }));
  
  // Create news article (admin only)
  app.post("/api/news", authMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    // Check if admin (for demo, user ID 1 is admin)
    if (req.user.id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const validatedData = insertNewsArticleSchema.parse(req.body);
    
    const article = await storage.createNewsArticle(validatedData);
    
    return res.status(201).json({ 
      message: "Article created successfully", 
      article
    });
  }));
  
  //==================================================
  // NEWSLETTER ROUTES
  //==================================================
  
  // Newsletter subscription endpoint
  app.post("/api/subscribe", apiErrorHandler(async (req: Request, res: Response) => {
    const validatedData = insertSubscriberSchema.parse(req.body);
    
    // Check if email already exists
    const existingSubscriber = await storage.getSubscriberByEmail(validatedData.email);
    
    if (existingSubscriber) {
      return res.status(400).json({ message: "Email already subscribed" });
    }
    
    // Create new subscriber
    const subscriber = await storage.createSubscriber(validatedData);
    
    return res.status(201).json({ 
      message: "Successfully subscribed", 
      subscriber: { id: subscriber.id, email: subscriber.email } 
    });
  }));

  // Unsubscribe from newsletter
  app.post("/api/unsubscribe", apiErrorHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    
    const success = await storage.unsubscribe(email);
    
    if (!success) {
      return res.status(404).json({ message: "Email not found" });
    }
    
    return res.status(200).json({ message: "Successfully unsubscribed" });
  }));

  // Get all subscribers (admin only)
  app.get("/api/subscribers", authMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    // Check if admin (for demo, user ID 1 is admin)
    if (req.user.id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const subscribers = await storage.getAllSubscribers();
    return res.status(200).json({ subscribers });
  }));

  //==================================================
  // ADMIN ROUTES
  //==================================================
  
  // Admin middleware for checking admin permissions
  const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if admin (user ID 1 is admin for demo purposes)
    if (req.user.id !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };
  
  // Get all users (admin only)
  app.get("/api/admin/users", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const users = await Promise.all(
      Array.from(storage.users.values()).map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      })
    );
    
    return res.status(200).json({ users });
  }));
  
  // Get user by ID (admin only)
  app.get("/api/admin/users/:id", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword });
  }));
  
  // Update user (admin only)
  app.patch("/api/admin/users/:id", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user data
    const updatedUser = await storage.updateUser(id, req.body);
    
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user" });
    }
    
    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({ 
      message: "User updated successfully",
      user: userWithoutPassword 
    });
  }));
  
  // Get all trading pairs (admin only)
  app.get("/api/admin/trading-pairs", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const pairs = await storage.getAllTradingPairs(false); // Include inactive pairs
    return res.status(200).json({ pairs });
  }));
  
  // Update trading pair (admin only)
  app.patch("/api/admin/trading-pairs/:id", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid trading pair ID" });
    }
    
    const pair = await storage.getTradingPair(id);
    
    if (!pair) {
      return res.status(404).json({ message: "Trading pair not found" });
    }
    
    // Update trading pair
    const updatedPair = await storage.updateTradingPair(id, req.body);
    
    if (!updatedPair) {
      return res.status(500).json({ message: "Failed to update trading pair" });
    }
    
    return res.status(200).json({ 
      message: "Trading pair updated successfully",
      pair: updatedPair 
    });
  }));
  
  // Get all orders (admin only)
  app.get("/api/admin/orders", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const pairId = req.query.pairId ? Number(req.query.pairId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    
    let orders = [];
    
    if (pairId) {
      orders = await storage.getOrdersByTradingPair(pairId, status);
    } else {
      // Get all orders from all users
      orders = Array.from(storage.orders.values());
      
      // Filter by status if provided
      if (status) {
        orders = orders.filter(order => order.status === status);
      }
    }
    
    return res.status(200).json({ orders });
  }));
  
  // Update news article (admin only)
  app.patch("/api/admin/news/:id", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    
    const article = await storage.getNewsArticle(id);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    // Update article
    const updatedArticle = await storage.updateNewsArticle(id, req.body);
    
    if (!updatedArticle) {
      return res.status(500).json({ message: "Failed to update article" });
    }
    
    return res.status(200).json({ 
      message: "Article updated successfully",
      article: updatedArticle 
    });
  }));
  
  // Get all news articles including unpublished (admin only)
  app.get("/api/admin/news", authMiddleware, adminMiddleware, apiErrorHandler(async (req: Request, res: Response) => {
    const articles = Array.from(storage.newsArticles.values());
    return res.status(200).json({ articles });
  }));

  const httpServer = createServer(app);

  return httpServer;
}
