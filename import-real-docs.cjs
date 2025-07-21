#!/usr/bin/env node
/**
 * Import REAL Singularity Engine documentation into Document Stack
 * These are actual project docs that Claude Desktop can access via MCP
 */

const fs = require('fs').promises;
const path = require('path');
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// Mock memory store that we can verify
class VerifiableMemoryStore {
  constructor() { 
    this.data = new Map(); 
    this.documentList = [];
  }
  
  async store(key, value, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;
    this.data.set(fullKey, value);
    
    const docData = JSON.parse(value);
    this.documentList.push({
      key: fullKey,
      service: docData.metadata.service,
      type: docData.metadata.type,
      layer: docData.metadata.stack_layer,
      title: docData.metadata.title || docData.id,
      size: Math.round(value.length / 1024) + 'KB'
    });
    
    console.log(`📁 Stored: ${fullKey} (${Math.round(value.length / 1024)}KB)`);
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
  
  getStoredDocs() { return this.documentList; }
}

const memoryStore = new VerifiableMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Real Singularity Engine documents to import
const realDocs = [
  {
    file: '/home/mhugo/code/singularity-engine/docs/SYSTEM_ARCHITECTURE.md',
    docType: 'service-adr',
    service: 'platform-architecture',
    docId: 'singularity-engine-system-architecture'
  },
  {
    file: '/home/mhugo/code/singularity-engine/docs/README.md', 
    docType: 'user-guide',
    service: 'platform-docs',
    docId: 'singularity-engine-overview'
  },
  {
    file: '/home/mhugo/code/singularity-engine/docs/NATS_COMPREHENSIVE_GUIDE.md',
    docType: 'deployment-guide',
    service: 'messaging-infrastructure',
    docId: 'nats-comprehensive-guide'
  },
  {
    file: '/home/mhugo/code/singularity-engine/docs/MCP_TO_SERVICES_MIGRATION_PLAN.md',
    docType: 'service-adr', 
    service: 'mcp-services',
    docId: 'mcp-to-services-migration'
  },
  {
    file: '/home/mhugo/code/singularity-engine/docs/SERVICE_DOCUMENTATION.md',
    docType: 'api-documentation',
    service: 'platform-services',
    docId: 'service-documentation-standards'
  }
];

async function importRealDocs() {
  console.log('🚀 Importing REAL Singularity Engine Documentation...\n');
  
  let successCount = 0;
  
  for (const docInfo of realDocs) {
    try {
      console.log(`📖 Reading: ${path.basename(docInfo.file)}`);
      
      // Check if file exists
      try {
        await fs.access(docInfo.file);
      } catch (error) {
        console.log(`⚠️  File not found: ${docInfo.file}`);
        continue;
      }
      
      const content = await fs.readFile(docInfo.file, 'utf-8');
      
      // Extract real metadata from content
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : docInfo.docId;
      
      // Smart tag extraction from real content
      const tags = [];
      const lowerContent = content.toLowerCase();
      
      // Architecture tags
      if (lowerContent.includes('microservice') || lowerContent.includes('service')) tags.push('microservices');
      if (lowerContent.includes('architecture') || lowerContent.includes('design')) tags.push('architecture');
      if (lowerContent.includes('domain')) tags.push('domain-driven-design');
      
      // Technology tags  
      if (lowerContent.includes('nats')) tags.push('nats', 'messaging');
      if (lowerContent.includes('postgresql') || lowerContent.includes('postgres')) tags.push('postgresql', 'database');
      if (lowerContent.includes('redis')) tags.push('redis', 'cache');
      if (lowerContent.includes('kubernetes') || lowerContent.includes('k8s')) tags.push('kubernetes');
      if (lowerContent.includes('docker')) tags.push('docker');
      
      // Functional tags
      if (lowerContent.includes('api') || lowerContent.includes('rest')) tags.push('api');
      if (lowerContent.includes('auth') || lowerContent.includes('jwt')) tags.push('authentication');
      if (lowerContent.includes('deploy') || lowerContent.includes('infrastructure')) tags.push('deployment');
      if (lowerContent.includes('monitor') || lowerContent.includes('observability')) tags.push('monitoring');
      if (lowerContent.includes('agent') || lowerContent.includes('ai')) tags.push('ai-agents');
      if (lowerContent.includes('mcp')) tags.push('mcp', 'model-context-protocol');
      
      // Smart dependency detection
      const dependencies = [];
      if (lowerContent.includes('postgresql')) dependencies.push('postgresql-database');
      if (lowerContent.includes('nats')) dependencies.push('nats-messaging');
      if (lowerContent.includes('redis')) dependencies.push('redis-cache');
      if (lowerContent.includes('auth-service')) dependencies.push('auth-service');
      if (lowerContent.includes('agent-management')) dependencies.push('agent-management-service');
      if (lowerContent.includes('memory-service')) dependencies.push('memory-service');
      if (lowerContent.includes('infrastructure-service')) dependencies.push('infrastructure-service');
      
      await docStack.createDocument(
        docInfo.docType,
        docInfo.service,
        docInfo.docId,
        content,
        {
          title,
          tags,
          dependencies,
          source: 'singularity-engine-docs',
          original_path: docInfo.file,
          file_size: content.length,
          word_count: content.split(/\s+/).length
        }
      );
      
      successCount++;
      
    } catch (error) {
      console.log(`❌ Failed to import ${path.basename(docInfo.file)}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Successfully imported ${successCount} real documents!`);
  
  // Show verification
  const storedDocs = memoryStore.getStoredDocs();
  console.log('\n📊 Document Stack Contents:');
  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ Service                    │ Type           │ Layer      │ Size │ Title     │');
  console.log('├─────────────────────────────────────────────────────────────────────────────┤');
  
  storedDocs.forEach(doc => {
    const service = doc.service.substring(0, 26).padEnd(26);
    const type = doc.type.substring(0, 14).padEnd(14);
    const layer = doc.layer.substring(0, 10).padEnd(10);
    const size = doc.size.padEnd(6);
    const title = doc.title.substring(0, 20);
    console.log(`│ ${service} │ ${type} │ ${layer} │ ${size} │ ${title}... │`);
  });
  
  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
  
  console.log('\n🔍 Claude Desktop MCP Access Examples:');
  console.log('Now you can ask Claude Desktop things like:');
  console.log('');
  console.log('• "Show me the Singularity Engine system architecture"');
  console.log('• "What is the NATS messaging infrastructure setup?"');
  console.log('• "Get the MCP to services migration plan"');
  console.log('• "List all platform architecture documents"');
  console.log('• "Review the service documentation standards"');
  console.log('');
  
  console.log('📋 MCP Tool Usage in Claude Desktop:');
  console.log('```json');
  console.log('{');
  console.log('  "tool": "service_document_manager",');
  console.log('  "args": {');
  console.log('    "action": "list",');
  console.log('    "service": "platform-architecture"');
  console.log('  }');
  console.log('}');
  console.log('```');
  
  console.log('\n💾 Storage Summary:');
  console.log(`   • Total documents: ${storedDocs.length}`);
  console.log(`   • Total storage: ${storedDocs.reduce((sum, doc) => sum + parseInt(doc.size), 0)}KB`);
  console.log(`   • Services covered: ${new Set(storedDocs.map(d => d.service)).size}`);
  console.log(`   • Document types: ${new Set(storedDocs.map(d => d.type)).size}`);
  
  // Test retrieval
  console.log('\n🧪 Testing document retrieval...');
  const testDoc = await memoryStore.retrieve(
    'service-adr/singularity-engine-system-architecture',
    { namespace: 'service-documents/platform-architecture' }
  );
  
  if (testDoc) {
    const parsed = JSON.parse(testDoc);
    console.log(`✅ Test retrieval successful: ${parsed.metadata.title}`);
    console.log(`   Content preview: ${parsed.content.substring(0, 100)}...`);
  } else {
    console.log('❌ Test retrieval failed');
  }
  
  console.log('\n🎯 Ready for Claude Desktop access via MCP!');
}

importRealDocs().catch(console.error);