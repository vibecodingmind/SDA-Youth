/**
 * Prisma Database Client with Connection Pooling
 * 
 * Optimized Prisma client configuration for production and development.
 * Includes connection pooling, query logging, and error handling.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global type for Prisma client singleton
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client options
 */
const prismaClientOptions = {
  // Query logging configuration
  log: process.env.NODE_ENV === 'development' 
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ]
    : [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
  
  // Error format configuration
  errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal' as const,
};

/**
 * Create Prisma client instance
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient(prismaClientOptions);
}

/**
 * Database client singleton
 * Uses global variable in development to prevent multiple instances
 * during hot-reloading
 */
export const db = globalForPrisma.prisma ?? createPrismaClient();

// Store in global for development hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

/**
 * Query performance logging (development only)
 */
if (process.env.NODE_ENV === 'development') {
  db.$on('query' as never, (e: { query: string; duration: number; params: string }) => {
    // Only log slow queries (>100ms) in development
    if (e.duration > 100) {
      console.log(`[Slow Query] ${e.duration}ms: ${e.query}`);
    }
  });
}

/**
 * Graceful shutdown handler
 */
export async function disconnectDB(): Promise<void> {
  try {
    await db.$disconnect();
    console.log('[DB] Disconnected from database');
  } catch (error) {
    console.error('[DB] Error disconnecting from database:', error);
    process.exit(1);
  }
}

/**
 * Health check for database connection
 */
export async function checkDBHealth(): Promise<{ 
  status: 'healthy' | 'unhealthy'; 
  latency?: number; 
  error?: string 
}> {
  const start = Date.now();
  
  try {
    // Simple query to check connection
    await db.$queryRaw`SELECT 1`;
    
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Transaction helper with retry logic
 */
export async function withTransaction<T>(
  fn: (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await db.$transaction(fn);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Transaction failed');
      
      // Check if error is retryable (e.g., connection issues)
      const isRetryable = 
        lastError.message.includes('Connection') ||
        lastError.message.includes('Timeout') ||
        lastError.message.includes('P2034'); // Transaction conflict
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.min(100 * Math.pow(2, attempt), 1000))
      );
    }
  }
  
  throw lastError;
}

/**
 * Batch query helper for large datasets
 */
export async function batchQuery<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Connection pool configuration info
 * Note: For SQLite (current setup), connection pooling is handled differently
 * For PostgreSQL/MySQL in production, configure DATABASE_URL with:
 * ?connection_limit=10&pool_timeout=30
 */
export const poolConfig = {
  // Maximum number of connections in the pool
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT ?? '10', 10),
  // Timeout for acquiring a connection from the pool (in seconds)
  poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT ?? '30', 10),
  // Idle connection timeout (in seconds)
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT ?? '10', 10),
};

export default db;
