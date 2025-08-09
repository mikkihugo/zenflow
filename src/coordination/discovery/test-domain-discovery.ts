#!/usr/bin/env node

/**
 * Test script for Domain Discovery Bridge
 *
 * Demonstrates how the DomainDiscoveryBridge connects document processing
 * with domain analysis to automatically discover domains in a codebase.
 *
 * @example
 * ```bash
 * # Run the test
 * npx ts-node src/coordination/discovery/test-domain-discovery.ts
 *
 * # With a specific project path
 * npx ts-node src/coordination/discovery/test-domain-discovery.ts /path/to/project
 * ```
 */

import { DocumentProcessor } from '../../core/document-processor';
import { EventBus } from '../../core/event-bus';
import { createLogger } from '../../core/logger';
import { MemorySystem } from '../../core/memory-system';
import { WorkflowEngine } from '../../core/workflow-engine';
import { IntelligenceCoordinationSystem } from '../../knowledge/intelligence-coordination-system';
import ProjectContextAnalyzer from '../../knowledge/project-context-analyzer';
import { DomainAnalysisEngine } from '../../tools/domain-splitting/analyzers/domain-analyzer';
import { DomainDiscoveryBridge } from './domain-discovery-bridge';

const logger = createLogger('DomainDiscoveryTest');

/**
 * Test the Domain Discovery Bridge with a real project
 *
 * @param projectPath - Path to the project to analyze
 */
async function testDomainDiscovery(projectPath: string = process.cwd()) {
  try {
    // Create memory system
    const memorySystem = new MemorySystem({
      backend: 'json',
      persistPath: './.claude/cache/domain-discovery-test',
    });
    await memorySystem.initialize();

    // Create workflow engine
    const workflowEngine = new WorkflowEngine({
      workflowPath: './workflows',
      enableMonitoring: true,
    });

    // Create document processor
    const documentProcessor = new DocumentProcessor(memorySystem, workflowEngine, {
      workspaceRoot: projectPath,
      autoWatch: false,
      enableWorkflows: false,
    });
    await documentProcessor.initialize();

    // Create domain analyzer
    const domainAnalyzer = new DomainAnalysisEngine({
      analysisDepth: 'medium',
      includeTests: false,
      includeConfig: false,
      minFilesForSplit: 3,
      coupling: {
        threshold: 0.7,
        maxGroupSize: 10,
      },
    });

    // Create project context analyzer
    const projectAnalyzer = new ProjectContextAnalyzer({
      projectRoot: projectPath,
      swarmConfig: {
        name: 'domain-discovery-test',
        type: 'knowledge',
        maxAgents: 1,
      },
      analysisDepth: 'shallow',
      autoUpdate: false,
      cacheDuration: 1,
    });

    // Create event bus for intelligence coordinator
    const eventBus = new EventBus();

    // Create intelligence coordination system
    const intelligenceCoordinator = new IntelligenceCoordinationSystem(
      {
        expertiseDiscovery: { enabled: true },
        knowledgeRouting: { enabled: true },
        specializationDetection: { enabled: true },
        crossDomainTransfer: { enabled: true },
        collectiveMemory: { enabled: true },
      },
      logger,
      eventBus
    );
    const bridge = new DomainDiscoveryBridge(
      documentProcessor,
      domainAnalyzer,
      projectAnalyzer,
      intelligenceCoordinator,
      {
        confidenceThreshold: 0.6,
        autoDiscovery: true,
        maxDomainsPerDocument: 3,
        useNeuralAnalysis: true,
        enableCache: true,
      }
    );

    // Listen for events
    bridge.on('initialized', () => {});

    bridge.on('discovery:complete', (_results) => {});

    await bridge.initialize();
    const _workspaceId = await documentProcessor.loadWorkspace(projectPath);

    const domains = await bridge.discoverDomains();

    domains.forEach((domain, _index) => {
      if (domain.relatedDomains.length > 0) {
      }
    });

    // Step 6: Show document mappings
    const mappings = bridge.getDocumentMappings();
    if (mappings.size > 0) {
      let mappingIndex = 0;
      mappings.forEach((mapping, _docPath) => {
        if (mappingIndex < 5) {
          mapping.domainIds.forEach((_domainId, _i) => {});
          mappingIndex++;
        }
      });
      if (mappings.size > 5) {
      }
    }

    // Step 7: Monorepo information
    const monorepoInfo = projectAnalyzer.getMonorepoInfo();
    if (monorepoInfo && monorepoInfo.type !== 'none') {
      if (monorepoInfo.packages) {
      }
    }
    const stats = await documentProcessor.getStats();
    Object.entries(stats.byType).forEach(([_type, count]) => {
      if (count > 0) {
      }
    });
    await bridge.shutdown();
    await documentProcessor.shutdown();
    await projectAnalyzer.shutdown();
    await intelligenceCoordinator.shutdown();
    await memorySystem.shutdown();
  } catch (error) {
    logger.error('\n❌ Error during domain discovery test:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const projectPath = process.argv[2] || process.cwd();

  await testDomainDiscovery(projectPath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { testDomainDiscovery };
