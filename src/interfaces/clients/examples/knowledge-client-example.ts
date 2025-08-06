/**
 * UACL Knowledge Client Example
 *
 * Demonstrates how to use the unified Knowledge Client Adapter
 * with FACT integration through the UACL interface.
 *
 * This example shows:
 * - Creating FACT-based knowledge clients
 * - Performing various knowledge queries
 * - Using helper methods for common tasks
 * - Monitoring client health and metrics
 */

import {
  createCustomKnowledgeClient,
  createFACTClient,
  type KnowledgeClientAdapter,
  type KnowledgeClientConfig,
  KnowledgeClientFactory,
  KnowledgeHelpers,
  type KnowledgeRequest,
  type KnowledgeResponse,
} from '../adapters/knowledge-client-adapter';

import { createClient, UACLFactory } from '../factories';

import { ClientTypes, ProtocolTypes } from '../types';

/**
 * Example 1: Create FACT-based Knowledge Client using convenience function
 */
export async function example1_CreateFACTClient(): Promise<void> {
  console.log('🚀 Example 1: Creating FACT-based Knowledge Client');

  try {
    // Create FACT client with minimal configuration
    const knowledgeClient = await createFACTClient(
      './FACT', // FACT repository path
      process.env.ANTHROPIC_API_KEY || 'your-api-key',
      {
        caching: {
          enabled: true,
          prefix: 'example-cache',
          ttlSeconds: 1800,
          minTokens: 300,
        },
        tools: [
          'web_scraper',
          'documentation_parser',
          'api_documentation_scraper',
          'stackoverflow_search',
        ],
      }
    );

    // Connect to the service
    await knowledgeClient.connect();
    console.log('✅ Connected to FACT knowledge service');

    // Check health
    const isHealthy = await knowledgeClient.health();
    console.log(`📊 Health Status: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);

    // Get metadata
    const metadata = await knowledgeClient.getMetadata();
    console.log('📋 Client Metadata:', {
      protocol: metadata.protocol,
      version: metadata.version,
      features: metadata.features,
      connected: metadata.connection.connected,
    });

    // Cleanup
    await knowledgeClient.disconnect();
    console.log('✅ Example 1 completed successfully\n');
  } catch (error) {
    console.error('❌ Example 1 failed:', error);
  }
}

/**
 * Example 2: Create Knowledge Client using UACL Factory
 */
export async function example2_CreateWithFactory(): Promise<void> {
  console.log('🏭 Example 2: Creating Knowledge Client with UACL Factory');

  try {
    // Create factory
    const factory = new UACLFactory(
      console, // Simple logger
      {} // Config
    );

    // Create knowledge client using factory
    const knowledgeClient = (await factory.createKnowledgeClient('fact://local', {
      provider: 'fact',
      factConfig: {
        factRepoPath: './FACT',
        anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key',
        pythonPath: 'python3',
      },
      caching: {
        enabled: true,
        prefix: 'factory-cache',
        ttlSeconds: 3600,
        minTokens: 500,
      },
      timeout: 30000,
    })) as KnowledgeClientAdapter;

    console.log('✅ Knowledge client created via factory');

    // Connect and test
    await knowledgeClient.connect();

    // Get knowledge statistics
    const stats = await knowledgeClient.getKnowledgeStats();
    console.log('📊 Knowledge Stats:', {
      totalEntries: stats.totalEntries,
      categories: Object.keys(stats.categories),
      averageResponseTime: stats.averageResponseTime,
      indexHealth: stats.indexHealth,
    });

    await knowledgeClient.disconnect();
    console.log('✅ Example 2 completed successfully\n');
  } catch (error) {
    console.error('❌ Example 2 failed:', error);
  }
}

/**
 * Example 3: Perform Knowledge Queries
 */
export async function example3_PerformQueries(): Promise<void> {
  console.log('🔍 Example 3: Performing Knowledge Queries');

  try {
    const knowledgeClient = await createFACTClient(
      './FACT',
      process.env.ANTHROPIC_API_KEY || 'test'
    );
    await knowledgeClient.connect();

    // 1. Basic knowledge query
    console.log('📚 Performing basic knowledge query...');
    const basicQuery: KnowledgeRequest = {
      query: 'How to implement JWT authentication in Node.js Express?',
      type: 'semantic',
      tools: ['web_scraper', 'stackoverflow_search'],
      metadata: { category: 'authentication' },
    };

    const basicResponse = await knowledgeClient.send<KnowledgeResponse>(basicQuery);
    console.log('✅ Basic Query Result:', {
      queryId: basicResponse.queryId,
      executionTime: basicResponse.executionTimeMs,
      cacheHit: basicResponse.cacheHit,
      toolsUsed: basicResponse.toolsUsed,
      confidence: basicResponse.confidence,
      responseLength: basicResponse.response.length,
    });

    // 2. Documentation query using IKnowledgeClient interface
    console.log('📖 Querying React documentation...');
    const docResponse = await knowledgeClient.query(
      'Get React 18 hooks documentation with examples',
      {
        limit: 5,
        includeMetadata: true,
        filters: { framework: 'react', version: '18' },
      }
    );
    console.log('✅ Documentation Query Result:', {
      queryId: docResponse.queryId,
      toolsUsed: docResponse.toolsUsed,
      confidence: docResponse.confidence,
    });

    // 3. Semantic search
    console.log('🔬 Performing semantic search...');
    const semanticResults = await knowledgeClient.semanticSearch(
      'best practices for API error handling',
      {
        vectorSearch: true,
        similarity: 'cosine',
        threshold: 0.7,
        limit: 3,
      }
    );
    console.log('✅ Semantic Search Results:', semanticResults.length, 'results found');

    // 4. Search with fuzzy matching
    console.log('🔎 Performing fuzzy search...');
    const searchResults = await knowledgeClient.search('typescript generics', {
      fuzzy: true,
      threshold: 0.8,
      fields: ['title', 'content'],
      limit: 5,
    });
    console.log('✅ Fuzzy Search Results:', searchResults.length, 'results found');

    await knowledgeClient.disconnect();
    console.log('✅ Example 3 completed successfully\n');
  } catch (error) {
    console.error('❌ Example 3 failed:', error);
  }
}

/**
 * Example 4: Using Knowledge Helper Functions
 */
export async function example4_UseHelpers(): Promise<void> {
  console.log('🛠️ Example 4: Using Knowledge Helper Functions');

  try {
    const knowledgeClient = await createFACTClient(
      './FACT',
      process.env.ANTHROPIC_API_KEY || 'test'
    );
    await knowledgeClient.connect();

    // 1. Get documentation using helper
    console.log('📚 Getting React documentation...');
    const reactDocs = await KnowledgeHelpers.getDocumentation(knowledgeClient, 'react', '18');
    console.log('✅ React Documentation Retrieved:', {
      queryId: reactDocs.queryId,
      executionTime: reactDocs.executionTimeMs,
      cacheHit: reactDocs.cacheHit,
    });

    // 2. Get API reference using helper
    console.log('🔗 Getting Express.js API reference...');
    const expressAPI = await KnowledgeHelpers.getAPIReference(
      knowledgeClient,
      'express',
      'app.use'
    );
    console.log('✅ Express API Reference Retrieved:', {
      queryId: expressAPI.queryId,
      toolsUsed: expressAPI.toolsUsed,
      confidence: expressAPI.confidence,
    });

    // 3. Search community knowledge using helper
    console.log('👥 Searching community knowledge...');
    const communityResults = await KnowledgeHelpers.searchCommunity(
      knowledgeClient,
      'docker container optimization',
      ['docker', 'performance', 'optimization']
    );
    console.log('✅ Community Search Results:', communityResults.length, 'results found');

    await knowledgeClient.disconnect();
    console.log('✅ Example 4 completed successfully\n');
  } catch (error) {
    console.error('❌ Example 4 failed:', error);
  }
}

/**
 * Example 5: Monitor Client Performance and Health
 */
export async function example5_MonitorPerformance(): Promise<void> {
  console.log('📊 Example 5: Monitoring Client Performance and Health');

  try {
    const knowledgeClient = await createFACTClient(
      './FACT',
      process.env.ANTHROPIC_API_KEY || 'test'
    );
    await knowledgeClient.connect();

    // Perform several queries to generate metrics
    const queries = [
      'What is TypeScript?',
      'How to use React hooks?',
      'Node.js best practices',
      'Docker container optimization',
      'API rate limiting strategies',
    ];

    console.log('🔄 Performing multiple queries to generate metrics...');

    for (const [index, query] of queries.entries()) {
      console.log(`   Query ${index + 1}: ${query.substring(0, 30)}...`);

      const response = await knowledgeClient.query(query, {
        includeMetadata: true,
      });

      console.log(`   ✅ Completed in ${response.executionTimeMs}ms (Cache: ${response.cacheHit})`);
    }

    // Get comprehensive metadata with metrics
    const metadata = await knowledgeClient.getMetadata();
    console.log('📈 Performance Metrics:', {
      totalRequests: metadata.metrics.totalRequests,
      successfulRequests: metadata.metrics.successfulRequests,
      failedRequests: metadata.metrics.failedRequests,
      averageResponseTime: metadata.metrics.averageResponseTime,
      uptime: metadata.metrics.uptime,
      connectionDuration: metadata.connection.connectionDuration,
    });

    console.log('🎯 Custom Metrics:', {
      provider: metadata.custom?.provider,
      factMetrics: {
        totalQueries: metadata.custom?.factMetrics?.totalQueries,
        cacheHitRate: metadata.custom?.factMetrics?.cacheHitRate,
        averageLatency: metadata.custom?.factMetrics?.averageLatency,
        errorRate: metadata.custom?.factMetrics?.errorRate,
      },
      cacheConfig: metadata.custom?.cacheConfig,
      availableTools: metadata.custom?.tools?.length,
    });

    // Health check
    const isHealthy = await knowledgeClient.health();
    console.log(`🏥 Final Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);

    await knowledgeClient.disconnect();
    console.log('✅ Example 5 completed successfully\n');
  } catch (error) {
    console.error('❌ Example 5 failed:', error);
  }
}

