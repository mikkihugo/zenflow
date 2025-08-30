/**
 * @file Authentication middleware and utilities for HTTP API.
 * Provides no-op authentication for development with structure for future implementation.
 */

import { getLogger } from '@claude-zen/foundation';
import type { NextFunction, Request, Response } from 'express';

const logger = getLogger('auth-middleware');

// Constants
const BEARER_PREFIX = 'Bearer ';
const ANONYMOUS_USER_ID = 'anonymous';
const ANONYMOUS_USER_NAME = 'Anonymous User';

/**
 * User information interface (for future use)
 * Following Google Identity standards structure.
 */
export interface User {
  readonly id: string;
  readonly email?: string;
  readonly name?: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly isAuthenticated: boolean;
}

/**
 * Authentication context (for future use).
 */
export interface AuthContext {
  readonly user?: User;
  readonly token?: string;
  readonly tokenType?: 'bearer' | ' api_key';
  readonly isAuthenticated: boolean;
}

/**
 * No-Op Authentication Middleware.
 *
 * Currently allows all requests without authentication.
 * Provides structure for future authentication implementation.
 */
export const authMiddleware = (
  req: Request & { auth?: AuthContext },
  res: Response,
  next: NextFunction
): void => {
  // Create anonymous user context
  const authContext: AuthContext = {
    user: {
      id: ANONYMOUS_USER_ID,
      name: ANONYMOUS_USER_NAME,
      roles: ['public'],
      permissions: ['read', 'write'],
      // Allow all operations for now
      isAuthenticated: false,
    },
    isAuthenticated: false,
  };

  // Attach auth context to request for use in route handlers
  req.auth = authContext;

  // Log authentication status (only in development)
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Authentication:No auth required - allowing request', {
      authStatus: 'no_auth_required',
      userType: 'anonymous',
      permissions: authContext.user?.permissions,
    });
  }

  // Continue to next middleware
  next();
};

/**
 * Optional Authentication Middleware.
 *
 * For routes that might have authentication but don't require it.
 * Checks for auth tokens but doesn't reject if missing.
 */
export const optionalAuthMiddleware = (
  req: Request & { auth?: AuthContext },
  res: Response,
  next: NextFunction
): void => {
  // Check for auth headers (but don't enforce)
  const authHeader = req.headers.authorization as string | undefined;
  const apiKey = req.headers['x-api-key'] as string | undefined;
  let authContext: AuthContext;

  if (authHeader || apiKey) {
    // Some auth provided - could be validated here in future
    authContext = {
      user: {
        id: ANONYMOUS_USER_ID,
        name: ANONYMOUS_USER_NAME,
        roles: ['public'],
        permissions: ['read', 'write'],
        isAuthenticated: false,
        // Still false since we're not actually validating
      },
      token: authHeader?.replace(BEARER_PREFIX, '') || apiKey,
      tokenType: authHeader ? 'bearer' : ' api_key',
      isAuthenticated: false,
    };

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Optional auth:Token provided but not validated', {
        hasAuthHeader: !!authHeader,
        hasApiKey: !!apiKey,
        tokenType: authContext.tokenType,
      });
    }
  } else {
    // No auth provided
    authContext = {
      user: {
        id: ANONYMOUS_USER_ID,
        name: ANONYMOUS_USER_NAME,
        roles: ['public'],
        permissions: ['read', 'write'],
        isAuthenticated: false,
      },
      isAuthenticated: false,
    };
  }

  req.auth = authContext;
  next();
};

/**
 * Permission Check Helper.
 *
 * Utility function to check if current user has required permission.
 * Currently always returns true since no auth is required.
 */
export const hasPermission = (
  req: Request & { auth?: AuthContext },
  permission: string
): boolean => {
  const authContext = req.auth;

  if (!authContext?.user) {
    return true; // Allow all since no auth required
  }

  return (
    authContext.user.permissions.includes(permission) ||
    authContext.user.permissions.includes('admin')
  );
};

/**
 * Role Check Helper.
 *
 * Utility function to check if current user has required role.
 * Currently always returns true since no auth is required.
 */
export const hasRole = (
  req: Request & { auth?: AuthContext },
  role: string
): boolean => {
  const authContext = req.auth;

  if (!authContext?.user) {
    return true; // Allow all since no auth required
  }

  return (
    authContext.user.roles.includes(role) ||
    authContext.user.roles.includes('admin')
  );
};

/**
 * Admin Check Helper.
 *
 * Utility function to check if current user is admin.
 * Currently always returns true since no auth is required.
 */
export const isAdmin = (/* req:Request */): boolean => true; // Allow all admin operations since no auth required

/**
 * Get Current User Helper.
 *
 * Utility function to get current authenticated user.
 * Returns anonymous user since no auth is required.
 */
export const getCurrentUser = (
  req: Request & { auth?: AuthContext }
): User | undefined => req.auth?.user;

/**
 * Future Authentication Implementation Guide.
 *
 * When authentication is needed, replace the middleware with:
 *
 * 1. JWT Token Validation:
 * - Verify JWT signature
 * - Check expiration
 * - Extract user claims
 *
 * 2. API Key Validation:
 * - Validate API key against database
 * - Check key permissions and rate limits
 *
 * 3. OAuth Integration:
 * - Support Google OAuth, GitHub OAuth, etc.
 * - Validate OAuth tokens with provider
 *
 * 4. Role-Based Access Control:
 * - Implement proper permission checking
 * - Support hierarchical roles
 *
 * 5. Rate Limiting by User:
 * - Different limits for authenticated vs anonymous
 * - Per-user rate limiting
 */

// Extend Express Request interface to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
