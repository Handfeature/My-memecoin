import { pgTable, text, serial, integer, boolean, timestamp, real, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USER AUTHENTICATION
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  walletAddress: text("wallet_address").unique(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  profilePicture: text("profile_picture"),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  totalTradingVolume: real("total_trading_volume").default(0),
  rewardsPoints: integer("rewards_points").default(0),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  walletAddress: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// TRADING FUNCTIONALITY
export const tradingPairs = pgTable("trading_pairs", {
  id: serial("id").primaryKey(),
  baseAsset: text("base_asset").notNull(), // T&E
  quoteAsset: text("quote_asset").notNull(), // BTC, ETH, USDT, etc.
  pairSymbol: text("pair_symbol").notNull().unique(), // T&E/BTC
  minTradeAmount: real("min_trade_amount").notNull(),
  maxTradeAmount: real("max_trade_amount"),
  tradingFee: real("trading_fee").default(0.001),
  isActive: boolean("is_active").default(true),
});

export const insertTradingPairSchema = createInsertSchema(tradingPairs).pick({
  baseAsset: true,
  quoteAsset: true,
  pairSymbol: true,
  minTradeAmount: true,
  maxTradeAmount: true,
  tradingFee: true,
  isActive: true,
});

export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type TradingPair = typeof tradingPairs.$inferSelect;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tradingPairId: integer("trading_pair_id").notNull().references(() => tradingPairs.id),
  type: text("type").notNull(), // Market, Limit
  side: text("side").notNull(), // Buy, Sell
  price: real("price"),
  amount: real("amount").notNull(),
  filled: real("filled").default(0),
  status: text("status").notNull(), // Open, Filled, Cancelled, Partial
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  tradingPairId: true,
  type: true,
  side: true,
  price: true,
  amount: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  buyOrderId: integer("buy_order_id").notNull().references(() => orders.id),
  sellOrderId: integer("sell_order_id").notNull().references(() => orders.id),
  tradingPairId: integer("trading_pair_id").notNull().references(() => tradingPairs.id),
  price: real("price").notNull(),
  amount: real("amount").notNull(),
  totalValue: real("total_value").notNull(),
  fee: real("fee").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  buyOrderId: true,
  sellOrderId: true,
  tradingPairId: true,
  price: true,
  amount: true,
  totalValue: true,
  fee: true,
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// REWARDS SYSTEM
export const rewardsEvents = pgTable("rewards_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(), // Trade, Referral, Signup, etc.
  points: integer("points").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  additionalData: jsonb("additional_data"),
});

export const insertRewardsEventSchema = createInsertSchema(rewardsEvents).pick({
  userId: true,
  eventType: true,
  points: true,
  description: true,
  additionalData: true,
});

export type InsertRewardsEvent = z.infer<typeof insertRewardsEventSchema>;
export type RewardsEvent = typeof rewardsEvents.$inferSelect;

export const rewardsTiers = pgTable("rewards_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Bronze, Silver, Gold, etc.
  pointsRequired: integer("points_required").notNull(),
  tradingFeeDiscount: real("trading_fee_discount").default(0),
  additionalBenefits: text("additional_benefits").array(),
  icon: text("icon"),
});

export const insertRewardsTierSchema = createInsertSchema(rewardsTiers).pick({
  name: true,
  pointsRequired: true,
  tradingFeeDiscount: true,
  additionalBenefits: true,
  icon: true,
});

export type InsertRewardsTier = z.infer<typeof insertRewardsTierSchema>;
export type RewardsTier = typeof rewardsTiers.$inferSelect;

// NEWS & UPDATES
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  author: text("author"),
  publishDate: timestamp("publish_date").defaultNow(),
  isPublished: boolean("is_published").default(false),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).pick({
  title: true,
  content: true,
  summary: true,
  author: true,
  publishDate: true,
  isPublished: true,
  imageUrl: true,
  tags: true,
});

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

// NEWSLETTER SUBSCRIPTIONS
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
