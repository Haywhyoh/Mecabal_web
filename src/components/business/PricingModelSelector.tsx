'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, DollarSign } from 'lucide-react';
import { PRICING_MODELS } from '@/constants/businessData';

interface PricingModelSelectorProps {
  selectedModel?: string;
  onSelect: (modelId: string) => void;
  error?: string;
}

export default function PricingModelSelector({
  selectedModel,
  onSelect,
  error,
}: PricingModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = PRICING_MODELS.find((model) => model.id === selectedModel);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pricing Model *
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
            <DollarSign className="w-5 h-5 text-gray-400" />
            <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
              {selected ? selected.name : 'Select pricing model'}
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
              {PRICING_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelect(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start justify-between ${
                    selectedModel === model.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {model.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{model.description}</div>
                    {model.example && (
                      <div className="text-xs text-green-600 italic mt-1">{model.example}</div>
                    )}
                  </div>
                  {selectedModel === model.id && (
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
        <p className="mt-1 text-sm text-gray-500">{selected.example}</p>
      )}
    </div>
  );
}

