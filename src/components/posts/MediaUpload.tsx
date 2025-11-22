'use client';

import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon, Video, Upload } from 'lucide-react';
import Image from 'next/image';

export interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface MediaUploadProps {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  onMediaChange: (media: MediaFile[]) => void;
  existingMedia?: Array<{ url: string; type: 'image' | 'video'; caption?: string }>;
  onRemoveExisting?: (index: number) => void;
}

export default function MediaUpload({
  maxFiles = 10,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'video/*'],
  onMediaChange,
  existingMedia = [],
  onRemoveExisting,
}: MediaUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = mediaFiles.length + existingMedia.length + files.length;

    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newMediaFiles: MediaFile[] = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} exceeds maximum size of ${maxFileSize}MB`);
        return;
      }

      // Determine file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        alert(`File ${file.name} is not a valid image or video`);
        return;
      }

      const mediaFile: MediaFile = {
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
      };

      newMediaFiles.push(mediaFile);
    });

    const updatedFiles = [...mediaFiles, ...newMediaFiles];
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    const updatedFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
  };

  const removeExisting = (index: number) => {
    if (onRemoveExisting) {
      onRemoveExisting(index);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const totalMediaCount = mediaFiles.length + existingMedia.length;
  const canAddMore = totalMediaCount < maxFiles;

  return (
    <div className="space-y-4">
      {/* Existing Media */}
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {existingMedia.map((media, index) => (
            <div key={index} className="relative group">
              {media.type === 'image' ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={media.url}
                    alt={media.caption || `Media ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {onRemoveExisting && (
                    <button
                      onClick={() => removeExisting(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove media"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-400" />
                  {onRemoveExisting && (
                    <button
                      onClick={() => removeExisting(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove media"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Media Files */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative group">
              {media.type === 'image' ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={media.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <video
                    src={media.preview}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={openFilePicker}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-600 hover:text-green-600 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Add Media ({totalMediaCount}/{maxFiles})</span>
          </button>
          <p className="mt-1 text-sm text-gray-500">
            Images and videos up to {maxFileSize}MB each
          </p>
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-gray-500">
          Maximum {maxFiles} files reached
        </p>
      )}
    </div>
  );
}

