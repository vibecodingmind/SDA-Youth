/**
 * Caching Utility with TTL Support
 * 
 * Provides in-memory caching for development and can be extended for Redis in production.
 * Used to cache frequently accessed data like leaderboard, daily verse, events, and badges.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

/**
 * In-memory cache implementation with TTL support
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0 };

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value as T;
  }

  /**
   * Set a value in cache with TTL in milliseconds
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    this.stats.size = this.cache.size;
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.stats.size = this.cache.size;
    return result;
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deleted = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    this.stats.size = this.cache.size;
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? `${((this.stats.hits / total) * 100).toFixed(1)}%` : '0%',
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    this.stats.size = this.cache.size;
    return cleaned;
  }
}

// Singleton cache instance
const cache = new MemoryCache();

// Cleanup interval (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * TTL constants for different cache types (in milliseconds)
 */
export const CacheTTL = {
  /** Leaderboard data - 5 minutes */
  LEADERBOARD: 5 * 60 * 1000,
  /** Daily verse - 1 hour */
  DAILY_VERSE: 60 * 60 * 1000,
  /** Events list - 1 minute */
  EVENTS_LIST: 60 * 1000,
  /** Badge definitions - 1 hour */
  BADGES: 60 * 60 * 1000,
  /** User profile - 5 minutes */
  USER_PROFILE: 5 * 60 * 1000,
  /** Devotional - 1 hour */
  DEVOTIONAL: 60 * 60 * 1000,
  /** Prayer requests - 30 seconds */
  PRAYER_REQUESTS: 30 * 1000,
  /** Forum topics - 1 minute */
  FORUM_TOPICS: 60 * 1000,
  /** Announcements - 5 minutes */
  ANNOUNCEMENTS: 5 * 60 * 1000,
} as const;

/**
 * Cache key generators for consistent key naming
 */
export const CacheKeys = {
  leaderboard: (limit = 10) => `leaderboard:${limit}`,
  dailyVerse: (date: string) => `daily-verse:${date}`,
  eventsList: (status?: string) => `events:list:${status ?? 'all'}`,
  eventById: (id: string) => `events:id:${id}`,
  badges: () => 'badges:all',
  badgeById: (id: string) => `badges:id:${id}`,
  userProfile: (id: string) => `users:profile:${id}`,
  devotional: (date: string) => `devotional:${date}`,
  prayerRequests: (status?: string) => `prayer-requests:${status ?? 'all'}`,
  forumTopics: (categoryId?: string) => `forum:topics:${categoryId ?? 'all'}`,
  announcements: (active = true) => `announcements:${active ? 'active' : 'all'}`,
} as const;

/**
 * Get or set cache with automatic fetch
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const value = await fetcher();
  
  // Store in cache
  cache.set(key, value, ttl);
  
  return value;
}

/**
 * Invalidate cache by key or pattern
 */
export function invalidateCache(keyOrPattern: string): number {
  if (keyOrPattern.includes('*')) {
    return cache.deletePattern(keyOrPattern);
  }
  return cache.delete(keyOrPattern) ? 1 : 0;
}

/**
 * Get cache instance for direct access
 */
export function getCache(): MemoryCache {
  return cache;
}

/**
 * Helper to create cached API responses
 */
export function createCachedResponse<T>(
  data: T,
  ttl: number,
  key: string
): { data: T; cached: boolean; ttl: number } {
  const existing = cache.get<T>(key);
  
  if (existing !== null) {
    return { data: existing, cached: true, ttl };
  }
  
  cache.set(key, data, ttl);
  return { data, cached: false, ttl };
}

// Export cache instance for testing
export { MemoryCache };
