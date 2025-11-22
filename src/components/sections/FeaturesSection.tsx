"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, CheckCircle2, CalendarDays, Clock, Store, Heart, Users, AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Map colSpan values to Tailwind classes (must be explicit for Tailwind to detect them)
  const colSpanClasses: Record<number, string> = {
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
  };

  const features = [
    { colSpan: 4, icon: Users, title: "Visitor Management", description: "Digital visitor registration with QR codes, real-time logs, and automated access control for enhanced security.", bg: "from-blue-50 via-blue-100 to-cyan-50", border: "border-blue-200", iconBg: "bg-blue-600", center: true },
    { colSpan: 4, icon: ShieldCheck, title: "Verified Service Providers", description: "Access estate-approved service providers with NIN verification, trade certifications, and community ratings.", bg: "from-green-50 via-green-100 to-emerald-50", border: "border-green-200", iconBg: "bg-green-600", center: true },
    { colSpan: 4, icon: AlertTriangle, title: "Emergency Alerts", description: "Instant notifications for security alerts, safety issues, and community emergencies. Stay informed and safe.", bg: "from-red-50 via-red-100 to-rose-50", border: "border-red-200", iconBg: "bg-red-600", center: true },
    { colSpan: 4, icon: CreditCard, title: "Estate Payments", description: "Pay estate dues, service charges, and utility bills directly from the app. Automated reminders and payment tracking.", bg: "from-purple-50 via-purple-100 to-pink-50", border: "border-purple-200", iconBg: "bg-purple-600", center: true },
    { colSpan: 4, icon: MessageSquare, title: "Community Feed", description: "Share updates, announcements, and stay connected with neighbors in real-time through the community feed.", bg: "from-emerald-50 via-emerald-100 to-teal-50", border: "border-emerald-200", iconBg: "bg-emerald-600", center: true },
    { colSpan: 4, icon: Store, title: "Marketplace", description: "Buy and sell items within your verified community. Trade with confidence knowing you're dealing with verified neighbors.", bg: "from-orange-50 via-orange-100 to-amber-50", border: "border-orange-200", iconBg: "bg-orange-600", center: true }
  ];

  return (
    <section id="features" className="py-32 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Features That Stand Us Out
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Here's a few of the features that make MeCabal the all-in-one estate management solution
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className={`${colSpanClasses[feature.colSpan] || ''} bg-gradient-to-br ${feature.bg} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border ${feature.border} group`}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={feature.center ? "flex flex-col items-center text-center mb-6" : "flex items-start gap-6 mb-6"}>
                  <motion.div 
                    className={`w-16 h-16 ${feature.iconBg} rounded-xl flex items-center justify-center shadow-lg ${feature.center ? 'mb-4' : ''}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className={feature.center ? "" : "flex-1"}>
                    <h3 className={`${feature.colSpan >= 5 ? 'text-3xl' : 'text-2xl'} font-semibold text-gray-900 mb-3`}>{feature.title}</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

