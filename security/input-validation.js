/**
 * Comprehensive Input Validation Framework
 * Production-ready input sanitization and validation
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export class InputValidator {
  static sanitizeHtml(input) {
    if (typeof input !== 'string') return '';
    return purify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  static validateEmail(email) {
    return validator.isEmail(email) && email.length <= 254;
  }

  static validateURL(url) {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true,
      require_valid_protocol: true,
    });
  }

  static sanitizeSQL(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[';\x00\x1a]/g, '');
  }

  static validateLength(input, min = 0, max = 1000) {
    if (typeof input !== 'string') return false;
    return input.length >= min && input.length <= max;
  }

  static sanitizeFilePath(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 255);
  }

  static validateJSON(input) {
    try {
      const parsed = JSON.parse(input);
      return { valid: true, data: parsed };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  static detectXSS(input) {
    const xssPatterns = [
      /<script[^>]*>.*?</script>/gi,
      /javascript:/gi,
      /onw+s*=/gi,
      /<iframe[^>]*>.*?</iframe>/gi,
      /data:text/html/gi
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }

  static detectSQLInjection(input) {
    const sqlPatterns = [
      /('|(')|(;)|(;))|(s)(union|select|insert|update|delete|drop|create|alter|exec|execute)(s)/gi,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
      /--/gi,
      //*/gi
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  static rateLimit = new Map();

  static checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / windowMs)}`;

    const current = InputValidator.rateLimit.get(key) || 0;
    if (current >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    InputValidator.rateLimit.set(key, current + 1);
    return { allowed: true, remaining: maxRequests - current - 1 };
  }
}

export class SecurityMiddleware {
  static validateInput(req, res, next) {
    // Validate all input fields
    const sanitizedBody = {};

    for (const [key, value] of Object.entries(req.body || {})) {
      if (typeof value === 'string') {
        if (InputValidator.detectXSS(value)) {
          return res.status(400).json({ error: 'XSS attempt detected' });
        }

        if (InputValidator.detectSQLInjection(value)) {
          return res.status(400).json({ error: 'SQL injection attempt detected' });
        }

        sanitizedBody[key] = InputValidator.sanitizeHtml(value);
      } else {
        sanitizedBody[key] = value;
      }
    }

    req.sanitizedBody = sanitizedBody;
    next();
  }

  static rateLimit(maxRequests = 100, windowMs = 60000) {
    return (req, res, next) => {
      const identifier = req.ip;
      const result = InputValidator.checkRateLimit(identifier, maxRequests, windowMs);

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      res.set('X-RateLimit-Remaining', result.remaining);
      next();
    };
  }
}
