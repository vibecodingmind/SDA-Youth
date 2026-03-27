/**
 * CSRF (Cross-Site Request Forgery) Protection for BUSYBEES SDA Youth Ministry Platform
 * 
 * Provides CSRF token generation, validation, and middleware functions.
 * Tokens are cryptographically signed and have configurable expiration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// CSRF Token configuration
interface CsrfConfig {
  tokenLength: number;       // Length of random token bytes
  tokenExpiry: number;       // Token expiration time in milliseconds
  cookieName: string;        // Name of the CSRF cookie
  headerName: string;        // Name of the CSRF header
  fieldName: string;         // Name of the CSRF form field
  secureCookie: boolean;     // Use secure cookie flag
  sameSite: 'strict' | 'lax' | 'none';  // SameSite cookie attribute
}

// Default configuration
const defaultConfig: CsrfConfig = {
  tokenLength: 32,
  tokenExpiry: 60 * 60 * 1000, // 1 hour
  cookieName: 'csrf_token',
  headerName: 'x-csrf-token',
  fieldName: '_csrf',
  secureCookie: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

// CSRF token store (consider Redis for production)
interface CsrfTokenEntry {
  token: string;
  signature: string;
  createdAt: number;
  userId?: string;
}

const csrfTokenStore = new Map<string, CsrfTokenEntry>();

// Secret key for signing tokens (use environment variable in production)
const getSecretKey = (): string => {
  return process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'busybees-csrf-secret-key';
};

/**
 * Generate a cryptographically secure random token
 */
function generateToken(length: number): string {
  return randomBytes(length).toString('hex');
}

/**
 * Create a signature for a token using HMAC
 */
function signToken(token: string, userId?: string): string {
  const secret = getSecretKey();
  const data = userId ? `${token}:${userId}` : token;
  return createHash('sha256')
    .update(data + secret)
    .digest('hex');
}

/**
 * Verify a token signature
 */
function verifySignature(token: string, signature: string, userId?: string): boolean {
  const expectedSignature = signToken(token, userId);
  
  try {
    // Use timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate a new CSRF token
 * Returns both the token and the signed version
 */
export function generateCsrfToken(userId?: string): {
  token: string;
  signedToken: string;
  cookieValue: string;
} {
  const token = generateToken(defaultConfig.tokenLength);
  const signature = signToken(token, userId);
  const signedToken = `${token}.${signature}`;
  
  // Store the token
  const key = userId || 'anonymous';
  csrfTokenStore.set(key, {
    token,
    signature,
    createdAt: Date.now(),
    userId,
  });
  
  // Cookie value combines token and signature
  const cookieValue = `${token}:${signature}`;
  
  return {
    token,
    signedToken,
    cookieValue,
  };
}

/**
 * Validate a CSRF token
 * Checks both the token and signature
 */
export function validateCsrfToken(
  token: string,
  signature: string,
  userId?: string
): { valid: boolean; error?: string } {
  const key = userId || 'anonymous';
  const entry = csrfTokenStore.get(key);
  
  // Check if token exists in store
  if (!entry) {
    return { valid: false, error: 'CSRF token not found' };
  }
  
  // Check if token has expired
  if (Date.now() - entry.createdAt > defaultConfig.tokenExpiry) {
    csrfTokenStore.delete(key);
    return { valid: false, error: 'CSRF token has expired' };
  }
  
  // Verify the signature
  if (!verifySignature(token, signature, userId)) {
    return { valid: false, error: 'Invalid CSRF token signature' };
  }
  
  // Verify the token matches
  if (entry.token !== token) {
    return { valid: false, error: 'CSRF token mismatch' };
  }
  
  return { valid: true };
}

/**
 * Extract CSRF token from request
 * Checks header, body, and query parameters
 */
export function extractCsrfToken(request: NextRequest): {
  token: string | null;
  signature: string | null;
} {
  // Check header first
  const headerToken = request.headers.get(defaultConfig.headerName);
  if (headerToken) {
    const parts = headerToken.split('.');
    if (parts.length === 2) {
      return { token: parts[0], signature: parts[1] };
    }
    return { token: headerToken, signature: null };
  }
  
  // Check cookie
  const cookieToken = request.cookies.get(defaultConfig.cookieName)?.value;
  if (cookieToken) {
    const parts = cookieToken.split(':');
    if (parts.length === 2) {
      return { token: parts[0], signature: parts[1] };
    }
  }
  
  return { token: null, signature: null };
}

/**
 * CSRF protection middleware
 * Validates CSRF tokens for state-changing operations
 */
export function csrfProtection(userId?: string) {
  return async function csrfMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // Only protect state-changing methods
    const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    
    if (!protectedMethods.includes(request.method)) {
      return null; // Allow GET, HEAD, OPTIONS
    }
    
    const { token, signature } = extractCsrfToken(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'CSRF token is required' },
        { status: 403 }
      );
    }
    
    if (!signature) {
      return NextResponse.json(
        { error: 'CSRF token signature is missing' },
        { status: 403 }
      );
    }
    
    const validation = validateCsrfToken(token, signature, userId);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    return null; // Allow request to proceed
  };
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse>,
  getUserId?: (request: NextRequest) => string | undefined
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const userId = getUserId?.(request);
    const middleware = csrfProtection(userId);
    const csrfResponse = await middleware(request);
    
    if (csrfResponse) {
      return csrfResponse;
    }
    
    return handler(request);
  };
}

