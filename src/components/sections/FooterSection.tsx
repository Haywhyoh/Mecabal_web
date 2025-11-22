"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function FooterSection() {
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
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16"
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
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Use Cases</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="/use-cases" className="hover:text-white transition-colors">All Use Cases</a></li>
              <li><a href="/use-cases/residents" className="hover:text-white transition-colors">For Residents</a></li>
              <li><a href="/use-cases/estate-managers" className="hover:text-white transition-colors">For Estate Managers</a></li>
              <li><a href="/use-cases/service-providers" className="hover:text-white transition-colors">For Service Providers</a></li>
              <li><a href="/use-cases/other" className="hover:text-white transition-colors">Other Use Cases</a></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Resources</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="/resources/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/resources/videos" className="hover:text-white transition-colors">Videos</a></li>
              <li><a href="/resources/knowledgebase" className="hover:text-white transition-colors">Knowledge Base</a></li>
              <li><a href="/resources" className="hover:text-white transition-colors">Links</a></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Features</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#core-features" className="hover:text-white transition-colors">Estate Management</a></li>
              <li><a href="#core-features" className="hover:text-white transition-colors">Verified Services</a></li>
              <li><a href="#core-features" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          className="border-t border-gray-800 pt-8 mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="grid md:grid-cols-3 gap-8 text-gray-400 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                14 Amusa Alabi, Abesan<br />
                Lagos, Nigeria
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-600 shrink-0" />
              <a href="tel:+2348142064474" className="hover:text-white transition-colors">
                +234 814 206 4474
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-green-600 shrink-0" />
              <a href="mailto:support@mecabal.com" className="hover:text-white transition-colors">
                support@mecabal.com
              </a>
            </div>
          </div>
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
                { name: "TikTok", path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z", url: "https://www.tiktok.com/@mecabal?_r=1&_t=ZS-91IwrDyNvdI" },
                { name: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", url: "https://x.com/themecabal?s=21" },
                { name: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", url: "#" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
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

