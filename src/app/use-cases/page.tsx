"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/sections/FooterSection";
import UseCasesPreviewSection from "@/components/sections/UseCasesPreviewSection";
import { motion } from "framer-motion";

export default function UseCasesPage() {
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
            MeCabal Use Cases
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover how MeCabal transforms estate management and community living across different user types
          </motion.p>
        </div>
      </section>
      <UseCasesPreviewSection />
      <FooterSection />
    </main>
  );
}

