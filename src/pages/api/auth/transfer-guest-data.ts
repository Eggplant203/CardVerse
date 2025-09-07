import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '../../../lib/auth/jwt';
import { transferGuestDataToUser } from '../../../lib/database/queries/cards';

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

  // Verify authentication
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

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    });
  }

  try {
    const { userId, cards, decks } = req.body;

    // Validate inputs
    if (!userId || !Array.isArray(cards) || !Array.isArray(decks)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid data format',
          code: 'INVALID_DATA'
        }
      });
    }

    // Transfer guest data to user account
    await transferGuestDataToUser(userId, cards, decks);

    return res.status(200).json({
      success: true,
      message: 'Guest data transferred successfully'
    });
  } catch (error) {
    console.error('Transfer guest data error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during data transfer',
        code: 'SERVER_ERROR'
      }
    });
  }
}
