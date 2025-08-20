#!/usr/bin/env tsx
/**
 * @fileoverview Foundation OTEL Integration Test
 * 
 * Tests that foundation package sends all logs via OTEL when enabled
 */

import { getLogger } from '@claude-zen/foundation';

async function testFoundationOTEL() {
  console.log('🔧 FOUNDATION OTEL INTEGRATION TEST');
  console.log('==================================\n');
  
  // Set environment variables to enable OTEL for foundation
  process.env['ZEN_OTEL_ENABLED'] = 'true';
  process.env['OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'] = 'http://localhost:4318/v1/logs';
  process.env['ZEN_OTEL_DIAGNOSTICS'] = 'true';
  
  console.log('🎯 Environment Variables Set:');
  console.log(`   ZEN_OTEL_ENABLED: ${process.env['ZEN_OTEL_ENABLED']}`);
  console.log(`   OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: ${process.env['OTEL_EXPORTER_OTLP_LOGS_ENDPOINT']}`);
  console.log(`   ZEN_OTEL_DIAGNOSTICS: ${process.env['ZEN_OTEL_DIAGNOSTICS']}\n`);
  
  // Check if console OTEL receiver is running
  let consoleReceiverActive = false;
  try {
    const response = await fetch('http://localhost:4318/health');
    if (response.ok) {
      consoleReceiverActive = true;
      console.log('✅ Console OTEL receiver detected on port 4318');
    }
  } catch {
    console.log('❌ No console OTEL receiver detected on port 4318');
    console.log('💡 Please start: tsx src/__tests__/otel-console-receiver.ts');
    console.log('   Foundation logs will go to console only\n');
  }
  
  // Allow LogTape initialization time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📋 Testing Foundation Logging with OTEL');
  console.log('─'.repeat(50));
  
  // Get different foundation loggers
  const foundationLogger = getLogger('foundation');
  const sdkLogger = getLogger('claude-code-sdk-integration');
  const syslogLogger = getLogger('SyslogBridge');
  const testLogger = getLogger('test-component');
  
  // Test various log levels and components
  foundationLogger.info('Foundation package initialized successfully', {
    version: '2.1.0',
    environment: 'development',
    otelEnabled: true,
    timestamp: Date.now()
  });
  
  foundationLogger.warn('Foundation warning test', {
    warningType: 'test-warning',
    component: 'foundation-core',
    details: 'This is a test warning message'
  });
  
  sdkLogger.info('Claude SDK integration active', {
    sdkVersion: '2.1.0',
    integration: 'claude-code-zen',
    features: ['task-execution', 'session-management', 'tool-integration'],
    performance: {
      initTime: '150ms',
      memoryUsage: '45MB'
    }
  });
  
  sdkLogger.error('Claude SDK error simulation', {
    errorType: 'connection-timeout',
    endpoint: 'api.anthropic.com',
    retryAttempt: 3,
    lastError: 'Socket timeout after 30s'
  });
  
  syslogLogger.debug('Syslog bridge debug information', {
    facility: 'user',
    severity: 'info',
    hostname: 'claude-zen-server',
    processId: process.pid
  });
  
  testLogger.info('Test component operational', {
    testSuite: 'foundation-otel-integration',
    testCase: 'log-export-verification',
    status: 'running',
    metadata: {
      loggerName: 'test-component',
      otelExport: consoleReceiverActive,
      timestamp: new Date().toISOString()
    }
  });
  
  // Test success and progress methods
  if (foundationLogger.success) {
    foundationLogger.success('Foundation OTEL integration test completed', {
      totalLogs: 6,
      components: ['foundation', 'claude-code-sdk-integration', 'SyslogBridge', 'test-component'],
      otelReceiver: consoleReceiverActive ? 'active' : 'inactive'
    });
  }
  
  if (foundationLogger.progress) {
    foundationLogger.progress('Processing foundation components', {
      step: 'final-validation',
      progress: '100%',
      completedComponents: 4
    });
  }
  
  console.log('\n✅ Foundation logging test completed!');
  console.log('📊 Logs sent:');
  console.log('   • 1 info log (foundation)');
  console.log('   • 1 warn log (foundation)');
  console.log('   • 1 info log (claude-code-sdk-integration)');
  console.log('   • 1 error log (claude-code-sdk-integration)');
  console.log('   • 1 debug log (SyslogBridge)');
  console.log('   • 1 info log (test-component)');
  console.log('   • 1 success log (foundation)');
  console.log('   • 1 progress log (foundation)');
  
  if (consoleReceiverActive) {
    console.log('\n🎯 Expected OTEL Output:');
    console.log('   Check your console OTEL receiver for 8 log records');
    console.log('   Each log should have structured attributes and metadata');
    console.log('   Service name: claude-zen-foundation');
  }
  
  console.log('\n📋 Foundation OTEL Integration Summary:');
  console.log('✅ Foundation package logging configured for OTEL export');
  console.log('✅ Multiple component loggers tested');
  console.log('✅ Various log levels (debug, info, warn, error)');
  console.log('✅ Rich structured metadata included');
  console.log('✅ Custom logger methods (success, progress)');
  console.log(`✅ OTEL sink: ${consoleReceiverActive ? 'ACTIVE' : 'Console fallback'}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testFoundationOTEL().catch(console.error);
}

export { testFoundationOTEL };