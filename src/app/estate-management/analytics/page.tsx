'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [frequentVisitors, setFrequentVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estateId, setEstateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!estateId) return;
      try {
        setLoading(true);
        const [statsRes, peakHoursRes, frequentRes] = await Promise.all([
          apiClient.getVisitorAnalytics(estateId),
          apiClient.getPeakHours(estateId),
          apiClient.getFrequentVisitors(estateId, 10),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (peakHoursRes.success) setPeakHours(peakHoursRes.data || []);
        if (frequentRes.success) setFrequentVisitors(frequentRes.data || []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [estateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Visitor Analytics</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visitors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.today || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.thisWeek || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.thisMonth || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Peak Hours */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Peak Hours</h2>
        <div className="space-y-2">
          {peakHours.length > 0 ? (
            peakHours.map((hour, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600">{hour.hour}:00</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(hour.count / Math.max(...peakHours.map(h => h.count))) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{hour.count}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No peak hours data available</p>
          )}
        </div>
      </div>

      {/* Frequent Visitors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequent Visitors</h2>
        {frequentVisitors.length > 0 ? (
          <div className="space-y-2">
            {frequentVisitors.map((visitor) => (
              <div key={visitor.visitorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{visitor.visitorName}</p>
                  <p className="text-sm text-gray-500">Last visit: {new Date(visitor.lastVisit).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{visitor.visitCount}</p>
                  <p className="text-xs text-gray-500">visits</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No frequent visitors data available</p>
        )}
      </div>
    </div>
  );
}

