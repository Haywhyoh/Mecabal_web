'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Reply, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import type { Comment } from '@/types/social';

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  level?: number;
}

export default function CommentCard({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  level = 0,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const isOwner = currentUserId === comment.userId;
  const maxLevel = 3; // Maximum nesting level

  const formatTimeAgo = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSaveEdit = async () => {
    if (!onEdit || !editContent.trim()) return;

    try {
      setEditing(true);
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update comment:', err);
      alert('Failed to update comment. Please try again.');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setDeleting(true);
      await onDelete(comment.id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {(() => {
            const profilePicture = comment.user?.profilePicture || (comment.user as any)?.profilePictureUrl;
            const firstName = comment.user?.firstName || '';
            const lastName = comment.user?.lastName || '';
            const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}` || 'U';
            
            if (profilePicture) {
              return (
                <Image
                  src={profilePicture}
                  alt={`${firstName} ${lastName}`}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  unoptimized
                />
              );
            }
            
            return (
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {initials}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">
                {comment.user?.firstName} {comment.user?.lastName}
              </span>
              {comment.user?.isVerified && (
                <span className="text-green-600 text-xs" title="Verified user">
                  ✓
                </span>
              )}
              <span className="text-gray-500 text-xs">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {(comment as any).isEdited && (
                <span className="text-gray-400 text-xs italic">(edited)</span>
              )}
              {isOwner && (
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Comment options"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Comment Text */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={editing || !editContent.trim()}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {editing ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{comment.content}</p>
            )}

            {/* Media */}
            {comment.media && comment.media.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {comment.media.map((media, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt={media.caption || `Media ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              {onReply && level < maxLevel && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

