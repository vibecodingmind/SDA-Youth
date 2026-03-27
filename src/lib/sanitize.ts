/**
 * Input Sanitization for BUSYBEES SDA Youth Ministry Platform
 * 
 * Provides comprehensive input sanitization and validation:
 * - XSS prevention
 * - HTML sanitization
 * - SQL injection prevention (via parameterized queries - Prisma handles this)
 * - File upload validation
 * - Input validation helpers
 */

// ============================================
// HTML/XSS Sanitization
// ============================================

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char] || char);
}

/**
 * Unescape HTML entities (for display purposes)
 */
export function unescapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
  };
  
  return input.replace(
    /&(amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g,
    entity => entityMap[entity] || entity
  );
}

/**
 * Strip HTML tags from input
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let stripped = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  stripped = stripped.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  stripped = stripped.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  return stripped.trim();
}

/**
 * Allowed HTML tags for rich content (markdown-like)
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i',
  'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
];

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'code': ['class'],
  'pre': ['class'],
};

/**
 * Sanitize HTML while allowing safe tags
 */
export function sanitizeHtml(input: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  const allowedTags = options?.allowedTags || ALLOWED_TAGS;
  const allowedAttributes = options?.allowedAttributes || ALLOWED_ATTRIBUTES;
  
  // First, escape everything
  let sanitized = escapeHtml(input);
  
  // Then unescape allowed tags
  allowedTags.forEach(tag => {
    // Opening tags
    const openPattern = new RegExp(`&lt;(${tag})([^&]*)(&gt;)`, 'gi');
    sanitized = sanitized.replace(openPattern, (match, tagName, attributes) => {
      // Process attributes
      const cleanAttributes = sanitizeAttributes(tagName, attributes, allowedAttributes);
      return cleanAttributes ? `<${tagName} ${cleanAttributes}>` : `<${tagName}>`;
    });
    
    // Closing tags
    const closePattern = new RegExp(`&lt;/${tag}&gt;`, 'gi');
    sanitized = sanitized.replace(closePattern, `</${tag}>`);
  });
  
  // Remove any remaining dangerous patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  return sanitized;
}

/**
 * Sanitize HTML attributes
 */
function sanitizeAttributes(
  tagName: string,
  attributes: string,
  allowedAttributes: Record<string, string[]>
): string {
  const allowed = allowedAttributes[tagName.toLowerCase()] || [];
  
  if (allowed.length === 0) {
    return '';
  }
  
  const parsedAttrs: string[] = [];
  const attrPattern = /(\w+)\s*=\s*["']([^"']*)["']/gi;
  
  let match;
  while ((match = attrPattern.exec(unescapeHtml(attributes))) !== null) {
    const [, attrName, attrValue] = match;
    
    if (allowed.includes(attrName.toLowerCase())) {
      // Validate URLs for href and src
      if (['href', 'src'].includes(attrName.toLowerCase())) {
        if (!isValidUrl(attrValue)) {
          continue;
        }
      }
      
      parsedAttrs.push(`${attrName}="${escapeHtml(attrValue)}"`);
    }
  }
  
  return parsedAttrs.join(' ');
}

// ============================================
// URL Validation
// ============================================

/**
 * Validate and sanitize URL
 */
