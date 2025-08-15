#!/usr/bin/env node

/**
 * Test Real Database Adapters
 *
 * Direct test of the real SQLite, LanceDB, and Kuzu adapters
 * without any mocks or DAL factory dependencies.
 */

import { createLogger } from '../src/core/logger.js';
import { SQLiteAdapter } from '../src/database/adapters/sqlite-adapter.js';
import { LanceDBAdapter } from '../src/database/adapters/lancedb-adapter.js';
import { KuzuAdapter } from '../src/database/adapters/kuzu-adapter.js';

const logger = createLogger('test-real-adapters');

async function main() {
  console.log('🧪 Testing Real Database Adapters');
  console.log('=================================');

  try {
    // Test 1: Real SQLite Adapter
    console.log('🗃️ Testing Real SQLite Adapter...');
    const sqliteAdapter = new SQLiteAdapter({
      type: 'sqlite',
      database: './data/sqlite/test-real-sqlite.db',
      options: {
        readonly: false,
        fileMustExist: false,
        timeout: 5000,
      },
    });

    await sqliteAdapter.connect();
    console.log('✅ SQLite connected successfully');

    // Test SQLite operations
    const createResult = await sqliteAdapter.execute(
      'CREATE TABLE IF NOT EXISTS test_docs (id TEXT PRIMARY KEY, title TEXT, content TEXT)'
    );
    console.log('✅ SQLite table created:', createResult);

    const insertResult = await sqliteAdapter.execute(
      'INSERT INTO test_docs (id, title, content) VALUES (?, ?, ?)',
      [
        'doc-1',
        'Test Document',
        'This is a test document with real SQLite storage.',
      ]
    );
    console.log('✅ SQLite insert successful:', insertResult);

    const queryResult = await sqliteAdapter.query(
      'SELECT * FROM test_docs WHERE id = ?',
      ['doc-1']
    );
    console.log('✅ SQLite query result:', queryResult);

    await sqliteAdapter.disconnect();
    console.log('✅ SQLite disconnected successfully');

    // Test 2: Real LanceDB Adapter
    console.log('\n🚀 Testing Real LanceDB Adapter...');
    const lancedbAdapter = new LanceDBAdapter({
      type: 'lancedb',
      database: './data/lancedb/test-real-vectors.lance',
      options: {
        vectorSize: 384,
        metricType: 'cosine',
        createIfNotExists: true,
      },
    });

    await lancedbAdapter.connect();
    console.log('✅ LanceDB connected successfully');

    // Test LanceDB vector operations
    const testVectors = [
      {
        id: 'vec-1',
        vector: new Array(384).fill(0).map(() => Math.random()),
        text: 'This is a test document for vector similarity.',
        metadata: { type: 'test', category: 'sample' },
      },
      {
        id: 'vec-2',
        vector: new Array(384).fill(0).map(() => Math.random()),
        text: 'Another test document with different content.',
        metadata: { type: 'test', category: 'example' },
      },
    ];

    await lancedbAdapter.insertVectors('documents', testVectors);
    console.log('✅ LanceDB vectors inserted successfully');

    const queryVector = new Array(384).fill(0).map(() => Math.random());
    const searchResults = await lancedbAdapter.searchVectors(
      'documents',
      queryVector,
      { limit: 2 }
    );
    console.log(
      '✅ LanceDB vector search results:',
      searchResults.length,
      'results found'
    );

    const vectorCount = await lancedbAdapter.countVectors('documents');
    console.log('✅ LanceDB vector count:', vectorCount);

    await lancedbAdapter.disconnect();
    console.log('✅ LanceDB disconnected successfully');

    // Test 3: Real Kuzu Adapter
    console.log('\n🕸️ Testing Real Kuzu Adapter...');
    const kuzuAdapter = new KuzuAdapter({
      type: 'kuzu',
      database: './data/kuzu/test-real-graph.kuzu',
      options: {
        bufferPoolSize: '1GB',
        maxNumThreads: 4,
        createIfNotExists: true,
      },
    });

    await kuzuAdapter.connect();
    console.log('✅ Kuzu connected successfully');

    // Test Kuzu graph operations
    const nodeId1 = await kuzuAdapter.createNode('Document', {
      id: 'doc-graph-1',
      title: 'Graph Document 1',
      type: 'adr',
      content: 'This is a test architecture decision record.',
      status: 'active',
      author: 'test-system',
    });
    console.log('✅ Kuzu node 1 created:', nodeId1);

    const nodeId2 = await kuzuAdapter.createNode('Document', {
      id: 'doc-graph-2',
      title: 'Graph Document 2',
      type: 'prd',
      content: 'This is a test product requirements document.',
      status: 'active',
      author: 'test-system',
    });
    console.log('✅ Kuzu node 2 created:', nodeId2);

    const relationshipId = await kuzuAdapter.createRelationship(
      nodeId1,
      nodeId2,
      'RELATES_TO',
      { strength: 0.85, relationship_type: 'supports' }
    );
    console.log('✅ Kuzu relationship created:', relationshipId);

    const nodes = await kuzuAdapter.findNodes(
      'Document',
      { type: 'adr' },
      { limit: 10 }
    );
    console.log('✅ Kuzu nodes found:', nodes.length);

    const relationships = await kuzuAdapter.findRelationships(
      nodeId1,
      undefined,
      'RELATES_TO'
    );
    console.log('✅ Kuzu relationships found:', relationships.length);

    const graphStats = await kuzuAdapter.getGraphStats();
    console.log('✅ Kuzu graph stats:', graphStats);

    await kuzuAdapter.disconnect();
    console.log('✅ Kuzu disconnected successfully');

    console.log('\n🎉 All Real Database Adapters Test Successfully!');
    console.log('');
    console.log('📁 Real data files created and tested:');
    console.log(
      '  - ./data/sqlite/test-real-sqlite.db (SQLite with real tables)'
    );
    console.log(
      '  - ./data/lancedb/test-real-vectors.lance (LanceDB with real vectors)'
    );
    console.log('  - ./data/kuzu/test-real-graph.kuzu (Kuzu with real graph)');
    console.log('');
    console.log('🎯 Production adapters are ready for MCP server integration!');
  } catch (error) {
    console.error('❌ Real adapter test failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as testRealAdapters };
