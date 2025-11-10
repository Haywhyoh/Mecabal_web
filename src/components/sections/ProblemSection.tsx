"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserX, ShieldAlert, CircleAlert } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: UserX,
      title: "Disconnection",
      description: "Many Nigerians do not know their neighbors, missing out on the warmth of true community."
    },
    {
      icon: ShieldAlert,
      title: "Trust Deficit",
      description: "It is hard to find verified, reliable people or services nearby that you can trust."
    },
    {
      icon: CircleAlert,
      title: "Information Gap",
      description: "Local opportunities and events often go unnoticed, keeping communities apart."
    }
  ];

  return (
    <section className="py-32 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          Why We Built MeCabal
        </motion.h2>

        <motion.div 
          className="grid md:grid-cols-3 gap-12 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div 
                key={index}
                className="text-center"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-10 h-10 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{problem.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">{problem.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

