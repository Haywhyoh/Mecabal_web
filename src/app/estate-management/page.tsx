'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface DashboardStats {
  currentVisitors: number;
  todayVisitors: number;
  pendingAlerts: number;
  weeklyGrowth: number;
}

export default function EstateManagementDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    currentVisitors: 0,
    todayVisitors: 0,
    pendingAlerts: 0,
    weeklyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [estateId, setEstateId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Get estate ID from user context or URL params
    // For now, using a placeholder
    const fetchDashboardData = async () => {
      if (!estateId) return;
      
      try {
        setLoading(true);
        // Fetch current visitors
        const currentVisitorsRes = await apiClient.getCurrentVisitors(estateId);
        const currentVisitors = (currentVisitorsRes.data as any)?.count || 0;

        // Fetch today's stats
        const analyticsRes = await apiClient.getVisitorAnalytics(estateId);
        const todayVisitors = (analyticsRes.data as any)?.today || 0;

        // Fetch alerts
        const alertsRes = await apiClient.getAlerts(estateId, { status: 'OPEN' });
        const pendingAlerts = (alertsRes.data as any)?.total || 0;

        setStats({
          currentVisitors,
          todayVisitors,
          pendingAlerts,
          weeklyGrowth: 0, // TODO: Calculate from analytics
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [estateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Current Visitors',
      value: stats.currentVisitors,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Today\'s Visitors',
      value: stats.todayVisitors,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      title: 'Weekly Growth',
      value: `${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Estate Management Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to display</p>
          <p className="text-sm mt-2">Visitor activity will appear here</p>
        </div>
      </div>
    </div>
  );
}

