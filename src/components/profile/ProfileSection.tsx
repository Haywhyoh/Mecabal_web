'use client';

import React from 'react';

interface ProfileSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProfileSection({ title, children, className = '' }: ProfileSectionProps) {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}


