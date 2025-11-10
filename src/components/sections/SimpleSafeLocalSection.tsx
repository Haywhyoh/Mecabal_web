"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Shield, MapPin } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function SimpleSafeLocalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: Zap,
      title: "Simple",
      description: "Easy setup and intuitive interface. Get started in minutes and connect with your neighborhood effortlessly.",
      bgClass: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderClass: "border border-green-100",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      iconColor: "text-white",
      textColor: "text-gray-900",
      descColor: "text-gray-700"
    },
    {
      icon: Shield,
      title: "Safe",
      description: "Verified neighbors and secure transactions. Your safety and privacy are our top priorities.",
      bgClass: "bg-gradient-to-br from-green-600 to-emerald-700",
      borderClass: "",
      iconBg: "bg-white",
      iconColor: "text-green-600",
      textColor: "text-white",
      descColor: "text-green-50",
      special: true
    },
    {
      icon: MapPin,
      title: "Local",
      description: "Connect with real neighbors nearby. Everything happens within your immediate community.",
      bgClass: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderClass: "border border-green-100",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      iconColor: "text-white",
      textColor: "text-gray-900",
      descColor: "text-gray-700"
    }
  ];

  return (
    <section className="py-32 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          Simple. Safe. Local.
        </motion.h2>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                className={`relative ${card.bgClass} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 ${card.borderClass} ${card.special ? 'transform md:-translate-y-4' : ''}`}
                variants={itemVariants}
                whileHover={{ y: card.special ? -8 : -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex flex-col items-start">
                  <motion.div 
                    className={`w-20 h-20 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-lg mb-6`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className={`w-10 h-10 ${card.iconColor}`} />
                  </motion.div>
                  <h3 className={`text-4xl font-semibold ${card.textColor} mb-4`}>{card.title}</h3>
                  <p className={`text-lg ${card.descColor} leading-relaxed`}>{card.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

