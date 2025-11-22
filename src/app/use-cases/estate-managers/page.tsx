"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { Building2, Users, CreditCard, BarChart3, MessageSquare, AlertTriangle, FileText, Settings } from "lucide-react";

export default function EstateManagersUseCasePage() {
  const features = [
    {
      icon: Users,
      title: "Digital Visitor Management",
      description: "Replace paper logs with digital visitor registration. Generate QR codes, track entry/exit, and maintain comprehensive visitor logs with real-time alerts."
    },
    {
      icon: CreditCard,
      title: "Automated Payment Collection",
      description: "Set bills, automate collection reminders, and track payments. Ensure revenue assurance with automated follow-ups and payment analytics."
    },
    {
      icon: MessageSquare,
      title: "Resident Communication",
      description: "Send announcements, notices, and updates directly to residents. Manage community discussions and respond to resident queries efficiently."
    },
    {
      icon: AlertTriangle,
      title: "Issue Tracking & Resolution",
      description: "Track maintenance requests, security issues, and resident complaints. Assign tasks, monitor progress, and ensure timely resolution."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Generate comprehensive reports on visitor traffic, payment collections, service provider performance, and resident engagement metrics."
    },
    {
      icon: Settings,
      title: "Service Provider Management",
      description: "Verify and manage service providers within your estate. Approve listings, monitor ratings, and ensure quality standards are maintained."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Building2 className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              For Estate Managers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage your community effortlessly: set bills, automate collections, ensure revenue assurance, communicate with residents, track issues, and generate reports—all from your phone.
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
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
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
            Transform Your Estate Management
          </motion.h2>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a 
              href="/contact"
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-full hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Book a Demo
            </a>
            <a 
              href="/pricing"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg rounded-full hover:bg-blue-50 transition-all duration-200 font-medium"
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

