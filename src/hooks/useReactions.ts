'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { Reaction, ReactionType, ReactionCounts, ReactionStats } from '@/types/social';

interface UseReactionsReturn {
  reactions: Reaction[];
  counts: ReactionCounts | null;
  stats: ReactionStats | null;
  userReaction: ReactionType | null;
  loading: boolean;
  error: string | null;
  fetchReactions: (postId: string) => Promise<void>;
  fetchReactionCounts: (postId: string) => Promise<void>;
  fetchReactionStats: (postId: string) => Promise<void>;
  addReaction: (postId: string, reactionType: ReactionType) => Promise<boolean>;
  removeReaction: (postId: string) => Promise<boolean>;
  refreshReactions: (postId: string) => Promise<void>;
}

export function useReactions(postId?: string): UseReactionsReturn {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [counts, setCounts] = useState<ReactionCounts | null>(null);
  const [stats, setStats] = useState<ReactionStats | null>(null);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(postId);

  const fetchReactions = useCallback(async (targetPostId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPostId(targetPostId);
      const response = await apiClient.getPostReactions(targetPostId);

      if (response.success && response.data) {
        const reactionsData = response.data as Reaction[];
        setReactions(reactionsData);
        
        // Find user's reaction (assuming we can get current user ID from context/localStorage)
        // For now, we'll get it from stats
      } else {
        setError(response.error || 'Failed to fetch reactions');
        setReactions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reactions');
      setReactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReactionCounts = useCallback(async (targetPostId: string) => {
    try {
      setError(null);
      const response = await apiClient.getPostReactionCounts(targetPostId);

      if (response.success && response.data) {
        setCounts(response.data as ReactionCounts);
      } else {
        setError(response.error || 'Failed to fetch reaction counts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reaction counts');
    }
  }, []);

  const fetchReactionStats = useCallback(async (targetPostId: string) => {
    try {
      setError(null);
      const response = await apiClient.getPostReactionStats(targetPostId);

      if (response.success && response.data) {
        const statsData = response.data as ReactionStats;
        setStats(statsData);
        setUserReaction(statsData.topReaction as ReactionType | null);
      } else {
        setError(response.error || 'Failed to fetch reaction stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reaction stats');
    }
  }, []);

  const addReaction = useCallback(async (
    targetPostId: string,
    reactionType: ReactionType
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      const previousUserReaction = userReaction;
      setUserReaction(reactionType);
      
      if (counts) {
        // Update counts optimistically
        if (previousUserReaction && counts[previousUserReaction]) {
          setCounts((prev) => ({
            ...prev!,
            [previousUserReaction]: Math.max(0, (prev![previousUserReaction] || 0) - 1),
          }));
        }
        setCounts((prev) => ({
          ...prev!,
          [reactionType]: (prev![reactionType] || 0) + 1,
        }));
      }

      const response = await apiClient.addReaction(targetPostId, reactionType);

      if (response.success) {
        // Refresh to get accurate data
        await Promise.all([
          fetchReactionCounts(targetPostId),
          fetchReactionStats(targetPostId),
        ]);
        return true;
      } else {
        // Rollback optimistic update
        setUserReaction(previousUserReaction);
        setError(response.error || 'Failed to add reaction');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userReaction, counts, fetchReactionCounts, fetchReactionStats]);

  const removeReaction = useCallback(async (targetPostId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      const previousUserReaction = userReaction;
      setUserReaction(null);
      
      if (counts && previousUserReaction) {
        setCounts((prev) => ({
          ...prev!,
          [previousUserReaction]: Math.max(0, (prev![previousUserReaction] || 0) - 1),
        }));
      }

      const response = await apiClient.removeReaction(targetPostId);

      if (response.success) {
        // Refresh to get accurate data
        await Promise.all([
          fetchReactionCounts(targetPostId),
          fetchReactionStats(targetPostId),
        ]);
        return true;
      } else {
        // Rollback optimistic update
        setUserReaction(previousUserReaction);
        setError(response.error || 'Failed to remove reaction');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove reaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userReaction, counts, fetchReactionCounts, fetchReactionStats]);

  const refreshReactions = useCallback(async (targetPostId: string) => {
    await Promise.all([
      fetchReactions(targetPostId),
      fetchReactionCounts(targetPostId),
      fetchReactionStats(targetPostId),
    ]);
  }, [fetchReactions, fetchReactionCounts, fetchReactionStats]);

  return {
    reactions,
    counts,
    stats,
    userReaction,
    loading,
    error,
    fetchReactions,
    fetchReactionCounts,
    fetchReactionStats,
    addReaction,
    removeReaction,
    refreshReactions,
  };
}

