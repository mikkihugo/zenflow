#!/usr/bin/env node
/**
 * Document Stack AI Review - Uses GitHub Models CLI for AI feedback
 * 
 * This integrates the document stack with `gh models run` to provide
 * AI-powered analysis and feedback on documents
 */

const { spawn } = require('child_process');
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

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

// Initialize document stack
const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Colors
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

// Run GitHub Models CLI
async function runGHModel(prompt, model = 'gpt-4o-mini') {
  return new Promise((resolve, reject) => {
    const gh = spawn('gh', ['models', 'run', model], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    gh.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    gh.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    gh.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`gh models run failed: ${errorOutput}`));
      } else {
        resolve(output.trim());
      }
    });
    
    // Send the prompt
    gh.stdin.write(prompt);
    gh.stdin.end();
  });
}

// Check if gh CLI is available
async function checkGHCLI() {
  try {
    const response = await runGHModel('Respond with just "OK"', 'openai/gpt-4o-mini');
    return response.includes('OK');
  } catch (error) {
    console.log(`${colors.red}❌ GitHub CLI not available or not authenticated${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Please install and authenticate GitHub CLI:${colors.reset}`);
    console.log(`  1. Install: https://cli.github.com/`);
    console.log(`  2. Run: gh auth login`);
    console.log(`  3. Enable models: gh models list`);
    return false;
  }
}

// AI Document Analysis
async function analyzeDocumentWithAI(docType, service, docId, content, metadata) {
  const prompt = `You are an expert document reviewer for microservices architecture. Analyze this document and provide structured feedback.

Document Information:
- Type: ${docType}
- Service: ${service}  
- ID: ${docId}

Current Metadata:
${JSON.stringify(metadata, null, 2)}

Document Content:
${content}

Please analyze and provide feedback in this JSON format:
{
  "quality_score": <1-10>,
  "suggested_approvers": ["role1", "role2"],
  "required_validations": ["validation1", "validation2"],
  "detected_issues": ["issue1", "issue2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"],
  "detected_dependencies": ["dep1", "dep2"],
  "recommended_tags": ["tag1", "tag2"],
  "routing_feedback": "feedback on current routing",
  "summary": "brief summary of the document"
}

Focus on practical, actionable feedback. IMPORTANT: Respond with ONLY the JSON object, no other text.`;

  try {
    console.log(`${colors.cyan}🤖 Running AI analysis with GitHub Models...${colors.reset}`);
    const response = await runGHModel(prompt, 'openai/gpt-4o-mini');
    
    // Extract JSON from response if it contains other text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.log(`${colors.yellow}Warning: Could not parse JSON response${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}Error in AI analysis: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Raw response: ${response}${colors.reset}`);
    return null;
  }
}

// Review routing decisions with AI
async function reviewRoutingWithAI(docType, service, currentApprovers, content) {
  const prompt = `You are an architecture reviewer. Evaluate if these approvers are appropriate for this document type and content.

Document Type: ${docType}
Service: ${service}
Current Approvers: ${currentApprovers.join(', ')}

Document Content Summary:
${content.substring(0, 1000)}...

Provide feedback in JSON format:
{
  "routing_appropriate": true/false,
  "reasoning": "explanation of the routing assessment",
  "suggested_changes": {
    "add_approvers": ["role1", "role2"],
    "remove_approvers": ["role3"],
    "alternative_approvers": ["role4", "role5"]
  },
  "additional_validations": ["validation1", "validation2"],
  "risk_assessment": "low/medium/high",
  "recommendations": ["action1", "action2"]
}

IMPORTANT: Respond with ONLY the JSON object, no other text.`;

  try {
    const response = await runGHModel(prompt, 'openai/gpt-4o-mini');
    
    // Extract JSON from response if it contains other text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.log(`${colors.yellow}Warning: Could not parse JSON response${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}Error in routing review: ${error.message}${colors.reset}`);
    return null;
  }
}

// Generate document from requirements
async function generateDocumentWithAI(docType, service, requirements) {
  const templates = {
    'service-adr': 'Architecture Decision Record (ADR) template with Status, Context, Decision, Consequences sections',
    'api-documentation': 'API documentation with Overview, Authentication, Endpoints, Examples',
    'security-spec': 'Security specification with Requirements, Implementation, Compliance details'
  };

  const prompt = `Generate a professional ${docType} document for the ${service} service.

Template Style: ${templates[docType] || 'Standard technical document'}

Requirements:
${requirements}

Generate a complete, well-structured document following best practices for ${docType}. Include:
- Proper markdown formatting
- Clear sections and headings
- Specific technical details where appropriate
- Professional tone

Return only the document content, no JSON wrapper.`;

  try {
    console.log(`${colors.cyan}🤖 Generating document with GitHub Models...${colors.reset}`);
    const response = await runGHModel(prompt, 'openai/gpt-4o-mini');
    return response;
  } catch (error) {
    console.log(`${colors.red}Error generating document: ${error.message}${colors.reset}`);
    return null;
  }
}

