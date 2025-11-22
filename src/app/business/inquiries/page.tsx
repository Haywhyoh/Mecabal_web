'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import InquiryCard from '@/components/business/InquiryCard';
import { apiClient } from '@/lib/api';
import type { BusinessProfile, BusinessInquiry } from '@/types/business';
import { InquiryStatus } from '@/types/business';

export default function BusinessInquiriesPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<BusinessInquiry | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const businessResponse = await apiClient.getMyBusiness();
      if (businessResponse.success && businessResponse.data) {
        setBusiness(businessResponse.data);
        const inquiriesResponse = await apiClient.getBusinessInquiries(businessResponse.data.id, {
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        });
        if (inquiriesResponse.success && inquiriesResponse.data) {
          setInquiries(inquiriesResponse.data.inquiries || []);
        }
      } else {
        router.push('/business/register');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (inquiry: BusinessInquiry) => {
    setSelectedInquiry(inquiry);
    setResponseMessage('');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedInquiry || !business || !responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }

    try {
      setResponding(true);
      const response = await apiClient.respondToInquiry(business.id, selectedInquiry.id, {
        message: responseMessage.trim(),
      });
      if (response.success) {
        setShowResponseModal(false);
        setResponseMessage('');
        loadData();
      } else {
        alert(response.error || 'Failed to send response');
      }
    } catch (error: any) {
      console.error('Error sending response:', error);
      alert('Failed to send response. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  const getStatusCounts = () => {
    return {
      all: inquiries.length,
      pending: inquiries.filter((i) => i.status === InquiryStatus.PENDING).length,
      inProgress: inquiries.filter((i) => i.status === InquiryStatus.IN_PROGRESS).length,
      responded: inquiries.filter((i) => i.status === InquiryStatus.RESPONDED).length,
      closed: inquiries.filter((i) => i.status === InquiryStatus.CLOSED).length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Inquiries</h1>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: InquiryStatus.PENDING, label: 'Pending', count: counts.pending },
              { id: InquiryStatus.IN_PROGRESS, label: 'In Progress', count: counts.inProgress },
              { id: InquiryStatus.RESPONDED, label: 'Responded', count: counts.responded },
              { id: InquiryStatus.CLOSED, label: 'Closed', count: counts.closed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Inquiries List */}
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No inquiries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                onRespond={handleRespond}
                onView={(inquiry) => {
                  setSelectedInquiry(inquiry);
                }}
              />
            ))}
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Respond to Inquiry</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Inquiry:</p>
                <p className="text-gray-900">{selectedInquiry.message}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Type your response here..."
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseMessage('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={!responseMessage.trim() || responding}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {responding ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

