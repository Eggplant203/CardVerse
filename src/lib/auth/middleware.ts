import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from './jwt';
import { findUserById } from '../database/queries/users';

export type NextApiRequestWithUser = NextApiRequest & {
  user?: {
    id: string;
    email: string;
    username: string;
  };
};

type ApiHandler = (
  req: NextApiRequestWithUser,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Authentication middleware for API routes
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Check if user exists
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

    // Attach user to request object
    req.user = {
      id: payload.userId,
      email: payload.email,
      username: payload.username
    };

    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Helper to get current user or throw error
 */
export function getCurrentUser(
  req: NextApiRequestWithUser
): { id: string; email: string; username: string } {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
}
