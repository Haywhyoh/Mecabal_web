'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, CreditCard } from 'lucide-react';
import { PAYMENT_METHODS } from '@/constants/businessData';

interface PaymentMethodsSelectorProps {
  selectedMethods: string[];
  onSelect: (methods: string[]) => void;
  error?: string;
}

export default function PaymentMethodsSelector({
  selectedMethods,
  onSelect,
  error,
}: PaymentMethodsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMethod = (methodId: string) => {
    if (selectedMethods.includes(methodId)) {
      onSelect(selectedMethods.filter((id) => id !== methodId));
    } else {
      onSelect([...selectedMethods, methodId]);
    }
  };

  const selectedMethodsList = PAYMENT_METHODS.filter((method) =>
    selectedMethods.includes(method.id)
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Methods *
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
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span className={selectedMethods.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
              {selectedMethods.length > 0
                ? `${selectedMethods.length} method${selectedMethods.length > 1 ? 's' : ''} selected`
                : 'Select payment methods'}
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
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethods.includes(method.id);
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => toggleMethod(method.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                      isSelected ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          isSelected
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {method.name}
                          {method.popular && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {selectedMethodsList.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedMethodsList.map((method) => (
            <span
              key={method.id}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {method.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

