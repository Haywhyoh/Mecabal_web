'use client';

import React from 'react';
import { ThumbsUp, Heart, Laugh, Angry, Sad } from 'lucide-react';
import type { ReactionType } from '@/types/social';

interface ReactionPickerProps {
  currentReaction?: ReactionType | null;
  onSelect: (reactionType: ReactionType) => void;
  onRemove: () => void;
  position?: 'top' | 'bottom';
}

const reactionConfig: Record<ReactionType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  like: { icon: ThumbsUp, label: 'Like', color: 'text-blue-600 hover:bg-blue-100' },
  love: { icon: Heart, label: 'Love', color: 'text-red-600 hover:bg-red-100' },
  laugh: { icon: Laugh, label: 'Laugh', color: 'text-yellow-600 hover:bg-yellow-100' },
  angry: { icon: Angry, label: 'Angry', color: 'text-orange-600 hover:bg-orange-100' },
  sad: { icon: Sad, label: 'Sad', color: 'text-purple-600 hover:bg-purple-100' },
};

export default function ReactionPicker({
  currentReaction,
  onSelect,
  onRemove,
  position = 'top',
}: ReactionPickerProps) {
  return (
    <div
      className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 z-50 bg-white rounded-full shadow-lg border border-gray-200 p-1 flex items-center gap-1`}
    >
      {Object.entries(reactionConfig).map(([type, config]) => {
        const Icon = config.icon;
        const isActive = currentReaction === type;
        
        return (
          <button
            key={type}
            type="button"
            onClick={() => {
              if (isActive) {
                onRemove();
              } else {
                onSelect(type as ReactionType);
              }
            }}
            className={`p-2 rounded-full transition-colors ${
              isActive
                ? 'bg-gray-100 scale-110'
                : config.color
            }`}
            aria-label={config.label}
            title={config.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}

