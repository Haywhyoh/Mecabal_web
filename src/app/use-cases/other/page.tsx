"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Shield, Users, Settings, Zap } from "lucide-react";

export default function OtherUseCasesPage() {
  const useCases = [
    {
      icon: Calendar,
      title: "Event Management",
      description: "Manage access for community events, parties, and gatherings. Generate event-specific access codes and track attendance."
    },
    {
      icon: Shield,
      title: "Access Control",
      description: "Control who enters your community or facility. Perfect for gated communities, offices, or any secured location."
    },
    {
      icon: Users,
      title: "Community Coordination",
      description: "Coordinate neighborhood initiatives, safety programs, and community projects with organized communication and task management."
    },
    {
      icon: Settings,
      title: "Custom Solutions",
      description: "Tailored solutions for specific community needs. Whether it's a housing estate, business complex, or special facility."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              Other Use Cases
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether it's for events, security, or any scenario requiring community coordination, MeCabal ensures you control access and communication.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl font-semibold text-gray-900 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Need a Custom Solution?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Contact us to discuss how MeCabal can be tailored to your specific community needs.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <a 
              href="/contact"
              className="px-8 py-4 bg-orange-600 text-white text-lg rounded-full hover:bg-orange-700 transition-all duration-200 font-medium"
            >
              Contact Us
            </a>
            <a 
              href="/contact"
              className="px-8 py-4 border-2 border-orange-600 text-orange-600 text-lg rounded-full hover:bg-orange-50 transition-all duration-200 font-medium"
            >
              Book a Demo
            </a>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

