import pool from '../connection';
import { Card } from '../../../types/card';
import { Deck } from '../../../types/player';

/**
 * Save a card to user's collection
 */
export async function saveUserCard(userId: string, card: Card): Promise<{ id: string }> {
  try {
    // First ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        card_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT FALSE
      )
    `);

    // Create index if it doesn't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_cards_created_at ON user_cards(created_at);
    `);

    const result = await pool.query(
      `INSERT INTO user_cards (user_id, card_data)
       VALUES ($1, $2)
       RETURNING id`,
      [userId, JSON.stringify(card)]
    );

    return { id: result.rows[0].id };
  } catch (error) {
    console.error('Error saving user card:', error);
    throw error;
  }
}

/**
 * Get all cards for a user
 */
export async function getUserCards(userId: string): Promise<Card[]> {
  try {
    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        card_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('Querying cards for userId:', userId);
    const result = await pool.query(
      `SELECT card_data FROM user_cards
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    console.log('Database query result rows:', result.rows.length);
    const cards = result.rows.map(row => row.card_data as Card);
    console.log('Parsed cards count:', cards.length);

    return cards;
  } catch (error) {
    console.error('Error getting user cards:', error);
    return [];
  }
}

/**
 * Update a user's card
 */
export async function updateUserCard(userId: string, cardId: string, card: Card): Promise<void> {
  try {
    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        card_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.query(
      `UPDATE user_cards
       SET card_data = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      [JSON.stringify(card), cardId, userId]
    );
  } catch (error) {
    console.error('Error updating user card:', error);
    throw error;
  }
}

/**
 * Delete a user's card
 */
export async function deleteUserCard(userId: string, cardId: string): Promise<void> {
  try {
    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        card_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('Deleting card with userId:', userId, 'cardId:', cardId);

    // Delete by card_data.id, not by database row id
    const result = await pool.query(
      `DELETE FROM user_cards
       WHERE user_id = $1 AND card_data->>'id' = $2`,
      [userId, cardId]
    );

    console.log('Delete query affected rows:', result.rowCount);

  } catch (error) {
    console.error('Error deleting user card:', error);
    throw error;
  }
}

/**
 * Save a deck to user's collection
 */
export async function saveUserDeck(userId: string, deck: Deck): Promise<{ id: string }> {
  try {
    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_decks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        card_ids UUID[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index if it doesn't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_decks_user_id ON user_decks(user_id);
    `);

    const cardIds = deck.cards.map(card => card.id);

    const result = await pool.query(
      `INSERT INTO user_decks (user_id, name, description, card_ids)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, deck.name, deck.description || '', cardIds]
    );

    return { id: result.rows[0].id };
  } catch (error) {
    console.error('Error saving user deck:', error);
    throw error;
  }
}

/**
 * Get all decks for a user
 */
export async function getUserDecks(userId: string): Promise<Deck[]> {
  try {
    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_decks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        card_ids UUID[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const result = await pool.query(
      `SELECT id, name, description, card_ids FROM user_decks
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [userId]
    );

    // Get all cards for this user to populate deck cards
    const allCards = await getUserCards(userId);
    const cardMap = new Map(allCards.map(card => [card.id, card]));

    return result.rows.map(row => {
      const cards = (row.card_ids || []).map((cardId: string) => cardMap.get(cardId)).filter(Boolean);
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        cards: cards,
        coverCard: cards.length > 0 ? cards[0] : null
      };
    });
  } catch (error) {
    console.error('Error getting user decks:', error);
    return [];
  }
}

/**
 * Update a user's deck
 */
export async function updateUserDeck(userId: string, deckId: string, deck: Deck): Promise<void> {
  const cardIds = deck.cards.map(card => card.id);

  await pool.query(
    `UPDATE user_decks
     SET name = $1, description = $2, card_ids = $3, updated_at = NOW()
     WHERE id = $4 AND user_id = $5`,
    [deck.name, deck.description || '', cardIds, deckId, userId]
  );
}

/**
 * Delete a user's deck
 */
export async function deleteUserDeck(userId: string, deckId: string): Promise<void> {
  await pool.query(
    `DELETE FROM user_decks
     WHERE id = $1 AND user_id = $2`,
    [deckId, userId]
  );
}

/**
 * Transfer all guest data to a user account
 */
export async function transferGuestDataToUser(userId: string, guestCards: Card[], guestDecks: Deck[]): Promise<void> {
  // Insert all guest cards
  for (const card of guestCards) {
    await saveUserCard(userId, card);
  }

  // Insert all guest decks
  for (const deck of guestDecks) {
    await saveUserDeck(userId, deck);
  }
}
