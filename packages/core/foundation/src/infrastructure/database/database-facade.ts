/**
 * @fileoverview Database Facade - Foundation-based Database Access
 * 
 * Provides access to database functionality through foundation package,
 * maintaining proper tier separation while offering convenient access.
 * Uses lazy loading and graceful fallbacks when database package unavailable.
 */

import { getLogger} from '../../core/logging/index.js';
import { facadeStatusManager, CapabilityLevel} from '../facades/system.status.manager.js';
import { type Result, ok} from '../../error-handling/index.js';

const logger = getLogger('database-facade');

export interface DatabaseConnection {
  query<T = unknown>(sql:string, params?:unknown[]): Promise<T[]>;
  execute(sql:string, params?:unknown[]): Promise<{ affectedRows: number; insertId?: number}>;
  close():Promise<void>;
}

export interface DatabaseAdapter {
  connect(config:DatabaseConfig): Promise<Result<DatabaseConnection, Error>>;
  getHealth():Promise<{ healthy: boolean; message?: string}>;
  disconnect():Promise<void>;
}

export interface DatabaseConfig {
  type:'sqlite' | ' postgres' | ' mysql';
  path?:string; // for sqlite
  host?:string;
  port?:number;
  database?:string;
  username?:string;
  password?:string;
  ssl?:boolean;
}

export interface KeyValueStore {
  get<T = unknown>(key:string): Promise<T | null>;
  set<T = unknown>(key:string, value:T, ttl?:number): Promise<void>;
  delete(key:string): Promise<boolean>;
  clear():Promise<void>;
  keys(pattern?:string): Promise<string[]>;
}

export interface VectorStore {
  insert(id:string, vector:number[], metadata?:Record<string, unknown>):Promise<void>;
  search(query:number[], limit?:number): Promise<Array<{ id: string; score: number; metadata?: Record<string, unknown>}>>;
  delete(id:string): Promise<boolean>;
  clear():Promise<void>;
}

export interface GraphStore {
  addNode(id:string, properties?:Record<string, unknown>):Promise<void>;
  addEdge(from:string, to:string, type:string, properties?:Record<string, unknown>):Promise<void>;
  queryNodes(cypher:string): Promise<unknown[]>;
  queryPaths(from:string, to:string, maxDepth?:number): Promise<unknown[]>;
}

// Type definitions for the optional database package
interface DatabasePackage {
  DatabaseFactory?: {
    createAdapter(type: DatabaseConfig['type']): Promise<DatabaseAdapter>;
  };
  createKeyValueStore?(): Promise<KeyValueStore>;
  createVectorStore?(): Promise<VectorStore>;
  createGraphStore?(): Promise<GraphStore>;
}

/**
 * Database Facade providing unified access to database functionality
 */
export class DatabaseFacade {
  private static instance:DatabaseFacade | null = null;
  private databasePackage: DatabasePackage | null = null;
  private capability:CapabilityLevel = CapabilityLevel.FALLBACK;

  private constructor() {
    this.initializeFacade();
}

  static getInstance():DatabaseFacade {
    if (!DatabaseFacade.instance) {
      DatabaseFacade.instance = new DatabaseFacade();
}
    return DatabaseFacade.instance;
}

  private async initializeFacade():Promise<void> {
    try {
      // Register database facade with status manager
      await facadeStatusManager.registerFacade('database', [
        '@claude-zen/database'], [
        'SQL database operations',        'Key-value storage',        'Vector database',        'Graph database']);

      // Try to load the database package
      await this.loadDatabasePackage();
} catch (error) {
      logger.warn('Database facade initialization with fallback', { error});
      this.capability = CapabilityLevel.FALLBACK;
}
}

  private async loadDatabasePackage():Promise<void> {
    try {
      const packageInfo = await facadeStatusManager.checkAndRegisterPackage('@claude-zen/database',    'databaseService');
      
      if (packageInfo.status === 'available' || packageInfo.status === 'registered') {
        try {
          // Dynamic import with error handling for optional dependency
          const moduleName = '@claude-zen/database';
          const databaseModule = await import(moduleName).catch(() => null);
          if (databaseModule) {
            this.databasePackage = databaseModule as DatabasePackage;
            this.capability = CapabilityLevel.FULL;
            console.info('Database package loaded successfully');
          } else {
            console.warn('Database package not found, using fallback');
            this.capability = CapabilityLevel.FALLBACK;
          }
        } catch (importError) {
          console.warn('Database package import failed, using fallback', { importError });
          this.capability = CapabilityLevel.FALLBACK;
        }
      } else {
        console.warn('Database package unavailable, using fallback');
        this.capability = CapabilityLevel.FALLBACK;
      }
} catch (error) {
      logger.warn('Failed to load database package', { error});
      this.capability = CapabilityLevel.FALLBACK;
}
}