/**
 * Example 6: Error Handling and Resilience
 */
export async function example6_ErrorHandling(): Promise<void> {
  console.log('🛡️ Example 6: Error Handling and Resilience Testing');

  try {
    // Create client with invalid configuration to test error handling
    const knowledgeClient = await createFACTClient(
      './INVALID_FACT_PATH', // Invalid path
      'invalid-api-key', // Invalid API key
      {
        timeout: 5000, // Short timeout for testing
        caching: { enabled: false, prefix: 'test', ttlSeconds: 60, minTokens: 100 },
      }
    );

    console.log('⚠️ Testing with invalid configuration...');

    try {
      await knowledgeClient.connect();
      console.log('⚠️ Unexpected: Connection succeeded with invalid config');
    } catch (error) {
      console.log('✅ Expected: Connection failed with invalid config');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test health check with disconnected client
    const isHealthy = await knowledgeClient.health();
    console.log(
      `🏥 Health check with invalid config: ${isHealthy ? 'Healthy' : 'Unhealthy (Expected)'}`
    );

    // Test query with disconnected client
    try {
      await knowledgeClient.query('test query');
      console.log('⚠️ Unexpected: Query succeeded with disconnected client');
    } catch (error) {
      console.log('✅ Expected: Query failed with disconnected client');
    }

    console.log('✅ Example 6 completed successfully\n');
  } catch (error) {
    console.log(
      '✅ Expected error during client creation:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    console.log('✅ Example 6 completed successfully\n');
  }
}

/**
 * Run all examples
 */
export async function runAllExamples(): Promise<void> {
  console.log('🚀 Running UACL Knowledge Client Examples\n');
  console.log('='.repeat(60));

  const examples = [
    example1_CreateFACTClient,
    example2_CreateWithFactory,
    example3_PerformQueries,
    example4_UseHelpers,
    example5_MonitorPerformance,
    example6_ErrorHandling,
  ];

  for (const example of examples) {
    try {
      await example();
    } catch (error) {
      console.error(`❌ Example failed:`, error);
    }
    console.log('-'.repeat(60));
  }

  console.log('🎉 All UACL Knowledge Client Examples Completed!');
}

/**
 * CLI entry point
 */
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export default {
  example1_CreateFACTClient,
  example2_CreateWithFactory,
  example3_PerformQueries,
  example4_UseHelpers,
  example5_MonitorPerformance,
  example6_ErrorHandling,
  runAllExamples,
};
