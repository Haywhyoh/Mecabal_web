'use client';

import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

interface FeedCardProps {
  author: {
    name: string;
    avatar?: string;
    initials: string;
    neighborhood?: string;
  };
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export default function FeedCard({
  author,
  content,
  timestamp,
  likes = 0,
  comments = 0,
  shares = 0,
}: FeedCardProps) {
  return (
    <article className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {author.initials}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{author.name}</h3>
              {author.neighborhood && (
                <>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500 text-sm">{author.neighborhood}</span>
                </>
              )}
              <span className="text-gray-500">·</span>
              <time className="text-gray-500 text-sm">{timestamp}</time>
              <button className="ml-auto p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Post Content */}
            <p className="text-gray-900 mb-3 whitespace-pre-wrap">{content}</p>

            {/* Actions */}
            <div className="flex items-center justify-between max-w-md">
              <button className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors group">
                <MessageCircle className="w-5 h-5 group-hover:bg-green-100 rounded-full p-1" />
                <span className="text-sm">{comments}</span>
              </button>

              <button className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors group">
                <Share2 className="w-5 h-5 group-hover:bg-green-100 rounded-full p-1" />
                <span className="text-sm">{shares}</span>
              </button>

              <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors group">
                <Heart className="w-5 h-5 group-hover:bg-red-100 rounded-full p-1" />
                <span className="text-sm">{likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