/**
 * Set CSRF token cookie on response
 */
export function setCsrfCookie(
  response: NextResponse,
  cookieValue: string
): void {
  response.cookies.set({
    name: defaultConfig.cookieName,
    value: cookieValue,
    httpOnly: true,
    secure: defaultConfig.secureCookie,
    sameSite: defaultConfig.sameSite,
    path: '/',
    maxAge: defaultConfig.tokenExpiry / 1000, // Convert to seconds
  });
}

/**
 * Create a new CSRF token and set it on the response
 */
export function createCsrfResponse(
  request: NextRequest,
  userId?: string
): NextResponse {
  const { token, signedToken, cookieValue } = generateCsrfToken(userId);
  
  const response = NextResponse.json({
    csrfToken: signedToken,
    fieldName: defaultConfig.fieldName,
    headerName: defaultConfig.headerName,
  });
  
  setCsrfCookie(response, cookieValue);
  
  return response;
}

/**
 * Clean up expired CSRF tokens
 */
export function cleanupExpiredTokens(): void {
  const now = Date.now();
  
  const entries = Array.from(csrfTokenStore.entries());
  for (const [key, entry] of entries) {
    if (now - entry.createdAt > defaultConfig.tokenExpiry) {
      csrfTokenStore.delete(key);
    }
  }
}

/**
 * Get CSRF token info for client-side use
 */
export function getCsrfInfo(): {
  cookieName: string;
  headerName: string;
  fieldName: string;
} {
  return {
    cookieName: defaultConfig.cookieName,
    headerName: defaultConfig.headerName,
    fieldName: defaultConfig.fieldName,
  };
}

/**
 * Validate origin/referer headers for additional CSRF protection
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  // Allow requests without origin/referer (same-origin navigation)
  if (!origin && !referer) {
    return true;
  }
  
  // Check origin if present
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const allowedOrigins = [
        host,
        `https://${host}`,
        `http://${host}`,
        process.env.NEXTAUTH_URL,
      ].filter(Boolean);
      
      const isValidOrigin = allowedOrigins.some(
        allowed => originUrl.host === new URL(allowed || '').host
      );
      
      if (!isValidOrigin) {
        return false;
      }
    } catch {
      return false;
    }
  }
  
  // Check referer if present
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const hostUrl = host ? new URL(`https://${host}`) : null;
      
      if (hostUrl && refererUrl.host !== hostUrl.host) {
        return false;
      }
    } catch {
      return false;
    }
  }
  
  return true;
}

/**
 * Combined CSRF middleware with origin validation
 */
export function enhancedCsrfProtection(userId?: string) {
  return async function enhancedCsrfMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // Validate origin first
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }
    
    // Then validate CSRF token
    return csrfProtection(userId)(request);
  };
}

// Cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredTokens, 5 * 60 * 1000); // Every 5 minutes
}

// Export types
export type { CsrfConfig, CsrfTokenEntry };
