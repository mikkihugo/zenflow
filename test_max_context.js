// Test GitHub Models with maximum context size
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-5-nano";

async function testMaxContext() {
  if (!token) {
    console.log("❌ GITHUB_TOKEN not set");
    return;
  }

  try {
    console.log('🚀 Testing GitHub Models with Maximum Context Size...');
    
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token)
    );

    // Create a large context prompt to test maximum capabilities
    const largeContext = `
Analyze the following comprehensive GNN-Kuzu integration system:

NEURAL NETWORKS DOMAIN:
- gnn.js: Graph Neural Network implementation with message passing
- neural-model.js: Base neural model with training capabilities
- Features: 128-256 node dimensions, 3-5 layers, ReLU/tanh activation
- Training: Batch processing, validation, early stopping
- Performance: WASM acceleration, Float32Array operations

GRAPH DATABASE DOMAIN:
- kuzu.dao.ts: Kuzu database access object with Cypher queries
- graph-query.ts: Query builder and optimization
- Features: Node/edge traversal, pattern matching, aggregation
- Performance: Index optimization, query caching, batch operations
- Scalability: Distributed graphs, partitioning strategies

COORDINATION DOMAIN:
- llm-integration.service.ts: LLM provider abstraction with Azure AI inference
- domain-mapper.ts: Domain boundary analysis and optimization
- Features: Multi-provider fallback, rate limiting, JSON schemas
- Integration: Claude Code, Gemini CLI, GitHub Models API
- Architecture: Microservices, event-driven, fault tolerance

DEPENDENCIES:
- Neural Networks → Graph Database: 0.8 (High coupling for data storage)
- Coordination → Neural Networks: 0.6 (Medium coupling for analysis)
- Coordination → Graph Database: 0.7 (High coupling for queries)

TECHNICAL SPECIFICATIONS:
- Languages: TypeScript, JavaScript, Python
- Frameworks: Node.js, Express, Socket.io
- Databases: Kuzu graph DB, PostgreSQL, Redis
- AI/ML: TensorFlow.js, PyTorch, Hugging Face
- Cloud: Azure AI, GitHub Models, Docker containers
- Testing: Jest, Vitest, Cypress e2e
- Monitoring: OpenTelemetry, Prometheus, Grafana

Please provide a comprehensive analysis with:
1. Architecture assessment and recommendations
2. Performance bottlenecks and optimization strategies
3. Scalability improvements and patterns
4. Integration points and coupling analysis
5. Technology stack evaluation and modernization suggestions
`;

    console.log('  - Context size:', largeContext.length, 'characters');
    console.log('  - Model:', model);
    console.log('  - Max completion tokens: 32000');

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: "You are an expert software architect specializing in graph neural networks, database systems, and distributed architectures. Provide detailed, structured analysis with specific recommendations." 
          },
          { 
            role: "user", 
            content: largeContext
          }
        ],
        model: model,
        // GPT-5-nano only supports default temperature (1)
        max_completion_tokens: 32000 // Maximum context size
      }
    });

    if (isUnexpected(response)) {
      throw new Error(`API Error: ${JSON.stringify(response.body?.error || response.body)}`);
    }

    console.log("✅ Maximum Context Test Success!");
    const content = response.body.choices[0].message.content;
    
    console.log('\n📊 Response Analysis:');
    console.log('  - Response length:', content.length, 'characters');
    console.log('  - Estimated tokens:', Math.round(content.length / 4), 'tokens');
    console.log('  - Model used:', response.body.model);
    
    // Show first and last parts of response to verify completeness
    console.log('\n📝 Response Preview:');
    console.log('  - First 300 chars:', content.substring(0, 300) + '...');
    console.log('  - Last 300 chars:', '...' + content.substring(content.length - 300));
    
    // Check if response was truncated
    const responseComplete = !content.endsWith('...');
    console.log('  - Response appears complete:', responseComplete ? '✅' : '⚠️');

    // Rate limit information
    console.log('\n📊 Rate Limit Info:');
    const headers = response.headers;
    if (headers['x-ratelimit-remaining-requests']) {
      console.log('  - Remaining requests:', headers['x-ratelimit-remaining-requests']);
      console.log('  - Request limit:', headers['x-ratelimit-limit-requests']);
      console.log('  - Remaining tokens:', headers['x-ratelimit-remaining-tokens']);
      console.log('  - Token limit:', headers['x-ratelimit-limit-tokens']);
    }

  } catch (error) {
    console.error("❌ Maximum context test failed:", error.message);
  }
}

testMaxContext().catch(console.error);