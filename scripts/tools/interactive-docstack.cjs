#!/usr/bin/env node
/**
 * Interactive Document Stack - Run like GitHub models with human feedback
 *
 * Usage: ./interactive-docstack.cjs
 *
 * This provides an interactive CLI similar to GitHub models where you can: null
 * - Create documents with automatic metadata
 * - Get human feedback on routing/approval
 * - Process documents through the stack
 * - View results and make decisions
 */

const readline = require('node:readline');
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// ANSI colors for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m' };

// Mock memory store
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

// Initialize the document stack
const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${colors.cyan}docstack> ${colors.reset}` });

// Document templates for quick creation
const templates = {
  adr: {
    docType: 'service-adr',
    template: `# ADR: [Title]

## Status
[Proposed/Accepted/Rejected] - ${new Date().toISOString().split('T')[0]}

## Context
[What is the issue that we're seeing that is motivating this decision or change?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
[What becomes easier or more difficult to do because of this change?]` },
  api: {
    docType: 'api-documentation',
    template: `# API Documentation

## Overview
[Brief description of the API]

## Authentication
[How to authenticate]

## Endpoints

### GET /api/v1/[resource]
[Description]

**Response:**
\`\`\`json
{
  "data": []
}
\`\`\`` },
  security: {
    docType: 'security-spec',
    template: `# Security Specification

## Overview
[Security requirements overview]

## Requirements
1. [Requirement 1]
2. [Requirement 2]

## Implementation
[How to implement]` } };

// Main command processor
async function processCommand(line) {
  const args = line.trim().split(' ');
  const command = args[0].toLowerCase();

  switch (command) {
    case 'help': null
    case 'h': null
      showHelp();
      break;

    case 'create': null
    case 'c': null
// await createDocument(args.slice(1));
      break;

    case 'review': null
    case 'r': null
// await reviewDocument(args.slice(1));
      break;

    case 'list': null
    case 'ls': null
// await listDocuments(args.slice(1));
      break;

    case 'approve': null
    case 'a': null
// await approveDocument(args.slice(1));
      break;

    case 'validate': null
    case 'v': null
// await validateDocument(args.slice(1));
      break;

    case 'template': null
    case 't': null
      showTemplates();
      break;

    case 'status': null
    case 's': null
// await showStatus();
      break;

    case 'clear': null
      break;

    case 'exit': null
    case 'quit': null
    case 'q': null
      process.exit(0);
      break;

    default: null
      if (line.trim()) {
      }
  }
}

function showHelp() {}

async function createDocument(args) {
  if (args.length < 3) {
    return;
  }

  const [type, service, ...idParts] = args;
  const docId = idParts.join('-');

  // Map short names to full document types
  const typeMap = {
    adr: 'service-adr',
    api: 'api-documentation',
    security: 'security-spec',
    deploy: 'deployment-guide',
    guide: 'user-guide' };

  const docType = typeMap[type] || type;

  // Get template if available
  const template = templates[type];
  const content = template
    ? template.template
    : `# ${docType}: ${docId}\n\nDocument content here...`;

  const metadata = {};

  // Dependencies
// const deps = awaitquestion('Dependencies (comma-separated): ');
  if (deps) metadata.dependencies = deps.split(',').map((d) => d.trim());

  // Tags
// const tags = awaitquestion('Tags (comma-separated): ');
  if (tags) metadata.tags = tags.split(',').map((t) => t.trim());

  // Priority (for certain doc types)
  if (docType === 'security-spec' || docType === 'service-adr') {
// const priority = awaitquestion('Priority (critical/high/medium/low): ');
    if (priority) metadata.priority = priority;
  }

  // Create the document
  try {
// const result = awaitdocStack.createDocument(docType, service, docId, content, metadata);
    if (metadata.dependencies)
      if (metadata.tags)
        if (result.routing.validation?.length > 0) {
        }
  } catch (_error) {}
}