  /**
   * Get database capability level
   */
  getCapability():CapabilityLevel {
    return this.capability;
}

  /**
   * Create a database adapter
   */
  async createAdapter(type:DatabaseConfig['type']): Promise<Result<DatabaseAdapter, Error>> {
    if (this.capability === CapabilityLevel.FULL && this.databasePackage?.DatabaseFactory) {
      try {
        const adapter = await this.databasePackage.DatabaseFactory.createAdapter(type);
        return ok(adapter);
} catch (error) {
        logger.error('Failed to create database adapter', { type, error});
        return this.createFallbackAdapter(type);
}
}

    return this.createFallbackAdapter(type);
}

  /**
   * Create fallback adapter when database package unavailable
   */
  private createFallbackAdapter(type:DatabaseConfig['type']): Result<DatabaseAdapter, Error> {
    logger.debug(`Creating fallback database adapter for ${type}`);
    
    const fallbackAdapter:DatabaseAdapter = {
      connect(config:DatabaseConfig): Promise<Result<DatabaseConnection, Error>> {
        logger.warn(`Fallback database connection for ${config.type}`);
        
        const fallbackConnection:DatabaseConnection = {
          query<T = unknown>():Promise<T[]> {
            logger.warn('Fallback database query - returning empty result');
            return Promise.resolve([]);
          },
          
          execute():Promise<{ affectedRows: number; insertId?: number}> {
            logger.warn('Fallback database execute - no operation performed');
            return Promise.resolve({ affectedRows:0});
          },
          
          close():Promise<void> {
            logger.debug('Fallback database connection closed');
            return Promise.resolve();
          }
};
        
        return Promise.resolve(ok(fallbackConnection));
},
      
      getHealth():Promise<{ healthy: boolean; message?: string}> {
        return Promise.resolve({ 
          healthy:false, 
          message:'Using fallback database adapter - @claude-zen/database not available'
        });
      },
      
      disconnect():Promise<void> {
        logger.debug('Fallback database adapter disconnected');
        return Promise.resolve();
      }
};

    return ok(fallbackAdapter);
}

  /**
   * Create key-value store
   */
  async createKeyValueStore():Promise<Result<KeyValueStore, Error>> {
    if (this.capability === CapabilityLevel.FULL && this.databasePackage?.createKeyValueStore) {
      try {
        const store = await this.databasePackage.createKeyValueStore();
        return ok(store);
} catch (error) {
        logger.error('Failed to create key-value store', { error});
        return this.createFallbackKeyValueStore();
}
}

    return this.createFallbackKeyValueStore();
}

  /**
   * Create fallback key-value store
   */
  private createFallbackKeyValueStore():Result<KeyValueStore, Error> {
    const fallbackStore = new Map<string, { value:unknown; expires?: number}>();
    
    const store:KeyValueStore = {
      get<T = unknown>(key:string): Promise<T | null> {
        const entry = fallbackStore.get(key);
        if (!entry) return Promise.resolve(null);
        
        if (entry.expires && Date.now() > entry.expires) {
          fallbackStore.delete(key);
          return Promise.resolve(null);
        }
        
        return Promise.resolve(entry.value as T);
      },
      
      set<T = unknown>(key:string, value:T, ttl?:number): Promise<void> {
        const expires = ttl ? Date.now() + ttl * 1000:undefined;
        fallbackStore.set(key, { value, expires});
        return Promise.resolve();
      },
      
      delete(key:string): Promise<boolean> {
        return Promise.resolve(fallbackStore.delete(key));
      },
      
      clear():Promise<void> {
        fallbackStore.clear();
        return Promise.resolve();
      },
      
      keys(pattern?:string): Promise<string[]> {
        const allKeys = Array.from(fallbackStore.keys());
        if (!pattern) return Promise.resolve(allKeys);
        
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return Promise.resolve(allKeys.filter(key => regex.test(key)));
      }
};

    logger.debug('Created fallback key-value store');
    return ok(store);
}

  /**
   * Create vector store
   */
  async createVectorStore():Promise<Result<VectorStore, Error>> {
    if (this.capability === CapabilityLevel.FULL && this.databasePackage?.createVectorStore) {
      try {
        const store = await this.databasePackage.createVectorStore();
        return ok(store);
} catch (error) {
        logger.error('Failed to create vector store', { error});
        return this.createFallbackVectorStore();
}
}

    return this.createFallbackVectorStore();
}

