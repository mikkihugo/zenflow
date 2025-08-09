/**
 * UACL Knowledge Client Example.
 *
 * Demonstrates how to use the unified Knowledge Client Adapter.
 * with FACT integration through the UACL interface.
 *
 * This example shows:
 * - Creating FACT-based knowledge clients
 * - Performing various knowledge queries
 * - Using helper methods for common tasks
 * - Monitoring client health and metrics
 */
/**
 * @file Interface implementation: knowledge-client-example.
 */



import { getConfig } from '../config';
import {
  createFACTClient,
  type KnowledgeClientAdapter,
  KnowledgeHelpers,
  type KnowledgeRequest,
  type KnowledgeResponse,
} from '../adapters/knowledge-client-adapter';
import { UACLFactory } from '../factories';

/**
 * Example 1: Create FACT-based Knowledge Client using convenience function.
 */
export async function example1_CreateFACTClient(): Promise<void> {
  try {
    // Create FACT client with minimal configuration
    const knowledgeClient = await createFACTClient(
      './FACT', // FACT repository path
      (() => {
        const config = getConfig();
        if (!config?.services?.anthropic?.apiKey) {
          throw new Error('Anthropic API key is required for knowledge client');
        }
        return config?.services?.anthropic?.apiKey;
      })(),
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

    // Check health
    const _isHealthy = await knowledgeClient.health();

    // Get metadata
    const _metadata = await knowledgeClient.getMetadata();

    // Cleanup
    await knowledgeClient.disconnect();
  } catch (error) {
    console.error('❌ Example 1 failed:', error);
  }
}

/**
 * Example 2: Create Knowledge Client using UACL Factory.
 */
export async function example2_CreateWithFactory(): Promise<void> {
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
        anthropicApiKey: (() => {
          const config = getConfig();
          if (!config?.services?.anthropic?.apiKey) {
            throw new Error('Anthropic API key is required for knowledge client');
          }
          return config?.services?.anthropic?.apiKey;
        })(),
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

    // Connect and test
    await knowledgeClient.connect();

    // Get knowledge statistics
    const _stats = await knowledgeClient.getKnowledgeStats();

    await knowledgeClient.disconnect();
  } catch (error) {
    console.error('❌ Example 2 failed:', error);
  }
}

/**
 * Example 3: Perform Knowledge Queries.
 */
export async function example3_PerformQueries(): Promise<void> {
  try {
    const knowledgeClient = await createFACTClient(
      './FACT',
      (() => {
        const config = getConfig();
        if (!config?.services?.anthropic?.apiKey) {
          if (config?.environment?.isDevelopment) {
            console.warn('Using fallback API key for development');
            return 'test-key-development';
          }
          throw new Error('Anthropic API key is required');
        }
        return config?.services?.anthropic?.apiKey;
      })()
    );
    await knowledgeClient.connect();
    const basicQuery: KnowledgeRequest = {
      query: 'How to implement JWT authentication in Node.js Express?',
      type: 'semantic',
      tools: ['web_scraper', 'stackoverflow_search'],
      metadata: { category: 'authentication' },
    };

    const _basicResponse = await knowledgeClient.send<KnowledgeResponse>(basicQuery);
    const _docResponse = await knowledgeClient.query(
      'Get React 18 hooks documentation with examples',
      {
        limit: 5,
        includeMetadata: true,
        filters: { framework: 'react', version: '18' },
      }
    );
    const _semanticResults = await knowledgeClient.semanticSearch(
      'best practices for API error handling',
      {
        vectorSearch: true,
        similarity: 'cosine',
        threshold: 0.7,
        limit: 3,
      }
    );
    const _searchResults = await knowledgeClient.search('typescript generics', {
      fuzzy: true,
      threshold: 0.8,
      fields: ['title', 'content'],
      limit: 5,
    });

    await knowledgeClient.disconnect();
  } catch (error) {
    console.error('❌ Example 3 failed:', error);
  }
}

/**
 * Example 4: Using Knowledge Helper Functions.
 */
export async function example4_UseHelpers(): Promise<void> {
  try {
    const knowledgeClient = await createFACTClient(
      './FACT',
      (() => {
        const config = getConfig();
        if (!config?.services?.anthropic?.apiKey) {
          if (config?.environment?.isDevelopment) {
            console.warn('Using fallback API key for development');
            return 'test-key-development';
          }
          throw new Error('Anthropic API key is required');
        }
        return config?.services?.anthropic?.apiKey;
      })()
    );
    await knowledgeClient.connect();
    const _reactDocs = await KnowledgeHelpers.getDocumentation(knowledgeClient, 'react', '18');
    const _expressAPI = await KnowledgeHelpers.getAPIReference(
      knowledgeClient,
      'express',
      'app.use'
    );
    const _communityResults = await KnowledgeHelpers.searchCommunity(
      knowledgeClient,
      'docker container optimization',
      ['docker', 'performance', 'optimization']
    );

    await knowledgeClient.disconnect();
  } catch (error) {
    console.error('❌ Example 4 failed:', error);
  }
}

/**
 * Example 5: Monitor Client Performance and Health.
 */
export async function example5_MonitorPerformance(): Promise<void> {
  try {
    const knowledgeClient = await createFACTClient(
      './FACT',
      (() => {
        const config = getConfig();
        if (!config?.services?.anthropic?.apiKey) {
          if (config?.environment?.isDevelopment) {
            console.warn('Using fallback API key for development');
            return 'test-key-development';
          }
          throw new Error('Anthropic API key is required');
        }
        return config?.services?.anthropic?.apiKey;
      })()
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

    for (const [_index, query] of queries.entries()) {
      const _response = await knowledgeClient.query(query, {
        includeMetadata: true,
      });
    }

    // Get comprehensive metadata with metrics
    const _metadata = await knowledgeClient.getMetadata();

    // Health check
    const _isHealthy = await knowledgeClient.health();

    await knowledgeClient.disconnect();
  } catch (error) {
    console.error('❌ Example 5 failed:', error);
  }
}

/**
 * Example 6: Error Handling and Resilience.
 */
export async function example6_ErrorHandling(): Promise<void> {
  try {
    // Create client with invalid configuration to test error handling
    const knowledgeClient = await createFACTClient(
      './INVALID_FACT_PATH', // Invalid path
      'invalid-api-key-for-testing', // Invalid API key for testing
      {
        timeout: 5000, // Short timeout for testing
        caching: { enabled: false, prefix: 'test', ttlSeconds: 60, minTokens: 100 },
      }
    );

    try {
      await knowledgeClient.connect();
    } catch (_error) {}

    // Test health check with disconnected client
    const _isHealthy = await knowledgeClient.health();

    // Test query with disconnected client
    try {
      await knowledgeClient.query('test query');
    } catch (_error) {}
  } catch (_error) {}
}

/**
 * Run all examples.
 */
export async function runAllExamples(): Promise<void> {
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
  }
}

/**
 * CLI entry point.
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
