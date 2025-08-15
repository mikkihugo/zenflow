/**
 * @fileoverview Swarm Persistence DAO
 * 
 * Implements proper 3-layer database architecture for swarm persistence:
 * Application Code → SwarmDAO → SQLiteAdapter → Raw Driver
 * 
 * Stores swarms in .claude-zen/swarms/ directory with SQLite database
 * for persistent storage across restarts with consistent SwarmIDs.
 */

import { join, dirname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ILogger } from '../../core/interfaces/base-interfaces';
import { getLogger } from '../../config/logging-config';
import { DatabaseProviderFactory } from '../../database/providers/database-providers';
import type { DatabaseAdapter, QueryResult } from '../../database/providers/database-providers';

/**
 * Swarm state interface for persistence
 * 
 * Represents the complete state of a SwarmCommander and its agents
 * for persistent storage across application restarts. This interface
 * maps directly to the SQLite database schema.
 * 
 * @interface PersistedSwarmState
 * @example
 * ```typescript
 * const swarmState: PersistedSwarmState = {
 *   id: 'swarm-123',
 *   topology: 'hierarchical',
 *   strategy: 'adaptive',
 *   maxAgents: 8,
 *   status: 'active',
 *   created: '2024-01-01T00:00:00.000Z',
 *   lastActive: '2024-01-01T12:00:00.000Z',
 *   configuration: { sparcEnabled: true },
 *   agents: [{ id: 'agent-1', type: 'researcher', ... }],
 *   swarmCommander: { id: 'commander-1', type: 'development' },
 *   performance: { initialization_time_ms: 150, memory_usage_mb: 512 },
 *   features: { cognitive_diversity: true, neural_networks: true }
 * };
 * ```
 */
export interface PersistedSwarmState {
  /** Unique swarm identifier - used as primary key */
  id: string;
  
  /** Swarm topology type: 'mesh', 'hierarchical', 'ring', 'star' */
  topology: string;
  
  /** Coordination strategy: 'adaptive', 'balanced', 'specialized', 'parallel' */
  strategy: string;
  
  /** Maximum number of agents allowed in this swarm */
  maxAgents: number;
  
  /** Current swarm lifecycle status */
  status: 'active' | 'inactive' | 'paused' | 'terminated';
  
  /** ISO timestamp when swarm was created */
  created: string;
  
  /** ISO timestamp of last activity or update */
  lastActive: string;
  
  /** SwarmCommander configuration parameters (JSON stored) */
  configuration: Record<string, unknown>;
  /** Array of spawned agents with their current state */
  agents: Array<{
    /** Unique agent identifier */
    id: string;
    /** Human-readable agent name */
    name: string;
    /** Agent type: 'researcher', 'coder', 'analyst', 'optimizer', 'coordinator', 'tester' */
    type: string;
    /** Current agent status: 'active', 'idle', 'busy', 'error' */
    status: string;
    /** Cognitive pattern for neural coordination */
    cognitive_pattern: string;
    /** Associated neural network identifier */
    neural_network_id: string;
    /** Array of agent capabilities */
    capabilities: string[];
    /** ISO timestamp when agent was spawned */
    spawn_time: string;
  }>;
  /** Optional SwarmCommander instance data */
  swarmCommander?: {
    /** SwarmCommander unique identifier */
    id: string;
    /** Commander type: 'development', 'testing', 'deployment', 'research' */
    type: string;
    /** Commander capabilities with enabled/disabled flags */
    capabilities: Record<string, boolean>;
    /** Current commander state and context */
    state: Record<string, unknown>;
  };
  /** Performance metrics for this swarm */
  performance: {
    /** Time taken to initialize swarm in milliseconds */
    initialization_time_ms: number;
    /** Current memory usage in megabytes */
    memory_usage_mb: number;
  };
  /** Feature flags for swarm capabilities */
  features: {
    /** Whether cognitive diversity is enabled */
    cognitive_diversity: boolean;
    /** Whether neural networks are active */
    neural_networks: boolean;
    /** Whether task duration forecasting is enabled */
    forecasting: boolean;
    /** Whether SIMD optimizations are supported */
    simd_support: boolean;
  };
}

