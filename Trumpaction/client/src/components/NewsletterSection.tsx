import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Twitter, MessageCircle, Hash, BookOpen, Coffee } from "lucide-react";
import { insertSubscriberSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Extend the subscriber schema with additional validation
const formSchema = insertSubscriberSchema.extend({
  email: z.string().email("Please enter a valid email address"),
});

export default function NewsletterSection() {
  const [ref, controls] = useScrollReveal();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const subscribe = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/subscribe", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setIsSubmitted(true);
    },
    onError: (error: any) => {
      // Check if it's an already subscribed error
      if (error.message.includes("already subscribed")) {
        toast({
          title: "Already subscribed",
          description: "This email is already on our list.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    subscribe.mutate(data);
  }

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-space mb-4">Join Our Community</h2>
              <p className="text-xl text-gray-300">Stay updated with the latest news, launches, and exclusive offers!</p>
            </div>
            
            {isSubmitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4 text-green-400 inline-block bg-green-400/10 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Successfully Subscribed!</h3>
                <p className="text-gray-300">Thank you for subscribing to our newsletter. You'll start receiving updates soon.</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input 
                              placeholder="Your email address" 
                              className="bg-dark/50 border border-gray-700 rounded-full px-6 py-6 focus:outline-none focus:border-primary-light transition-colors" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-sm ml-3 mt-1" />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="px-8 py-6 bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-white whitespace-nowrap rounded-full"
                      disabled={subscribe.isPending}
                    >
                      {subscribe.isPending ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
            <div className="mt-12">
              <h3 className="text-xl font-bold text-center mb-6">Connect With Us</h3>
              <div className="flex justify-center flex-wrap gap-4">
                <SocialButton icon={<Twitter className="h-5 w-5" />} href="#" />
                <SocialButton icon={<MessageCircle className="h-5 w-5" />} href="#" />
                <SocialButton icon={<Hash className="h-5 w-5" />} href="#" />
                <SocialButton icon={<BookOpen className="h-5 w-5" />} href="#" />
                <SocialButton icon={<Coffee className="h-5 w-5" />} href="#" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function SocialButton({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      className="w-12 h-12 rounded-full flex items-center justify-center bg-dark border border-gray-700 hover:border-primary-light transition-colors"
    >
      {icon}
    </a>
  );
}
