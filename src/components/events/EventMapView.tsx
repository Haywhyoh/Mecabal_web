'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import type { Event } from '@/types/event';

interface EventMapViewProps {
  events: Event[];
  userLocation?: { latitude: number; longitude: number };
  onEventPress?: (event: Event) => void;
}

export default function EventMapView({
  events,
  userLocation,
  onEventPress,
}: EventMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic map view - can be enhanced with Leaflet or Google Maps later
    // For now, show a list of events with their locations
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No events to display on map</p>
      </div>
    );
  }

  // Group events by location for display
  const eventsByLocation = events.reduce((acc, event) => {
    const key = `${event.location.latitude},${event.location.longitude}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Map Placeholder */}
      <div
        ref={mapRef}
        className="w-full h-96 bg-gray-100 rounded-t-lg flex items-center justify-center relative"
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Map view coming soon</p>
          <p className="text-sm text-gray-500 mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Event Markers (simplified) */}
        {Object.entries(eventsByLocation).map(([location, locationEvents], index) => {
          const [lat, lng] = location.split(',').map(Number);
          // Simple positioning (would need proper map library for real coordinates)
          const x = 20 + (index % 4) * 25;
          const y = 20 + Math.floor(index / 4) * 25;

          return (
            <div
              key={location}
              className="absolute cursor-pointer group"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => onEventPress?.(locationEvents[0])}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                style={{
                  backgroundColor: locationEvents[0].category.colorCode,
                }}
              >
                <span className="text-white text-xs font-bold">
                  {locationEvents.length > 1 ? locationEvents.length : ''}
                </span>
              </div>
              {locationEvents.length > 1 && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {locationEvents.length} events here
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Events List */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Events by Location ({Object.keys(eventsByLocation).length} locations)
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(eventsByLocation).map(([location, locationEvents]) => (
            <div
              key={location}
              className="p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => onEventPress?.(locationEvents[0])}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {locationEvents[0].location.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {locationEvents[0].location.address}
                  </p>
                  {locationEvents.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {locationEvents.length} events at this location
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

