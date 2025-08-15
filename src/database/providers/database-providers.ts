/**
 * Real Database Provider Factory using actual database implementations
 *
 * Updated to use real SQLite, LanceDB, and Kuzu adapters with no mocks
 */

import { createLogger } from '../../core/logger.js';
import {
  SQLiteAdapter,
  type SQLiteConfig,
} from '../adapters/sqlite-adapter.js';
import {
  LanceDBAdapter,
  type LanceDBConfig,
} from '../adapters/lancedb-adapter.js';
import { KuzuAdapter, type KuzuConfig } from '../adapters/kuzu-adapter.js';

// Import real adapter types
import type {
  VectorDocument,
  VectorSearchOptions,
} from '../adapters/lancedb-adapter.js';
import type { GraphNode, GraphRelationship } from '../adapters/kuzu-adapter.js';

const logger = createLogger('database-providers');

export interface DatabaseConfig {
  type: 'sqlite' | 'lancedb' | 'kuzu' | 'postgresql' | 'mysql';
  database: string;
  options?: any;
  [key: string]: any;
}

export class DatabaseProviderFactory {
  private logger: any;
  private config: any;

  constructor(logger: any, config: any) {
    this.logger = logger;
    this.config = config;
  }

  async createAdapter(config: DatabaseConfig): Promise<any> {
    this.logger.info(
      `Creating REAL ${config.type} adapter for: ${config.database}`
    );

    switch (config.type) {
      case 'sqlite':
        return new SQLiteAdapter(config as SQLiteConfig);

      case 'lancedb':
        return new LanceDBAdapter(config as LanceDBConfig);

      case 'kuzu':
        return new KuzuAdapter(config as KuzuConfig);

      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

// Re-export the main types for compatibility
export { DatabaseConfig };
