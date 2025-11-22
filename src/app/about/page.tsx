"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { Target, Users, Zap, Heart } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Mission",
      description: "To rebuild neighbourhood trust and enable efficient community coordination by providing verified service providers, estate management tools, and neighbour-to-neighbour connections within Nigeria's urban communities."
    },
    {
      icon: Zap,
      title: "Vision",
      description: "Transform Nigerian gated estates and organised communities into connected, trusted, and thriving digital neighbourhoods, starting with estate management tools and expanding to comprehensive community services."
    },
    {
      icon: Heart,
      title: "Values",
      description: "We believe in building trust, fostering connections, and creating value for every member of the community—residents, estate managers, and service providers alike."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About MeCabal
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Nigeria's Hyperlocal Community Platform
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="prose prose-lg max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              MeCabal is a hyperlocal community platform that transforms Nigerian gated estates and organised communities into connected, trusted, and thriving digital neighbourhoods.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We started with a simple observation: Nigerian communities are increasingly fragmented, with services stopping at subdivision gates. Local artisans frequently cut corners, leading to a preference for foreign providers and a loss of trust in local services.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              MeCabal addresses these challenges by providing estate management tools, verified service provider directories, and community engagement features—all designed to rebuild trust and enable efficient coordination within Nigerian urban communities.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-semibold text-center text-gray-900 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Mission, Vision & Values
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl font-semibold text-gray-900 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Join Us in Building Connected Communities
          </motion.h2>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a 
              href="/onboarding"
              className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium"
            >
              Get Started
            </a>
            <a 
              href="/contact"
              className="px-8 py-4 border-2 border-green-600 text-green-600 text-lg rounded-full hover:bg-green-50 transition-all duration-200 font-medium"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

