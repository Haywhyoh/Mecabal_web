'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Share2, Pin, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactionButton from '@/components/posts/ReactionButton';
import PostActions from '@/components/posts/PostActions';
import MediaGallery from '@/components/posts/MediaGallery';
import type { Post } from '@/types/social';

interface FeedCardProps {
  post: Post;
  currentUserId?: string;
  onReaction?: (postId: string, reactionType: string) => Promise<void>;
  onRemoveReaction?: (postId: string) => Promise<void>;
  onComment?: (postId: string) => void;
  onShare?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => Promise<void>;
  onPin?: (postId: string, isPinned: boolean) => Promise<void>;
  onReport?: (postId: string, reason: string, details?: string) => Promise<void>;
}

export default function FeedCard({
  post,
  currentUserId,
  onReaction,
  onRemoveReaction,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onPin,
  onReport,
}: FeedCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [reactionCounts, setReactionCounts] = useState(post.engagement.reactionsCount || 0);
  const [userReaction, setUserReaction] = useState(post.engagement.userReaction || null);

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

  const getPostTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      general: { label: 'General', color: 'bg-blue-100 text-blue-700' },
      event: { label: 'Event', color: 'bg-purple-100 text-purple-700' },
      alert: { label: 'Alert', color: 'bg-red-100 text-red-700' },
      marketplace: { label: 'Marketplace', color: 'bg-green-100 text-green-700' },
      lost_found: { label: 'Lost & Found', color: 'bg-yellow-100 text-yellow-700' },
      help: { label: 'Help', color: 'bg-orange-100 text-orange-700' },
    };
    return badges[type] || badges.general;
  };

  const getPrivacyIcon = (level: string) => {
    const icons: Record<string, string> = {
      neighborhood: '👥',
      group: '👤',
      public: '🌐',
    };
    return icons[level] || '👥';
  };

  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !showFullContent
    ? post.content.substring(0, 300) + '...'
    : post.content;

  const isOwner = currentUserId === post.author.id;

  const handleReaction = async (postId: string, reactionType: string) => {
    if (onReaction) {
      await onReaction(postId, reactionType);
    }
    setUserReaction(reactionType as any);
  };

  const handleRemoveReaction = async (postId: string) => {
    if (onRemoveReaction) {
      await onRemoveReaction(postId);
    }
    setUserReaction(null);
  };

  return (
    <article className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${post.isPinned ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {post.author.profilePicture ? (
              <Image
                src={post.author.profilePicture}
                alt={`${post.author.firstName} ${post.author.lastName}`}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {post.author.firstName[0]}
                  {post.author.lastName[0]}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
              >
                {post.author.firstName} {post.author.lastName}
              </Link>
              {post.author.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" title="Verified user" />
              )}
              <span className="text-gray-500">·</span>
              <time className="text-gray-500 text-sm">{formatTimeAgo(post.createdAt)}</time>
              {post.isPinned && (
                <>
                  <span className="text-gray-500">·</span>
                  <Pin className="w-3 h-3 text-green-600" title="Pinned post" />
                </>
              )}
              <div className="ml-auto flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPostTypeBadge(post.postType).color}`}>
                  {getPostTypeBadge(post.postType).label}
                </span>
                <span className="text-gray-400" title={`Privacy: ${post.privacyLevel}`}>
                  {getPrivacyIcon(post.privacyLevel)}
                </span>
                <PostActions
                  post={post}
                  isOwner={isOwner}
                  onShare={onShare}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPin={onPin}
                  onReport={onReport}
                />
              </div>
            </div>

            {/* Category Badge */}
            {post.category && (
              <div className="mb-2">
                <span
                  className="inline-block px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: post.category.colorCode ? `${post.category.colorCode}20` : '#e5e7eb',
                    color: post.category.colorCode || '#374151',
                  }}
                >
                  {post.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            {post.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
            )}

            {/* Post Content */}
            <div className="mb-3">
              <p className="text-gray-900 whitespace-pre-wrap">{displayContent}</p>
              {shouldTruncate && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium mt-1"
                >
                  {showFullContent ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Help-specific info */}
            {post.postType === 'help' && post.helpCategory && (
              <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">
                    {post.helpCategory.charAt(0).toUpperCase() + post.helpCategory.slice(1)} Request
                  </span>
                  {post.urgency && (
                    <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${
                      post.urgency === 'high' ? 'bg-red-100 text-red-700' :
                      post.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {post.urgency.toUpperCase()}
                    </span>
                  )}
                </div>
                {post.budget && (
                  <p className="text-sm text-orange-700">Budget: {post.budget}</p>
                )}
                {post.deadline && (
                  <p className="text-sm text-orange-700">
                    Deadline: {new Date(post.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="mb-3">
                {post.media.length === 1 ? (
                  <div
                    className="relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowMediaGallery(true)}
                  >
                    {post.media[0].type === 'image' ? (
                      <Image
                        src={post.media[0].url}
                        alt={post.media[0].caption || 'Post media'}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <video
                        src={post.media[0].url}
                        className="w-full h-auto"
                        controls
                      />
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {post.media.slice(0, 4).map((media, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setShowMediaGallery(true)}
                      >
                        {media.type === 'image' ? (
                          <Image
                            src={media.url}
                            alt={media.caption || `Media ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">Video</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Expired Notice */}
            {post.isExpired && (
              <div className="mb-3 p-2 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-sm text-gray-600">This post has expired</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <ReactionButton
                  postId={post.id}
                  counts={post.engagement.reactionsCount ? { like: post.engagement.reactionsCount } : null}
                  userReaction={userReaction}
                  onReaction={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                />

                <button
                  onClick={() => onComment(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {post.engagement.commentsCount > 0 ? post.engagement.commentsCount : 'Comment'}
                  </span>
                </button>

                <button
                  onClick={() => onShare?.(post)}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {post.engagement.sharesCount > 0 ? post.engagement.sharesCount : 'Share'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery Lightbox */}
      {showMediaGallery && (
        <MediaGallery
          media={post.media}
          initialIndex={0}
          onClose={() => setShowMediaGallery(false)}
        />
      )}
    </article>
  );
}
