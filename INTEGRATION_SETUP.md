# Social Media Integration Setup Guide

This guide explains how to set up and use the social media integration features for TikTok, Twitter/X, Facebook, and Instagram.

## Overview

The integration system consists of:
1. **Backend Server** - Handles OAuth authentication and API calls to social platforms
2. **Frontend Components** - UI for connecting accounts and managing integrations
3. **Data Models** - Extended to support platform connections
4. **Sync Services** - Automatic metric fetching and profile synchronization

## Prerequisites

- Node.js 18+ installed
- Developer accounts for each social platform
- API credentials from each platform

## Backend Setup

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your API credentials. See `server/README.md` for detailed instructions on getting credentials from each platform.

### 3. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

## Frontend Setup

### 1. Configure Frontend Environment

The frontend needs to know the backend URL. Create or edit `.env` in the root directory:

```env
VITE_API_URL=http://localhost:3001
```

### 2. Frontend is Already Configured

The frontend components are already integrated:
- **Integrations Page** (`/integrations`) - UI for connecting/disconnecting accounts
- **Auth Callback** (`/auth/callback`) - Handles OAuth redirects
- **API Service** - Frontend API client for backend communication
- **Platform Sync** - Service for syncing metrics and profile data

## Usage

### Connecting a Platform Account

1. Navigate to `/integrations` in the application
2. Click "Connect [Platform]" for the desired platform
3. You'll be redirected to the platform's OAuth page
4. Authorize the application
5. You'll be redirected back to the integrations page with a success message

### Managing Connected Accounts

Once connected, you can:
- **View account details** - See profile information and connection date
- **Sync data** - Manually trigger data sync with the "Sync" button
- **Disconnect** - Remove the connection with the trash icon

### Automatic Metric Syncing

The system includes a `PlatformSyncService` that can:
- Fetch metrics from connected platforms
- Convert platform-specific metrics to standard format
- Auto-sync multiple connections
- Get profile data and recent content

Example usage:

```typescript
import { PlatformSyncService } from './utils/platformSync';

// Sync metrics for a specific connection
const result = await PlatformSyncService.syncPlatformMetrics(connection, deliverableId);

// Get profile data
const profile = await PlatformSyncService.getProfileData(connection);

// Get recent content
const posts = await PlatformSyncService.getRecentContent(connection, 10);
```

## Platform-Specific Notes

### Instagram
- Requires Instagram Basic Display API
- Tokens last ~60 days
- Supports profile, metrics, and recent posts
- Metrics include: followers, engagement, reach, impressions

### TikTok
- Requires TikTok for Developers account
- Tokens have expiration time
- Supports profile, metrics, and recent videos
- Metrics include: followers, engagement rate, likes

### Twitter/X
- Requires Twitter Developer Portal account
- OAuth 1.0a tokens are long-lived
- Supports profile, metrics, and recent tweets
- Metrics include: followers, likes, retweets, replies

### Facebook
- Requires Facebook Developers account
- Requires page ID for metrics and posts
- Tokens last ~60 days
- Supports profile, user pages, page metrics, and page posts

## Token Management

The backend includes automatic token refresh:
- Tokens are checked before API calls
- Expired tokens are automatically refreshed when possible
- Token refresh endpoint: `POST /api/platforms/refresh-token/:platform/:userId`

## Data Models

### PlatformConnection
```typescript
interface PlatformConnection {
  id: string;
  platform: Platform;
  platformUserId: string;
  platformUsername: string;
  profileData: any;
  connectedAt: string;
  lastSyncAt?: string;
  isActive: boolean;
}
```

### DeliverableMetrics (Standard Format)
```typescript
interface DeliverableMetrics {
  id: string;
  deliverableId: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  clicks: number;
  engagementRate: number;
  loggedAt: string;
  updatedAt: string;
}
```

## Security Considerations

### Development
- Store API credentials in environment variables
- Use the provided `.env.example` as a template
- Never commit `.env` files to version control

### Production
- Use a real database instead of in-memory storage
- Implement proper encryption for stored tokens
- Use HTTPS for all OAuth flows
- Add rate limiting to API endpoints
- Implement proper error handling and logging
- Consider using a secrets management service

## Troubleshooting

### OAuth Redirect Issues
- Ensure callback URLs match exactly in platform developer settings
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- Verify CORS settings allow your frontend domain

### Token Errors
- Check that API credentials are correct
- Verify token refresh logic is working
- Some platforms may require re-authorization if tokens expire

### API Rate Limits
- Each platform has rate limits for API calls
- Implement caching to reduce API calls
- Consider adding exponential backoff for retries

### Platform-Specific Issues
- **Instagram**: Ensure you're using Instagram Basic Display, not Graph API
- **TikTok**: Make sure your app has the correct permissions
- **Twitter**: Verify your Twitter Developer account is approved
- **Facebook**: Check that you have the right Facebook app permissions

## Next Steps

1. **Set up a database** - Replace in-memory storage with a proper database
2. **Add error handling** - Implement comprehensive error handling and user feedback
3. **Add caching** - Cache API responses to reduce rate limit issues
4. **Add webhooks** - Set up webhooks for real-time updates from platforms
5. **Add monitoring** - Monitor API usage and token expiration
6. **Add tests** - Write unit and integration tests for the integration system

## Support

For issues with:
- **Backend**: Check `server/README.md`
- **Platform APIs**: Refer to official platform documentation
- **OAuth flows**: Verify callback URLs and app settings in developer portals
