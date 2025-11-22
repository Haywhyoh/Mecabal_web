"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Building2, ShieldCheck, Users, CreditCard, AlertTriangle, Calendar, Store, MessageSquare } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface CoreFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  features: Feature[];
  color: string;
  bgGradient: string;
  iconBgClass: string;
  subIconBgClass: string;
}

export default function CoreFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const coreFeatures: CoreFeature[] = [
    {
      title: "Estate Management",
      description: "Complete digital estate operations with visitor management, payments, and emergency alerts",
      icon: Building2,
      color: "blue",
      bgGradient: "from-blue-50 via-blue-100 to-cyan-50",
      iconBgClass: "bg-blue-600",
      subIconBgClass: "bg-blue-600",
      features: [
        { icon: CreditCard, title: "Visitor Management", description: "Digital visitor registration with QR codes and real-time logs" },
        { icon: CreditCard, title: "Estate Payments", description: "Automated dues collection and bill payments" },
        { icon: AlertTriangle, title: "Emergency Alerts", description: "Instant notifications for security and safety issues" }
      ]
    },
    {
      title: "Verified Services",
      description: "Find trusted, estate-verified service providers with ratings and reviews",
      icon: ShieldCheck,
      color: "green",
      bgGradient: "from-green-50 via-green-100 to-emerald-50",
      iconBgClass: "bg-green-600",
      subIconBgClass: "bg-green-600",
      features: [
        { icon: ShieldCheck, title: "Verified Directory", description: "Estate-approved providers with NIN and trade certifications" },
        { icon: Calendar, title: "Service Booking", description: "Book appointments directly through the platform" },
        { icon: MessageSquare, title: "Reviews & Ratings", description: "Community-driven quality assurance" }
      ]
    },
    {
      title: "Community",
      description: "Connect with neighbors through feed, marketplace, and events",
      icon: Users,
      color: "purple",
      bgGradient: "from-purple-50 via-purple-100 to-pink-50",
      iconBgClass: "bg-purple-600",
      subIconBgClass: "bg-purple-600",
      features: [
        { icon: MessageSquare, title: "Community Feed", description: "Share updates and stay connected with neighbors" },
        { icon: Store, title: "Marketplace", description: "Buy and sell within your verified community" },
        { icon: Calendar, title: "Local Events", description: "Discover and join neighborhood events" }
      ]
    }
  ];

  return (
    <section id="core-features" className="py-32 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Our Core Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MeCabal offerings span across three cardinals: Estate Management, Verified Services, and Community
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className={`bg-gradient-to-br ${feature.bgGradient} rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100`}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className={`w-16 h-16 ${feature.iconBgClass} rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">{feature.description}</p>
                
                <div className="space-y-4">
                  {feature.features.map((subFeature, subIndex) => {
                    const SubIcon = subFeature.icon;
                    return (
                      <motion.div
                        key={subIndex}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.3 + (index * 0.1) + (subIndex * 0.05) }}
                      >
                        <div className={`w-8 h-8 ${feature.subIconBgClass} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <SubIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{subFeature.title}</h4>
                          <p className="text-sm text-gray-600">{subFeature.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

