#!/usr/bin/env node

/**
 * Test script for Neural Engine and Queen implementations
 */

import { NeuralEngine } from './src/neural/neural-engine.js';
import { QueenCoordinator } from './src/queens/queen-coordinator.js';

async function testNeuralEngine() {
  console.log('🧠 Testing Neural Engine...');
  
  try {
    const engine = new NeuralEngine();
    
    // Initialize
    console.log('Initializing neural engine...');
    const initialized = await engine.initialize();
    console.log('Initialized:', initialized);
    
    // Get available models
    const models = engine.getAvailableModels();
    console.log('Available models:', models.length);
    
    // Try loading a model
    console.log('Loading code-completion-base model...');
    const loaded = await engine.loadModel('code-completion-base');
    console.log('Model loaded:', loaded);
    
    // Test inference
    console.log('Testing inference...');
    const result = await engine.inference('create a function to calculate fibonacci numbers');
    console.log('Generated code:');
    console.log(result.text);
    console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%');
    
    // Get performance metrics
    const metrics = engine.getPerformanceMetrics();
    console.log('Performance metrics:', metrics);
    
    console.log('✅ Neural Engine test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Neural Engine test failed:', error.message);
    return false;
  }
}

async function testQueenCoordinator() {
  console.log('\n👑 Testing Queen Coordinator...');
  
  try {
    const coordinator = new QueenCoordinator({
      maxConcurrentTasks: 10,
      enableLoadBalancing: true,
      consensusThreshold: 0.7
    });
    
    // Start coordinator
    console.log('Starting queen coordinator...');
    await coordinator.start();
    console.log('Coordinator started');
    
    // Get queens
    const queens = coordinator.getQueens();
    console.log('Available queens:', Object.keys(queens));
    
    // Submit a simple task
    console.log('Submitting task to queens...');
    const taskId = await coordinator.submitTask('create a simple hello world function', {
      type: 'code-generation',
      priority: 'medium'
    });
    console.log('Task submitted:', taskId);
    
    // Wait for completion
    console.log('Waiting for task completion...');
    const result = await coordinator.waitForTask(taskId, 30000);
    
    console.log('Task completed!');
    console.log('Queen:', result.queenName);
    console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%');
    console.log('Recommendation:');
    console.log(result.recommendation);
    
    // Get metrics
    const metrics = coordinator.getMetrics();
    console.log('Coordinator metrics:', metrics);
    
    // Stop coordinator
    await coordinator.stop();
    console.log('✅ Queen Coordinator test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Queen Coordinator test failed:', error.message);
    return false;
  }
}

async function testQueenCollaboration() {
  console.log('\n🤝 Testing Queen Collaboration...');
  
  try {
    const coordinator = new QueenCoordinator({
      maxConcurrentTasks: 10,
      enableLoadBalancing: true,
      consensusThreshold: 0.6
    });
    
    await coordinator.start();
    
    // Create a task that requires collaboration
    const task = {
      id: 'collab_test_' + Date.now(),
      type: 'code-generation',
      prompt: 'create a secure user authentication system with proper error handling',
      priority: 'high',
      context: {
        language: 'javascript',
        framework: 'express'
      }
    };
    
    console.log('Testing queen collaboration...');
    const consensus = await coordinator.executeTask(task, true); // Require consensus
    
    console.log('Collaboration completed!');
    console.log('Decision:', consensus.decision);
    console.log('Confidence:', (consensus.confidence * 100).toFixed(1) + '%');
    console.log('Method:', consensus.method);
    console.log('Participants:', consensus.participants);
    console.log('Reasoning:', consensus.reasoning);
    
    if (consensus.dissenting && consensus.dissenting.length > 0) {
      console.log('Dissenting views:', consensus.dissenting.length);
    }
    
    await coordinator.stop();
    console.log('✅ Queen Collaboration test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Queen Collaboration test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Claude Code Zen - Neural & Queen Implementation Tests');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Neural Engine', fn: testNeuralEngine },
    { name: 'Queen Coordinator', fn: testQueenCoordinator },
    { name: 'Queen Collaboration', fn: testQueenCollaboration }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} test...`);
    const success = await test.fn();
    
    if (success) {
      passed++;
      console.log(`✅ ${test.name} test PASSED`);
    } else {
      failed++;
      console.log(`❌ ${test.name} test FAILED`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Neural and Queen implementations are working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the error messages above.');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

main().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});