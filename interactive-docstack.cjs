#!/usr/bin/env node
/**
 * Interactive Document Stack - Run like GitHub models with human feedback
 * 
 * Usage: ./interactive-docstack.cjs
 * 
 * This provides an interactive CLI similar to GitHub models where you can:
 * - Create documents with automatic metadata
 * - Get human feedback on routing/approval
 * - Process documents through the stack
 * - View results and make decisions
 */

const readline = require('readline');
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
  red: '\x1b[31m'
};

// Mock memory store
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

// Initialize the document stack
const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${colors.cyan}docstack> ${colors.reset}`
});

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
[What becomes easier or more difficult to do because of this change?]`
  },
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
\`\`\``
  },
  security: {
    docType: 'security-spec',
    template: `# Security Specification

## Overview
[Security requirements overview]

## Requirements
1. [Requirement 1]
2. [Requirement 2]

## Implementation
[How to implement]`
  }
};

// Main command processor
async function processCommand(line) {
  const args = line.trim().split(' ');
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'help':
    case 'h':
      showHelp();
      break;
      
    case 'create':
    case 'c':
      await createDocument(args.slice(1));
      break;
      
    case 'review':
    case 'r':
      await reviewDocument(args.slice(1));
      break;
      
    case 'list':
    case 'ls':
      await listDocuments(args.slice(1));
      break;
      
    case 'approve':
    case 'a':
      await approveDocument(args.slice(1));
      break;
      
    case 'validate':
    case 'v':
      await validateDocument(args.slice(1));
      break;
      
    case 'template':
    case 't':
      showTemplates();
      break;
      
    case 'status':
    case 's':
      await showStatus();
      break;
      
    case 'clear':
      console.clear();
      break;
      
    case 'exit':
    case 'quit':
    case 'q':
      console.log(`${colors.yellow}Goodbye!${colors.reset}`);
      process.exit(0);
      break;
      
    default:
      if (line.trim()) {
        console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
        console.log(`Type 'help' for available commands`);
      }
  }
}

function showHelp() {
  console.log(`
${colors.bright}${colors.green}📚 Document Stack Interactive CLI${colors.reset}

${colors.yellow}Commands:${colors.reset}
  ${colors.cyan}create <type> <service> <id>${colors.reset}  Create a new document
  ${colors.cyan}review <service/type/id>${colors.reset}      Review document for approval
  ${colors.cyan}list [service]${colors.reset}                List documents
  ${colors.cyan}approve <service/type/id>${colors.reset}     Approve a document
  ${colors.cyan}validate <service/type/id>${colors.reset}    Run validation on document
  ${colors.cyan}template${colors.reset}                      Show available templates
  ${colors.cyan}status${colors.reset}                        Show system status
  ${colors.cyan}help${colors.reset}                          Show this help
  ${colors.cyan}clear${colors.reset}                         Clear screen
  ${colors.cyan}exit${colors.reset}                          Exit the program

${colors.yellow}Document Types:${colors.reset}
  - service-adr         (Architecture Decision Records)
  - api-documentation   (API specs and docs)
  - security-spec       (Security requirements)
  - deployment-guide    (Infrastructure docs)
  - user-guide          (End-user documentation)

${colors.yellow}Examples:${colors.reset}
  create adr user-service use-postgres
  review user-service/service-adr/use-postgres
  approve user-service/service-adr/use-postgres
`);
}

