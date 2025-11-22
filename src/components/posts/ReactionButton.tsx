'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, Heart, Laugh, Angry, Sad } from 'lucide-react';
import ReactionPicker from './ReactionPicker';
import type { ReactionType, ReactionCounts } from '@/types/social';

interface ReactionButtonProps {
  postId: string;
  counts: ReactionCounts | null;
  userReaction: ReactionType | null;
  onReaction: (postId: string, reactionType: ReactionType) => Promise<void>;
  onRemoveReaction: (postId: string) => Promise<void>;
  loading?: boolean;
}

const reactionConfig: Record<ReactionType, { icon: React.ComponentType<{ className?: string }>; label: string; emoji: string }> = {
  like: { icon: ThumbsUp, label: 'Like', emoji: '👍' },
  love: { icon: Heart, label: 'Love', emoji: '❤️' },
  laugh: { icon: Laugh, label: 'Laugh', emoji: '😂' },
  angry: { icon: Angry, label: 'Angry', emoji: '😠' },
  sad: { icon: Sad, label: 'Sad', emoji: '😢' },
};

export default function ReactionButton({
  postId,
  counts,
  userReaction,
  onReaction,
  onRemoveReaction,
  loading = false,
}: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (userReaction === reactionType) {
      await onRemoveReaction(postId);
    } else {
      await onReaction(postId, reactionType);
    }
    setShowPicker(false);
  };

  const handleRemoveReaction = async () => {
    await onRemoveReaction(postId);
    setShowPicker(false);
  };

  const totalCount = counts
    ? Object.values(counts).reduce((sum, count) => sum + count, 0)
    : 0;

  const getPrimaryReaction = () => {
    if (userReaction) {
      return reactionConfig[userReaction];
    }
    if (counts) {
      // Find the reaction with the highest count
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0 && sorted[0][1] > 0) {
        return reactionConfig[sorted[0][0] as ReactionType];
      }
    }
    return reactionConfig.like; // Default
  };

  const primaryReaction = getPrimaryReaction();
  const PrimaryIcon = primaryReaction.icon;

  return (
    <div ref={buttonRef} className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
          userReaction
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="React to post"
      >
        <PrimaryIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {totalCount > 0 ? totalCount : 'React'}
        </span>
      </button>

      {showPicker && (
        <ReactionPicker
          currentReaction={userReaction}
          onSelect={handleReactionClick}
          onRemove={handleRemoveReaction}
          position="top"
        />
      )}

      {/* Reaction counts tooltip on hover */}
      {counts && totalCount > 0 && (
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {Object.entries(counts)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => (
              <span key={type} className="mr-2">
                {reactionConfig[type as ReactionType].emoji} {count}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

