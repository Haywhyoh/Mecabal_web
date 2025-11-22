"use client";

import Header from "../components/Header";
import HeroSection from "../components/sections/HeroSection";
import StatsSection from "../components/sections/StatsSection";
import CoreFeaturesSection from "../components/sections/CoreFeaturesSection";
import ProblemSection from "../components/sections/ProblemSection";
import SolutionSection from "../components/sections/SolutionSection";
import UseCasesPreviewSection from "../components/sections/UseCasesPreviewSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import FAQSection from "../components/sections/FAQSection";
import FooterSection from "../components/sections/FooterSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white"> 
      <Header />
      <HeroSection />
      <StatsSection />
      <CoreFeaturesSection />
      <ProblemSection />
      <SolutionSection />
      <UseCasesPreviewSection />
      <FeaturesSection />
      <TestimonialsSection />
      <HowItWorksSection />
      <FAQSection />
      <FooterSection /> 
    </main>
  );
}
    