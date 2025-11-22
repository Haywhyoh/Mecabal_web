'use client';

import React from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { BusinessInquiry } from '@/types/business';
import { InquiryStatus } from '@/types/business';

interface InquiryCardProps {
  inquiry: BusinessInquiry;
  onRespond?: (inquiry: BusinessInquiry) => void;
  onView?: (inquiry: BusinessInquiry) => void;
}

export default function InquiryCard({ inquiry, onRespond, onView }: InquiryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case InquiryStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case InquiryStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case InquiryStatus.RESPONDED:
        return 'bg-green-100 text-green-800';
      case InquiryStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case InquiryStatus.PENDING:
        return <Clock className="w-4 h-4" />;
      case InquiryStatus.IN_PROGRESS:
        return <AlertCircle className="w-4 h-4" />;
      case InquiryStatus.RESPONDED:
        return <CheckCircle className="w-4 h-4" />;
      case InquiryStatus.CLOSED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(inquiry)}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Customer Inquiry</p>
            <p className="text-sm text-gray-500">{formatDate(inquiry.createdAt)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(inquiry.status)}`}>
          {getStatusIcon(inquiry.status)}
          <span className="capitalize">{inquiry.status.replace('-', ' ')}</span>
        </span>
      </div>

      {inquiry.subject && (
        <h3 className="font-semibold text-gray-900 mb-2">{inquiry.subject}</h3>
      )}

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{inquiry.message}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {inquiry.phone && <span>📞 {inquiry.phone}</span>}
          {inquiry.email && <span>✉️ {inquiry.email}</span>}
        </div>
        {inquiry.status === InquiryStatus.PENDING && onRespond && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRespond(inquiry);
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Respond
          </button>
        )}
      </div>
    </div>
  );
}

