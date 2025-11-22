"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Building2, Wrench, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/lib/animations";

interface UseCase {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  image: string;
  features: string[];
}

export default function UseCasesPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const useCases: UseCase[] = [
    {
      title: "For Residents",
      description: "Easily find trusted services, pay bills, manage visitors, and connect with neighbors—all from your phone!",
      icon: Users,
      link: "/use-cases/residents",
      image: "/assets/images/neighbors.jpg",
      features: ["Find verified service providers", "Pay estate dues", "Register visitors", "Community feed"]
    },
    {
      title: "For Estate Managers",
      description: "Manage your community effortlessly: automate collections, communicate with residents, track issues, and generate reports—all from your phone.",
      icon: Building2,
      link: "/use-cases/estate-managers",
      image: "/assets/images/people.jpg",
      features: ["Visitor management", "Automated payments", "Issue tracking", "Analytics dashboard"]
    },
    {
      title: "For Service Providers",
      description: "Reach verified estate customers, build your reputation, and get paid faster with MeCabal's service provider platform.",
      icon: Wrench,
      link: "/use-cases/service-providers",
      image: "/assets/images/business.jpg",
      features: ["Estate-verified listing", "Direct bookings", "Faster payments", "Review system"]
    },
    {
      title: "Other Use Cases",
      description: "Whether it's for events, security, or any scenario requiring community coordination, MeCabal ensures you control access and communication.",
      icon: Sparkles,
      link: "/use-cases/other",
      image: "/assets/images/party.jpg",
      features: ["Event management", "Access control", "Community coordination", "Custom solutions"]
    }
  ];

  return (
    <section id="use-cases" className="py-32 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            MeCabal Use Cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore various use cases of MeCabal across different user types
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.img 
                    src={useCase.image} 
                    alt={useCase.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <motion.div 
                      className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-semibold text-white mb-2">{useCase.title}</h3>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-gray-700 mb-6 leading-relaxed">{useCase.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {useCase.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    href={useCase.link}
                    className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-4 transition-all group"
                  >
                    Explore {useCase.title} Use Case
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

