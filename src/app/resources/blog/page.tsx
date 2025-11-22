"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/resources"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Resources
          </Link>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              MeCabal Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your go-to resource for expert insights, tips, and updates on community management, security solutions, and estate technology innovations.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl text-gray-600 mb-8">
              Our blog is coming soon! Check back for the latest news, events, newsletters, and expert insights.
            </p>
            <Link
              href="/resources"
              className="inline-block px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium"
            >
              Back to Resources
            </Link>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

