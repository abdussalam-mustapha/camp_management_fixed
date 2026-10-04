import axios from 'axios';
import { ConnectedAccount } from '../config/passport';

export interface FacebookMetrics {
  followers: number;
  likes: number;
  posts: number;
  reach: number;
  impressions: number;
  engagement: number;
}

export interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  attachments?: any;
  likes: { data: [] };
  comments: { data: [] };
  shares?: any;
  insights?: { data: [] };
}

export class FacebookService {
  private static BASE_URL = 'https://graph.facebook.com/v18.0';

  static async getProfile(account: ConnectedAccount): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/me?fields=id,name,picture,followers_count`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Facebook profile');
    }
  }

  static async getPageMetrics(account: ConnectedAccount, pageId: string): Promise<FacebookMetrics> {
    try {
      // Get page insights
      const insightsResponse = await axios.get(
        `${this.BASE_URL}/${pageId}/insights?metric=page_impressions,page_reach,page_engaged_users,page_post_engagements`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      let reach = 0;
      let impressions = 0;
      let engagement = 0;

      if (insightsResponse.data.data) {
        insightsResponse.data.data.forEach((insight: any) => {
          if (insight.name === 'page_reach') reach = insight.values[0].value || 0;
          if (insight.name === 'page_impressions') impressions = insight.values[0].value || 0;
          if (insight.name === 'page_engaged_users') engagement = insight.values[0].value || 0;
        });
      }

      // Get page info
      const pageResponse = await axios.get(
        `${this.BASE_URL}/${pageId}?fields=followers_count,fan_count`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      const pageData = pageResponse.data;

      return {
        followers: pageData.followers_count || pageData.fan_count || 0,
        likes: pageData.fan_count || 0,
        posts: 0, // Would need to count posts separately
        reach,
        impressions,
        engagement
      };
    } catch (error) {
      throw new Error('Failed to fetch Facebook page metrics');
    }
  }

  static async getRecentPosts(account: ConnectedAccount, pageId: string, limit = 10): Promise<FacebookPost[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/${pageId}/posts?fields=message,created_time,attachments,likes,comments,shares,insights&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      return response.data.data || [];
    } catch (error) {
      throw new Error('Failed to fetch Facebook posts');
    }
  }

  static async getUserPages(account: ConnectedAccount): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/me/accounts?fields=id,name,category,picture`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      return response.data.data || [];
    } catch (error) {
      throw new Error('Failed to fetch Facebook pages');
    }
  }
}
