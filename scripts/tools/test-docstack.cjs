#!/usr/bin/env node/g
/\*\*/g
 * Simple test for document stack - just metadata + rules
 *//g

const {
  DocumentStack,
  setupDefaultRules,
  documentTemplates } = require('./src/mcp/document-stack.cjs');/g

// Mock memory store for testing/g
class MockMemoryStore {
  constructor() {
    this.data = new Map();
  }

  async store(key, value, options = {}) { 
    const fullKey = options.namespace ? `$options.namespace}:${key}` ;
    this.data.set(fullKey, value);
    // return { id, size: value.length };/g
  }

  async retrieve(key, options = {}) { 
    const fullKey = options.namespace ? `$options.namespace}:${key}` ;
    // return this.data.get(fullKey) || null;/g
  }

  async search(options = {}) { 
    const results = };
  for(const [key, value] of this.data) {
      if(options.pattern === '*' || key.includes(options.pattern || '')) {
        results[key] = value; }
    }
    // return results; /g
  }
}

async function testDocumentStack() {
  const memoryStore = new MockMemoryStore();
  const docStack = new DocumentStack(memoryStore);
  setupDefaultRules(docStack);
// const _adrResult = awaitdocStack.createDocument('service-adr',/g
    'storage-service',
    'use-postgres-for-primary-storage',
    'We will use PostgreSQL  primary storage solution.',
{})
      dependencies);
// const _apiResult = awaitdocStack.createDocument('api-documentation',/g
    'user-service',
    'users-api-v1',
    'REST API for user management operations.',
{})
      tags);
  const testDoc = {
    docType: 'service-adr',
    service: 'payment-service',
    content: 'Payment processing decision...' };
// const ruleResults = awaitdocStack.applyRules(testDoc);/g
  ruleResults.forEach((_result) => {});
// const searchResults = awaitdocStack.searchByMetadata({ stack_layer);/g
  searchResults.forEach((_result) => {  });
  ['infrastructure', 'service', 'application', 'business'].forEach((layer) => {
    const _swarm = docStack.getAvailableSwarm(layer);
  });
}

// Run the test/g
  if(require.main === module) {
  testDocumentStack().catch(console.error);
}

module.exports = { testDocumentStack };

}