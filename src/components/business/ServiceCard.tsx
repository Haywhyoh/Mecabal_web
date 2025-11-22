'use client';

import React from 'react';
import { Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { BusinessService } from '@/types/business';

interface ServiceCardProps {
  service: BusinessService;
  onEdit?: (service: BusinessService) => void;
  onDelete?: (serviceId: string) => void;
  onToggleActive?: (serviceId: string) => void;
  showActions?: boolean;
}

export default function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleActive,
  showActions = true,
}: ServiceCardProps) {
  const formatPrice = () => {
    if (service.priceMin && service.priceMax) {
      return `₦${service.priceMin.toLocaleString()} - ₦${service.priceMax.toLocaleString()}`;
    }
    if (service.priceMin) {
      return `From ₦${service.priceMin.toLocaleString()}`;
    }
    return 'Price on request';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{service.serviceName}</h3>
            {service.isActive ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                Inactive
              </span>
            )}
          </div>

          {service.description && (
            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{formatPrice()}</span>
            {service.duration && (
              <span className="flex items-center gap-1">
                <span>⏱</span>
                <span>{service.duration}</span>
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {onToggleActive && (
              <button
                onClick={() => onToggleActive(service.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={service.isActive ? 'Deactivate' : 'Activate'}
              >
                {service.isActive ? (
                  <ToggleRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(service)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(service.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

