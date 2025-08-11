#!/usr/bin/env node

/**
 * Simple test script to validate logtape configuration works
 */

import {
  createClaudeAILogger,
  createClaudeCLILogger,
  initializeLogging,
} from '../src/utils/logging-config.js';

async function testLogtapeConfiguration() {
  // console.log('🧪 Testing logtape configuration...');

  try {
    // Step 1: Initialize logging
    // console.log('📋 Step 1: Initializing logging...');
    await initializeLogging();
    // console.log('✅ Logging initialized successfully');

    // Step 2: Create loggers
    // console.log('📋 Step 2: Creating loggers...');
    const aiLogger = createClaudeAILogger();
    const cliLogger = createClaudeCLILogger();
    // console.log('✅ Loggers created successfully');

    // Step 3: Test basic logging
    // console.log('📋 Step 3: Testing basic logging...');
    aiLogger.info('Test AI logger message', { test: 'data' });
    cliLogger.debug('Test CLI logger message', { session: 'test-123' });
    // console.log('✅ Basic logging works');

    // Step 4: Test structured logging functions
    // console.log('📋 Step 4: Testing structured logging functions...');
    const { logClaudeOperation, logClaudeMetrics } = await import(
      '../src/utils/logging-config.js'
    );

    logClaudeOperation(aiLogger, 'test_operation', {
      filePath: 'test.ts',
      promptLength: 100,
    });

    logClaudeMetrics(cliLogger, {
      sessionId: 'test-session',
      fileName: 'test.ts',
      duration_ms: 1000,
      cost_usd: 0.01,
    });
    // console.log('✅ Structured logging functions work');

    // console.log('🎉 All tests passed! Logtape is working correctly.');
    return true;
  } catch (error) {
    // console.error('❌ Logtape test failed:', error.message);
    // console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
testLogtapeConfiguration().then((success) => {
  if (success) {
    // console.log('✅ Logtape configuration is ready for use');
  } else {
    // console.log('❌ Logtape configuration needs more fixes');
    process.exit(1);
  }
});
