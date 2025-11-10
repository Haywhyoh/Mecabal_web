"use client";

import { useState, useEffect } from "react";
import { UserX, ShieldAlert, CircleAlert, Rss, ShoppingCart, CalendarDays, Building2, Heart, Zap, Shield, MapPin, UserCheck, Users, Search, MessageSquare, CheckCircle2, Clock, Store, Phone, Mail } from "lucide-react";
import Header from "../components/Header";

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

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white mb-6">
            Connecting Nigerian Communities
          </h1>
          {/* <p className="text-2xl md:text-3xl font-light text-white mb-4">
            One Neighborhood at a Time
          </p> */}
          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto mb-12 font-light">
            Discover, connect, and trade safely within your neighborhood. MeCabal is your digital town square for trusted local interactions.
          </p>

          {/* Countdown Timer */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-widest text-white/80 mb-4">Launching in</p>
            <div className="flex justify-center gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-white">{timeLeft.days}</div>
                <div className="text-sm uppercase tracking-wide text-white/80 mt-2">Days</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-white">{timeLeft.hours}</div>
                <div className="text-sm uppercase tracking-wide text-white/80 mt-2">Hours</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-white">{timeLeft.minutes}</div>
                <div className="text-sm uppercase tracking-wide text-white/80 mt-2">Minutes</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-white">{timeLeft.seconds}</div>
                <div className="text-sm uppercase tracking-wide text-white/80 mt-2">Seconds</div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/onboarding" className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium min-w-[280px] text-center">
              Create Your Neighborhood
            </a>
            <a href="/onboarding" className="px-8 py-4 border-2 border-green-600 text-green-600 text-lg rounded-full hover:bg-green-50 transition-all duration-200 font-medium min-w-[280px] text-center">
              Join a neighborhood
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20">
            Why We Built MeCabal
          </h2>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <UserX className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Disconnection</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Many Nigerians do not know their neighbors, missing out on the warmth of true community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Trust Deficit</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                It is hard to find verified, reliable people or services nearby that you can trust.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CircleAlert className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Information Gap</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Local opportunities and events often go unnoticed, keeping communities apart.
              </p>
            </div>
          </div>

        
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-8">
                Everything Your Neighborhood Needs in One App.
              </h2>

              <ul className="space-y-6 mb-10">
                <li className="flex items-start gap-4 align-middle">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Rss className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl text-gray-700">Neighborhood feed for local updates and recommendations</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 ">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl text-gray-700">Trusted marketplace for goods, services, and housing</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl text-gray-700">Local events, town halls, and meetups</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl text-gray-700">Verified business directory</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl text-gray-700">Neighborhood help and volunteering</p>
                </li>
              </ul>

              <button className="px-8 py-4 border-2 border-gray-900 text-gray-900 text-lg rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200 font-medium">
                See How It Works
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl h-[600px] flex items-center justify-center overflow-hidden">
              <img 
                src="/assets/images/mockup.png" 
                alt="MeCabal Mobile App Mockup" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Simple. Safe. Local. Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20">
            Simple. Safe. Local.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Simple */}
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-green-100 group">
              <div className="flex flex-col items-start">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-4xl font-semibold text-gray-900 mb-4">Simple</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Easy setup and intuitive interface. Get started in minutes and connect with your neighborhood effortlessly.
                </p>
              </div>
            </div>

            {/* Safe */}
            <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 text-white transform md:-translate-y-4 group">
              <div className="flex flex-col items-start">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-4xl font-semibold mb-4">Safe</h3>
                <p className="text-lg text-green-50 leading-relaxed">
                  Verified neighbors and secure transactions. Your safety and privacy are our top priorities.
                </p>
              </div>
            </div>

            {/* Local */}
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-green-100 group">
              <div className="flex flex-col items-start">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-4xl font-semibold text-gray-900 mb-4">Local</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Connect with real neighbors nearby. Everything happens within your immediate community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                1
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Sign Up and Verify</h3>
              <p className="text-xl text-gray-600 leading-relaxed">Confirm your identity and location for a trusted community.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                2
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Join Your Neighborhood</h3>
              <p className="text-xl text-gray-600 leading-relaxed">Connect with real people nearby who share your community.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                3
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Discover and Engage</h3>
              <p className="text-xl text-gray-600 leading-relaxed">Buy, sell, chat, or help others safely in your neighborhood.</p>
            </div>
          </div>

          <div className="text-center mt-16">
            <a href="/onboarding" className="inline-block px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium">
              Join the Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              The Benefits
            </h2>
            <h3 className="text-4xl md:text-5xl font-semibold text-gray-900">
              That Set Us Apart
            </h3>
          </div>

          {/* Modern Grid Layout - 6 cards with masonry pattern */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Row 1 */}
            {/* Feature 1 - Community Feed - Larger card */}
            <div className="md:col-span-5 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-green-200 group">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-semibold text-gray-900 mb-3">Community Feed</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Talk to real neighbors, share updates, and stay connected with your community in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 - Verified Neighbors */}
            <div className="md:col-span-4 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-blue-200 group">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Verified Neighbors</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Buy and sell locally with trust, knowing you are dealing with verified neighbors.
                </p>
              </div>
            </div>

            {/* Feature 3 - Local Events */}
            <div className="md:col-span-3 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-purple-200 group">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg mb-4">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Local Events</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Discover what is happening nearby and join local events that matter to you.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            {/* Feature 4 - Instant Account Setup */}
            <div className="md:col-span-3 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-orange-200 group">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Instant Account Setup</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Get started in minutes with our simple verification process.
                </p>
              </div>
            </div>

            {/* Feature 5 - Safe Marketplace */}
            <div className="md:col-span-4 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-emerald-200 group">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Safe Marketplace</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Trade within your verified community with confidence and security.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 6 - Neighborhood Support - Larger card */}
            <div className="md:col-span-5 bg-gradient-to-br from-rose-50 via-rose-100 to-pink-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-rose-200 group">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-semibold text-gray-900 mb-3">Neighborhood Support</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Ask or offer help to neighbors, building stronger bonds and a more connected community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section id="for-whom" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20">
            Who MeCabal Is For
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="rounded-3xl h-80 mb-8 overflow-hidden">
                <img 
                  src="/assets/images/neighbors.jpg" 
                  alt="Residents" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Residents</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Build trust with your neighbors and stay updated on everything happening around you.
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-3xl h-80 mb-8 overflow-hidden">
                <img 
                  src="/assets/images/market.jpg" 
                  alt="Businesses" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Businesses</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Reach verified, local customers who are looking for trusted services nearby.
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-3xl h-80 mb-8 overflow-hidden">
                <img 
                  src="/assets/images/people.jpg" 
                  alt="Communities and Estates" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Communities and Estates</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Coordinate events and safety initiatives with ease and transparency.
              </p>
            </div>
          </div>
        </div>
      </section>
   
      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4">
              Frequently Asked <span className="text-green-600">Questions</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about MeCabal
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">What is MeCabal?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  MeCabal is a hyperlocal platform that connects people within their neighborhoods. It is your digital town square for trusted local interactions, allowing you to discover, connect, and trade safely with verified neighbors.
                </p>
              </details>

              {/* FAQ Item 2 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">Which locations does MeCabal support?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  We are launching across major Nigerian cities including Lagos, Abuja, Port Harcourt, Ibadan, and Kano. More cities will be added as we grow our community network.
                </p>
              </details>

              {/* FAQ Item 3 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">How does MeCabal ensure safety?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  MeCabal uses identity and location verification for all users. We build trusted communities through verified profiles, secure messaging, and community moderation to ensure safe interactions.
                </p>
              </details>

              {/* FAQ Item 4 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">Can I use MeCabal for my local business?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Absolutely! MeCabal offers a verified business directory where you can showcase your services to local customers. Reach neighbors who are actively looking for trusted services in their area.
                </p>
              </details>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* FAQ Item 5 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">Can I sell items locally on the platform?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Yes! Our local marketplace feature allows you to buy and sell items with verified neighbors. All transactions are between local community members, making exchanges convenient and trustworthy.
                </p>
              </details>

              {/* FAQ Item 6 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">How much does it cost to use MeCabal?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  MeCabal is free to join and use for residents. We focus on building connected communities rather than charging membership fees. Businesses may have premium features available.
                </p>
              </details>

              {/* FAQ Item 7 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">When is the launch date?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  We are counting down to our official launch! Join our waitlist to be among the first to access MeCabal when we go live in your city.
                </p>
              </details>

              {/* FAQ Item 8 */}
              <details className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900">How do I verify my account?</h3>
                  <span className="text-green-600 text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  During signup, you will complete a simple identity and location verification process. This ensures all community members are genuine neighbors, creating a safer environment for everyone.
                </p>
              </details>
            </div>
          </div>

          
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Big White/Light Box with App Download */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 mb-16 shadow-xl border border-gray-100">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
                Download MeCabal
              </h2>
              <p className="text-xl text-gray-600 mb-10">
                Connect with your neighborhood today
              </p>

              {/* App Store Badges */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-10">
                <a 
                  href="#" 
                  className="block transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                  aria-label="Download on the App Store"
                >
                  <img 
                    src="/assets/images/appstore.png" 
                    alt="Download on the App Store" 
                    className="h-14 w-auto object-contain"
                  />
                </a>
                <a 
                  href="#" 
                  className="block transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                  aria-label="Get it on Google Play"
                >
                  <img 
                    src="/assets/images/googleplay.png" 
                    alt="Get it on Google Play" 
                    className="h-14 w-auto object-contain"
                  />
                </a>
              </div>

              {/* Ratings */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-gray-600">
                {/* App Store Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">4.8</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">App Store</span>
                    <span className="text-xs text-gray-500">500+ reviews</span>
                  </div>
                </div>

                {/* Google Play Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">4.7</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">Google Play</span>
                    <span className="text-xs text-gray-500">300+ reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-semibold mb-4">MeCabal</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Building Connected Neighborhoods, One Community at a Time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Support</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">
                    123 Main Street, Victoria Island<br />
                    Lagos, Nigeria
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <a href="tel:+2341234567890" className="hover:text-white transition-colors">
                    +234 123 456 7890
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <a href="mailto:info@mecabal.com" className="hover:text-white transition-colors">
                    info@mecabal.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-400 text-sm">© 2025 MeCabal. All rights reserved.</p>

              <div className="flex gap-4">
                {/* TikTok */}
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 hover:text-white text-gray-400"
                  aria-label="TikTok"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>

                {/* Twitter/X */}
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 hover:text-white text-gray-400"
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 hover:text-white text-gray-400"
                  aria-label="YouTube"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
