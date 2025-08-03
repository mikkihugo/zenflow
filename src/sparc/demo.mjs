#!/usr/bin/env node

/**
 * Simple SPARC Demo Script
 * Tests the SPARC methodology system with direct imports
 */

import { SPARCEngineCore } from '../sparc/core/sparc-engine.js';
import { SpecificationPhaseEngine } from '../sparc/phases/specification/specification-engine.js';

async function runSPARCDemo() {
  console.log('🚀 Starting SPARC Methodology Demo...\n');

  try {
    // Initialize SPARC Engine
    const sparcEngine = new SPARCEngineCore();
    console.log('✅ SPARC Engine initialized');

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

    console.log('\n📋 Creating SPARC project...');
    const project = await sparcEngine.initializeProject(projectSpec);
    console.log(`   Project ID: ${project.id}`);
    console.log(`   Domain: ${project.domain}`);
    console.log(`   Current Phase: ${project.currentPhase}`);

    // Execute Specification Phase
    console.log('\n📝 Executing Specification Phase...');
    const specResult = await sparcEngine.executePhase(project, 'specification');
    console.log(`   Duration: ${specResult.metrics.duration.toFixed(1)} minutes`);
    console.log(`   Quality Score: ${(specResult.metrics.qualityScore * 100).toFixed(1)}%`);
    console.log(`   Next Phase: ${specResult.nextPhase}`);

    // Test Specification Engine directly
    console.log('\n🔍 Testing Specification Engine...');
    const specEngine = new SpecificationPhaseEngine();
    const requirements = await specEngine.gatherRequirements({ domain: 'swarm-coordination' });
    console.log(`   Gathered ${requirements.length} requirements`);

    // Generate artifacts
    console.log('\n📦 Generating project artifacts...');
    const artifacts = await sparcEngine.generateArtifacts(project);
    console.log(`   Generated ${artifacts.artifacts.length} artifacts`);
    console.log(`   Total size: ${(artifacts.metadata.totalSize / 1024).toFixed(1)} KB`);

    // Validate completion
    console.log('\n🎯 Validating project completion...');
    const validation = await sparcEngine.validateCompletion(project);
    console.log(`   Ready for production: ${validation.readyForProduction ? '✅' : '❌'}`);
    console.log(`   Overall score: ${(validation.score * 100).toFixed(1)}%`);
    console.log(`   Blockers: ${validation.blockers.length}`);

    console.log('\n🎉 SPARC Demo completed successfully!');

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
        console.log('\n📊 Demo Results Summary:');
        console.log(`   Project created: ${result.project.name}`);
        console.log(`   Artifacts generated: ${result.results.artifacts.artifacts.length}`);
        console.log(
          `   Production ready: ${result.results.validation.readyForProduction ? 'Yes' : 'No'}`
        );
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
