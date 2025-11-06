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
  const [mapReady, setMapReady] = useState(false);
  const [drawnBoundary, setDrawnBoundary] = useState<DrawnBoundary | null>(initialBoundary || null);
  const [activeDrawMode, setActiveDrawMode] = useState<'polygon' | 'rectangle' | 'circle' | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawHandlerRef = useRef<L.Draw.Polygon | L.Draw.Rectangle | L.Draw.Circle | null>(null);
  
  const handleMapCreated = (mapInstance: L.Map) => {
    setMap(mapInstance);
    // Give it a moment for the FeatureGroup to be ready
    setTimeout(() => {
      setMapReady(true);
    }, 100);
  };

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
    <div className="space-y-4">
      {/* Instructions - Above map */}
      {!readOnly && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
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
      )}

      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: '500px', width: '100%', borderRadius: '8px' }}
          whenCreated={handleMapCreated}
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
      </div>

      {/* Drawing Tools and Action buttons - Below map */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4">
          {/* Drawing Tools */}
          {mapReady ? (
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-2">Drawing Tools:</p>
              <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => {
                      if (!map) return;
                      
                      if (!featureGroupRef.current) {
                        console.warn('FeatureGroup not ready yet');
                        return;
                      }
                      
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
                    className={`px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 flex items-center gap-2 transition-all ${
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
                      if (!map) return;
                      
                      if (!featureGroupRef.current) {
                        console.warn('FeatureGroup not ready yet');
                        return;
                      }
                      
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
                    className={`px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 ${
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
                      if (!map) return;
                      
                      if (!featureGroupRef.current) {
                        console.warn('FeatureGroup not ready yet');
                        return;
                      }
                      
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
                    className={`px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 ${
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
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="text-xs text-gray-500">Loading tools...</div>
              </div>
            )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={!drawnBoundary}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg font-semibold"
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
