/**
 * Database Connection Manager
 * 
 * Centralizes database connection management for all claude-code-zen services.
 * Ensures single database instance with proper initialization and health monitoring.
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync } from 'fs';
import { DatabaseInitializer } from '../migrations/init-database.js';

export interface ConnectionConfig {
  databasePath?: string;
  autoInitialize?: boolean;
  enableWAL?: boolean;
  enableForeignKeys?: boolean;
  busyTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private db: Database.Database | null = null;
  private config: Required<ConnectionConfig>;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor(config: ConnectionConfig = {}) {
    this.config = {
      databasePath: config.databasePath || join(process.cwd(), 'data', 'claude-zen.db'),
      autoInitialize: config.autoInitialize ?? true,
      enableWAL: config.enableWAL ?? true,
      enableForeignKeys: config.enableForeignKeys ?? true,
      busyTimeout: config.busyTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: ConnectionConfig): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager(config);
    }
    return DatabaseConnectionManager.instance;
  }

  /**
   * Initialize database connection with retries
   */
  async initialize(): Promise<Database.Database> {
    if (this.db && this.isInitialized) {
      return this.db;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`📡 Connecting to database (attempt ${attempt}/${this.config.maxRetries}): ${this.config.databasePath}`);
        
        // Check if database exists, initialize if needed
        if (!existsSync(this.config.databasePath) && this.config.autoInitialize) {
          console.log('🔧 Database not found, initializing...');
          const initializer = new DatabaseInitializer({
            databasePath: this.config.databasePath,
            enableWAL: this.config.enableWAL,
            enableForeignKeys: this.config.enableForeignKeys,
            busyTimeout: this.config.busyTimeout
          });
          
          await initializer.initializeSchemas();
          await initializer.seedInitialData();
          initializer.close();
        }

        // Create connection
        this.db = new Database(this.config.databasePath);
        
        // Configure database
        this.setupDatabase();
        
        // Test connection
        await this.testConnection();
        
        this.isInitialized = true;
        console.log('✅ Database connection established successfully');
        
        // Start health monitoring
        this.startHealthMonitoring();
        
        return this.db;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Database connection attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw new Error(`Failed to connect to database after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Setup database with optimal configuration
   */
  private setupDatabase(): void {
    if (!this.db) throw new Error('Database not connected');

    // Enable WAL mode for better concurrency
    if (this.config.enableWAL) {
      this.db.pragma('journal_mode = WAL');
    }

    // Enable foreign keys
    if (this.config.enableForeignKeys) {
      this.db.pragma('foreign_keys = ON');
    }

    // Set busy timeout
    this.db.pragma(`busy_timeout = ${this.config.busyTimeout}`);

    // Optimize performance
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000'); // 64MB cache
    this.db.pragma('temp_store = MEMORY');
    this.db.pragma('mmap_size = 134217728'); // 128MB mmap
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    try {
      // Test basic query
      const result = this.db.prepare('SELECT 1 as test').get() as { test: number };
      if (result.test !== 1) {
        throw new Error('Database test query failed');
      }

      // Test table access
      this.db.prepare('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"').get();
      
    } catch (error) {
      throw new Error(`Database connection test failed: ${error}`);
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('🚨 Database health check failed:', error);
      });
    }, 60000); // Check every minute
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<{ healthy: boolean; details: any }> {
    if (!this.db) {
      return { healthy: false, details: { error: 'Database not connected' } };
    }

    try {
      const start = Date.now();
      
      // Test basic operations
      this.db.prepare('SELECT 1').get();
      
      const responseTime = Date.now() - start;
      
      // Get database stats
      const stats = this.db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM sqlite_master WHERE type='table') as table_count,
          (SELECT COUNT(*) FROM projects) as project_count,
          (SELECT COUNT(*) FROM documents) as document_count
      `).get();

      return {
        healthy: true,
        details: {
          responseTime,
          stats,
          walMode: this.db.pragma('journal_mode'),
          foreignKeys: this.db.pragma('foreign_keys'),
          cacheSize: this.db.pragma('cache_size')
        }
      };
      
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get database connection
   */
  getConnection(): Database.Database {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Execute in transaction
   */
  transaction<T>(fn: (db: Database.Database) => T): T {
    const db = this.getConnection();
    return db.transaction(fn)();
  }

  /**
   * Execute prepared statement with error handling
   */
  execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } {
    const db = this.getConnection();
    try {
      const stmt = db.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      console.error('Database execute error:', { sql, params, error });
      throw error;
    }
  }

  /**
   * Query database with error handling
   */
  query(sql: string, params: any[] = []): any[] {
    const db = this.getConnection();
    try {
      const stmt = db.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      console.error('Database query error:', { sql, params, error });
      throw error;
    }
  }

  /**
   * Get single result
   */
  queryOne(sql: string, params: any[] = []): any | null {
    const db = this.getConnection();
    try {
      const stmt = db.prepare(sql);
      return stmt.get(...params) || null;
    } catch (error) {
      console.error('Database queryOne error:', { sql, params, error });
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  getStatistics() {
    const db = this.getConnection();
    
    const tableCount = db.prepare(`
      SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'
    `).get() as { count: number };

    const projectCount = db.prepare(`
      SELECT COUNT(*) as count FROM projects
    `).get() as { count: number };

    const documentCount = db.prepare(`
      SELECT COUNT(*) as count FROM documents
    `).get() as { count: number };

    const documentsByType = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM documents 
      GROUP BY type
    `).all() as { type: string; count: number }[];

    return {
      totalTables: tableCount.count,
      totalProjects: projectCount.count,
      totalDocuments: documentCount.count,
      documentsByType: documentsByType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>),
      path: this.config.databasePath,
      initialized: this.isInitialized
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('📡 Database connection closed');
    }
  }

  /**
   * Reset singleton instance (for testing)
   */
  static reset(): void {
    if (DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance.close();
      DatabaseConnectionManager.instance = null as any;
    }
  }
}

// Export convenience functions
export const getDatabase = async (): Promise<Database.Database> => {
  const manager = DatabaseConnectionManager.getInstance();
  return await manager.initialize();
};

export const getDatabaseManager = (): DatabaseConnectionManager => {
  return DatabaseConnectionManager.getInstance();
};

export default DatabaseConnectionManager;