import { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword } from '../../../lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '../../../lib/auth/jwt';
import { 
  findUserByEmailOrUsername, 
  updateLastLogin,
  storeRefreshToken
} from '../../../lib/database/queries/users';

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

  console.log('Login API called with body:', req.body);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  try {
    const { emailOrUsername, password, rememberMe = false } = req.body;

    // Validate inputs
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email/username and password are required',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Find user by email or username
    const user = await findUserByEmailOrUsername(emailOrUsername);
    
    // If no user found or password doesn't match
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email/username or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.username);
    const { token: refreshToken, expiresAt } = generateRefreshToken(user.id, rememberMe);
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken, expiresAt);
    
    // Update last login time
    await updateLastLogin(user.id);

    // Return tokens and user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during login',
        code: 'SERVER_ERROR'
      }
    });
  }
}
