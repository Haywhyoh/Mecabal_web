'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { BusinessCategory } from '@/types/business';

interface CategorySelectorProps {
  categories: BusinessCategory[];
  selectedCategoryId?: string;
  selectedSubcategory?: string;
  onCategorySelect: (categoryId: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
  error?: string;
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  error,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Category *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-3 bg-white border rounded-lg text-left flex items-center justify-between ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
          >
            <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
              {selectedCategory ? selectedCategory.name : 'Select category'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      onCategorySelect(category.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                      selectedCategoryId === category.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500">{category.description}</div>
                      )}
                    </div>
                    {selectedCategoryId === category.id && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Subcategory Selector */}
      {selectedCategory && subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <span className={selectedSubcategory ? 'text-gray-900' : 'text-gray-500'}>
                {selectedSubcategory || 'Select service type (optional)'}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isSubcategoryOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isSubcategoryOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSubcategoryOpen(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      type="button"
                      onClick={() => {
                        onSubcategorySelect(subcategory);
                        setIsSubcategoryOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                        selectedSubcategory === subcategory ? 'bg-green-50' : ''
                      }`}
                    >
                      <span className="text-gray-900">{subcategory}</span>
                      {selectedSubcategory === subcategory && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

