#!/usr/bin/env node

/**
 * Debug Kuzu Query Signature
 *
 * Figure out the exact signature Kuzu expects
 */

import { Database, Connection } from 'kuzu';

async function main() {
  console.log('🔍 Debugging Kuzu Query Signature');
  console.log('=================================');

  try {
    const database = new Database('./data/kuzu/debug-signature.kuzu');
    const connection = new Connection(database);

    console.log('✅ Database and connection created');

    // Test different query signatures
    console.log('\n🧪 Testing different query signatures...');

    try {
      console.log('1. Testing: query(statement, callback)');
      const result1 = await connection.query('RETURN 1', () => {});
      console.log('✅ Works: query(statement, callback)');
    } catch (e) {
      console.log('❌ Failed: query(statement, callback) -', e.message);
    }

    try {
      console.log('2. Testing: query(statement, params, callback)');
      const result2 = await connection.query('RETURN 1', [], () => {});
      console.log('✅ Works: query(statement, params, callback)');
    } catch (e) {
      console.log('❌ Failed: query(statement, params, callback) -', e.message);
    }

    try {
      console.log('3. Testing: query(statement) - no callback');
      const result3 = await connection.query('RETURN 1');
      console.log('✅ Works: query(statement) - no callback');
    } catch (e) {
      console.log('❌ Failed: query(statement) - no callback -', e.message);
    }

    connection.close();
    database.close();
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

main();
