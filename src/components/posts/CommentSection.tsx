'use client';

import React, { useState, useEffect } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import CommentCard from './CommentCard';
import { useComments } from '@/hooks/useComments';
import type { Comment, CreateCommentRequest } from '@/types/social';

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
  autoFocus?: boolean;
}

export default function CommentSection({
  postId,
  currentUserId,
  autoFocus = false,
}: CommentSectionProps) {
  const {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  } = useComments(postId);

  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(postId);
  }, [postId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim()) return;

    try {
      setSubmitting(true);
      const data: CreateCommentRequest = {
        content: commentContent.trim(),
        ...(replyingTo && { parentCommentId: replyingTo }),
      };

      await createComment(postId, data);
      setCommentContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to create comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    // Scroll to comment input
    document.getElementById('comment-input')?.focus();
  };

  const handleEdit = async (commentId: string, content: string) => {
    await updateComment(commentId, { content });
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm text-green-700">
              Replying to comment
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            id="comment-input"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 resize-none"
            autoFocus={autoFocus}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Media upload can be added here */}
          </div>
          <button
            type="submit"
            disabled={submitting || !commentContent.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Posting...' : replyingTo ? 'Reply' : 'Post'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading && comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Loading comments...
          </div>
        ) : error && comments.length === 0 ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

