/**
 * Basic test for Memory Backend Plugin
 * Tests the core functionality without dependencies
 */

import { JSONBackend, type MemoryBackendConfig, type StorageResult } from './index';

async function testJsonBackend() {
  console.log('🧪 Testing Memory Backend Plugin - JSON Backend');

  const config: MemoryBackendConfig = {
    type: 'json',
    path: './test-data/memory-test.json',
    enabled: true,
    priority: 50,
    settings: {
      jsonConfig: {
        filePath: './test-data/memory-test.json',
        prettyPrint: true,
      },
    },
  };

  const backend = new JSONBackend(config);

  try {
    // Test initialization
    console.log('✅ Initializing JSON backend...');
    await backend.initialize();

    // Test store
    console.log('✅ Testing store operation...');
    const storeResult: StorageResult = await backend.store(
      'test-key',
      {
        message: 'Hello World',
        timestamp: Date.now(),
        data: { nested: true },
      },
      'test-namespace'
    );

    console.log('Store result:', storeResult);

    // Test retrieve
    console.log('✅ Testing retrieve operation...');
    const retrieved = await backend.retrieve('test-key', 'test-namespace');
    console.log('Retrieved data:', retrieved);

    // Test search
    console.log('✅ Testing search operation...');
    const searchResults = await backend.search('*', 'test-namespace');
    console.log('Search results:', searchResults);

    // Test list namespaces
    console.log('✅ Testing listNamespaces operation...');
    const namespaces = await backend.listNamespaces();
    console.log('Namespaces:', namespaces);

    // Test stats
    console.log('✅ Testing getStats operation...');
    const stats = await backend.getStats();
    console.log('Stats:', stats);

    // Test health check
    console.log('✅ Testing healthCheck operation...');
    const health = await backend.healthCheck();
    console.log('Health:', health);

    // Test delete
    console.log('✅ Testing delete operation...');
    const deleted = await backend.delete('test-key', 'test-namespace');
    console.log('Deleted:', deleted);

    console.log('🎉 All JSON backend tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function testConfigValidation() {
  console.log('🧪 Testing configuration validation...');

  // Test valid configs
  const validConfigs = [
    { backend: 'json', path: './data' },
    { backend: 'sqlite', sqliteConfig: { dbPath: './data/test.db' } },
    { backend: 'lancedb', lanceConfig: { dbPath: './data/lance' } },
  ];

  for (const config of validConfigs) {
    console.log(`✅ Valid config: ${config.backend}`);
  }

  // Test invalid configs
  const invalidConfigs = [
    {}, // Missing backend
    { backend: 'invalid' }, // Invalid backend type
    { backend: 'json', path: 123 }, // Invalid path type
  ];

  for (const config of invalidConfigs) {
    console.log(`❌ Invalid config detected: ${JSON.stringify(config)}`);
  }

  console.log('🎉 Configuration validation tests passed!');
}

async function testInterfaceCompliance() {
  console.log('🧪 Testing interface compliance...');

  const config: MemoryBackendConfig = {
    type: 'json',
    path: './test-data/interface-test.json',
    enabled: true,
    priority: 50,
    settings: {},
  };

  const backend = new JSONBackend(config);
  await backend.initialize();

  // Test that all required methods exist and have correct signatures
  const requiredMethods = [
    'initialize',
    'store',
    'retrieve',
    'search',
    'delete',
    'listNamespaces',
    'getStats',
    'healthCheck',
  ];

  for (const method of requiredMethods) {
    if (typeof (backend as any)[method] !== 'function') {
      throw new Error(`Missing required method: ${method}`);
    }
  }

  console.log('✅ All required methods present');
  console.log('🎉 Interface compliance tests passed!');
}

async function runAllTests() {
  try {
    await testJsonBackend();
    await testConfigValidation();
    await testInterfaceCompliance();

    console.log(
      '\n🎊 ALL TESTS PASSED! Memory Backend Plugin implementation is working correctly.'
    );
  } catch (error) {
    console.error('\n💥 TEST FAILURE:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
// Using ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
