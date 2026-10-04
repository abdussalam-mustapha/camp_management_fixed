import passport from 'passport';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import axios from 'axios';

// In-memory storage for connected accounts (in production, use a database)
const connectedAccounts = new Map<string, any>();

export interface ConnectedAccount {
  userId: string;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'facebook';
  platformUserId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  profileData: any;
  connectedAt: string;
}

export function initializePassport(app: any) {
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.userId || user.id);
  });

  // Deserialize user
  passport.deserializeUser((id: any, done) => {
    done(null, { id });
  });

  // Instagram Strategy
  passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    callbackURL: process.env.INSTAGRAM_CALLBACK_URL || 'http://localhost:3001/api/auth/instagram/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const account: ConnectedAccount = {
        userId: profile.id,
        platform: 'instagram',
        platformUserId: profile.id,
        accessToken,
        refreshToken,
        profileData: profile._json,
        connectedAt: new Date().toISOString()
      };
      
      connectedAccounts.set(`instagram_${profile.id}`, account);
      return done(null, account);
    } catch (error) {
      return done(error as Error);
    }
  }));

  // Twitter Strategy
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY || '',
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || '',
    callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:3001/api/auth/twitter/callback',
    includeEmail: true
  },
  async (token, tokenSecret, profile, done) => {
    try {
      const account: ConnectedAccount = {
        userId: profile.id,
        platform: 'twitter',
        platformUserId: profile.id,
        accessToken: token,
        refreshToken: tokenSecret,
        profileData: profile._json,
        connectedAt: new Date().toISOString()
      };
      
      connectedAccounts.set(`twitter_${profile.id}`, account);
      return done(null, account);
    } catch (error) {
      return done(error as Error);
    }
  }));

  // Facebook Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3001/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const account: ConnectedAccount = {
        userId: profile.id,
        platform: 'facebook',
        platformUserId: profile.id,
        accessToken,
        refreshToken,
        profileData: profile._json,
        connectedAt: new Date().toISOString()
      };
      
      connectedAccounts.set(`facebook_${profile.id}`, account);
      return done(null, account);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// TikTok doesn't have a passport strategy, so we'll handle it manually
export async function handleTikTokCallback(code: string, codeVerifier: string): Promise<ConnectedAccount> {
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY || '',
      client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TIKTOK_CALLBACK_URL || '',
      code_verifier: codeVerifier
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, open_id, expires_in } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const account: ConnectedAccount = {
      userId: open_id,
      platform: 'tiktok',
      platformUserId: open_id,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : undefined,
      profileData: userResponse.data,
      connectedAt: new Date().toISOString()
    };

    connectedAccounts.set(`tiktok_${open_id}`, account);
    return account;
  } catch (error) {
    throw new Error('TikTok authentication failed');
  }
}

export function getConnectedAccount(platform: string, platformUserId: string): ConnectedAccount | undefined {
  return connectedAccounts.get(`${platform}_${platformUserId}`);
}

export function getAllConnectedAccounts(): ConnectedAccount[] {
  return Array.from(connectedAccounts.values());
}

export function removeConnectedAccount(platform: string, platformUserId: string): boolean {
  return connectedAccounts.delete(`${platform}_${platformUserId}`);
}
