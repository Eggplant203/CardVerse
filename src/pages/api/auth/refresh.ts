import { NextApiRequest, NextApiResponse } from 'next';
import { 
  verifyRefreshToken, 
  generateAccessToken, 
  generateRefreshToken 
} from '../../../lib/auth/jwt';
import { 
  findRefreshToken, 
  deleteRefreshToken, 
  storeRefreshToken,
  findUserById
} from '../../../lib/database/queries/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    const { refreshToken } = req.body;

    // Check if refresh token was provided
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_TOKEN'
        }
      });
    }

    // Verify the refresh token format and expiration
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired refresh token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Check if the token exists in the database
    const tokenRecord = await findRefreshToken(refreshToken);
    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED'
        }
      });
    }

    // Delete the used refresh token
    await deleteRefreshToken(tokenRecord.id);

    // Get user data
    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.email, user.username);
    const { token: newRefreshToken, expiresAt } = generateRefreshToken(user.id);
    
    // Store new refresh token
    await storeRefreshToken(user.id, newRefreshToken, expiresAt);

    // Return new tokens
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during token refresh',
        code: 'SERVER_ERROR'
      }
    });
  }
}
