import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '../../../lib/auth/jwt';
import { saveUserDeck, getUserDecks, updateUserDeck, deleteUserDeck } from '../../../lib/database/queries/cards';
import { Deck } from '../../../types/player';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const userId = decoded.userId;

  try {
    if (req.method === 'GET') {
      // Get user's decks
      const decks = await getUserDecks(userId);

      return res.status(200).json({
        success: true,
        data: decks
      });

    } else if (req.method === 'POST') {
      // Save a new deck
      const { deck } = req.body;

      if (!deck) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Deck data is required',
            code: 'MISSING_DECK_DATA'
          }
        });
      }

      const result = await saveUserDeck(userId, deck as Deck);

      return res.status(201).json({
        success: true,
        message: 'Deck saved successfully',
        data: { id: result.id }
      });

    } else if (req.method === 'PUT') {
      // Update an existing deck
      const { deckId, deck } = req.body;

      if (!deckId || !deck) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Deck ID and data are required',
            code: 'MISSING_DATA'
          }
        });
      }

      await updateUserDeck(userId, deckId, deck as Deck);

      return res.status(200).json({
        success: true,
        message: 'Deck updated successfully'
      });

    } else if (req.method === 'DELETE') {
      // Delete a deck
      const { deckId } = req.query;

      if (!deckId || typeof deckId !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Deck ID is required',
            code: 'MISSING_DECK_ID'
          }
        });
      }

      await deleteUserDeck(userId, deckId);

      return res.status(200).json({
        success: true,
        message: 'Deck deleted successfully'
      });

    } else {
      return res.status(405).json({
        success: false,
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        }
      });
    }
  } catch (error) {
    console.error('Decks API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
}
