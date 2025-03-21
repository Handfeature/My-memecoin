import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { COIN_NAME, COIN_SYMBOL, COIN_CONTRACT } from "@/lib/constants";
import { Menu, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled ? "bg-dark/80 backdrop-blur-md shadow-md" : "bg-transparent"
  } border-b border-gray-800`;

  const navigateToTrade = () => {
    navigate("/trade");
  };

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{COIN_SYMBOL}</span>
                </div>
                <h1 className="ml-3 text-xl font-bold font-space bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  {COIN_NAME}
                </h1>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#about" className="text-light hover:text-primary-light transition-colors font-medium">
              About
            </a>
            <a href="#tokenomics" className="text-light hover:text-primary-light transition-colors font-medium">
              Tokenomics
            </a>
            <a href="#how-to-buy" className="text-light hover:text-primary-light transition-colors font-medium">
              How to Buy
            </a>
            <Link href="/trade" className="text-light hover:text-primary-light transition-colors font-medium">
              Trade
            </Link>
            <Link href="/news" className="text-light hover:text-primary-light transition-colors font-medium">
              News
            </Link>
            
            {user ? (
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="border-light text-light hover:bg-light/10"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}
            
            <Button 
              className="bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-white"
              onClick={navigateToTrade}
            >
              Buy {COIN_SYMBOL}
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            className="md:hidden text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-dark/95 border-b border-gray-800 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
              <a 
                href="#about" 
                className="text-light hover:text-primary-light transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
              <a 
                href="#tokenomics" 
                className="text-light hover:text-primary-light transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Tokenomics
              </a>
              <a 
                href="#how-to-buy" 
                className="text-light hover:text-primary-light transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                How to Buy
              </a>
              <Link 
                href="/trade" 
                className="text-light hover:text-primary-light transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Trade
              </Link>
              <Link 
                href="/news" 
                className="text-light hover:text-primary-light transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                News
              </Link>
              
              <div className="pt-2 border-t border-gray-800">
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full mb-2 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => {
                      navigate("/dashboard");
                      setIsOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full mb-2 border-light text-light hover:bg-light/10"
                    onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}
                  >
                    Login
                  </Button>
                )}
                
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-white"
                  onClick={() => {
                    navigate("/trade");
                    setIsOpen(false);
                  }}
                >
                  Buy {COIN_SYMBOL}
                </Button>
              </div>
              
              <div className="pt-2 border-t border-gray-800 text-xs text-muted-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span>Contract Address:</span>
                  <a 
                    href={`https://solscan.io/token/${COIN_CONTRACT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    {`${COIN_CONTRACT.substring(0, 6)}...${COIN_CONTRACT.substring(COIN_CONTRACT.length - 4)}`}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network:</span>
                  <span>Solana</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
