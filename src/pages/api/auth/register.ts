import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { 
  EMAIL_REGEX, 
  USERNAME_REGEX, 
  PASSWORD_REGEX,
  hashPassword
} from '../../../lib/auth/password';
import { 
  createUser, 
  findUserByEmail, 
  findUserByUsername,
  storeVerificationToken,
  findUserById
} from '../../../lib/database/queries/users';
import { sendWelcomeEmail } from '../../../lib/email/sender';

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
    const { email, username, password, displayName } = req.body;

    // Validate inputs
    const validationErrors = [];

    if (!email || !EMAIL_REGEX.test(email)) {
      validationErrors.push({
        field: 'email',
        message: 'Please enter a valid email address'
      });
    }

    if (!username || !USERNAME_REGEX.test(username)) {
      validationErrors.push({
        field: 'username',
        message: 'Username must be 3-50 characters and can only contain letters, numbers, underscores and hyphens'
      });
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
      validationErrors.push({
        field: 'password',
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }

    // Check if email or username already exists
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'An account with this email already exists',
          code: 'EMAIL_TAKEN'
        }
      });
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'This username is already taken',
          code: 'USERNAME_TAKEN'
        }
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { id } = await createUser(email, username, passwordHash, displayName);

    // Generate verification token
    const verificationToken = uuidv4();

    // Store verification token
    await storeVerificationToken(id, verificationToken);

    // Send welcome email with verification link
    try {
      await sendWelcomeEmail(email, username, verificationToken);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Get the created user with all fields
    const createdUser = await findUserById(id);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: createdUser!.id,
        email: createdUser!.email,
        username: createdUser!.username,
        displayName: createdUser!.displayName,
        avatarUrl: createdUser!.avatarUrl,
        createdAt: createdUser!.createdAt,
        lastLogin: createdUser!.lastLogin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during registration',
        code: 'SERVER_ERROR'
      }
    });
  }
}