/**
 * SwarmDAO - Data Access Object for Swarm Persistence
 * 
 * Implements enterprise-grade swarm persistence following the 3-layer database architecture
 * documented in src/database/CLAUDE.md. Provides type-safe, transactional storage for
 * SwarmCommander instances and their complete state.
 * 
 * **Architecture Layers:**
 * 1. **Application Code** - MCP swarm server uses this DAO
 * 2. **DAO Layer** - This class with embedded query DSL and entity mapping
 * 3. **Database Adapter** - SQLiteAdapter for connection management
 * 4. **Raw Driver** - better-sqlite3 for SQLite operations
 * 
 * **Key Features:**
 * - Type-safe parameterized queries prevent SQL injection
 * - Automatic entity mapping between TypeScript objects and database rows
 * - Embedded Query DSL for complex operations
 * - Transactional operations with proper error handling
 * - Repository-scoped storage in .claude-zen/swarms/
 * - Comprehensive logging and debugging support
 * 
 * **Usage Example:**
 * ```typescript
 * const dao = new SwarmPersistenceDAO();
 * await dao.initialize();
 * 
 * // Store a swarm
 * await dao.storeSwarm(swarmState);
 * 
 * // Retrieve active swarms
 * const activeSwarms = await dao.getActiveSwarms();
 * 
 * // Update status
 * await dao.updateSwarmStatus('swarm-123', 'paused');
 * 
 * // Get statistics
 * const stats = await dao.getSwarmStats();
 * 
 * await dao.close();
 * ```
 * 
 * @class SwarmPersistenceDAO
 * @since 2.0.0
 * @see {@link src/database/CLAUDE.md} Database Architecture Documentation
 * @see {@link PersistedSwarmState} Interface for swarm state structure
 */
export class SwarmPersistenceDAO {
  /** Database adapter for SQLite operations */
  private adapter: DatabaseAdapter;
  
  /** Logger instance for debugging and monitoring */
  private logger: ILogger;
  
  /** Full path to .claude-zen/swarms directory */
  private swarmDirectory: string;
  
  /** Full path to SQLite database file */
  private dbPath: string;
  
  /** Whether DAO has been initialized and is ready for operations */
  private initialized = false;

  /**
   * Initialize SwarmPersistenceDAO
   * 
   * Sets up directory structure and prepares for database initialization.
   * Note: Database connection is established during initialize() call.
   * 
   * @constructor
   * @throws {Error} If swarm directory cannot be created
   */
  constructor() {
    this.logger = getLogger('SwarmPersistenceDAO');
    
    // Find the repository root and set up .claude-zen/swarms directory
    const repoRoot = this.findRepositoryRoot();
    this.swarmDirectory = join(repoRoot, '.claude-zen', 'swarms');
    this.dbPath = join(this.swarmDirectory, 'swarms.db');
    
    this.ensureSwarmDirectory();
    // Note: setupDatabaseAdapter is now called in initialize()
  }

  /**
   * Find the repository root directory
   * 
   * Traverses upward from current file location looking for package.json or .git
   * to determine the repository root. This ensures swarm storage is always
   * within the repository's .claude-zen/ directory.
   * 
   * @private
   * @returns {string} Absolute path to repository root
   * @throws {Error} If repository root cannot be determined
   */
  private findRepositoryRoot(): string {
    // Try to find the repository root by looking for package.json or .git
    let currentDir = dirname(fileURLToPath(import.meta.url));
    
    while (currentDir !== dirname(currentDir)) {
      if (existsSync(join(currentDir, 'package.json')) || 
          existsSync(join(currentDir, '.git'))) {
        return currentDir;
      }
      currentDir = dirname(currentDir);
    }
    
    // Fallback to current working directory if we can't find the repo root
    return process.cwd();
  }

