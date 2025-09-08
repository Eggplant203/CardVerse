import pool from '../connection';
import { UserProfile } from '../../../types/auth';

/**
 * Create a new user in the database
 */
export async function createUser(
  email: string,
  username: string,
  passwordHash: string,
  displayName?: string
): Promise<{ id: string }> {
  const result = await pool.query(
    `INSERT INTO users (email, username, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, username, passwordHash, displayName || username]
  );
  
  return { id: result.rows[0].id };
}

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const result = await pool.query(
    `SELECT id, email, username, display_name as "displayName", avatar_url as "avatarUrl", 
     created_at as "createdAt", last_login as "lastLogin"
     FROM users
     WHERE email = $1`,
    [email]
  );
  
  return result.rows[0] || null;
}

/**
 * Find a user by username
 */
export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  const result = await pool.query(
    `SELECT id, email, username, display_name as "displayName", avatar_url as "avatarUrl", 
     created_at as "createdAt", last_login as "lastLogin"
     FROM users
     WHERE username = $1`,
    [username]
  );
  
  return result.rows[0] || null;
}

/**
 * Find a user by email with reset token info
 */
export async function findUserByEmailWithResetToken(email: string): Promise<{
  id: string;
  email: string;
  username: string;
  displayName: string;
  reset_token: string | null;
  reset_token_expires: Date | null;
} | null> {
  const result = await pool.query(
    `SELECT id, email, username, display_name as "displayName", 
     reset_token, reset_token_expires
     FROM users
     WHERE email = $1`,
    [email]
  );
  
  return result.rows[0] || null;
}

/**
 * Find a user by email or username (for login)
 */
export async function findUserByEmailOrUsername(emailOrUsername: string): Promise<{
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
} | null> {
  const result = await pool.query(
    `SELECT id, email, username, display_name as "displayName", 
     avatar_url as "avatarUrl", password_hash as "passwordHash",
     created_at as "createdAt", last_login as "lastLogin"
     FROM users
     WHERE email = $1 OR username = $1`,
    [emailOrUsername]
  );
  
  return result.rows[0] || null;
}

/**
 * Find a user by ID
 */
export async function findUserById(id: string): Promise<UserProfile | null> {
  const result = await pool.query(
    `SELECT id, email, username, display_name as "displayName", avatar_url as "avatarUrl", 
     created_at as "createdAt", last_login as "lastLogin"
     FROM users
     WHERE id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    displayName?: string;
    avatarUrl?: string;
  }
): Promise<UserProfile> {
  const updateFields = [];
  const values = [userId];
  let paramIndex = 2;
  
  if (data.displayName !== undefined) {
    updateFields.push(`display_name = $${paramIndex}`);
    values.push(data.displayName);
    paramIndex++;
  }
  
  if (data.avatarUrl !== undefined) {
    updateFields.push(`avatar_url = $${paramIndex}`);
    values.push(data.avatarUrl);
    paramIndex++;
  }
  
  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }
  
  const updateQuery = `
    UPDATE users
    SET ${updateFields.join(', ')},
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, email, username, display_name as "displayName", 
              avatar_url as "avatarUrl", created_at as "createdAt", 
              last_login as "lastLogin"
  `;
  
  const result = await pool.query(updateQuery, values);
  return result.rows[0];
}

/**
 * Update last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await pool.query(
    `UPDATE users
     SET last_login = NOW()
     WHERE id = $1`,
    [userId]
  );
}

/**
 * Change password
 */
export async function updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
  await pool.query(
    `UPDATE users
     SET password_hash = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [userId, newPasswordHash]
  );
}

/**
 * Store a refresh token
 */
export async function storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<string> {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, token, expiresAt]
  );
  
  return result.rows[0].id;
}

/**
 * Find a refresh token
 */
export async function findRefreshToken(token: string): Promise<{
  id: string;
  userId: string;
  expiresAt: Date;
} | null> {
  const result = await pool.query(
    `SELECT id, user_id as "userId", expires_at as "expiresAt"
     FROM refresh_tokens
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );
  
  return result.rows[0] || null;
}

/**
 * Delete a refresh token
 */
export async function deleteRefreshToken(id: string): Promise<void> {
  await pool.query(
    `DELETE FROM refresh_tokens WHERE id = $1`,
    [id]
  );
}

/**
 * Delete all refresh tokens for a user
 */
export async function deleteAllUserRefreshTokens(userId: string): Promise<void> {
  await pool.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );
}

/**
 * Store a reset token
 */
export async function storePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
  await pool.query(
    `UPDATE users
     SET reset_token = $2,
         reset_token_expires = $3
     WHERE id = $1`,
    [userId, token, expiresAt]
  );
}

/**
 * Find a user by reset token
 */
export async function findUserByResetToken(token: string): Promise<{ id: string } | null> {
  const result = await pool.query(
    `SELECT id
     FROM users
     WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [token]
  );
  
  return result.rows[0] || null;
}

/**
 * Clear a reset token
 */
export async function clearResetToken(userId: string): Promise<void> {
  await pool.query(
    `UPDATE users
     SET reset_token = NULL,
         reset_token_expires = NULL
     WHERE id = $1`,
    [userId]
  );
}

/**
 * Store a verification token
 */
export async function storeVerificationToken(userId: string, token: string): Promise<void> {
  await pool.query(
    `UPDATE users
     SET verification_token = $2
     WHERE id = $1`,
    [userId, token]
  );
}

/**
 * Find a user by verification token
 */
export async function findUserByVerificationToken(token: string): Promise<{ id: string } | null> {
  const result = await pool.query(
    `SELECT id
     FROM users
     WHERE verification_token = $1`,
    [token]
  );
  
  return result.rows[0] || null;
}

/**
 * Update user verification status
 */
export async function updateUserVerificationStatus(userId: string, isVerified: boolean): Promise<void> {
  await pool.query(
    `UPDATE users
     SET is_verified = $2,
         verification_token = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [userId, isVerified]
  );
}

/**
 * Find a user by ID with password hash (for password verification)
 */
export async function findUserByIdWithPassword(id: string): Promise<{
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
} | null> {
  const result = await pool.query(
    `SELECT id, email, username, display_name as "displayName", 
     avatar_url as "avatarUrl", password_hash as "passwordHash",
     created_at as "createdAt", last_login as "lastLogin"
     FROM users
     WHERE id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
}
