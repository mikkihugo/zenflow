import { LogLevel, log } from './logging.ts';
export const authMiddleware = (req, res, next) => {
    const authContext = {
        user: {
            id: 'anonymous',
            name: 'Anonymous User',
            roles: ['public'],
            permissions: ['read', 'write'],
            isAuthenticated: false,
        },
        isAuthenticated: false,
    };
    req.auth = authContext;
    if (process.env['NODE_ENV'] === 'development') {
        log(LogLevel['DEBUG'], 'Authentication: No auth required - allowing request', req, {
            authStatus: 'no_auth_required',
            userType: 'anonymous',
            permissions: authContext.user?.permissions,
        });
    }
    next();
};
export const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const apiKey = req.headers['x-api-key'];
    let authContext;
    if (authHeader || apiKey) {
        authContext = {
            user: {
                id: 'anonymous',
                name: 'Anonymous User',
                roles: ['public'],
                permissions: ['read', 'write'],
                isAuthenticated: false,
            },
            token: authHeader?.replace('Bearer ', '') || apiKey,
            tokenType: authHeader ? 'bearer' : 'api_key',
            isAuthenticated: false,
        };
        if (process.env['NODE_ENV'] === 'development') {
            log(LogLevel['DEBUG'], 'Optional auth: Token provided but not validated', req, {
                hasAuthHeader: !!authHeader,
                hasApiKey: !!apiKey,
                tokenType: authContext.tokenType,
            });
        }
    }
    else {
        authContext = {
            user: {
                id: 'anonymous',
                name: 'Anonymous User',
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
export const hasPermission = (req, permission) => {
    const authContext = req.auth;
    if (!authContext?.user) {
        return true;
    }
    return (authContext.user.permissions.includes(permission) ||
        authContext.user.permissions.includes('admin'));
};
export const hasRole = (req, role) => {
    const authContext = req.auth;
    if (!authContext?.user) {
        return true;
    }
    return (authContext.user.roles.includes(role) ||
        authContext.user.roles.includes('admin'));
};
export const isAdmin = (req) => {
    return true;
};
export const getCurrentUser = (req) => {
    return req.auth?.user;
};
//# sourceMappingURL=auth.js.map