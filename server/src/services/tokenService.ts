import axios from 'axios';

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
}

export class TokenService {
  /**
   * Refresh Instagram access token
   */
  static async refreshInstagramToken(refreshToken: string): Promise<TokenData> {
    try {
      const response = await axios.post('https://graph.instagram.com/refresh_access_token', {
        grant_type: 'ig_refresh_token',
        access_token: refreshToken
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // ~60 days
        tokenType: 'Bearer'
      };
    } catch (error) {
      throw new Error('Failed to refresh Instagram token');
    }
  }

  /**
   * Refresh TikTok access token
   */
  static async refreshTiktokToken(refreshToken: string): Promise<TokenData> {
    try {
      const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY || '',
        client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000).toISOString(),
        tokenType: 'Bearer'
      };
    } catch (error) {
      throw new Error('Failed to refresh TikTok token');
    }
  }

  /**
   * Refresh Twitter/X access token
   * Note: Twitter OAuth 1.0a tokens don't expire in the same way as OAuth 2.0
   * For OAuth 2.0, you would implement token refresh here
   */
  static async refreshTwitterToken(refreshToken: string): Promise<TokenData> {
    // Twitter OAuth 1.0a tokens are long-lived, but if using OAuth 2.0:
    try {
      const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.TWITTER_CONSUMER_KEY
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000).toISOString(),
        tokenType: 'Bearer'
      };
    } catch (error) {
      throw new Error('Failed to refresh Twitter token');
    }
  }

  /**
   * Refresh Facebook access token
   */
  static async refreshFacebookToken(refreshToken: string): Promise<TokenData> {
    try {
      const response = await axios.get('https://graph.facebook.com/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: refreshToken
        }
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: refreshToken, // Facebook long-lived tokens can be used to get new ones
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // ~60 days
        tokenType: 'Bearer'
      };
    } catch (error) {
      throw new Error('Failed to refresh Facebook token');
    }
  }

  /**
   * Check if a token is expired or will expire soon
   */
  static isTokenExpired(expiresAt?: string, bufferMinutes = 60): boolean {
    if (!expiresAt) return false;
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const bufferTime = bufferMinutes * 60 * 1000;
    return now >= (expiryTime - bufferTime);
  }

  /**
   * Generic token refresh based on platform
   */
  static async refreshToken(platform: string, refreshToken: string): Promise<TokenData> {
    switch (platform) {
      case 'instagram':
        return this.refreshInstagramToken(refreshToken);
      case 'tiktok':
        return this.refreshTiktokToken(refreshToken);
      case 'twitter':
        return this.refreshTwitterToken(refreshToken);
      case 'facebook':
        return this.refreshFacebookToken(refreshToken);
      default:
        throw new Error(`Unsupported platform for token refresh: ${platform}`);
    }
  }
}
