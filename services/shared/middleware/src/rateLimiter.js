/**
 * Rate Limiting Middleware for Vision-to-Code Services
 * Implements flexible rate limiting with Redis backend
 */

const Redis = require('ioredis');
const crypto = require('crypto');

class RateLimiter {
  constructor(config = {}) {
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 1,
        keyPrefix: 'rate_limit:',
        ...config.redis
      },
      defaults: {
        windowMs: 60 * 1000, // 1 minute
        max: 100, // max requests per window
        message: 'Too many requests, please try again later.',
        statusCode: 429,
        headers: true,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        ...config.defaults
      },
      ...config
    };

    // Initialize Redis client
    this.redis = new Redis(this.config.redis);
    
    // Service-specific limits
    this.serviceLimits = {
      'business-service': { max: 100, windowMs: 60000 },
      'core-service': { max: 1000, windowMs: 60000 },
      'swarm-service': { max: 500, windowMs: 60000 },
      'development-service': { max: 200, windowMs: 60000 }
    };

    // Endpoint-specific limits
    this.endpointLimits = {
      'POST /api/v1/visions': { max: 10, windowMs: 60000 },
      'POST /api/v1/coordination/vision': { max: 20, windowMs: 60000 },
      'POST /api/v1/mrap/reason': { max: 5, windowMs: 60000 },
      'POST /api/v1/vision-to-code/execute': { max: 5, windowMs: 60000 }
    };
  }

  /**
   * Generate a unique key for rate limiting
   */
  generateKey(req, keyGenerator) {
    if (typeof keyGenerator === 'function') {
      return keyGenerator(req);
    }

    // Default key generation based on IP and service
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const service = req.auth?.service_id || 'anonymous';
    const endpoint = `${req.method} ${req.route?.path || req.path}`;

    return `${ip}:${service}:${endpoint}`;
  }

  /**
   * Get rate limit configuration for request
   */
  getLimitConfig(req) {
    // Check endpoint-specific limits first
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    if (this.endpointLimits[endpoint]) {
      return { ...this.config.defaults, ...this.endpointLimits[endpoint] };
    }

    // Check service-specific limits
    const serviceId = req.auth?.service_id;
    if (serviceId && this.serviceLimits[serviceId]) {
      return { ...this.config.defaults, ...this.serviceLimits[serviceId] };
    }

    // Return default limits
    return this.config.defaults;
  }

  /**
   * Express middleware factory
   */
  middleware(options = {}) {
    const config = { ...this.config.defaults, ...options };

    return async (req, res, next) => {
      try {
        // Get rate limit configuration
        const limitConfig = this.getLimitConfig(req);
        const key = this.config.redis.keyPrefix + this.generateKey(req, config.keyGenerator);

        // Get current count
        const current = await this.redis.get(key);
        const count = current ? parseInt(current, 10) : 0;

        // Check if limit exceeded
        if (count >= limitConfig.max) {
          // Set rate limit headers
          if (limitConfig.headers) {
            res.setHeader('X-RateLimit-Limit', limitConfig.max);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + limitConfig.windowMs).toISOString());
            res.setHeader('Retry-After', Math.ceil(limitConfig.windowMs / 1000));
          }

          // Send rate limit response
          return res.status(limitConfig.statusCode).json({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: limitConfig.message,
              details: {
                limit: limitConfig.max,
                windowMs: limitConfig.windowMs,
                retryAfter: Math.ceil(limitConfig.windowMs / 1000)
              }
            }
          });
        }

        // Increment counter
        const pipeline = this.redis.pipeline();
        pipeline.incr(key);
        pipeline.expire(key, Math.ceil(limitConfig.windowMs / 1000));
        await pipeline.exec();

        // Set rate limit headers
        if (limitConfig.headers) {
          res.setHeader('X-RateLimit-Limit', limitConfig.max);
          res.setHeader('X-RateLimit-Remaining', Math.max(0, limitConfig.max - count - 1));
          res.setHeader('X-RateLimit-Reset', new Date(Date.now() + limitConfig.windowMs).toISOString());
        }

        // Track response status for conditional limiting
        if (limitConfig.skipSuccessfulRequests || limitConfig.skipFailedRequests) {
          const originalSend = res.send;
          res.send = function(data) {
            const shouldSkip = 
              (limitConfig.skipSuccessfulRequests && res.statusCode < 400) ||
              (limitConfig.skipFailedRequests && res.statusCode >= 400);

            if (shouldSkip) {
              // Decrement the counter
              redis.decr(key).catch(err => {
                console.error('Failed to decrement rate limit counter:', err);
              });
            }

            return originalSend.call(this, data);
          };
        }

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Fail open - don't block requests if rate limiting fails
        next();
      }
    };
  }

  /**
   * Create a distributed rate limiter using sliding window
   */
  slidingWindowMiddleware(options = {}) {
    const config = { ...this.config.defaults, ...options };

    return async (req, res, next) => {
      try {
        const limitConfig = this.getLimitConfig(req);
        const key = this.config.redis.keyPrefix + this.generateKey(req, config.keyGenerator);
        const now = Date.now();
        const windowStart = now - limitConfig.windowMs;

        // Remove old entries and count current window
        const pipeline = this.redis.pipeline();
        pipeline.zremrangebyscore(key, '-inf', windowStart);
        pipeline.zcard(key);
        pipeline.zadd(key, now, `${now}-${crypto.randomBytes(4).toString('hex')}`);
        pipeline.expire(key, Math.ceil(limitConfig.windowMs / 1000));
        
        const results = await pipeline.exec();
        const count = results[1][1];

        if (count > limitConfig.max) {
          // Remove the just-added entry
          await this.redis.zrem(key, `${now}-${crypto.randomBytes(4).toString('hex')}`);

          if (limitConfig.headers) {
            res.setHeader('X-RateLimit-Limit', limitConfig.max);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', new Date(now + limitConfig.windowMs).toISOString());
          }

          return res.status(limitConfig.statusCode).json({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: limitConfig.message
            }
          });
        }

        if (limitConfig.headers) {
          res.setHeader('X-RateLimit-Limit', limitConfig.max);
          res.setHeader('X-RateLimit-Remaining', Math.max(0, limitConfig.max - count));
          res.setHeader('X-RateLimit-Reset', new Date(now + limitConfig.windowMs).toISOString());
        }

        next();
      } catch (error) {
        console.error('Sliding window rate limiting error:', error);
        next();
      }
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(req, keyGenerator) {
    const key = this.config.redis.keyPrefix + this.generateKey(req, keyGenerator);
    await this.redis.del(key);
  }

  /**
   * Get current rate limit status
   */
  async getStatus(req, keyGenerator) {
    const limitConfig = this.getLimitConfig(req);
    const key = this.config.redis.keyPrefix + this.generateKey(req, keyGenerator);
    const count = await this.redis.get(key);
    const ttl = await this.redis.ttl(key);

    return {
      limit: limitConfig.max,
      remaining: Math.max(0, limitConfig.max - (count || 0)),
      reset: ttl > 0 ? new Date(Date.now() + ttl * 1000) : null,
      count: parseInt(count || 0, 10)
    };
  }

  /**
   * Clean up Redis connection
   */
  async close() {
    await this.redis.quit();
  }
}

// Factory function for creating rate limiters
function createRateLimiter(config) {
  return new RateLimiter(config);
}

// Preset configurations
const presets = {
  strict: {
    defaults: {
      windowMs: 60 * 1000,
      max: 10
    }
  },
  moderate: {
    defaults: {
      windowMs: 60 * 1000,
      max: 100
    }
  },
  relaxed: {
    defaults: {
      windowMs: 60 * 1000,
      max: 1000
    }
  }
};

module.exports = {
  RateLimiter,
  createRateLimiter,
  presets
};