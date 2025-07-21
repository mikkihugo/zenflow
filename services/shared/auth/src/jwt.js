/**
 * JWT Authentication Module for Vision-to-Code Services
 * Handles service-to-service authentication and user authentication
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTManager {
  constructor(config = {}) {
    this.config = {
      secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
      issuer: process.env.JWT_ISSUER || 'vision-to-code',
      audience: process.env.JWT_AUDIENCE || 'vision-to-code-services',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      ...config
    };

    // Service-specific secrets for enhanced security
    this.serviceSecrets = {
      'business-service': process.env.BUSINESS_SERVICE_SECRET || this.generateServiceSecret('business'),
      'core-service': process.env.CORE_SERVICE_SECRET || this.generateServiceSecret('core'),
      'swarm-service': process.env.SWARM_SERVICE_SECRET || this.generateServiceSecret('swarm'),
      'development-service': process.env.DEVELOPMENT_SERVICE_SECRET || this.generateServiceSecret('development')
    };
  }

  /**
   * Generate a service-specific secret
   */
  generateServiceSecret(serviceName) {
    return crypto
      .createHash('sha256')
      .update(`${this.config.secret}-${serviceName}`)
      .digest('hex');
  }

  /**
   * Create a JWT token for service-to-service communication
   */
  createServiceToken(serviceId, targetServices = [], permissions = []) {
    const payload = {
      sub: `service:${serviceId}`,
      aud: targetServices.length > 0 ? targetServices : [this.config.audience],
      iss: this.config.issuer,
      service_id: serviceId,
      permissions,
      type: 'service'
    };

    const secret = this.serviceSecrets[serviceId] || this.config.secret;
    
    return jwt.sign(payload, secret, {
      expiresIn: this.config.expiresIn,
      algorithm: 'HS256'
    });
  }

  /**
   * Create a JWT token for user authentication
   */
  createUserToken(userId, email, roles = [], permissions = []) {
    const payload = {
      sub: `user:${userId}`,
      email,
      roles,
      permissions,
      type: 'user'
    };

    return jwt.sign(payload, this.config.secret, {
      expiresIn: this.config.expiresIn,
      issuer: this.config.issuer,
      audience: this.config.audience,
      algorithm: 'HS256'
    });
  }

  /**
   * Create a refresh token
   */
  createRefreshToken(subject) {
    const payload = {
      sub: subject,
      type: 'refresh',
      jti: crypto.randomBytes(16).toString('hex')
    };

    return jwt.sign(payload, this.config.secret, {
      expiresIn: this.config.refreshExpiresIn,
      issuer: this.config.issuer,
      algorithm: 'HS256'
    });
  }

  /**
   * Verify and decode a token
   */
  verifyToken(token, options = {}) {
    try {
      // First, decode without verification to check the type
      const decoded = jwt.decode(token);
      
      if (!decoded) {
        throw new Error('Invalid token format');
      }

      // Determine which secret to use
      let secret = this.config.secret;
      if (decoded.type === 'service' && decoded.service_id) {
        secret = this.serviceSecrets[decoded.service_id] || this.config.secret;
      }

      // Verify the token
      const verified = jwt.verify(token, secret, {
        issuer: this.config.issuer,
        ...options
      });

      return {
        valid: true,
        payload: verified,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        payload: null,
        error: error.message
      };
    }
  }

  /**
   * Express middleware for JWT authentication
   */
  middleware(options = {}) {
    const { required = true, serviceOnly = false, permissions = [] } = options;

    return async (req, res, next) => {
      const token = this.extractToken(req);

      if (!token) {
        if (required) {
          return res.status(401).json({
            error: {
              code: 'MISSING_TOKEN',
              message: 'Authentication token required'
            }
          });
        }
        return next();
      }

      const result = this.verifyToken(token);

      if (!result.valid) {
        return res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: result.error
          }
        });
      }

      // Check if service-only endpoint
      if (serviceOnly && result.payload.type !== 'service') {
        return res.status(403).json({
          error: {
            code: 'SERVICE_ONLY_ENDPOINT',
            message: 'This endpoint is only accessible to services'
          }
        });
      }

      // Check permissions
      if (permissions.length > 0) {
        const hasPermission = permissions.some(perm => 
          result.payload.permissions?.includes(perm)
        );

        if (!hasPermission) {
          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `Required permissions: ${permissions.join(', ')}`
            }
          });
        }
      }

      // Attach auth info to request
      req.auth = result.payload;
      next();
    };
  }

  /**
   * Extract token from request
   */
  extractToken(req) {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check query parameter (for WebSocket connections)
    if (req.query.token) {
      return req.query.token;
    }

    // Check cookie
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return null;
  }

  /**
   * Generate API key for long-lived service access
   */
  generateApiKey(serviceId, metadata = {}) {
    const key = crypto.randomBytes(32).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(key)
      .digest('hex');

    // In production, store this hash in database
    const apiKeyData = {
      key: `vtc_${serviceId}_${key}`,
      hash,
      serviceId,
      metadata,
      createdAt: new Date().toISOString()
    };

    return apiKeyData;
  }

  /**
   * Verify API key
   */
  verifyApiKey(apiKey) {
    // Extract service ID from key format
    const matches = apiKey.match(/^vtc_([^_]+)_(.+)$/);
    if (!matches) {
      return { valid: false, error: 'Invalid API key format' };
    }

    const [, serviceId, key] = matches;
    const hash = crypto
      .createHash('sha256')
      .update(key)
      .digest('hex');

    // In production, verify against database
    // For now, we'll just validate the format
    return {
      valid: true,
      serviceId,
      hash
    };
  }
}

// Singleton instance
let instance;

function getJWTManager(config) {
  if (!instance) {
    instance = new JWTManager(config);
  }
  return instance;
}

module.exports = {
  JWTManager,
  getJWTManager
};