async function createDocument(args) {
  if (args.length < 3) {
    console.log(`${colors.red}Usage: create <type> <service> <id>${colors.reset}`);
    console.log(`Example: create adr user-service use-postgres`);
    return;
  }
  
  const [type, service, ...idParts] = args;
  const docId = idParts.join('-');
  
  // Map short names to full document types
  const typeMap = {
    'adr': 'service-adr',
    'api': 'api-documentation',
    'security': 'security-spec',
    'deploy': 'deployment-guide',
    'guide': 'user-guide'
  };
  
  const docType = typeMap[type] || type;
  
  console.log(`\n${colors.cyan}Creating ${docType} for ${service}...${colors.reset}\n`);
  
  // Get template if available
  const template = templates[type];
  const content = template ? template.template : `# ${docType}: ${docId}\n\nDocument content here...`;
  
  // Interactive metadata collection
  console.log(`${colors.yellow}Enter metadata (press Enter to skip):${colors.reset}`);
  
  const metadata = {};
  
  // Dependencies
  const deps = await question('Dependencies (comma-separated): ');
  if (deps) metadata.dependencies = deps.split(',').map(d => d.trim());
  
  // Tags
  const tags = await question('Tags (comma-separated): ');
  if (tags) metadata.tags = tags.split(',').map(t => t.trim());
  
  // Priority (for certain doc types)
  if (docType === 'security-spec' || docType === 'service-adr') {
    const priority = await question('Priority (critical/high/medium/low): ');
    if (priority) metadata.priority = priority;
  }
  
  // Create the document
  try {
    const result = await docStack.createDocument(
      docType,
      service,
      docId,
      content,
      metadata
    );
    
    console.log(`\n${colors.green}✅ Document created successfully!${colors.reset}\n`);
    
    // Show the generated metadata
    console.log(`${colors.magenta}📋 Generated Metadata:${colors.reset}`);
    console.log(`---`);
    console.log(`type: ${docType}`);
    console.log(`service: ${service}`);
    console.log(`layer: ${result.metadata.stack_layer}`);
    console.log(`created: ${result.metadata.created_at}`);
    console.log(`auto_routing:`);
    console.log(`  approvers: ${JSON.stringify(result.routing.approvers)}`);
    console.log(`  validation: ${JSON.stringify(result.routing.validation || [])}`);
    if (metadata.dependencies) console.log(`dependencies: ${JSON.stringify(metadata.dependencies)}`);
    if (metadata.tags) console.log(`tags: ${JSON.stringify(metadata.tags)}`);
    console.log(`---`);
    
    // Show next steps
    console.log(`\n${colors.yellow}📌 Next Steps:${colors.reset}`);
    console.log(`1. Review the document: ${colors.cyan}review ${service}/${docType}/${docId}${colors.reset}`);
    console.log(`2. Get approval from: ${result.routing.approvers.join(', ')}`);
    if (result.routing.validation?.length > 0) {
      console.log(`3. Run validations: ${result.routing.validation.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`${colors.red}Error creating document: ${error.message}${colors.reset}`);
  }
}

async function reviewDocument(args) {
  if (args.length < 1) {
    console.log(`${colors.red}Usage: review <service/type/id>${colors.reset}`);
    return;
  }
  
  const [path] = args;
  const parts = path.split('/');
  
  if (parts.length !== 3) {
    console.log(`${colors.red}Invalid document path. Use format: service/type/id${colors.reset}`);
    return;
  }
  
  const [service, docType, docId] = parts;
  
  try {
    const doc = await memoryStore.retrieve(`${docType}/${docId}`, { namespace: `service-documents/${service}` });
    
    if (!doc) {
      console.log(`${colors.red}Document not found: ${path}${colors.reset}`);
      return;
    }
    
    const docData = JSON.parse(doc);
    
    console.log(`\n${colors.bright}${colors.blue}📄 Document Review${colors.reset}`);
    console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}`);
    console.log(`${colors.yellow}Path:${colors.reset} ${path}`);
    console.log(`${colors.yellow}Layer:${colors.reset} ${docData.metadata.stack_layer}`);
    console.log(`${colors.yellow}Created:${colors.reset} ${docData.metadata.created_at}`);
    console.log(`${colors.yellow}Version:${colors.reset} ${docData.metadata.version}`);
    
    if (docData.metadata.dependencies?.length > 0) {
      console.log(`${colors.yellow}Dependencies:${colors.reset} ${docData.metadata.dependencies.join(', ')}`);
    }
    
    if (docData.metadata.tags?.length > 0) {
      console.log(`${colors.yellow}Tags:${colors.reset} ${docData.metadata.tags.join(', ')}`);
    }
    
    console.log(`\n${colors.yellow}Routing:${colors.reset}`);
    console.log(`  ${colors.cyan}Approvers:${colors.reset} ${docData.metadata.auto_routing.approvers.join(', ')}`);
    if (docData.metadata.auto_routing.validation?.length > 0) {
      console.log(`  ${colors.cyan}Validations:${colors.reset} ${docData.metadata.auto_routing.validation.join(', ')}`);
    }
    
    console.log(`\n${colors.yellow}Content Preview:${colors.reset}`);
    console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}`);
    const preview = docData.content.split('\n').slice(0, 10).join('\n');
    console.log(preview);
    if (docData.content.split('\n').length > 10) {
      console.log(`${colors.cyan}... (${docData.content.split('\n').length - 10} more lines)${colors.reset}`);
    }
    
    // Human feedback prompt
    console.log(`\n${colors.bright}${colors.yellow}🤔 Human Feedback Required:${colors.reset}`);
    console.log(`1. Does this document follow the correct template?`);
    console.log(`2. Are the approvers appropriate?`);
    console.log(`3. Should additional validations be run?`);
    
    const feedback = await question(`\n${colors.cyan}Provide feedback (or press Enter to skip): ${colors.reset}`);
    
    if (feedback) {
      console.log(`\n${colors.green}✅ Feedback recorded:${colors.reset} "${feedback}"`);
      // In a real system, this would be stored and processed
    }
    
  } catch (error) {
    console.log(`${colors.red}Error reviewing document: ${error.message}${colors.reset}`);
  }
}

async function listDocuments(args) {
  const service = args[0];
  
  console.log(`\n${colors.bright}${colors.blue}📚 Document List${colors.reset}`);
  console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}`);
  
  const allDocs = await memoryStore.search({ pattern: '*' });
  
  const documents = [];
  for (const [key, value] of Object.entries(allDocs)) {
    if (key.includes('service-documents/')) {
      const docData = JSON.parse(value);
      if (!service || key.includes(`service-documents/${service}`)) {
        documents.push({
          path: key.replace('service-documents/', '').replace(':', '/'),
          ...docData.metadata
        });
      }
    }
  }
  
  if (documents.length === 0) {
    console.log(`${colors.yellow}No documents found${colors.reset}`);
    return;
  }
  
  // Group by service
  const grouped = {};
  documents.forEach(doc => {
    const service = doc.path.split('/')[0];
    if (!grouped[service]) grouped[service] = [];
    grouped[service].push(doc);
  });
  
  Object.entries(grouped).forEach(([service, docs]) => {
    console.log(`\n${colors.yellow}${service}:${colors.reset}`);
    docs.forEach(doc => {
      const status = doc.approved ? '✅' : '⏳';
      console.log(`  ${status} ${doc.path.split('/').slice(1).join('/')} (${doc.stack_layer})`);
    });
  });
}