  /**
   * Ensure .claude-zen/swarms directory exists
   * 
   * Creates the swarm storage directory if it doesn't exist.
   * Uses recursive creation to handle nested directory structure.
   * 
   * @private
   * @throws {Error} If directory creation fails
   */
  private ensureSwarmDirectory(): void {
    try {
      if (!existsSync(this.swarmDirectory)) {
        mkdirSync(this.swarmDirectory, { recursive: true });
        this.logger.info(`Created swarm directory: ${this.swarmDirectory}`);
      }
    } catch (error) {
      this.logger.error('Failed to create swarm directory:', error);
      throw new Error(`Could not create swarm directory: ${this.swarmDirectory}`);
    }
  }

  /**
   * Setup database adapter using proper factory pattern
   * 
   * Creates SQLite adapter through DatabaseProviderFactory following
   * the documented 3-layer architecture. Configures SQLite for optimal
   * swarm persistence with appropriate timeout and safety settings.
   * 
   * @private
   * @async
   * @throws {Error} If adapter creation or configuration fails
   */
  private async setupDatabaseAdapter(): Promise<void> {
    try {
      const factory = new DatabaseProviderFactory(this.logger, {} as any);
      
      // Configure SQLite for swarm persistence
      const dbConfig = {
        type: 'sqlite' as const,
        database: this.dbPath,
        options: {
          readonly: false,
          fileMustExist: false,
          timeout: 5000,
          verbose: false
        }
      };

      this.adapter = await factory.createAdapter(dbConfig);
      this.logger.info(`SwarmDAO configured with SQLite: ${this.dbPath}`);
    } catch (error) {
      this.logger.error('Failed to setup database adapter:', error);
      throw error;
    }
  }

  /**
   * Initialize database connection and schema
   * 
   * Performs complete DAO initialization:
   * 1. Sets up database adapter through factory
   * 2. Establishes SQLite connection
   * 3. Creates database schema with indexes
   * 4. Marks DAO as ready for operations
   * 
   * This method is idempotent - safe to call multiple times.
   * 
   * @async
   * @throws {Error} If initialization fails at any stage
   * @example
   * ```typescript
   * const dao = new SwarmPersistenceDAO();
   * await dao.initialize();
   * // DAO is now ready for operations
   * ```
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Setup database adapter first
      await this.setupDatabaseAdapter();
      
      // Connect to database
      await this.adapter.connect();
      
      // Create schema
      await this.createSchema();
      
      this.initialized = true;
      
      this.logger.info('SwarmPersistenceDAO initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SwarmPersistenceDAO:', error);
      throw error;
    }
  }

  /**
   * Create database schema for swarm persistence
   * 
   * Creates the swarms table and associated indexes for optimal query performance.
   * Executes statements individually as required by better-sqlite3.
   * 
   * **Schema Design:**
   * - Primary key on swarm ID for fast lookups
   * - Indexes on status, created, last_active, topology for filtering
   * - JSON columns for complex nested data (configuration, agents, etc.)
   * 
   * @private
   * @async
   * @throws {Error} If schema creation fails
   */
  private async createSchema(): Promise<void> {
    // Execute statements one by one as required by better-sqlite3
    const statements = [
      `CREATE TABLE IF NOT EXISTS swarms (
        id TEXT PRIMARY KEY,
        topology TEXT NOT NULL,
        strategy TEXT NOT NULL,
        max_agents INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created TEXT NOT NULL,
        last_active TEXT NOT NULL,
        configuration TEXT NOT NULL,
        agents TEXT NOT NULL,
        swarm_commander TEXT,
        performance TEXT NOT NULL,
        features TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_swarms_status ON swarms(status)`,
      `CREATE INDEX IF NOT EXISTS idx_swarms_created ON swarms(created)`,
      `CREATE INDEX IF NOT EXISTS idx_swarms_last_active ON swarms(last_active)`,
      `CREATE INDEX IF NOT EXISTS idx_swarms_topology ON swarms(topology)`
    ];

    for (const statement of statements) {
      await this.adapter.execute(statement, []);
    }
    
    this.logger.debug('Swarm database schema created/verified');
  }

