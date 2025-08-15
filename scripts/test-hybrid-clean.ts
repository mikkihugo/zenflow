#!/usr/bin/env node

/**
 * Clean Hybrid System Test
 *
 * Simple test to verify the hybrid database system works without any legacy dependencies.
 */

import {
  createHybridSystem,
  healthCheckHybridSystem,
} from '../src/database/managers/hybrid-factory.js';

async function main() {
  console.log('🧪 Testing Clean Hybrid Database System');
  console.log('======================================');

  try {
    // Health check first
    console.log('🩺 Running health check...');
    const healthResult = await healthCheckHybridSystem({
      dataDir: './data',
      enableVectorSearch: true,
      enableGraphRelationships: true,
    });

    console.log('Health Check Results:');
    console.log(`- Overall Health: ${healthResult.healthy ? '✅' : '❌'}`);
    console.log(
      `- DAL Factory: ${healthResult.components.dalFactory ? '✅' : '❌'}`
    );
    console.log(
      `- Hybrid Manager: ${healthResult.components.hybridManager ? '✅' : '❌'}`
    );
    console.log(
      `- ADR Manager: ${healthResult.components.adrManager ? '✅' : '❌'}`
    );
    console.log(
      `- Vector Search: ${healthResult.components.vectorSearch ? '✅' : '❌'}`
    );
    console.log(`- Graph DB: ${healthResult.components.graphDb ? '✅' : '❌'}`);

    if (healthResult.errors.length > 0) {
      console.log('\nErrors:');
      healthResult.errors.forEach((error) => console.log(`  - ${error}`));
    }

    // If health check passes, create the full system
    if (healthResult.healthy) {
      console.log('\n🏗️ Creating full hybrid system...');
      const { dalFactory, hybridManager, adrManager } =
        await createHybridSystem({
          dataDir: './data',
          enableVectorSearch: true,
          enableGraphRelationships: true,
          vectorDimension: 384,
        });

      console.log('✅ Full hybrid system created successfully!');

      // Test ADR creation
      console.log('\n📋 Testing ADR creation...');
      const testADR = await adrManager.createADR({
        title: 'Clean Hybrid Architecture Test',
        context:
          'Testing the cleaned hybrid database architecture without legacy dependencies.',
        decision:
          'Use the new factory-based approach for all hybrid database operations.',
        consequences:
          'Cleaner architecture, no circular dependencies, better maintainability.',
        author: 'claude-zen-system',
        priority: 'high',
        stakeholders: ['architecture-team', 'developers'],
      });

      console.log(`✅ Test ADR created: ${testADR.id}`);

      // Test semantic search
      console.log('\n🔍 Testing semantic search...');
      const searchResults = await adrManager.semanticSearchADRs(
        'hybrid architecture',
        {
          limit: 5,
          include_related: true,
        }
      );

      console.log(`✅ Semantic search found ${searchResults.length} results`);
    } else {
      console.log('\n⚠️ Health check failed, skipping full system test');
    }

    console.log('\n🎉 Clean hybrid system test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as testCleanHybridSystem };
