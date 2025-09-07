import { NextApiResponse } from 'next';
import { withAuth, NextApiRequestWithUser } from '../../../lib/auth/middleware';
import { findUserById, updateUserProfile } from '../../../lib/database/queries/users';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  // Get user profile (GET) or update user profile (PUT)
  if (req.method === 'GET') {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      // Get full user profile
      const user = await findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Server error while fetching profile',
          code: 'SERVER_ERROR'
        }
      });
    }
  } else if (req.method === 'PUT') {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      const { displayName, avatarUrl } = req.body;
      
      // Validate display name
      if (displayName && (displayName.length < 2 || displayName.length > 100)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Display name must be between 2 and 100 characters',
            code: 'INVALID_DISPLAY_NAME'
          }
        });
      }

      // Update user profile
      const updatedUser = await updateUserProfile(req.user.id, {
        displayName,
        avatarUrl
      });

      return res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Server error while updating profile',
          code: 'SERVER_ERROR'
        }
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }
}

export default withAuth(handler);
