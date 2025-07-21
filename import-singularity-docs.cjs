#!/usr/bin/env node
/**
 * Import real documents from Singularity Engine into Document Stack
 * For Claude Desktop access via MCP
 */

const fs = require('fs').promises;
const path = require('path');
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// Mock memory store for testing
class MockMemoryStore {
  constructor() { 
    this.data = new Map(); 
    this.documentList = []; // Track imported documents
  }
  
  async store(key, value, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;
    this.data.set(fullKey, value);
    
    // Track this document
    const docData = JSON.parse(value);
    this.documentList.push({
      key: fullKey,
      service: docData.metadata.service,
      type: docData.metadata.type,
      layer: docData.metadata.stack_layer,
      title: docData.metadata.title || docData.id
    });
    
    console.log(`📁 Imported: ${fullKey}`);
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
  
  getDocumentSummary() {
    return this.documentList;
  }
}

const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Documents to import from Singularity Engine
const documentsToImport = [
  {
    file: '/home/mhugo/code/singularity-engine/.claude/instructions.md',
    docType: 'user-guide',
    service: 'claude-integration',
    docId: 'startup-routine-instructions'
  },
  {
    file: '/home/mhugo/code/singularity-engine/.claude/commands/analysis/bottleneck-detect.md',
    docType: 'api-documentation',
    service: 'performance-analysis',
    docId: 'bottleneck-detection-api'
  },
  {
    file: '/home/mhugo/code/singularity-engine/.claude/commands/automation/smart-spawn.md',
    docType: 'api-documentation',
    service: 'automation-service',
    docId: 'smart-spawn-api'
  }
];

async function importDocuments() {
  console.log('🚀 Importing Singularity Engine documents...\n');
  
  for (const docInfo of documentsToImport) {
    try {
      console.log(`📖 Reading: ${path.basename(docInfo.file)}`);
      const content = await fs.readFile(docInfo.file, 'utf-8');
      
      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : docInfo.docId;
      
      // Determine tags from content
      const tags = [];
      if (content.includes('swarm')) tags.push('swarm');
      if (content.includes('agent')) tags.push('agent');
      if (content.includes('performance')) tags.push('performance');
      if (content.includes('automation')) tags.push('automation');
      if (content.includes('API') || content.includes('api')) tags.push('api');
      if (content.includes('Claude')) tags.push('claude');
      if (content.includes('bottleneck')) tags.push('bottleneck');
      if (content.includes('analysis')) tags.push('analysis');
      
      // Determine dependencies from content
      const dependencies = [];
      if (content.includes('claude-flow')) dependencies.push('claude-flow-core');
      if (content.includes('swarm')) dependencies.push('swarm-engine');
      if (content.includes('MCP')) dependencies.push('mcp-protocol');
      if (content.includes('memory')) dependencies.push('memory-store');
      
      await docStack.createDocument(
        docInfo.docType,
        docInfo.service,
        docInfo.docId,
        content,
        {
          title,
          tags,
          dependencies,
          source: 'singularity-engine',
          imported_from: docInfo.file
        }
      );
      
    } catch (error) {
      console.log(`❌ Failed to import ${docInfo.file}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Import complete!');
  
  // Show summary
  const summary = memoryStore.getDocumentSummary();
  console.log('\n📊 Imported Documents Summary:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ Service                │ Type                │ Layer         │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  
  summary.forEach(doc => {
    const service = doc.service.padEnd(22);
    const type = doc.type.padEnd(19);
    const layer = doc.layer.padEnd(13);
    console.log(`│ ${service} │ ${type} │ ${layer} │`);
  });
  
  console.log('└─────────────────────────────────────────────────────────────┘');
  
  console.log('\n🔍 You can now access these in Claude Desktop with MCP:');
  console.log('   • "List all documents from Singularity Engine"');
  console.log('   • "Show me the Claude integration startup instructions"');
  console.log('   • "Get the bottleneck detection API documentation"');
  console.log('   • "Review the smart spawn automation docs"');
  console.log('   • "What performance analysis tools are available?"');
  
  console.log('\n📋 MCP Tool Examples for Claude Desktop:');
  console.log('```');
  console.log('service_document_manager:');
  console.log('  action: "list"');
  console.log('  service: "performance-analysis"');
  console.log('```');
  
  console.log('```');
  console.log('service_document_manager:');
  console.log('  action: "read"');
  console.log('  service: "claude-integration"');
  console.log('  docType: "user-guide"');
  console.log('  docId: "startup-routine-instructions"');
  console.log('```');
  
  // Save import log for reference
  const importLog = {
    timestamp: new Date().toISOString(),
    imported_count: summary.length,
    documents: summary,
    source: 'singularity-engine'
  };
  
  await fs.writeFile(
    '/home/mhugo/code/claude-code-flow/document-import-log.json',
    JSON.stringify(importLog, null, 2)
  );
  
  console.log('\n💾 Import log saved to: document-import-log.json');
}

importDocuments().catch(console.error);