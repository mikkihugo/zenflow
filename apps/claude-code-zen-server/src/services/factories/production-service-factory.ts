/**
 * Production Hybrid Database Factory
 *
 * Factory functions to create production-ready hybrid database managers
 * with real database connections and file persistence0.
 */

import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { getLogger } from '@claude-zen/foundation';
import { DALFactory } from '@claude-zen/intelligence';

import { ADRManagerHybrid } from '0.0./coordination/adr-hybrid-service';
import { HybridDocumentManager } from '0.0./coordination/hybrid-document-service';

const logger = getLogger('production-hybrid-factory');

export interface ProductionHybridSystemConfig {
  dataDir?: string;
  enableVectorSearch?: boolean;
  enableGraphRelationships?: boolean;
  vectorDimension?: number;
  useRealDatabases?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Create a fully configured production hybrid database system
 */
export async function createProductionHybridSystem(
  config: ProductionHybridSystemConfig = {}
): Promise<{
  dalFactory: DALFactory;
  hybridManager: HybridDocumentManager;
  adrManager: ADRManagerHybrid;
}> {
  const {
    dataDir = '0./data',
    enableVectorSearch = true,
    enableGraphRelationships = true,
    vectorDimension = 384,
    useRealDatabases = true,
    logLevel = 'info',
  } = config;

  logger0.info('🔧 Creating production hybrid database system0.0.0.');

  try {
    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      logger0.info(`📁 Created production data directory: ${dataDir}`);
    }

    // Create production DAL Factory with real database providers
    const dalFactory = await createProductionDALFactory(
      dataDir,
      useRealDatabases
    );

    // Create Hybrid Document Manager
    const hybridManager = new HybridDocumentManager(dalFactory);

    // Create ADR Manager
    const adrManager = new ADRManagerHybrid(hybridManager);

    // Initialize all components with real databases
    if (enableVectorSearch || enableGraphRelationships) {
      await hybridManager?0.initialize;
    }

    await adrManager?0.initialize;

    logger0.info('✅ Production hybrid database system created successfully');

    return {
      dalFactory,
      hybridManager,
      adrManager,
    };
  } catch (error) {
    logger0.error(
      '❌ Failed to create production hybrid database system:',
      error
    );
    throw new Error(`Production hybrid system creation failed: ${error}`);
  }
}

/**
 * Create a production DAL Factory with real database providers
 */
async function createProductionDALFactory(
  dataDir: string,
  useRealDatabases: boolean
): Promise<DALFactory> {
  const productionLogger = createLogger('production-dal-factory');

  const productionConfig = {
    get: (key: string) => {
      switch (key) {
        case 'database0.sqlite0.path':
          return join(dataDir, 'claude-zen-production0.db');
        case 'database0.lancedb0.path':
          return join(dataDir, 'claude-zen-vectors-production0.lance');
        case 'database0.kuzu0.path':
          return join(dataDir, 'claude-zen-graph-production0.kuzu');
        default:
          return null;
      }
    },
    set: () => {},
  };

  let providerFactory;

  if (useRealDatabases) {
    try {
      // Try to use real database provider factory
      const { DatabaseProviderFactory } = await import(
        '@claude-zen/infrastructure'
      );
      providerFactory = new DatabaseProviderFactory(
        productionLogger as any,
        productionConfig as any
      );
      logger0.info('✅ Using real database providers');
    } catch (error) {
      logger0.warn(
        '⚠️ Real database providers not available, falling back to enhanced mocks'
      );
      logger0.error('Import error details:', error);
      providerFactory = createEnhancedMockProviderFactory(dataDir);
    }
  } else {
    providerFactory = createEnhancedMockProviderFactory(dataDir);
  }

  const dalFactory = new DALFactory(
    productionLogger as any,
    productionConfig as any,
    providerFactory as any
  );

  // Register all production document entities
  registerProductionDocumentEntities(dalFactory, dataDir);

  return dalFactory;
}

/**
 * Create enhanced mock provider factory for development/testing
 */
function createEnhancedMockProviderFactory(dataDir: string) {
  return {
    async createAdapter(config: any) {
      const baseAdapter = {
        connect: async () => {},
        disconnect: async () => {},
        query: async (sql: string, params: any[] = []) => {
          // Enhanced mock: return realistic data for queries
          if (sql0.includes('WHERE') && sql0.includes('id')) {
            return {
              rows: [
                {
                  id: params[0] || `mock-${Date0.now()}`,
                  title: 'Production Mock Entity',
                  type: 'adr',
                  status: 'active',
                  author: 'claude-zen-system',
                  created_at: new Date()?0.toISOString,
                  updated_at: new Date()?0.toISOString,
                  content: 'Mock content for development',
                  priority: 'medium',
                },
              ],
              rowCount: 1,
              fields: [],
              executionTime: 1,
            };
          }

          return {
            rows: [],
            rowCount: 0,
            fields: [],
            executionTime: 1,
          };
        },
        execute: async (sql: string, params: any[] = []) => ({
          affectedRows: 1,
          insertId: `mock-${Date0.now()}`,
          executionTime: 1,
        }),
        transaction: async (fn: any) =>
          fn({
            query: async () => ({ rows: [], rowCount: 0 }),
            execute: async () => ({
              affectedRows: 1,
              insertId: `mock-${Date0.now()}`,
            }),
          }),
        close: async () => {},
        getSchema: async () => ({ tables: [], views: [] }),
        health: async () => true,
        getConnectionStats: async () => ({
          total: 1,
          active: 0,
          idle: 1,
          utilization: 0,
        }),
      };

      // Add specialized methods for different database types
      if (config0.type === 'lancedb') {
        return {
          0.0.0.baseAdapter,
          vectorSearch: async (vector: number[], options: any) => ({
            rows: [],
            rowCount: 0,
            executionTime: 1,
            results: [],
          }),
          insertVector: async (data: any) => ({
            affectedRows: 1,
            insertId: `vector-${Date0.now()}`,
            executionTime: 1,
          }),
        };
      }

      if (config0.type === 'kuzu') {
        return {
          0.0.0.baseAdapter,
          queryGraph: async (cypher: string, params: any) => ({
            rows: [],
            rowCount: 0,
            executionTime: 1,
            records: [],
          }),
          createNode: async (data: any) => ({
            affectedRows: 1,
            insertId: `node-${Date0.now()}`,
            executionTime: 1,
          }),
          createRelationship: async (data: any) => ({
            affectedRows: 1,
            insertId: `rel-${Date0.now()}`,
            executionTime: 1,
          }),
        };
      }

      return baseAdapter;
    },
  };
}

