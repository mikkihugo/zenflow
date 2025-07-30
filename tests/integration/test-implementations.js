#!/usr/bin/env node

/**
 * Test script for Neural Engine and Queen implementations
 */

import { NeuralEngine } from './src/neural/neural-engine.js';
import { QueenCoordinator } from './src/queens/queen-coordinator.js';

async function testNeuralEngine() {
  console.warn('🧠 Testing Neural Engine...');

  try {
    const engine = new NeuralEngine();

    // Initialize
    console.warn('Initializing neural engine...');
    const initialized = await engine.initialize();
    console.warn('Initialized:', initialized);

    // Get available models
    const models = engine.getAvailableModels();
    console.warn('Available models:', models.length);

    // Try loading a model
    console.warn('Loading code-completion-base model...');
    const loaded = await engine.loadModel('code-completion-base');
    console.warn('Model loaded:', loaded);

    // Test inference
    console.warn('Testing inference...');
    const result = await engine.inference('create a function to calculate fibonacci numbers');
    console.warn('Generated code:');
    console.warn(result.text);
    console.warn('Confidence:', `${(result.confidence * 100).toFixed(1)}%`);

    // Get performance metrics
    const metrics = engine.getPerformanceMetrics();
    console.warn('Performance metrics:', metrics);

    console.warn('✅ Neural Engine test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Neural Engine test failed:', error.message);
    return false;
  }
}

async function testQueenCoordinator() {
  console.warn('\n👑 Testing Queen Coordinator...');

  try {
    const coordinator = new QueenCoordinator({
      maxConcurrentTasks: 10,
      enableLoadBalancing: true,
      consensusThreshold: 0.7,
    });

    // Start coordinator
    console.warn('Starting queen coordinator...');
    await coordinator.start();
    console.warn('Coordinator started');

    // Get queens
    const queens = coordinator.getQueens();
    console.warn('Available queens:', Object.keys(queens));

    // Submit a simple task
    console.warn('Submitting task to queens...');
    const taskId = await coordinator.submitTask('create a simple hello world function', {
      type: 'code-generation',
      priority: 'medium',
    });
    console.warn('Task submitted:', taskId);

    // Wait for completion
    console.warn('Waiting for task completion...');
    const result = await coordinator.waitForTask(taskId, 30000);

    console.warn('Task completed!');
    console.warn('Queen:', result.queenName);
    console.warn('Confidence:', `${(result.confidence * 100).toFixed(1)}%`);
    console.warn('Recommendation:');
    console.warn(result.recommendation);

    // Get metrics
    const metrics = coordinator.getMetrics();
    console.warn('Coordinator metrics:', metrics);

    // Stop coordinator
    await coordinator.stop();
    console.warn('✅ Queen Coordinator test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Queen Coordinator test failed:', error.message);
    return false;
  }
}

async function testQueenCollaboration() {
  console.warn('\n🤝 Testing Queen Collaboration...');

  try {
    const coordinator = new QueenCoordinator({
      maxConcurrentTasks: 10,
      enableLoadBalancing: true,
      consensusThreshold: 0.6,
    });

    await coordinator.start();

    // Create a task that requires collaboration
    const task = {
      id: `collab_test_${Date.now()}`,
      type: 'code-generation',
      prompt: 'create a secure user authentication system with proper error handling',
      priority: 'high',
      context: {
        language: 'javascript',
        framework: 'express',
      },
    };

    console.warn('Testing queen collaboration...');
    const consensus = await coordinator.executeTask(task, true); // Require consensus

    console.warn('Collaboration completed!');
    console.warn('Decision:', consensus.decision);
    console.warn('Confidence:', `${(consensus.confidence * 100).toFixed(1)}%`);
    console.warn('Method:', consensus.method);
    console.warn('Participants:', consensus.participants);
    console.warn('Reasoning:', consensus.reasoning);

    if (consensus.dissenting && consensus.dissenting.length > 0) {
      console.warn('Dissenting views:', consensus.dissenting.length);
    }

    await coordinator.stop();
    console.warn('✅ Queen Collaboration test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Queen Collaboration test failed:', error.message);
    return false;
  }
}

async function main() {
  console.warn('🧪 Claude Code Zen - Neural & Queen Implementation Tests');
  console.warn('='.repeat(60));

  const tests = [
    { name: 'Neural Engine', fn: testNeuralEngine },
    { name: 'Queen Coordinator', fn: testQueenCoordinator },
    { name: 'Queen Collaboration', fn: testQueenCollaboration },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.warn(`\n🧪 Running ${test.name} test...`);
    const success = await test.fn();

    if (success) {
      passed++;
      console.warn(`✅ ${test.name} test PASSED`);
    } else {
      failed++;
      console.warn(`❌ ${test.name} test FAILED`);
    }
  }

  console.warn(`\n${'='.repeat(60)}`);
  console.warn(`📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.warn('🎉 All tests passed! Neural and Queen implementations are working correctly.');
  } else {
    console.warn('⚠️ Some tests failed. Check the error messages above.');
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

main().catch((error) => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
