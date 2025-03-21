import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { COIN_NAME, COIN_SYMBOL, COIN_CONTRACT } from "@/lib/constants";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function HowToBuySection() {
  const [ref, controls] = useScrollReveal();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(COIN_CONTRACT);
    setCopied(true);
    toast({
      title: "Address copied to clipboard",
      description: "You can now paste it into your wallet app.",
      duration: 3000,
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section id="how-to-buy" className="py-20 relative bg-dark/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-space mb-4"
          >
            How to Buy
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Join our community in just a few simple steps.
          </motion.p>
        </div>
        
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 h-full">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-2xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold mb-4">Create a Wallet</h3>
              <p className="text-gray-300 mb-4">
                Download MetaMask or your preferred wallet from the app store or Google Play Store.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Check className="text-green-400 mr-2 h-4 w-4" />
                  Compatible with MetaMask
                </li>
                <li className="flex items-center">
                  <Check className="text-green-400 mr-2 h-4 w-4" />
                  Works with TrustWallet
                </li>
                <li className="flex items-center">
                  <Check className="text-green-400 mr-2 h-4 w-4" />
                  Supported on Coinbase Wallet
                </li>
              </ul>
            </Card>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 h-full">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-2xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold mb-4">Get Some ETH</h3>
              <p className="text-gray-300 mb-4">
                Have ETH in your wallet to switch to {COIN_SYMBOL}. If you don't have any ETH, you can buy directly on MetaMask, transfer from another wallet, or buy on another exchange and send it to your wallet.
              </p>
              <div className="flex items-center space-x-3 mt-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white">
                    <path d="M16.5,5v8.4l7.1,3.2L16.5,5z M16.5,5v8.4l-7.1,3.2L16.5,5z"/>
                    <path d="M16.5,27V19.8l7.1-4.1L16.5,27z M16.5,27V19.8l-7.1-4.1L16.5,27z"/>
                  </svg>
                </div>
                <span className="font-bold">Ethereum Network</span>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 h-full">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold mb-4">Go to Uniswap</h3>
              <p className="text-gray-300 mb-4">
                Connect to Uniswap, paste the {COIN_SYMBOL} token address, select {COIN_SYMBOL}, and confirm the swap. Always check you're buying the correct token.
              </p>
              <div className="bg-dark/50 border border-gray-700 rounded-lg p-3 font-mono text-sm break-all">
                {COIN_CONTRACT}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-primary-light hover:text-primary hover:bg-transparent transition-colors text-xs p-0"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />} 
                  {copied ? "Copied" : "Copy Address"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Button 
            className="px-8 py-6 bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-white text-lg"
            onClick={() => window.open("https://app.uniswap.org/", "_blank")}
          >
            Buy on Uniswap
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
