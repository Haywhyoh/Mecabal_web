'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  QrCode,
  FileText,
  BarChart3,
  AlertTriangle,
  Home,
} from 'lucide-react';

const menuItems = [
  { href: '/estate-management', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/estate-management/visitors', label: 'Visitors', icon: Users },
  { href: '/estate-management/logs', label: 'Visitor Logs', icon: FileText },
  { href: '/estate-management/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/estate-management/alerts', label: 'Security Alerts', icon: AlertTriangle },
  { href: '/estate-management/residents', label: 'Resident Directory', icon: Home },
];

export default function EstateManagementSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Estate Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}

