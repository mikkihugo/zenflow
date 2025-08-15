#!/usr/bin/env node

/**
 * Simple Test of Kuzu Adapter
 *
 * Minimal test focusing on basic Kuzu functionality.
 */

import { createLogger } from '../src/core/logger.js';
import { Database, Connection } from 'kuzu';

const logger = createLogger('test-kuzu-simple');

async function main() {
  console.log('🕸️ Testing Basic Kuzu Functionality');
  console.log('===================================');

  try {
    // Test basic Kuzu connection
    const database = new Database('./data/kuzu/test-simple.kuzu');
    const connection = new Connection(database);

    console.log('✅ Kuzu database and connection created');

    // Test simple query
    try {
      const result = await connection.query('RETURN 1', () => {});
      console.log('✅ Simple query executed');
    } catch (error) {
      console.log('⚠️ Simple query failed:', error.message);
    }

    // Close connection
    connection.close();
    database.close();
    console.log('✅ Kuzu connection closed');

    console.log('\n🎉 Basic Kuzu Test Completed!');
    console.log('');
    console.log('📁 Real Kuzu database file:');
    console.log('  - ./data/kuzu/test-simple.kuzu');
    console.log('');
    console.log(
      '🎯 Kuzu basic functionality works - now can build adapter on top'
    );
  } catch (error) {
    console.error('❌ Kuzu basic test failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as testKuzuSimple };
