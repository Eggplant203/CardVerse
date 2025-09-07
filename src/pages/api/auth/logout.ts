import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // Logout should always succeed - it's a safe operation
  // We don't need to validate tokens for logout

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

export default handler;
