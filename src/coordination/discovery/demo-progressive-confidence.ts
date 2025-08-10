/**
 * @file Demo script for Progressive Confidence Builder
 * Shows how the system builds confidence through iterations.
 */

import { DocumentDrivenSystem } from '@core/document-driven-system';
import { createLogger } from '@core/logger';
import { ProjectContextAnalyzer } from '@knowledge/project-context-analyzer';
import { SessionMemoryStore } from '@memory/memory';
import { DomainAnalysisEngine } from '@tools/domain-splitting/analyzers/domain-analyzer';
import { DomainDiscoveryBridge } from './domain-discovery-bridge';
import { ProgressiveConfidenceBuilder } from './progressive-confidence-builder';

const logger = createLogger({ prefix: 'ProgressiveConfidenceDemo' });

// Mock AGUI interface for demo
class _DemoAGUI {
  async askQuestion(question: any): Promise<string> {
    logger.info('AGUI Question:', {
      type: question.type,
      question: question.question,
      confidence: question.confidence,
    });

    // Simulate user responses
    if (question.id.includes('import')) {
      return 'skip'; // Skip additional imports for demo
    }
    if (question.id.includes('boundary')) {
      return 'Yes'; // Approve domain boundaries
    }
    if (question.id === 'final_validation') {
      return '1'; // Approve and proceed
    }
    return 'Yes';
  }

  async askBatchQuestions(questions: any[]): Promise<string[]> {
    logger.info(`AGUI Batch: ${questions.length} questions`);
    return questions.map(() => 'Yes');
  }

  async showProgress(progress: any): Promise<void> {
    logger.info('Progress Update:', progress);
  }

  async showMessage(message: string): Promise<void> {
    logger.info('AGUI Message:', message);
  }
}

/**
 * Run the progressive confidence builder demo.
 */
async function runDemo() {
  logger.info('Starting Progressive Confidence Builder Demo');

  // Initialize components
  const projectPath = process.cwd();
  const docSystem = new DocumentDrivenSystem();
  const domainAnalyzer = new DomainAnalysisEngine();
  const projectAnalyzer = new ProjectContextAnalyzer(projectPath);
  const memoryStore = new SessionMemoryStore({
    backendConfig: { type: 'json', path: '/tmp/demo-memory.json' },
  });
  // Import the real AGUI adapter
  const { createAGUI } = await import('@interfaces/agui/agui-adapter');
  const agui = createAGUI('terminal');

  // Initialize systems
  await docSystem.initialize(projectPath);
  await projectAnalyzer.initialize();
  await memoryStore.initialize();

  // Create discovery bridge
  const discoveryBridge = new DomainDiscoveryBridge(docSystem, domainAnalyzer, projectAnalyzer);

  // Create progressive confidence builder
  const confidenceBuilder = new ProgressiveConfidenceBuilder(
    discoveryBridge,
    memoryStore,
    agui as any,
    {
      targetConfidence: 0.8,
      maxIterations: 5,
      researchThreshold: 0.6,
    }
  );

  // Listen to progress events
  confidenceBuilder.on('progress', (event) => {
    logger.info('📊 Progress Event:', {
      iteration: event["iteration"],
      confidence: `${(event["confidence"] * 100).toFixed(1)}%`,
      domains: event["domainCount"],
      metrics: Object.entries(event["metrics"])
        .map(([key, value]) => `${key}: ${(value * 100).toFixed(1)}%`)
        .join(', '),
    });
  });

  // Build confidence with some example domains
  const context = {
    projectPath,
    existingDomains: [
      {
        name: 'coordination',
        path: `${projectPath}/src/coordination`,
        files: ['swarm-coordinator.ts', 'hive-swarm-sync.ts', 'agent-manager.ts'],
        confidence: 0.6,
        suggestedConcepts: ['swarm', 'coordination', 'agents', 'distributed'],
        technologies: ['typescript', 'nodejs'],
        relatedDomains: ['neural', 'memory'],
      },
      {
        name: 'neural',
        path: `${projectPath}/src/neural`,
        files: ['neural-network-manager.ts', 'wasm-neural-accelerator.ts', 'neural-models.ts'],
        confidence: 0.5,
        suggestedConcepts: ['neural-network', 'ai', 'wasm', 'training'],
        technologies: ['typescript', 'wasm', 'rust'],
        relatedDomains: ['coordination'],
      },
      {
        name: 'memory',
        path: `${projectPath}/src/memory`,
        files: ['memory.ts', 'sqlite.backend.ts', 'lancedb.backend.ts'],
        confidence: 0.4,
        suggestedConcepts: ['storage', 'persistence', 'database', 'vectors'],
        technologies: ['typescript', 'sqlite', 'lancedb'],
        relatedDomains: ['neural', 'coordination'],
      },
    ],
  };

  try {
    logger.info('Building confidence in domain discovery...\n');

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
  } catch (error) {
    logger.error('Demo failed:', error);
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
