import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '../../../lib/auth/jwt';
import { saveUserCard, getUserCards, updateUserCard, deleteUserCard } from '../../../lib/database/queries/cards';
import { Card } from '../../../types/card';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Cards API called with method:', req.method);
  console.log('Request query:', req.query);
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

  console.log('Token verified for user:', decoded.userId);
  const userId = decoded.userId;

  try {
    if (req.method === 'GET') {
      console.log('GET method called for user:', userId);
      // Get user's cards
      const cards = await getUserCards(userId);
      console.log('Cards retrieved from database:', cards.length);

      return res.status(200).json({
        success: true,
        data: cards
      });

    } else if (req.method === 'POST') {
      // Save a new card
      const { card } = req.body;

      if (!card) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Card data is required',
            code: 'MISSING_CARD_DATA'
          }
        });
      }

      const result = await saveUserCard(userId, card as Card);

      return res.status(201).json({
        success: true,
        message: 'Card saved successfully',
        data: { id: result.id }
      });

    } else if (req.method === 'PUT') {
      // Update an existing card
      const { cardId, card } = req.body;

      if (!cardId || !card) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Card ID and data are required',
            code: 'MISSING_DATA'
          }
        });
      }

      await updateUserCard(userId, cardId, card as Card);

      return res.status(200).json({
        success: true,
        message: 'Card updated successfully'
      });

    } else if (req.method === 'DELETE') {
      console.log('DELETE method called');
      // Delete a card
      const { cardId } = req.query;
      console.log('Card ID from query:', cardId);

      if (!cardId || typeof cardId !== 'string') {
        console.log('Invalid card ID');
        return res.status(400).json({
          success: false,
          error: {
            message: 'Card ID is required',
            code: 'MISSING_CARD_ID'
          }
        });
      }

      console.log('About to call deleteUserCard with userId:', userId, 'cardId:', cardId);
      const deleteResult = await deleteUserCard(userId, cardId);
      console.log('deleteUserCard completed');

      return res.status(200).json({
        success: true,
        message: 'Card deleted successfully'
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
    console.error('Cards API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
}
