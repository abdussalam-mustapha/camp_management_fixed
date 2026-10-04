import { Request, Response, NextFunction } from 'express';
import { getConnectedAccount } from '../config/passport';
import { TokenService } from '../services/tokenService';

/**
 * Middleware to check and refresh tokens if needed
 */
export async function tokenRefreshMiddleware(req: Request, res: Response, next: NextFunction) {
  const { platform, userId } = req.params;

  if (!platform || !userId) {
    return next();
  }

  try {
    const account = getConnectedAccount(platform, userId);
    if (!account) {
      return next();
    }

    // Check if token needs refresh (if we have expiration info)
    if (account.expiresAt && TokenService.isTokenExpired(account.expiresAt)) {
      if (account.refreshToken) {
        try {
          const newTokenData = await TokenService.refreshToken(platform, account.refreshToken);
          account.accessToken = newTokenData.accessToken;
          if (newTokenData.refreshToken) {
            account.refreshToken = newTokenData.refreshToken;
          }
          if (newTokenData.expiresAt) {
            account.expiresAt = newTokenData.expiresAt;
          }
          // In production, update in database
        } catch (error) {
          console.error(`Failed to refresh token for ${platform}:`, error);
          // Continue with current token, let the API call fail if needed
        }
      }
    }

    next();
  } catch (error) {
    console.error('Token refresh middleware error:', error);
    next();
  }
}
