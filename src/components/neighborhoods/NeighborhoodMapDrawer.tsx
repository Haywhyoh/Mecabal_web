'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { fixLeafletMarkerIcons, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/leafletConfig';

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
}: NeighborhoodMapDrawerProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [drawnBoundary, setDrawnBoundary] = useState<DrawnBoundary | null>(initialBoundary || null);
  const [activeDrawMode, setActiveDrawMode] = useState<'polygon' | 'rectangle' | 'circle' | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawHandlerRef = useRef<L.Draw.Polygon | L.Draw.Rectangle | L.Draw.Circle | null>(null);

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

  // Load initial boundary
  useEffect(() => {
    if (initialBoundary && featureGroupRef.current) {
      const coords = initialBoundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
      const polygon = L.polygon(coords, {
        color: readOnly ? '#3b82f6' : '#10b981',
        weight: 3,
      });
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(polygon);
    }
  }, [initialBoundary, readOnly]);

  const handleSave = () => {
    if (drawnBoundary && onBoundaryDrawn) {
      onBoundaryDrawn(drawnBoundary);
    }
  };

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={featureGroupRef}>
          {/* Drawn shapes will be added here */}
        </FeatureGroup>

        {/* Show user location */}
        <Marker position={center}>
          <Popup>Your Location</Popup>
        </Marker>
      </MapContainer>

      {/* Fallback Drawing Tools - Always visible as backup */}
      {!readOnly && map && (
        <div className="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-1">
          <p className="text-xs text-gray-600 mb-1 px-2 font-medium">Quick Draw:</p>
          <button
            type="button"
            onClick={() => {
              // Try to find and click the polygon button from Leaflet Draw
              const polygonBtn = map.getContainer().querySelector('.leaflet-draw-draw-polygon') as HTMLElement;
              if (polygonBtn) {
                polygonBtn.click();
              } else {
                // If Leaflet Draw button not found, show helpful message
                alert('Please use the drawing tools in the top-right corner of the map. If you don\'t see them, try refreshing the page.');
              }
            }}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1.5"
            title="Draw Polygon (click points on map)"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 2h2v2H2V2zm4 0h2v2H6V2zm4 0h2v2h-2V2zm4 0h2v2h-2V2zm4 0h2v2h-2V2zM2 6h2v2H2V6zm4 0h2v2H6V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM2 10h2v2H2v-2zm4 0h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM2 14h2v2H2v-2zm4 0h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM2 18h2v2H2v-2zm4 0h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
            </svg>
            Polygon
          </button>
          <button
            type="button"
            onClick={() => {
              const rectBtn = map.getContainer().querySelector('.leaflet-draw-draw-rectangle') as HTMLElement;
              if (rectBtn) {
                rectBtn.click();
              }
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            title="Draw Rectangle (click and drag)"
          >
            Rectangle
          </button>
          <button
            type="button"
            onClick={() => {
              const circleBtn = map.getContainer().querySelector('.leaflet-draw-draw-circle') as HTMLElement;
              if (circleBtn) {
                circleBtn.click();
              }
            }}
            className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
            title="Draw Circle (click and drag)"
          >
            Circle
          </button>
        </div>
      )}

      {/* Action buttons */}
      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!drawnBoundary}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            Save Boundary
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      {!readOnly && (
        <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-3 rounded-lg shadow-lg max-w-sm border border-gray-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong className="text-gray-900">How to draw your neighborhood:</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Look for the <strong>drawing tools in the top-right corner</strong> of the map</li>
            <li>Click the <strong>polygon tool</strong> (square icon) to draw a custom boundary</li>
            <li>Or use the <strong>rectangle</strong> or <strong>circle</strong> tools</li>
            <li>Click on the map to place points, double-click to finish</li>
            <li>You can edit or delete your drawing using the edit tools</li>
          </ul>
          {!drawnBoundary && (
            <p className="text-xs text-amber-600 mt-2 font-medium">
              💡 Tip: The drawing tools appear as icons in the top-right corner of the map
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Export with dynamic import to avoid SSR issues
const NeighborhoodMapDrawer = dynamic(
  () => Promise.resolve(MapDrawerComponent),
  { ssr: false, loading: () => <div className="h-[500px] w-full bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div> }
);

export default NeighborhoodMapDrawer;
