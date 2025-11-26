'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Event } from '@/types/event';

interface EventCalendarViewProps {
  events: Event[];
  onEventPress?: (event: Event) => void;
  onDateSelect?: (date: Date) => void;
}

export default function EventCalendarView({
  events,
  onEventPress,
  onDateSelect,
}: EventCalendarViewProps) {
  // Basic calendar view - can be enhanced with a full calendar library later
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.eventDate).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getDateString = (day: number | null) => {
    if (day === null) return '';
    const date = new Date(currentYear, currentMonth, day);
    return date.toISOString().split('T')[0];
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <CalendarIcon className="w-5 h-5 text-gray-600" />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dateString = getDateString(day);
          const dayEvents = dateString ? eventsByDate[dateString] || [] : [];
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          return (
            <div
              key={index}
              className={`
                min-h-[60px] p-1 border border-gray-200 rounded
                ${day === null ? 'bg-gray-50' : 'bg-white hover:bg-gray-50 cursor-pointer'}
                ${isToday ? 'border-green-500 border-2' : ''}
              `}
              onClick={() => {
                if (day !== null && onDateSelect) {
                  onDateSelect(new Date(currentYear, currentMonth, day));
                }
              }}
            >
              {day !== null && (
                <>
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs px-1 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: `${event.category.colorCode}20`,
                            color: event.category.colorCode,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventPress?.(event);
                          }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Events List for Selected Date */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Upcoming Events</h4>
          <div className="space-y-2">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => onEventPress?.(event)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: event.category.colorCode }}
                  />
                  <span className="text-sm font-medium text-gray-900">{event.title}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

