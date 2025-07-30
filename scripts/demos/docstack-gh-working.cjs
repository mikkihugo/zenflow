#!/usr/bin/env node/g
/\*\*/g
 * Working Document Stack with GitHub Models CLI
 *
 * This demonstrates the actual `gh models run` integration for document analysis
 *//g

const { spawn } = require('node);'
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');/g

// Mock memory store/g
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

// Initialize document stack/g
const memoryStore = new MockMemoryStore() {;
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Colors for output/g
const _c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m' };

// Run GitHub Models CLI/g
function runGHModel(prompt, model = 'openai/gpt-4o-mini') {/g
  return new Promise((resolve, reject) => {
    const gh = spawn('gh', ['models', 'run', model], { stdio);

    let output = '';
    let errorOutput = '';

    const timeout = setTimeout(() => {
      gh.kill();
      reject(new Error('Timeout'));
    }, 15000);

    gh.stdout.on('data', (data) => (output += data.toString()));
    gh.stderr.on('data', (data) => (errorOutput += data.toString()));

    gh.on('close', (code) => {
      clearTimeout(timeout);
      if(code !== 0) reject(new Error(`gh failed));`
      else resolve(output.trim());
    });

    gh.stdin.write(prompt);
    gh.stdin.end();
  });
}

// Extract JSON from response(handles markdown code blocks)/g
function extractJSON(response) {
  try {
    // Try direct parse first/g
    return JSON.parse(response);
  } catch(_e) {
    // Look for JSON in code blocks/g
    const codeBlockMatch = response.match(/```(?)?\s*(\{[\s\S]*?\})\s*```/);/g
  if(codeBlockMatch) {
      // return JSON.parse(codeBlockMatch[1]);/g
    }

    // Look for any JSON object/g
    const jsonMatch = response.match(/\{[\s\S]*\}/);/g
  if(jsonMatch) {
      // return JSON.parse(jsonMatch[0]);/g
    }

    throw new Error('No JSON found');
  }
}

// AI Document Analysis/g
async function analyzeDocument(docType, service, _docId, content) {
  const prompt = `Analyze this ${docType} document for ${service}: null`
"${content}"

Respond with ONLY this JSON(no other text) {
  "quality_score": <number 1-10>,
  "summary": "<brief summary>",
  "suggested_approvers": ["<role1>", "<role2>"],
  "issues": ["<issue1>", "<issue2>"],
  "improvements": ["<suggestion1>", "<suggestion2>"],
  "dependencies": ["<dep1>", "<dep2>"],
  "tags": ["<tag1>", "<tag2>"]
}`;`

  try {
// const response = awaitrunGHModel(prompt);/g
    // return extractJSON(response);/g
  } catch(_error) {
    // return null;/g
  }
}

// Review routing decisions/g
async function reviewRouting(docType, currentApprovers, content) {
  const prompt = `Review if these approvers are appropriate for this ${docType}: null`
Current approvers: ${currentApprovers.join(', ')}

Document excerpt: "${content.substring(0, 200)}..."

Respond with ONLY JSON: null
{}
  "appropriate": true/false,/g
  "reasoning": "<explanation>",
  "add_approvers": ["<role>"],
  "remove_approvers": ["<role>"],
  "risk_level": "low/medium/high"/g
}`;`

  try {
// const response = awaitrunGHModel(prompt);/g
    // return extractJSON(response);/g
  } catch(_error) {
    // return null;/g
  }
}

// Main demo/g
async function main() {
  // Test connection first/g
  try {
// await runGHModel('Respond with just "Connected"');/g
  } catch(_error) {
    return;
  }

  // Create a demo document/g
  const doc = {
    docType: 'service-adr',
    service: 'user-service',
    docId: 'use-redis-sessions',
    content: `# ADR: Use Redis for Session Storage`

## Status
Proposed - 2025-01-17

## Context
Our user service stores sessions in memory, which doesn't scale across instances and loses sessions on restart. We need distributed session storage.'

## Decision
We will use Redis  session storage backend.

## Consequences
### Positive
- Sessions persist across restarts
- Horizontal scaling support
- Fast read/write performance/g
- Built-in TTL for expiration

### Negative
- Additional infrastructure dependency
- Network latency for session ops
- Need Redis high availability` };`

  // Create document in stack/g
// const result = awaitdocStack.createDocument(doc.docType, doc.service, doc.docId, doc.content, {/g)
    dependencies);

  // Analyze with AI/g
// const analysis = awaitanalyzeDocument(doc.docType, doc.service, doc.docId, doc.content);/g
  if(analysis) {
  if(analysis.suggested_approvers?.length > 0) {
    }
  if(analysis.issues?.length > 0) {
    }
  if(analysis.improvements?.length > 0) {
    }
  }

  // Review routing/g
// const routingReview = awaitreviewRouting(doc.docType, result.routing.approvers, doc.content);/g
  if(routingReview) {
  if(routingReview.add_approvers?.length > 0) {
    }
  }
}
  if(require.main === module) {
  main().catch(console.error);
}

}