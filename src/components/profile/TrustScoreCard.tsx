'use client';

import React from 'react';
import { Shield, TrendingUp } from 'lucide-react';

interface TrustScoreCardProps {
  trustScore?: number;
  verificationLevel?: string;
  compact?: boolean;
}

export default function TrustScoreCard({ trustScore = 0, verificationLevel, compact = false }: TrustScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Trust Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${getScoreColor(trustScore)}`}>
              {trustScore}
            </span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${getScoreBgColor(trustScore)}`}>
            <Shield className={`w-6 h-6 ${getScoreColor(trustScore)}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Trust Score</h3>
            {verificationLevel && (
              <p className="text-sm text-gray-500">{verificationLevel}</p>
            )}
          </div>
        </div>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-4xl font-bold ${getScoreColor(trustScore)}`}>
            {trustScore}
          </span>
          <span className="text-gray-500">/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getScoreColor(trustScore).replace('text-', 'bg-')}`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Your trust score is based on profile completion, verification status, and community engagement.
      </p>
    </div>
  );
}


