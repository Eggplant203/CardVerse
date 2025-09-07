import { NextApiRequest, NextApiResponse } from 'next';
import { runMigrations } from '../../lib/database/migrations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    await runMigrations();
    return res.status(200).json({ success: true, message: 'Migrations completed successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ success: false, error: { message: 'Migration failed' } });
  }
}
