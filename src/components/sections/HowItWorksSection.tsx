"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: 1,
      title: "Sign Up and Verify",
      description: "Confirm your identity and location for a trusted community."
    },
    {
      number: 2,
      title: "Join Your Neighborhood",
      description: "Connect with real people nearby who share your community."
    },
    {
      number: 3,
      title: "Discover and Engage",
      description: "Buy, sell, chat, or help others safely in your neighborhood."
    }
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-semibold text-center text-gray-900 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>
        <motion.div 
          className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {step.number}
              </motion.div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-xl text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.a 
            href="/onboarding" 
            className="inline-block px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join the Waitlist
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

