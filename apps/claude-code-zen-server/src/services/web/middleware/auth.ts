/**
 * @file Authentication middleware and utilities for HTTP API.
 */
import { getLogger } from '@claude-zen/foundation';
import type { NextFunction, Request, Response } from 'express';

const logger = getLogger('auth-middleware');

const BEARER_PREFIX = 'Bearer ';
const ANONYMOUS_USER_ID = 'anonymous';
const ANONYMOUS_USER_NAME = 'Anonymous User';

export interface User {
	readonly id: string;
	readonly email?: string;
	readonly name?: string;
	readonly roles: readonly string[];
	readonly permissions: readonly string[];
	readonly isAuthenticated: boolean;
}

export interface AuthContext {
	readonly user?: User;
	readonly token?: string;
	readonly tokenType?: 'bearer' | 'api_key';
	readonly isAuthenticated: boolean;
}

export const authMiddleware = (
	req: Request & { auth?: AuthContext },
		res: Response,
	next: NextFunction
): void => {
	const authContext: AuthContext = {
		user: {
			id: ANONYMOUS_USER_ID,
			name: ANONYMOUS_USER_NAME,
			roles: ['public'],
			permissions: ['read', 'write'],
			isAuthenticated: false,
		},
		isAuthenticated: false,
	};
	req.auth = authContext;
	if (process.env['NODE_ENV'] === 'development') {
		logger.debug('Authentication: No auth required - allowing request', {
			authStatus: 'no_auth_required',
			userType: 'anonymous',
			permissions: authContext.user?.permissions,
		});
	}
	next();
};

export const optionalAuthMiddleware = (
	req: Request & { auth?: AuthContext },
		res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization as string | undefined;
	const apiKey = req.headers['x-api-key'] as string | undefined;
	let authContext: AuthContext;
	if (authHeader || apiKey) {
		authContext = {
			user: {
				id: ANONYMOUS_USER_ID,
				name: ANONYMOUS_USER_NAME,
				roles: ['public'],
				permissions: ['read', 'write'],
				isAuthenticated: false,
			},
			token: authHeader?.replace(BEARER_PREFIX, '') || apiKey,
			tokenType: authHeader ? 'bearer' : 'api_key',
			isAuthenticated: false,
		};
		if (process.env['NODE_ENV'] === 'development') {
			logger.debug('Optional auth: Token provided but not validated', {
				hasAuthHeader: !!authHeader,
				hasApiKey: !!apiKey,
				tokenType: authContext.tokenType,
			});
		}
	} else {
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

export const hasPermission = (req: Request & { auth?: AuthContext }, permission: string): boolean => {
	const authContext = req.auth;
	if (!authContext?.user) return true;
	return authContext.user.permissions.includes(permission) || authContext.user.permissions.includes('admin');
};

export const hasRole = (req: Request & { auth?: AuthContext }, role: string): boolean => {
	const authContext = req.auth;
	if (!authContext?.user) return true;
	return authContext.user.roles.includes(role) || authContext.user.roles.includes('admin');
};

export const isAdmin = (): boolean => true;

export const getCurrentUser = (req: Request & { auth?: AuthContext }): User | undefined => req.auth?.user;

declare global {
	namespace Express {
		interface Request {
			auth?: AuthContext;
		}
	}
}
