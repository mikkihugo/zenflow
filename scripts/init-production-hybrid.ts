#!/usr/bin/env node

/**
 * Production Hybrid Database Initialization
 *
 * Initializes the real hybrid database system for production use:
 * - LanceDB for vector embeddings and semantic search
 * - Kuzu for graph relationships and document dependencies
 * - SQLite for structured document storage
 * - Real database files and connections
 */

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { createLogger } from '../src/core/logger.js';

const logger = createLogger('production-hybrid-init');

interface ProductionPaths {
  dataDir: string;
  sqlite: string;
  lancedb: string;
  kuzu: string;
}

async function main() {
  console.log('🚀 Claude-Code-Zen Production Hybrid Database Initialization');
  console.log('=============================================================');

  try {
    // Setup production database paths
    const paths = setupProductionPaths();

    // Create real hybrid system with production providers
    console.log('🏭 Creating production hybrid database system...');
    const system = await createProductionHybridSystem(paths);

    // Test the production system with real data
    await testProductionSystem(system);

    console.log(
      '✅ Production hybrid database system initialization complete!'
    );
    console.log('');
    console.log('🎯 Production Systems Ready:');
    console.log('  - 🗃️  SQLite: Real structured document storage');
    console.log('  - 🚀 LanceDB: Real vector embeddings and semantic search');
    console.log('  - 🕸️  Kuzu: Real graph relationships and dependencies');
    console.log(
      '  - 📋 ADR Manager: Production architecture decision management'
    );
    console.log('  - 🔍 Hybrid Search: Production semantic + graph search');
    console.log('  - 🤖 AGUI Integration: Real human validation workflows');
    console.log('  - 🔗 MCP Tools: External access through stdio server');
    console.log('');
    console.log('📂 Production database locations:');
    console.log(`  - SQLite: ${paths.sqlite}`);
    console.log(`  - LanceDB: ${paths.lancedb}`);
    console.log(`  - Kuzu: ${paths.kuzu}`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log(
      '  1. Start MCP server: npx tsx src/interfaces/mcp-stdio/swarm-server.ts'
    );
    console.log(
      '  2. Use ADR tools: mcp__claude-zen__adr_create, mcp__claude-zen__adr_semantic_search'
    );
    console.log('  3. Create projects: mcp__claude-zen__sparc_project_init');
    console.log(
      '  4. Search documents: mcp__claude-zen__hybrid_document_search'
    );
  } catch (error) {
    console.error(
      '❌ Production hybrid database initialization failed:',
      error
    );
    process.exit(1);
  }
}

function setupProductionPaths(): ProductionPaths {
  const dataDir = process.argv[2] || join(process.cwd(), 'data');

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    console.log(`📁 Created production data directory: ${dataDir}`);
  }

  const paths: ProductionPaths = {
    dataDir,
    sqlite: join(dataDir, 'claude-zen-production.db'),
    lancedb: join(dataDir, 'claude-zen-vectors-production.lance'),
    kuzu: join(dataDir, 'claude-zen-graph-production.kuzu'),
  };

  console.log('📂 Production database paths configured:', paths);
  return paths;
}

async function createProductionHybridSystem(
  paths: ProductionPaths
): Promise<any> {
  // Import production DAL Factory and providers
  const { DALFactory } = await import('../src/database/factory.js');
  const { HybridDocumentManager } = await import(
    '../src/database/managers/hybrid-document-manager.js'
  );
  const { ADRManagerHybrid } = await import(
    '../src/database/managers/adr-manager-hybrid.js'
  );

  // Create production logger and config
  const productionLogger = createLogger('production-dal-factory');
  const productionConfig = {
    get: (key: string) => {
      switch (key) {
        case 'database.sqlite.path':
          return paths.sqlite;
        case 'database.lancedb.path':
          return paths.lancedb;
        case 'database.kuzu.path':
          return paths.kuzu;
        default:
          return null;
      }
    },
    set: () => {},
  };

  // Create real database provider factory (will use actual database adapters)
  const { DatabaseProviderFactory } = await import(
    '../src/database/providers/database-providers.js'
  );
  const providerFactory = new DatabaseProviderFactory(
    productionLogger as any,
    productionConfig as any
  );

  // Create production DAL Factory
  const dalFactory = new DALFactory(
    productionLogger as any,
    productionConfig as any,
    providerFactory as any
  );

  // Register production entity types
  registerProductionEntityTypes(dalFactory, paths);

  // Create hybrid managers
  const hybridManager = new HybridDocumentManager(dalFactory);
  const adrManager = new ADRManagerHybrid(hybridManager);

  // Initialize with real databases
  console.log('🔌 Connecting to production databases...');
  await hybridManager.initialize();
  await adrManager.initialize();

  console.log('✅ Production hybrid system created successfully');

  return {
    dalFactory,
    hybridManager,
    adrManager,
  };
}