  /**
   * Store swarm state using embedded DSL pattern
   * 
   * Persists complete swarm state to database using type-safe parameterized queries.
   * Uses INSERT OR REPLACE for upsert behavior - creates new or updates existing.
   * Complex objects are JSON-serialized for storage.
   * 
   * @async
   * @param {PersistedSwarmState} swarmState - Complete swarm state to persist
   * @throws {Error} If storage operation fails
   * @example
   * ```typescript
   * await dao.storeSwarm({
   *   id: 'swarm-123',
   *   topology: 'hierarchical',
   *   status: 'active',
   *   // ... other properties
   * });
   * ```
   */
  async storeSwarm(swarmState: PersistedSwarmState): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      // Embedded DSL: Type-safe parameter binding
      const insertSQL = `
        INSERT OR REPLACE INTO swarms (
          id, topology, strategy, max_agents, status, created, last_active,
          configuration, agents, swarm_commander, performance, features
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        swarmState.id,
        swarmState.topology,
        swarmState.strategy,
        swarmState.maxAgents,
        swarmState.status,
        swarmState.created,
        swarmState.lastActive,
        JSON.stringify(swarmState.configuration),
        JSON.stringify(swarmState.agents),
        swarmState.swarmCommander ? JSON.stringify(swarmState.swarmCommander) : null,
        JSON.stringify(swarmState.performance),
        JSON.stringify(swarmState.features)
      ];

      await this.adapter.execute(insertSQL, params);
      
      this.logger.info(`Swarm persisted: ${swarmState.id} (${swarmState.topology})`);
    } catch (error) {
      this.logger.error(`Failed to store swarm ${swarmState.id}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve swarm by ID using type-safe queries
   * 
   * Fetches complete swarm state by unique identifier. Performs automatic
   * entity mapping from database row to TypeScript interface.
   * 
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @returns {Promise<PersistedSwarmState | null>} Swarm state or null if not found
   * @throws {Error} If query execution fails
   * @example
   * ```typescript
   * const swarm = await dao.getSwarm('swarm-123');
   * if (swarm) {
   *   console.log(`Found swarm: ${swarm.topology}`);
   * }
   * ```
   */
  async getSwarm(swarmId: string): Promise<PersistedSwarmState | null> {
    if (!this.initialized) await this.initialize();

    try {
      const selectSQL = `
        SELECT * FROM swarms WHERE id = ? LIMIT 1
      `;

      const result = await this.adapter.query(selectSQL, [swarmId]);
      
      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      return this.mapDatabaseRowToSwarmState(result.rows[0]);
    } catch (error) {
      this.logger.error(`Failed to retrieve swarm ${swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active swarms
   * 
   * Retrieves all swarms with 'active' status, ordered by most recently active first.
   * Useful for restoring swarms after application restart.
   * 
   * @async
   * @returns {Promise<PersistedSwarmState[]>} Array of active swarms
   * @throws {Error} If query execution fails
   * @example
   * ```typescript
   * const activeSwarms = await dao.getActiveSwarms();
   * console.log(`Found ${activeSwarms.length} active swarms`);
   * ```
   */
  async getActiveSwarms(): Promise<PersistedSwarmState[]> {
    if (!this.initialized) await this.initialize();

    try {
      const selectSQL = `
        SELECT * FROM swarms 
        WHERE status = 'active' 
        ORDER BY last_active DESC
      `;

      const result = await this.adapter.query(selectSQL, []);
      
      if (!result.rows) return [];

      return result.rows.map(row => this.mapDatabaseRowToSwarmState(row));
    } catch (error) {
      this.logger.error('Failed to retrieve active swarms:', error);
      throw error;
    }
  }

  /**
   * Update swarm status
   * 
   * Changes swarm lifecycle status and updates last active timestamp.
   * Used for swarm lifecycle management and shutdown coordination.
   * 
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @param {'active' | 'inactive' | 'paused' | 'terminated'} status - New status
   * @throws {Error} If update operation fails
   * @example
   * ```typescript
   * await dao.updateSwarmStatus('swarm-123', 'paused');
   * ```
   */
  async updateSwarmStatus(swarmId: string, status: 'active' | 'inactive' | 'paused' | 'terminated'): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      const updateSQL = `
        UPDATE swarms 
        SET status = ?, last_active = ? 
        WHERE id = ?
      `;

      const params = [status, new Date().toISOString(), swarmId];
      await this.adapter.execute(updateSQL, params);
      
      this.logger.debug(`Updated swarm ${swarmId} status to ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update swarm ${swarmId} status:`, error);
      throw error;
    }
  }

  /**
   * Update swarm last active timestamp
   * 
   * Updates the last_active field to current timestamp. Used for tracking
   * swarm activity and identifying inactive swarms for cleanup.
   * Does not throw on failure to avoid disrupting normal operations.
   * 
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @example
   * ```typescript
   * await dao.updateLastActive('swarm-123');
   * ```
   */
  async updateLastActive(swarmId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      const updateSQL = `
        UPDATE swarms 
        SET last_active = ? 
        WHERE id = ?
      `;

      const params = [new Date().toISOString(), swarmId];
      await this.adapter.execute(updateSQL, params);
    } catch (error) {
      this.logger.error(`Failed to update swarm ${swarmId} last active:`, error);
      // Don't throw for timestamp updates
    }
  }

  /**
   * Delete swarm from persistence
   * 
   * Permanently removes swarm from database. Use with caution as this
   * operation cannot be undone.
   * 
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @returns {Promise<boolean>} True if swarm was deleted, false if not found
   * @throws {Error} If delete operation fails
   * @example
   * ```typescript
   * const deleted = await dao.deleteSwarm('swarm-123');
   * if (deleted) {
   *   console.log('Swarm successfully deleted');
   * }
   * ```
   */
  async deleteSwarm(swarmId: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    try {
      const deleteSQL = `DELETE FROM swarms WHERE id = ?`;
      const result = await this.adapter.execute(deleteSQL, [swarmId]);
      
      const deleted = (result.affectedRows || 0) > 0;
      if (deleted) {
        this.logger.info(`Swarm deleted: ${swarmId}`);
      }
      
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete swarm ${swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Get swarm statistics
   * 
   * Provides comprehensive statistics about stored swarms including counts
   * by status and activity timestamps. Useful for monitoring and analytics.
   * 
   * @async
   * @returns {Promise<Object>} Statistics object with counts and timestamps
   * @returns {number} returns.total - Total number of swarms
   * @returns {number} returns.active - Number of active swarms
   * @returns {number} returns.inactive - Number of inactive swarms
   * @returns {number} returns.paused - Number of paused swarms
   * @returns {number} returns.terminated - Number of terminated swarms
   * @returns {string|null} returns.oldestActive - ISO timestamp of oldest active swarm
   * @returns {string|null} returns.newestActive - ISO timestamp of newest active swarm
   * @throws {Error} If statistics query fails
   * @example
   * ```typescript
   * const stats = await dao.getSwarmStats();
   * console.log(`Total: ${stats.total}, Active: ${stats.active}`);
   * ```
   */
  async getSwarmStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    paused: number;
    terminated: number;
    oldestActive: string | null;
    newestActive: string | null;
  }> {
    if (!this.initialized) await this.initialize();

    try {
      const statsSQL = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused,
          SUM(CASE WHEN status = 'terminated' THEN 1 ELSE 0 END) as terminated,
          MIN(CASE WHEN status = 'active' THEN created ELSE NULL END) as oldest_active,
          MAX(CASE WHEN status = 'active' THEN created ELSE NULL END) as newest_active
        FROM swarms
      `;

      const result = await this.adapter.query(statsSQL, []);
      const row = result.rows?.[0];

      return {
        total: row?.total || 0,
        active: row?.active || 0,
        inactive: row?.inactive || 0,
        paused: row?.paused || 0,
        terminated: row?.terminated || 0,
        oldestActive: row?.oldest_active || null,
        newestActive: row?.newest_active || null
      };
    } catch (error) {
      this.logger.error('Failed to get swarm statistics:', error);
      throw error;
    }
  }

  /**
   * Entity mapping: Database row → SwarmState
   * 
   * Converts raw database row to typed TypeScript interface.
   * Handles JSON deserialization and property name mapping from
   * snake_case (database) to camelCase (TypeScript).
   * 
   * @private
   * @param {any} row - Raw database row from SQLite query
   * @returns {PersistedSwarmState} Mapped swarm state object
   * @throws {Error} If JSON parsing fails for nested objects
   */
  private mapDatabaseRowToSwarmState(row: any): PersistedSwarmState {
    return {
      id: row.id,
      topology: row.topology,
      strategy: row.strategy,
      maxAgents: row.max_agents,
      status: row.status,
      created: row.created,
      lastActive: row.last_active,
      configuration: JSON.parse(row.configuration || '{}'),
      agents: JSON.parse(row.agents || '[]'),
      swarmCommander: row.swarm_commander ? JSON.parse(row.swarm_commander) : undefined,
      performance: JSON.parse(row.performance || '{}'),
      features: JSON.parse(row.features || '{}')
    };
  }

  /**
   * Get database path for debugging
   * 
   * Returns the full path to the SQLite database file.
   * Useful for debugging and external database inspection.
   * 
   * @returns {string} Absolute path to SQLite database file
   * @example
   * ```typescript
   * console.log(`Database: ${dao.getDatabasePath()}`);
   * ```
   */
  getDatabasePath(): string {
    return this.dbPath;
  }

  /**
   * Get swarm directory path
   * 
   * Returns the full path to the .claude-zen/swarms directory.
   * Useful for debugging and understanding storage location.
   * 
   * @returns {string} Absolute path to swarm storage directory
   * @example
   * ```typescript
   * console.log(`Swarms stored in: ${dao.getSwarmDirectory()}`);
   * ```
   */
  getSwarmDirectory(): string {
    return this.swarmDirectory;
  }

  /**
   * Clean up old inactive swarms (older than specified days)
   * 
   * Removes inactive and terminated swarms that haven't been active for
   * the specified number of days. Helps prevent database bloat and
   * improves query performance.
   * 
   * @async
   * @param {number} [olderThanDays=30] - Number of days to keep inactive swarms
   * @returns {Promise<number>} Number of swarms deleted
   * @throws {Error} If cleanup operation fails
   * @example
   * ```typescript
   * // Clean up swarms inactive for more than 7 days
   * const deleted = await dao.cleanupOldSwarms(7);
   * console.log(`Cleaned up ${deleted} old swarms`);
   * ```
   */
  async cleanupOldSwarms(olderThanDays: number = 30): Promise<number> {
    if (!this.initialized) await this.initialize();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      const cutoffISO = cutoffDate.toISOString();

      const deleteSQL = `
        DELETE FROM swarms 
        WHERE status IN ('inactive', 'terminated') 
        AND last_active < ?
      `;

      const result = await this.adapter.execute(deleteSQL, [cutoffISO]);
      const deletedCount = result.affectedRows || 0;
      
      if (deletedCount > 0) {
        this.logger.info(`Cleaned up ${deletedCount} old swarms (older than ${olderThanDays} days)`);
      }
      
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup old swarms:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   * 
   * Gracefully closes the database connection and marks DAO as uninitialized.
   * Should be called during application shutdown to ensure proper cleanup.
   * 
   * @async
   * @example
   * ```typescript
   * // During application shutdown
   * await dao.close();
   * ```
   */
  async close(): Promise<void> {
    if (this.initialized && this.adapter) {
      await this.adapter.disconnect();
      this.initialized = false;
      this.logger.info('SwarmPersistenceDAO closed');
    }
  }
}