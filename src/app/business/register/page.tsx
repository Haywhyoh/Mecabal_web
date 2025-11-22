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
import { SERVICE_AREAS, PRICING_MODELS, AVAILABILITY_SCHEDULES, PAYMENT_METHODS } from '@/constants/businessData';
import type { BusinessCategory, CreateBusinessProfileDto } from '@/types/business';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<CreateBusinessProfileDto>>({
    businessName: '',
    description: '',
    category: '',
    subcategory: '',
    serviceArea: '',
    pricingModel: '',
    availability: '',
    phoneNumber: '',
    whatsappNumber: '',
    businessAddress: '',
    yearsOfExperience: 0,
    paymentMethods: [],
    hasInsurance: false,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getBusinessCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.businessName?.trim()) {
          newErrors.businessName = 'Business name is required';
        }
        if (!formData.category) {
          newErrors.category = 'Category is required';
        }
        break;
      case 2:
        if (!formData.serviceArea) {
          newErrors.serviceArea = 'Service area is required';
        }
        if (!formData.pricingModel) {
          newErrors.pricingModel = 'Pricing model is required';
        }
        if (!formData.availability) {
          newErrors.availability = 'Availability is required';
        }
        if (!formData.paymentMethods || formData.paymentMethods?.length === 0) {
          newErrors.paymentMethods = 'At least one payment method is required';
        }
        break;
      case 3:
        if (!formData.phoneNumber?.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);
      const response = await apiClient.registerBusiness(formData as CreateBusinessProfileDto);
      
      if (response.success && response.data) {
        router.push('/business/profile');
      } else {
        const errorMessage = !response.success && response.error 
          ? response.error 
          : 'Failed to register business';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">
          Tell us about your business to help neighbors find and trust your services.
        </p>
      </div>

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
          placeholder="e.g., Adebayo's Home Repairs"
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
          placeholder="Describe your services, experience, and what makes your business special..."
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
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Details</h2>
        <p className="text-gray-600">
          Configure your service area, pricing, and availability.
        </p>
      </div>

      <ServiceAreaSelector
        selectedArea={formData.serviceArea}
        onSelect={(areaId) => setFormData({ ...formData, serviceArea: areaId })}
        error={errors.serviceArea}
      />

      <PricingModelSelector
        selectedModel={formData.pricingModel}
        onSelect={(modelId) => setFormData({ ...formData, pricingModel: modelId })}
        error={errors.pricingModel}
      />

      <AvailabilitySelector
        selectedAvailability={formData.availability}
        onSelect={(availabilityId) =>
          setFormData({ ...formData, availability: availabilityId })
        }
        error={errors.availability}
      />

      <PaymentMethodsSelector
        selectedMethods={formData.paymentMethods || []}
        onSelect={(methods) => setFormData({ ...formData, paymentMethods: methods })}
        error={errors.paymentMethods}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact & Verification</h2>
        <p className="text-gray-600">
          Provide contact details and verification information to build trust.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.phoneNumber || ''}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+234 803 123 4567"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
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
  );

  const renderStep4 = () => {
    const selectedCategory = categories.find((cat) => cat.id === formData.category);
    const selectedServiceArea = SERVICE_AREAS.find((area) => area.id === formData.serviceArea);
    const selectedPricing = PRICING_MODELS.find((model) => model.id === formData.pricingModel);
    const selectedAvailability = AVAILABILITY_SCHEDULES.find(
      (schedule) => schedule.id === formData.availability
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
          <p className="text-gray-600">
            Review your business information before submitting for approval.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{formData.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{selectedCategory?.name}</span>
              </div>
              {formData.subcategory && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">{formData.subcategory}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Area:</span>
                <span className="font-medium text-gray-900">{selectedServiceArea?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pricing:</span>
                <span className="font-medium text-gray-900">{selectedPricing?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Availability:</span>
                <span className="font-medium text-gray-900">{selectedAvailability?.name}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{formData.phoneNumber}</span>
              </div>
              {formData.whatsappNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp:</span>
                  <span className="font-medium text-gray-900">{formData.whatsappNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <div className="text-blue-600">ℹ️</div>
          <p className="text-sm text-blue-800">
            Your business will be reviewed within 24-48 hours. You'll receive a notification once
            approved.
          </p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step <= currentStep
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step < currentStep ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">Step {currentStep} of 4</p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

