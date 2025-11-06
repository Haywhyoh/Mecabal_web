'use client';

import { MapPin, Lock, Users } from 'lucide-react';
import Link from 'next/link';

interface Neighborhood {
  id: string;
  name: string;
  type: 'AREA' | 'ESTATE' | 'COMMUNITY';
  isGated: boolean;
  lga?: {
    name: string;
  };
  memberCount?: number;
  createdBy?: string;
  createdAt?: string;
}

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
  showActions?: boolean;
  currentUserId?: string;
}

const TYPE_COLORS = {
  AREA: 'bg-blue-100 text-blue-800',
  ESTATE: 'bg-green-100 text-green-800',
  COMMUNITY: 'bg-amber-100 text-amber-800',
};

export default function NeighborhoodCard({
  neighborhood,
  showActions = true,
  currentUserId,
}: NeighborhoodCardProps) {
  const isCreator = currentUserId === neighborhood.createdBy;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {neighborhood.name}
          </h3>
          {neighborhood.lga && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {neighborhood.lga.name} LGA
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${TYPE_COLORS[neighborhood.type]}`}>
            {neighborhood.type}
          </span>
          {neighborhood.isGated && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Gated
            </span>
          )}
        </div>
      </div>

      {neighborhood.memberCount !== undefined && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <Users className="w-4 h-4" />
          <span>{neighborhood.memberCount} members</span>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <Link
            href={`/neighborhoods/${neighborhood.id}`}
            className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          {isCreator && (
            <Link
              href={`/neighborhoods/${neighborhood.id}/edit`}
              className="flex-1 text-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Edit
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
