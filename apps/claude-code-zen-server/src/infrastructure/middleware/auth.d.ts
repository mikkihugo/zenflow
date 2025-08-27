/**
 * @file Authentication middleware and utilities for HTTP API.
 * Provides no-op authentication for development with structure for future implementation.
 */
import type { NextFunction, Request, Response } from 'express';
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
    readonly tokenType?: 'bearer' | 'api_key';
    readonly isAuthenticated: boolean;
}
/**
 * No-Op Authentication Middleware.
 *
 * Currently allows all requests without authentication.
 * Provides structure for future authentication implementation.
 */
export declare const authMiddleware: (req: Request & {
    auth?: AuthContext;
}, res: Response, next: NextFunction) => void;
/**
 * Optional Authentication Middleware.
 *
 * For routes that might have authentication but don't require it.
 * Checks for auth tokens but doesn't reject if missing.
 */
export declare const optionalAuthMiddleware: (req: Request & {
    auth?: AuthContext;
}, res: Response, next: NextFunction) => void;
/**
 * Permission Check Helper.
 *
 * Utility function to check if current user has required permission.
 * Currently always returns true since no auth is required.
 */
export declare const hasPermission: (req: Request & {
    auth?: AuthContext;
}, permission: string) => boolean;
/**
 * Role Check Helper.
 *
 * Utility function to check if current user has required role.
 * Currently always returns true since no auth is required.
 */
export declare const hasRole: (req: Request & {
    auth?: AuthContext;
}, role: string) => boolean;
/**
 * Admin Check Helper.
 *
 * Utility function to check if current user is admin.
 * Currently always returns true since no auth is required.
 */
export declare const isAdmin: () => boolean;
/**
 * Get Current User Helper.
 *
 * Utility function to get current authenticated user.
 * Returns anonymous user since no auth is required.
 */
export declare const getCurrentUser: (req: Request & {
    auth?: AuthContext;
}) => User | undefined;
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
declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}
//# sourceMappingURL=auth.d.ts.map