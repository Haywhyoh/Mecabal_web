/**
 * Social Feed Type Definitions
 * Matching backend DTOs from social-service
 */

// ==================== ENUMS ====================

export enum PostType {
  GENERAL = 'general',
  EVENT = 'event',
  ALERT = 'alert',
  MARKETPLACE = 'marketplace',
  LOST_FOUND = 'lost_found',
  HELP = 'help',
}

export enum HelpCategory {
  ERRAND = 'errand',
  TASK = 'task',
  RECOMMENDATION = 'recommendation',
  ADVICE = 'advice',
  BORROW = 'borrow',
}

export enum Urgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum PrivacyLevel {
  NEIGHBORHOOD = 'neighborhood',
  GROUP = 'group',
  PUBLIC = 'public',
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  ANGRY = 'angry',
  SAD = 'sad',
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  FALSE_INFORMATION = 'false_information',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  PRIVACY_VIOLATION = 'privacy_violation',
  OTHER = 'other',
}

// ==================== INTERFACES ====================

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isVerified: boolean;
  trustScore: number;
}

export interface CategoryInfo {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  colorCode?: string;
}

export interface MediaInfo {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

export interface EngagementMetrics {
  reactionsCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  userReaction?: ReactionType;
}

export interface Post {
  id: string;
  title?: string;
  content: string;
  postType: PostType;
  privacyLevel: PrivacyLevel;
  isPinned: boolean;
  isApproved: boolean;
  moderationStatus: ModerationStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt?: Date | string;
  author: UserInfo;
  category?: CategoryInfo;
  media: MediaInfo[];
  engagement: EngagementMetrics;
  isVisible: boolean;
  isExpired: boolean;
  // Help-specific fields
  helpCategory?: HelpCategory;
  urgency?: Urgency;
  budget?: string;
  deadline?: Date | string;
}

export interface PaginatedPosts {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostFilter {
  page?: number;
  limit?: number;
  postType?: PostType;
  privacyLevel?: PrivacyLevel;
  categoryId?: number;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  isPinned?: boolean;
  isApproved?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  helpCategory?: HelpCategory;
  urgency?: Urgency;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  postType: PostType;
  privacyLevel: PrivacyLevel;
  categoryId?: number;
  expiresAt?: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
  }>;
  isPinned?: boolean;
  // Help-specific fields
  helpCategory?: HelpCategory;
  urgency?: Urgency;
  budget?: string;
  deadline?: string;
  borrowDuration?: 'few_hours' | 'day' | 'few_days' | 'week';
  borrowItem?: string;
  itemCondition?: string;
  taskType?: string;
  estimatedDuration?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  postType?: PostType;
  privacyLevel?: PrivacyLevel;
  categoryId?: number;
  expiresAt?: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
  }>;
  isPinned?: boolean;
  helpCategory?: HelpCategory;
  urgency?: Urgency;
  budget?: string;
  deadline?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  isApproved: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: UserInfo;
  media: MediaInfo[];
  replies: Comment[];
  isReply: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
  }>;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentStats {
  totalComments: number;
  topLevelComments: number;
  replies: number;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: Date | string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export interface ReactionCounts {
  [key: string]: number;
}

export interface ReactionStats {
  totalReactions: number;
  reactionCounts: ReactionCounts;
  topReaction: string;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaginatedMedia {
  data: Media[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MediaUploadResponse {
  files: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
  }>;
}

export interface ReportContentRequest {
  reason: ReportReason;
  details?: string;
}

