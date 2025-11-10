"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function FAQSection() {
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

