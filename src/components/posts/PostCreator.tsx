'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Image as ImageIcon, AlertCircle } from 'lucide-react';
import MediaUpload, { type MediaFile } from './MediaUpload';
import { apiClient } from '@/lib/api';
import { usePosts } from '@/hooks/usePosts';
import type { PostType, PrivacyLevel, HelpCategory, Urgency, CreatePostRequest } from '@/types/social';

interface PostCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: any) => void;
  initialPostType?: PostType;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function PostCreator({
  isOpen,
  onClose,
  onPostCreated,
  initialPostType = 'general',
}: PostCreatorProps) {
  const { createPost, loading: postsLoading } = usePosts();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [postType, setPostType] = useState<PostType>(initialPostType);
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('neighborhood');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{ url: string; type: 'image' | 'video'; caption?: string }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Help-specific fields
  const [helpCategory, setHelpCategory] = useState<HelpCategory | undefined>();
  const [urgency, setUrgency] = useState<Urgency | undefined>();
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiClient.getPostCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const uploadMediaFiles = async (): Promise<Array<{ url: string; type: 'image' | 'video'; caption?: string }>> => {
    if (mediaFiles.length === 0) return [];

    try {
      setUploading(true);
      const files = mediaFiles.map((mf) => mf.file);
      const response = await apiClient.uploadMedia(files, {
        quality: 'high',
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (response.success && response.data) {
        const uploaded = response.data.files || [];
        return uploaded.map((file: any) => ({
          url: file.url,
          type: file.type,
        }));
      } else {
        throw new Error(response.error || 'Failed to upload media');
      }
    } catch (err) {
      console.error('Error uploading media:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    if (postType === 'help' && !helpCategory) {
      setError('Help category is required for help posts');
      return;
    }

    try {
      setSubmitting(true);

      // Upload media first
      let media: Array<{ url: string; type: 'image' | 'video'; caption?: string }> = [];
      if (mediaFiles.length > 0) {
        media = await uploadMediaFiles();
      }
      // Combine with existing uploaded media
      media = [...uploadedMedia, ...media];

      // Prepare post data
      const postData: CreatePostRequest = {
        ...(title.trim() && { title: title.trim() }),
        content: content.trim(),
        postType,
        privacyLevel,
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(media.length > 0 && { media }),
        ...(postType === 'help' && {
          helpCategory,
          ...(urgency && { urgency }),
          ...(budget.trim() && { budget: budget.trim() }),
          ...(deadline && { deadline }),
        }),
      };

      const newPost = await createPost(postData);

      if (newPost) {
        // Reset form
        setContent('');
        setTitle('');
        setPostType(initialPostType);
        setPrivacyLevel('neighborhood');
        setSelectedCategory(undefined);
        setMediaFiles([]);
        setUploadedMedia([]);
        setHelpCategory(undefined);
        setUrgency(undefined);
        setBudget('');
        setDeadline('');
        setError(null);

        if (onPostCreated) {
          onPostCreated(newPost);
        }
        onClose();
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setTitle('');
    setPostType(initialPostType);
    setPrivacyLevel('neighborhood');
    setSelectedCategory(undefined);
    setMediaFiles([]);
    setUploadedMedia([]);
    setHelpCategory(undefined);
    setUrgency(undefined);
    setBudget('');
    setDeadline('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['general', 'event', 'alert', 'marketplace', 'lost_found', 'help'] as PostType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setPostType(type);
                    if (type !== 'help') {
                      setHelpCategory(undefined);
                      setUrgency(undefined);
                      setBudget('');
                      setDeadline('');
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    postType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Level *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['neighborhood', 'group', 'public'] as PrivacyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPrivacyLevel(level)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    privacyLevel === level
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                id="category"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title (Optional) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              required
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {content.length}/5000 characters
            </p>
          </div>

          {/* Help-specific fields */}
          {postType === 'help' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-gray-900">Help Request Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Help Category *
                </label>
                <select
                  value={helpCategory || ''}
                  onChange={(e) => setHelpCategory(e.target.value as HelpCategory)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                >
                  <option value="">Select category</option>
                  {(['errand', 'task', 'recommendation', 'advice', 'borrow'] as HelpCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as Urgency[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        urgency === level
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (Optional)
                </label>
                <input
                  id="budget"
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., ₦50,000"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                />
              </div>
            </div>
          )}

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media (Optional)
            </label>
            <MediaUpload
              maxFiles={10}
              maxFileSize={10}
              onMediaChange={setMediaFiles}
              existingMedia={uploadedMedia}
              onRemoveExisting={(index) => {
                setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || !content.trim() || (postType === 'help' && !helpCategory)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {uploading ? 'Uploading...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

