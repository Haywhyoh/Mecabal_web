"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 27,
    hours: 14,
    minutes: 36,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/assets/images/hero1.jpeg)'
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <motion.div 
        className="relative z-10 max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Modern Estates across Nigeria use MeCabal
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto mb-12 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Residents of gated estates and communities can easily manage visitors, find trusted service providers, pay bills, and connect with neighbors—all from their phones in seconds.
        </motion.p>

        {/* Stats Preview */}
        <motion.div 
          className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-1">10k+</div>
            <div className="text-sm uppercase tracking-wide text-white/80">Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-1">4.8</div>
            <div className="text-sm uppercase tracking-wide text-white/80">Rating</div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.a 
            href="/onboarding" 
            className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium min-w-[200px] text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.a>
          <motion.a 
            href="/contact" 
            className="px-8 py-4 border-2 border-white text-white text-lg rounded-full hover:bg-white/10 transition-all duration-200 font-medium min-w-[200px] text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book a Demo
          </motion.a>
        </motion.div>

        {/* App Store Badges */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <a 
            href="#" 
            className="block transition-transform duration-200 hover:scale-105"
            aria-label="Download on the App Store"
          >
            <img 
              src="/assets/images/appstore.png" 
              alt="Download on the App Store" 
              className="h-12 w-auto object-contain"
            />
          </a>
          <a 
            href="#" 
            className="block transition-transform duration-200 hover:scale-105"
            aria-label="Get it on Google Play"
          >
            <img 
              src="/assets/images/googleplay.png" 
              alt="Get it on Google Play" 
              className="h-12 w-auto object-contain"
            />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

