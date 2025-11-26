'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QrCode, Download, Share2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
// Note: Install qrcode.react package: npm install qrcode.react
// import QRCode from 'qrcode.react';

export default function GenerateVisitorPassPage() {
  const params = useParams();
  const visitorId = params.id as string;
  const [pass, setPass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [estateId, setEstateId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    hostId: '',
    expectedArrival: '',
    expiresAt: '',
    guestCount: 0,
    purpose: '',
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estateId) return;

    try {
      setLoading(true);
      const response = await apiClient.generateVisitorPass(estateId, {
        visitorId,
        hostId: formData.hostId,
        expectedArrival: new Date(formData.expectedArrival).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        guestCount: formData.guestCount,
        purpose: formData.purpose,
      });

      if (response.success && response.data) {
        setPass(response.data);
      }
    } catch (error) {
      console.error('Error generating pass:', error);
      alert('Failed to generate visitor pass. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pass) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Visitor Pass</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="border-2 border-gray-300 p-4 rounded-lg bg-white">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-600 mb-2">QR Code</p>
                <div className="bg-gray-100 p-8 rounded">
                  <p className="text-xs font-mono break-all max-w-xs">{pass.qrCode}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Scan this code at the gate</p>
              </div>
              {/* TODO: Install qrcode.react and uncomment:
              <QRCode value={pass.qrCode} size={256} />
              */}
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-600">Pass ID</p>
            <p className="text-lg font-mono">{pass.id}</p>
            <p className="text-sm text-gray-600 mt-4">Valid Until</p>
            <p className="text-lg">{new Date(pass.expiresAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                // Download QR code as text file
                const blob = new Blob([pass.qrCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `visitor-pass-${pass.id}.txt`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Visitor Pass',
                    text: `Visitor pass for ${pass.visitor?.fullName}`,
                    url: window.location.href,
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Visitor Pass</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host ID *
            </label>
            <input
              type="text"
              required
              value={formData.hostId}
              onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter host user ID"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Arrival *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.expectedArrival}
                onChange={(e) => setFormData({ ...formData, expectedArrival: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Count
            </label>
            <input
              type="number"
              min="0"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </form>
      </div>
    </div>
  );
}

