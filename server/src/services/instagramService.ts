import axios from 'axios';
import { ConnectedAccount } from '../config/passport';

export interface InstagramMetrics {
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  reach: number;
  impressions: number;
}

export interface InstagramPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
}

export class InstagramService {
  private static BASE_URL = 'https://graph.instagram.com';

  static async getProfile(account: ConnectedAccount): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/me?fields=id,username,account_type,media_count,followers_count,follows_count`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Instagram profile');
    }
  }

  static async getMetrics(account: ConnectedAccount): Promise<InstagramMetrics> {
    try {
      const profile = await this.getProfile(account);
      
      // Get media insights
      const mediaResponse = await axios.get(
        `${this.BASE_URL}/me/media?fields=insights.metric(impressions,reach,engagement)&limit=30`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      let totalReach = 0;
      let totalImpressions = 0;
      let totalEngagement = 0;

      if (mediaResponse.data.data) {
        mediaResponse.data.data.forEach((media: any) => {
          if (media.insights) {
            media.insights.data.forEach((insight: any) => {
              if (insight.name === 'reach') totalReach += insight.values[0].value;
              if (insight.name === 'impressions') totalImpressions += insight.values[0].value;
              if (insight.name === 'engagement') totalEngagement += insight.values[0].value;
            });
          }
        });
      }

      return {
        followers: profile.followers_count || 0,
        following: profile.follows_count || 0,
        posts: profile.media_count || 0,
        engagement: totalEngagement,
        reach: totalReach,
        impressions: totalImpressions
      };
    } catch (error) {
      throw new Error('Failed to fetch Instagram metrics');
    }
  }

  static async getRecentPosts(account: ConnectedAccount, limit = 10): Promise<InstagramPost[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/me/media?fields=id,caption,media_type,media_url,like_count,comments_count,timestamp&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      return response.data.data || [];
    } catch (error) {
      throw new Error('Failed to fetch Instagram posts');
    }
  }
}
