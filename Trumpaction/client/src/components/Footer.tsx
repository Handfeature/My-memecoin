import { COIN_NAME } from "@/lib/constants";
import { Twitter, MessageCircle, Hash, BookOpen, Coffee, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white font-bold text-xs">T&E</span>
              </div>
              <h1 className="ml-3 text-xl font-bold font-space bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {COIN_NAME}
              </h1>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The ultimate meme coin celebrating the biggest personalities in crypto and business.
              Join our community and ride the wave to financial freedom.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
                <Hash className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
                <BookOpen className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
                <Coffee className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-primary-light transition-colors">About</a></li>
              <li><a href="#tokenomics" className="text-gray-400 hover:text-primary-light transition-colors">Tokenomics</a></li>
              <li><a href="#how-to-buy" className="text-gray-400 hover:text-primary-light transition-colors">How to Buy</a></li>
              <li><a href="#roadmap" className="text-gray-400 hover:text-primary-light transition-colors">Roadmap</a></li>
              <li><a href="#team" className="text-gray-400 hover:text-primary-light transition-colors">Team</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-primary-light transition-colors">Whitepaper</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary-light transition-colors">Audit</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary-light transition-colors">CoinGecko</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary-light transition-colors">CoinMarketCap</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary-light transition-colors">Contract</a></li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-primary-light transition-colors flex items-center">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {currentYear} {COIN_NAME}. All rights reserved.</p>
          <p className="mt-2">Not affiliated with Donald Trump or Elon Musk. This is a community-driven meme coin.</p>
        </div>
      </div>
    </footer>
  );
}
