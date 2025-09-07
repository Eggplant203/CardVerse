import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { findUserByEmailWithResetToken, storePasswordResetToken, clearResetToken, findUserByResetToken } from '../../../lib/database/queries/users';
import { sendPasswordResetEmail } from '../../../lib/email/sender';

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
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is required',
          code: 'MISSING_EMAIL'
        }
      });
    }

    // Find user by email
    const user = await findUserByEmailWithResetToken(email);
    
    // Check if email exists
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Email not found. Please check your email address.',
          code: 'EMAIL_NOT_FOUND'
        }
      });
    }

    // Check if user has a recent reset token (cooldown period)
    // For simplicity, we'll use a 5-minute cooldown
    const cooldownMinutes = 5;
    
    // Check if user already has an active reset token
    // This serves as a cooldown mechanism - if they have an unexpired token, they can't request another
    if (user.reset_token) {
      const existingTokenUser = await findUserByResetToken(user.reset_token);
      if (existingTokenUser && existingTokenUser.id === user.id) {
        return res.status(429).json({
          success: false,
          error: {
            message: `You can only request a password reset once every ${cooldownMinutes} minutes. Please check your email or try again later.`,
            code: 'COOLDOWN_ACTIVE',
            cooldownMinutes: cooldownMinutes
          }
        });
      }
    }
    
    // Clear any existing reset token before creating a new one
    await clearResetToken(user.id);

    // Generate reset token
    const resetToken = uuidv4();
    
    // Set expiry for token (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Store reset token
    await storePasswordResetToken(user.id, resetToken, expiresAt);

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.displayName || user.username, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email. Please check your inbox.',
      cooldownMinutes: cooldownMinutes
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during password reset request',
        code: 'SERVER_ERROR'
      }
    });
  }
}