  /**
   * Create fallback vector store
   */
  private createFallbackVectorStore():Result<VectorStore, Error> {
    const vectors = new Map<string, { vector:number[]; metadata?: Record<string, unknown>}>();
    const cosineSimilarity = this.cosineSimilarity.bind(this);
    
    const store:VectorStore = {
      insert(id:string, vector:number[], metadata?:Record<string, unknown>):Promise<void> {
        vectors.set(id, { vector, metadata});
        return Promise.resolve();
      },
      
      search(query:number[], limit = 10):Promise<Array<{ id: string; score: number; metadata?: Record<string, unknown>}>> {
        logger.warn('Fallback vector search - using simple cosine similarity');
        
        const results:Array<{ id: string; score: number; metadata?: Record<string, unknown>}> = [];
        
        for (const [id, { vector, metadata}] of vectors.entries()) {
          const score = cosineSimilarity(query, vector);
          results.push({ id, score, metadata});
}
        
        return Promise.resolve(results
          .sort((a, b) => b.score - a.score)
          .slice(0, limit));
      },
      
      delete(id:string): Promise<boolean> {
        return Promise.resolve(vectors.delete(id));
      },
      
      clear():Promise<void> {
        vectors.clear();
        return Promise.resolve();
}
};

    logger.debug('Created fallback vector store');
    return ok(store);
}

  /**
   * Simple cosine similarity calculation for fallback
   */
  private cosineSimilarity(a:number[], b:number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (const [i, element] of a.entries()) {
      const bElement = b[i];
      if (bElement !== undefined) {
        dotProduct += element * bElement;
        normA += element * element;
        normB += bElement * bElement;
      }
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Create graph store
   */
  async createGraphStore():Promise<Result<GraphStore, Error>> {
    if (this.capability === CapabilityLevel.FULL && this.databasePackage?.createGraphStore) {
      try {
        const store = await this.databasePackage.createGraphStore();
        return ok(store);
} catch (error) {
        logger.error('Failed to create graph store', { error});
        return this.createFallbackGraphStore();
}
}

    return this.createFallbackGraphStore();
}

  /**
   * Create fallback graph store
   */
  private createFallbackGraphStore():Result<GraphStore, Error> {
    const nodes = new Map<string, Record<string, unknown>>();
    const edges = new Map<string, { from:string; to: string; type: string; properties?: Record<string, unknown>}>();
    
    const store:GraphStore = {
      addNode(id:string, properties:Record<string, unknown> = {}):Promise<void> {
        nodes.set(id, properties);
        return Promise.resolve();
      },
      
      addEdge(from:string, to:string, type:string, properties?:Record<string, unknown>):Promise<void> {
        const edgeId = `${from}->${to}:${type}`;
        edges.set(edgeId, { from, to, type, properties});
        return Promise.resolve();
      },
      
      queryNodes():Promise<unknown[]> {
        logger.warn('Fallback graph query - returning all nodes');
        return Promise.resolve(Array.from(nodes.entries()).map(([id, properties]) => ({ id, ...properties})));
      },
      
      queryPaths(from:string, to:string): Promise<unknown[]> {
        logger.warn('Fallback graph path query - basic implementation');
        const paths:unknown[] = [];
        
        // Simple direct path check
        for (const [edgeId, edge] of edges.entries()) {
          if (edge.from === from && edge.to === to) {
            paths.push({
              path:[from, to],
              edges:[{ id: edgeId, ...edge}],
              length:1
});
}
}
        
        return Promise.resolve(paths);
      }
};

    logger.debug('Created fallback graph store');
    return ok(store);
}
}

// Singleton instance
export const databaseFacade = DatabaseFacade.getInstance();

// Convenience functions for easy access from foundation
export async function createDatabaseAdapter(type:DatabaseConfig['type']): Promise<Result<DatabaseAdapter, Error>> {
  return await databaseFacade.createAdapter(type);
}

export async function createKeyValueStore():Promise<Result<KeyValueStore, Error>> {
  return await databaseFacade.createKeyValueStore();
}

export async function createVectorStore():Promise<Result<VectorStore, Error>> {
  return await databaseFacade.createVectorStore();
}

export async function createGraphStore():Promise<Result<GraphStore, Error>> {
  return await databaseFacade.createGraphStore();
}

export function getDatabaseCapability():CapabilityLevel {
  return databaseFacade.getCapability();
}

// Export types for external use - already exported above as interfaces