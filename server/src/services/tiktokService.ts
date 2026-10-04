import axios from 'axios';
import { ConnectedAccount } from '../config/passport';

export interface TikTokMetrics {
  followers: number;
  following: number;
  likes: number;
  videos: number;
  engagement_rate: number;
}

export interface TikTokVideo {
  id: string;
  description: string;
  create_time: string;
  cover_image_url: string;
  share_count: number;
  comment_count: number;
  like_count: number;
  view_count: number;
}

export class TikTokService {
  private static BASE_URL = 'https://open.tiktokapis.com/v2';

  static async getProfile(account: ConnectedAccount): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/user/info/`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch TikTok profile');
    }
  }

  static async getMetrics(account: ConnectedAccount): Promise<TikTokMetrics> {
    try {
      const profile = await this.getProfile(account);
      const userData = profile.data.user;

      // Get video list for engagement calculations
      const videosResponse = await axios.get(
        `${this.BASE_URL}/video/list/`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` },
          params: { fields: 'id,like_count,comment_count,share_count,view_count' }
        }
      );

      const videos = videosResponse.data.data.videos || [];
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalViews = 0;

      videos.forEach((video: any) => {
        totalLikes += video.like_count || 0;
        totalComments += video.comment_count || 0;
        totalShares += video.share_count || 0;
        totalViews += video.view_count || 0;
      });

      const totalEngagement = totalLikes + totalComments + totalShares;
      const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

      return {
        followers: userData.follower_count || 0,
        following: userData.following_count || 0,
        likes: totalLikes,
        videos: videos.length,
        engagement_rate: engagementRate
      };
    } catch (error) {
      throw new Error('Failed to fetch TikTok metrics');
    }
  }

  static async getRecentVideos(account: ConnectedAccount, limit = 10): Promise<TikTokVideo[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/video/list/`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` },
          params: { 
            fields: 'id,description,create_time,cover_image_url,share_count,comment_count,like_count,view_count',
            max_count: limit
          }
        }
      );

      return response.data.data.videos || [];
    } catch (error) {
      throw new Error('Failed to fetch TikTok videos');
    }
  }
}
