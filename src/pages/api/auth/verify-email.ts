import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByVerificationToken, updateUserVerificationStatus } from '../../../lib/database/queries/users';

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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Verification token is required',
          code: 'MISSING_TOKEN'
        }
      });
    }

    // Find user by verification token
    const user = await findUserByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired verification token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Update user verification status
    await updateUserVerificationStatus(user.id, true);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during email verification',
        code: 'SERVER_ERROR'
      }
    });
  }
}
