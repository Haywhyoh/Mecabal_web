"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  description?: string;
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [counters, setCounters] = useState<Record<number, number>>({});

  const stats: Stat[] = [
    { value: 100, suffix: "+", label: "Active Estates", description: "Gated communities using MeCabal" },
    { value: 10000, suffix: "+", label: "Verified Service Providers", description: "Trusted local artisans and businesses" },
    { value: 50000, suffix: "+", label: "Monthly Active Users", description: "Residents connecting daily" },
    { value: 100, suffix: "M", label: "Transactions Facilitated", description: "₦100M in community transactions" }
  ];

  useEffect(() => {
    if (isInView) {
      stats.forEach((stat, index) => {
        const duration = 2000;
        const steps = 60;
        const increment = stat.value / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.value) {
            setCounters(prev => ({ ...prev, [index]: stat.value }));
            clearInterval(timer);
          } else {
            setCounters(prev => ({ ...prev, [index]: Math.floor(current) }));
          }
        }, duration / steps);
      });
    }
  }, [isInView]);

  const formatNumber = (num: number, suffix: string) => {
    if (suffix === "M") {
      return `₦${num}${suffix}`;
    }
    return `${num.toLocaleString()}${suffix}`;
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            MeCabal by the Numbers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforming Nigerian communities, one estate at a time
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <motion.div 
                className="text-5xl md:text-6xl font-bold text-green-600 mb-3"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              >
                {formatNumber(counters[index] || 0, stat.suffix)}
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</h3>
              {stat.description && (
                <p className="text-sm text-gray-600">{stat.description}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

