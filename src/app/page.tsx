"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserX, ShieldAlert, CircleAlert, Rss, ShoppingCart, CalendarDays, Building2, Heart, Zap, Shield, MapPin, UserCheck, Users, Search, MessageSquare, CheckCircle2, Clock, Store, Phone, Mail } from "lucide-react";
import Header from "../components/Header";

// Reusable animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Problem Section Component
function ProblemSection() {
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

// Solution Section Component
function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Rss, text: "Neighborhood feed for local updates and recommendations" },
    { icon: ShoppingCart, text: "Trusted marketplace for goods, services, and housing" },
    { icon: CalendarDays, text: "Local events, town halls, and meetups" },
    { icon: Building2, text: "Verified business directory" },
    { icon: Heart, text: "Neighborhood help and volunteering" }
  ];

  return (
    <section className="py-32 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-semibold text-gray-900 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Everything Your Neighborhood Needs in One App.
            </motion.h2>

            <motion.ul 
              className="space-y-6 mb-10"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-4"
                    variants={itemVariants}
                    whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  >
                    <motion.div 
                      className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <p className="text-xl text-gray-700">{feature.text}</p>
                  </motion.li>
                );
              })}
            </motion.ul>

            <motion.button 
              className="px-8 py-4 border-2 border-gray-900 text-gray-900 text-lg rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See How It Works
            </motion.button>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl h-[600px] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.img 
              src="/assets/images/mockup.png" 
              alt="MeCabal Mobile App Mockup" 
              className="w-full h-full object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Simple. Safe. Local. Section Component
function SimpleSafeLocalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: Zap,
      title: "Simple",
      description: "Easy setup and intuitive interface. Get started in minutes and connect with your neighborhood effortlessly.",
      bgClass: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderClass: "border border-green-100",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      iconColor: "text-white",
      textColor: "text-gray-900",
      descColor: "text-gray-700"
    },
    {
      icon: Shield,
      title: "Safe",
      description: "Verified neighbors and secure transactions. Your safety and privacy are our top priorities.",
      bgClass: "bg-gradient-to-br from-green-600 to-emerald-700",
      borderClass: "",
      iconBg: "bg-white",
      iconColor: "text-green-600",
      textColor: "text-white",
      descColor: "text-green-50",
      special: true
    },
    {
      icon: MapPin,
      title: "Local",
      description: "Connect with real neighbors nearby. Everything happens within your immediate community.",
      bgClass: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderClass: "border border-green-100",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      iconColor: "text-white",
      textColor: "text-gray-900",
      descColor: "text-gray-700"
    }
  ];

  return (
    <section className="py-32 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          Simple. Safe. Local.
        </motion.h2>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                className={`relative ${card.bgClass} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 ${card.borderClass} ${card.special ? 'transform md:-translate-y-4' : ''}`}
                variants={itemVariants}
                whileHover={{ y: card.special ? -8 : -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex flex-col items-start">
                  <motion.div 
                    className={`w-20 h-20 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-lg mb-6`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className={`w-10 h-10 ${card.iconColor}`} />
                  </motion.div>
                  <h3 className={`text-4xl font-semibold ${card.textColor} mb-4`}>{card.title}</h3>
                  <p className={`text-lg ${card.descColor} leading-relaxed`}>{card.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: 1,
      title: "Sign Up and Verify",
      description: "Confirm your identity and location for a trusted community."
    },
    {
      number: 2,
      title: "Join Your Neighborhood",
      description: "Connect with real people nearby who share your community."
    },
    {
      number: 3,
      title: "Discover and Engage",
      description: "Buy, sell, chat, or help others safely in your neighborhood."
    }
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-semibold text-center text-gray-900 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>
        <motion.div 
          className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {step.number}
              </motion.div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-xl text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.a 
            href="/onboarding" 
            className="inline-block px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join the Waitlist
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { colSpan: 5, icon: MessageSquare, title: "Community Feed", description: "Talk to real neighbors, share updates, and stay connected with your community in real-time.", bg: "from-green-50 via-green-100 to-emerald-50", border: "border-green-200", iconBg: "bg-green-600" },
    { colSpan: 4, icon: CheckCircle2, title: "Verified Neighbors", description: "Buy and sell locally with trust, knowing you are dealing with verified neighbors.", bg: "from-blue-50 via-blue-100 to-cyan-50", border: "border-blue-200", iconBg: "bg-blue-600", center: true },
    { colSpan: 3, icon: CalendarDays, title: "Local Events", description: "Discover what is happening nearby and join local events that matter to you.", bg: "from-purple-50 via-purple-100 to-pink-50", border: "border-purple-200", iconBg: "bg-purple-600", center: true },
    { colSpan: 3, icon: Clock, title: "Instant Account Setup", description: "Get started in minutes with our simple verification process.", bg: "from-orange-50 via-orange-100 to-amber-50", border: "border-orange-200", iconBg: "bg-orange-600", center: true },
    { colSpan: 4, icon: Store, title: "Safe Marketplace", description: "Trade within your verified community with confidence and security.", bg: "from-emerald-50 via-emerald-100 to-teal-50", border: "border-emerald-200", iconBg: "bg-emerald-600" },
    { colSpan: 5, icon: Heart, title: "Neighborhood Support", description: "Ask or offer help to neighbors, building stronger bonds and a more connected community.", bg: "from-rose-50 via-rose-100 to-pink-50", border: "border-rose-200", iconBg: "bg-rose-600" }
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
            The Benefits
          </h2>
          <h3 className="text-4xl md:text-5xl font-semibold text-gray-900">
            That Set Us Apart
          </h3>
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
                className={`md:col-span-${feature.colSpan} bg-gradient-to-br ${feature.bg} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border ${feature.border} group`}
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

// For Whom Section Component
function ForWhomSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const audiences = [
    {
      image: "/assets/images/neighbors.jpg",
      title: "Residents",
      description: "Build trust with your neighbors and stay updated on everything happening around you."
    },
    {
      image: "/assets/images/market.jpg",
      title: "Businesses",
      description: "Reach verified, local customers who are looking for trusted services nearby."
    },
    {
      image: "/assets/images/people.jpg",
      title: "Communities and Estates",
      description: "Coordinate events and safety initiatives with ease and transparency."
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

// FAQ Section Component
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const faqs = [
    [
      { q: "What is MeCabal?", a: "MeCabal is a hyperlocal platform that connects people within their neighborhoods. It is your digital town square for trusted local interactions, allowing you to discover, connect, and trade safely with verified neighbors." },
      { q: "Which locations does MeCabal support?", a: "We are launching across major Nigerian cities including Lagos, Abuja, Port Harcourt, Ibadan, and Kano. More cities will be added as we grow our community network." },
      { q: "How does MeCabal ensure safety?", a: "MeCabal uses identity and location verification for all users. We build trusted communities through verified profiles, secure messaging, and community moderation to ensure safe interactions." },
      { q: "Can I use MeCabal for my local business?", a: "Absolutely! MeCabal offers a verified business directory where you can showcase your services to local customers. Reach neighbors who are actively looking for trusted services in their area." }
    ],
    [
      { q: "Can I sell items locally on the platform?", a: "Yes! Our local marketplace feature allows you to buy and sell items with verified neighbors. All transactions are between local community members, making exchanges convenient and trustworthy." },
      { q: "How much does it cost to use MeCabal?", a: "MeCabal is free to join and use for residents. We focus on building connected communities rather than charging membership fees. Businesses may have premium features available." },
      { q: "When is the launch date?", a: "We are counting down to our official launch! Join our waitlist to be among the first to access MeCabal when we go live in your city." },
      { q: "How do I verify my account?", a: "During signup, you will complete a simple identity and location verification process. This ensures all community members are genuine neighbors, creating a safer environment for everyone." }
    ]
  ];

  return (
    <section id="faq" className="py-32 px-6 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4">
            Frequently Asked <span className="text-green-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about MeCabal
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {faqs.map((column, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {column.map((faq, index) => (
                <motion.details
                  key={index}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.q}</h3>
                    <motion.span 
                      className="text-green-600 text-2xl"
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      +
                    </motion.span>
                  </summary>
                  <motion.p 
                    className="mt-4 text-base text-gray-600 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.a}
                  </motion.p>
                </motion.details>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Footer Section Component
function FooterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <footer className="py-20 px-6 bg-gray-900 text-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Big White/Light Box with App Download */}
        <motion.div 
          className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 mb-16 shadow-xl border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.h2 
              className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Download MeCabal
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Connect with your neighborhood today
            </motion.p>

            {/* App Store Badges */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-10"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <motion.a 
                href="#" 
                className="block transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                aria-label="Download on the App Store"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src="/assets/images/appstore.png" 
                  alt="Download on the App Store" 
                  className="h-14 w-auto object-contain"
                />
              </motion.a>
              <motion.a 
                href="#" 
                className="block transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                aria-label="Get it on Google Play"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src="/assets/images/googleplay.png" 
                  alt="Get it on Google Play" 
                  className="h-14 w-auto object-contain"
                />
              </motion.a>
            </motion.div>

            {/* Ratings */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* App Store Rating */}
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-gray-900">4.8</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.svg 
                        key={i} 
                        className="w-4 h-4 fill-current text-yellow-400" 
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </motion.svg>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">App Store</span>
                  <span className="text-xs text-gray-500">500+ reviews</span>
                </div>
              </motion.div>

              {/* Google Play Rating */}
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-gray-900">4.7</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.svg 
                        key={i} 
                        className="w-4 h-4 fill-current text-yellow-400" 
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 0.9 + i * 0.1, type: "spring" }}
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </motion.svg>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">Google Play</span>
                  <span className="text-xs text-gray-500">300+ reviews</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <h3 className="text-2xl font-semibold mb-4">MeCabal</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Building Connected Neighborhoods, One Community at a Time.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">
                  14 Amusa Alabi, Abesan<br />
                  Lagos, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                <a href="tel:+2348142064474" className="hover:text-white transition-colors">
                  +234 814 206 4474
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
                <a href="mailto:info@mecabal.com" className="hover:text-white transition-colors">
                  info@mecabal.com
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-gray-800 pt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm">© 2025 MeCabal. All rights reserved.</p>

            <motion.div 
              className="flex gap-4"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {[
                { name: "TikTok", path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" },
                { name: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { name: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 hover:text-white text-gray-400"
                  aria-label={social.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d={social.path}/>
                  </svg>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 27,
    hours: 14,
    minutes: 36,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/assets/images/hero1.jpeg)'
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <motion.div 
          className="relative z-10 max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connecting Nigerian Communities
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto mb-12 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover, connect, and trade safely within your neighborhood. MeCabal is your digital town square for trusted local interactions.
          </motion.p>

          {/* Countdown Timer */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-sm uppercase tracking-widest text-white/80 mb-4">Launching in</p>
            <div className="flex justify-center gap-4 md:gap-8">
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hours" },
                { value: timeLeft.minutes, label: "Minutes" },
                { value: timeLeft.seconds, label: "Seconds" }
              ].map((item, index) => (
                <motion.div 
                  key={item.label}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <motion.div 
                    className="text-5xl md:text-6xl font-semibold text-white"
                    key={item.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.value}
                  </motion.div>
                  <div className="text-sm uppercase tracking-wide text-white/80 mt-2">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.a 
              href="/onboarding" 
              className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium min-w-[280px] text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your Neighborhood
            </motion.a>
            <motion.a 
              href="/onboarding" 
              className="px-8 py-4 border-2 border-green-600 text-green-600 text-lg rounded-full hover:bg-green-50 transition-all duration-200 font-medium min-w-[280px] text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join a neighborhood
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Simple. Safe. Local. Section */}
      <SimpleSafeLocalSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Core Features Section */}
      <FeaturesSection />

      {/* For Whom Section */}
      <ForWhomSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}