async function approveDocument(args) {
  if (args.length < 1) {
    console.log(`${colors.red}Usage: approve <service/type/id>${colors.reset}`);
    return;
  }
  
  const [path] = args;
  const approver = await question('Your role (architect/tech-lead/security-team/product-owner): ');
  
  if (!approver) {
    console.log(`${colors.red}Approver role required${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.green}✅ Document approved by ${approver}${colors.reset}`);
  console.log(`Approval recorded for: ${path}`);
  
  // In a real system, this would update the document metadata
}

async function validateDocument(args) {
  if (args.length < 1) {
    console.log(`${colors.red}Usage: validate <service/type/id>${colors.reset}`);
    return;
  }
  
  const [path] = args;
  
  console.log(`\n${colors.cyan}🔍 Running validations for ${path}...${colors.reset}\n`);
  
  // Simulate validation checks
  const validations = [
    { name: 'consistency-check', status: 'pass', message: 'Document structure is consistent' },
    { name: 'dependency-analysis', status: 'pass', message: 'All dependencies are valid' },
    { name: 'completeness-check', status: 'warning', message: 'Missing implementation details' }
  ];
  
  validations.forEach(v => {
    const icon = v.status === 'pass' ? '✅' : v.status === 'warning' ? '⚠️' : '❌';
    const color = v.status === 'pass' ? colors.green : v.status === 'warning' ? colors.yellow : colors.red;
    console.log(`${icon} ${v.name}: ${color}${v.message}${colors.reset}`);
  });
}

function showTemplates() {
  console.log(`\n${colors.bright}${colors.blue}📝 Available Templates${colors.reset}`);
  console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}\n`);
  
  Object.entries(templates).forEach(([key, template]) => {
    console.log(`${colors.yellow}${key}${colors.reset} (${template.docType}):`);
    console.log(`${colors.cyan}${template.template.split('\n').slice(0, 5).join('\n')}${colors.reset}`);
    console.log(`${colors.cyan}...${colors.reset}\n`);
  });
}

async function showStatus() {
  console.log(`\n${colors.bright}${colors.green}📊 Document Stack Status${colors.reset}`);
  console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}`);
  
  const allDocs = await memoryStore.search({ pattern: '*' });
  const docCount = Object.keys(allDocs).filter(k => k.includes('service-documents/')).length;
  
  console.log(`${colors.yellow}Total Documents:${colors.reset} ${docCount}`);
  console.log(`${colors.yellow}Active Rules:${colors.reset} ${docStack.rules.size}`);
  console.log(`${colors.yellow}Memory Store:${colors.reset} ${memoryStore.data.size} entries`);
  
  console.log(`\n${colors.yellow}Layer Distribution:${colors.reset}`);
  const layers = { infrastructure: 0, service: 0, application: 0, business: 0 };
  
  for (const value of Object.values(allDocs)) {
    try {
      const doc = JSON.parse(value);
      if (doc.metadata?.stack_layer) {
        layers[doc.metadata.stack_layer] = (layers[doc.metadata.stack_layer] || 0) + 1;
      }
    } catch (e) {}
  }
  
  Object.entries(layers).forEach(([layer, count]) => {
    if (count > 0) {
      console.log(`  ${layer}: ${count} documents`);
    }
  });
}

// Helper function for interactive prompts
function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

// Welcome message
console.log(`
${colors.bright}${colors.green}🚀 Document Stack Interactive CLI${colors.reset}
${colors.cyan}${'─'.repeat(50)}${colors.reset}

Welcome to the Document Stack! This is an interactive system
similar to GitHub models where you can create, review, and
manage documents with human feedback.

Type ${colors.cyan}help${colors.reset} for available commands.
`);

// Start the REPL
rl.on('line', async (line) => {
  await processCommand(line);
  rl.prompt();
});

rl.on('close', () => {
  console.log(`\n${colors.yellow}Goodbye!${colors.reset}`);
  process.exit(0);
});

// Show initial prompt
rl.prompt();

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  rl.prompt();
});