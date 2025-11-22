'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { MediaInfo } from '@/types/social';

interface MediaGalleryProps {
  media: MediaInfo[];
  initialIndex?: number;
  onClose?: () => void;
}

export default function MediaGallery({ media, initialIndex = 0, onClose }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const hasMultiple = media.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape' && onClose) onClose();
  };

  // Grid view for multiple images
  if (!onClose && media.length > 1) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {media.map((item, index) => (
          <div
            key={item.id || index}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setCurrentIndex(index)}
          >
            {item.type === 'image' ? (
              <Image
                src={item.url}
                alt={item.caption || `Media ${index + 1}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Lightbox view
  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors z-10"
          aria-label="Close gallery"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {hasMultiple && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors z-10"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors z-10"
            aria-label="Next media"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        {currentMedia.type === 'image' ? (
          <div className="relative w-full h-full">
            <Image
              src={currentMedia.url}
              alt={currentMedia.caption || 'Media'}
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <video
            src={currentMedia.url}
            controls
            className="max-w-full max-h-full"
            autoPlay
          />
        )}

        {currentMedia.caption && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg max-w-2xl">
            <p className="text-sm">{currentMedia.caption}</p>
          </div>
        )}
      </div>

      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      )}

      {hasMultiple && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>
  );
}

