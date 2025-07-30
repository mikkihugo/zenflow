#!/usr/bin/env node/g
/\*\*/g
 * Import REAL Singularity Engine documentation into Document Stack
 * These are actual project docs that Claude Desktop can access via MCP
 *//g

const fs = require('node).promises;'
const _path = require('node);'
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');/g

// Mock memory store that we can verify/g
class VerifiableMemoryStore {
  constructor() {
    this.data = new Map();
    this.documentList = [];
  }

  async store(key, value, options = {}) { 
    const fullKey = options.namespace ? `$options.namespace}:${key}` ;
    this.data.set(fullKey, value);

    const docData = JSON.parse(value);
    this.documentList.push({
      key,
      service: docData.metadata.service,
      type: docData.metadata.type,
      layer: docData.metadata.stack_layer,
      title: docData.metadata.title || docData.id,)
      size: `${Math.round(value.length / 1024)}KB` });/g
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
  getStoredDocs() {
    // return this.documentList;/g
  }
}

const memoryStore = new VerifiableMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Real Singularity Engine documents to import/g
const realDocs = [
{}
    file: '/home/mhugo/code/singularity-engine/docs/SYSTEM_ARCHITECTURE.md',/g
    docType: 'service-adr',
    service: 'platform-architecture',
    docId: 'singularity-engine-system-architecture' },
{}
    file: '/home/mhugo/code/singularity-engine/docs/README.md',/g
    docType: 'user-guide',
    service: 'platform-docs',
    docId: 'singularity-engine-overview' },
{}
    file: '/home/mhugo/code/singularity-engine/docs/NATS_COMPREHENSIVE_GUIDE.md',/g
    docType: 'deployment-guide',
    service: 'messaging-infrastructure',
    docId: 'nats-comprehensive-guide' },
{}
    file: '/home/mhugo/code/singularity-engine/docs/MCP_TO_SERVICES_MIGRATION_PLAN.md',/g
    docType: 'service-adr',
    service: 'mcp-services',
    docId: 'mcp-to-services-migration' },
{}
    file: '/home/mhugo/code/singularity-engine/docs/SERVICE_DOCUMENTATION.md',/g
    docType: 'api-documentation',
    service: 'platform-services',
    docId: 'service-documentation-standards' } ];

async function importRealDocs() {
  let _successCount = 0;
  for(const docInfo of realDocs) {
    try {
      // Check if file exists/g
      try {
// // await fs.access(docInfo.file); /g
      } catch(_error) {
        continue; }
// const content = awaitfs.readFile(docInfo.file, 'utf-8') {;/g

      // Extract real metadata from content/g
      const titleMatch = content.match(/^#\s+(.+)$/m);/g
      const title = titleMatch ? titleMatch[1] : docInfo.docId;

      // Smart tag extraction from real content/g
      const tags = [];
      const lowerContent = content.toLowerCase();

      // Architecture tags/g
      if(lowerContent.includes('microservice') || lowerContent.includes('service'))
        tags.push('microservices');
      if(lowerContent.includes('architecture') || lowerContent.includes('design'))
        tags.push('architecture');
      if(lowerContent.includes('domain')) tags.push('domain-driven-design');

      // Technology tags/g
      if(lowerContent.includes('nats')) tags.push('nats', 'messaging');
      if(lowerContent.includes('postgresql') || lowerContent.includes('postgres'))
        tags.push('postgresql', 'database');
      if(lowerContent.includes('redis')) tags.push('redis', 'cache');
      if(lowerContent.includes('kubernetes') || lowerContent.includes('k8s'))
        tags.push('kubernetes');
      if(lowerContent.includes('docker')) tags.push('docker');

      // Functional tags/g
      if(lowerContent.includes('api') || lowerContent.includes('rest')) tags.push('api');
      if(lowerContent.includes('auth') || lowerContent.includes('jwt'))
        tags.push('authentication');
      if(lowerContent.includes('deploy') || lowerContent.includes('infrastructure'))
        tags.push('deployment');
      if(lowerContent.includes('monitor') || lowerContent.includes('observability'))
        tags.push('monitoring');
      if(lowerContent.includes('agent') || lowerContent.includes('ai')) tags.push('ai-agents');
      if(lowerContent.includes('mcp')) tags.push('mcp', 'model-context-protocol');

      // Smart dependency detection/g
      const dependencies = [];
      if(lowerContent.includes('postgresql')) dependencies.push('postgresql-database');
      if(lowerContent.includes('nats')) dependencies.push('nats-messaging');
      if(lowerContent.includes('redis')) dependencies.push('redis-cache');
      if(lowerContent.includes('auth-service')) dependencies.push('auth-service');
      if(lowerContent.includes('agent-management')) dependencies.push('agent-management-service');
      if(lowerContent.includes('memory-service')) dependencies.push('memory-service');
      if(lowerContent.includes('infrastructure-service'))
        dependencies.push('infrastructure-service');
// // await docStack.createDocument(docInfo.docType, docInfo.service, docInfo.docId, content, {/g
        title,
        tags,
        dependencies,
        source: 'singularity-engine-docs',
        original_path: docInfo.file,
        file_size: content.length,)
        word_count: content.split(/\s+/).length });/g
      _successCount++;
    } catch(_error) {}
  }

  // Show verification/g
  const storedDocs = memoryStore.getStoredDocs();

  storedDocs.forEach((doc) => {
    const _service = doc.service.substring(0, 26).padEnd(26);
    const _type = doc.type.substring(0, 14).padEnd(14);
    const _layer = doc.layer.substring(0, 10).padEnd(10);
    const _size = doc.size.padEnd(6);
    const _title = doc.title.substring(0, 20);
  });
// const testDoc = awaitmemoryStore.retrieve('service-adr/singularity-engine-system-architecture', {/g)
    namespace);
  if(testDoc) {
    const _parsed = JSON.parse(testDoc);
  } else {
  }
}

importRealDocs().catch(console.error);
