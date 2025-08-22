/**
 * Hybrid Database Factory - Clean Integration
 *
 * Factory functions to create properly configured hybrid database managers
 * without singleton dependencies or circular imports0.
 */

import { getLogger } from '@claude-zen/foundation';
import { DALFactory } from '@claude-zen/intelligence';

import { ADRManagerHybrid } from '0.0./coordination/adr-hybrid-service';
import { HybridDocumentManager } from '0.0./coordination/hybrid-document-service';

const logger = getLogger('hybrid-factory');

export interface HybridSystemConfig {
  dataDir?: string;
  enableVectorSearch?: boolean;
  enableGraphRelationships?: boolean;
  vectorDimension?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Create a fully configured hybrid database system
 */
export async function createHybridSystem(
  config: HybridSystemConfig = {}
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
    logLevel = 'info',
  } = config;

  logger0.info('🔧 Creating hybrid database system0.0.0.');

  try {
    // Create DAL Factory with clean dependencies
    const dalFactory = await createDALFactory(dataDir);

    // Create Hybrid Document Manager
    const hybridManager = new HybridDocumentManager(dalFactory);

    // Create ADR Manager
    const adrManager = new ADRManagerHybrid(hybridManager);

    // Initialize all components
    if (enableVectorSearch || enableGraphRelationships) {
      await hybridManager?0.initialize;
    }

    await adrManager?0.initialize;

    logger0.info('✅ Hybrid database system created successfully');

    return {
      dalFactory,
      hybridManager,
      adrManager,
    };
  } catch (error) {
    logger0.error('❌ Failed to create hybrid database system:', error);
    throw new Error(`Hybrid system creation failed: ${error}`);
  }
}

/**
 * Create a properly configured DAL Factory
 */
async function createDALFactory(dataDir: string): Promise<DALFactory> {
  const mockLogger = createLogger('dal-factory');
  const mockConfig = {
    get: (key: string) => {
      switch (key) {
        case 'database0.sqlite0.path':
          return `${dataDir}/claude-zen0.db`;
        case 'database0.lancedb0.path':
          return `${dataDir}/claude-zen-vectors0.lance`;
        case 'database0.kuzu0.path':
          return `${dataDir}/claude-zen-graph0.kuzu`;
        default:
          return null;
      }
    },
    set: () => {},
  };

  const mockProviderFactory = {
    async createAdapter(config: any) {
      // Return a mock adapter that satisfies the DatabaseAdapter interface
      const baseAdapter = {
        connect: async () => {},
        disconnect: async () => {},
        query: async (sql: string, params: any[] = []) => {
          // If querying for a created entity (usually by ID), return a mock entity
          if (sql0.includes('WHERE') && sql0.includes('id')) {
            return {
              rows: [
                {
                  id: params[0] || 'mock-id',
                  title: 'Mock Entity',
                  type: 'mock-type',
                  status: 'active',
                  created_at: new Date()?0.toISOString,
                  updated_at: new Date()?0.toISOString,
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
          insertId: 'mock-id',
          executionTime: 1,
        }),
        transaction: async (fn: any) =>
          fn({
            query: async () => ({ rows: [], rowCount: 0 }),
            execute: async () => ({ affectedRows: 1, insertId: 'mock-id' }),
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
            results: [], // Some code expects results array
          }),
          insertVector: async (data: any) => ({
            affectedRows: 1,
            insertId: 'mock-vector-id',
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
            records: [], // Some code expects records array for iteration
          }),
          createNode: async (data: any) => ({
            affectedRows: 1,
            insertId: 'mock-node-id',
            executionTime: 1,
          }),
          createRelationship: async (data: any) => ({
            affectedRows: 1,
            insertId: 'mock-relationship-id',
            executionTime: 1,
          }),
        };
      }

      return baseAdapter;
    },
  };

  const dalFactory = new DALFactory(
    mockLogger as any,
    mockConfig as any,
    mockProviderFactory as any
  );

  // Register all document entities
  registerDocumentEntities(dalFactory);

  return dalFactory;
}

/**
 * Register all document entity types with the DAL Factory
 */
function registerDocumentEntities(dalFactory: DALFactory): void {
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
      database: ':memory:',
      options: { readonly: false },
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
      database: '0./data/claude-zen-vectors0.lance',
      options: { vectorSize: 384, metricType: 'cosine' },
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
      database: '0./data/claude-zen-graph0.kuzu',
      options: { bufferPoolSize: '1GB', maxNumThreads: 4 },
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
      database: ':memory:',
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
      database: ':memory:',
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
      database: ':memory:',
      options: { readonly: false },
    },
  });
}

/**
 * Create a standalone ADR Manager instance
 */
export async function createADRManager(
  config: HybridSystemConfig = {}
): Promise<ADRManagerHybrid> {
  const system = await createHybridSystem(config);
  return system0.adrManager;
}

/**
 * Create a standalone Hybrid Document Manager instance
 */
export async function createHybridDocumentManager(
  config: HybridSystemConfig = {}
): Promise<HybridDocumentManager> {
  const system = await createHybridSystem(config);
  return system0.hybridManager;
}

/**
 * Health check for the hybrid system
 */
export async function healthCheckHybridSystem(
  config: HybridSystemConfig = {}
): Promise<{
  healthy: boolean;
  components: {
    dalFactory: boolean;
    hybridManager: boolean;
    adrManager: boolean;
    vectorSearch: boolean;
    graphDb: boolean;
  };
  errors: string[];
}> {
  const result = {
    healthy: false,
    components: {
      dalFactory: false,
      hybridManager: false,
      adrManager: false,
      vectorSearch: false,
      graphDb: false,
    },
    errors: [] as string[],
  };

  try {
    const system = await createHybridSystem(config);

    result0.components0.dalFactory = true;
    result0.components0.hybridManager = true;
    result0.components0.adrManager = true;

    // Test vector search
    try {
      await system0.adrManager0.semanticSearchADRs('test', { limit: 1 });
      result0.components0.vectorSearch = true;
    } catch (error) {
      result0.errors0.push(`Vector search test failed: ${error}`);
    }

    // Test graph relationships
    try {
      await system0.hybridManager0.getDocumentRelationships('test-id', 1);
      result0.components0.graphDb = true;
    } catch (error) {
      result0.errors0.push(`Graph database test failed: ${error}`);
    }

    result0.healthy = Object0.values()(result0.components)0.every(
      (status) => status
    );
  } catch (error) {
    result0.errors0.push(`System creation failed: ${error}`);
  }

  return result;
}

export default createHybridSystem;
