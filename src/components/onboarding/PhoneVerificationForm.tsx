'use client';

import React, { useState } from 'react';
import { Loader2, MessageCircle, Phone } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/lib/api';

export default function PhoneVerificationForm() {
  const { user, setCurrentStep, setPhoneNumber } = useOnboarding();
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Remove 234 prefix if user pastes it (since it's already displayed)
    if (digits.startsWith('234')) {
      return digits.slice(3);
    }

    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    // Validate phone number (10 or 11 digits for Nigerian format)
    const digits = phone.replace(/\D/g, '');
    const phoneDigits = digits.startsWith('234') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits;

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError('Please enter a valid Nigerian phone number (10 or 11 digits)');
      return;
    }

    setIsLoading(true);

    try {
      // Normalize phone number
      const normalizedPhone = phone.startsWith('+234') ? phone : phone.startsWith('0') 
        ? `+234${phone.slice(1)}` 
        : `+234${phone}`;

      const response = await apiClient.sendPhoneOTP(
        normalizedPhone,
        'registration',
        method,
        user.email
      );

      if (response.success) {
        setPhoneNumber(normalizedPhone);
        setCurrentStep('phone-otp-verification');
      } else {
        setError(response.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
          <p className="text-gray-600 mb-8">We'll send a code to keep your account safe</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇳🇬</span>
                <span className="text-gray-700 font-medium">+234</span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="8012345678"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How should we send it?
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMethod('sms')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                    method === 'sms'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    method === 'sms' ? 'border-green-600' : 'border-gray-300'
                  }`}>
                    {method === 'sms' && <div className="w-3 h-3 bg-green-600 rounded-full" />}
                  </div>
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Text message (SMS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('whatsapp')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                    method === 'whatsapp'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    method === 'whatsapp' ? 'border-green-600' : 'border-gray-300'
                  }`}>
                    {method === 'whatsapp' && <div className="w-3 h-3 bg-green-600 rounded-full" />}
                  </div>
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">WhatsApp message</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isPhoneValid || isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Code'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

