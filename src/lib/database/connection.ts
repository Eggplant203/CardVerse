import { Pool, PoolClient } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure neon to use fetch API
neonConfig.fetchConnectionCache = true;

// Create connection strings from environment variables
const connectionString = process.env.DATABASE_URL;
const directConnectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Create a SQL connection pool for regular operations
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
});

// Create a direct connection pool for migrations and schema operations
export const directPool = new Pool({
  connectionString: directConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5, // Fewer connections for direct operations
  idleTimeoutMillis: 10000,
});

// Create Neon client for serverless usage
export const sql = neon(connectionString);

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Helper for transactions
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Export default pool for backward compatibility
export default pool;
