import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { JWTPayload, RefreshTokenPayload } from '../../types/auth';

// Token Configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  JWT_SECRET: process.env.JWT_SECRET || 'development_jwt_secret',
  REFRESH_SECRET: process.env.REFRESH_SECRET || 'development_refresh_secret'
};

/**
 * Generate an access token for a user
 */
export function generateAccessToken(userId: string, email: string, username: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 15) // 15 minutes
  };
  
  return jwt.sign(payload, TOKEN_CONFIG.JWT_SECRET);
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(userId: string): { token: string, tokenId: string, expiresAt: Date } {
  const tokenId = uuidv4();
  const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
  const expiresAt = new Date(Date.now() + (expiresIn * 1000));
  
  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000)
  };
  
  const token = jwt.sign(payload, TOKEN_CONFIG.REFRESH_SECRET);
  
  return { token, tokenId, expiresAt };
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, TOKEN_CONFIG.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, TOKEN_CONFIG.REFRESH_SECRET) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
