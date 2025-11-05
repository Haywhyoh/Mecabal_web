'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/lib/api';

export default function PhoneOTPVerificationForm() {
  const { phoneNumber, setCurrentStep, updateUser, setTokens } = useOnboarding();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-verify when all 4 digits are entered
  useEffect(() => {
    if (otp.join('').length === 4 && !isLoading) {
      const timeout = setTimeout(() => {
        handleVerify();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [otp]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.join('').length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      const response = await apiClient.verifyPhoneOTP(
        phoneNumber!,
        otp.join(''),
        'registration'
      );

      if (response.success && response.data?.verified) {
        const userData = response.data.user;
        const tokens = response.data.tokens;

        if (tokens?.accessToken && tokens?.refreshToken) {
          setTokens(tokens.accessToken, tokens.refreshToken);
        }

        if (userData) {
          updateUser({
            id: userData.id,
            phoneNumber: userData.phoneNumber,
            phoneVerified: userData.phoneVerified,
            isVerified: userData.isVerified,
          });
        }

        setCurrentStep('location-setup');
      } else {
        setError(response.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError(undefined);
    setIsLoading(true);

    try {
      const response = await apiClient.sendPhoneOTP(phoneNumber!, 'registration', 'sms');
      if (response.success) {
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '']);
      } else {
        setError(response.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    if (phone.startsWith('+234')) {
      const number = phone.substring(4);
      return `+234 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 py-12">
      <div className="max-w-md w-full">
        <button
          onClick={() => setCurrentStep('phone-verification')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
          <p className="text-gray-600 mb-2">We sent a code to</p>
          <p className="text-gray-900 font-semibold mb-8">{formatPhone(phoneNumber)}</p>

          <div className="space-y-6">
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </div>
            )}

            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-600">
                  Resend code in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Resend code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