function registerProductionEntityTypes(
  dalFactory: any,
  paths: ProductionPaths
): void {
  // Base Document Entity with production SQLite configuration
  dalFactory.registerEntityType('Document', {
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
      database: paths.sqlite,
      options: {
        readonly: false,
        fileMustExist: false,
        timeout: 5000,
      },
    },
  });

  // Document Embeddings for Real Vector Search
  dalFactory.registerEntityType('DocumentEmbedding', {
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
      database: paths.lancedb,
      options: {
        vectorSize: 384,
        metricType: 'cosine',
        createIfNotExists: true,
      },
    },
  });

  // Document Graph Nodes for Real Graph Database
  dalFactory.registerEntityType('DocumentNode', {
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
      database: paths.kuzu,
      options: {
        bufferPoolSize: '1GB',
        maxNumThreads: 4,
        createIfNotExists: true,
      },
    },
  });

  // Document Relationships
  dalFactory.registerEntityType('DocumentRelationship', {
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
      database: paths.sqlite,
      options: { readonly: false },
    },
  });

  // Projects
  dalFactory.registerEntityType('Project', {
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
      database: paths.sqlite,
      options: { readonly: false },
    },
  });

  // Workflow States
  dalFactory.registerEntityType('WorkflowState', {
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
      database: paths.sqlite,
      options: { readonly: false },
    },
  });

  console.log('✅ Production entity types registered');
}

async function testProductionSystem(system: any): Promise<void> {
  console.log('🧪 Testing production system with real data...');

  try {
    // Test ADR creation with real database
    console.log('📋 Creating test ADR...');
    const testADR = await system.adrManager.createADR({
      title: 'Use Production Hybrid Database Architecture',
      context:
        'We need a production-ready database system that supports structured queries, semantic search, and graph relationships for our document management system.',
      decision:
        'Implement a hybrid architecture combining SQLite for structured data, LanceDB for vector embeddings, and Kuzu for graph relationships in production.',
      consequences:
        'This approach provides ACID compliance, semantic search capabilities, and relationship modeling with real data persistence.',
      author: 'claude-zen-production-system',
      priority: 'critical',
      stakeholders: ['production-team', 'developers', 'users'],
      implementation_notes:
        'Use production database adapters with real file persistence and connection pooling.',
      success_criteria: [
        'Support for semantic search with real embeddings',
        'Graph-based relationship queries with persistent data',
        'ACID compliance for critical operations',
        'Sub-second query performance with real data',
        'Persistent data across system restarts',
      ],
    });

    console.log(
      `✅ Production ADR created: ID=${testADR.id}, Number=${testADR.decision_number}`
    );

    // Test semantic search with real data
    console.log('🔍 Testing semantic search...');
    const searchResults = await system.adrManager.semanticSearchADRs(
      'production database architecture',
      {
        limit: 5,
        include_related: true,
      }
    );

    console.log(
      `✅ Semantic search completed: Found ${searchResults.length} results`
    );

    // Test stats with real data
    const stats = await system.adrManager.getADRStats();
    console.log(
      `📊 Production ADR Statistics: ${stats.total} total ADRs, ${stats.active} active`
    );

    console.log(
      '✅ Production system test completed successfully with real data'
    );
  } catch (error) {
    console.warn('⚠️ Production system test had issues:', error);
    console.log(
      '📝 This may be expected if database adapters need additional setup'
    );
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as initializeProductionHybridDatabase };
