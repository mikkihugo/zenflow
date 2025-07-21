#!/usr/bin/env node
/**
 * Security Service
 * Authentication, authorization, and security monitoring
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export class SecurityService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'security-service';
    this.version = '1.0.0';
    this.port = options.port || 4005;
    this.sessions = new Map();
    this.apiKeys = new Map();
    this.securityEvents = [];
    this.maxEvents = options.maxEvents || 1000;
    this.status = 'stopped';
    
    // Default security policies
    this.policies = {
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxFailedAttempts: 5,
      rateLimitWindow: 60 * 1000, // 1 minute
      rateLimitMax: 100
    };
  }

  async start() {
    console.log(`🚀 Starting Security Service on port ${this.port}`);
    
    // Initialize default API key for system
    this.generateApiKey('system', ['admin', 'read', 'write']);
    
    this.status = 'running';
    this.emit('started', { service: this.name, port: this.port });
    console.log(`✅ Security Service running with ${this.apiKeys.size} API keys`);
    
    return this;
  }

  async stop() {
    this.sessions.clear();
    this.status = 'stopped';
    this.emit('stopped', { service: this.name });
    console.log(`🛑 Security Service stopped`);
  }

  generateApiKey(userId, permissions = []) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const keyInfo = {
      id: crypto.randomUUID(),
      key: apiKey,
      userId,
      permissions,
      created: new Date().toISOString(),
      lastUsed: null,
      usage: 0
    };
    
    this.apiKeys.set(apiKey, keyInfo);
    this.logSecurityEvent('api_key_generated', { userId, permissions });
    
    return {
      success: true,
      apiKey,
      keyId: keyInfo.id,
      permissions,
      created: keyInfo.created
    };
  }

  validateApiKey(apiKey) {
    const keyInfo = this.apiKeys.get(apiKey);
    if (!keyInfo) {
      this.logSecurityEvent('invalid_api_key', { apiKey: apiKey.substring(0, 8) + '...' });
      return { valid: false, error: 'Invalid API key' };
    }

    // Update usage
    keyInfo.lastUsed = new Date().toISOString();
    keyInfo.usage++;
    
    this.logSecurityEvent('api_key_used', { userId: keyInfo.userId, usage: keyInfo.usage });
    
    return {
      valid: true,
      userId: keyInfo.userId,
      permissions: keyInfo.permissions,
      keyId: keyInfo.id
    };
  }

  createSession(userId, metadata = {}) {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      userId,
      created: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      metadata,
      active: true
    };
    
    this.sessions.set(sessionId, session);
    this.logSecurityEvent('session_created', { userId, sessionId });
    
    // Auto-expire sessions
    setTimeout(() => {
      this.expireSession(sessionId);
    }, this.policies.sessionTimeout);
    
    return {
      success: true,
      sessionId,
      expiresAt: new Date(Date.now() + this.policies.sessionTimeout).toISOString()
    };
  }

  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.active) {
      this.logSecurityEvent('invalid_session', { sessionId });
      return { valid: false, error: 'Invalid or expired session' };
    }

    // Check timeout
    const age = Date.now() - new Date(session.created).getTime();
    if (age > this.policies.sessionTimeout) {
      this.expireSession(sessionId);
      return { valid: false, error: 'Session expired' };
    }

    // Update activity
    session.lastActivity = new Date().toISOString();
    
    return {
      valid: true,
      userId: session.userId,
      sessionId: session.id,
      created: session.created,
      lastActivity: session.lastActivity
    };
  }

  expireSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.active = false;
      this.logSecurityEvent('session_expired', { userId: session.userId, sessionId });
    }
  }

  authorize(userId, resource, action) {
    // Simple permission check - can be extended
    const allowedActions = {
      'admin': ['read', 'write', 'delete', 'admin'],
      'user': ['read', 'write'],
      'readonly': ['read']
    };
    
    // Mock user role lookup - would typically come from database
    const userRole = userId === 'system' ? 'admin' : 'user';
    const permissions = allowedActions[userRole] || [];
    
    const authorized = permissions.includes(action);
    
    this.logSecurityEvent('authorization_check', { 
      userId, 
      resource, 
      action, 
      authorized 
    });
    
    return {
      authorized,
      userId,
      resource,
      action,
      role: userRole
    };
  }

  logSecurityEvent(type, data) {
    const event = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: new Date().toISOString(),
      severity: this.getEventSeverity(type)
    };
    
    this.securityEvents.push(event);
    
    // Limit event storage
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents.shift();
    }
    
    this.emit('security-event', event);
    
    // Log high-severity events
    if (event.severity === 'high') {
      console.warn(`🚨 Security Alert: ${type}`, data);
    }
  }

  getEventSeverity(type) {
    const highSeverity = ['invalid_api_key', 'invalid_session', 'unauthorized_access'];
    const mediumSeverity = ['session_expired', 'rate_limit_exceeded'];
    
    if (highSeverity.includes(type)) return 'high';
    if (mediumSeverity.includes(type)) return 'medium';
    return 'low';
  }

  getSecurityMetrics() {
    return {
      activeSessions: Array.from(this.sessions.values()).filter(s => s.active).length,
      totalSessions: this.sessions.size,
      activeApiKeys: this.apiKeys.size,
      securityEvents: this.securityEvents.length,
      recentEvents: this.securityEvents.slice(-10),
      eventsByType: this.securityEvents.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  getStatus() {
    return {
      service: this.name,
      version: this.version,
      status: this.status,
      port: this.port,
      security: this.getSecurityMetrics(),
      endpoints: [
        'POST /auth/api-key',
        'POST /auth/session',
        'GET /auth/validate',
        'POST /auth/authorize',
        'GET /security/events',
        'GET /security/metrics'
      ]
    };
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new SecurityService();
  await service.start();
  
  process.on('SIGINT', async () => {
    await service.stop();
    process.exit(0);
  });
}