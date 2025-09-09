import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '../../../lib/auth/jwt';
import { getUserCards } from '../../../lib/database/queries/cards';

interface GameStatistics {
  cardsCreated: number;
  gamesWon: number;
  decksBuilt: number;
  winRate: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameStatistics | { success: boolean; error: { message: string; code: string } }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  console.log('Statistics API called with method:', req.method);
  console.log('Request headers:', req.headers.authorization ? 'Has auth header' : 'No auth header');

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or invalid format');
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    });
  }

  const token = authHeader.substring(7);
  console.log('Token extracted, verifying...');

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    console.log('Token verification failed');
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    });
  }

  const userId = decoded.userId;
  console.log('Token verified for user:', userId);

  try {
    // Get cards created by user
    const userCards = await getUserCards(userId);
    const cardsCreated = userCards.length;

    // For now, decks are stored in localStorage, not database
    // TODO: Implement deck persistence in database
    const decksBuilt = 0;

    // For now, games won and win rate are placeholders
    // These would need game history tables to be implemented
    const gamesWon = 0;
    const winRate = 0;

    const statistics: GameStatistics = {
      cardsCreated,
      gamesWon,
      decksBuilt,
      winRate
    };

    console.log('Statistics retrieved:', statistics);

    res.status(200).json(statistics);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}