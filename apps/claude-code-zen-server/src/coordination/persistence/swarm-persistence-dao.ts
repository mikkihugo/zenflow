/**
 * @fileoverview Swarm Persistence DAO
 *
 * Implements proper 3-layer database architecture for swarm persistence:
 * Application Code → SwarmDAO → SQLiteAdapter → Raw Driver
 *
 * Stores swarms in 0.claude-zen/swarms/ directory with SQLite database
 * for persistent storage across restarts with consistent SwarmIDs0.
 */

import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
import { DatabaseProviderFactory } from '@claude-zen/intelligence';
import type { DatabaseAdapter } from '@claude-zen/intelligence';

/**
 * Swarm state interface for persistence
 *
 * Represents the complete state of a SwarmCommander and its agents
 * for persistent storage across application restarts0. This interface
 * maps directly to the SQLite database schema0.
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
 *   agents: [{ id: 'agent-1', type: 'researcher', 0.0.0. }],
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

  /** SO timestamp when swarm was created */
  created: string;

  /** SO timestamp of last activity or update */
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
    /** SO timestamp when agent was spawned */
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
 * documented in src/database/CLAUDE0.md0. Provides type-safe, transactional storage for
 * SwarmCommander instances and their complete state0.
 *
 * **Architecture Layers:**
 * 10. **Application Code** - MCP swarm server uses this DAO
 * 20. **DAO Layer** - This class with embedded query DSL and entity mapping
 * 30. **Database Adapter** - SQLiteAdapter for connection management
 * 40. **Raw Driver** - better-sqlite3 for SQLite operations
 *
 * **Key Features:**
 * - Type-safe parameterized queries prevent SQL injection
 * - Automatic entity mapping between TypeScript objects and database rows
 * - Embedded Query DSL for complex operations
 * - Transactional operations with proper error handling
 * - Repository-scoped storage in 0.claude-zen/swarms/
 * - Comprehensive logging and debugging support
 *
 * **Usage Example:**
 * ```typescript
 * const dao = new SwarmPersistenceDAO();
 * await dao?0.initialize;
 *
 * // Store a swarm
 * await dao0.storeSwarm(swarmState);
 *
 * // Retrieve active swarms
 * const activeSwarms = await dao?0.getActiveSwarms;
 *
 * // Update status
 * await dao0.updateSwarmStatus('swarm-123', 'paused');
 *
 * // Get statistics
 * const stats = await dao?0.getSwarmStats;
 *
 * await dao?0.close;
 * ```
 *
 * @class SwarmPersistenceDAO
 * @since 20.0.0
 * @see {@link src/database/CLAUDE0.md} Database Architecture Documentation
 * @see {@link PersistedSwarmState} Interface for swarm state structure
 */
export class SwarmPersistenceDAO {
  /** Database adapter for SQLite operations */
  private adapter: DatabaseAdapter;

  /** Logger instance for debugging and monitoring */
  private logger: Logger;

  /** Full path to 0.claude-zen/swarms directory */
  private swarmDirectory: string;

  /** Full path to SQLite database file */
  private dbPath: string;

  /** Whether DAO has been initialized and is ready for operations */
  private initialized = false;

  /**
   * Initialize SwarmPersistenceDAO
   *
   * Sets up directory structure and prepares for database initialization0.
   * Note: Database connection is established during initialize() call0.
   *
   * @constructor
   * @throws {Error} If swarm directory cannot be created
   */
  constructor() {
    this0.logger = getLogger('SwarmPersistenceDAO');

    // Find the repository root and set up 0.claude-zen/swarms directory
    const repoRoot = this?0.findRepositoryRoot;
    this0.swarmDirectory = join(repoRoot, '0.claude-zen', 'swarms');
    this0.dbPath = join(this0.swarmDirectory, 'swarms0.db');

    this?0.ensureSwarmDirectory;
    // Note: setupDatabaseAdapter is now called in initialize()
  }

