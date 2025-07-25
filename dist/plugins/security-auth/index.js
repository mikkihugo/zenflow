/**
 * Security & Authentication Plugin
 * JWT authentication, basic security scanning, and access control
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class SecurityAuthPlugin {
  constructor(config = {}) {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
      jwtExpiry: '24h',
      bcryptRounds: 12,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      securityRulesFile: path.join(process.cwd(), '.hive-mind', 'security-rules.json'),
      ...config
    };
    
    this.sessions = new Map();
    this.loginAttempts = new Map();
    this.securityRules = null;
    this.authenticators = new Map();
  }

  async initialize() {
    console.log('🔐 Security & Auth Plugin initialized');
    
    // Load security rules
    await this.loadSecurityRules();
    
    // Initialize authenticators
    await this.initializeAuthenticators();
    
    // Setup session cleanup
    this.setupSessionCleanup();
  }

  async loadSecurityRules() {
    try {
      const content = await readFile(this.config.securityRulesFile, 'utf8');
      this.securityRules = JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Create default security rules
        this.securityRules = {
          authentication: {
            enabled: true,
            methods: ['jwt'],
            requireMfa: false,
            sessionTimeout: 24 * 60 * 60 * 1000
          },
          authorization: {
            enabled: true,
            defaultRole: 'user',
            roles: {
              admin: {
                permissions: ['*'],
                description: 'Full system access'
              },
              user: {
                permissions: [
                  'swarm.create',
                  'swarm.read',
                  'agent.spawn',
                  'task.execute',
                  'export.generate'
                ],
                description: 'Standard user access'
              },
              readonly: {
                permissions: [
                  'swarm.read',
                  'task.read',
                  'export.generate'
                ],
                description: 'Read-only access'
              }
            }
          },
          security: {
            scanning: {
              enabled: true,
              scanOnUpload: true,
              quarantine: true
            },
            rateLimit: {
              enabled: true,
              windowMs: 15 * 60 * 1000, // 15 minutes
              max: 100 // requests per window
            },
            cors: {
              enabled: true,
              origins: ['http://localhost:3000'],
              credentials: true
            }
          },
          audit: {
            enabled: true,
            logActions: ['login', 'logout', 'permission_denied', 'security_violation'],
            retentionDays: 90
          }
        };
        await this.saveSecurityRules();
      } else {
        throw error;
      }
    }
  }

  async saveSecurityRules() {
    await writeFile(this.config.securityRulesFile, JSON.stringify(this.securityRules, null, 2));
  }

  async initializeAuthenticators() {
    // JWT Authenticator
    this.authenticators.set('jwt', {
      type: 'jwt',
      async generateToken(payload) {
        try {
          const jwt = await import('jsonwebtoken');
          return jwt.default.sign(payload, this.config.jwtSecret, { 
            expiresIn: this.config.jwtExpiry 
          });
        } catch (error) {
          throw new Error('JWT library not available. Install with: npm install jsonwebtoken');
        }
      },

      async verifyToken(token) {
        try {
          const jwt = await import('jsonwebtoken');
          return jwt.default.verify(token, this.config.jwtSecret);
        } catch (error) {
          throw new Error('Invalid or expired token');
        }
      }
    });

    // API Key Authenticator
    this.authenticators.set('apikey', {
      type: 'apikey',
      keys: new Map(), // Store API keys (in production, use database)

      async generateKey(userId, permissions = []) {
        const key = crypto.randomBytes(32).toString('hex');
        this.keys.set(key, {
          userId,
          permissions,
          created: Date.now(),
          lastUsed: null
        });
        return key;
      },

      async verifyKey(key) {
        const keyData = this.keys.get(key);
        if (!keyData) {
          throw new Error('Invalid API key');
        }
        
        keyData.lastUsed = Date.now();
        return {
          userId: keyData.userId,
          permissions: keyData.permissions
        };
      }
    });

    console.log(`🔑 Initialized ${this.authenticators.size} authentication methods`);
  }

  // Authentication Methods
  async login(credentials, method = 'jwt') {
    const { username, password, apiKey } = credentials;
    
    // Check for too many login attempts
    if (this.isAccountLocked(username)) {
      throw new Error('Account temporarily locked due to too many failed attempts');
    }

    try {
      let user = null;
      
      if (method === 'jwt') {
        // Verify username/password (in production, check against database)
        user = await this.verifyCredentials(username, password);
      } else if (method === 'apikey') {
        // Verify API key
        const authenticator = this.authenticators.get('apikey');
        const keyData = await authenticator.verifyKey(apiKey);
        user = { id: keyData.userId, permissions: keyData.permissions };
      }

      if (!user) {
        this.recordFailedAttempt(username);
        throw new Error('Invalid credentials');
      }

      // Clear failed attempts on successful login
      this.loginAttempts.delete(username);

      // Generate session
      const session = await this.createSession(user, method);
      
      // Audit log
      await this.auditLog('login', {
        userId: user.id,
        username: username,
        method: method,
        timestamp: new Date().toISOString()
      });

      return session;
    } catch (error) {
      this.recordFailedAttempt(username);
      throw error;
    }
  }

  async verifyCredentials(username, password) {
    // In production, this would check against a database with hashed passwords
    // For now, support a simple admin user
    if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
      return {
        id: 'admin',
        username: 'admin',
        role: 'admin',
        permissions: ['*']
      };
    }
    
    return null;
  }

  async createSession(user, method = 'jwt') {
    const sessionId = crypto.randomUUID();
    const authenticator = this.authenticators.get(method);
    
    let token = null;
    if (method === 'jwt') {
      token = await authenticator.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        sessionId: sessionId
      });
    }

    const session = {
      id: sessionId,
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      method: method,
      token: token,
      created: Date.now(),
      lastActivity: Date.now(),
      expires: Date.now() + this.config.sessionTimeout
    };

    this.sessions.set(sessionId, session);
    
    return {
      sessionId: sessionId,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      },
      expires: new Date(session.expires).toISOString()
    };
  }

  async authenticate(token) {
    try {
      if (!token) {
        throw new Error('No authentication token provided');
      }

      // Try JWT authentication first
      const jwtAuth = this.authenticators.get('jwt');
      const decoded = await jwtAuth.verifyToken(token);
      
      // Find session
      const session = this.sessions.get(decoded.sessionId);
      if (!session || session.expires < Date.now()) {
        throw new Error('Session expired');
      }

      // Update last activity
      session.lastActivity = Date.now();
      
      return {
        userId: session.userId,
        username: session.username,
        role: session.role,
        permissions: session.permissions,
        sessionId: session.id
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async logout(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      
      // Audit log
      await this.auditLog('logout', {
        userId: session.userId,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      });
      
      return true;
    }
    return false;
  }

  // Authorization Methods
  async authorize(user, action, resource = null) {
    if (!this.securityRules.authorization.enabled) {
      return true; // Authorization disabled
    }

    const userRole = this.securityRules.authorization.roles[user.role];
    if (!userRole) {
      await this.auditLog('permission_denied', {
        userId: user.userId,
        action: action,
        resource: resource,
        reason: 'Invalid role',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Check permissions
    const permissions = userRole.permissions;
    
    // Admin wildcard
    if (permissions.includes('*')) {
      return true;
    }

    // Exact permission match
    if (permissions.includes(action)) {
      return true;
    }

    // Wildcard permission match (e.g., 'swarm.*' matches 'swarm.create')
    const hasWildcardPermission = permissions.some(permission => {
      if (permission.endsWith('.*')) {
        const prefix = permission.slice(0, -2);
        return action.startsWith(prefix + '.');
      }
      return false;
    });

    if (hasWildcardPermission) {
      return true;
    }

    // Permission denied
    await this.auditLog('permission_denied', {
      userId: user.userId,
      action: action,
      resource: resource,
      role: user.role,
      timestamp: new Date().toISOString()
    });

    return false;
  }

  // Security Scanning
  async scanContent(content, type = 'text') {
    if (!this.securityRules.security.scanning.enabled) {
      return { safe: true, issues: [] };
    }

    const issues = [];

    // Basic security patterns
    const securityPatterns = [
      {
        pattern: /password\s*[:=]\s*["'][^"']*["']/gi,
        severity: 'high',
        description: 'Potential password exposure'
      },
      {
        pattern: /api[_-]?key\s*[:=]\s*["'][^"']*["']/gi,
        severity: 'high',
        description: 'Potential API key exposure'
      },
      {
        pattern: /secret\s*[:=]\s*["'][^"']*["']/gi,
        severity: 'medium',
        description: 'Potential secret exposure'
      },
      {
        pattern: /<script[^>]*>[\s\S]*<\/script>/gi,
        severity: 'high',
        description: 'Script injection attempt'
      },
      {
        pattern: /javascript:\s*[^"'\s]+/gi,
        severity: 'medium',
        description: 'JavaScript protocol usage'
      },
      {
        pattern: /eval\s*\(/gi,
        severity: 'high',
        description: 'Use of eval() function'
      },
      {
        pattern: /exec\s*\(/gi,
        severity: 'medium',
        description: 'Command execution detected'
      }
    ];

    for (const rule of securityPatterns) {
      const matches = content.match(rule.pattern);
      if (matches) {
        issues.push({
          type: 'pattern_match',
          severity: rule.severity,
          description: rule.description,
          matches: matches.length,
          pattern: rule.pattern.source
        });
      }
    }

    // File type specific checks
    if (type === 'javascript' || type === 'js') {
      // Additional JavaScript-specific checks
      const jsPatterns = [
        /innerHTML\s*=/gi,
        /document\.write\s*\(/gi,
        /window\.location\s*=/gi
      ];

      for (const pattern of jsPatterns) {
        if (pattern.test(content)) {
          issues.push({
            type: 'js_security',
            severity: 'medium',
            description: 'Potentially unsafe JavaScript pattern',
            pattern: pattern.source
          });
        }
      }
    }

    const safe = issues.filter(issue => issue.severity === 'high').length === 0;

    if (!safe && this.securityRules.security.scanning.quarantine) {
      await this.auditLog('security_violation', {
        type: 'content_scan',
        issues: issues,
        contentType: type,
        timestamp: new Date().toISOString()
      });
    }

    return {
      safe,
      issues,
      scanned: true,
      timestamp: new Date().toISOString()
    };
  }

  // Rate Limiting
  checkRateLimit(identifier) {
    if (!this.securityRules.security.rateLimit.enabled) {
      return { allowed: true };
    }

    const now = Date.now();
    const windowMs = this.securityRules.security.rateLimit.windowMs;
    const max = this.securityRules.security.rateLimit.max;

    if (!this.rateLimitWindows) {
      this.rateLimitWindows = new Map();
    }

    const window = this.rateLimitWindows.get(identifier) || { count: 0, resetTime: now + windowMs };

    // Reset window if expired
    if (now > window.resetTime) {
      window.count = 0;
      window.resetTime = now + windowMs;
    }

    window.count++;
    this.rateLimitWindows.set(identifier, window);

    const allowed = window.count <= max;
    
    return {
      allowed,
      remaining: Math.max(0, max - window.count),
      resetTime: window.resetTime,
      total: max
    };
  }

  // Account lockout helpers
  recordFailedAttempt(username) {
    const attempts = this.loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(username, attempts);
  }

  isAccountLocked(username) {
    const attempts = this.loginAttempts.get(username);
    if (!attempts) return false;
    
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    
    if (attempts.count >= this.config.maxLoginAttempts) {
      if (timeSinceLastAttempt < this.config.lockoutDuration) {
        return true;
      } else {
        // Lockout period expired, reset attempts
        this.loginAttempts.delete(username);
        return false;
      }
    }
    
    return false;
  }

  // Session management
  setupSessionCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions) {
        if (session.expires < now) {
          this.sessions.delete(sessionId);
        }
      }
    }, 60000); // Clean up expired sessions every minute
  }

  // Audit logging
  async auditLog(action, details) {
    if (!this.securityRules.audit.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    // In production, this would write to a secure audit log
    console.log(`🔍 AUDIT: ${action}`, logEntry);
    
    // Store audit logs (implement proper storage in production)
    if (!this.auditLogs) this.auditLogs = [];
    this.auditLogs.push(logEntry);
    
    // Keep only recent logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
  }

  // Management methods
  async createUser(userData) {
    // In production, this would create a user in the database
    const user = {
      id: crypto.randomUUID(),
      username: userData.username,
      role: userData.role || this.securityRules.authorization.defaultRole,
      created: Date.now(),
      ...userData
    };

    await this.auditLog('user_created', {
      userId: user.id,
      username: user.username,
      role: user.role,
      timestamp: new Date().toISOString()
    });

    return user;
  }

  async generateApiKey(userId, permissions = []) {
    const apiKeyAuth = this.authenticators.get('apikey');
    const key = await apiKeyAuth.generateKey(userId, permissions);
    
    await this.auditLog('api_key_generated', {
      userId,
      permissions,
      timestamp: new Date().toISOString()
    });

    return key;
  }

  async revokeApiKey(key) {
    const apiKeyAuth = this.authenticators.get('apikey');
    const removed = apiKeyAuth.keys.delete(key);
    
    if (removed) {
      await this.auditLog('api_key_revoked', {
        timestamp: new Date().toISOString()
      });
    }

    return removed;
  }

  async getSecurityStatus() {
    return {
      authentication: {
        enabled: this.securityRules.authentication.enabled,
        methods: Array.from(this.authenticators.keys()),
        activeSessions: this.sessions.size
      },
      authorization: {
        enabled: this.securityRules.authorization.enabled,
        roles: Object.keys(this.securityRules.authorization.roles)
      },
      security: {
        scanning: this.securityRules.security.scanning.enabled,
        rateLimit: this.securityRules.security.rateLimit.enabled,
        cors: this.securityRules.security.cors.enabled
      },
      audit: {
        enabled: this.securityRules.audit.enabled,
        recentLogs: this.auditLogs ? this.auditLogs.length : 0
      }
    };
  }

  async getAuditLogs(limit = 100) {
    if (!this.auditLogs) return [];
    return this.auditLogs.slice(-limit);
  }

  async cleanup() {
    // Clear sessions and audit logs
    this.sessions.clear();
    this.loginAttempts.clear();
    if (this.rateLimitWindows) this.rateLimitWindows.clear();
    
    console.log('🔐 Security & Auth Plugin cleaned up');
  }
}

export default SecurityAuthPlugin;