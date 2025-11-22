'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, MapPin } from 'lucide-react';
import { SERVICE_AREAS } from '@/constants/businessData';

interface ServiceAreaSelectorProps {
  selectedArea?: string;
  onSelect: (areaId: string) => void;
  error?: string;
}

export default function ServiceAreaSelector({
  selectedArea,
  onSelect,
  error,
}: ServiceAreaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = SERVICE_AREAS.find((area) => area.id === selectedArea);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Service Area *
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-left flex items-center justify-between ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
              {selected ? selected.name : 'Select service area'}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {SERVICE_AREAS.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    onSelect(area.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start justify-between ${
                    selectedArea === area.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {area.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{area.description}</div>
                  </div>
                  {selectedArea === area.id && (
                    <Check className="w-5 h-5 text-green-600 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {selected && (
        <p className="mt-1 text-sm text-gray-500">{selected.description}</p>
      )}
    </div>
  );
}

