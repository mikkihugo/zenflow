#!/usr/bin/env nodeimport { getLogger } from '../core/logger';
/**
 * @file Test suite for test-monorepo-detection.
 */

const logger = getLogger('src-knowledge-test-monorepo-detection');

/**
 * Test script for monorepo detection in ProjectContextAnalyzer.
 */

import { ProjectContextAnalyzer } from './project-context-analyzer';

async function testMonorepoDetection(projectPath: string) {
  const analyzer = new ProjectContextAnalyzer({
    projectRoot: projectPath,
    swarmConfig: {
      // Minimal config for testing
      name: 'test-analyzer',
      type: 'knowledge',
      maxAgents: 1,
      swarmSize: 1,
      specializations: [],
      parallelQueries: 1,
      loadBalancingStrategy: 'round-robin',
      crossAgentSharing: false,
      factRepoPath: '/tmp/fact',
      anthropicApiKey: 'test',
    },
    analysisDepth: 'shallow',
    autoUpdate: false,
    cacheDuration: 1,
    priorityThresholds: {
      critical: 90,
      high: 70,
      medium: 50,
    },
  });

  // Listen for monorepo detection events
  analyzer.on('monorepoDetected', (data) => {});

  try {
    // Initialize analyzer (which will run monorepo detection)
    await analyzer.initialize();

    // Get monorepo info
    const monorepoInfo = analyzer.getMonorepoInfo();

    if (monorepoInfo && monorepoInfo.type !== 'none') {
      if (monorepoInfo.workspaces) {
      }

      if (monorepoInfo.packages) {
      }
    } else {
    }

    // Check with custom confidence threshold
    const isHighConfidenceMonorepo = analyzer.isMonorepo(0.8);

    // Get full project context
    const status = analyzer.getStatus();
  } catch (error) {
    logger.error('❌ Error during analysis:', error);
  } finally {
    await analyzer.shutdown();
  }
}

// Main execution
async function main() {
  const projectPath = process.argv[2] || process.cwd();

  await testMonorepoDetection(projectPath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { testMonorepoDetection };
