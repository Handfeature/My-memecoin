import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COIN_NAME, COIN_SYMBOL, CURRENT_PRICE, MARKET_CAP, HOLDERS, LIQUIDITY } from "@/lib/constants";
import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import BuyTokenWidget from "./BuyTokenWidget";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, navigate] = useLocation();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="pt-36 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left Content */}
          <motion.div 
            className="w-full md:w-1/2 mb-10 md:mb-0"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.h1 variants={item} className="text-4xl md:text-6xl font-bold mb-6 font-space">
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {COIN_NAME}
              </span> Coin
            </motion.h1>
            <motion.p variants={item} className="text-xl text-gray-300 mb-8 max-w-lg">
              The ultimate meme coin bringing together the two biggest personalities
              in the crypto space. To the moon... and then Mars! 🚀
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Button 
                className="px-8 py-6 bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-white text-lg"
                onClick={() => navigate('/trade')}
              >
                Trade {COIN_SYMBOL}
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-6 border-primary-light text-primary-light hover:bg-primary-light hover:text-dark transition-all text-lg"
                onClick={() => {
                  const whitepaper = document.getElementById('tokenomics');
                  if (whitepaper) {
                    whitepaper.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Tokenomics
              </Button>
            </motion.div>
            
            {/* Live Stats */}
            <motion.div 
              variants={container}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <StatsCard title="Current Price" value={CURRENT_PRICE} />
              <StatsCard title="Market Cap" value={MARKET_CAP} />
              <StatsCard title="Holders" value={HOLDERS} />
              <StatsCard title="Liquidity" value={LIQUIDITY} />
            </motion.div>
          </motion.div>
          
          {/* Right Content - Buy Widget */}
          <motion.div 
            className="w-full md:w-5/12 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BuyTokenWidget />
            
            {/* Floating decorative elements */}
            <motion.div 
              className="absolute -top-10 -right-10 z-0"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              <div className="w-16 h-16 rounded-full bg-secondary shadow-lg flex items-center justify-center">
                <span className="text-white text-xs">SOL</span>
              </div>
            </motion.div>
            <motion.div 
              className="absolute -bottom-8 -left-10 z-0"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="w-20 h-20 rounded-full bg-accent shadow-lg flex items-center justify-center">
                <span className="text-dark text-xs">MEME</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Countdown Timer */}
      <div className="mt-16 max-w-3xl mx-auto">
        <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold mb-4">Next Phase Launch In:</h3>
          <CountdownTimer targetDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)} />
        </Card>
      </div>
    </section>
  );
}

function StatsCard({ title, value }: { title: string; value: string }) {
  return (
    <motion.div 
      variants={{ 
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-dark/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4"
    >
      <p className="text-sm text-gray-400">{title}</p>
      <p className="font-mono text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
        {value}
      </p>
    </motion.div>
  );
}
