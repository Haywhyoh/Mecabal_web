"use client";

import Header from "../components/Header";
import HeroSection from "../components/sections/HeroSection";
import ProblemSection from "../components/sections/ProblemSection";
import SolutionSection from "../components/sections/SolutionSection";
import SimpleSafeLocalSection from "../components/sections/SimpleSafeLocalSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import ForWhomSection from "../components/sections/ForWhomSection";
import FAQSection from "../components/sections/FAQSection";
import FooterSection from "../components/sections/FooterSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white"> 
      <Header />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <SimpleSafeLocalSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ForWhomSection />  
      <FAQSection />
      <FooterSection /> 
    </main>
  );
}
    