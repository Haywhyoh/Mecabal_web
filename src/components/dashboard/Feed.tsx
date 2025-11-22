'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import FeedCard from './FeedCard';

// Demo data for the feed
const demoPosts = [
  {
    id: 1,
    author: {
      name: 'Adebayo Ogunleye',
      initials: 'AO',
      neighborhood: 'Victoria Island Estate',
    },
    content: 'Great community meeting today! Looking forward to implementing the new security measures. 🏡✨',
    timestamp: '2h',
    likes: 12,
    comments: 3,
    shares: 1,
  },
  {
    id: 2,
    author: {
      name: 'Chioma Nwosu',
      initials: 'CN',
      neighborhood: 'Lekki Phase 1',
    },
    content: 'Anyone know a reliable plumber in the area? Need urgent help with a leaky pipe.',
    timestamp: '4h',
    likes: 8,
    comments: 5,
    shares: 2,
  },
  {
    id: 3,
    author: {
      name: 'Emeka Okoro',
      initials: 'EO',
      neighborhood: 'Ikoyi',
    },
    content: 'The new park renovation looks amazing! Great work by the neighborhood committee. 🌳',
    timestamp: '6h',
    likes: 24,
    comments: 7,
    shares: 4,
  },
  {
    id: 4,
    author: {
      name: 'Funke Adebayo',
      initials: 'FA',
      neighborhood: 'Surulere',
    },
    content: 'Reminder: Neighborhood cleanup day this Saturday at 8 AM. Let\'s keep our community beautiful! 🧹',
    timestamp: '8h',
    likes: 15,
    comments: 2,
    shares: 3,
  },
  {
    id: 5,
    author: {
      name: 'Tunde Williams',
      initials: 'TW',
      neighborhood: 'Gbagada',
    },
    content: 'Lost my keys near the community center. If anyone finds them, please contact me. Reward offered! 🔑',
    timestamp: '12h',
    likes: 6,
    comments: 4,
    shares: 1,
  },
];

export default function Feed() {
  return (
    <div className="flex flex-col h-full">
      {/* Feed Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Home</h1>
      </header>

      {/* What's Happening Section */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">What's happening</h2>
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto">
        {demoPosts.length > 0 ? (
          <div>
            {demoPosts.map((post) => (
              <FeedCard
                key={post.id}
                author={post.author}
                content={post.content}
                timestamp={post.timestamp}
                likes={post.likes}
                comments={post.comments}
                shares={post.shares}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <p className="text-gray-500 mb-2">No posts yet</p>
            <p className="text-sm text-gray-400">
              Posts from your neighborhood will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

