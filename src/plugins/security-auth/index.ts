/**
 * Security Auth Plugin
 * Handles authentication and authorization
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class SecurityAuthPlugin extends BasePlugin {
  private sessions = new Map();
  private users = new Map();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Security Auth Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Security Auth Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Security Auth Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.sessions.clear();
    this.users.clear();
    this.context.logger.info('Security Auth Plugin cleaned up');
  }

  async authenticate(username: string, password: string): Promise<any> {
    // Mock authentication
    const user = this.users.get(username);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const sessionId = Math.random().toString(36).substr(2, 9);
    const session = {
      id: sessionId,
      userId: user.id,
      username,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.sessions.set(sessionId, session);
    this.context.logger.info(`User authenticated: ${username}`);
    
    return { sessionId, user: { id: user.id, username } };
  }

  async validateSession(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      throw new Error('Session expired');
    }

    return session;
  }

  async logout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.context.logger.info(`User logged out: ${session.username}`);
    }
  }

  async createUser(username: string, password: string, role: string = 'user'): Promise<any> {
    if (this.users.has(username)) {
      throw new Error('User already exists');
    }

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password, // In real implementation, would hash this
      role,
      createdAt: new Date()
    };

    this.users.set(username, user);
    this.context.logger.info(`User created: ${username}`);
    return { id: user.id, username, role };
  }

  hasPermission(sessionId: string, permission: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const user = this.users.get(session.username);
    if (!user) return false;

    // Simple role-based permissions
    if (user.role === 'admin') return true;
    if (user.role === 'user' && ['read', 'write'].includes(permission)) return true;
    
    return false;
  }
}

export default SecurityAuthPlugin;