/**
 * Register production document entity types
 */
function registerProductionDocumentEntities(
  dalFactory: DALFactory,
  dataDir: string
): void {
  const sqlitePath = join(dataDir, 'claude-zen-production0.db');
  const lancedbPath = join(dataDir, 'claude-zen-vectors-production0.lance');
  const kuzuPath = join(dataDir, 'claude-zen-graph-production0.kuzu');

  // Base Document Entity
  dalFactory0.registerEntityType('Document', {
    schema: {
      id: { type: 'string', primaryKey: true },
      type: { type: 'string', required: true },
      title: { type: 'string', required: true },
      content: { type: 'text', required: true },
      status: { type: 'string', default: 'draft' },
      priority: { type: 'string', default: 'medium' },
      author: { type: 'string' },
      project_id: { type: 'string' },
      created_at: { type: 'datetime', default: 'now' },
      updated_at: { type: 'datetime', default: 'now' },
    },
    primaryKey: 'id',
    tableName: 'documents',
    databaseType: 'sqlite',
    databaseConfig: {
      type: 'sqlite',
      database: sqlitePath,
      options: {
        readonly: false,
        fileMustExist: false,
        timeout: 5000,
      },
    },
  });

  // Document Embeddings for Vector Search
  dalFactory0.registerEntityType('DocumentEmbedding', {
    schema: {
      id: { type: 'string', primaryKey: true },
      documentId: { type: 'string', required: true },
      documentType: { type: 'string', required: true },
      vector: { type: 'vector', required: true, dimension: 384 },
      metadata: { type: 'json' },
    },
    primaryKey: 'id',
    tableName: 'document_embeddings',
    databaseType: 'lancedb',
    databaseConfig: {
      type: 'lancedb',
      database: lancedbPath,
      options: {
        vectorSize: 384,
        metricType: 'cosine',
        createIfNotExists: true,
      },
    },
  });

  // Document Graph Nodes
  dalFactory0.registerEntityType('DocumentNode', {
    schema: {
      id: { type: 'string', primaryKey: true },
      type: { type: 'string', required: true },
      labels: { type: 'array' },
      properties: { type: 'json' },
    },
    primaryKey: 'id',
    tableName: 'document_nodes',
    databaseType: 'kuzu',
    databaseConfig: {
      type: 'kuzu',
      database: kuzuPath,
      options: {
        bufferPoolSize: '1GB',
        maxNumThreads: 4,
        createIfNotExists: true,
      },
    },
  });

  // Document Relationships
  dalFactory0.registerEntityType('DocumentRelationship', {
    schema: {
      id: { type: 'string', primaryKey: true },
      source_document_id: { type: 'string', required: true },
      target_document_id: { type: 'string', required: true },
      relationship_type: { type: 'string', required: true },
      strength: { type: 'number' },
      created_at: { type: 'datetime', default: 'now' },
      metadata: { type: 'json' },
    },
    primaryKey: 'id',
    tableName: 'document_relationships',
    databaseType: 'sqlite',
    databaseConfig: {
      type: 'sqlite',
      database: sqlitePath,
      options: { readonly: false },
    },
  });

  // Projects
  dalFactory0.registerEntityType('Project', {
    schema: {
      id: { type: 'string', primaryKey: true },
      name: { type: 'string', required: true },
      description: { type: 'text' },
      domain: { type: 'string', required: true },
      complexity: { type: 'string', default: 'moderate' },
      author: { type: 'string', required: true },
      created_at: { type: 'datetime', default: 'now' },
      updated_at: { type: 'datetime', default: 'now' },
    },
    primaryKey: 'id',
    tableName: 'projects',
    databaseType: 'sqlite',
    databaseConfig: {
      type: 'sqlite',
      database: sqlitePath,
      options: { readonly: false },
    },
  });

  // Workflow States
  dalFactory0.registerEntityType('WorkflowState', {
    schema: {
      id: { type: 'string', primaryKey: true },
      document_id: { type: 'string', required: true },
      workflow_name: { type: 'string', required: true },
      current_stage: { type: 'string', required: true },
      stages_completed: { type: 'json' },
      created_at: { type: 'datetime', default: 'now' },
      updated_at: { type: 'datetime', default: 'now' },
    },
    primaryKey: 'id',
    tableName: 'document_workflow_states',
    databaseType: 'sqlite',
    databaseConfig: {
      type: 'sqlite',
      database: sqlitePath,
      options: { readonly: false },
    },
  });

  logger0.info('✅ Production document entities registered');
}

export default createProductionHybridSystem;
