'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Map, List, Loader2, MapPin, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import NeighborhoodCard from '@/components/neighborhoods/NeighborhoodCard';
import NeighborhoodFiltersComponent, {
  NeighborhoodFilters,
} from '@/components/neighborhoods/NeighborhoodFilters';
import { apiClient } from '@/lib/api';

// Dynamically import NeighborhoodMapView to avoid SSR issues with Leaflet
const NeighborhoodMapView = dynamic(
  () => import('@/components/neighborhoods/NeighborhoodMapView'),
  { ssr: false }
);

type ViewMode = 'map' | 'list';

interface State {
  id: string;
  name: string;
  code: string;
}

interface LGA {
  id: string;
  name: string;
  code: string;
  type: 'LGA' | 'LCDA';
}

export default function BrowseNeighborhoodsPage() {
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // Location selection
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLGAs] = useState<LGA[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedLgaId, setSelectedLgaId] = useState<string>('');
  const [selectedLgaName, setSelectedLgaName] = useState<string>('');
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);

  const [filters, setFilters] = useState<NeighborhoodFilters>({
    type: 'ALL',
    sortBy: 'name',
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    loadUserData();
    loadStates();
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      loadLGAs(selectedStateId);
    } else {
      setLGAs([]);
      setSelectedLgaId('');
      setSelectedLgaName('');
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedLgaId) {
      loadNeighborhoods();
    } else {
      setNeighborhoods([]);
      setFilteredNeighborhoods([]);
    }
  }, [selectedLgaId]);

  useEffect(() => {
    applyFilters();
  }, [neighborhoods, filters]);

  const loadUserData = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data as any;
        if (userData.id) {
          setCurrentUserId(userData.id);
        }
        // Try to get user's location if available
        if (userData.primaryLocationId) {
          // TODO: Load user's location and pre-select state/LGA
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // If user data fails, they might not be logged in
      setIsAuthenticated(false);
    }
  };

  const loadStates = async () => {
    setIsLoadingStates(true);
    try {
      const response = await apiClient.getStates();
      if (response.success && response.data) {
        const statesData = Array.isArray(response.data) ? response.data : [];
        setStates(statesData as State[]);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const loadLGAs = async (stateId: string) => {
    setIsLoadingLGAs(true);
    try {
      const response = await apiClient.getLGAsByState(stateId);
      if (response.success && response.data) {
        const lgasData = Array.isArray(response.data) ? response.data : [];
        setLGAs(lgasData as LGA[]);
      }
    } catch (error) {
      console.error('Error loading LGAs:', error);
    } finally {
      setIsLoadingLGAs(false);
    }
  };

  const loadNeighborhoods = async () => {
    if (!selectedLgaId) {
      setNeighborhoods([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.getAllNeighborhoods({
        lgaId: selectedLgaId,
        limit: 100,
      });

      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setNeighborhoods(data);
      } else {
        setNeighborhoods([]);
      }
    } catch (error) {
      console.error('Error loading neighborhoods:', error);
      setNeighborhoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...neighborhoods];

    // Filter by type
    if (filters.type && filters.type !== 'ALL') {
      result = result.filter((n) => n.type === filters.type);
    }

    // Filter by gated
    if (filters.isGated !== undefined) {
      result = result.filter((n) => n.isGated === filters.isGated);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((n) =>
        n.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'members':
          return (b.memberCount || 0) - (a.memberCount || 0);
        default:
          return 0;
      }
    });

    setFilteredNeighborhoods(result);
  };

  // Show login prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Log In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to browse neighborhoods.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Neighborhoods
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedLgaName ? `in ${selectedLgaName} LGA` : 'Select a location to explore neighborhoods'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              {selectedLgaId && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                      viewMode === 'map'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    Map
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                </div>
              )}

              {/* Create Button */}
              <Link
                href={`/neighborhoods/create${selectedLgaId ? `?lgaId=${selectedLgaId}` : ''}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Neighborhood
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Select Location:</span>
            
            {/* State Selector */}
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedStateId}
                onChange={(e) => {
                  setSelectedStateId(e.target.value);
                  setSelectedLgaId('');
                  setSelectedLgaName('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                disabled={isLoadingStates}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* LGA Selector */}
            {selectedStateId && (
              <div className="flex-1 min-w-[200px]">
                {isLoadingLGAs ? (
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600">Loading LGAs...</span>
                  </div>
                ) : (
                  <select
                    value={selectedLgaId}
                    onChange={(e) => {
                      const selectedLGA = lgas.find(l => l.id === e.target.value);
                      setSelectedLgaId(e.target.value);
                      setSelectedLgaName(selectedLGA?.name || '');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga.id} value={lga.id}>
                        {lga.name} {lga.type === 'LCDA' ? '(LCDA)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedLgaId ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Location
            </h3>
            <p className="text-gray-600 mb-6">
              Please select a State and LGA above to browse neighborhoods in that area.
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <div className="w-64 shrink-0">
              <NeighborhoodFiltersComponent
                currentFilters={filters}
                onFilterChange={setFilters}
              />
            </div>

            {/* Main View */}
            <div className="flex-1">
              {isLoading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading neighborhoods...</p>
                </div>
              ) : filteredNeighborhoods.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    No neighborhoods found in {selectedLgaName} LGA.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Be the first to create a neighborhood in this area!
                  </p>
                  <Link
                    href={`/neighborhoods/create?lgaId=${selectedLgaId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Neighborhood
                  </Link>
                </div>
              ) : viewMode === 'map' ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <NeighborhoodMapView
                    lgaId={selectedLgaId}
                    onNeighborhoodClick={(n) => router.push(`/neighborhoods/${n.id}`)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNeighborhoods.map((neighborhood) => (
                    <NeighborhoodCard
                      key={neighborhood.id}
                      neighborhood={neighborhood}
                      showActions={true}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              )}

              {/* Results count */}
              {filteredNeighborhoods.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Showing {filteredNeighborhoods.length} of {neighborhoods.length} neighborhoods
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
