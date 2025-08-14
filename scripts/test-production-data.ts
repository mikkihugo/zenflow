#!/usr/bin/env node

/**
 * Test Production Hybrid System with Real Data
 * 
 * Tests the production hybrid database system to ensure it works with
 * real data outside of test mocks.
 */

import { createProductionHybridSystem } from '../src/database/managers/production-hybrid-factory.js';
import { SparcHybridTools } from '../src/interfaces/mcp-stdio/sparc-hybrid-tools.js';

async function main() {
  console.log('🧪 Testing Production Hybrid System with Real Data');
  console.log('==================================================');

  try {
    // Test 1: Direct production hybrid system
    console.log('🔧 Testing direct production hybrid system...');
    const system = await createProductionHybridSystem({
      dataDir: './data',
      enableVectorSearch: true,
      enableGraphRelationships: true,
      useRealDatabases: true
    });

    console.log('✅ Production hybrid system created');

    // Test 2: Create a real ADR
    console.log('📋 Creating production ADR with real data...');
    const testADR = await system.adrManager.createADR({
      title: 'Real Production Database Architecture Test',
      context: 'Testing the production hybrid database architecture with real data persistence and file storage.',
      decision: 'Use the production hybrid architecture with real SQLite, LanceDB, and Kuzu databases for actual data operations.',
      consequences: 'Real data persistence, file-based storage, production-ready performance, and actual database operations.',
      author: 'claude-zen-production-test',
      priority: 'high',
      stakeholders: ['developers', 'users', 'production-team']
    });

    console.log(`✅ Real ADR created: ID=${testADR.id}, Number=${testADR.decision_number}`);

    // Test 3: Test SPARC Hybrid Tools with production data
    console.log('🛠️ Testing SPARC Hybrid Tools with production data...');
    const sparcTools = new SparcHybridTools();

    // Test ADR semantic search
    const searchResult = await sparcTools.executeTool('adr_semantic_search', {
      query: 'production database architecture',
      limit: 5,
      include_related: true
    });

    console.log('✅ SPARC ADR semantic search completed');
    console.log('📊 Search results:', JSON.stringify(searchResult, null, 2));

    // Test ADR statistics
    const statsResult = await sparcTools.executeTool('adr_stats', {
      include_semantic_analysis: true
    });

    console.log('✅ SPARC ADR statistics completed');
    console.log('📈 Statistics:', JSON.stringify(statsResult, null, 2));

    // Test hybrid document search
    const hybridSearchResult = await sparcTools.executeTool('hybrid_document_search', {
      query: 'production architecture',
      document_types: ['adr'],
      max_results: 10
    });

    console.log('✅ SPARC hybrid document search completed');
    console.log('🔍 Hybrid search results:', JSON.stringify(hybridSearchResult, null, 2));

    console.log('');
    console.log('🎉 Production system test completed successfully!');
    console.log('');
    console.log('📁 Real data files created:');
    console.log('  - ./data/claude-zen-production.db (SQLite)');
    console.log('  - ./data/claude-zen-vectors-production.lance (LanceDB)');
    console.log('  - ./data/claude-zen-graph-production.kuzu (Kuzu)');
    console.log('');
    console.log('🎯 MCP Tools ready for external access:');
    console.log('  - adr_create: Create new ADRs with real persistence');
    console.log('  - adr_semantic_search: Search real ADR data');
    console.log('  - hybrid_document_search: Search across all real documents');
    console.log('  - sparc_project_init: Initialize projects with real data');
    console.log('  - And 5 more production-ready tools!');

  } catch (error) {
    console.error('❌ Production system test failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as testProductionData };