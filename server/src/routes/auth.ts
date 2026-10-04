import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import { handleTikTokCallback } from '../config/passport';

// PKCE verifiers keyed by OAuth state (in-memory; fine for dev)
const tiktokVerifiers = new Map<string, string>();

const router = express.Router();

// Instagram OAuth
router.get('/instagram', passport.authenticate('instagram'));

router.get('/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const account = req.user as any;
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?platform=instagram&success=true&userId=${account.platformUserId}`);
  }
);

// Twitter/X OAuth
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    const account = req.user as any;
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?platform=twitter&success=true&userId=${account.platformUserId}`);
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'pages_show_list'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const account = req.user as any;
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?platform=facebook&success=true&userId=${account.platformUserId}`);
  }
);

// TikTok OAuth (manual implementation)
router.get('/tiktok', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(48).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('hex');
  tiktokVerifiers.set(state, codeVerifier);

  const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?` + new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || '',
    redirect_uri: process.env.TIKTOK_CALLBACK_URL || '',
    response_type: 'code',
    scope: 'user.info.basic,video.list,user.info.stats',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  res.redirect(tiktokAuthUrl);
});

router.get('/tiktok/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || typeof code !== 'string') {
      throw new Error('No code provided');
    }
    const codeVerifier = typeof state === 'string' ? tiktokVerifiers.get(state) : undefined;
    if (!codeVerifier) {
      throw new Error('Invalid or expired state');
    }
    tiktokVerifiers.delete(state as string);

    const account = await handleTikTokCallback(code, codeVerifier);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?platform=tiktok&success=true&userId=${account.platformUserId}`);
  } catch (error) {
    console.error('TikTok callback error:', (error as any)?.response?.data || error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?platform=tiktok&success=false`);
  }
});

export default router;
