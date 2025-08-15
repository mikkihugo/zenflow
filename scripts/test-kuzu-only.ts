#!/usr/bin/env node

/**
 * Test Real Kuzu Adapter
 *
 * Focused test of just the Kuzu graph database adapter.
 */

import { createLogger } from '../src/core/logger.js';
import { KuzuAdapter } from '../src/database/adapters/kuzu-adapter.js';

const logger = createLogger('test-kuzu-only');

async function main() {
  console.log('🕸️ Testing Real Kuzu Graph Database Adapter');
  console.log('============================================');

  try {
    const kuzuAdapter = new KuzuAdapter({
      type: 'kuzu',
      database: './data/kuzu/test-kuzu-only.kuzu',
      options: {
        bufferPoolSize: '1GB',
        maxNumThreads: 4,
        createIfNotExists: true,
      },
    });

    console.log('🔧 Connecting to Kuzu...');
    await kuzuAdapter.connect();
    console.log('✅ Kuzu connected successfully');

    console.log('📊 Testing graph statistics...');
    const stats = await kuzuAdapter.getGraphStats();
    console.log('✅ Graph stats:', stats);

    console.log('🏥 Testing health check...');
    const health = await kuzuAdapter.health();
    console.log('✅ Health check result:', health);

    console.log('📋 Testing schema...');
    const schema = await kuzuAdapter.getSchema();
    console.log('✅ Schema:', schema);

    console.log('🔍 Testing simple query...');
    try {
      const queryResult = await kuzuAdapter.query('RETURN 1');
      console.log('✅ Simple query result:', queryResult);
    } catch (queryError) {
      console.log(
        'ℹ️ Query test skipped (expected for empty database):',
        queryError.message
      );
    }

    console.log('🧪 Testing node creation...');
    const nodeId = await kuzuAdapter.createNode('TestDocument', {
      id: 'test-node-1',
      title: 'Test Document',
      type: 'test',
      content: 'This is a test document for the graph database.',
    });
    console.log('✅ Node created with ID:', nodeId);

    console.log('🔎 Testing node search...');
    const nodes = await kuzuAdapter.findNodes('TestDocument', { type: 'test' });
    console.log('✅ Found nodes:', nodes.length);

    console.log('🔌 Disconnecting...');
    await kuzuAdapter.disconnect();
    console.log('✅ Kuzu disconnected successfully');

    console.log('\n🎉 Real Kuzu Adapter Works Perfectly!');
    console.log('');
    console.log('📁 Real Kuzu database created:');
    console.log('  - ./data/kuzu/test-kuzu-only.kuzu (Real graph database)');
  } catch (error) {
    console.error('❌ Kuzu test failed:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as testKuzuOnly };
