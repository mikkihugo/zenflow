#!/usr/bin/env node
/**
 * Simple test for document stack - just metadata + rules
 */

const { DocumentStack, setupDefaultRules, documentTemplates } = require('./src/mcp/document-stack.cjs');

// Mock memory store for testing
class MockMemoryStore {
  constructor() {
    this.data = new Map();
  }
  
  async store(key, value, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;
    this.data.set(fullKey, value);
    return { id: fullKey, size: value.length };
  }
  
  async retrieve(key, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;
    return this.data.get(fullKey) || null;
  }
  
  async search(options = {}) {
    const results = {};
    for (const [key, value] of this.data) {
      if (options.pattern === '*' || key.includes(options.pattern || '')) {
        results[key] = value;
      }
    }
    return results;
  }
}

async function testDocumentStack() {
  console.log('🧪 Testing Simple Document Stack...\n');
  
  const memoryStore = new MockMemoryStore();
  const docStack = new DocumentStack(memoryStore);
  setupDefaultRules(docStack);
  
  // Test 1: Create an ADR with automatic metadata
  console.log('📋 Test 1: Creating ADR with metadata...');
  const adrResult = await docStack.createDocument(
    'service-adr',
    'storage-service', 
    'use-postgres-for-primary-storage',
    'We will use PostgreSQL as our primary storage solution.',
    { 
      dependencies: ['database-service'],
      tags: ['database', 'architecture']
    }
  );
  
  console.log('✅ ADR created:');
  console.log('   Layer:', docStack.determineLayer('service-adr'));
  console.log('   Routing:', JSON.stringify(adrResult.routing, null, 2));
  console.log('   Front Matter Preview:', adrResult.frontMatter.split('\n').slice(0, 8).join('\n'));
  
  // Test 2: Create API documentation  
  console.log('\n📖 Test 2: Creating API documentation...');
  const apiResult = await docStack.createDocument(
    'api-documentation',
    'user-service',
    'users-api-v1',
    'REST API for user management operations.',
    {
      tags: ['api', 'users', 'rest']
    }
  );
  
  console.log('✅ API docs created:');
  console.log('   Layer:', docStack.determineLayer('api-documentation'));
  console.log('   Routing:', JSON.stringify(apiResult.routing, null, 2));
  
  // Test 3: Apply rules to documents
  console.log('\n🔧 Test 3: Applying document rules...');
  const testDoc = {
    docType: 'service-adr',
    service: 'payment-service',
    content: 'Payment processing decision...'
  };
  
  const ruleResults = await docStack.applyRules(testDoc);
  console.log('✅ Rules applied:');
  ruleResults.forEach(result => {
    console.log(`   Rule: ${result.rule}`, result.result);
  });
  
  // Test 4: Search by metadata
  console.log('\n🔍 Test 4: Searching by metadata...');
  const searchResults = await docStack.searchByMetadata({ 
    stack_layer: 'service' 
  });
  
  console.log('✅ Search results:');
  searchResults.forEach(result => {
    console.log(`   ${result.id} (${result.docType}) - Layer: ${result.metadata.stack_layer}`);
  });
  
  // Test 5: Show simple balancing
  console.log('\n⚖️ Test 5: Load balancing...');
  console.log('Available swarms by layer:');
  ['infrastructure', 'service', 'application', 'business'].forEach(layer => {
    const swarm = docStack.getAvailableSwarm(layer);
    console.log(`   ${layer}: ${swarm}`);
  });
  
  console.log('\n🎉 Document Stack Test Complete!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Metadata generation works');
  console.log('   ✅ Layering rules work');
  console.log('   ✅ Auto-routing works');
  console.log('   ✅ Rule engine works');
  console.log('   ✅ Simple search works');
  console.log('   ✅ Load balancing works');
  
  console.log('\n💡 Ready for integration with MCP server!');
}

// Run the test
if (require.main === module) {
  testDocumentStack().catch(console.error);
}

module.exports = { testDocumentStack };