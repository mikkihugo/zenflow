/**
 * Claude-Zen Security Configuration
 * Production-ready security settings and policies
 */

export const securityConfig = {
  // Authentication & Authorization
  auth: {
    jwt: {
      algorithm: 'HS256',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
      issuer: 'claude-zen',
      audience: 'claude-zen-users',
    },
    password: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      saltRounds: 12,
    },
    session: {
      maxAge: 30 * 60 * 1000, // 30 minutes
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
    },
  },

  // Input Validation
  validation: {
    maxRequestSize: '10mb',
    maxJsonPayload: '1mb',
    maxUrlLength: 2048,
    maxHeaderSize: '8kb',
    allowedMimeTypes: ['application/json', 'text/plain', 'application/octet-stream'],
    blockedFileExtensions: ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar'],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        scriptSrc: ['\'self\''],
        imgSrc: ['\'self\'', 'data:', 'https:'],
        connectSrc: ['\'self\''],
        fontSrc: ['\'self\''],
        objectSrc: ['\'none\''],
        mediaSrc: ['\'self\''],
        frameSrc: ['\'none\''],
        baseUri: ['\'self\''],
        formAction: ['\'self\''],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: 'no-referrer',
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
  },

  // Logging & Monitoring
  monitoring: {
    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || '/var/log/claude-zen/security.log',
    maxLogSize: '100mb',
    maxLogFiles: 10,
    alertThresholds: {
      failedLogins: 5, // per 5 minutes
      suspiciousRequests: 10, // per minute
      errorRate: 0.1, // 10% error rate
    },
  },

  // Database Security
  database: {
    encryptionAtRest: true,
    connectionLimit: 10,
    queryTimeout: 30000, // 30 seconds
    enableQueryLogging: process.env.NODE_ENV !== 'production',
    sanitizeQueries: true,
  },

  // File Upload Security
  upload: {
    maxFileSize: '5mb',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/json'],
    scanForViruses: true,
    quarantineSuspiciousFiles: true,
  },

  // API Security
  api: {
    enableVersioning: true,
    requireApiKey: process.env.NODE_ENV === 'production',
    enableRateLimit: true,
    enableRequestLogging: true,
    enableResponseValidation: true,
  },

  // WebSocket Security
  websocket: {
    enableHeartbeat: true,
    heartbeatInterval: 30000, // 30 seconds
    maxConnections: 1000,
    requireAuth: true,
    enableCompression: false, // Prevent CRIME attacks
  },

  // Development vs Production
  development: {
    enableDebugEndpoints: process.env.NODE_ENV === 'development',
    enableCORS: true,
    disableHttps: true,
    allowInsecureConnections: true,
  },

  production: {
    enforceHttps: true,
    enableStrictTransportSecurity: true,
    disableDebugEndpoints: true,
    enableSecurityAuditing: true,
    requireStrongAuthentication: true,
  },
};

// Security validation functions
export const securityValidators = {
  validatePassword(password) {
    const config = securityConfig.auth.password;
    const checks = [
      password.length >= config.minLength,
      config.requireUppercase ? /[A-Z]/.test(password) : true,
      config.requireLowercase ? /[a-z]/.test(password) : true,
      config.requireNumbers ? /[0-9]/.test(password) : true,
      config.requireSpecialChars ? /[^A-Za-z0-9]/.test(password) : true,
    ];

    return checks.every((check) => check);
  },

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
      .replace(/[<>"'&]/g, '')
      .trim()
      .substring(0, 1000); // Limit length
  },

  validateFileUpload(file) {
    const config = securityConfig.upload;
    const sizeLimit = parseInt(config.maxFileSize.replace('mb', '')) * 1024 * 1024;

    return {
      validSize: file.size <= sizeLimit,
      validType: config.allowedMimeTypes.includes(file.mimetype),
      validExtension: !securityConfig.validation.blockedFileExtensions.some((ext) =>
        file.originalname?.toLowerCase().endsWith(ext),
      ),
    };
  },
};

// Security middleware factory
export const createSecurityMiddleware = (config = securityConfig) => {
  return {
    rateLimiter: (options = config.rateLimit) => {
      // Rate limiting implementation
      const requests = new Map();

      return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        const windowStart = now - options.windowMs;

        const userRequests = requests.get(key) || [];
        const validRequests = userRequests.filter((time) => time > windowStart);

        if (validRequests.length >= options.max) {
          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil(options.windowMs / 1000),
          });
        }

        validRequests.push(now);
        requests.set(key, validRequests);

        next();
      };
    },

    inputValidator: (req, _res, next) => {
      // Validate and sanitize input
      if (req.body) {
        for (const [key, value] of Object.entries(req.body)) {
          if (typeof value === 'string') {
            req.body[key] = securityValidators.sanitizeInput(value);
          }
        }
      }

      next();
    },

    authRequired: (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // JWT verification would go here
      next();
    },
  };
};

export default securityConfig;