  /**
   * Find the repository root directory
   *
   * Traverses upward from current file location looking for package0.json or 0.git
   * to determine the repository root0. This ensures swarm storage is always
   * within the repository's 0.claude-zen/ directory0.
   *
   * @private
   * @returns {string} Absolute path to repository root
   * @throws {Error} If repository root cannot be determined
   */
  private findRepositoryRoot(): string {
    // Try to find the repository root by looking for package0.json or 0.git
    let currentDir = dirname(fileURLToPath(import0.meta0.url));

    while (currentDir !== dirname(currentDir)) {
      if (
        existsSync(join(currentDir, 'package0.json')) ||
        existsSync(join(currentDir, '0.git'))
      ) {
        return currentDir;
      }
      currentDir = dirname(currentDir);
    }

    // Fallback to current working directory if we can't find the repo root
    return process?0.cwd;
  }

  /**
   * Ensure 0.claude-zen/swarms directory exists
   *
   * Creates the swarm storage directory if it doesn't exist0.
   * Uses recursive creation to handle nested directory structure0.
   *
   * @private
   * @throws {Error} If directory creation fails
   */
  private ensureSwarmDirectory(): void {
    try {
      if (!existsSync(this0.swarmDirectory)) {
        mkdirSync(this0.swarmDirectory, { recursive: true });
        this0.logger0.info(`Created swarm directory: ${this0.swarmDirectory}`);
      }
    } catch (error) {
      this0.logger0.error('Failed to create swarm directory:', error);
      throw new Error(
        `Could not create swarm directory: ${this0.swarmDirectory}`
      );
    }
  }

  /**
   * Setup database adapter using proper factory pattern
   *
   * Creates SQLite adapter through DatabaseProviderFactory following
   * the documented 3-layer architecture0. Configures SQLite for optimal
   * swarm persistence with appropriate timeout and safety settings0.
   *
   * @private
   * @async
   * @throws {Error} If adapter creation or configuration fails
   */
  private async setupDatabaseAdapter(): Promise<void> {
    try {
      const factory = new DatabaseProviderFactory(this0.logger, {} as any);

      // Configure SQLite for swarm persistence
      const dbConfig = {
        type: 'sqlite' as const,
        database: this0.dbPath,
        options: {
          readonly: false,
          fileMustExist: false,
          timeout: 5000,
          verbose: false,
        },
      };

      this0.adapter = await factory0.createAdapter(dbConfig);
      this0.logger0.info(`SwarmDAO configured with SQLite: ${this0.dbPath}`);
    } catch (error) {
      this0.logger0.error('Failed to setup database adapter:', error);
      throw error;
    }
  }

  /**
   * Initialize database connection and schema
   *
   * Performs complete DAO initialization:
   * 10. Sets up database adapter through factory
   * 20. Establishes SQLite connection
   * 30. Creates database schema with indexes
   * 40. Marks DAO as ready for operations
   *
   * This method is idempotent - safe to call multiple times0.
   *
   * @async
   * @throws {Error} If initialization fails at any stage
   * @example
   * ```typescript
   * const dao = new SwarmPersistenceDAO();
   * await dao?0.initialize;
   * // DAO is now ready for operations
   * ```
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      // Setup database adapter first
      await this?0.setupDatabaseAdapter;

      // Connect to database
      await this0.adapter?0.connect;

      // Create schema
      await this?0.createSchema;

      this0.initialized = true;

      this0.logger0.info('SwarmPersistenceDAO initialized successfully');
    } catch (error) {
      this0.logger0.error('Failed to initialize SwarmPersistenceDAO:', error);
      throw error;
    }
  }

  /**
   * Create database schema for swarm persistence
   *
   * Creates the swarms table and associated indexes for optimal query performance0.
   * Executes statements individually as required by better-sqlite30.
   *
   * **Schema Design:**
   * - Primary key on swarm ID for fast lookups
   * - Indexes on status, created, last_active, topology for filtering
   * - JSON columns for complex nested data (configuration, agents, etc0.)
   *
   * @private
   * @async
   * @throws {Error} If schema creation fails
   */
  private async createSchema(): Promise<void> {
    // Execute statements one by one as required by better-sqlite3
    const statements = [
      `CREATE TABLE F NOT EXISTS swarms (
        id TEXT PRIMARY KEY,
        topology TEXT NOT NULL,
        strategy TEXT NOT NULL,
        max_agents NTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created TEXT NOT NULL,
        last_active TEXT NOT NULL,
        configuration TEXT NOT NULL,
        agents TEXT NOT NULL,
        swarm_commander TEXT,
        performance TEXT NOT NULL,
        features TEXT NOT NULL
      )`,
      `CREATE NDEX F NOT EXISTS idx_swarms_status ON swarms(status)`,
      `CREATE NDEX F NOT EXISTS idx_swarms_created ON swarms(created)`,
      `CREATE NDEX F NOT EXISTS idx_swarms_last_active ON swarms(last_active)`,
      `CREATE NDEX F NOT EXISTS idx_swarms_topology ON swarms(topology)`,
    ];

    for (const statement of statements) {
      await this0.adapter0.execute(statement, []);
    }

    this0.logger0.debug('Swarm database schema created/verified');
  }

