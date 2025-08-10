/**
 * @file Simplified Demo for Progressive Confidence Builder
 * Shows how the system builds confidence through iterations without external dependencies.
 */

import { createLogger } from '@core/logger';
import { createAGUI } from '@interfaces/agui/agui-adapter';
import { SessionMemoryStore } from '@memory/memory';
import { ProgressiveConfidenceBuilder } from './progressive-confidence-builder';

const logger = createLogger({ prefix: 'ProgressiveConfidenceDemo' });

// Mock discovery bridge that provides basic domain information
class MockDomainDiscoveryBridge {
  async discoverDomains(context: any) {
    // Return some mock domains based on the context
    return context.existingDomains || [];
  }

  on() {} // Mock event listener
  emit() {} // Mock event emitter
}

// Mock HiveFACT system
class MockHiveFACT {
  async searchFacts(query: any) {
    // Return mock research results based on the query
    const mockFacts = [
      {
        id: `fact-${Date.now()}`,
        type: 'general',
        subject: query.query,
        content: `Mock research result for: ${query.query}`,
        metadata: {
          source: 'mock-source',
          timestamp: Date.now(),
          confidence: 0.8,
        },
        accessCount: 1,
        swarmAccess: new Set(),
      },
    ];

    logger.info(`Mock HiveFACT search for: ${query.query}`);
    return mockFacts;
  }
}

/**
 * Run the progressive confidence builder demo.
 */
async function runDemo() {
  logger.info('🚀 Starting Progressive Confidence Builder Demo (Simplified)');

  // Initialize components with mocks
  const mockDiscoveryBridge = new MockDomainDiscoveryBridge();
  const memoryStore = new SessionMemoryStore({
    backendConfig: { type: 'json', path: '/tmp/demo-memory.json' },
  });
  const agui = createAGUI('mock');

  // Initialize memory store
  await memoryStore.initialize();

  // Mock the HiveFACT globally
  const mockHiveFACT = new MockHiveFACT();
  (global as any).mockHiveFACT = mockHiveFACT;

  // Create progressive confidence builder
  const confidenceBuilder = new ProgressiveConfidenceBuilder(
    mockDiscoveryBridge as any,
    memoryStore,
    agui,
    {
      targetConfidence: 0.8,
      maxIterations: 3,
      researchThreshold: 0.6,
    }
  );

  // Listen to progress events
  confidenceBuilder.on('progress', (event) => {
    logger.info('📊 Progress Event:', {
      iteration: event['iteration'],
      confidence: `${(event['confidence'] * 100).toFixed(1)}%`,
      domains: event['domainCount'],
      metrics: Object.entries(event['metrics'])
        .map(([key, value]) => `${key}: ${(value * 100).toFixed(1)}%`)
        .join(', '),
    });
  });

  // Build confidence with some example domains
  const context = {
    projectPath: process.cwd(),
    existingDomains: [
      {
        name: 'coordination',
        path: `${process.cwd()}/src/coordination`,
        files: ['swarm-coordinator.ts', 'hive-swarm-sync.ts', 'agent-manager.ts'],
        confidence: 0.6,
        suggestedConcepts: ['swarm', 'coordination', 'agents', 'distributed'],
        technologies: ['typescript', 'nodejs'],
        relatedDomains: ['neural', 'memory'],
      },
      {
        name: 'neural',
        path: `${process.cwd()}/src/neural`,
        files: ['neural-network-manager.ts', 'wasm-neural-accelerator.ts', 'neural-models.ts'],
        confidence: 0.5,
        suggestedConcepts: ['neural-network', 'ai', 'wasm', 'training'],
        technologies: ['typescript', 'wasm', 'rust'],
        relatedDomains: ['coordination'],
      },
      {
        name: 'memory',
        path: `${process.cwd()}/src/memory`,
        files: ['memory.ts', 'sqlite.backend.ts', 'lancedb.backend.ts'],
        confidence: 0.4,
        suggestedConcepts: ['storage', 'persistence', 'database', 'vectors'],
        technologies: ['typescript', 'sqlite', 'lancedb'],
        relatedDomains: ['neural', 'coordination'],
      },
    ],
  };

  try {
    logger.info('🔍 Building confidence in domain discovery...\n');

    const result = await confidenceBuilder.buildConfidence(context);

    logger.info('\n🎉 Confidence Building Complete!\n');
    logger.info('Final Results:', {
      domains: result?.domains.size,
      relationships: result?.relationships.length,
      finalConfidence: `${(result?.confidence?.overall * 100).toFixed(1)}%`,
      validations: result?.validationCount,
      research: result?.researchCount,
      learningEvents: result?.learningHistory.length,
    });

    // Show domain details
    logger.info('\n📊 Domain Confidence Scores:');
    for (const [name, domain] of result?.domains) {
      logger.info(`  ${name}: ${(domain.confidence.overall * 100).toFixed(1)}%`, {
        validations: domain.validations.length,
        research: domain.research.length,
        refinements: domain.refinementHistory.length,
      });
    }

    // Show relationships
    if (result?.relationships.length > 0) {
      logger.info('\n🔗 Discovered Relationships:');
      for (const rel of result?.relationships) {
        logger.info(
          `  ${rel.sourceDomain} ${rel.type} ${rel.targetDomain} (${(rel.confidence * 100).toFixed(0)}%)`
        );
      }
    }

    // Show confidence breakdown
    logger.info('\n📈 Confidence Metrics Breakdown:');
    Object.entries(result?.confidence).forEach(([metric, value]) => {
      logger.info(`  ${metric}: ${(value * 100).toFixed(1)}%`);
    });

    logger.info('\n✅ Demo completed successfully!');
  } catch (error) {
    logger.error('Demo failed:', error);
  } finally {
    // Clean up
    if ('mockHiveFACT' in global) {
      delete (global as any).mockHiveFACT;
    }
  }
}

// Run the demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch((error) => {
    logger.error('Demo error:', error);
    process.exit(1);
  });
}

export { runDemo };
