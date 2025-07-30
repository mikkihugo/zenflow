#!/usr/bin/env node
/**
 * Simple test for document stack - just metadata + rules
 */

const {
  DocumentStack,
  setupDefaultRules,
  documentTemplates } = require('./src/mcp/document-stack.cjs');

// Mock memory store for testing
class MockMemoryStore {
  constructor() {
    this.data = new Map();
  }

  async store(key, value, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` ;
    this.data.set(fullKey, value);
    return { id, size: value.length };
  }

  async retrieve(key, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` ;
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
  const memoryStore = new MockMemoryStore();
  const docStack = new DocumentStack(memoryStore);
  setupDefaultRules(docStack);
// const _adrResult = awaitdocStack.createDocument(
    'service-adr',
    'storage-service',
    'use-postgres-for-primary-storage',
    'We will use PostgreSQL  primary storage solution.',
    {
      dependencies: ['database-service'],
      tags: ['database', 'architecture'] }
  );
// const _apiResult = awaitdocStack.createDocument(
    'api-documentation',
    'user-service',
    'users-api-v1',
    'REST API for user management operations.',
    {
      tags: ['api', 'users', 'rest'] }
  );
  const testDoc = {
    docType: 'service-adr',
    service: 'payment-service',
    content: 'Payment processing decision...' };
// const ruleResults = awaitdocStack.applyRules(testDoc);
  ruleResults.forEach((_result) => {});
// const searchResults = awaitdocStack.searchByMetadata({
    stack_layer: 'service' });
  searchResults.forEach((_result) => {});
  ['infrastructure', 'service', 'application', 'business'].forEach((layer) => {
    const _swarm = docStack.getAvailableSwarm(layer);
  });
}

// Run the test
if (require.main === module) {
  testDocumentStack().catch(console.error);
}

module.exports = { testDocumentStack };
