// ============================================================
// Core Enums & Types
// ============================================================

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x';

export type DeliverableType =
  | 'reel'
  | 'post'
  | 'story'
  | 'video'
  | 'tweet'
  | 'short'
  | 'live';

export type DeliverableStatus =
  | 'executing'
  | 'in_review'
  | 'approved'
  | 'live'
  | 'completed'
  | 'revision_requested';

export type CampaignStatus =
  | 'draft'
  | 'executing'
  | 'in_review'
  | 'approved'
  | 'live'
  | 'completed';

export type UserRole = 'agency' | 'brand';

// ============================================================
// Creator
// ============================================================

export interface PlatformProfile {
  platform: Platform;
  handle: string;
  followers: number;
  verified: boolean;
}

export interface Creator {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  niche: string[];
  location: string;
  email: string;
  platforms: PlatformProfile[];
  createdAt: string;
}

// ============================================================
// Campaign
// ============================================================

export interface TrackingIdentifier {
  id: string;
  type: 'hashtag' | 'utm' | 'coupon' | 'referral_link' | 'other';
  label: string;
  value: string;
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  brandLogo?: string;
  objective: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  budget?: number;
  creatorIds: string[];
  trackingIdentifiers: TrackingIdentifier[];
  coverColor: string; // gradient stop for card
  createdAt: string;
}

// ============================================================
// Deliverable
// ============================================================

export interface Deliverable {
  id: string;
  campaignId: string;
  creatorId: string;
  platform: Platform;
  type: DeliverableType;
  description: string;
  dueDate: string;
  status: DeliverableStatus;
  contentUrl?: string;      // submitted URL
  postUrl?: string;         // live post URL
  submittedAt?: string;
  approvedAt?: string;
  liveAt?: string;
  completedAt?: string;
  revisionNote?: string;
  createdAt: string;
}

// ============================================================
// Metrics (performance data per deliverable)
// ============================================================

export interface DeliverableMetrics {
  id: string;
  deliverableId: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;          // for video content
  clicks: number;
  engagementRate: number; // computed: (likes+comments+shares) / reach * 100
  loggedAt: string;
  updatedAt: string;
}

// ============================================================
// App State
// ============================================================

export interface AppState {
  campaigns: Campaign[];
  creators: Creator[];
  deliverables: Deliverable[];
  metrics: DeliverableMetrics[];
  currentRole: UserRole;
  theme: 'light' | 'dark';
  activeBrandName: string;
}

// ============================================================
// Computed / Derived types (returned by selectors)
// ============================================================

export interface CampaignKPIs {
  totalReach: number;
  totalImpressions: number;
  totalEngagements: number;
  totalViews: number;
  avgEngagementRate: number;
  deliverableCount: number;
  completedCount: number;
  liveCount: number;
  approvedCount: number;
  progressPct: number;
}

export interface CreatorCampaignMetrics {
  creatorId: string;
  creatorName: string;
  avatar: string;
  totalReach: number;
  totalImpressions: number;
  totalEngagements: number;
  avgEngagementRate: number;
  deliverableCount: number;
  completedCount: number;
}

export interface PlatformBreakdown {
  platform: Platform;
  reach: number;
  impressions: number;
  engagements: number;
  deliverableCount: number;
}

export interface ContentPost {
  deliverable: Deliverable;
  metrics?: DeliverableMetrics;
  creator: Creator;
}
