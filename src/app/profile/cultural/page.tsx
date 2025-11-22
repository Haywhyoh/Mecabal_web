'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin, Languages, Users, Briefcase, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileSection from '@/components/profile/ProfileSection';
import { apiClient } from '@/lib/api';
import type { ReferenceData, UserPrivacySettings, CulturalProfile } from '@/types/profile';
import { LanguageProficiency } from '@/types/profile';
import type { User } from '@/types/user';

interface CulturalFormData {
  stateOfOriginId: string;
  culturalBackgroundId: string;
  professionalCategoryId: string;
  professionalTitle: string;
  languages: Array<{
    languageId: string;
    proficiency: LanguageProficiency;
  }>;
  privacySettings: UserPrivacySettings;
}

export default function CulturalProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfessionModal, setShowProfessionModal] = useState(false);

  const [formData, setFormData] = useState<CulturalFormData>({
    stateOfOriginId: '',
    culturalBackgroundId: '',
    professionalCategoryId: '',
    professionalTitle: '',
    languages: [],
    privacySettings: {
      showCulturalBackground: true,
      showLanguages: true,
      showProfessionalCategory: true,
      showStateOfOrigin: true,
      allowCulturalMatching: true,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, referenceResponse] = await Promise.all([
        apiClient.getCurrentUserProfile(),
        apiClient.getReferenceData(),
      ]);

      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data as User;
        setUser(userData);

        // Load existing cultural profile if available
        if (userData.id) {
          const culturalResponse = await apiClient.getCulturalProfile(userData.id);
          if (culturalResponse.success && culturalResponse.data) {
            const cultural = culturalResponse.data as CulturalProfile;
            setFormData({
              stateOfOriginId: cultural.stateOfOrigin?.id || '',
              culturalBackgroundId: cultural.culturalBackground?.id || '',
              professionalCategoryId: cultural.professional?.categoryId || '',
              professionalTitle: cultural.professional?.title || '',
              languages: cultural.languages || [],
              privacySettings: cultural.privacySettings || formData.privacySettings,
            });
          }
        }
      }

      if (referenceResponse.success && referenceResponse.data) {
        setReferenceData(referenceResponse.data as ReferenceData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user?.id) {
      setError('User not found');
      return;
    }

    if (!formData.stateOfOriginId || !formData.culturalBackgroundId || !formData.professionalCategoryId || !formData.professionalTitle) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiClient.createOrUpdateCulturalProfile(user.id, formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        setError(response.error || 'Failed to save cultural profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cultural profile');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = (languageId: string, proficiency: LanguageProficiency) => {
    setFormData((prev) => {
      const existingIndex = prev.languages.findIndex((l) => l.languageId === languageId);
      if (existingIndex >= 0) {
        // Remove if same proficiency, update if different
        if (prev.languages[existingIndex].proficiency === proficiency) {
          return {
            ...prev,
            languages: prev.languages.filter((l) => l.languageId !== languageId),
          };
        } else {
          const newLanguages = [...prev.languages];
          newLanguages[existingIndex] = { languageId, proficiency };
          return { ...prev, languages: newLanguages };
        }
      } else {
        return {
          ...prev,
          languages: [...prev.languages, { languageId, proficiency }],
        };
      }
    });
  };

  const togglePrivacy = (field: keyof UserPrivacySettings) => {
    setFormData((prev) => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: !prev.privacySettings[field],
      },
    }));
  };

  const getSelectedState = () => {
    return referenceData?.states.find((s) => s.id === formData.stateOfOriginId);
  };

  const getSelectedCulturalBackground = () => {
    return referenceData?.culturalBackgrounds.find((c) => c.id === formData.culturalBackgroundId);
  };

  const getSelectedProfessionalCategory = () => {
    return referenceData?.professionalCategories.find((c) => c.id === formData.professionalCategoryId);
  };

  const getSelectedLanguages = () => {
    if (!referenceData) return [];
    return formData.languages.map((lang) => {
      const language = referenceData.languages.find((l) => l.id === lang.languageId);
      return language ? { ...language, proficiency: lang.proficiency } : null;
    }).filter(Boolean);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!referenceData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">Failed to load reference data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Cultural Profile</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
            <p className="text-green-700 text-sm">Cultural profile saved successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Introduction */}
          <ProfileSection>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Nigerian Identity</h2>
              <p className="text-sm text-gray-600">
                Share your Nigerian heritage and connect with neighbors who understand your background.
                All information is optional and you control what appears on your profile.
              </p>
            </div>
          </ProfileSection>

          {/* State of Origin */}
          <ProfileSection>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <label className="block text-sm font-medium text-gray-700">State of Origin *</label>
              </div>
              <select
                value={formData.stateOfOriginId}
                onChange={(e) => setFormData((prev) => ({ ...prev, stateOfOriginId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select your state</option>
                {referenceData.states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name} {state.region ? `(${state.region})` : ''}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600">Show on profile</span>
                <button
                  type="button"
                  onClick={() => togglePrivacy('showStateOfOrigin')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.privacySettings.showStateOfOrigin ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.privacySettings.showStateOfOrigin ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </ProfileSection>

          {/* Languages */}
          <ProfileSection>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-5 h-5 text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">Languages</label>
              </div>
              <button
                type="button"
                onClick={() => setShowLanguageModal(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {formData.languages.length > 0
                    ? `${formData.languages.length} language(s) selected`
                    : 'Select languages'}
                </span>
                <span className="text-gray-400">›</span>
              </button>
              {getSelectedLanguages().length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {getSelectedLanguages().map((lang: any) => (
                    <span
                      key={lang.id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {lang.name}
                      <span className="text-xs opacity-75">({lang.proficiency})</span>
                      <button
                        type="button"
                        onClick={() => toggleLanguage(lang.id, lang.proficiency)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600">Show on profile</span>
                <button
                  type="button"
                  onClick={() => togglePrivacy('showLanguages')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.privacySettings.showLanguages ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.privacySettings.showLanguages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </ProfileSection>

          {/* Cultural Background */}
          <ProfileSection>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <label className="block text-sm font-medium text-gray-700">Cultural Background *</label>
              </div>
              <select
                value={formData.culturalBackgroundId}
                onChange={(e) => setFormData((prev) => ({ ...prev, culturalBackgroundId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select cultural background</option>
                {referenceData.culturalBackgrounds.map((bg) => (
                  <option key={bg.id} value={bg.id}>
                    {bg.name} {bg.region ? `(${bg.region})` : ''}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600">Show on profile</span>
                <button
                  type="button"
                  onClick={() => togglePrivacy('showCulturalBackground')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.privacySettings.showCulturalBackground ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.privacySettings.showCulturalBackground ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </ProfileSection>

          {/* Professional Category & Title */}
          <ProfileSection>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-orange-600" />
                <label className="block text-sm font-medium text-gray-700">Profession *</label>
              </div>
              <select
                value={formData.professionalCategoryId}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    professionalCategoryId: e.target.value,
                    professionalTitle: '', // Reset title when category changes
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
                required
              >
                <option value="">Select professional category</option>
                {referenceData.professionalCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </select>
              {formData.professionalCategoryId && (
                <select
                  value={formData.professionalTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, professionalTitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select professional title</option>
                  {getSelectedProfessionalCategory()?.titles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600">Show on profile</span>
                <button
                  type="button"
                  onClick={() => togglePrivacy('showProfessionalCategory')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.privacySettings.showProfessionalCategory ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.privacySettings.showProfessionalCategory ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </ProfileSection>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button
              type="submit"
              disabled={isSaving || success}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Cultural Profile'}
            </button>
          </div>
        </form>

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Languages</h3>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-2">
                {referenceData.languages.map((lang) => {
                  const existing = formData.languages.find((l) => l.languageId === lang.id);
                  return (
                    <div key={lang.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{lang.name}</p>
                          {lang.nativeName && (
                            <p className="text-sm text-gray-500">{lang.nativeName}</p>
                          )}
                        </div>
                        <select
                          value={existing?.proficiency || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              toggleLanguage(lang.id, e.target.value as LanguageProficiency);
                            }
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">Not selected</option>
                          <option value={LanguageProficiency.BEGINNER}>Beginner</option>
                          <option value={LanguageProficiency.INTERMEDIATE}>Intermediate</option>
                          <option value={LanguageProficiency.ADVANCED}>Advanced</option>
                          <option value={LanguageProficiency.NATIVE}>Native</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


