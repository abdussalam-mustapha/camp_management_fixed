# Social Media Integration Backend

This backend server handles OAuth authentication and API integration for TikTok, Twitter/X, Facebook, and Instagram.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and add your API credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-session-secret-change-this

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
INSTAGRAM_CALLBACK_URL=http://localhost:3001/api/auth/instagram/callback

# TikTok OAuth
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_CALLBACK_URL=http://localhost:3001/api/auth/tiktok/callback

# Twitter/X OAuth
TWITTER_CONSUMER_KEY=your-twitter-consumer-key
TWITTER_CONSUMER_SECRET=your-twitter-consumer-secret
TWITTER_CALLBACK_URL=http://localhost:3001/api/auth/twitter/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/auth/facebook/callback
```

### 3. Getting API Credentials

#### Instagram
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add Instagram Basic Display product
4. Configure redirect URL: `http://localhost:3001/api/auth/instagram/callback`
5. Get Client ID and Secret from app settings

#### TikTok
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Add OAuth 2.0 feature
4. Configure redirect URL: `http://localhost:3001/api/auth/tiktok/callback`
5. Get Client Key and Secret from app settings

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Enable OAuth 1.0a or OAuth 2.0
4. Configure callback URL: `http://localhost:3001/api/auth/twitter/callback`
5. Get API Key and Secret from app settings

#### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure redirect URL: `http://localhost:3001/api/auth/facebook/callback`
5. Get App ID and Secret from app settings

### 4. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

- `GET /api/auth/instagram` - Start Instagram OAuth flow
- `GET /api/auth/instagram/callback` - Instagram OAuth callback
- `GET /api/auth/twitter` - Start Twitter OAuth flow
- `GET /api/auth/twitter/callback` - Twitter OAuth callback
- `GET /api/auth/facebook` - Start Facebook OAuth flow
- `GET /api/auth/facebook/callback` - Facebook OAuth callback
- `GET /api/auth/tiktok` - Start TikTok OAuth flow
- `GET /api/auth/tiktok/callback` - TikTok OAuth callback

### Platform Data

- `GET /api/platforms/connected` - Get all connected accounts
- `DELETE /api/platforms/disconnect/:platform/:userId` - Disconnect account

#### Instagram
- `GET /api/platforms/instagram/profile/:userId` - Get Instagram profile
- `GET /api/platforms/instagram/metrics/:userId` - Get Instagram metrics
- `GET /api/platforms/instagram/posts/:userId` - Get recent Instagram posts

#### TikTok
- `GET /api/platforms/tiktok/profile/:userId` - Get TikTok profile
- `GET /api/platforms/tiktok/metrics/:userId` - Get TikTok metrics
- `GET /api/platforms/tiktok/videos/:userId` - Get recent TikTok videos

#### Twitter
- `GET /api/platforms/twitter/profile/:userId` - Get Twitter profile
- `GET /api/platforms/twitter/metrics/:userId` - Get Twitter metrics
- `GET /api/platforms/twitter/tweets/:userId` - Get recent tweets

#### Facebook
- `GET /api/platforms/facebook/profile/:userId` - Get Facebook profile
- `GET /api/platforms/facebook/pages/:userId` - Get user's Facebook pages
- `GET /api/platforms/facebook/metrics/:userId/:pageId` - Get Facebook page metrics
- `GET /api/platforms/facebook/posts/:userId/:pageId` - Get recent Facebook posts

## Architecture

### Services
- `instagramService.ts` - Instagram API integration
- `tiktokService.ts` - TikTok API integration
- `twitterService.ts` - Twitter API integration
- `facebookService.ts` - Facebook API integration
- `tokenService.ts` - Token refresh and management

### Routes
- `auth.ts` - OAuth authentication routes
- `platforms.ts` - Platform data endpoints

### Configuration
- `passport.ts` - Passport.js configuration for OAuth strategies

## Security Notes

- In production, use a real database instead of in-memory storage
- Store secrets in environment variables
- Use HTTPS in production
- Implement rate limiting
- Add proper error handling and logging
- Consider implementing token encryption at rest

## Token Refresh

The system includes automatic token refresh capabilities:
- Instagram tokens expire after ~60 days
- TikTok tokens need refresh based on expiration time
- Facebook long-lived tokens last ~60 days
- Twitter OAuth 1.0a tokens are long-lived

Token refresh is handled by the `TokenService` class.

## Development

The server uses TypeScript with hot-reload in development mode via `tsx watch`.
