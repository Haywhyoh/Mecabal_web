'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import CategorySelector from '@/components/business/CategorySelector';
import ServiceAreaSelector from '@/components/business/ServiceAreaSelector';
import PricingModelSelector from '@/components/business/PricingModelSelector';
import AvailabilitySelector from '@/components/business/AvailabilitySelector';
import PaymentMethodsSelector from '@/components/business/PaymentMethodsSelector';
import type { BusinessProfile, BusinessCategory, UpdateBusinessProfileDto } from '@/types/business';
import { ArrowLeft } from 'lucide-react';

export default function EditBusinessProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<UpdateBusinessProfileDto>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [businessResponse, categoriesResponse] = await Promise.all([
        apiClient.getMyBusiness(),
        apiClient.getBusinessCategories(),
      ]);

      // Handle null business (user has no business profile)
      if (businessResponse.success && businessResponse.data === null) {
        // No business profile - redirect to registration
        router.push('/business/register');
        return;
      }

      if (businessResponse.success && businessResponse.data) {
        const businessData = businessResponse.data;
        setBusiness(businessData);
        setFormData({
          businessName: businessData.businessName,
          description: businessData.description || '',
          category: businessData.category,
          subcategory: businessData.subcategory || '',
          serviceArea: businessData.serviceArea,
          pricingModel: businessData.pricingModel,
          availability: businessData.availability,
          phoneNumber: businessData.phoneNumber || '',
          whatsappNumber: businessData.whatsappNumber || '',
          businessAddress: businessData.businessAddress || '',
          yearsOfExperience: businessData.yearsOfExperience,
          paymentMethods: businessData.paymentMethods || [],
          hasInsurance: businessData.hasInsurance || false,
        });
      } else {
        // Handle other errors
        const errorMessage = !businessResponse.success && businessResponse.error 
          ? businessResponse.error 
          : 'Failed to load business data';
        console.error('Error loading business:', errorMessage);
        alert(errorMessage);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      } else {
        const errorMessage = !categoriesResponse.success && categoriesResponse.error
          ? categoriesResponse.error
          : 'Failed to load categories';
        console.warn('Failed to load categories:', errorMessage);
        // Categories are not critical, continue without them
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert(error.message || 'Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (!business) return false;
    return (
      formData.businessName !== business.businessName ||
      formData.description !== (business.description || '') ||
      formData.category !== business.category ||
      formData.subcategory !== (business.subcategory || '') ||
      formData.serviceArea !== business.serviceArea ||
      formData.pricingModel !== business.pricingModel ||
      formData.availability !== business.availability ||
      formData.phoneNumber !== (business.phoneNumber || '') ||
      formData.whatsappNumber !== (business.whatsappNumber || '') ||
      formData.businessAddress !== (business.businessAddress || '') ||
      formData.yearsOfExperience !== business.yearsOfExperience ||
      formData.hasInsurance !== (business.hasInsurance || false) ||
      JSON.stringify(formData.paymentMethods) !== JSON.stringify(business.paymentMethods || [])
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName?.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!business || !validateForm()) return;
    if (!hasChanges()) {
      alert('No changes to save');
      return;
    }

    try {
      setSaving(true);
      const updateData: UpdateBusinessProfileDto = {};
      
      if (formData.businessName !== business.businessName) {
        updateData.businessName = formData.businessName;
      }
      if (formData.description !== (business.description || '')) {
        updateData.description = formData.description;
      }
      if (formData.category !== business.category) {
        updateData.category = formData.category;
      }
      if (formData.subcategory !== (business.subcategory || '')) {
        updateData.subcategory = formData.subcategory;
      }
      if (formData.serviceArea !== business.serviceArea) {
        updateData.serviceArea = formData.serviceArea;
      }
      if (formData.pricingModel !== business.pricingModel) {
        updateData.pricingModel = formData.pricingModel;
      }
      if (formData.availability !== business.availability) {
        updateData.availability = formData.availability;
      }
      if (formData.phoneNumber !== (business.phoneNumber || '')) {
        updateData.phoneNumber = formData.phoneNumber;
      }
      if (formData.whatsappNumber !== (business.whatsappNumber || '')) {
        updateData.whatsappNumber = formData.whatsappNumber;
      }
      if (formData.businessAddress !== (business.businessAddress || '')) {
        updateData.businessAddress = formData.businessAddress;
      }
      if (formData.yearsOfExperience !== business.yearsOfExperience) {
        updateData.yearsOfExperience = formData.yearsOfExperience;
      }
      if (formData.hasInsurance !== (business.hasInsurance || false)) {
        updateData.hasInsurance = formData.hasInsurance;
      }
      if (JSON.stringify(formData.paymentMethods) !== JSON.stringify(business.paymentMethods || [])) {
        updateData.paymentMethods = formData.paymentMethods;
      }

      const response = await apiClient.updateBusiness(business.id, updateData);
      if (response.success) {
        router.push('/business/profile');
      } else {
        const errorMessage = !response.success && response.error 
          ? response.error 
          : 'Failed to update business';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.message || 'Failed to update business. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Business not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Business Profile</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* Business Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName || ''}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <CategorySelector
                categories={categories}
                selectedCategoryId={formData.category}
                selectedSubcategory={formData.subcategory}
                onCategorySelect={(categoryId) => {
                  setFormData({ ...formData, category: categoryId, subcategory: '' });
                }}
                onSubcategorySelect={(subcategory) => {
                  setFormData({ ...formData, subcategory });
                }}
                error={errors.category}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
            <div className="space-y-4">
              <ServiceAreaSelector
                selectedArea={formData.serviceArea}
                onSelect={(areaId) => setFormData({ ...formData, serviceArea: areaId })}
              />

              <PricingModelSelector
                selectedModel={formData.pricingModel}
                onSelect={(modelId) => setFormData({ ...formData, pricingModel: modelId })}
              />

              <AvailabilitySelector
                selectedAvailability={formData.availability}
                onSelect={(availabilityId) =>
                  setFormData({ ...formData, availability: availabilityId })
                }
              />

              <PaymentMethodsSelector
                selectedMethods={formData.paymentMethods || []}
                onSelect={(methods) => setFormData({ ...formData, paymentMethods: methods })}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="+234 803 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="+234 803 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <input
                  type="text"
                  value={formData.businessAddress || ''}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Block 5, Flat 3, Victoria Island Estate"
                />
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="border-t pt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasInsurance"
                checked={formData.hasInsurance || false}
                onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="hasInsurance" className="ml-3 text-sm text-gray-700">
                I have business insurance coverage
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges() || saving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

