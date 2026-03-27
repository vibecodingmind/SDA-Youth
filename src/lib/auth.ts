/**
 * Authentication and Authorization Middleware for BUSYBEES SDA Youth Ministry Platform
 * 
 * Provides:
 * - Session management helpers
 * - Role-based access control (RBAC)
 * - Permission checking
 * - Route protection utilities
 * - Integration with NextAuth.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ============================================
// Types
// ============================================

export type UserRole = 'admin' | 'leader' | 'member';

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
}

export interface AuthResult {
  authenticated: boolean;
  user?: UserSession;
  error?: string;
}

export interface Permission {
  action: string;
  resource: string;
}

// ============================================
// Role Hierarchy
// ============================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  leader: 50,
  member: 10,
};

/**
 * Check if a role has sufficient privileges
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'admin';
}

/**
 * Check if user is leader or above
 */
export function isLeader(role: UserRole | undefined): boolean {
  return role ? hasRoleLevel(role, 'leader') : false;
}

/**
 * Check if user is member or above (any authenticated user)
 */
export function isMember(role: UserRole | undefined): boolean {
  return role ? hasRoleLevel(role, 'member') : false;
}

// ============================================
// Permission Definitions
// ============================================

const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access
    { action: 'manage', resource: 'all' },
    { action: 'delete', resource: 'all' },
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'settings' },
    { action: 'manage', resource: 'content' },
    { action: 'view', resource: 'analytics' },
    { action: 'manage', resource: 'roles' },
  ],
  leader: [
    // Content management
    { action: 'create', resource: 'events' },
    { action: 'edit', resource: 'events' },
    { action: 'delete', resource: 'events' },
    { action: 'create', resource: 'announcements' },
    { action: 'create', resource: 'devotionals' },
    { action: 'create', resource: 'bible-studies' },
    { action: 'create', resource: 'articles' },
    { action: 'moderate', resource: 'forum' },
    { action: 'moderate', resource: 'chat' },
    { action: 'view', resource: 'analytics' },
    { action: 'manage', resource: 'groups' },
    { action: 'checkin', resource: 'events' },
  ],
  member: [
    // Basic access
    { action: 'view', resource: 'events' },
    { action: 'rsvp', resource: 'events' },
    { action: 'create', resource: 'prayer-requests' },
    { action: 'create', resource: 'testimonies' },
    { action: 'create', resource: 'forum-posts' },
    { action: 'view', resource: 'devotionals' },
    { action: 'view', resource: 'bible-studies' },
    { action: 'view', resource: 'articles' },
    { action: 'chat', resource: 'rooms' },
    { action: 'redeem', resource: 'rewards' },
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole,
  action: string,
  resource: string
): boolean {
  const rolePermissions = PERMISSIONS[role] || [];
  
  return rolePermissions.some(perm => {
    // Check for wildcard permissions
    if (perm.resource === 'all') {
      return true;
    }
    
    // Check for manage wildcard action
    if (perm.action === 'manage' && perm.resource === resource) {
      return true;
    }
    
    // Exact match
    return perm.action === action && perm.resource === resource;
  });
}

// ============================================
// Session Helpers
// ============================================

/**
 * Get the current session from server-side
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || undefined,
      image: session.user.image || undefined,
      role: (session.user.role as UserRole) || 'member',
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<AuthResult> {
  const user = await getSession();
  
  if (!user) {
    return {
      authenticated: false,
      error: 'Not authenticated',
    };
  }
  
  return {
    authenticated: true,
    user,
  };
}

// ============================================
// API Route Protection
// ============================================

/**
 * Require authentication for an API route
 */
