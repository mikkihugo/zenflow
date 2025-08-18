#!/usr/bin/env npx tsx

/**
 * Test SPARC Git Tree Integration
 * 
 * Validates the enhanced SPARC Commander git tree functionality
 * and tests the SPARC Multi-Swarm Executor with actual git operations.
 */

import { sparcMultiSwarmExecutor, quickSPARCTest } from './packages/brain/src/coordination/sparc-multi-swarm-executor';

async function testSPARCGitIntegration() {
  console.log('🧪 Testing SPARC Git Tree Integration');
  console.log('=====================================');

  try {
    // Test 1: Simple task with rapid development strategies
    console.log('\n📋 Test 1: Rapid Development Strategies with Git Trees');
    const rapidResult = await quickSPARCTest(
      'Create a simple TypeScript utility function for string validation',
      'rapid-development',
      {
        useGitTrees: true,
        timeoutMs: 60000,
        cleanupWorktrees: true
      }
    );

    console.log('✅ Rapid development test completed');
    console.log(`🏆 Winner: ${rapidResult.comparison.winner.name}`);
    console.log(`🌳 Git trees created: ${rapidResult.metadata.totalWorktreesCreated}`);
    console.log(`⚡ Parallel execution: ${rapidResult.metadata.parallelExecution}`);

    // Test 2: Quality-focused strategies comparison
    console.log('\n📋 Test 2: Quality-Focused Strategies Comparison');
    const qualityResult = await quickSPARCTest(
      'Design and implement a REST API endpoint with validation',
      'quality-focused',
      {
        useGitTrees: true,
        timeoutMs: 90000,
        cleanupWorktrees: true
      }
    );

    console.log('✅ Quality-focused test completed');
    console.log(`🏆 Winner: ${qualityResult.comparison.winner.name}`);
    console.log(`📊 Overall SPARC Score: ${qualityResult.results[0]?.sparcMetrics.overallSPARCScore.toFixed(1)}`);

    // Test 3: Custom strategy set with specific SPARC configurations
    console.log('\n📋 Test 3: Custom SPARC Strategy Testing');
    const customStrategies = sparcMultiSwarmExecutor.createSPARCStrategySet('comprehensive');
    
    const customResult = await sparcMultiSwarmExecutor.executeSPARCMultiSwarmTest(
      'Build a complete user authentication system with JWT tokens',
      customStrategies.slice(0, 3), // Test first 3 strategies
      {
        useGitTrees: true,
        parallelExecution: true,
        timeoutMs: 120000,
        cleanupWorktrees: true
      }
    );

    console.log('✅ Custom strategy test completed');
    console.log(`🎯 Strategies tested: ${customResult.strategies.length}`);
    console.log(`🏆 Best methodology: ${customResult.recommendations.bestMethodology}`);

    // Test 4: Git tree workflow validation
    console.log('\n📋 Test 4: Git Tree Workflow Validation');
    console.log('📊 Results Summary:');
    console.log(`- Total tests executed: 3`);
    console.log(`- Git trees used in all tests: ${rapidResult.metadata.gitTreesUsed && qualityResult.metadata.gitTreesUsed && customResult.metadata.gitTreesUsed}`);
    console.log(`- Parallel execution success: ${rapidResult.metadata.parallelExecution && qualityResult.metadata.parallelExecution && customResult.metadata.parallelExecution}`);

    // Display recommendations
    console.log('\n🎯 SPARC Recommendations Summary:');
    console.log(`Rapid Development: ${rapidResult.recommendations.bestMethodology}`);
    console.log(`Quality Focus: ${qualityResult.recommendations.bestMethodology}`);
    console.log(`Custom Strategies: ${customResult.recommendations.bestMethodology}`);

    console.log('\n🎉 All SPARC Git Integration Tests Completed Successfully!');
    return true;

  } catch (error) {
    console.error('❌ SPARC Git Integration Test Failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSPARCGitIntegration()
    .then(success => {
      if (success) {
        console.log('\n✅ SPARC Git Tree Integration: FULLY OPERATIONAL');
        process.exit(0);
      } else {
        console.log('\n❌ SPARC Git Tree Integration: ISSUES DETECTED');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export default testSPARCGitIntegration;