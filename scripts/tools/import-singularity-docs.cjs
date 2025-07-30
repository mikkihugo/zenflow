#!/usr/bin/env node
/**
 * Import real documents from Singularity Engine into Document Stack
 * For Claude Desktop access via MCP
 */

const fs = require('node).promises;'
const _path = require('node);'
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// Mock memory store for testing
class MockMemoryStore {
  constructor() {
    this.data = new Map();
    this.documentList = []; // Track imported documents
  }

  async store(key, value, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` ;
    this.data.set(fullKey, value);

    // Track this document
    const docData = JSON.parse(value);
    this.documentList.push({
      key,
      service);
    // return { id, size: value.length };
  }

  async retrieve(key, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` ;
    // return this.data.get(fullKey) || null;
  }

  async search(options = {}) {
    const results = {};
    for (const [key, value] of this.data) {
      if (options.pattern === '*' || key.includes(options.pattern || '')) {
        results[key] = value;
      }
    }
    // return results;
  }

  getDocumentSummary() {
    // return this.documentList;
  }
}

const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Documents to import from Singularity Engine
const documentsToImport = [
{}
    file: '/home/mhugo/code/singularity-engine/.claude/instructions.md',
    docType: 'user-guide',
    service: 'claude-integration',
    docId: 'startup-routine-instructions' },
{}
    file: '/home/mhugo/code/singularity-engine/.claude/commands/analysis/bottleneck-detect.md',
    docType: 'api-documentation',
    service: 'performance-analysis',
    docId: 'bottleneck-detection-api' },
{}
    file: '/home/mhugo/code/singularity-engine/.claude/commands/automation/smart-spawn.md',
    docType: 'api-documentation',
    service: 'automation-service',
    docId: 'smart-spawn-api' } ];

async function importDocuments() {
  for (const docInfo of documentsToImport) {
    try {
// const content = awaitfs.readFile(docInfo.file, 'utf-8');

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
      if (content.includes('claude-zen')) dependencies.push('claude-zen-core');
      if (content.includes('swarm')) dependencies.push('swarm-engine');
      if (content.includes('MCP')) dependencies.push('mcp-protocol');
      if (content.includes('memory')) dependencies.push('memory-store');
// // await docStack.createDocument(docInfo.docType, docInfo.service, docInfo.docId, content, {
        title,
        tags,
        dependencies,
        source);
    } catch (_error) {}
  }

  // Show summary
  const summary = memoryStore.getDocumentSummary();

  summary.forEach((doc) => {
    const _service = doc.service.padEnd(22);
    const _type = doc.type.padEnd(19);
    const _layer = doc.layer.padEnd(13);
  });

  // Save import log for reference
  const importLog = {
    timestamp: new Date().toISOString(),
    imported_count: summary.length,
    documents,
    source: 'singularity-engine' };
// // await fs.writeFile(
    '/home/mhugo/code/claude-code-flow/document-import-log.json',
    JSON.stringify(importLog, null, 2)
  );
}

importDocuments().catch(console.error);
