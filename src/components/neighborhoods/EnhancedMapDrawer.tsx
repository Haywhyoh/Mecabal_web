'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { fixLeafletMarkerIcons, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/leafletConfig';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

// Helper component to capture map instance
function MapInitializer({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);

  return null;
}

// Types
export interface DrawnBoundary {
  type: 'Polygon';
  coordinates: number[][][];
}

interface LocationData {
  state?: string;
  lga?: string;
  city?: string;
  formattedAddress?: string;
}

interface EnhancedMapDrawerProps {
  onBoundaryDrawn?: (boundary: DrawnBoundary, location: LocationData) => void;
  onLocationDetected?: (location: LocationData) => void;
  showPlacesSearch?: boolean;
}

// Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const libraries: ("places" | "drawing" | "geometry")[] = ['places', 'drawing'];

// Fix Leaflet icons
if (typeof window !== 'undefined') {
  fixLeafletMarkerIcons();
}

function EnhancedMapDrawerComponent({
  onBoundaryDrawn,
  onLocationDetected,
  showPlacesSearch = true,
}: EnhancedMapDrawerProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [drawnBoundary, setDrawnBoundary] = useState<DrawnBoundary | null>(null);
  const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);

  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  // Reverse geocode using backend API
  const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
    try {
      const response = await apiClient.request(
        `/location/geocoding/reverse?latitude=${lat}&longitude=${lng}`
      );

      if (response.success && response.data) {
        return {
          state: response.data.state || '',
          lga: response.data.lga || '',
          city: response.data.city || '',
          formattedAddress: response.data.formattedAddress || '',
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }

    return {};
  };

  // Calculate center of polygon
  const getPolygonCenter = (coordinates: number[][][]): [number, number] => {
    const points = coordinates[0];
    let latSum = 0;
    let lngSum = 0;

    points.forEach(([lng, lat]) => {
      latSum += lat;
      lngSum += lng;
    });

    return [latSum / points.length, lngSum / points.length];
  };

  // Handle drawn shape
  const handleCreated = async (event: any) => {
    if (!featureGroupRef.current) return;

    const layer = event.layer;
    featureGroupRef.current.clearLayers();
    featureGroupRef.current.addLayer(layer);

    // Convert to GeoJSON
    const geoJSON = layer.toGeoJSON();
    let coordinates = geoJSON.geometry.coordinates;

    // Handle different geometry types
    if (geoJSON.geometry.type === 'Polygon') {
      coordinates = geoJSON.geometry.coordinates;
    } else if (geoJSON.geometry.type === 'Circle') {
      // Convert circle to polygon
      const center = (layer as any).getLatLng();
      const radius = (layer as any).getRadius();
      const points = 32;
      const circleCoords: number[][] = [];

      for (let i = 0; i <= points; i++) {
        const angle = (i * 2 * Math.PI) / points;
        const lat = center.lat + (radius / 111320) * Math.cos(angle);
        const lng = center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
        circleCoords.push([lng, lat]);
      }
      coordinates = [circleCoords];
    }

    const boundary: DrawnBoundary = {
      type: 'Polygon',
      coordinates: coordinates,
    };

    setDrawnBoundary(boundary);

    // Auto-detect location from boundary center
    setIsDetectingLocation(true);
    const [centerLat, centerLng] = getPolygonCenter(coordinates);
    const location = await reverseGeocode(centerLat, centerLng);
    setDetectedLocation(location);
    setIsDetectingLocation(false);

    if (onLocationDetected) {
      onLocationDetected(location);
    }

    if (onBoundaryDrawn) {
      onBoundaryDrawn(boundary, location);
    }
  };

  // Setup drawing tools
  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const featureGroup = featureGroupRef.current;

    // Attach event handlers
    map.on(L.Draw.Event.CREATED, handleCreated);

    // Add Leaflet Draw control to the map
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#10b981',
            weight: 3,
            fillColor: '#10b981',
            fillOpacity: 0.2,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#10b981',
            weight: 3,
            fillColor: '#10b981',
            fillOpacity: 0.2,
          },
        },
        circle: {
          shapeOptions: {
            color: '#10b981',
            weight: 3,
            fillColor: '#10b981',
            fillOpacity: 0.2,
          },
        },
        polyline: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: featureGroup,
        remove: true,
      },
    });

    map.addControl(drawControl);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.removeControl(drawControl);
    };
  }, [map, onBoundaryDrawn, onLocationDetected]);

  // Handle place search selection
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Add marker
        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
        }

        if (map) {
          searchMarkerRef.current = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`📍 ${place.formatted_address || place.name}`)
            .openPopup();

          map.setView([lat, lng], 16);
          setSearchMarker([lat, lng]);
        }
      }
    }
  };


  return (
    <div className="space-y-4">
      {/* Google Places Search */}
      {showPlacesSearch && GOOGLE_MAPS_API_KEY && (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Search for a location (optional)
            </label>
            <Autocomplete
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={onPlaceChanged}
              options={{
                componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
                fields: ['geometry', 'formatted_address', 'name'],
              }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for streets, landmarks, or areas..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                />
              </div>
            </Autocomplete>
            <p className="text-xs text-gray-500 mt-2">
              Search to find your location on the map, then draw the boundary
            </p>
          </div>
        </LoadScript>
      )}


      {/* Map */}
      <div className="relative">
        <MapContainer
          center={DEFAULT_CENTER as [number, number]}
          zoom={DEFAULT_ZOOM}
          className="h-[500px] w-full rounded-lg z-0"
          preferCanvas={false}
        >
          <MapInitializer setMap={setMap} />
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
          <FeatureGroup ref={featureGroupRef} />
        </MapContainer>

        {/* Status Indicators */}
        {drawnBoundary && (
          <div className="absolute top-4 right-4 z-[1000] bg-green-50 border border-green-200 px-3 py-2 rounded-lg shadow-lg">
            <p className="text-xs text-green-800 font-medium">✓ Boundary drawn</p>
          </div>
        )}

        {isDetectingLocation && (
          <div className="absolute top-4 left-4 z-[1000] bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <p className="text-xs text-blue-800 font-medium">Detecting location...</p>
          </div>
        )}

        {detectedLocation && !isDetectingLocation && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <p className="text-xs font-semibold text-gray-900 mb-1">📍 Detected Location</p>
            {detectedLocation.state && (
              <p className="text-xs text-gray-600">State: <strong>{detectedLocation.state}</strong></p>
            )}
            {detectedLocation.lga && (
              <p className="text-xs text-gray-600">LGA: <strong>{detectedLocation.lga}</strong></p>
            )}
            {detectedLocation.city && (
              <p className="text-xs text-gray-600">City: <strong>{detectedLocation.city}</strong></p>
            )}
            <p className="text-xs text-green-600 mt-2">You can edit this in the next step</p>
          </div>
        )}
      </div>
    </div>
  );
}

const EnhancedMapDrawer = dynamic(
  () => Promise.resolve(EnhancedMapDrawerComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }
);

export default EnhancedMapDrawer;
