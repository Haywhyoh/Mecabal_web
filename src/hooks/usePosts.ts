'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { Post, PaginatedPosts, PostFilter, CreatePostRequest, UpdatePostRequest } from '@/types/social';

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  fetchPosts: (filters?: PostFilter) => Promise<void>;
  createPost: (data: CreatePostRequest) => Promise<Post | null>;
  updatePost: (id: string, data: UpdatePostRequest) => Promise<Post | null>;
  deletePost: (id: string) => Promise<boolean>;
  pinPost: (id: string, isPinned: boolean) => Promise<Post | null>;
  getPostById: (id: string) => Promise<Post | null>;
  refreshPosts: () => Promise<void>;
}

export function usePosts(initialFilters?: PostFilter): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePostsReturn['pagination']>(null);
  const [currentFilters, setCurrentFilters] = useState<PostFilter | undefined>(initialFilters);

  const fetchPosts = useCallback(async (filters?: PostFilter) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = filters || currentFilters || {};
      
      console.log('🔵 Fetching posts with filters:', filtersToUse);
      const response = await apiClient.getPosts(filtersToUse);
      console.log('🔵 Posts API response:', { 
        success: response.success, 
        hasData: !!response.data, 
        error: response.error,
        responseKeys: response.data ? Object.keys(response.data) : [],
        responseDataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });

      if (response.success && response.data) {
        // The API client spreads the response, so if backend returns { data: [...], total: 10, ... }
        // We get { success: true, data: { data: [...], total: 10, ... }, total: 10, ... }
        // So response.data should be the PaginatedPostsDto
        let data: PaginatedPosts;
        
        if (Array.isArray(response.data)) {
          // If response.data is an array, wrap it in pagination structure
          data = {
            data: response.data,
            total: response.data.length,
            page: 1,
            limit: response.data.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          };
        } else if ((response.data as any).data !== undefined) {
          // response.data is the PaginatedPostsDto
          data = response.data as PaginatedPosts;
        } else {
          // Try to get from spread properties
          data = {
            data: (response as any).data || [],
            total: (response as any).total || 0,
            page: (response as any).page || 1,
            limit: (response as any).limit || 20,
            totalPages: (response as any).totalPages || 0,
            hasNext: (response as any).hasNext || false,
            hasPrev: (response as any).hasPrev || false,
          };
        }
        
        console.log('🔵 Posts data parsed:', { 
          postsCount: data.data?.length || 0, 
          total: data.total, 
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev
        });
        setPosts(data.data || []);
        setPagination({
          page: data.page || 1,
          limit: data.limit || 20,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
          hasNext: data.hasNext || false,
          hasPrev: data.hasPrev || false,
        });
        setCurrentFilters(filtersToUse);
      } else {
        console.error('❌ Failed to fetch posts:', response.error);
        setError(response.error || 'Failed to fetch posts');
        setPosts([]);
      }
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const createPost = useCallback(async (data: CreatePostRequest): Promise<Post | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createPost(data);

      if (response.success && response.data) {
        const newPost = response.data as Post;
        setPosts((prev) => [newPost, ...prev]);
        return newPost;
      } else {
        setError(response.error || 'Failed to create post');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: string, data: UpdatePostRequest): Promise<Post | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updatePost(id, data);

      if (response.success && response.data) {
        const updatedPost = response.data as Post;
        setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));
        return updatedPost;
      } else {
        setError(response.error || 'Failed to update post');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.deletePost(id);

      if (response.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        return true;
      } else {
        setError(response.error || 'Failed to delete post');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const pinPost = useCallback(async (id: string, isPinned: boolean): Promise<Post | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.pinPost(id, isPinned);

      if (response.success && response.data) {
        const updatedPost = response.data as Post;
        setPosts((prev) => {
          const filtered = prev.filter((p) => p.id !== id);
          if (isPinned) {
            return [updatedPost, ...filtered];
          } else {
            return [...filtered, updatedPost];
          }
        });
        return updatedPost;
      } else {
        setError(response.error || 'Failed to pin post');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pin post');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostById = useCallback(async (id: string): Promise<Post | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPostById(id);

      if (response.success && response.data) {
        return response.data as Post;
      } else {
        setError(response.error || 'Failed to fetch post');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPosts = useCallback(async () => {
    await fetchPosts(currentFilters);
  }, [fetchPosts, currentFilters]);

  return {
    posts,
    loading,
    error,
    pagination,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    pinPost,
    getPostById,
    refreshPosts,
  };
}

