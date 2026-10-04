const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PlatformConnection {
  platform: string;
  platformUserId: string;
  profileData: any;
  connectedAt: string;
}

export interface InstagramMetrics {
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  reach: number;
  impressions: number;
}

export interface TikTokMetrics {
  followers: number;
  following: number;
  likes: number;
  videos: number;
  engagement_rate: number;
}

export interface TwitterMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  likes: number;
  retweets: number;
  replies: number;
}

export interface FacebookMetrics {
  followers: number;
  likes: number;
  posts: number;
  reach: number;
  impressions: number;
  engagement: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Platform Connections
  async getConnectedAccounts(): Promise<PlatformConnection[]> {
    const data = await this.request<PlatformConnection[]>('/api/platforms/connected');
    return data.map(conn => ({
      ...conn,
      platform: conn.platform === 'twitter' ? 'x' : conn.platform
    }));
  }

  async disconnectAccount(platform: string, userId: string): Promise<{ success: boolean }> {
    return this.request(`/api/platforms/disconnect/${platform}/${userId}`, {
      method: 'DELETE',
    });
  }

  // Instagram
  async getInstagramProfile(userId: string): Promise<any> {
    return this.request(`/api/platforms/instagram/profile/${userId}`);
  }

  async getInstagramMetrics(userId: string): Promise<InstagramMetrics> {
    return this.request(`/api/platforms/instagram/metrics/${userId}`);
  }

  async getInstagramPosts(userId: string, limit = 10): Promise<any[]> {
    return this.request(`/api/platforms/instagram/posts/${userId}?limit=${limit}`);
  }

  // TikTok
  async getTikTokProfile(userId: string): Promise<any> {
    return this.request(`/api/platforms/tiktok/profile/${userId}`);
  }

  async getTikTokMetrics(userId: string): Promise<TikTokMetrics> {
    return this.request(`/api/platforms/tiktok/metrics/${userId}`);
  }

  async getTikTokVideos(userId: string, limit = 10): Promise<any[]> {
    return this.request(`/api/platforms/tiktok/videos/${userId}?limit=${limit}`);
  }

  // Twitter
  async getTwitterProfile(userId: string): Promise<any> {
    return this.request(`/api/platforms/twitter/profile/${userId}`);
  }

  async getTwitterMetrics(userId: string): Promise<TwitterMetrics> {
    return this.request(`/api/platforms/twitter/metrics/${userId}`);
  }

  async getTwitterTweets(userId: string, limit = 10): Promise<any[]> {
    return this.request(`/api/platforms/twitter/tweets/${userId}?limit=${limit}`);
  }

  // Facebook
  async getFacebookProfile(userId: string): Promise<any> {
    return this.request(`/api/platforms/facebook/profile/${userId}`);
  }

  async getFacebookPages(userId: string): Promise<any[]> {
    return this.request(`/api/platforms/facebook/pages/${userId}`);
  }

  async getFacebookMetrics(userId: string, pageId: string): Promise<FacebookMetrics> {
    return this.request(`/api/platforms/facebook/metrics/${userId}/${pageId}`);
  }

  async getFacebookPosts(userId: string, pageId: string, limit = 10): Promise<any[]> {
    return this.request(`/api/platforms/facebook/posts/${userId}/${pageId}?limit=${limit}`);
  }

  // OAuth URLs
  getInstagramAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/instagram`;
  }

  getTwitterAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/twitter`;
  }

  getFacebookAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/facebook`;
  }

  getTikTokAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/tiktok`;
  }
}

export const apiService = new ApiService();
