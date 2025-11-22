"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function ForWhomSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const audiences = [
    {
      image: "/assets/images/neighbors.jpg",
      title: "Gated Community Residents",
      description: "Find trusted service providers, pay estate dues, manage visitors, and connect with neighbors—all from your phone. Perfect for residents who want safe, efficient estate living."
    },
    {
      image: "/assets/images/people.jpg",
      title: "Estate Managers & Associations",
      description: "Manage your community effortlessly: automate collections, communicate with residents, track issues, and generate reports. Reduce manual work and improve resident satisfaction."
    },
    {
      image: "/assets/images/market.jpg",
      title: "Service Providers",
      description: "Reach verified estate customers, build your reputation through reviews, and get paid faster. Access steady customers within estates without expensive marketing."
    }
  ];

  return (
    <section id="for-whom" className="py-32 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          Who MeCabal Is For
        </motion.h2>

        <motion.div 
          className="grid md:grid-cols-3 gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              className="text-center"
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="rounded-3xl h-80 mb-8 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={audience.image} 
                  alt={audience.title} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">{audience.title}</h3>
              <p className="text-xl text-gray-600 leading-relaxed">{audience.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

