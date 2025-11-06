'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Polygon, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import { fixLeafletMarkerIcons, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/leafletConfig';
import { apiClient } from '@/lib/api';

// Types
interface Neighborhood {
  id: string;
  name: string;
  type: 'AREA' | 'ESTATE' | 'COMMUNITY';
  isGated: boolean;
  boundaries?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  centerLatitude?: number;
  centerLongitude?: number;
  radiusMeters?: number;
}

interface NeighborhoodMapViewProps {
  lgaId: string;
  center?: [number, number];
  onNeighborhoodClick?: (neighborhood: Neighborhood) => void;
}

// Fix Leaflet icons
if (typeof window !== 'undefined') {
  fixLeafletMarkerIcons();
}

// Color mapping for neighborhood types
const TYPE_COLORS = {
  AREA: '#3b82f6', // blue
  ESTATE: '#10b981', // green
  COMMUNITY: '#f59e0b', // amber
};

function MapViewController({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const map = useMap();

  useEffect(() => {
    if (neighborhoods.length > 0) {
      const bounds: L.LatLngBoundsExpression = neighborhoods
        .filter(n => n.centerLatitude && n.centerLongitude)
        .map(n => [n.centerLatitude!, n.centerLongitude!] as [number, number]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [neighborhoods, map]);

  return null;
}

function NeighborhoodMapViewComponent({
  lgaId,
  center = DEFAULT_CENTER as [number, number],
  onNeighborhoodClick,
}: NeighborhoodMapViewProps) {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadNeighborhoods();
  }, [lgaId]);

  const loadNeighborhoods = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getNeighborhoodsWithBoundaries(lgaId);
      if (response.success && response.data) {
        setNeighborhoods(response.data);
      }
    } catch (error) {
      console.error('Failed to load neighborhoods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNeighborhoods = neighborhoods.filter(n =>
    filter === 'ALL' || n.type === filter
  );

  return (
    <div className="relative">
      {/* Filter Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Filter by Type:</p>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'ALL' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('AREA')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'AREA' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Areas
          </button>
          <button
            onClick={() => setFilter('ESTATE')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'ESTATE' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Estates
          </button>
          <button
            onClick={() => setFilter('COMMUNITY')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'COMMUNITY' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Communities
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Legend:</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span>Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span>Estate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-600 rounded"></div>
            <span>Community</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-red-600 rounded"></div>
            <span>Gated</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[600px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-600">Loading neighborhoods...</p>
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: '600px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewController neighborhoods={filteredNeighborhoods} />

          {filteredNeighborhoods.map((neighborhood) => {
            const color = TYPE_COLORS[neighborhood.type];

            // If neighborhood has custom boundaries, draw polygon
            if (neighborhood.boundaries && neighborhood.boundaries.coordinates) {
              const coords = neighborhood.boundaries.coordinates[0].map(
                ([lng, lat]) => [lat, lng] as [number, number]
              );

              return (
                <Polygon
                  key={neighborhood.id}
                  positions={coords}
                  pathOptions={{
                    color: neighborhood.isGated ? '#dc2626' : color,
                    weight: neighborhood.isGated ? 3 : 2,
                    fillColor: color,
                    fillOpacity: 0.3,
                  }}
                  eventHandlers={{
                    click: () => onNeighborhoodClick?.(neighborhood),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{neighborhood.name}</p>
                      <p className="text-gray-600">{neighborhood.type}</p>
                      {neighborhood.isGated && (
                        <p className="text-red-600 text-xs">🔒 Gated</p>
                      )}
                    </div>
                  </Popup>
                </Polygon>
              );
            }

            // Otherwise, draw circle from center point and radius
            if (neighborhood.centerLatitude && neighborhood.centerLongitude) {
              return (
                <Circle
                  key={neighborhood.id}
                  center={[neighborhood.centerLatitude, neighborhood.centerLongitude]}
                  radius={neighborhood.radiusMeters || 1000}
                  pathOptions={{
                    color: neighborhood.isGated ? '#dc2626' : color,
                    weight: neighborhood.isGated ? 3 : 2,
                    fillColor: color,
                    fillOpacity: 0.3,
                  }}
                  eventHandlers={{
                    click: () => onNeighborhoodClick?.(neighborhood),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{neighborhood.name}</p>
                      <p className="text-gray-600">{neighborhood.type}</p>
                      {neighborhood.isGated && (
                        <p className="text-red-600 text-xs">🔒 Gated</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Radius: {neighborhood.radiusMeters}m
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            }

            return null;
          })}
        </MapContainer>
      )}
    </div>
  );
}

// Export with dynamic import to avoid SSR issues
const NeighborhoodMapView = dynamic(
  () => Promise.resolve(NeighborhoodMapViewComponent),
  { ssr: false, loading: () => <div className="h-[600px] w-full bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div> }
);

export default NeighborhoodMapView;
