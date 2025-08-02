/**
 * Database Domain - Index
 * Exports for database interfaces and storage systems
 * Provides unified access to vector, graph, and relational storage
 */

// Re-export Kuzu types (if available)
export type {
  GraphEdge,
  GraphNode,
  KuzuConfig,
  QueryResult,
} from './kuzu-advanced-interface';
export { KuzuAdvancedInterface } from './kuzu-advanced-interface';
// Re-export common database types
export type {
  ClusteringOptions,
  ClusterResult,
  // LanceDB types
  LanceDBConfig,
  LanceDBStats,
  SearchResult,
  VectorDocument,
} from './lancedb-interface';
// Database interfaces
export { LanceDBInterface } from './lancedb-interface';
// Re-export Swarm database types
export type {
  SwarmDatabaseConfig,
  SwarmQuery,
  SwarmRecord,
} from './swarm-database';
export { SwarmDatabase } from './swarm-database';

// Database utilities and helpers
export const DatabaseUtils = {
  /**
   * Get the appropriate database interface based on type
   */
  getDatabaseInterface: (type: 'lancedb' | 'kuzu' | 'swarm', config: any) => {
    switch (type) {
      case 'lancedb':
        return new LanceDBInterface(config);
      case 'kuzu':
        return new KuzuAdvancedInterface(config);
      case 'swarm':
        return new SwarmDatabase(config);
      default:
        throw new Error(`Unknown database type: ${type}`);
    }
  },

  /**
   * Validate database configuration
   */
  validateConfig: (type: string, config: any): boolean => {
    if (!type || !config) return false;

    switch (type) {
      case 'lancedb':
        return Boolean(config.dbPath || config.dbName);
      case 'kuzu':
        return Boolean(config.dbPath);
      case 'swarm':
        return Boolean(config.storage);
      default:
        return false;
    }
  },

  /**
   * Get database capabilities by type
   */
  getCapabilities: (type: string) => {
    const capabilities = {
      lancedb: ['vector_search', 'similarity', 'clustering', 'indexing'],
      kuzu: ['graph_queries', 'relationships', 'traversal', 'analytics'],
      swarm: ['distributed', 'coordination', 'consensus', 'replication'],
    };

    return capabilities[type as keyof typeof capabilities] || [];
  },
};

// Database factory for creating instances
export class DatabaseFactory {
  private static instances = new Map<string, any>();

  /**
   * Create or get a database instance
   */
  static getInstance<T>(
    type: 'lancedb' | 'kuzu' | 'swarm',
    config: any,
    instanceKey = 'default'
  ): T {
    const key = `${type}:${instanceKey}`;

    if (!DatabaseFactory.instances.has(key)) {
      const instance = DatabaseUtils.getDatabaseInterface(type, config);
      DatabaseFactory.instances.set(key, instance);
    }

    return DatabaseFactory.instances.get(key);
  }

  /**
   * Clear all cached instances
   */
  static clearInstances(): void {
    DatabaseFactory.instances.clear();
  }

  /**
   * Get all active instances
   */
  static getActiveInstances(): string[] {
    return Array.from(DatabaseFactory.instances.keys());
  }
}

// Default export is the factory
export default DatabaseFactory;
