import mysql from 'mysql2/promise'

// MariaDB connection pool
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MARIADB_HOST || 'localhost',
      port: parseInt(process.env.MARIADB_PORT || '3306'),
      database: process.env.MARIADB_DATABASE || 'cpms',
      user: process.env.MARIADB_USER || 'root',
      password: process.env.MARIADB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })
  }
  return pool
}

// Execute a query with automatic connection management
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getPool().getConnection()
  try {
    const [rows] = await connection.execute(sql, params)
    return rows as T[]
  } finally {
    connection.release()
  }
}

// Execute a single row query
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

// Execute an insert and return the inserted ID
export async function insert(
  sql: string,
  params?: any[]
): Promise<string> {
  const connection = await getPool().getConnection()
  try {
    const [result] = await connection.execute(sql, params)
    const insertResult = result as mysql.ResultSetHeader
    return insertResult.insertId.toString()
  } finally {
    connection.release()
  }
}

// Execute an update/delete and return affected rows
export async function execute(
  sql: string,
  params?: any[]
): Promise<number> {
  const connection = await getPool().getConnection()
  try {
    const [result] = await connection.execute(sql, params)
    const executeResult = result as mysql.ResultSetHeader
    return executeResult.affectedRows
  } finally {
    connection.release()
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Close the pool (for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
