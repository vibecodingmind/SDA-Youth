/**
 * Rate Limiting Middleware for BUSYBEES SDA Youth Ministry Platform
 * 
 * Implements IP-based rate limiting using a sliding window algorithm.
 * Different limits are applied based on endpoint type:
 * - Auth endpoints: 5 requests/minute (strict)
 * - API endpoints: 100 requests/minute (standard)
 * - Upload endpoints: 10 requests/minute
 * - Public endpoints: 200 requests/minute
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limit configuration types
interface RateLimitConfig {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Maximum requests allowed in the window
  message?: string;        // Custom error message
  skipFailedRequests?: boolean;
}

// Store for rate limit tracking
interface RateLimitEntry {
  count: number;
  resetTime: number;
  requests: number[];      // Timestamps of requests for sliding window
}

// In-memory store (consider Redis for production with multiple instances)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL = 60000; // 1 minute
let cleanupTimer: NodeJS.Timeout | null = null;

// Start cleanup timer
function startCleanup(): void {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(() => {
      const now = Date.now();
      const entries = Array.from(rateLimitStore.entries());
      for (const [key, entry] of entries) {
        if (now > entry.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    }, CLEANUP_INTERVAL);
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.',
  },
  
  // Password reset - very strict
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts. Please try again later.',
  },
  
  // Standard API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.',
  },
  
  // File uploads - moderate limits
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many upload requests. Please try again later.',
  },
  
  // Public endpoints - generous limits
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    message: 'Too many requests. Please slow down.',
  },
  
  // Chat/messaging - moderate limits
  chat: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'You are sending messages too quickly.',
  },
  
  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests. Please try again later.',
  },
} as const;

export type RateLimitType = keyof typeof rateLimitConfigs;

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check for forwarded headers (reverse proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  // Fallback for development
  return '127.0.0.1';
}

/**
 * Get a unique identifier for rate limiting
 * Combines IP with optional user ID for authenticated requests
 */
function getRateLimitKey(
  request: NextRequest, 
  identifier?: string,
  userId?: string
): string {
  const ip = getClientIP(request);
  const path = new URL(request.url).pathname;
  
  // Include user ID if available for per-user limits
  if (userId) {
    return `${path}:${userId}`;
  }
  
  // Use custom identifier if provided
  if (identifier) {
    return `${path}:${identifier}`;
  }
  
  // Default to IP-based limiting
  return `${path}:${ip}`;
}

/**
 * Check rate limit using sliding window algorithm
 * Returns remaining requests and reset time
 */
function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number; 
  retryAfter: number;
} {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      requests: [],
    };
    rateLimitStore.set(key, entry);
  }
  
  // Remove requests outside the window (sliding window)
  entry.requests = entry.requests.filter(time => time > windowStart);
  
  // Count requests in current window
  const currentCount = entry.requests.length;
  const remaining = Math.max(0, config.maxRequests - currentCount);
  const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
  
  if (currentCount >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }
  
  // Add current request timestamp
  entry.requests.push(now);
  entry.count = entry.requests.length;
  
  return {
    allowed: true,
    remaining: remaining - 1,
    resetTime: entry.resetTime,
    retryAfter,
  };
}

/**
 * Rate limit middleware function
 * Use this to wrap API route handlers
 */
export function rateLimit(
  type: RateLimitType = 'api',
  options?: {
    identifier?: string;
    userId?: string;
    customConfig?: Partial<RateLimitConfig>;
  }
) {
  const config: RateLimitConfig = {
    ...rateLimitConfigs[type],
    ...options?.customConfig,
  };
  
  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // Start cleanup timer
    startCleanup();
    
    const key = getRateLimitKey(request, options?.identifier, options?.userId);
    const result = checkRateLimit(key, config);
    
    // Set rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    if (!result.allowed) {
      headers.set('Retry-After', result.retryAfter.toString());
      
      return new NextResponse(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }
    
    // Request is allowed, return null to continue
    return null;
  };
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: RateLimitType = 'api'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const limiter = rateLimit(type);
    const rateLimitResponse = await limiter(request);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(request);
  };
}

/**
 * Create a custom rate limiter with specific configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  return rateLimit('api', { customConfig: config });
}

/**
 * Reset rate limit for a specific key (admin use)
 */
export function resetRateLimit(
  request: NextRequest, 
  identifier?: string,
  userId?: string
): void {
  const key = getRateLimitKey(request, identifier, userId);
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(
  request: NextRequest,
  type: RateLimitType = 'api',
  identifier?: string,
  userId?: string
): {
  remaining: number;
  resetTime: number;
  limit: number;
} {
  const config = rateLimitConfigs[type];
  const key = getRateLimitKey(request, identifier, userId);
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return {
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      limit: config.maxRequests,
    };
  }
  
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const currentCount = entry.requests.filter(time => time > windowStart).length;
  
  return {
    remaining: Math.max(0, config.maxRequests - currentCount),
    resetTime: entry.resetTime,
    limit: config.maxRequests,
  };
}

// Export types
export type { RateLimitConfig, RateLimitEntry };
