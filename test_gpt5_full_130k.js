// Test full GPT-5 model with 130K token context
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-5";

async function testFullGPT5() {
  if (!token) {
    console.log("❌ GITHUB_TOKEN not set");
    return;
  }

  try {
    console.log('🚀 Testing Full GPT-5 with 130K Token Context...');
    console.log('  - Model: openai/gpt-5 (full model)');
    console.log('  - Max completion tokens: 128,000 (maximum limit)');
    console.log('  - Endpoint:', endpoint);
    
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token)
    );

    // Create an extensive context to test GPT-5's capabilities
    const comprehensiveContext = `
COMPREHENSIVE ANALYSIS REQUEST: GNN-Kuzu Integration Architecture

SYSTEM OVERVIEW:
This is a sophisticated Graph Neural Network (GNN) integration with Kuzu graph database, designed for intelligent code analysis and domain boundary detection. The system combines neural networks with graph databases to create a powerful AI-driven development environment.

NEURAL NETWORKS DOMAIN (Detailed Analysis Required):

File: src/neural/models/presets/gnn.js
- Class: GNNModel extends NeuralModel
- Architecture: Message passing with configurable layers (1-10)
- Node Dimensions: 128-512 configurable 
- Edge Dimensions: 64-256 configurable
- Hidden Dimensions: 256-1024 configurable
- Aggregation: mean, max, sum, attention
- Activation Functions: ReLU, tanh, sigmoid, GELU, Swish
- Training Features:
  * Batch processing with configurable batch sizes (16-512)
  * Validation split (0.1-0.3)
  * Early stopping with patience (5-20 epochs)
  * Learning rate scheduling (0.001-0.1 range)
  * Gradient clipping for stability
  * L2 regularization (1e-5 to 1e-2)
  * Dropout layers (0.1-0.5) for regularization
- Performance Optimizations:
  * WASM acceleration for matrix operations
  * Float32Array for memory efficiency
  * Sparse matrix operations for large graphs
  * GPU acceleration via WebGL shaders
  * Memory pooling for large graph processing
  * Batch normalization for stable training
  * Layer normalization for transformer-like architectures

GRAPH DATABASE DOMAIN (Kuzu Integration):

File: src/database/dao/graph.dao.ts
- Database: Kuzu graph database with Cypher query support
- Connection Management:
  * Connection pooling (5-50 connections)
  * Automatic reconnection on failures
  * Connection health monitoring
  * Load balancing across multiple Kuzu instances
- Query Capabilities:
  * Complex Cypher queries with pattern matching
  * Graph traversal algorithms (BFS, DFS, shortest path)
  * Aggregation queries (COUNT, SUM, AVG, MIN, MAX)
  * Temporal graph queries for versioned data
  * Full-text search integration
  * Geographic queries with spatial indexing
- Performance Features:
  * Query result caching (LRU, TTL-based)
  * Prepared statement caching
  * Query optimization hints
  * Index recommendations
  * Query execution plan analysis
  * Batch query execution
  * Streaming results for large datasets

COORDINATION DOMAIN (LLM Integration):

File: src/coordination/services/llm-integration.service.ts
- Multi-Provider Architecture:
  * GitHub Models (openai/gpt-5) - Primary via Azure AI inference
  * Claude Code CLI - Codebase-aware tasks with session continuity
  * Gemini CLI - Fallback with comprehensive file inclusion
- Rate Limiting Intelligence:
  * Provider-specific cooldown tracking (1-hour default for Gemini)
  * Token bucket algorithm for request throttling
  * Dynamic backoff strategies
  * Circuit breaker pattern for failed providers
  * Health monitoring and automatic recovery
- JSON Response Handling:
  * Predefined schemas for common analysis tasks
  * Automatic schema validation and fallback parsing
  * Structured output with strict JSON validation
  * Error-tolerant JSON extraction from mixed content
- Advanced Features:
  * Session management with UUID tracking
  * Context-aware prompt generation
  * Task-specific optimization (domain analysis, error analysis, code review)
  * Debug logging and performance metrics
  * Memory usage optimization
  * Parallel request handling

File: src/coordination/discovery/neural-domain-mapper.ts
- Domain Discovery Engine:
  * AST parsing for code structure analysis
  * Dependency graph construction
  * Module boundary detection using graph algorithms
  * Cohesion and coupling metrics calculation
  * Domain relationship strength analysis (0.0-1.0 scale)
  * Cross-domain interaction pattern detection
- Machine Learning Integration:
  * Feature extraction from code structures
  * Embedding generation for semantic similarity
  * Clustering algorithms for domain grouping
  * Classification models for component categorization
  * Anomaly detection for architectural violations
  * Recommendation engine for refactoring suggestions

TECHNICAL ARCHITECTURE DEEP DIVE:

Dependencies and Coupling Analysis:
1. Neural Networks → Graph Database: 0.85 (Very High)
   - Reason: GNN models directly store/retrieve graph structures
   - Data Flow: Node/edge embeddings → Kuzu storage → Training data retrieval
   - Performance Impact: Database query latency affects training speed
   - Optimization: Batch loading, connection pooling, query optimization

2. Coordination → Neural Networks: 0.72 (High)
   - Reason: LLM services analyze neural model architectures and performance
   - Integration Points: Model configuration, training metrics, error analysis
   - Data Exchange: JSON serialization of model states and parameters
   - Scalability: Async analysis to prevent blocking training loops

3. Coordination → Graph Database: 0.68 (High)
   - Reason: Domain mapping queries graph structures for analysis
   - Query Patterns: Complex traversals, aggregation, pattern matching
   - Performance Considerations: Query optimization, result caching
   - Data Volume: Large graph traversals require memory management

Technology Stack Analysis:

Programming Languages:
- TypeScript (90%): Primary language for type safety and IDE support
- JavaScript (8%): Legacy code and dynamic scripting
- Python (2%): ML preprocessing and data analysis scripts

Runtime Environments:
- Node.js 22.x: Primary runtime with ES modules and top-level await
- Browser Environment: WebGL acceleration for neural network training
- Docker Containers: Microservice deployment and scaling

AI/ML Frameworks:
- TensorFlow.js: Browser-based neural network training
- PyTorch (Python bridge): Advanced model architectures
- Hugging Face Transformers: Pre-trained language models
- Custom GNN Implementation: Message passing with configurable architectures

Database Technologies:
- Kuzu Graph Database: Primary graph storage with Cypher queries
- PostgreSQL: Relational data for metadata and configuration
- Redis: Caching layer for frequently accessed data
- Vector Databases (pgvector): Embedding storage and similarity search

Cloud and APIs:
- Azure AI Services: Direct API integration for GitHub Models
- GitHub Models: GPT-5, GPT-4o, Codestral, and specialized models
- OpenAI API: Alternative provider with structured output support
- Anthropic Claude: Via Claude Code CLI for codebase-aware tasks

PERFORMANCE CHARACTERISTICS:

Current Benchmarks:
- GNN Training Speed: 1000-5000 nodes/second depending on complexity
- Graph Query Latency: 1-50ms for typical traversals
- LLM Response Time: 200-2000ms depending on provider and context size
- Memory Usage: 50-500MB for typical graph analysis tasks
- Token Processing: 1000-4000 tokens/second for analysis tasks

Scalability Targets:
- Graph Size: Support for 1M+ nodes and 10M+ edges
- Concurrent Users: 100+ simultaneous analysis sessions
- Model Training: Distributed training across multiple GPUs
- API Throughput: 10,000+ requests/minute with load balancing

ANALYSIS REQUIREMENTS:

Please provide a comprehensive technical assessment covering:

1. ARCHITECTURAL ANALYSIS:
   - Evaluate the current microservice architecture
   - Identify potential bottlenecks and single points of failure
   - Assess the coupling between domains and recommend improvements
   - Analyze the data flow patterns and suggest optimizations

2. PERFORMANCE OPTIMIZATION:
   - Identify performance bottlenecks in each domain
   - Recommend specific optimization strategies
   - Suggest caching strategies and data structure improvements
   - Evaluate the current concurrency and parallelization approaches

3. SCALABILITY ASSESSMENT:
   - Analyze horizontal scaling capabilities
   - Recommend database sharding and partitioning strategies
   - Evaluate load balancing and distribution mechanisms
   - Suggest improvements for handling increased load

4. INTEGRATION IMPROVEMENTS:
   - Assess the current API design and suggest improvements
   - Evaluate error handling and resilience patterns
   - Recommend monitoring and observability enhancements
   - Suggest API versioning and backward compatibility strategies

5. TECHNOLOGY MODERNIZATION:
   - Evaluate current technology choices and suggest alternatives
   - Recommend new tools and frameworks that could improve performance
   - Assess the potential for adopting new AI/ML techniques
   - Suggest improvements to the development and deployment pipeline

6. SECURITY AND RELIABILITY:
   - Analyze current security measures and suggest improvements
   - Evaluate fault tolerance and disaster recovery capabilities
   - Recommend data backup and consistency strategies
   - Assess compliance with security best practices

Please provide specific, actionable recommendations with implementation priorities and estimated impact on system performance.
`;

    console.log('  - Context size:', comprehensiveContext.length, 'characters');
    console.log('  - Estimated input tokens:', Math.round(comprehensiveContext.length / 4));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: "You are a world-class software architect and AI systems expert with deep expertise in graph neural networks, distributed systems, and high-performance computing. Provide extremely detailed, technical analysis with specific implementation recommendations, code examples, and architectural diagrams described in text. Your analysis should be comprehensive and actionable."
          },
          { 
            role: "user", 
            content: comprehensiveContext
          }
        ],
        model: model,
        max_completion_tokens: 128000 // Full 128K token limit (maximum)
      }
    });

    if (isUnexpected(response)) {
      console.log('Error details:', JSON.stringify(response, null, 2));
      throw new Error(`Full GPT-5 API Error: ${JSON.stringify(response.body?.error || response.body)}`);
    }

    console.log("✅ Full GPT-5 with 130K Context Success!");
    const content = response.body.choices[0].message.content;
    
    console.log('\n📊 Response Analysis:');
    console.log('  - Input length:', comprehensiveContext.length, 'characters');
    console.log('  - Input tokens (est):', Math.round(comprehensiveContext.length / 4));
    console.log('  - Response length:', content.length, 'characters'); 
    console.log('  - Response tokens (est):', Math.round(content.length / 4));
    console.log('  - Model used:', response.body.model);
    console.log('  - Total tokens used (est):', Math.round((comprehensiveContext.length + content.length) / 4));
    
    // Quality assessment
    console.log('\n🎯 Response Quality Assessment:');
    const hasArchitecturalAnalysis = content.toLowerCase().includes('architectural') || content.toLowerCase().includes('architecture');
    const hasPerformanceAnalysis = content.toLowerCase().includes('performance') || content.toLowerCase().includes('optimization');
    const hasScalabilityAnalysis = content.toLowerCase().includes('scalability') || content.toLowerCase().includes('scaling');
    const hasCodeExamples = content.includes('```') || content.includes('function') || content.includes('class');
    const hasSpecificRecommendations = content.toLowerCase().includes('recommend') || content.toLowerCase().includes('suggest');
    
    console.log('  - ✅ Architectural Analysis:', hasArchitecturalAnalysis ? 'Present' : 'Missing');
    console.log('  - ✅ Performance Analysis:', hasPerformanceAnalysis ? 'Present' : 'Missing');
    console.log('  - ✅ Scalability Analysis:', hasScalabilityAnalysis ? 'Present' : 'Missing');
    console.log('  - ✅ Code Examples:', hasCodeExamples ? 'Present' : 'Missing');
    console.log('  - ✅ Specific Recommendations:', hasSpecificRecommendations ? 'Present' : 'Missing');

    // Show structured sections
    console.log('\n📋 Response Structure Preview:');
    const sections = content.split('\n').filter(line => 
      line.startsWith('#') || 
      line.startsWith('##') || 
      line.startsWith('###') ||
      line.match(/^\d+\./) ||
      line.toUpperCase() === line && line.length > 10 && line.length < 100
    ).slice(0, 15);
    
    sections.forEach((section, index) => {
      console.log(`  ${index + 1}. ${section.substring(0, 80)}${section.length > 80 ? '...' : ''}`);
    });

    // Rate limit information
    console.log('\n📊 Rate Limit Status:');
    const headers = response.headers;
    if (headers['x-ratelimit-remaining-requests']) {
      console.log('  - Remaining requests:', headers['x-ratelimit-remaining-requests']);
      console.log('  - Request limit:', headers['x-ratelimit-limit-requests']);
      console.log('  - Remaining tokens:', headers['x-ratelimit-remaining-tokens']);
      console.log('  - Token limit:', headers['x-ratelimit-limit-tokens']);
    }

    // Test completion quality
    const responseComplete = content.length > 10000 && !content.endsWith('...');
    console.log('  - Response appears complete:', responseComplete ? '✅' : '⚠️');
    console.log('  - Likely truncated:', content.length > 100000 ? '⚠️ Very long response' : '✅ Reasonable length');

  } catch (error) {
    console.error("❌ Full GPT-5 test failed:", error.message);
  }
}

testFullGPT5().catch(console.error);