// Main CLI interface
async function main() {
  console.log(`${colors.bright}${colors.green}🚀 Document Stack AI Review${colors.reset}`);
  console.log(`${colors.cyan}Using GitHub Models CLI for AI-powered document analysis${colors.reset}\n`);

  // Check GitHub CLI availability
  if (!(await checkGHCLI())) {
    process.exit(1);
  }

  console.log(`${colors.green}✅ GitHub Models CLI is available${colors.reset}\n`);

  // Demo: Create a document and analyze it
  console.log(`${colors.yellow}📄 Demo: Creating and analyzing a document...${colors.reset}\n`);

  const demoDoc = {
    docType: 'service-adr',
    service: 'user-service',
    docId: 'use-redis-for-sessions',
    content: `# ADR: Use Redis for Session Storage

## Status
Proposed - 2025-01-17

## Context
Our user service currently stores sessions in memory, which doesn't scale across multiple instances and loses sessions on restart. We need a distributed session storage solution.

## Decision
We will use Redis as our session storage backend for the user service.

## Consequences
### Positive
- Sessions persist across service restarts
- Horizontal scaling support with shared session state
- Fast read/write performance for session data
- Built-in TTL support for session expiration

### Negative
- Additional infrastructure dependency
- Network latency for session operations
- Need to manage Redis high availability`,
    metadata: {
      dependencies: ['redis-infrastructure'],
      tags: ['sessions', 'redis', 'scaling']
    }
  };

  // Create the document in the stack
  console.log(`${colors.cyan}Creating document in stack...${colors.reset}`);
  const result = await docStack.createDocument(
    demoDoc.docType,
    demoDoc.service,
    demoDoc.docId,
    demoDoc.content,
    demoDoc.metadata
  );

  console.log(`${colors.green}✅ Document created with metadata:${colors.reset}`);
  console.log(`   Layer: ${result.metadata.stack_layer}`);
  console.log(`   Approvers: ${result.routing.approvers.join(', ')}`);
  console.log(`   Validations: ${result.routing.validation.join(', ')}\n`);

  // Analyze with AI
  console.log(`${colors.yellow}🤖 Running AI analysis...${colors.reset}\n`);
  const aiAnalysis = await analyzeDocumentWithAI(
    demoDoc.docType,
    demoDoc.service,
    demoDoc.docId,
    demoDoc.content,
    result.metadata
  );

  if (aiAnalysis) {
    console.log(`${colors.magenta}📊 AI Analysis Results:${colors.reset}`);
    console.log(`${colors.cyan}Quality Score:${colors.reset} ${aiAnalysis.quality_score}/10`);
    console.log(`${colors.cyan}Summary:${colors.reset} ${aiAnalysis.summary}`);
    
    if (aiAnalysis.suggested_approvers?.length > 0) {
      console.log(`${colors.cyan}Suggested Approvers:${colors.reset} ${aiAnalysis.suggested_approvers.join(', ')}`);
    }
    
    if (aiAnalysis.detected_issues?.length > 0) {
      console.log(`${colors.yellow}Detected Issues:${colors.reset}`);
      aiAnalysis.detected_issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
    
    if (aiAnalysis.improvement_suggestions?.length > 0) {
      console.log(`${colors.green}Improvement Suggestions:${colors.reset}`);
      aiAnalysis.improvement_suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
    }

    console.log(`\n${colors.yellow}🔄 Reviewing routing decisions...${colors.reset}`);
    
    // Review routing with AI
    const routingReview = await reviewRoutingWithAI(
      demoDoc.docType,
      demoDoc.service,
      result.routing.approvers,
      demoDoc.content
    );

    if (routingReview) {
      console.log(`\n${colors.magenta}🎯 Routing Review Results:${colors.reset}`);
      console.log(`${colors.cyan}Routing Appropriate:${colors.reset} ${routingReview.routing_appropriate ? 'Yes' : 'No'}`);
      console.log(`${colors.cyan}Reasoning:${colors.reset} ${routingReview.reasoning}`);
      console.log(`${colors.cyan}Risk Assessment:${colors.reset} ${routingReview.risk_assessment}`);
      
      if (routingReview.suggested_changes?.add_approvers?.length > 0) {
        console.log(`${colors.yellow}Add Approvers:${colors.reset} ${routingReview.suggested_changes.add_approvers.join(', ')}`);
      }
      
      if (routingReview.recommendations?.length > 0) {
        console.log(`${colors.green}Recommendations:${colors.reset}`);
        routingReview.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }
    }
  }

  console.log(`\n${colors.bright}${colors.green}🎉 AI-powered document analysis complete!${colors.reset}`);
  console.log(`\n${colors.yellow}💡 This demonstrates how GitHub Models CLI can provide:${colors.reset}`);
  console.log(`   • Automated document quality assessment`);
  console.log(`   • Intelligent routing recommendations`);
  console.log(`   • Issue detection and improvement suggestions`);
  console.log(`   • Human feedback integration`);
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  analyzeDocumentWithAI, 
  reviewRoutingWithAI, 
  generateDocumentWithAI 
};