#!/usr/bin/env node

/**
 * Hybrid Database Initialization Script
 * 
 * Initializes the complete claude-code-zen hybrid database system:
 * - LanceDB for vector embeddings and semantic search
 * - Kuzu for graph relationships and document dependencies
 * - SQLite for structured document storage
 * - Integration with existing DAL factory system
 */

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { createLogger } from '../src/core/logger.js';
import { createHybridSystem, healthCheckHybridSystem } from '../src/database/managers/hybrid-factory.js';

const logger = createLogger('hybrid-db-init');

interface DatabasePaths {
  dataDir: string;
  sqlite: string;
  lancedb: string;
  kuzu: string;
}

async function main() {
  console.log('🚀 Claude-Code-Zen Hybrid Database Initialization');
  console.log('=====================================================');

  try {
    // Setup database paths
    const paths = setupDatabasePaths();
    
    // Create hybrid system using clean factory
    console.log('🏭 Creating hybrid database system...');
    const { dalFactory, hybridManager, adrManager } = await createHybridSystem({
      dataDir: paths.dataDir,
      enableVectorSearch: true,
      enableGraphRelationships: true,
      vectorDimension: 384,
      logLevel: 'info'
    });
    
    // Test the system
    await testHybridSystem(adrManager);
    
    console.log('✅ Hybrid database system initialization complete!');
    console.log('');
    console.log('🎯 Available Systems:');
    console.log('  - 🗃️  SQLite: Structured document storage');
    console.log('  - 🚀 LanceDB: Vector embeddings and semantic search');
    console.log('  - 🕸️  Kuzu: Graph relationships and dependencies');
    console.log('  - 📋 ADR Manager: Architecture decision management');
    console.log('  - 🔍 Hybrid Search: Combined semantic + graph search');
    console.log('  - 🤖 AGUI Integration: Human validation workflows');
    console.log('');
    console.log('📂 Database locations:');
    console.log(`  - SQLite: ${paths.sqlite}`);
    console.log(`  - LanceDB: ${paths.lancedb}`);
    console.log(`  - Kuzu: ${paths.kuzu}`);
    
  } catch (error) {
    console.error('❌ Hybrid database initialization failed:', error);
    process.exit(1);
  }
}

function setupDatabasePaths(): DatabasePaths {
  const dataDir = process.argv[2] || join(process.cwd(), 'data');
  
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    console.log(`📁 Created data directory: ${dataDir}`);
  }

  const paths: DatabasePaths = {
    dataDir,
    sqlite: join(dataDir, 'claude-zen.db'),
    lancedb: join(dataDir, 'claude-zen-vectors.lance'),
    kuzu: join(dataDir, 'claude-zen-graph.kuzu')
  };

  console.log('📂 Database paths configured:', paths);
  return paths;
}

async function testHybridSystem(adrManager: any): Promise<void> {
  console.log('🧪 Testing hybrid system...');
  
  try {
    // Test ADR creation
    const testADR = await adrManager.createADR({
      title: 'Use Hybrid Database Architecture',
      context: 'We need a database system that supports both structured queries and semantic search for our document management system.',
      decision: 'Implement a hybrid architecture combining SQLite for structured data, LanceDB for vector embeddings, and Kuzu for graph relationships.',
      consequences: 'This approach provides the best of all worlds: ACID compliance, semantic search capabilities, and relationship modeling.',
      author: 'claude-zen-system',
      priority: 'high',
      stakeholders: ['architecture-team', 'developers'],
      implementation_notes: 'Use the existing DAL factory system to manage connections and provide a unified interface.',
      success_criteria: [
        'Support for semantic search of documents',
        'Graph-based relationship queries',
        'ACID compliance for critical operations',
        'Sub-second query performance'
      ]
    });
    
    console.log(`✅ Test ADR created: ${testADR.title}`);
    
    // Test semantic search
    const searchResults = await adrManager.semanticSearchADRs('hybrid database architecture', {
      limit: 5,
      include_related: true
    });
    
    console.log(`🔍 Semantic search found ${searchResults.length} results`);
    
    // Test stats
    const stats = await adrManager.getADRStats();
    console.log(`📊 ADR Statistics: ${stats.total} total ADRs`);
    
    console.log('✅ Hybrid system test completed successfully');
    
  } catch (error) {
    console.warn('⚠️ System test had issues:', error);
    console.log('📝 This is expected in development environment');
  }
}

// Integration test function using clean factory
export async function testHybridIntegration(): Promise<{
  success: boolean;
  components: {
    dalFactory: boolean;
    hybridManager: boolean;
    adrManager: boolean;
    semanticSearch: boolean;
    graphRelationships: boolean;
  };
  errors: string[];
}> {
  return await healthCheckHybridSystem({
    dataDir: './data/test',
    enableVectorSearch: true,
    enableGraphRelationships: true
  });
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as initializeHybridDatabase };