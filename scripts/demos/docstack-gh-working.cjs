#!/usr/bin/env node
/**
 * Working Document Stack with GitHub Models CLI
 * 
 * This demonstrates the actual `gh models run` integration for document analysis
 */

const { spawn } = require('child_process');
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// Mock memory store
class MockMemoryStore {
  constructor() { this.data = new Map(); }
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

// Initialize document stack
const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Colors for output
const c = {
  reset: '\x1b[0m', bright: '\x1b[1m', green: '\x1b[32m', blue: '\x1b[34m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', magenta: '\x1b[35m', red: '\x1b[31m'
};

// Run GitHub Models CLI
function runGHModel(prompt, model = 'openai/gpt-4o-mini') {
  return new Promise((resolve, reject) => {
    const gh = spawn('gh', ['models', 'run', model], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let output = '';
    let errorOutput = '';
    
    const timeout = setTimeout(() => { gh.kill(); reject(new Error('Timeout')); }, 15000);
    
    gh.stdout.on('data', (data) => output += data.toString());
    gh.stderr.on('data', (data) => errorOutput += data.toString());
    
    gh.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) reject(new Error(`gh failed: ${errorOutput}`));
      else resolve(output.trim());
    });
    
    gh.stdin.write(prompt);
    gh.stdin.end();
  });
}

// Extract JSON from response (handles markdown code blocks)
function extractJSON(response) {
  try {
    // Try direct parse first
    return JSON.parse(response);
  } catch (e) {
    // Look for JSON in code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }
    
    // Look for any JSON object
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No JSON found');
  }
}

// AI Document Analysis
async function analyzeDocument(docType, service, docId, content) {
  const prompt = `Analyze this ${docType} document for ${service}:

"${content}"

Respond with ONLY this JSON (no other text):
{
  "quality_score": <number 1-10>,
  "summary": "<brief summary>",
  "suggested_approvers": ["<role1>", "<role2>"],
  "issues": ["<issue1>", "<issue2>"],
  "improvements": ["<suggestion1>", "<suggestion2>"],
  "dependencies": ["<dep1>", "<dep2>"],
  "tags": ["<tag1>", "<tag2>"]
}`;

  try {
    console.log(`${c.cyan}🤖 Analyzing with GitHub Models...${c.reset}`);
    const response = await runGHModel(prompt);
    console.log(`${c.blue}Raw response: ${response}${c.reset}\n`);
    return extractJSON(response);
  } catch (error) {
    console.log(`${c.red}❌ AI analysis failed: ${error.message}${c.reset}`);
    return null;
  }
}

// Review routing decisions
async function reviewRouting(docType, currentApprovers, content) {
  const prompt = `Review if these approvers are appropriate for this ${docType}:
Current approvers: ${currentApprovers.join(', ')}

Document excerpt: "${content.substring(0, 200)}..."

Respond with ONLY JSON:
{
  "appropriate": true/false,
  "reasoning": "<explanation>",
  "add_approvers": ["<role>"],
  "remove_approvers": ["<role>"],
  "risk_level": "low/medium/high"
}`;

  try {
    console.log(`${c.cyan}🔍 Reviewing routing with AI...${c.reset}`);
    const response = await runGHModel(prompt);
    return extractJSON(response);
  } catch (error) {
    console.log(`${c.red}❌ Routing review failed: ${error.message}${c.reset}`);
    return null;
  }
}

// Main demo
async function main() {
  console.log(`${c.bright}${c.green}🚀 Document Stack + GitHub Models CLI Demo${c.reset}\n`);
  
  // Test connection first
  try {
    await runGHModel('Respond with just "Connected"');
    console.log(`${c.green}✅ GitHub Models CLI is working${c.reset}\n`);
  } catch (error) {
    console.log(`${c.red}❌ GitHub Models CLI not available: ${error.message}${c.reset}`);
    console.log(`${c.yellow}Please ensure 'gh' CLI is installed and authenticated${c.reset}`);
    return;
  }
  
  // Create a demo document
  const doc = {
    docType: 'service-adr',
    service: 'user-service',
    docId: 'use-redis-sessions',
    content: `# ADR: Use Redis for Session Storage

## Status
Proposed - 2025-01-17

## Context
Our user service stores sessions in memory, which doesn't scale across instances and loses sessions on restart. We need distributed session storage.

## Decision
We will use Redis as our session storage backend.

## Consequences
### Positive
- Sessions persist across restarts
- Horizontal scaling support
- Fast read/write performance
- Built-in TTL for expiration

### Negative
- Additional infrastructure dependency
- Network latency for session ops
- Need Redis high availability`
  };
  
  console.log(`${c.yellow}📄 Creating document: ${doc.service}/${doc.docType}/${doc.docId}${c.reset}\n`);
  
  // Create document in stack
  const result = await docStack.createDocument(
    doc.docType, doc.service, doc.docId, doc.content, 
    { dependencies: ['redis-infrastructure'], tags: ['sessions', 'redis'] }
  );
  
  console.log(`${c.green}✅ Document created in stack:${c.reset}`);
  console.log(`   Layer: ${result.metadata.stack_layer}`);
  console.log(`   Auto-approvers: ${result.routing.approvers.join(', ')}`);
  console.log(`   Validations: ${result.routing.validation.join(', ')}\n`);
  
  // Analyze with AI
  const analysis = await analyzeDocument(doc.docType, doc.service, doc.docId, doc.content);
  
  if (analysis) {
    console.log(`${c.magenta}📊 AI Analysis Results:${c.reset}`);
    console.log(`   Quality Score: ${analysis.quality_score}/10`);
    console.log(`   Summary: ${analysis.summary}`);
    
    if (analysis.suggested_approvers?.length > 0) {
      console.log(`   AI Suggested Approvers: ${analysis.suggested_approvers.join(', ')}`);
    }
    
    if (analysis.issues?.length > 0) {
      console.log(`   Issues Found: ${analysis.issues.join(', ')}`);
    }
    
    if (analysis.improvements?.length > 0) {
      console.log(`   Improvements: ${analysis.improvements.join(', ')}`);
    }
    
    console.log();
  }
  
  // Review routing
  const routingReview = await reviewRouting(doc.docType, result.routing.approvers, doc.content);
  
  if (routingReview) {
    console.log(`${c.magenta}🎯 Routing Review:${c.reset}`);
    console.log(`   Appropriate: ${routingReview.appropriate ? 'Yes' : 'No'}`);
    console.log(`   Reasoning: ${routingReview.reasoning}`);
    console.log(`   Risk Level: ${routingReview.risk_level}`);
    
    if (routingReview.add_approvers?.length > 0) {
      console.log(`   Suggested Additions: ${routingReview.add_approvers.join(', ')}`);
    }
    
    console.log();
  }
  
  console.log(`${c.bright}${c.green}🎉 Demo Complete!${c.reset}`);
  console.log(`\n${c.yellow}💡 This shows how 'gh models run' can provide:${c.reset}`);
  console.log(`   • AI-powered document analysis`);
  console.log(`   • Intelligent routing recommendations`);
  console.log(`   • Quality assessment and improvements`);
  console.log(`   • Human feedback integration via CLI`);
}

if (require.main === module) {
  main().catch(console.error);
}