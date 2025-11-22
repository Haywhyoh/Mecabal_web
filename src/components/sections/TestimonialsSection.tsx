"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

interface Testimonial {
  name: string;
  role: string;
  estate?: string;
  image?: string;
  quote: string;
  videoUrl?: string;
}

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      name: "Chief Adebayo",
      role: "Estate Facility Manager",
      estate: "Lekki Gardens Estate",
      quote: "MeCabal has transformed how we manage our estate. Visitor management is now seamless, and residents can easily find trusted service providers. The emergency alert system has been a game-changer for our security operations.",
      image: "/assets/images/people.jpg"
    },
    {
      name: "Mrs. Funke Okonkwo",
      role: "Resident",
      estate: "Victoria Island Estate",
      quote: "I no longer have to deal with unreliable artisans. With MeCabal, I can find estate-verified service providers, pay my estate dues, and stay connected with my neighbors—all from one app. It's simplified my estate living completely.",
      image: "/assets/images/neighbors.jpg"
    },
    {
      name: "Emeka Nwankwo",
      role: "Electrician",
      estate: "Verified Service Provider",
      quote: "MeCabal has given me steady customers within estates. The verification badge builds trust, and I get paid faster through the platform. It's changed my business for the better.",
      image: "/assets/images/business.jpg"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-32 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            How MeCabal Simplified Estate Living
          </h2>
          <p className="text-xl text-gray-600">
            Real stories from residents, estate managers, and service providers
          </p>
        </motion.div>

        <motion.div 
          className="relative"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-5xl mx-auto">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {testimonials[currentIndex].image && (
                  <motion.div 
                    className="w-full md:w-64 h-64 rounded-2xl overflow-hidden flex-shrink-0"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <img 
                      src={testimonials[currentIndex].image} 
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
                
                <div className="flex-1">
                  <Quote className="w-12 h-12 text-green-600 mb-4" />
                  <motion.blockquote 
                    className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    "{testimonials[currentIndex].quote}"
                  </motion.blockquote>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="font-semibold text-gray-900 text-lg">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-gray-600">
                      {testimonials[currentIndex].role}
                      {testimonials[currentIndex].estate && ` • ${testimonials[currentIndex].estate}`}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-green-600 w-8' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6 }}
        >
          <a 
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium"
          >
            Get Started
          </a>
          <a 
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-green-600 text-green-600 text-lg rounded-full hover:bg-green-50 transition-all duration-200 font-medium ml-4"
          >
            Watch All Testimonials
          </a>
        </motion.div>
      </div>
    </section>
  );
}

