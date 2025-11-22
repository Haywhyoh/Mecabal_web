'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FeedCard from './FeedCard';
import PostCreator from '@/components/posts/PostCreator';
import PostFilters from '@/components/posts/PostFilters';
import { usePosts } from '@/hooks/usePosts';
import { apiClient } from '@/lib/api';
import type { Post, PostFilter } from '@/types/social';

export default function Feed() {
  const router = useRouter();
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [filters, setFilters] = useState<PostFilter>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    isApproved: true,
  });

  const {
    posts,
    loading,
    error,
    pagination,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    pinPost,
    refreshPosts,
  } = usePosts(filters);

  // Get current user ID and categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.getPostCategories();
        if (response.success && response.data) {
          // Ensure response.data is an array
          const categoriesData = Array.isArray(response.data) 
            ? response.data 
            : (response.data as any)?.data && Array.isArray((response.data as any).data)
              ? (response.data as any).data 
              : [];
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]); // Set empty array on error
      }
    };
    loadCategories();

    // Get current user ID from API
    const loadUser = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
          setCurrentUserId(response.data.id);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    loadUser();
  }, []);

  // Fetch posts on mount and when filters change
  useEffect(() => {
    fetchPosts(filters);
  }, [filters]);

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.addReaction(postId, reactionType as any);
      await refreshPosts();
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const handleRemoveReaction = async (postId: string) => {
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.removeReaction(postId);
      await refreshPosts();
    } catch (err) {
      console.error('Failed to remove reaction:', err);
    }
  };

  const handleComment = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  const handleShare = (post: Post) => {
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      // Show toast notification
      alert('Link copied to clipboard!');
    });
  };

  const handleEdit = (post: Post) => {
    // Navigate to edit page or open edit modal
    router.push(`/posts/${post.id}/edit`);
  };

  const handleDelete = async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      await refreshPosts();
    }
  };

  const handlePin = async (postId: string, isPinned: boolean) => {
    await pinPost(postId, isPinned);
    await refreshPosts();
  };

  const handleReport = async (postId: string, reason: string, details?: string) => {
    try {
      const { apiClient } = await import('@/lib/api');
      const response = await apiClient.reportContent('post', postId, {
        reason: reason as any,
        details,
      });
      if (response.success) {
        alert('Thank you for reporting. We will review this content.');
      } else {
        alert(response.error || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Failed to report post:', err);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext && !loading) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  const handleRefresh = async () => {
    await refreshPosts();
  };

  const handlePostCreated = async (newPost: Post) => {
    await refreshPosts();
  };

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  return (
    <div className="flex flex-col h-full">
      {/* Feed Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Home</h1>
          <button
            onClick={() => setShowPostCreator(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Create Post
          </button>
        </div>
      </header>

      {/* Filters */}
      <PostFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {/* What's Happening Section */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">What's happening</h2>
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : error && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-red-500 text-center mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <p className="text-gray-500 mb-2">No posts yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Posts from your neighborhood will appear here
            </p>
            <button
              onClick={() => setShowPostCreator(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <>
            <div>
              {sortedPosts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onReaction={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                  onComment={handleComment}
                  onShare={handleShare}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onReport={handleReport}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination?.hasNext && (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}

            {/* Loading indicator for pagination */}
            {loading && posts.length > 0 && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Creator Modal */}
      <PostCreator
        isOpen={showPostCreator}
        onClose={() => setShowPostCreator(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
