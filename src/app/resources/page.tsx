"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { BookOpen, Video, FileText, Link as LinkIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  const resources = [
    {
      icon: BookOpen,
      title: "Blog",
      description: "Your go-to resource for expert insights, tips, and updates on community management, security solutions, and estate technology innovations.",
      link: "/resources/blog",
      color: "green"
    },
    {
      icon: Video,
      title: "Videos",
      description: "Watch tutorials, product reviews, and informative videos on MeCabal's features. Subscribe for regular updates and in-depth content.",
      link: "/resources/videos",
      color: "blue"
    },
    {
      icon: FileText,
      title: "Knowledge Base",
      description: "Explore our comprehensive knowledge base for answers to your questions. Find detailed guides, FAQs, and support resources.",
      link: "/resources/knowledgebase",
      color: "purple"
    },
    {
      icon: LinkIcon,
      title: "Links",
      description: "Discover all MeCabal resources and tools in one place. Access helpful links for quick navigation and enhanced user experience.",
      link: "#",
      color: "orange"
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
            Resources
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Everything you need to make the most of MeCabal
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <motion.div
                  key={index}
                  className={`bg-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 group`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className={`w-16 h-16 bg-${resource.color}-100 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 text-${resource.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{resource.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{resource.description}</p>
                  <Link
                    href={resource.link}
                    className={`inline-flex items-center gap-2 text-${resource.color}-600 font-semibold hover:gap-4 transition-all`}
                  >
                    Visit {resource.title}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

