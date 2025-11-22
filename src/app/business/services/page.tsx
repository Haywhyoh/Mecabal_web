'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import ServiceCard from '@/components/business/ServiceCard';
import type { BusinessService, BusinessProfile, CreateBusinessServiceDto } from '@/types/business';
import { Plus, X } from 'lucide-react';

export default function BusinessServicesPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<BusinessService | null>(null);
  const [formData, setFormData] = useState<Partial<CreateBusinessServiceDto>>({
    serviceName: '',
    description: '',
    priceMin: undefined,
    priceMax: undefined,
    duration: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const businessResponse = await apiClient.getMyBusiness();
      if (businessResponse.success && businessResponse.data) {
        setBusiness(businessResponse.data);
        const servicesResponse = await apiClient.getBusinessServices(businessResponse.data.id);
        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
        }
      } else {
        router.push('/business/register');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!business || !formData.serviceName?.trim()) {
      alert('Service name is required');
      return;
    }

    try {
      const response = await apiClient.createBusinessService(business.id, formData as CreateBusinessServiceDto);
      if (response.success && response.data) {
        setServices([...services, response.data]);
        setFormData({
          serviceName: '',
          description: '',
          priceMin: undefined,
          priceMax: undefined,
          duration: '',
          isActive: true,
        });
        setShowAddForm(false);
      } else {
        const errorMessage = !response.success && response.error 
          ? response.error 
          : 'Failed to create service';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating service:', error);
      alert('Failed to create service. Please try again.');
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !formData.serviceName?.trim()) {
      alert('Service name is required');
      return;
    }

    try {
      const response = await apiClient.updateBusinessService(editingService.id, formData);
      if (response.success && response.data) {
        setServices(services.map((s) => (s.id === editingService.id ? response.data! : s)));
        setEditingService(null);
        setFormData({
          serviceName: '',
          description: '',
          priceMin: undefined,
          priceMax: undefined,
          duration: '',
          isActive: true,
        });
      } else {
        const errorMessage = !response.success && response.error 
          ? response.error 
          : 'Failed to update service';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating service:', error);
      alert('Failed to update service. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await apiClient.deleteBusinessService(serviceId);
      if (response.success) {
        setServices(services.filter((s) => s.id !== serviceId));
      } else {
        const errorMessage = !response.success && response.error 
          ? response.error 
          : 'Failed to delete service';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

  const handleToggleActive = async (serviceId: string) => {
    try {
      const response = await apiClient.toggleServiceActive(serviceId);
      if (response.success && response.data) {
        setServices(services.map((s) => (s.id === serviceId ? response.data! : s)));
      } else {
        const errorMessage = !response.success && response.error 
          ? response.error 
          : 'Failed to update service status';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error toggling service:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  const handleEdit = (service: BusinessService) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      description: service.description || '',
      priceMin: service.priceMin,
      priceMax: service.priceMax,
      duration: service.duration || '',
      isActive: service.isActive,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingService(null);
    setFormData({
      serviceName: '',
      description: '',
      priceMin: undefined,
      priceMax: undefined,
      duration: '',
      isActive: true,
    });
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
          <button
            onClick={() => {
              setEditingService(null);
              setFormData({
                serviceName: '',
                description: '',
                priceMin: undefined,
                priceMax: undefined,
                duration: '',
                isActive: true,
              });
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.serviceName || ''}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Plumbing Repair"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe the service..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceMin || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMin: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceMax || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMax: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 2 hours"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="ml-3 text-sm text-gray-700">
                  Service is active
                </label>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={editingService ? handleUpdateService : handleAddService}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600 mb-4">No services added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Your First Service
              </button>
            </div>
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDeleteService}
                onToggleActive={handleToggleActive}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

