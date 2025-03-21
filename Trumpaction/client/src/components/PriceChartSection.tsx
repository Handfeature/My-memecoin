import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { COIN_SYMBOL } from "@/lib/constants";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from "recharts";

// Generate mock price data
const generatePriceData = () => {
  const data = [];
  let price = 0.0000127;
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // More realistic price movements
    const volatility = (Math.random() * 0.2) - 0.05;
    price = price * (1 + volatility);
    if (price < 0.0000001) price = 0.0000001;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: price,
      fullDate: date
    });
  }
  
  return data;
};

type TimeRange = '1H' | '1D' | '1W' | '1M' | 'ALL';

export default function PriceChartSection() {
  const [priceData, setPriceData] = useState(generatePriceData());
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1W');
  const [chartData, setChartData] = useState(priceData);
  const [ref, controls] = useScrollReveal();
  const [visibleChart, setVisibleChart] = useState(false);

  useEffect(() => {
    // Filter data based on selected time range
    const now = new Date();
    let filteredData = [...priceData];

    switch (selectedRange) {
      case '1H':
        filteredData = priceData.slice(-2); // Just show recent data
        break;
      case '1D':
        filteredData = priceData.slice(-24);
        break;
      case '1W':
        filteredData = priceData.slice(-7);
        break;
      case '1M':
        // All data is 1 month
        break;
      default:
        // 'ALL' - show all data
        break;
    }

    setChartData(filteredData);
  }, [selectedRange, priceData]);

  // Set chart visible after component mounts to prevent SSR issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleChart(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate price change percentage
  const calculatePriceChange = () => {
    if (chartData.length < 2) return 0;
    const oldPrice = chartData[0].price;
    const newPrice = chartData[chartData.length - 1].price;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  const priceChange = calculatePriceChange();
  const isPriceUp = priceChange >= 0;

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-space mb-4"
          >
            Price Chart
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Track our journey to the moon in real-time.
          </motion.p>
        </div>
        
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-bold">{COIN_SYMBOL}/USD</h3>
                <p className={`${isPriceUp ? 'text-green-400' : 'text-red-400'} font-bold`}>
                  {isPriceUp ? '+' : ''}{priceChange.toFixed(1)}% 
                  <span className="text-gray-400 font-normal ml-2">last {selectedRange}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                {(['1H', '1D', '1W', '1M', 'ALL'] as TimeRange[]).map((range) => (
                  <Button
                    key={range}
                    variant={selectedRange === range ? "default" : "outline"}
                    className={selectedRange === range 
                      ? "bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white"
                      : "border-gray-700 hover:border-primary-light transition-colors"
                    }
                    onClick={() => setSelectedRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="relative h-80">
              {visibleChart && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPriceUp ? "#FF6B00" : "#EF4444"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isPriceUp ? "#FFD700" : "#EF4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#94A3B8', fontSize: 12 }} 
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} 
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toFixed(8)}`} 
                      tick={{ fill: '#94A3B8', fontSize: 12 }} 
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(8)}`, 'Price']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPriceUp ? "#FFD700" : "#EF4444"} 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#priceGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
