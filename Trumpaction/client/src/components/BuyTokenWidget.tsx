import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { COIN_NAME, COIN_SYMBOL, COIN_CONTRACT, NETWORK, PLATFORM } from '@/lib/constants';
import { 
  connectWallet, 
  getTokenPriceData, 
  executePurchaseTransaction,
  formatUsd,
  getSolanaExplorerUrl
} from '@/lib/solana-service';
import { ArrowRight, ExternalLink, Wallet, AlertCircle, Loader2, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function BuyTokenWidget() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('100000000');
  const [priceData, setPriceData] = useState<{price: number, priceChange24h: number} | null>(null);
  const [slippage, setSlippage] = useState(1); // 1% default slippage
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Fetch price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const data = await getTokenPriceData();
        setPriceData({
          price: data.price,
          priceChange24h: data.priceChange24h
        });
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    fetchPriceData();
    // Set up interval to refresh price data every 30 seconds
    const interval = setInterval(fetchPriceData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Connect wallet function
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Execute buy transaction
  const handleBuyTokens = async () => {
    if (!walletAddress) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const txHash = await executePurchaseTransaction(walletAddress, parsedAmount, slippage);
      setTransactionHash(txHash);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Your purchase transaction has been submitted',
      });
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: error instanceof Error ? error.message : 'Failed to execute transaction',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate estimated cost
  const estimatedCost = priceData ? parseFloat(amount) * priceData.price : 0;
  const estimatedCostWithSlippage = estimatedCost * (1 + slippage / 100);

  return (
    <Card className="border-primary/10 overflow-hidden">
      {/* Gradient border top */}
      <div className="h-1 bg-gradient-to-r from-primary to-primary-light" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Buy {COIN_SYMBOL}</span>
          {priceData && (
            <span className={`text-sm ${priceData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceData.priceChange24h >= 0 ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Buy {COIN_NAME} tokens directly with {NETWORK} on {PLATFORM}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {transactionHash ? (
          <div className="text-center space-y-4 py-2">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Transaction Submitted!</h3>
            <p className="text-muted-foreground">
              Your purchase of {parseInt(amount).toLocaleString()} {COIN_SYMBOL} tokens has been submitted to the {NETWORK} network.
            </p>
            <div className="flex justify-center">
              <a
                href={getSolanaExplorerUrl(transactionHash, true)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                View on Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => {
                setTransactionHash(null);
                setAmount('100000000');
              }}
            >
              Make Another Purchase
            </Button>
          </div>
        ) : (
          <>
            {/* Current price info */}
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Current Price:</span>
              <span className="font-semibold">
                {priceData ? formatUsd(priceData.price) : 'Loading...'}
              </span>
            </div>
            
            {/* Purchase amount input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount of {COIN_SYMBOL} to purchase:</label>
              <div className="relative">
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="pl-4 pr-24"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <span className="text-sm text-muted-foreground">{COIN_SYMBOL}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <button 
                  onClick={() => setAmount('10000000')}
                  className="hover:text-primary transition-colors"
                >
                  10M
                </button>
                <button 
                  onClick={() => setAmount('50000000')}
                  className="hover:text-primary transition-colors"
                >
                  50M
                </button>
                <button 
                  onClick={() => setAmount('100000000')}
                  className="hover:text-primary transition-colors"
                >
                  100M
                </button>
                <button 
                  onClick={() => setAmount('500000000')}
                  className="hover:text-primary transition-colors"
                >
                  500M
                </button>
                <button 
                  onClick={() => setAmount('1000000000')}
                  className="hover:text-primary transition-colors"
                >
                  1B
                </button>
              </div>
            </div>
            
            {/* Slippage Tolerance */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Slippage Tolerance:</label>
                <span className="text-sm font-medium">{slippage}%</span>
              </div>
              <Slider
                value={[slippage]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={(value) => setSlippage(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
            
            {/* Transaction summary */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm">Estimated Cost:</span>
                <span className="font-semibold">
                  {priceData ? formatUsd(estimatedCostWithSlippage) : 'Calculating...'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Network Fee:</span>
                <span>~0.00005 SOL</span>
              </div>
            </div>
            
            {/* Warnings/Info */}
            <Alert className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Prices may change due to market volatility. Your transaction will use a slippage tolerance of {slippage}%.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        {!transactionHash && (
          walletAddress ? (
            <Button
              className="w-full bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-white"
              onClick={handleBuyTokens}
              disabled={isProcessing || !priceData}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Buy {COIN_SYMBOL}
                </>
              )}
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleConnectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          )
        )}
        
        <Button 
          variant="link" 
          className="text-sm text-muted-foreground" 
          onClick={() => navigate('/trade')}
        >
          Go to Advanced Trading <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}