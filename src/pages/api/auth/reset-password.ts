import { NextApiRequest, NextApiResponse } from 'next';
import { PASSWORD_REGEX, hashPassword } from '../../../lib/auth/password';
import { 
  findUserByResetToken, 
  updateUserPassword, 
  clearResetToken 
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
    const { token, newPassword } = req.body;

    // Validate inputs
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Token and new password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
          code: 'INVALID_PASSWORD'
        }
      });
    }

    // Find user by reset token
    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await updateUserPassword(user.id, passwordHash);

    // Clear reset token
    await clearResetToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during password reset',
        code: 'SERVER_ERROR'
      }
    });
  }
}
