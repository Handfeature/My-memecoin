import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TokenomicsSection from "@/components/TokenomicsSection";
import PriceChartSection from "@/components/PriceChartSection";
import HowToBuySection from "@/components/HowToBuySection";
import RoadmapSection from "@/components/RoadmapSection";
import TeamSection from "@/components/TeamSection";
import FaqSection from "@/components/FaqSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { useEffect } from "react";

export default function Home() {
  // Apply custom styles to the body when the component mounts
  useEffect(() => {
    document.body.classList.add("font-sans", "antialiased", "bg-background", "text-foreground");
    
    // Add animated background elements
    const body = document.body;
    const bg = document.createElement("div");
    bg.className = "fixed inset-0 -z-10 overflow-hidden";
    bg.innerHTML = `
      <div class="absolute inset-0 bg-dark bg-opacity-95"></div>
      <div class="absolute top-0 left-0 w-full h-full">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary opacity-20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div class="absolute top-3/4 right-1/4 w-96 h-96 bg-secondary opacity-15 rounded-full filter blur-3xl animate-pulse-slow delay-700"></div>
        <div class="absolute bottom-1/3 left-1/2 w-80 h-80 bg-accent opacity-10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
      </div>
    `;
    body.appendChild(bg);
    
    // Cleanup function to remove the background on unmount
    return () => {
      body.removeChild(bg);
      document.body.classList.remove("font-sans", "antialiased", "bg-background", "text-foreground");
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <TokenomicsSection />
        <PriceChartSection />
        <HowToBuySection />
        <RoadmapSection />
        <TeamSection />
        <FaqSection />
        <NewsletterSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
