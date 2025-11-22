'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Feed from '@/components/dashboard/Feed';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Feed />
    </DashboardLayout>
  );
}

