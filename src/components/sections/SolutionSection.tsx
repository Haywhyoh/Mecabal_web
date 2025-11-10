"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rss, ShoppingCart, CalendarDays, Building2, Heart } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Rss, text: "Neighborhood feed for local updates and recommendations" },
    { icon: ShoppingCart, text: "Trusted marketplace for goods, services, and housing" },
    { icon: CalendarDays, text: "Local events, town halls, and meetups" },
    { icon: Building2, text: "Verified business directory" },
    { icon: Heart, text: "Neighborhood help and volunteering" }
  ];

  return (
    <section className="py-32 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-semibold text-gray-900 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Everything Your Neighborhood Needs in One App.
            </motion.h2>

            <motion.ul 
              className="space-y-6 mb-10"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-4"
                    variants={itemVariants}
                    whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  >
                    <motion.div 
                      className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <p className="text-xl text-gray-700">{feature.text}</p>
                  </motion.li>
                );
              })}
            </motion.ul>

            <motion.button 
              className="px-8 py-4 border-2 border-gray-900 text-gray-900 text-lg rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See How It Works
            </motion.button>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl h-[600px] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.img 
              src="/assets/images/mockup.png" 
              alt="MeCabal Mobile App Mockup" 
              className="w-full h-full object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

