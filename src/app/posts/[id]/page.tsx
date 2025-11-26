'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import FeedCard from '@/components/dashboard/FeedCard';
import CommentSection from '@/components/posts/CommentSection';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { Post } from '@/types/social';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const { getPostById, loading: postLoading, error: postError } = usePosts();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    const postData = await getPostById(postId);
    if (postData) {
      setPost(postData);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.addReaction(postId, reactionType as any);
      await loadPost();
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const handleRemoveReaction = async (postId: string) => {
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.removeReaction(postId);
      await loadPost();
    } catch (err) {
      console.error('Failed to remove reaction:', err);
    }
  };

  const handleComment = () => {
    // Scroll to comment section
    document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = (post: Post) => {
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleEdit = (post: Post) => {
    router.push(`/posts/${post.id}/edit`);
  };

  const handleDelete = async (postId: string) => {
    const { apiClient } = await import('@/lib/api');
    const response = await apiClient.deletePost(postId);
    if (response.success) {
      router.push('/dashboard');
    } else {
      alert(response.error || 'Failed to delete post');
    }
  };

  const handlePin = async (postId: string, isPinned: boolean) => {
    const { apiClient } = await import('@/lib/api');
    await apiClient.pinPost(postId, isPinned);
    await loadPost();
  };

  const handleReport = async (postId: string, reason: string, details?: string) => {
    const { apiClient } = await import('@/lib/api');
    const response = await apiClient.reportContent('post', postId, {
      reason: reason as any,
      details,
    });
    if (response.success) {
      alert('Thank you for reporting. We will review this content.');
    } else {
      alert(response.error || 'Failed to submit report');
    }
  };

  if (postLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (postError || !post) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">{postError || 'The post you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Feed
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Post */}
        <div className="border-b border-gray-200">
          <FeedCard
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
        </div>

        {/* Comments Section */}
        <div id="comment-section" className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
          <CommentSection postId={postId} currentUserId={currentUserId} autoFocus={false} />
        </div>
      </div>
    </DashboardLayout>
  );
}

