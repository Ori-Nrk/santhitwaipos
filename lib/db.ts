import { Pool, QueryResult, PoolClient } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (pool) {
    return pool
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  console.log('[DB] Initializing connection pool...')

  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  pool.on('error', (err: Error) => {
    console.error('[DB] Unexpected error:', err.message)
  })

  pool.on('connect', () => {
    console.log('[DB] Connected to PostgreSQL')
  })

  return pool
}

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const pool = getPool()

  try {
    console.log('[DB] Executing query:', text.substring(0, 80) + '...')
    const result = await pool.query(text, params)
    console.log('[DB] Query successful, rows:', result.rows.length)
    return result
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[DB] Query failed:', errorMsg)
    throw error
  }
}

export const getClient = async (): Promise<PoolClient> => {
  const pool = getPool()

  try {
    console.log('[DB] Getting client from pool...')
    const client = await pool.connect()
    console.log('[DB] Client obtained')
    return client
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[DB] Failed to get client:', errorMsg)
    throw error
  }
}

export default getPool()