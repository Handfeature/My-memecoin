import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { FAQS } from "@/lib/constants";

export default function FaqSection() {
  const [ref, controls] = useScrollReveal();

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-space mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Get answers to common questions about TRUMP&ELON.
          </motion.p>
        </div>
        
        <div ref={ref} className="max-w-3xl mx-auto">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  <AccordionItem value={`item-${index}`}>
                    <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 mb-4">
                      <AccordionTrigger className="text-left font-bold text-xl">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 text-gray-300">
                        {faq.answer}
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