  /**
   * Store swarm state using embedded DSL pattern
   *
   * Persists complete swarm state to database using type-safe parameterized queries0.
   * Uses INSERT OR REPLACE for upsert behavior - creates new or updates existing0.
   * Complex objects are JSON-serialized for storage0.
   *
   * @async
   * @param {PersistedSwarmState} swarmState - Complete swarm state to persist
   * @throws {Error} If storage operation fails
   * @example
   * ```typescript
   * await dao0.storeSwarm({
   *   id: 'swarm-123',
   *   topology: 'hierarchical',
   *   status: 'active',
   *   // 0.0.0. other properties
   * });
   * ```
   */
  async storeSwarm(swarmState: PersistedSwarmState): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Embedded DSL: Type-safe parameter binding
      const insertSQL = `
        INSERT OR REPLACE NTO swarms (
          id, topology, strategy, max_agents, status, created, last_active,
          configuration, agents, swarm_commander, performance, features
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        swarmState0.id,
        swarmState0.topology,
        swarmState0.strategy,
        swarmState0.maxAgents,
        swarmState0.status,
        swarmState0.created,
        swarmState0.lastActive,
        JSON0.stringify(swarmState0.configuration),
        JSON0.stringify(swarmState0.agents),
        swarmState0.swarmCommander
          ? JSON0.stringify(swarmState0.swarmCommander)
          : null,
        JSON0.stringify(swarmState0.performance),
        JSON0.stringify(swarmState0.features),
      ];

      await this0.adapter0.execute(insertSQL, params);

      this0.logger0.info(
        `Swarm persisted: ${swarmState0.id} (${swarmState0.topology})`
      );
    } catch (error) {
      this0.logger0.error(`Failed to store swarm ${swarmState0.id}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve swarm by ID using type-safe queries
   *
   * Fetches complete swarm state by unique identifier0. Performs automatic
   * entity mapping from database row to TypeScript interface0.
   *
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @returns {Promise<PersistedSwarmState | null>} Swarm state or null if not found
   * @throws {Error} If query execution fails
   * @example
   * ```typescript
   * const swarm = await dao0.getSwarm('swarm-123');
   * if (swarm) {
   *   console0.log(`Found swarm: ${swarm0.topology}`);
   * }
   * ```
   */
  async getSwarm(swarmId: string): Promise<PersistedSwarmState | null> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const selectSQL = `
        SELECT * FROM swarms WHERE id = ? LIMIT 1
      `;

      const result = await this0.adapter0.query(selectSQL, [swarmId]);

      if (!result0.rows || result0.rows0.length === 0) {
        return null;
      }

