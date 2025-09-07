import { NextApiResponse } from 'next';
import { withAuth, NextApiRequestWithUser } from '../../../lib/auth/middleware';
import { PASSWORD_REGEX, hashPassword, verifyPassword } from '../../../lib/auth/password';
import { findUserByEmailOrUsername, updateUserPassword } from '../../../lib/database/queries/users';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password and new password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'New password must be at least 8 characters with uppercase, lowercase, number and special character',
          code: 'INVALID_PASSWORD'
        }
      });
    }

    // Get user with password hash
    const user = await findUserByEmailOrUsername(req.user.username);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        }
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await updateUserPassword(user.id, newPasswordHash);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during password change',
        code: 'SERVER_ERROR'
      }
    });
  }
}

export default withAuth(handler);
