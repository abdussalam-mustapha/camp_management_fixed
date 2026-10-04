import { apiService } from './api';
import type { PlatformConnection, Platform } from '../data/types';
import type { DeliverableMetrics } from '../data/types';

export interface SyncResult {
  success: boolean;
  metrics?: DeliverableMetrics;
  error?: string;
}

export class PlatformSyncService {
  /**
   * Sync metrics from a connected platform account
   */
  static async syncPlatformMetrics(
    connection: PlatformConnection,
    deliverableId: string
  ): Promise<SyncResult> {
    try {
      let metrics: any;

      switch (connection.platform) {
        case 'instagram':
          metrics = await apiService.getInstagramMetrics(connection.platformUserId);
          break;
        case 'tiktok':
          metrics = await apiService.getTikTokMetrics(connection.platformUserId);
          break;
        case 'x':
          metrics = await apiService.getTwitterMetrics(connection.platformUserId);
          break;
        case 'facebook':
          // Facebook requires a page ID for metrics
          throw new Error('Facebook metrics require a page ID');
        default:
          throw new Error(`Unsupported platform: ${connection.platform}`);
      }

      // Convert platform-specific metrics to our standard format
      const standardMetrics = this.convertToStandardMetrics(metrics, connection.platform, deliverableId);

      return {
        success: true,
        metrics: standardMetrics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Convert platform-specific metrics to our standard DeliverableMetrics format
   */
  private static convertToStandardMetrics(
    platformMetrics: any,
    platform: Platform,
    deliverableId: string
  ): DeliverableMetrics {
    const now = new Date().toISOString();

    switch (platform) {
      case 'instagram':
        return {
          id: `m_${Date.now()}`,
          deliverableId,
          impressions: platformMetrics.impressions || 0,
          reach: platformMetrics.reach || 0,
          likes: 0, // Instagram metrics don't separate likes in the summary
          comments: 0,
          shares: 0,
          saves: 0,
          views: 0,
          clicks: 0,
          engagementRate: platformMetrics.reach > 0 
            ? (platformMetrics.engagement / platformMetrics.reach) * 100 
            : 0,
          loggedAt: now,
          updatedAt: now
        };

      case 'tiktok':
        return {
          id: `m_${Date.now()}`,
          deliverableId,
          impressions: 0, // TikTok doesn't provide impressions in basic metrics
          reach: platformMetrics.followers || 0,
          likes: platformMetrics.likes || 0,
          comments: 0,
          shares: 0,
          saves: 0,
          views: 0,
          clicks: 0,
          engagementRate: platformMetrics.engagement_rate || 0,
          loggedAt: now,
          updatedAt: now
        };

      case 'x':
        return {
          id: `m_${Date.now()}`,
          deliverableId,
          impressions: 0,
          reach: platformMetrics.followers_count || 0,
          likes: platformMetrics.likes || 0,
          comments: platformMetrics.replies || 0,
          shares: platformMetrics.retweets || 0,
          saves: 0,
          views: 0,
          clicks: 0,
          engagementRate: platformMetrics.followers_count > 0
            ? ((platformMetrics.likes + platformMetrics.replies + platformMetrics.retweets) / platformMetrics.followers_count) * 100
            : 0,
          loggedAt: now,
          updatedAt: now
        };

      default:
        throw new Error(`Cannot convert metrics for platform: ${platform}`);
    }
  }

  /**
   * Auto-sync all connected platforms
   */
  static async autoSyncAllConnections(
    connections: PlatformConnection[],
    deliverableMap: Map<string, string> // Maps platform connections to deliverable IDs
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const connection of connections) {
      const deliverableId = deliverableMap.get(`${connection.platform}_${connection.platformUserId}`);
      if (deliverableId) {
        const result = await this.syncPlatformMetrics(connection, deliverableId);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get profile data from a connected platform
   */
  static async getProfileData(connection: PlatformConnection): Promise<any> {
    switch (connection.platform) {
      case 'instagram':
        return apiService.getInstagramProfile(connection.platformUserId);
      case 'tiktok':
        return apiService.getTikTokProfile(connection.platformUserId);
      case 'x':
        return apiService.getTwitterProfile(connection.platformUserId);
      case 'facebook':
        return apiService.getFacebookProfile(connection.platformUserId);
      default:
        throw new Error(`Unsupported platform: ${connection.platform}`);
    }
  }

  /**
   * Get recent content from a connected platform
   */
  static async getRecentContent(connection: PlatformConnection, limit = 10): Promise<any[]> {
    switch (connection.platform) {
      case 'instagram':
        return apiService.getInstagramPosts(connection.platformUserId, limit);
      case 'tiktok':
        return apiService.getTikTokVideos(connection.platformUserId, limit);
      case 'x':
        return apiService.getTwitterTweets(connection.platformUserId, limit);
      case 'facebook':
        // Facebook requires a page ID for posts
        throw new Error('Facebook posts require a page ID');
      default:
        throw new Error(`Unsupported platform: ${connection.platform}`);
    }
  }
}
