import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion } from "framer-motion";
import { 
  COIN_NAME, 
  COIN_SYMBOL, 
  TOTAL_SUPPLY,
  NETWORK,
  LISTING_PRICE,
  INITIAL_MARKET_CAP,
  TOKEN_DISTRIBUTION,
  BUY_TAX,
  SELL_TAX,
  BUY_TAX_TOTAL,
  SELL_TAX_TOTAL
} from "@/lib/constants";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function TokenomicsSection() {
  const [ref, controls] = useScrollReveal();
  const [rightRef, rightControls] = useScrollReveal();
  const [chartRendered, setChartRendered] = useState(false);

  // Ensure the chart renders properly after the component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartRendered(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="tokenomics" className="py-20 relative bg-dark/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-space mb-4"
          >
            Tokenomics
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Our token economics are designed for long-term growth.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Chart */}
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6 text-center">Token Distribution</h3>
              <div className="relative h-80">
                {chartRendered && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={TOKEN_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {TOKEN_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Allocation']}
                        contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {TOKEN_DISTRIBUTION.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
          
          {/* Token Details */}
          <div ref={rightRef} className="space-y-8">
            <motion.div
              initial="hidden"
              animate={rightControls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4">Token Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Token Name</span>
                    <span className="font-bold">{COIN_NAME}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Token Symbol</span>
                    <span className="font-bold">{COIN_SYMBOL}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Total Supply</span>
                    <span className="font-bold font-mono">{TOTAL_SUPPLY}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Network</span>
                    <span className="font-bold">{NETWORK}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Listing Price</span>
                    <span className="font-bold font-mono">{LISTING_PRICE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Initial Market Cap</span>
                    <span className="font-bold font-mono">{INITIAL_MARKET_CAP}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            {/* Transaction Taxes */}
            <motion.div
              initial="hidden"
              animate={rightControls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4">Transaction Taxes</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Buy Tax</span>
                      <span>{BUY_TAX_TOTAL}%</span>
                    </div>
                    <Progress value={BUY_TAX_TOTAL} className="h-2 bg-gray-700" indicatorClassName="bg-gradient-to-r from-primary to-primary-light" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Sell Tax</span>
                      <span>{SELL_TAX_TOTAL}%</span>
                    </div>
                    <Progress value={SELL_TAX_TOTAL} className="h-2 bg-gray-700" indicatorClassName="bg-gradient-to-r from-primary to-primary-light" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[...BUY_TAX, ...SELL_TAX].map((tax, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          index % 4 === 0 ? "bg-primary" : 
                          index % 4 === 1 ? "bg-secondary" : 
                          index % 4 === 2 ? "bg-accent" : "bg-green-500"
                        }`}></div>
                        <span>{tax.name} ({tax.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
