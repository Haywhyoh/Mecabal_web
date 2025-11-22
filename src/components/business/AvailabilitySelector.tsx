'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Clock } from 'lucide-react';
import { AVAILABILITY_SCHEDULES } from '@/constants/businessData';

interface AvailabilitySelectorProps {
  selectedAvailability?: string;
  onSelect: (availabilityId: string) => void;
  error?: string;
}

export default function AvailabilitySelector({
  selectedAvailability,
  onSelect,
  error,
}: AvailabilitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = AVAILABILITY_SCHEDULES.find((schedule) => schedule.id === selectedAvailability);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Availability *
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
            <Clock className="w-5 h-5 text-gray-400" />
            <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
              {selected ? selected.name : 'Select availability'}
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
              {AVAILABILITY_SCHEDULES.map((schedule) => (
                <button
                  key={schedule.id}
                  type="button"
                  onClick={() => {
                    onSelect(schedule.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start justify-between ${
                    selectedAvailability === schedule.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {schedule.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{schedule.description}</div>
                  </div>
                  {selectedAvailability === schedule.id && (
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

