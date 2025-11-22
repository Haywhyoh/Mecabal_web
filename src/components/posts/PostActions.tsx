'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Share2, Flag, Edit, Trash2, Pin, PinOff, Copy, Check } from 'lucide-react';
import ReportModal from './ReportModal';
import type { Post } from '@/types/social';

interface PostActionsProps {
  post: Post;
  isOwner: boolean;
  onShare?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => Promise<void>;
  onPin?: (postId: string, isPinned: boolean) => Promise<void>;
  onReport?: (postId: string, reason: string, details?: string) => Promise<void>;
}

export default function PostActions({
  post,
  isOwner,
  onShare,
  onEdit,
  onDelete,
  onPin,
  onReport,
}: PostActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);

  const handleShare = async () => {
    if (onShare) {
      onShare(post);
    } else {
      // Default share behavior - copy link
      const url = `${window.location.origin}/posts/${post.id}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
    setShowMenu(false);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await onDelete(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handlePin = async () => {
    if (!onPin) return;
    
    try {
      setPinning(true);
      await onPin(post.id, !post.isPinned);
    } catch (err) {
      console.error('Failed to pin/unpin post:', err);
      alert('Failed to update post. Please try again.');
    } finally {
      setPinning(false);
      setShowMenu(false);
    }
  };

  const handleReport = async (reason: string, details?: string) => {
    if (onReport) {
      await onReport(post.id, reason, details);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Post options"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              {/* Share */}
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>

              {/* Owner-only actions */}
              {isOwner && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handlePin}
                    disabled={pinning}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {post.isPinned ? (
                      <>
                        <PinOff className="w-4 h-4" />
                        Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="w-4 h-4" />
                        Pin
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}

              {/* Report (non-owner) */}
              {!isOwner && onReport && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {showReportModal && onReport && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
          contentType="post"
        />
      )}
    </>
  );
}

