import { directPool } from '../connection';

/**
 * Creates all the required database tables if they don't exist yet.
 * This function is called when the application starts.
 * Uses direct connection for schema operations.
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('Running database migrations...');

    // Create users table
    await directPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        verification_token VARCHAR(255)
      )
    `);

    // Create indexes for users
    await directPool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
    `);

    // Create user cards table
    await directPool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        card_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT FALSE
      )
    `);

    // Create indexes for user_cards
    await directPool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_cards_created_at ON user_cards(created_at);
    `);

    // Create user decks table
    await directPool.query(`
      CREATE TABLE IF NOT EXISTS user_decks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        card_ids UUID[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for user_decks
    await directPool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_decks_user_id ON user_decks(user_id);
    `);

    // Create game sessions table
    await directPool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player1_id UUID REFERENCES users(id),
        player2_id UUID REFERENCES users(id),
        winner_id UUID REFERENCES users(id),
        game_data JSONB,
        status VARCHAR(20) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      )
    `);

    // Create refresh tokens table
    await directPool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for refresh_tokens
    await directPool.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    `);

    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}
