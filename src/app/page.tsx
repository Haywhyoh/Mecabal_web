"use client";

import { useState, useEffect } from "react";

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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100" />
          {/* Space for Nigeria map or neighborhood silhouettes */}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-gray-900 mb-6">
            Rebuilding Nigerian Communities
          </h1>
          <p className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
            One Neighborhood at a Time
          </p>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-light">
            Discover, connect, and trade safely within your neighborhood. MeCabal is your digital town square for trusted local interactions.
          </p>

          {/* Countdown Timer */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">Launching in</p>
            <div className="flex justify-center gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-green-600">{timeLeft.days}</div>
                <div className="text-sm uppercase tracking-wide text-gray-500 mt-2">Days</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-green-600">{timeLeft.hours}</div>
                <div className="text-sm uppercase tracking-wide text-gray-500 mt-2">Hours</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-green-600">{timeLeft.minutes}</div>
                <div className="text-sm uppercase tracking-wide text-gray-500 mt-2">Minutes</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-semibold text-green-600">{timeLeft.seconds}</div>
                <div className="text-sm uppercase tracking-wide text-gray-500 mt-2">Seconds</div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium min-w-[280px]">
              Create Your Neighborhood
            </button>
            <button className="px-8 py-4 border-2 border-green-600 text-green-600 text-lg rounded-full hover:bg-green-50 transition-all duration-200 font-medium min-w-[280px]">
              Join the Waitlist
            </button>
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
                {/* Icon placeholder */}
                <div className="w-10 h-10 bg-green-600 rounded-full" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Disconnection</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Many Nigerians do not know their neighbors, missing out on the warmth of true community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-10 h-10 bg-green-600 rounded-full" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Trust Deficit</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                It is hard to find verified, reliable people or services nearby that you can trust.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-10 h-10 bg-green-600 rounded-full" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Information Gap</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Local opportunities and events often go unnoticed, keeping communities apart.
              </p>
            </div>
          </div>

          <p className="text-2xl md:text-3xl text-center text-gray-900 mt-20 font-light">
            We believe your neighborhood should feel like home both online and offline.
          </p>
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
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex-shrink-0 mt-1" />
                  <p className="text-xl text-gray-700">Neighborhood feed for local updates and recommendations</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex-shrink-0 mt-1" />
                  <p className="text-xl text-gray-700">Trusted marketplace for goods, services, and housing</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex-shrink-0 mt-1" />
                  <p className="text-xl text-gray-700">Local events, town halls, and meetups</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex-shrink-0 mt-1" />
                  <p className="text-xl text-gray-700">Verified business directory</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex-shrink-0 mt-1" />
                  <p className="text-xl text-gray-700">Neighborhood help and volunteering</p>
                </li>
              </ul>

              <button className="px-8 py-4 border-2 border-gray-900 text-gray-900 text-lg rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200 font-medium">
                See How It Works
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl h-[600px] flex items-center justify-center">
              {/* Mobile app mockup placeholder */}
              <p className="text-gray-400 text-lg">Mobile App Mockup</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-8">
            Simple. Safe. Local.
          </h2>

          <div className="max-w-4xl mx-auto mt-20">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-200" />

              {/* Step 1 */}
              <div className="relative mb-20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold z-10">
                    1
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-semibold text-gray-900 mb-4">Sign Up and Verify</h3>
                  <p className="text-xl text-gray-600">Confirm your identity and location for a trusted community.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative mb-20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold z-10">
                    2
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-semibold text-gray-900 mb-4">Join Your Neighborhood</h3>
                  <p className="text-xl text-gray-600">Connect with real people nearby who share your community.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold z-10">
                    3
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-semibold text-gray-900 mb-4">Discover and Engage</h3>
                  <p className="text-xl text-gray-600">Buy, sell, chat, or help others safely in your neighborhood.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <button className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium">
              Join the Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20">
            Your Neighborhood. Digitally Alive.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-gray-100 transition-all duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Community Feed</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Talk to real neighbors, share updates, and stay connected with your community.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-gray-100 transition-all duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Local Marketplace</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Buy and sell locally with trust, knowing you are dealing with verified neighbors.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-gray-100 transition-all duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Events and Meetups</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Discover what is happening nearby and join local events that matter to you.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-gray-100 transition-all duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Help System</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ask or offer help to neighbors who need it, building stronger bonds.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-gray-100 transition-all duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Business Directory</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Support local enterprises and discover trusted businesses in your area.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-gray-100 transition-all duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Trust and Safety</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Verified users and safe communities ensure peace of mind for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-center text-gray-900 mb-20">
            Who MeCabal Is For
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl h-80 mb-8 flex items-center justify-center">
                {/* Photo placeholder */}
                <p className="text-gray-400 text-lg">Resident Photo</p>
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Residents</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Build trust with your neighbors and stay updated on everything happening around you.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl h-80 mb-8 flex items-center justify-center">
                {/* Photo placeholder */}
                <p className="text-gray-400 text-lg">Business Photo</p>
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Businesses</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Reach verified, local customers who are looking for trusted services nearby.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl h-80 mb-8 flex items-center justify-center">
                {/* Photo placeholder */}
                <p className="text-gray-400 text-lg">Community Photo</p>
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Communities and Estates</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Coordinate events and safety initiatives with ease and transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-8">
            Be Part of the Movement
          </h2>
          <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
            We are launching soon across Lagos, Abuja, Port Harcourt, Ibadan, and Kano. Help us build the first wave of connected communities.
          </p>

          {/* Email Capture Form */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-green-600 transition-all duration-200"
              />
              <button className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium whitespace-nowrap">
                Get Notified
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-green-600 text-white text-lg rounded-full hover:bg-green-700 transition-all duration-200 font-medium min-w-[280px]">
              Create Your Neighborhood Now
            </button>
          </div>
        </div>
      </section>

      {/* Countdown + Social Proof Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-12">
            The Neighborhood Revolution Starts In:
          </h2>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-4 md:gap-8 mb-16">
            <div className="flex flex-col items-center">
              <div className="text-6xl md:text-7xl font-semibold">{timeLeft.days}</div>
              <div className="text-sm uppercase tracking-wide opacity-80 mt-2">Days</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-6xl md:text-7xl font-semibold">{timeLeft.hours}</div>
              <div className="text-sm uppercase tracking-wide opacity-80 mt-2">Hours</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-6xl md:text-7xl font-semibold">{timeLeft.minutes}</div>
              <div className="text-sm uppercase tracking-wide opacity-80 mt-2">Minutes</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-6xl md:text-7xl font-semibold">{timeLeft.seconds}</div>
              <div className="text-sm uppercase tracking-wide opacity-80 mt-2">Seconds</div>
            </div>
          </div>

          <p className="text-2xl mb-8 opacity-90">
            Join 2,000+ Nigerians already on the waitlist!
          </p>

          {/* Social Media Links */}
          <div className="flex justify-center gap-6">
            <a href="#" className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
              {/* Twitter icon placeholder */}
              <div className="w-6 h-6 bg-white rounded-full" />
            </a>
            <a href="#" className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
              {/* Instagram icon placeholder */}
              <div className="w-6 h-6 bg-white rounded-full" />
            </a>
            <a href="#" className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
              {/* LinkedIn icon placeholder */}
              <div className="w-6 h-6 bg-white rounded-full" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-semibold mb-4">MeCabal</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Building Connected Neighborhoods, One Community at a Time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Newsletter</h4>
              <p className="text-gray-400 mb-4">Stay updated with our latest news</p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">2025 MeCabal. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
