/**
 * SQLite Connection Pool
 * Manages multiple SQLite connections for improved concurrency
 */

import { createDatabase } from './sqlite-wrapper.js';

export class SQLiteConnectionPool {
  constructor(dbPath, options = {}) {
    this.dbPath = dbPath;
    this.options = {
      minConnections: options.minConnections || 1,
      maxConnections: options.maxConnections || 4,
      idleTimeout: options.idleTimeout || 300000, // 5 minutes
      acquireTimeout: options.acquireTimeout || 5000, // 5 seconds
      ...options
    };

    this.connections = [];
    this.available = [];
    this.waiting = [];
    this.activeConnections = 0;
    this.isShuttingDown = false;
  }

  async initialize() {
    // Create minimum number of connections
    for (let i = 0; i < this.options.minConnections; i++) {
      await this._createConnection();
    }
  }

  async _createConnection() {
    if (this.activeConnections >= this.options.maxConnections) {
      throw new Error('Maximum connection limit reached');
    }

    const db = await createDatabase(this.dbPath);
    
    // Configure each connection for optimal performance
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('temp_store = MEMORY');
    db.pragma('cache_size = -2000'); // 2MB cache per connection
    
    const connection = {
      id: Date.now() + Math.random(),
      db,
      lastUsed: Date.now(),
      inUse: false,
      createdAt: Date.now()
    };

    this.connections.push(connection);
    this.available.push(connection);
    this.activeConnections++;

    return connection;
  }

  async acquire() {
    return new Promise(async (resolve, reject) => {
      if (this.isShuttingDown) {
        reject(new Error('Connection pool is shutting down'));
        return;
      }

      // Check for available connection
      if (this.available.length > 0) {
        const connection = this.available.pop();
        connection.inUse = true;
        connection.lastUsed = Date.now();
        resolve(connection);
        return;
      }

      // Create new connection if under limit
      if (this.activeConnections < this.options.maxConnections) {
        try {
          const connection = await this._createConnection();
          connection.inUse = true;
          this.available.pop(); // Remove from available since we're using it
          resolve(connection);
          return;
        } catch (error) {
          reject(error);
          return;
        }
      }

      // Wait for connection to become available
      const timeout = setTimeout(() => {
        const index = this.waiting.indexOf(waiter);
        if (index > -1) {
          this.waiting.splice(index, 1);
          reject(new Error('Connection acquisition timeout'));
        }
      }, this.options.acquireTimeout);

      const waiter = { resolve, reject, timeout };
      this.waiting.push(waiter);
    });
  }

  release(connection) {
    if (!connection || !connection.inUse) {
      return;
    }

    connection.inUse = false;
    connection.lastUsed = Date.now();

    // If there are waiting requests, fulfill them
    if (this.waiting.length > 0) {
      const waiter = this.waiting.shift();
      clearTimeout(waiter.timeout);
      connection.inUse = true;
      waiter.resolve(connection);
      return;
    }

    // Return to available pool
    this.available.push(connection);
  }

  async execute(query, params = []) {
    const connection = await this.acquire();
    try {
      const stmt = connection.db.prepare(query);
      
      // Determine if this is a SELECT query (returns data) or not (INSERT/UPDATE/DELETE)
      const isSelectQuery = query.trim().toUpperCase().startsWith('SELECT');
      
      if (isSelectQuery) {
        return stmt.all(...params);
      } else {
        return stmt.run(...params);
      }
    } finally {
      this.release(connection);
    }
  }

  async executeTransaction(queries) {
    const connection = await this.acquire();
    try {
      const transaction = connection.db.transaction(() => {
        const results = [];
        for (const { query, params = [] } of queries) {
          const stmt = connection.db.prepare(query);
          results.push(stmt.run(...params));
        }
        return results;
      });
      
      return transaction();
    } finally {
      this.release(connection);
    }
  }

  getStats() {
    const now = Date.now();
    return {
      totalConnections: this.connections.length,
      activeConnections: this.connections.filter(c => c.inUse).length,
      availableConnections: this.available.length,
      waitingRequests: this.waiting.length,
      idleConnections: this.connections.filter(c => !c.inUse && (now - c.lastUsed) > 60000).length,
      oldestConnection: this.connections.length > 0 
        ? Math.min(...this.connections.map(c => now - c.createdAt))
        : 0
    };
  }

  async cleanup() {
    const now = Date.now();
    const connectionsToClose = [];

    // Find idle connections to close
    for (const connection of this.connections) {
      if (!connection.inUse && 
          (now - connection.lastUsed) > this.options.idleTimeout &&
          this.connections.length > this.options.minConnections) {
        connectionsToClose.push(connection);
      }
    }

    // Close idle connections
    for (const connection of connectionsToClose) {
      this._closeConnection(connection);
    }

    return connectionsToClose.length;
  }

  _closeConnection(connection) {
    // Remove from all arrays
    const connIndex = this.connections.indexOf(connection);
    if (connIndex > -1) {
      this.connections.splice(connIndex, 1);
    }

    const availIndex = this.available.indexOf(connection);
    if (availIndex > -1) {
      this.available.splice(availIndex, 1);
    }

    // Close the database connection
    if (connection.db) {
      connection.db.close();
    }

    this.activeConnections--;
  }

  async shutdown() {
    this.isShuttingDown = true;

    // Reject all waiting requests
    for (const waiter of this.waiting) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Connection pool is shutting down'));
    }
    this.waiting.length = 0;

    // Close all connections
    for (const connection of this.connections) {
      this._closeConnection(connection);
    }

    this.connections.length = 0;
    this.available.length = 0;
    this.activeConnections = 0;
  }

  // Helper method to run periodic cleanup
  startCleanupInterval(intervalMs = 60000) {
    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch(error => {
        console.warn('Connection pool cleanup error:', error);
      });
    }, intervalMs);
  }

  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export default SQLiteConnectionPool;