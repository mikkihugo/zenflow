#!/usr/bin/env node

/**
 * Quick Test - Verify Steering Framework Basic Functionality
 * 
 * A simple test to validate the framework is working correctly
 * without running the full comprehensive test suite.
 */

import { SteeringTestFramework, MockMaestroOrchestrator } from './steering-test-framework.js';

console.log('🧪 QUICK STEERING FRAMEWORK TEST');
console.log('='.repeat(50));

try {
  // Test 1: Basic mock orchestrator functionality
  console.log('1️⃣ Testing mock orchestrator...');
  const orchestrator = new MockMaestroOrchestrator();
  
  const domain = 'quick-test';
  const content = 'Basic test content for quick validation.';
  
  const docPath = await orchestrator.createSteeringDocument(domain, content);
  console.log(`   ✅ Document created at: ${docPath}`);
  
  // Test 2: Check document content
  console.log('2️⃣ Validating document content...');
  const doc = orchestrator.steeringDocuments.get(domain);
  if (doc && doc.content.includes(content)) {
    console.log('   ✅ Content validation passed');
  } else {
    throw new Error('Content validation failed');
  }
  
  // Test 3: Agent pool functionality
  console.log('3️⃣ Testing agent pool...');
  const agentId = await orchestrator.createAgent('test-agent', { test: true });
  const poolStats = orchestrator.getAgentPoolStats();
  
  if (poolStats.totalAgents > 0) {
    console.log(`   ✅ Agent pool working (${poolStats.totalAgents} agents)`);
  } else {
    throw new Error('Agent pool test failed');
  }
  
  // Test 4: Performance metrics
  console.log('4️⃣ Checking performance metrics...');
  const metrics = orchestrator.getPerformanceMetrics();
  if (metrics.createSteeringDocument.length > 0) {
    const avgTime = metrics.createSteeringDocument.reduce((a, b) => a + b, 0) / metrics.createSteeringDocument.length;
    console.log(`   ✅ Performance tracking working (${avgTime.toFixed(1)}ms avg)`);
  } else {
    throw new Error('Performance metrics test failed');
  }
  
  console.log('\n🎉 Quick test completed successfully!');
  console.log('✅ All core components are working correctly');
  console.log('\n💡 To run comprehensive tests: npm test');
  console.log('💡 To run specific test suites: npm run test:unit|integration|quality|performance');
  
} catch (error) {
  console.error('\n❌ Quick test failed:', error.message);
  process.exit(1);
}