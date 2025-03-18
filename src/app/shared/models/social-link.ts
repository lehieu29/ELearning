// File path: src/app/shared/models/social-link.model.ts

export type SocialPlatform = 
  'linkedin' | 
  'github' | 
  'twitter' | 
  'facebook' | 
  'instagram' | 
  'youtube' | 
  'medium' | 
  'stackoverflow' | 
  'dribbble' | 
  'behance' | 
  'website';

export interface SocialLink {
  id?: string;
  userId?: string;
  platform: SocialPlatform;
  profileUrl: string;
  username?: string;
  displayName?: string;
  isConnected: boolean;
  connectedDate?: Date | string;
  lastUpdated?: Date | string;
  visibility: 'public' | 'private' | 'connections';
  profileImageUrl?: string;
  followerCount?: number;
}

export interface SocialLinkStats {
  totalConnections: number;
  publicConnections: number;
  privateConnections: number;
  platformStats: {
    platform: SocialPlatform;
    count: number;
  }[];
}

export interface ConnectResponse {
  success: boolean;
  socialLink: SocialLink;
  message?: string;
}