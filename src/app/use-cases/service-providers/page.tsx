"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { Wrench, ShieldCheck, Calendar, CreditCard, Star, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export default function ServiceProvidersUseCasePage() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Estate-Verified Listing",
      description: "Get verified by estate management with NIN and trade certifications. Display your verification badge to build trust with potential customers."
    },
    {
      icon: Calendar,
      title: "Direct Booking System",
      description: "Receive booking requests directly from estate residents. Manage your availability and schedule appointments through the platform."
    },
    {
      icon: CreditCard,
      title: "Faster Payments",
      description: "Get paid faster through MeCabal's payment system. No more chasing payments or dealing with delayed transactions."
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Build your reputation through customer reviews and ratings. Showcase your quality work and attract more customers."
    },
    {
      icon: TrendingUp,
      title: "Steady Customer Base",
      description: "Access a steady stream of customers within estates. No more cold calling or expensive marketing—let customers find you."
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Track your jobs, manage customer relationships, and maintain a history of all your work within estates."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Wrench className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              For Service Providers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reach verified estate customers, build your reputation, and get paid faster with MeCabal's service provider platform.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
            Start Growing Your Business
          </motion.h2>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a 
              href="/onboarding"
              className="px-8 py-4 bg-purple-600 text-white text-lg rounded-full hover:bg-purple-700 transition-all duration-200 font-medium"
            >
              Get Verified
            </a>
            <a 
              href="/pricing"
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 text-lg rounded-full hover:bg-purple-50 transition-all duration-200 font-medium"
            >
              View Pricing
            </a>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

