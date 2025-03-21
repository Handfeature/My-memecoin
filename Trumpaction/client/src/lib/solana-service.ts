import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { COIN_CONTRACT } from './constants';

// Initialize connection to Solana network
const SOLANA_NETWORK = 'devnet'; // Use mainnet-beta for production
const connection = new Connection(clusterApiUrl(SOLANA_NETWORK as any), 'confirmed');
const pumpFunApiEndpoint = 'https://api.pump.fun';

// Token contract address
const tokenPublicKey = new PublicKey(COIN_CONTRACT);

/**
 * Interface for price data
 */
export interface TokenPriceData {
  price: number;
  priceChange24h: number;
  volumeUsd24h: number;
  marketCap: number;
  updatedAt: string;
}

/**
 * Interface for candlestick chart data
 */
export interface CandlestickData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Interface for wallet balances
 */
export interface WalletBalances {
  sol: number;
  tokenBalance: number;
  usdValue: number;
}

/**
 * Get token price and market data
 */
export const getTokenPriceData = async (): Promise<TokenPriceData> => {
  try {
    // In a real implementation, this would be a call to the Pump Fun API
    // For now, we'll return the current price from constants
    const mockResponse = {
      price: 0.0000327,
      priceChange24h: 2.8,
      volumeUsd24h: 450000,
      marketCap: 14500000,
      updatedAt: new Date().toISOString()
    };
    
    return mockResponse;
  } catch (error) {
    console.error('Error fetching token price data:', error);
    throw new Error('Failed to fetch token price data');
  }
};

/**
 * Get historical price data for charts
 */
export const getHistoricalPriceData = async (timeframe: string): Promise<CandlestickData[]> => {
  try {
    // In a real implementation, this would be a call to the Pump Fun API
    // For now, we'll generate sample data
    const now = Date.now();
    const data: CandlestickData[] = [];
    const basePrice = 0.0000327;
    const intervals = timeframe === '1D' ? 24 : 
                     timeframe === '1W' ? 7 * 24 : 
                     timeframe === '1M' ? 30 * 24 : 
                     timeframe === '1H' ? 60 : 
                     90;
    
    // Generate historical data points based on timeframe
    const timeInterval = timeframe === '1D' ? 60 * 60 * 1000 : // 1 hour in ms
                         timeframe === '1W' ? 4 * 60 * 60 * 1000 : // 4 hours in ms
                         timeframe === '1M' ? 24 * 60 * 60 * 1000 : // 1 day in ms
                         timeframe === '1H' ? 60 * 1000 : // 1 minute in ms
                         24 * 60 * 60 * 1000; // Default to 1 day
    
    for (let i = intervals; i >= 0; i--) {
      // Create some variation in the price
      const volatility = 0.05; // 5% volatility
      const change = basePrice * volatility * (Math.random() - 0.5);
      const closePrice = basePrice + change * (i / intervals);
      
      // Add some random price movement within the candle
      const open = closePrice * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, closePrice) * (1 + Math.random() * 0.01);
      const low = Math.min(open, closePrice) * (1 - Math.random() * 0.01);
      
      // Add a data point
      data.push({
        time: now - (i * timeInterval),
        open,
        high,
        low,
        close: closePrice,
        volume: 1000000 + Math.random() * 2000000
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching historical price data:', error);
    throw new Error('Failed to fetch historical price data');
  }
};

/**
 * Connect to wallet
 */
export const connectWallet = async (): Promise<string | null> => {
  // Check if Phantom or Solflare wallet is available in the browser
  // @ts-ignore
  const provider = window.phantom?.solana || window.solflare;
  
  if (!provider) {
    throw new Error('No Solana wallet found. Please install Phantom or Solflare extension');
  }
  
  try {
    const response = await provider.connect();
    return response.publicKey.toString();
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return null;
  }
};

/**
 * Execute a token purchase (buy) transaction
 */
export const executePurchaseTransaction = async (
  walletPublicKey: string,
  amount: number,
  slippageTolerance: number = 2 // Default slippage tolerance of 2%
): Promise<string> => {
  try {
    // This would typically involve:
    // 1. Create a transaction to buy the token through a DEX (like Raydium or Jupiter)
    // 2. Sign the transaction with the user's wallet
    // 3. Send the transaction to the network
    // 4. Return the transaction signature
    
    // For this demo, we'll just simulate a successful transaction
    const mockTxId = `simulatedTx_${Date.now().toString(36)}`;
    return mockTxId;
  } catch (error) {
    console.error('Error executing purchase transaction:', error);
    throw new Error('Failed to execute purchase transaction');
  }
};

/**
 * Get wallet balances
 */
export const getWalletBalances = async (walletAddress: string): Promise<WalletBalances> => {
  try {
    // For a real implementation, we would:
    // 1. Get SOL balance
    // 2. Get token balance using Token Program
    // 3. Calculate USD value
    
    // For this demo, we'll just return mock data
    return {
      sol: 2.5,
      tokenBalance: 10000000,
      usdValue: 2.5 * 100 + 10000000 * 0.0000327 // SOL at $100 + token value
    };
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    throw new Error('Failed to fetch wallet balances');
  }
};

/**
 * Returns the Solana Explorer URL for the given address or transaction
 */
export const getSolanaExplorerUrl = (addressOrSignature: string, isTransaction = false): string => {
  // Use separate string literals to avoid type comparison issues
  let baseUrl = 'https://explorer.solana.com';
  if (SOLANA_NETWORK !== 'mainnet-beta') {
    baseUrl = `https://explorer.solana.com/?cluster=${SOLANA_NETWORK}`;
  }
  
  if (isTransaction) {
    return `${baseUrl}/tx/${addressOrSignature}`;
  }
  
  return `${baseUrl}/address/${addressOrSignature}`;
};

/**
 * Fetches order book data from Pump Fun or other providers
 */
export const getOrderBookData = async (): Promise<{ bids: Array<{price: number, amount: number}>, asks: Array<{price: number, amount: number}> }> => {
  try {
    // Mock data - in a real implementation, this would be a call to the DEX API
    const currentPrice = 0.0000327;
    const bids = Array.from({ length: 10 }, (_, i) => ({
      price: currentPrice * (1 - (i + 1) * 0.01),
      amount: 500000 + Math.random() * 1000000
    }));
    
    const asks = Array.from({ length: 10 }, (_, i) => ({
      price: currentPrice * (1 + (i + 1) * 0.01),
      amount: 400000 + Math.random() * 800000
    }));
    
    return { bids, asks };
  } catch (error) {
    console.error('Error fetching order book data:', error);
    throw new Error('Failed to fetch order book data');
  }
};

/**
 * Utility to format numbers for display
 */
export const formatTokenAmount = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`;
  }
  return amount.toString();
};

export const formatUsd = (amount: number): string => {
  if (amount < 0.01) {
    return `$${amount.toFixed(8)}`;
  }
  if (amount < 1) {
    return `$${amount.toFixed(4)}`;
  }
  if (amount < 10000) {
    return `$${amount.toFixed(2)}`;
  }
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};