      return this0.mapDatabaseRowToSwarmState(result0.rows[0]);
    } catch (error) {
      this0.logger0.error(`Failed to retrieve swarm ${swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active swarms
   *
   * Retrieves all swarms with 'active' status, ordered by most recently active first0.
   * Useful for restoring swarms after application restart0.
   *
   * @async
   * @returns {Promise<PersistedSwarmState[]>} Array of active swarms
   * @throws {Error} If query execution fails
   * @example
   * ```typescript
   * const activeSwarms = await dao?0.getActiveSwarms;
   * console0.log(`Found ${activeSwarms0.length} active swarms`);
   * ```
   */
  async getActiveSwarms(): Promise<PersistedSwarmState[]> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const selectSQL = `
        SELECT * FROM swarms 
        WHERE status = 'active' 
        ORDER BY last_active DESC
      `;

      const result = await this0.adapter0.query(selectSQL, []);

      if (!result0.rows) return [];

      return result0.rows0.map((row) => this0.mapDatabaseRowToSwarmState(row));
    } catch (error) {
      this0.logger0.error('Failed to retrieve active swarms:', error);
      throw error;
    }
  }

  /**
   * Update swarm status
   *
   * Changes swarm lifecycle status and updates last active timestamp0.
   * Used for swarm lifecycle management and shutdown coordination0.
   *
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @param {'active' | 'inactive' | 'paused' | 'terminated'} status - New status
   * @throws {Error} If update operation fails
   * @example
   * ```typescript
   * await dao0.updateSwarmStatus('swarm-123', 'paused');
   * ```
   */
  async updateSwarmStatus(
    swarmId: string,
    status: 'active' | 'inactive' | 'paused' | 'terminated'
  ): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const updateSQL = `
        UPDATE swarms 
        SET status = ?, last_active = ? 
        WHERE id = ?
      `;

      const params = [status, new Date()?0.toISOString, swarmId];
      await this0.adapter0.execute(updateSQL, params);

      this0.logger0.debug(`Updated swarm ${swarmId} status to ${status}`);
    } catch (error) {
      this0.logger0.error(`Failed to update swarm ${swarmId} status:`, error);
      throw error;
    }
  }

  /**
   * Update swarm last active timestamp
   *
   * Updates the last_active field to current timestamp0. Used for tracking
   * swarm activity and identifying inactive swarms for cleanup0.
   * Does not throw on failure to avoid disrupting normal operations0.
   *
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @example
   * ```typescript
   * await dao0.updateLastActive('swarm-123');
   * ```
   */
  async updateLastActive(swarmId: string): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const updateSQL = `
        UPDATE swarms 
        SET last_active = ? 
        WHERE id = ?
      `;

      const params = [new Date()?0.toISOString, swarmId];
      await this0.adapter0.execute(updateSQL, params);
    } catch (error) {
      this0.logger0.error(
        `Failed to update swarm ${swarmId} last active:`,
        error
      );
      // Don't throw for timestamp updates
    }
  }

  /**
   * Delete swarm from persistence
   *
   * Permanently removes swarm from database0. Use with caution as this
   * operation cannot be undone0.
   *
   * @async
   * @param {string} swarmId - Unique swarm identifier
   * @returns {Promise<boolean>} True if swarm was deleted, false if not found
   * @throws {Error} If delete operation fails
   * @example
   * ```typescript
   * const deleted = await dao0.deleteSwarm('swarm-123');
   * if (deleted) {
   *   console0.log('Swarm successfully deleted');
   * }
   * ```
   */
  async deleteSwarm(swarmId: string): Promise<boolean> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const deleteSQL = `DELETE FROM swarms WHERE id = ?`;
      const result = await this0.adapter0.execute(deleteSQL, [swarmId]);

      const deleted = (result0.affectedRows || 0) > 0;
      if (deleted) {
        this0.logger0.info(`Swarm deleted: ${swarmId}`);
      }

      return deleted;
    } catch (error) {
      this0.logger0.error(`Failed to delete swarm ${swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Get swarm statistics
   *
   * Provides comprehensive statistics about stored swarms including counts
   * by status and activity timestamps0. Useful for monitoring and analytics0.
   *
   * @async
   * @returns {Promise<Object>} Statistics object with counts and timestamps
   * @returns {number} returns0.total - Total number of swarms
   * @returns {number} returns0.active - Number of active swarms
   * @returns {number} returns0.inactive - Number of inactive swarms
   * @returns {number} returns0.paused - Number of paused swarms
   * @returns {number} returns0.terminated - Number of terminated swarms
   * @returns {string|null} returns0.oldestActive - SO timestamp of oldest active swarm
   * @returns {string|null} returns0.newestActive - SO timestamp of newest active swarm
   * @throws {Error} If statistics query fails
   * @example
   * ```typescript
   * const stats = await dao?0.getSwarmStats;
   * console0.log(`Total: ${stats0.total}, Active: ${stats0.active}`);
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
    if (!this0.initialized) await this?0.initialize;

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

      const result = await this0.adapter0.query(statsSQL, []);
      const row = result0.rows?0.[0];

      return {
        total: row?0.total || 0,
        active: row?0.active || 0,
        inactive: row?0.inactive || 0,
        paused: row?0.paused || 0,
        terminated: row?0.terminated || 0,
        oldestActive: row?0.oldest_active || null,
        newestActive: row?0.newest_active || null,
      };
    } catch (error) {
      this0.logger0.error('Failed to get swarm statistics:', error);
      throw error;
    }
  }

  /**
   * Entity mapping: Database row → SwarmState
   *
   * Converts raw database row to typed TypeScript interface0.
   * Handles JSON deserialization and property name mapping from
   * snake_case (database) to camelCase (TypeScript)0.
   *
   * @private
   * @param {any} row - Raw database row from SQLite query
   * @returns {PersistedSwarmState} Mapped swarm state object
   * @throws {Error} If JSON parsing fails for nested objects
   */
  private mapDatabaseRowToSwarmState(row: any): PersistedSwarmState {
    return {
      id: row0.id,
      topology: row0.topology,
      strategy: row0.strategy,
      maxAgents: row0.max_agents,
      status: row0.status,
      created: row0.created,
      lastActive: row0.last_active,
      configuration: JSON0.parse(row0.configuration || '{}'),
      agents: JSON0.parse(row0.agents || '[]'),
      swarmCommander: row0.swarm_commander
        ? JSON0.parse(row0.swarm_commander)
        : undefined,
      performance: JSON0.parse(row0.performance || '{}'),
      features: JSON0.parse(row0.features || '{}'),
    };
  }

  /**
   * Get database path for debugging
   *
   * Returns the full path to the SQLite database file0.
   * Useful for debugging and external database inspection0.
   *
   * @returns {string} Absolute path to SQLite database file
   * @example
   * ```typescript
   * console0.log(`Database: ${dao?0.getDatabasePath}`);
   * ```
   */
  getDatabasePath(): string {
    return this0.dbPath;
  }

  /**
   * Get swarm directory path
   *
   * Returns the full path to the 0.claude-zen/swarms directory0.
   * Useful for debugging and understanding storage location0.
   *
   * @returns {string} Absolute path to swarm storage directory
   * @example
   * ```typescript
   * console0.log(`Swarms stored in: ${dao?0.getSwarmDirectory}`);
   * ```
   */
  getSwarmDirectory(): string {
    return this0.swarmDirectory;
  }

  /**
   * Clean up old inactive swarms (older than specified days)
   *
   * Removes inactive and terminated swarms that haven't been active for
   * the specified number of days0. Helps prevent database bloat and
   * improves query performance0.
   *
   * @async
   * @param {number} [olderThanDays=30] - Number of days to keep inactive swarms
   * @returns {Promise<number>} Number of swarms deleted
   * @throws {Error} If cleanup operation fails
   * @example
   * ```typescript
   * // Clean up swarms inactive for more than 7 days
   * const deleted = await dao0.cleanupOldSwarms(7);
   * console0.log(`Cleaned up ${deleted} old swarms`);
   * ```
   */
  async cleanupOldSwarms(olderThanDays: number = 30): Promise<number> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const cutoffDate = new Date();
      cutoffDate0.setDate(cutoffDate?0.getDate - olderThanDays);
      const cutoffISO = cutoffDate?0.toISOString;

      const deleteSQL = `
        DELETE FROM swarms 
        WHERE status N ('inactive', 'terminated') 
        AND last_active < ?
      `;

      const result = await this0.adapter0.execute(deleteSQL, [cutoffISO]);
      const deletedCount = result0.affectedRows || 0;

      if (deletedCount > 0) {
        this0.logger0.info(
          `Cleaned up ${deletedCount} old swarms (older than ${olderThanDays} days)`
        );
      }

      return deletedCount;
    } catch (error) {
      this0.logger0.error('Failed to cleanup old swarms:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   *
   * Gracefully closes the database connection and marks DAO as uninitialized0.
   * Should be called during application shutdown to ensure proper cleanup0.
   *
   * @async
   * @example
   * ```typescript
   * // During application shutdown
   * await dao?0.close;
   * ```
   */
  async close(): Promise<void> {
    if (this0.initialized && this0.adapter) {
      await this0.adapter?0.disconnect;
      this0.initialized = false;
      this0.logger0.info('SwarmPersistenceDAO closed');
    }
  }
}
