// enhanced-memory.js - Enhanced memory management system for cross-session persistence
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Enhanced Memory Management System
 * Provides persistent storage for session data and cross-session memory
 */
export class EnhancedMemory {
  constructor(options = {}) {
    this.directory = options.directory || './.memory';
    this.namespace = options.namespace || 'default';
    this.memoryFile = path.join(this.directory, `${this.namespace}-memory.json`);
    this.initialized = false;
    this.data = {};
  }

  /**
   * Initialize the memory system
   */
  async initialize() {
    try {
      // Ensure memory directory exists
      if (!existsSync(this.directory)) {
        mkdirSync(this.directory, { recursive: true });
      }

      // Load existing memory data
      await this.loadMemoryData();
      this.initialized = true;
    } catch (error) {
      console.warn(`Enhanced memory initialization failed: ${error.message}`);
      this.data = {};
      this.initialized = true;
    }
  }

  /**
   * Load memory data from file
   */
  async loadMemoryData() {
    try {
      if (existsSync(this.memoryFile)) {
        const content = await fs.readFile(this.memoryFile, 'utf8');
        this.data = JSON.parse(content);
      } else {
        this.data = {};
      }
    } catch (error) {
      console.warn(`Failed to load memory data: ${error.message}`);
      this.data = {};
    }
  }

  /**
   * Save memory data to file
   */
  async saveMemoryData() {
    try {
      await fs.writeFile(this.memoryFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.warn(`Failed to save memory data: ${error.message}`);
    }
  }

  /**
   * Store session state data
   */
  async saveSessionState(sessionId, state) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (!this.data.sessions) {
        this.data.sessions = {};
      }

      this.data.sessions[sessionId] = {
        ...state,
        saved: new Date().toISOString(),
        sessionId: sessionId
      };

      await this.saveMemoryData();
      return true;
    } catch (error) {
      console.warn(`Failed to save session state: ${error.message}`);
      return false;
    }
  }

  /**
   * Get list of active sessions
   */
  async getActiveSessions() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const sessions = this.data.sessions || {};
      return Object.values(sessions).filter(session => 
        session.state === 'active' || session.state === 'pending'
      );
    } catch (error) {
      console.warn(`Failed to get active sessions: ${error.message}`);
      return [];
    }
  }

  /**
   * Resume a session by ID
   */
  async resumeSession(sessionId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const sessions = this.data.sessions || {};
      const session = sessions[sessionId];
      
      if (session) {
        // Update session state to active
        session.state = 'active';
        session.resumed = new Date().toISOString();
        await this.saveMemoryData();
        return session;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to resume session: ${error.message}`);
      return null;
    }
  }

  /**
   * Store arbitrary data in memory
   */
  async store(key, value, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const namespace = options.namespace || 'general';
      
      if (!this.data[namespace]) {
        this.data[namespace] = {};
      }

      this.data[namespace][key] = {
        value: value,
        metadata: options.metadata || {},
        stored: new Date().toISOString()
      };

      await this.saveMemoryData();
      return true;
    } catch (error) {
      console.warn(`Failed to store data: ${error.message}`);
      return false;
    }
  }

  /**
   * Retrieve data from memory
   */
  async retrieve(key, namespace = 'general') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const data = this.data[namespace];
      if (data && data[key]) {
        return data[key].value;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to retrieve data: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear data from memory
   */
  async clear(options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (options.pattern) {
        // Clear data matching pattern
        const pattern = options.pattern.replace(/\*/g, '.*');
        const regex = new RegExp(pattern);

        for (const namespace in this.data) {
          if (typeof this.data[namespace] === 'object') {
            for (const key in this.data[namespace]) {
              if (regex.test(`${namespace}:${key}`) || regex.test(key)) {
                delete this.data[namespace][key];
              }
            }
          }
        }
      } else {
        // Clear all data
        this.data = {};
      }

      await this.saveMemoryData();
      return true;
    } catch (error) {
      console.warn(`Failed to clear memory: ${error.message}`);
      return false;
    }
  }

  /**
   * List all stored keys
   */
  async list(namespace = null) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (namespace) {
        const data = this.data[namespace];
        return data ? Object.keys(data) : [];
      } else {
        const allKeys = [];
        for (const ns in this.data) {
          if (typeof this.data[ns] === 'object') {
            for (const key in this.data[ns]) {
              allKeys.push(`${ns}:${key}`);
            }
          }
        }
        return allKeys;
      }
    } catch (error) {
      console.warn(`Failed to list memory keys: ${error.message}`);
      return [];
    }
  }

  /**
   * Get memory statistics
   */
  async getStats() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const stats = {
        totalNamespaces: Object.keys(this.data).length,
        totalKeys: 0,
        sessions: 0,
        memorySize: JSON.stringify(this.data).length
      };

      for (const namespace in this.data) {
        if (typeof this.data[namespace] === 'object') {
          stats.totalKeys += Object.keys(this.data[namespace]).length;
          if (namespace === 'sessions') {
            stats.sessions = Object.keys(this.data[namespace]).length;
          }
        }
      }

      return stats;
    } catch (error) {
      console.warn(`Failed to get memory stats: ${error.message}`);
      return { error: error.message };
    }
  }
}

// Default export for easier importing
export default EnhancedMemory;