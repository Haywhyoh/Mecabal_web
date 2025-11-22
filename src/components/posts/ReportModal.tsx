'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { ReportReason } from '@/types/social';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => Promise<void>;
  contentType: 'post' | 'comment';
}

const reportReasons: Array<{ value: ReportReason; label: string; description: string }> = [
  { value: 'spam', label: 'Spam', description: 'Repetitive, unwanted, or promotional content' },
  { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or targeted abuse' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Content that violates community guidelines' },
  { value: 'false_information', label: 'False Information', description: 'Misleading or factually incorrect information' },
  { value: 'hate_speech', label: 'Hate Speech', description: 'Content that attacks or discriminates against groups' },
  { value: 'violence', label: 'Violence', description: 'Content that promotes or threatens violence' },
  { value: 'copyright_violation', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
  { value: 'privacy_violation', label: 'Privacy Violation', description: 'Sharing private information without consent' },
  { value: 'other', label: 'Other', description: 'Another reason not listed above' },
];

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  contentType,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (selectedReason === 'other' && !details.trim()) {
      setError('Please provide details about why you are reporting this content');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(selectedReason, details.trim() || undefined);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetails('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Report {contentType}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Help us understand what's wrong with this {contentType}. Your report is anonymous.
          </p>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason for reporting *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => setSelectedReason(reason.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{reason.label}</div>
                    <div className="text-sm text-gray-500">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label
              htmlFor="details"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Additional details {selectedReason === 'other' && '*'}
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              placeholder="Provide any additional information that might help us review this content..."
              required={selectedReason === 'other'}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedReason}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

