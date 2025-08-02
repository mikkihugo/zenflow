/**
 * Authentication & Authorization Security Framework
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class AuthSecurity {
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static createJWT(payload, secret, expiresIn = '15m') {
    return jwt.sign(payload, secret, {
      expiresIn,
      algorithm: 'HS256',
      issuer: 'claude-zen',
      audience: 'claude-zen-users',
    });
  }

  static verifyJWT(token, secret) {
    try {
      return jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: 'claude-zen',
        audience: 'claude-zen-users',
      });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const payload = AuthSecurity.verifyJWT(token, process.env.JWT_SECRET);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }
  }

  static requireRole(role) {
    return (req, res, next) => {
      if (!req.user || !req.user.roles?.includes(role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    };
  }
}

export class SessionSecurity {
  static sessions = new Map();

  static createSession(userId, data = {}) {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      userId,
      data,
      createdAt: new Date(),
      lastAccessed: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };

    SessionSecurity.sessions.set(sessionId, session);
    return sessionId;
  }

  static getSession(sessionId) {
    const session = SessionSecurity.sessions.get(sessionId);

    if (!session || session.expiresAt < new Date()) {
      SessionSecurity.sessions.delete(sessionId);
      return null;
    }

    session.lastAccessed = new Date();
    return session;
  }

  static destroySession(sessionId) {
    return SessionSecurity.sessions.delete(sessionId);
  }

  static cleanupExpiredSessions() {
    const now = new Date();
    for (const [id, session] of SessionSecurity.sessions) {
      if (session.expiresAt < now) {
        SessionSecurity.sessions.delete(id);
      }
    }
  }
}
