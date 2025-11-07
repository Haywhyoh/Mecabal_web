'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { fixLeafletMarkerIcons, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/leafletConfig';
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

interface NeighborhoodMapDrawerProps {
  center?: [number, number];
  initialBoundary?: DrawnBoundary;
  onBoundaryDrawn?: (boundary: DrawnBoundary) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  lgaId?: string; // LGA ID to fetch existing neighborhoods
  showUserLocation?: boolean; // Show user's current location marker
}

// Fix Leaflet icons
if (typeof window !== 'undefined') {
  fixLeafletMarkerIcons();
}

function MapDrawerComponent({
  center = DEFAULT_CENTER as [number, number],
  initialBoundary,
  onBoundaryDrawn,
  onCancel,
  readOnly = false,
  lgaId,
  showUserLocation = true,
}: NeighborhoodMapDrawerProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [drawnBoundary, setDrawnBoundary] = useState<DrawnBoundary | null>(initialBoundary || null);
  const [activeDrawMode, setActiveDrawMode] = useState<'polygon' | 'rectangle' | 'circle' | null>(null);
  const [existingNeighborhoods, setExistingNeighborhoods] = useState<any[]>([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawHandlerRef = useRef<L.Draw.Polygon | L.Draw.Rectangle | L.Draw.Circle | null>(null);
  const existingLayersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const featureGroup = featureGroupRef.current;

    // Handle drawn shapes (set up before adding control)
    const handleCreated = (event: any) => {
      const layer = event.layer;
      featureGroup.clearLayers();
      featureGroup.addLayer(layer);

      // Convert to GeoJSON
      const geoJSON = layer.toGeoJSON();
      
      // Ensure coordinates are in the correct format [lng, lat]
      let coordinates = geoJSON.geometry.coordinates;
      
      // If it's a Polygon, coordinates is already [lng, lat][]
      // If it's a different geometry type, we need to handle it
      if (geoJSON.geometry.type === 'Polygon') {
        coordinates = geoJSON.geometry.coordinates;
      } else if (geoJSON.geometry.type === 'Circle') {
        // Convert circle to polygon approximation
        const center = (layer as any).getLatLng();
        const radius = (layer as any).getRadius();
        const points = 32; // Number of points to approximate circle
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
      
      // Auto-save if callback is provided
      if (onBoundaryDrawn) {
        onBoundaryDrawn(boundary);
      }
    };

    const handleEdited = (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        const geoJSON = layer.toGeoJSON();
        const boundary: DrawnBoundary = {
          type: 'Polygon',
          coordinates: geoJSON.geometry.coordinates,
        };
        setDrawnBoundary(boundary);
        if (onBoundaryDrawn) {
          onBoundaryDrawn(boundary);
        }
      });
    };

    const handleDeleted = () => {
      setDrawnBoundary(null);
    };

    // Add draw control if not read-only
    if (!readOnly) {
      // Wait for map to be fully ready
      map.whenReady(() => {
        drawControlRef.current = new L.Control.Draw({
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
              tooltip: {
                start: 'Click to start drawing polygon',
                cont: 'Click to continue drawing',
                end: 'Click first point to close this polygon',
              },
            },
            rectangle: {
              shapeOptions: {
                color: '#10b981',
                weight: 3,
                fillColor: '#10b981',
                fillOpacity: 0.2,
              },
              tooltip: {
                start: 'Click and drag to draw rectangle',
              },
            },
            circle: {
              shapeOptions: {
                color: '#10b981',
                weight: 3,
                fillColor: '#10b981',
                fillOpacity: 0.2,
              },
              tooltip: {
                start: 'Click and drag to draw circle',
              },
            },
            polyline: false,
            marker: false,
            circlemarker: false,
          },
          edit: {
            featureGroup: featureGroup,
            remove: true,
            edit: {
              selectedPathOptions: {
                color: '#10b981',
                weight: 4,
              },
            },
          },
        });

        if (drawControlRef.current) {
          map.addControl(drawControlRef.current);
        }
        
        // Attach event handlers
        map.on(L.Draw.Event.CREATED, handleCreated);
        map.on(L.Draw.Event.EDITED, handleEdited);
        map.on(L.Draw.Event.DELETED, handleDeleted);
        
        // Force the control to be visible by ensuring it's in the DOM
        setTimeout(() => {
          const controlContainer = map.getContainer().querySelector('.leaflet-draw');
          if (controlContainer) {
            (controlContainer as HTMLElement).style.display = 'block';
            (controlContainer as HTMLElement).style.zIndex = '1000';
            (controlContainer as HTMLElement).style.visibility = 'visible';
            (controlContainer as HTMLElement).style.opacity = '1';
            // Also ensure toolbar is visible
            const toolbar = controlContainer.querySelector('.leaflet-draw-toolbar');
            if (toolbar) {
              (toolbar as HTMLElement).style.display = 'block';
              (toolbar as HTMLElement).style.visibility = 'visible';
            }
          } else {
            console.warn('Leaflet Draw control container not found. Using fallback buttons.');
          }
        }, 300);
      });
    }

    return () => {
      if (map) {
        map.off(L.Draw.Event.CREATED, handleCreated);
        map.off(L.Draw.Event.EDITED, handleEdited);
        map.off(L.Draw.Event.DELETED, handleDeleted);
        if (drawControlRef.current) {
          map.removeControl(drawControlRef.current);
          drawControlRef.current = null;
        }
      }
    };
  }, [map, readOnly, onBoundaryDrawn]);

  // Fetch existing neighborhoods for the LGA
  useEffect(() => {
    if (!lgaId || !map) return;

    const fetchNeighborhoods = async () => {
      setIsLoadingNeighborhoods(true);
      try {
        const response = await apiClient.request(`/location/neighborhoods?lgaId=${lgaId}&limit=100`);
        if (response.success && response.data) {
          setExistingNeighborhoods(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch existing neighborhoods:', error);
      } finally {
        setIsLoadingNeighborhoods(false);
      }
    };

    fetchNeighborhoods();
  }, [lgaId, map]);

  // Display existing neighborhoods on the map
  useEffect(() => {
    if (!map || existingNeighborhoods.length === 0) return;

    // Create a layer group for existing neighborhoods if it doesn't exist
    if (!existingLayersRef.current) {
      existingLayersRef.current = L.layerGroup().addTo(map);
    }

    // Clear existing layers
    existingLayersRef.current.clearLayers();

    // Add each neighborhood to the map
    existingNeighborhoods.forEach((neighborhood) => {
      if (neighborhood.boundaries?.coordinates) {
        const coords = neighborhood.boundaries.coordinates[0].map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        );

        const polygon = L.polygon(coords, {
          color: '#9ca3af', // Gray color for existing neighborhoods
          fillColor: '#e5e7eb',
          fillOpacity: 0.3,
          weight: 2,
          dashArray: '5, 5', // Dashed line
        });

        polygon.bindPopup(`
          <div class="p-2">
            <h4 class="font-bold text-sm">${neighborhood.name}</h4>
            <p class="text-xs text-gray-600">${neighborhood.type}</p>
            ${neighborhood.isGated ? '<span class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Gated</span>' : ''}
          </div>
        `);

        existingLayersRef.current?.addLayer(polygon);
      }
    });

    return () => {
      if (existingLayersRef.current) {
        existingLayersRef.current.clearLayers();
      }
    };
  }, [map, existingNeighborhoods]);

  // Get user's current location
  useEffect(() => {
    if (!showUserLocation || !map) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);

          // Create a custom icon for user location
          const userIcon = L.divIcon({
            html: `
              <div style="position: relative;">
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #3b82f6;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                "></div>
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 40px;
                  height: 40px;
                  background: rgba(59, 130, 246, 0.2);
                  border-radius: 50%;
                  animation: pulse 2s infinite;
                "></div>
              </div>
            `,
            className: 'user-location-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          // Add user location marker
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('📍 Your Location');
        },
        (error) => {
          console.log('Could not get user location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [map, showUserLocation]);

  // Load initial boundary
  useEffect(() => {
    if (initialBoundary && featureGroupRef.current) {
      const coords = initialBoundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
      const polygon = L.polygon(coords, {
        color: readOnly ? '#3b82f6' : '#10b981',
        weight: 3,
        fillOpacity: readOnly ? 0.2 : 0.3,
      });
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(polygon);

      // Fit map to boundary if in read-only mode (edit view)
      if (readOnly && map) {
        map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
      }
    }
  }, [initialBoundary, readOnly, map]);

  const handleSave = () => {
    if (drawnBoundary && onBoundaryDrawn) {
      onBoundaryDrawn(drawnBoundary);
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions and Drawing Tools - Outside map */}
      {!readOnly && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Instructions */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                How to draw your neighborhood:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Click a drawing tool below to activate it</li>
                <li><strong>Polygon:</strong> Click points on the map, double-click to finish</li>
                <li><strong>Rectangle:</strong> Click and drag on the map</li>
                <li><strong>Circle:</strong> Click center, drag to set radius</li>
                <li>Click <strong>"Clear"</strong> to remove your drawing and start over</li>
              </ul>
              {activeDrawMode && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✏️ Drawing mode active: <strong>{activeDrawMode}</strong> - Click on the map to draw
                </p>
              )}
            </div>

            {/* Drawing Tools */}
            <div className="lg:min-w-[200px]">
              <p className="text-sm font-semibold text-gray-900 mb-2">Drawing Tools:</p>
              <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (!map || !featureGroupRef.current) return;
              
              // Cancel any existing drawing
              if (drawHandlerRef.current) {
                drawHandlerRef.current.disable();
                drawHandlerRef.current = null;
              }
              
              // Toggle polygon mode
              if (activeDrawMode === 'polygon') {
                // Cancel drawing
                setActiveDrawMode(null);
              } else {
                setActiveDrawMode('polygon');
                // Create polygon draw handler
                const polygonHandler = new L.Draw.Polygon(map, {
                  shapeOptions: {
                    color: '#10b981',
                    weight: 3,
                    fillColor: '#10b981',
                    fillOpacity: 0.2,
                  },
                  allowIntersection: false,
                });
                
                drawHandlerRef.current = polygonHandler;
                polygonHandler.enable();
                
                // Handle completion
                map.once(L.Draw.Event.CREATED, (event: any) => {
                  const layer = event.layer;
                  featureGroupRef.current?.clearLayers();
                  featureGroupRef.current?.addLayer(layer);
                  
                  const geoJSON = layer.toGeoJSON();
                  const boundary: DrawnBoundary = {
                    type: 'Polygon',
                    coordinates: geoJSON.geometry.coordinates,
                  };
                  
                  setDrawnBoundary(boundary);
                  setActiveDrawMode(null);
                  polygonHandler.disable();
                  drawHandlerRef.current = null;
                  
                  if (onBoundaryDrawn) {
                    onBoundaryDrawn(boundary);
                  }
                });
              }
            }}
            className={`px-3 py-2 text-white rounded text-sm hover:opacity-90 flex items-center gap-2 transition-all ${
              activeDrawMode === 'polygon' 
                ? 'bg-green-700 ring-2 ring-green-400' 
                : 'bg-green-600'
            }`}
            title="Draw Polygon (click points on map, double-click to finish)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {activeDrawMode === 'polygon' ? 'Drawing...' : 'Polygon'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!map || !featureGroupRef.current) return;
              
              if (drawHandlerRef.current) {
                drawHandlerRef.current.disable();
                drawHandlerRef.current = null;
              }
              
              if (activeDrawMode === 'rectangle') {
                setActiveDrawMode(null);
              } else {
                setActiveDrawMode('rectangle');
                const rectHandler = new L.Draw.Rectangle(map, {
                  shapeOptions: {
                    color: '#10b981',
                    weight: 3,
                    fillColor: '#10b981',
                    fillOpacity: 0.2,
                  },
                });
                
                drawHandlerRef.current = rectHandler;
                rectHandler.enable();
                
                map.once(L.Draw.Event.CREATED, (event: any) => {
                  const layer = event.layer;
                  featureGroupRef.current?.clearLayers();
                  featureGroupRef.current?.addLayer(layer);
                  
                  const geoJSON = layer.toGeoJSON();
                  const boundary: DrawnBoundary = {
                    type: 'Polygon',
                    coordinates: geoJSON.geometry.coordinates,
                  };
                  
                  setDrawnBoundary(boundary);
                  setActiveDrawMode(null);
                  rectHandler.disable();
                  drawHandlerRef.current = null;
                  
                  if (onBoundaryDrawn) {
                    onBoundaryDrawn(boundary);
                  }
                });
              }
            }}
            className={`px-3 py-2 text-white rounded text-sm hover:opacity-90 ${
              activeDrawMode === 'rectangle' 
                ? 'bg-blue-700 ring-2 ring-blue-400' 
                : 'bg-blue-600'
            }`}
            title="Draw Rectangle (click and drag on map)"
          >
            {activeDrawMode === 'rectangle' ? 'Drawing...' : 'Rectangle'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!map || !featureGroupRef.current) return;
              
              if (drawHandlerRef.current) {
                drawHandlerRef.current.disable();
                drawHandlerRef.current = null;
              }
              
              if (activeDrawMode === 'circle') {
                setActiveDrawMode(null);
              } else {
                setActiveDrawMode('circle');
                const circleHandler = new L.Draw.Circle(map, {
                  shapeOptions: {
                    color: '#10b981',
                    weight: 3,
                    fillColor: '#10b981',
                    fillOpacity: 0.2,
                  },
                });
                
                drawHandlerRef.current = circleHandler;
                circleHandler.enable();
                
                map.once(L.Draw.Event.CREATED, (event: any) => {
                  const layer = event.layer;
                  featureGroupRef.current?.clearLayers();
                  featureGroupRef.current?.addLayer(layer);
                  
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
                  
                  const boundary: DrawnBoundary = {
                    type: 'Polygon',
                    coordinates: [circleCoords],
                  };
                  
                  setDrawnBoundary(boundary);
                  setActiveDrawMode(null);
                  circleHandler.disable();
                  drawHandlerRef.current = null;
                  
                  if (onBoundaryDrawn) {
                    onBoundaryDrawn(boundary);
                  }
                });
              }
            }}
            className={`px-3 py-2 text-white rounded text-sm hover:opacity-90 ${
              activeDrawMode === 'circle' 
                ? 'bg-purple-700 ring-2 ring-purple-400' 
                : 'bg-purple-600'
            }`}
            title="Draw Circle (click center and drag to set radius)"
          >
            {activeDrawMode === 'circle' ? 'Drawing...' : 'Circle'}
          </button>
          {drawnBoundary && (
            <button
              type="button"
              onClick={() => {
                if (drawHandlerRef.current) {
                  drawHandlerRef.current.disable();
                  drawHandlerRef.current = null;
                }
                setActiveDrawMode(null);
                setDrawnBoundary(null);
                featureGroupRef.current?.clearLayers();
              }}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 mt-1"
            >
              Clear
            </button>
          )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The actual map */}
      <div className="relative">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          className="h-[500px] w-full rounded-lg z-0"
        >
          <MapInitializer setMap={setMap} />
          {/* Google Maps Tiles - Better street detail */}
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
          {/* Alternative: Google Satellite + Roads Hybrid
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
          */}
          <FeatureGroup ref={featureGroupRef} />
        </MapContainer>

        {/* Status indicator */}
        {drawnBoundary && (
          <div className="absolute top-4 right-4 z-[1000] bg-green-50 border border-green-200 px-3 py-2 rounded-lg shadow-lg">
            <p className="text-xs text-green-800 font-medium">
              ✓ Boundary drawn
            </p>
          </div>
        )}

        {/* Existing neighborhoods info */}
        {existingNeighborhoods.length > 0 && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-lg max-w-xs">
            <p className="text-xs font-semibold text-gray-900 mb-1">
              📍 Existing Neighborhoods ({existingNeighborhoods.length})
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Gray dashed areas show neighborhoods already in this LGA. Click them to see details.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-400"></div>
                <span className="text-gray-600">Existing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-green-600"></div>
                <span className="text-gray-600">Your drawing</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoadingNeighborhoods && (
          <div className="absolute top-4 left-4 z-[1000] bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg shadow-lg">
            <p className="text-xs text-blue-800 font-medium">
              Loading existing neighborhoods...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export with dynamic import to avoid SSR issues
const NeighborhoodMapDrawer = dynamic(
  () => Promise.resolve(MapDrawerComponent),
  { ssr: false, loading: () => <div className="h-[500px] w-full bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div> }
);

export default NeighborhoodMapDrawer;
