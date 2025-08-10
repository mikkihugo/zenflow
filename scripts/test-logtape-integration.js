#!/usr/bin/env node

/**
 * @file Test script for logtape integration
 * Verifies that @logtape/logtape is working correctly with our configuration
 */

import {
  initializeLogging,
  createClaudeAILogger,
  createClaudeCLILogger,
  createExpressLogger,
  createAppLogger,
  logClaudeOperation,
  logClaudeMetrics,
  logErrorAnalysis,
  logServerEvent
} from '../src/utils/logging-config.js';

async function testLogtapeIntegration() {
  console.log('🧪 Testing @logtape/logtape integration...\n');

  try {
    // Initialize logging
    await initializeLogging();
    console.log('✅ Logging initialization successful');

    // Create loggers
    const logger = createClaudeAILogger();
    const claudeLogger = createClaudeCLILogger();
    const expressLogger = createExpressLogger();
    const appLogger = createAppLogger();
    console.log('✅ Logger creation successful');

    // Test basic logging
    logger.info('Test info message', { test: 'data', timestamp: new Date().toISOString() });
    logger.debug('Test debug message', { detailed: true, level: 'debug' });
    logger.warn('Test warning message', { warning: 'example' });
    
    // Test Express logger
    expressLogger.info('Test Express request', { 
      method: 'GET', 
      url: '/test', 
      statusCode: 200,
      duration: 150 
    });

    // Test App logger  
    appLogger.info('Test application event', {
      event: 'test',
      component: 'logtape-integration-test'
    });
    
    console.log('✅ Basic logging tests successful');

    // Test structured logging functions
    logClaudeOperation(claudeLogger, 'test_operation', {
      testData: true,
      operationId: 'test-123',
      complexity: 'high'
    });

    logClaudeMetrics(claudeLogger, {
      sessionId: 'test-session-456',
      fileName: 'test-file.ts',
      duration_ms: 5000,
      num_turns: 10,
      cost_usd: 0.25,
      exitCode: 0
    });

    const mockErrors = [
      { line: 10, rule: 'no-unused-vars', message: 'Variable not used', severity: 'warning' },
      { line: 25, rule: 'missing-type', message: 'Missing type annotation', severity: 'error' }
    ];

    logErrorAnalysis(logger, 'test-file.ts', mockErrors, {
      'no-unused-vars': 1,
      'missing-type': 1
    });

    // Test server event logging
    logServerEvent(appLogger, 'started', {
      port: 3000,
      host: 'localhost',
      features: { mcp: true, api: true, dashboard: true }
    });

    console.log('✅ Structured logging functions successful');

    console.log('\n🎉 All logtape integration tests passed!');
    console.log('\n📁 Log files should be created at:');
    console.log('   - logs/claude-zen-activity.log (JSON format)');
    console.log('   - logs/ai-fixing-detailed.log (Text format)');

  } catch (error) {
    console.error('❌ Logtape integration test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testLogtapeIntegration().catch(console.error);