export function isValidUrl(url: string, options?: {
  allowRelative?: boolean;
  allowedProtocols?: string[];
}): boolean {
  if (typeof url !== 'string' || !url.trim()) {
    return false;
  }
  
  const {
    allowRelative = true,
    allowedProtocols = ['http', 'https', 'mailto'],
  } = options || {};
  
  // Check for relative URLs
  if (allowRelative && url.startsWith('/')) {
    // Prevent directory traversal
    if (url.includes('..')) {
      return false;
    }
    return true;
  }
  
  try {
    const parsed = new URL(url);
    
    if (!allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize URL - returns empty string if invalid
 */
export function sanitizeUrl(url: string, options?: {
  allowRelative?: boolean;
  allowedProtocols?: string[];
}): string {
  if (!isValidUrl(url, options)) {
    return '';
  }
  
  // Basic URL encoding for safety
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return url.startsWith('/') ? url : '';
  }
}

// ============================================
// Input Validation
// ============================================

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: unknown;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password must be a string'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for common patterns
  const commonPatterns = [
    'password',
    '123456',
    'qwerty',
    'abc123',
    'letmein',
    'admin',
    'welcome',
  ];
  
  const lowerPassword = password.toLowerCase();
  for (const pattern of commonPatterns) {
    if (lowerPassword.includes(pattern)) {
      errors.push('Password contains a common pattern');
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (typeof username !== 'string') {
    return { valid: false, errors: ['Username must be a string'] };
  }
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  // Check for reserved usernames
  const reserved = ['admin', 'system', 'api', 'null', 'undefined', 'root'];
  if (reserved.includes(username.toLowerCase())) {
    errors.push('This username is reserved');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string') {
    return false;
  }
  
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it's a valid phone number (7-15 digits)
  return /^\d{7,15}$/.test(cleaned);
}

// ============================================
// File Upload Validation
// ============================================

/**
 * Allowed file types configuration
 */
const FILE_CONFIGS = {
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  document: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
    maxSize: 25 * 1024 * 1024, // 25MB
  },
  video: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.ogg', '.mov'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'],
    extensions: ['.mp3', '.ogg', '.wav', '.weba'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
};

export type FileType = keyof typeof FILE_CONFIGS;

/**
 * Validate file upload
 */
export function validateFile(file: {
  name: string;
  type: string;
  size: number;
}, type: FileType = 'image'): ValidationResult {
  const errors: string[] = [];
  const config = FILE_CONFIGS[type];
  
  // Check file size
  if (file.size > config.maxSize) {
    errors.push(`File size exceeds ${Math.round(config.maxSize / (1024 * 1024))}MB limit`);
  }
  
  // Check file type
  if (!config.mimeTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed types: ${config.mimeTypes.join(', ')}`);
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!config.extensions.includes(extension)) {
    errors.push(`Invalid file extension. Allowed extensions: ${config.extensions.join(', ')}`);
  }
  
  // Check for dangerous file names
  const dangerousPatterns = [
    '..',
    '/',
    '\\',
    '\x00',
    '<',
    '>',
    ':',
    '"',
    '|',
    '?',
    '*',
  ];
  
  for (const pattern of dangerousPatterns) {
    if (file.name.includes(pattern)) {
      errors.push('File name contains invalid characters');
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a safe filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return '';
  }
  
  // Remove path components
  let safe = filename.replace(/[/\\]/g, '_');
  
  // Remove or replace dangerous characters
  safe = safe.replace(/[<>:"|?*\x00-\x1f]/g, '_');
  
  // Remove leading dots (hidden files)
  safe = safe.replace(/^\.+/, '');
  
  // Limit length
  const maxLen = 255;
  if (safe.length > maxLen) {
    const ext = safe.split('.').pop() || '';
    const name = safe.slice(0, -(ext.length + 1));
    safe = name.slice(0, maxLen - ext.length - 1) + '.' + ext;
  }
  
  return safe || 'file';
}

// ============================================
// Object Sanitization
// ============================================

/**
 * Sanitize an object's string values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options?: {
    escapeHtml?: boolean;
    stripHtml?: boolean;
    trimStrings?: boolean;
    maxDepth?: number;
  }
): T {
  const {
    escapeHtml: shouldEscapeHtml = true,
    stripHtml: shouldStripHtml = false,
    trimStrings = true,
    maxDepth = 10,
  } = options || {};
  
  function sanitize(value: unknown, depth: number): unknown {
    if (depth > maxDepth) {
      return undefined;
    }
    
    if (typeof value === 'string') {
      let result = value;
      
      if (shouldStripHtml) {
        result = stripHtml(result);
      } else if (shouldEscapeHtml) {
        result = escapeHtml(result);
      }
      
      if (trimStrings) {
        result = result.trim();
      }
      
      return result;
    }
    
    if (Array.isArray(value)) {
      return value.map(item => sanitize(item, depth + 1));
    }
    
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      
      for (const [key, val] of Object.entries(value)) {
        // Sanitize the key as well
        const sanitizedKey = escapeHtml(key);
        result[sanitizedKey] = sanitize(val, depth + 1);
      }
      
      return result;
    }
    
    return value;
  }
  
  return sanitize(obj, 0) as T;
}

// ============================================
// Request Body Sanitization
// ============================================

/**
 * Sanitize request body
 */
export async function sanitizeRequestBody(
  request: Request
): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    
    if (typeof body !== 'object' || body === null) {
      return {};
    }
    
    return sanitizeObject(body as Record<string, unknown>);
  } catch {
    return {};
  }
}

// ============================================
// Export all
// ============================================

export const sanitizer = {
  escapeHtml,
  unescapeHtml,
  stripHtml,
  sanitizeHtml,
  isValidUrl,
  sanitizeUrl,
  isValidEmail,
  validatePassword,
  validateUsername,
  isValidPhone,
  validateFile,
  sanitizeFilename,
  sanitizeObject,
  sanitizeRequestBody,
};

export default sanitizer;
