"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { Check, Building2, Wrench, Users } from "lucide-react";

export default function PricingPage() {
  const estateTiers = [
    {
      name: "Basic Estate",
      price: "₦50,000",
      period: "/month",
      target: "<100 units",
      icon: Building2,
      features: [
        "Digital visitor management",
        "Basic payment collection",
        "Emergency alerts",
        "Resident directory",
        "Service provider directory",
        "Community feed",
        "Email support"
      ],
      popular: false,
      color: "green"
    },
    {
      name: "Standard Estate",
      price: "₦100,000",
      period: "/month",
      target: "100-300 units",
      icon: Building2,
      features: [
        "Everything in Basic",
        "Advanced analytics dashboard",
        "Automated payment reminders",
        "Issue tracking system",
        "Custom reporting",
        "Priority support",
        "API access"
      ],
      popular: true,
      color: "blue"
    },
    {
      name: "Premium Estate",
      price: "₦150,000",
      period: "/month",
      target: "300+ units",
      icon: Building2,
      features: [
        "Everything in Standard",
        "Custom features development",
        "Dedicated account manager",
        "On-site training",
        "White-label options",
        "Advanced integrations",
        "24/7 support"
      ],
      popular: false,
      color: "purple"
    }
  ];

  const serviceProviderTiers = [
    {
      name: "Individual Provider",
      price: "₦2,000",
      period: "/month",
      icon: Wrench,
      features: [
        "Estate-verified listing",
        "Unlimited job leads",
        "Direct booking system",
        "Customer reviews & ratings",
        "Payment processing",
        "Basic analytics"
      ],
      color: "green"
    },
    {
      name: "Service Company",
      price: "₦10,000",
      period: "/month",
      icon: Users,
      features: [
        "Everything in Individual",
        "Team member accounts",
        "Advanced analytics",
        "Bulk job management",
        "Priority listing placement",
        "Marketing tools",
        "Dedicated support"
      ],
      color: "blue"
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
            Pricing
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Choose the plan that fits your needs. All plans include core features with flexible options for growth.
          </motion.p>
        </div>
      </section>

      {/* Estate Pricing */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-semibold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Estate Management Plans
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {estateTiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={index}
                  className={`relative bg-white border-2 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 ${
                    tier.popular ? `border-${tier.color}-600 shadow-lg` : 'border-gray-200'
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  {tier.popular && (
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-${tier.color}-600 text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                      Most Popular
                    </div>
                  )}
                  <div className={`w-16 h-16 bg-${tier.color}-100 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 text-${tier.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-6">{tier.target}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600">{tier.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 text-${tier.color}-600 flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/contact"
                    className={`block w-full text-center px-6 py-3 bg-${tier.color}-600 text-white rounded-full hover:bg-${tier.color}-700 transition-all duration-200 font-medium`}
                  >
                    Get Started
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Provider Pricing */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-semibold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Service Provider Plans
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {serviceProviderTiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={index}
                  className={`bg-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className={`w-16 h-16 bg-${tier.color}-100 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 text-${tier.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">{tier.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600">{tier.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 text-${tier.color}-600 flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/onboarding"
                    className={`block w-full text-center px-6 py-3 bg-${tier.color}-600 text-white rounded-full hover:bg-${tier.color}-700 transition-all duration-200 font-medium`}
                  >
                    Get Verified
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl font-semibold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Need a Custom Plan?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Contact us to discuss enterprise solutions and custom pricing for your specific needs.
          </motion.p>
          <motion.a
            href="/contact"
            className="inline-block px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Contact Sales
          </motion.a>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

