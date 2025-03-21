import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, useAnimation } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ROADMAP_PHASES } from "@/lib/constants";
import { Check, Clock } from "lucide-react";
import { useEffect, useRef } from "react";

export default function RoadmapSection() {
  const [ref, controls] = useScrollReveal();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id="roadmap" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-space mb-4"
          >
            Roadmap
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Our journey to blockchain domination.
          </motion.p>
        </div>
        
        <div ref={ref} className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-700 hidden md:block"></div>
          
          {/* Timeline Items */}
          <motion.div
            className="relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {ROADMAP_PHASES.map((phase, index) => (
              <RoadmapPhaseItem key={index} phase={phase} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface RoadmapPhaseItemProps {
  phase: typeof ROADMAP_PHASES[0];
  index: number;
}

function RoadmapPhaseItem({ phase, index }: RoadmapPhaseItemProps) {
  const [progressRef, progressControls] = useScrollReveal();
  const progressAnimated = useRef(false);
  
  useEffect(() => {
    if (progressControls === "visible" && !progressAnimated.current) {
      progressAnimated.current = true;
    }
  }, [progressControls]);

  const isEven = index % 2 === 0;
  const isActive = phase.progress > 0;
  const isCompleted = phase.progress === 100;
  
  // Animation variants for child elements
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="mb-24 relative">
      <div className="flex items-center justify-center mb-8">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold z-10 ${
          isActive ? "bg-gradient-to-r from-primary to-primary-light" : "bg-gray-700"
        }`}>
          {phase.number}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          className={`${isEven ? "md:text-right md:pr-12" : "md:order-2 md:pl-12 md:text-left"}`}
          variants={itemVariants}
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-4">
            {phase.title}
          </h3>
          <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6">
            <ul className="space-y-4">
              {phase.items.map((item, itemIndex) => (
                <li key={itemIndex} className={`flex items-center ${isEven ? "md:justify-end" : ""}`}>
                  {item.completed ? (
                    <Check className={`text-green-400 h-5 w-5 mr-2 ${isEven ? "md:order-2 md:ml-2 md:mr-0" : ""}`} />
                  ) : (
                    <Clock className={`text-yellow-400 h-5 w-5 mr-2 ${isEven ? "md:order-2 md:ml-2 md:mr-0" : ""}`} />
                  )}
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 w-full" ref={progressRef}>
              <div className={`text-${isEven ? "right" : "left"} ${
                isCompleted ? "text-green-400" : phase.progress > 0 ? "text-yellow-400" : "text-gray-500"
              } mb-1`}>
                {phase.progress}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={progressControls === "visible" ? { width: `${phase.progress}%` } : {}}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
        <div className="md:hidden">
          <div className="h-8 w-1 bg-gray-700 mx-auto"></div>
        </div>
        <motion.div 
          className={`${isEven ? "" : "md:order-1"} ${!isEven ? "md:pr-12" : "md:pl-12"}`}
          variants={itemVariants}
        >
          <div className={`w-full h-60 rounded-xl p-3 flex items-center justify-center border ${
            isActive ? "border-primary/50" : "border-gray-800"
          } ${phase.progress === 0 ? "grayscale opacity-50" : ""} 
            bg-gradient-to-br ${
              index % 4 === 0 ? "from-primary/10 to-primary-light/10" : 
              index % 4 === 1 ? "from-secondary/10 to-primary/10" : 
              index % 4 === 2 ? "from-accent/10 to-secondary/10" : 
              "from-secondary/10 to-accent/10"
            }`}>
            <div className="text-center">
              <div className={`text-4xl mb-3 ${
                isActive ? "text-primary-light" : "text-gray-500"
              }`}>
                {isCompleted ? '✅' : phase.progress > 0 ? '🚀' : '🔜'}
              </div>
              <h4 className="text-xl font-bold">{phase.title}</h4>
              <p className="text-gray-400 mt-2">
                {isCompleted ? 'Completed' : phase.progress > 0 ? 'In Progress' : 'Coming Soon'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
