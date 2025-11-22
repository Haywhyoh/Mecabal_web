'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { Comment, CreateCommentRequest, UpdateCommentRequest, CommentStats } from '@/types/social';

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  stats: CommentStats | null;
  fetchComments: (postId: string) => Promise<void>;
  createComment: (postId: string, data: CreateCommentRequest) => Promise<Comment | null>;
  updateComment: (commentId: string, data: UpdateCommentRequest) => Promise<Comment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  getCommentReplies: (commentId: string) => Promise<Comment[]>;
  fetchCommentStats: (postId: string) => Promise<void>;
  refreshComments: (postId: string) => Promise<void>;
}

export function useComments(postId?: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(postId);

  const fetchComments = useCallback(async (targetPostId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPostId(targetPostId);
      const response = await apiClient.getPostComments(targetPostId);

      if (response.success && response.data) {
        const commentsData = response.data as Comment[];
        // Organize comments into nested structure
        const topLevelComments = commentsData.filter((c) => !c.parentCommentId);
        const repliesMap = new Map<string, Comment[]>();

        commentsData.forEach((comment) => {
          if (comment.parentCommentId) {
            if (!repliesMap.has(comment.parentCommentId)) {
              repliesMap.set(comment.parentCommentId, []);
            }
            repliesMap.get(comment.parentCommentId)!.push(comment);
          }
        });

        const organizedComments = topLevelComments.map((comment) => ({
          ...comment,
          replies: repliesMap.get(comment.id) || [],
        }));

        setComments(organizedComments);
      } else {
        setError(response.error || 'Failed to fetch comments');
        setComments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createComment = useCallback(async (
    targetPostId: string,
    data: CreateCommentRequest
  ): Promise<Comment | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createComment(targetPostId, data);

      if (response.success && response.data) {
        const newComment = response.data as Comment;
        
        // Optimistic update
        if (data.parentCommentId) {
          // Add as reply
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === data.parentCommentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                };
              }
              return comment;
            })
          );
        } else {
          // Add as top-level comment
          setComments((prev) => [newComment, ...prev]);
        }

        // Refresh to get accurate data
        if (currentPostId) {
          await fetchComments(currentPostId);
        }

        return newComment;
      } else {
        setError(response.error || 'Failed to create comment');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPostId, fetchComments]);

  const updateComment = useCallback(async (
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateComment(commentId, data);

      if (response.success && response.data) {
        const updatedComment = response.data as Comment;
        
        // Update in comments array (handle both top-level and replies)
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
              return updatedComment;
            }
            // Check replies
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId ? updatedComment : reply
                ),
              };
            }
            return comment;
          })
        );

        return updatedComment;
      } else {
        setError(response.error || 'Failed to update comment');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.deleteComment(commentId);

      if (response.success) {
        // Remove from comments array (handle both top-level and replies)
        setComments((prev) =>
          prev
            .filter((comment) => comment.id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: comment.replies?.filter((reply) => reply.id !== commentId) || [],
            }))
        );
        return true;
      } else {
        setError(response.error || 'Failed to delete comment');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCommentReplies = useCallback(async (commentId: string): Promise<Comment[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCommentReplies(commentId);

      if (response.success && response.data) {
        return response.data as Comment[];
      } else {
        setError(response.error || 'Failed to fetch replies');
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch replies');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommentStats = useCallback(async (targetPostId: string) => {
    try {
      setError(null);
      const response = await apiClient.getCommentStats(targetPostId);

      if (response.success && response.data) {
        setStats(response.data as CommentStats);
      } else {
        setError(response.error || 'Failed to fetch comment stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comment stats');
    }
  }, []);

  const refreshComments = useCallback(async (targetPostId: string) => {
    await fetchComments(targetPostId);
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    stats,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentReplies,
    fetchCommentStats,
    refreshComments,
  };
}