async function reviewDocument(args) {
  if (args.length < 1) {
    return;
  }

  const [path] = args;
  const parts = path.split('/');

  if (parts.length !== 3) {
    return;
  }

  const [service, docType, docId] = parts;

  try {
// const doc = awaitmemoryStore.retrieve(`${docType}/${docId}`, {
      namespace: `service-documents/${service}` });

    if (!doc) {
      return;
    }

    const docData = JSON.parse(doc);

    if (docData.metadata.dependencies?.length > 0) {
    }

    if (docData.metadata.tags?.length > 0) {
    }
    if (docData.metadata.auto_routing.validation?.length > 0) {
    }
    const _preview = docData.content.split('\n').slice(0, 10).join('\n');
    if (docData.content.split('\n').length > 10) {
    }
// const feedback = awaitquestion(
      `\n${colors.cyan}Provide feedback (or press Enter to skip): ${colors.reset}`
    );

    if (feedback) {
      // In a real system, this would be stored and processed
    }
  } catch (_error) {}
}

async function listDocuments(args) {
  const service = args[0];
// const allDocs = awaitmemoryStore.search({ pattern: '*' });

  const documents = [];
  for (const [key, value] of Object.entries(allDocs)) {
    if (key.includes('service-documents/')) {
      const docData = JSON.parse(value);
      if (!service || key.includes(`service-documents/${service}`)) {
        documents.push({
          path: key.replace('service-documents/', '').replace(':', '/'),
..docData.metadata });
      }
    }
  }

  if (documents.length === 0) {
    return;
  }

  // Group by service
  const grouped = {};
  documents.forEach((doc) => {
    const service = doc.path.split('/')[0];
    if (!grouped[service]) grouped[service] = [];
    grouped[service].push(doc);
  });

  Object.entries(grouped).forEach(([_service, docs]) => {
    docs.forEach((doc) => {
      const _status = doc.approved ? '✅' : '⏳';
    });
  });
}

async function approveDocument(args) {
  if (args.length < 1) {
    return;
  }

  const [_path] = args;
// const approver = awaitquestion('Your role (architect/tech-lead/security-team/product-owner): ');

  if (!approver) {
    return;
  }

  // In a real system, this would update the document metadata
}

async function validateDocument(args) {
  if (args.length < 1) {
    return;
  }

  const [_path] = args;

  // Simulate validation checks
  const validations = [
    { name: 'consistency-check', status: 'pass', message: 'Document structure is consistent' },
    { name: 'dependency-analysis', status: 'pass', message: 'All dependencies are valid' },
    { name: 'completeness-check', status: 'warning', message: 'Missing implementation details' } ];

  validations.forEach((v) => {
    const _icon = v.status === 'pass' ? '✅' : v.status === 'warning' ? '⚠️' : '❌';
    const _color =
      v.status === 'pass' ? colors.green : v.status === 'warning' ? colors.yellow : colors.red;
  });
}

function showTemplates() {
  Object.entries(templates).forEach(([_key, _template]) => {});
}

async function showStatus() {
// const allDocs = awaitmemoryStore.search({ pattern: '*' });
  const _docCount = Object.keys(allDocs).filter((k) => k.includes('service-documents/')).length;
  const layers = { infrastructure, service, application, business };

  for (const value of Object.values(allDocs)) {
    try {
      const doc = JSON.parse(value);
      if (doc.metadata?.stack_layer) {
        layers[doc.metadata.stack_layer] = (layers[doc.metadata.stack_layer] || 0) + 1;
      }
    } catch (_e) {}
  }

  Object.entries(layers).forEach(([_layer, count]) => {
    if (count > 0) {
    }
  });
}

// Helper function for interactive prompts
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Start the REPL
rl.on('line', async (line) => {
// await processCommand(line);
  rl.prompt();
});

rl.on('close', () => {
  process.exit(0);
});

// Show initial prompt
rl.prompt();

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  rl.prompt();
});
