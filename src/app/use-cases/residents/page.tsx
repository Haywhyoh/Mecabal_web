"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { Users, ShieldCheck, CreditCard, Calendar, MessageSquare, Store, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ResidentsUseCasePage() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Find Verified Service Providers",
      description: "Access estate-approved service providers with NIN verification, trade certifications, and community ratings. No more unreliable artisans."
    },
    {
      icon: CreditCard,
      title: "Pay Estate Dues & Bills",
      description: "Pay your estate dues, service charges, and utility bills directly from the app. Download statements and track payment history."
    },
    {
      icon: Calendar,
      title: "Register Visitors",
      description: "Pre-register visitors and generate QR codes for seamless gate access. Track visitor history and manage access permissions."
    },
    {
      icon: MessageSquare,
      title: "Community Feed",
      description: "Stay updated on neighborhood announcements, events, and discussions. Connect with neighbors in real-time."
    },
    {
      icon: Store,
      title: "Local Marketplace",
      description: "Buy and sell items within your verified community. Trade with confidence knowing you're dealing with verified neighbors."
    },
    {
      icon: AlertTriangle,
      title: "Emergency Alerts",
      description: "Receive instant notifications for security alerts, safety issues, and community emergencies. Stay informed and safe."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              For Residents
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Easily generate access codes for guests, pay bills, find trusted services, and stay connected with your community—all from your phone!
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
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-green-600" />
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
            Get Started Today
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
              Join Your Estate
            </a>
            <a 
              href="/contact"
              className="px-8 py-4 border-2 border-green-600 text-green-600 text-lg rounded-full hover:bg-green-50 transition-all duration-200 font-medium"
            >
              Watch Video
            </a>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