export async function requireAuth(): Promise<{
  success: true;
  user: UserSession;
} | {
  success: false;
  response: NextResponse;
}> {
  const user = await getSession();
  
  if (!user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  
  return {
    success: true,
    user,
  };
}

/**
 * Require a specific role for an API route
 */
export async function requireRole(
  requiredRole: UserRole
): Promise<{
  success: true;
  user: UserSession;
} | {
  success: false;
  response: NextResponse;
}> {
  const authResult = await requireAuth();
  
  if (!authResult.success) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!hasRoleLevel(user.role, requiredRole)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `${requiredRole} access required` },
        { status: 403 }
      ),
    };
  }
  
  return {
    success: true,
    user,
  };
}

/**
 * Require a specific permission for an API route
 */
export async function requirePermission(
  action: string,
  resource: string
): Promise<{
  success: true;
  user: UserSession;
} | {
  success: false;
  response: NextResponse;
}> {
  const authResult = await requireAuth();
  
  if (!authResult.success) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!hasPermission(user.role, action, resource)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `Permission denied: ${action} ${resource}` },
        { status: 403 }
      ),
    };
  }
  
  return {
    success: true,
    user,
  };
}

// ============================================
// Higher-Order Functions for Route Protection
// ============================================

type ApiHandler = (
  request: NextRequest,
  context: { user: UserSession }
) => Promise<NextResponse>;

/**
 * Wrap an API handler with authentication
 */
export function withAuth(handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAuth();
    
    if (authResult.success === false) {
      return authResult.response;
    }
    
    return handler(request, { user: authResult.user });
  };
}

/**
 * Wrap an API handler with role requirement
 */
export function withRole(requiredRole: UserRole, handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await requireRole(requiredRole);
    
    if (authResult.success === false) {
      return authResult.response;
    }
    
    return handler(request, { user: authResult.user });
  };
}

/**
 * Wrap an API handler with permission requirement
 */
export function withPermission(
  action: string,
  resource: string,
  handler: ApiHandler
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await requirePermission(action, resource);
    
    if (authResult.success === false) {
      return authResult.response;
    }
    
    return handler(request, { user: authResult.user });
  };
}

// ============================================
// Resource Ownership Helpers
// ============================================

/**
 * Check if user owns a resource
 */
export function isOwner(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

/**
 * Check if user can modify a resource
 * Owner or admin/leader can modify
 */
export function canModify(
  user: UserSession,
  resourceUserId: string
): boolean {
  return isOwner(user.id, resourceUserId) || isLeader(user.role);
}

/**
 * Require ownership or role for modification
 */
export async function requireOwnership(
  resourceUserId: string
): Promise<{
  success: true;
  user: UserSession;
} | {
  success: false;
  response: NextResponse;
}> {
  const authResult = await requireAuth();
  
  if (!authResult.success) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!canModify(user, resourceUserId)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'You do not have permission to modify this resource' },
        { status: 403 }
      ),
    };
  }
  
  return {
    success: true,
    user,
  };
}

// ============================================
// Client-Side Helpers
// ============================================

/**
 * Check if client has valid session
 * Returns user info if authenticated
 */
export async function checkClientAuth(): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    
    if (!session?.user) {
      return {
        authenticated: false,
        error: 'Not authenticated',
      };
    }
    
    return {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role || 'member',
      },
    };
  } catch (error) {
    return {
      authenticated: false,
      error: 'Failed to check authentication',
    };
  }
}

// ============================================
// Audit Logging
// ============================================

/**
 * Log an auth-related action
 */
export async function logAuthAction(
  userId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    // Import db dynamically to avoid circular dependencies
    const { db } = await import('@/lib/db');
    
    await db.auditLog.create({
      data: {
        userId,
        action,
        entity: 'auth',
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log auth action:', error);
  }
}

// ============================================
// Export
// ============================================

export const auth = {
  getSession,
  isAuthenticated,
  requireAuth,
  requireRole,
  requirePermission,
  hasPermission,
  hasRoleLevel,
  isAdmin,
  isLeader,
  isMember,
  canModify,
  isOwner,
  withAuth,
  withRole,
  withPermission,
  logAuthAction,
};

export default auth;
