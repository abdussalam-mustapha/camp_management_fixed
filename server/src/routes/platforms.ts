import express from 'express';
import { InstagramService } from '../services/instagramService';
import { TikTokService } from '../services/tiktokService';
import { TwitterService } from '../services/twitterService';
import { FacebookService } from '../services/facebookService';
import { getConnectedAccount, getAllConnectedAccounts, removeConnectedAccount } from '../config/passport';

const router = express.Router();

// Get all connected accounts
router.get('/connected', (req, res) => {
  try {
    const accounts = getAllConnectedAccounts();
    // Remove sensitive data before sending to frontend
    const safeAccounts = accounts.map(account => ({
      platform: account.platform,
      platformUserId: account.platformUserId,
      profileData: account.profileData,
      connectedAt: account.connectedAt
    }));
    res.json(safeAccounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connected accounts' });
  }
});

// Disconnect account
router.delete('/disconnect/:platform/:userId', (req, res) => {
  try {
    const { platform, userId } = req.params;
    const success = removeConnectedAccount(platform, userId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

// Instagram endpoints
router.get('/instagram/profile/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('instagram', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const profile = await InstagramService.getProfile(account);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Instagram profile' });
  }
});

router.get('/instagram/metrics/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('instagram', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const metrics = await InstagramService.getMetrics(account);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Instagram metrics' });
  }
});

router.get('/instagram/posts/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('instagram', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const limit = parseInt(req.query.limit as string) || 10;
    const posts = await InstagramService.getRecentPosts(account, limit);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Instagram posts' });
  }
});

// TikTok endpoints
router.get('/tiktok/profile/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('tiktok', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const profile = await TikTokService.getProfile(account);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TikTok profile' });
  }
});

router.get('/tiktok/metrics/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('tiktok', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const metrics = await TikTokService.getMetrics(account);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TikTok metrics' });
  }
});

router.get('/tiktok/videos/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('tiktok', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const limit = parseInt(req.query.limit as string) || 10;
    const videos = await TikTokService.getRecentVideos(account, limit);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TikTok videos' });
  }
});

// Twitter endpoints
router.get('/twitter/profile/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('twitter', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const profile = await TwitterService.getProfile(account);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Twitter profile' });
  }
});

router.get('/twitter/metrics/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('twitter', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const metrics = await TwitterService.getMetrics(account);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Twitter metrics' });
  }
});

router.get('/twitter/tweets/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('twitter', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const limit = parseInt(req.query.limit as string) || 10;
    const tweets = await TwitterService.getRecentTweets(account, limit);
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Twitter tweets' });
  }
});

// Facebook endpoints
router.get('/facebook/profile/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('facebook', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const profile = await FacebookService.getProfile(account);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Facebook profile' });
  }
});

router.get('/facebook/pages/:userId', async (req, res) => {
  try {
    const account = getConnectedAccount('facebook', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const pages = await FacebookService.getUserPages(account);
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Facebook pages' });
  }
});

router.get('/facebook/metrics/:userId/:pageId', async (req, res) => {
  try {
    const account = getConnectedAccount('facebook', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const metrics = await FacebookService.getPageMetrics(account, req.params.pageId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Facebook metrics' });
  }
});

router.get('/facebook/posts/:userId/:pageId', async (req, res) => {
  try {
    const account = getConnectedAccount('facebook', req.params.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }
    const limit = parseInt(req.query.limit as string) || 10;
    const posts = await FacebookService.getRecentPosts(account, req.params.pageId, limit);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Facebook posts' });
  }
});

// Token refresh endpoint
router.post('/refresh-token/:platform/:userId', async (req, res) => {
  try {
    const { platform, userId } = req.params;
    const account = getConnectedAccount(platform, userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not connected' });
    }

    if (!account.refreshToken) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    const { TokenService } = await import('../services/tokenService');
    const newTokenData = await TokenService.refreshToken(platform, account.refreshToken);

    // Update the stored token (in production, update in database)
    account.accessToken = newTokenData.accessToken;
    if (newTokenData.refreshToken) {
      account.refreshToken = newTokenData.refreshToken;
    }

    res.json({ success: true, accessToken: newTokenData.accessToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
