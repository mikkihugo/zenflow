#!/usr/bin/env node

/**
 * Simple SPARC Demo Script
 * Tests the SPARC methodology system with direct imports
 */

import { SPARCEngineCore } from '../sparc/core/sparc-engine.js';
import { SpecificationPhaseEngine } from '../sparc/phases/specification/specification-engine.js';

async function runSPARCDemo() {
  try {
    // Initialize SPARC Engine
    const sparcEngine = new SPARCEngineCore();

    // Create a test project
    const projectSpec = {
      name: 'Demo Swarm Coordinator',
      domain: 'swarm-coordination',
      complexity: 'moderate',
      requirements: [
        'Agent registration and discovery',
        'Intelligent task distribution',
        'Real-time monitoring',
        'Fault tolerance',
      ],
      constraints: ['Sub-100ms coordination latency', 'Support 1000+ agents'],
    };
    const project = await sparcEngine.initializeProject(projectSpec);
    const specResult = await sparcEngine.executePhase(project, 'specification');
    const specEngine = new SpecificationPhaseEngine();
    const _requirements = await specEngine.gatherRequirements({ domain: 'swarm-coordination' });
    const artifacts = await sparcEngine.generateArtifacts(project);
    const validation = await sparcEngine.validateCompletion(project);

    return {
      success: true,
      project,
      results: {
        specification: specResult,
        artifacts,
        validation,
      },
    };
  } catch (error) {
    console.error('❌ SPARC Demo failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSPARCDemo()
    .then((result) => {
      if (result.success) {
        process.exit(0);
      } else {
        console.error('\n💥 Demo failed with error:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { runSPARCDemo };
