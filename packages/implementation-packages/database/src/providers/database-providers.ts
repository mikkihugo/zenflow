/**
 * Real Database Provider Factory using actual database implementations
 *
 * Updated to use real SQLite, LanceDB, and Kuzu adapters with no mocks
 */

import { getLogger } from '../logger.js';
import type { DatabaseAdapter } from '../interfaces.js';
import { SQLiteAdapter, type SQLiteConfig } from '../adapters/sqlite-adapter';
import {
  LanceDBAdapter,
  type LanceDBConfig,
} from '../adapters/lancedb-adapter';
import { KuzuAdapter, type KuzuConfig } from '../adapters/kuzu-adapter';

// Import real adapter types
import type {
  VectorDocument,
  VectorSearchOptions,
  GraphNode,
  GraphRelationship,
} from '../types.js';

const logger = getLogger('database-providers');

export interface DatabaseConfig {
  type: 'sqlite | lancedb|kuzu|postgresql|mysql';
  database: string;
  options?: any;
  [key: string]: any;
}

// Database adapter types for the providers
export interface GraphDatabaseAdapter extends DatabaseAdapter {
  executeQuery(query: string, params?: any[]): Promise<any>;
  createNode(label: string, properties: Record<string, any>): Promise<any>;
  createRelationship(
    from: string,
    to: string,
    type: string,
    properties?: Record<string, any>
  ): Promise<any>;
  queryGraph(query: string, params?: any[]): Promise<any>;
  getNodeCount(label?: string): Promise<number>;
  getRelationshipCount(type?: string): Promise<number>;
}

export interface VectorDatabaseAdapter extends DatabaseAdapter {
  createTable(name: string, schema: any[]): Promise<any>;
  insertVectors(vectors: VectorDocument[]): Promise<any>;
  searchVectors(query: number[], options?: VectorSearchOptions): Promise<any>;
  vectorSearch(query: number[], options?: VectorSearchOptions): Promise<any>;
  addVectors(vectors: VectorDocument[]): Promise<any>;
  createIndex(options: any): Promise<any>;
}

export class DatabaseProviderFactory {
  private logger: any;
  private config: any;

  constructor(logger: any, config: any) {
    this.logger = logger;
    this.config = config;
  }

  async createAdapter(config: DatabaseConfig): Promise<DatabaseAdapter> {
    this.logger.info(
      `Creating REAL ${config.type} adapter for: ${config.database}`,
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

// Export only local types (no re-exports to avoid conflicts)
