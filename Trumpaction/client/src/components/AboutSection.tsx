import { Card } from "@/components/ui/card";
import { COIN_NAME } from "@/lib/constants";
import { Lock, Users, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function AboutSection() {
  const [ref, controls] = useScrollReveal();
  const [featuresRef, featuresControls] = useScrollReveal();

  return (
    <section id="about" className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-space mb-4"
          >
            About <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">{COIN_NAME}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            The most ambitious crossover in crypto history.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 h-full">
              <h3 className="text-2xl font-bold mb-4">The Vision</h3>
              <p className="text-gray-300 mb-6">
                {COIN_NAME} coin combines the disruptive vision of two of the world's most powerful 
                personalities. Built on a secure blockchain foundation, we're bringing together 
                communities and memes like never before.
              </p>
              <p className="text-gray-300">
                Our token isn't just a meme - it's a movement. We're creating a community-driven 
                ecosystem that rewards holders and brings utility to the meme coin space.
              </p>
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
            className="space-y-6"
          >
            {/* Meme Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl w-full h-40 bg-gradient-to-br from-primary/20 to-primary-light/20 backdrop-blur-sm border border-gray-800 flex items-center justify-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-primary-light/70">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <text x="12" y="12" textAnchor="middle" fill="currentColor" fontSize="4">Trump Meme</text>
                </svg>
              </div>
              <div className="rounded-xl w-full h-40 bg-gradient-to-br from-secondary/20 to-accent/20 backdrop-blur-sm border border-gray-800 flex items-center justify-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-accent/70">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <text x="12" y="12" textAnchor="middle" fill="currentColor" fontSize="4">Elon Meme</text>
                </svg>
              </div>
              <div className="rounded-xl w-full h-40 bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm border border-gray-800 flex items-center justify-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-primary/70">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <text x="12" y="12" textAnchor="middle" fill="currentColor" fontSize="4">Trump & Elon Meme</text>
                </svg>
              </div>
              <div className="rounded-xl w-full h-40 bg-gradient-to-br from-secondary/20 to-secondary/20 backdrop-blur-sm border border-gray-800 flex items-center justify-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-secondary/70">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <text x="12" y="12" textAnchor="middle" fill="currentColor" fontSize="4">Crypto Meme</text>
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Features */}
        <div 
          ref={featuresRef}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            initial="hidden"
            animate={featuresControls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 h-full">
              <div className="text-4xl mb-4 text-primary-light">
                <Lock className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Secure</h3>
              <p className="text-gray-300">
                Contract audited and verified with liquidity locked for peace of mind.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={featuresControls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 h-full">
              <div className="text-4xl mb-4 text-primary-light">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Owned</h3>
              <p className="text-gray-300">
                Built by the community, for the community with transparent governance.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={featuresControls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 h-full">
              <div className="text-4xl mb-4 text-primary-light">
                <Rocket className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ready for Takeoff</h3>
              <p className="text-gray-300">
                Strong marketing and development roadmap to ensure sustainable growth.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
