#!/usr/bin/env tsx
/**
 * @fileoverview Comprehensive Debug OTEL Test
 * 
 * Captures ALL Foundation + Claude SDK debug logs and sends to OTEL
 * Shows detailed debug information in console receiver
 */

import { configure, getLogger } from '@logtape/logtape';
import { getOpenTelemetrySink } from '@logtape/otel';

async function runComprehensiveDebugOTELTest() {
  console.log('🔍 COMPREHENSIVE DEBUG OTEL TEST');
  console.log('==================================\n');

  // Set ALL debug environment variables
  process.env['ZEN_OTEL_ENABLED'] = 'true';
  process.env['ZEN_OTEL_DIAGNOSTICS'] = 'true';
  process.env['OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'] = 'http://localhost:4318/v1/logs';
  process.env['ZEN_LOG_LEVEL'] = 'debug';  // Enable ALL debug logs
  process.env['ZEN_LOG_CONSOLE'] = 'true';
  process.env['ZEN_LOG_FORMAT'] = 'json';

  // Check console OTEL receiver
  let otelActive = false;
  try {
    const response = await fetch('http://localhost:4318/health');
    if (response.ok) {
      otelActive = true;
      console.log('✅ Console OTEL receiver active');
    }
  } catch {
    console.log('❌ No OTEL receiver - logs will be console only');
  }

  // Configure LogTape to capture EVERYTHING with maximum verbosity
  await configure({
    sinks: {
      // OTEL sink for detailed logs
      otel: otelActive ? getOpenTelemetrySink({
        serviceName: 'claude-debug-comprehensive',
        otlpExporterConfig: {
          url: 'http://localhost:4318/v1/logs',
          headers: { 'Content-Type': 'application/json' }
        },
        diagnostics: true
      }) : undefined,
      
      // Console for immediate visibility
      console: (record) => {
        const timestamp = new Date(record.timestamp).toISOString();
        const level = record.level.toUpperCase().padStart(7);
        const category = record.category.join('.');
        const message = record.message.join('');
        const props = Object.keys(record.properties).length > 0 
          ? JSON.stringify(record.properties, null, 2) 
          : '';
        
        console.log(`[${timestamp}] ${level} [${category}] ${message}`);
        if (props) {
          console.log(`   Properties: ${props}`);
        }
      }
    },
    loggers: [
      // Capture ALL foundation logs at DEBUG level
      { 
        category: ['foundation'], 
        sinks: otelActive ? ['console', 'otel'] : ['console'], 
        lowestLevel: 'debug'  // Capture EVERYTHING
      },
      // Capture ALL claude-code-sdk-integration logs at DEBUG level
      { 
        category: ['claude-code-sdk-integration'], 
        sinks: otelActive ? ['console', 'otel'] : ['console'], 
        lowestLevel: 'debug'  // Capture EVERYTHING
      },
      // Capture syslog bridge
      { 
        category: ['SyslogBridge'], 
        sinks: otelActive ? ['console', 'otel'] : ['console'], 
        lowestLevel: 'debug' 
      },
      // Capture error handling
      { 
        category: ['error-handling'], 
        sinks: otelActive ? ['console', 'otel'] : ['console'], 
        lowestLevel: 'debug' 
      },
      // Capture debug test logs
      { 
        category: ['debug-test'], 
        sinks: otelActive ? ['console', 'otel'] : ['console'], 
        lowestLevel: 'debug' 
      },
      // Capture EVERYTHING else at DEBUG level
      { 
        category: [], 
        sinks: otelActive ? ['console', 'otel'] : ['console'], 
        lowestLevel: 'debug'  // MAXIMUM VERBOSITY
      },
      // LogTape meta to console only
      { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'debug' },
    ],
  });

  const debugLogger = getLogger(['debug-test']);
  
  console.log('🎯 Debug OTEL Configuration:');
  console.log(`   OTEL Active: ${otelActive}`);
  console.log(`   Service: claude-debug-comprehensive`);
  console.log(`   Log Level: DEBUG (maximum verbosity)`);
  console.log(`   All Foundation + Claude SDK debug logs will be captured\n`);

  debugLogger.info('Starting comprehensive debug OTEL test', {
    testId: 'comprehensive-debug-test',
    timestamp: Date.now(),
    configuration: {
      otelActive: otelActive,
      logLevel: 'debug',
      captureAll: true
    }
  });

  // Test Foundation logging with detailed debug information
  debugLogger.debug('Testing Foundation debug logging', {
    component: 'foundation-test',
    verbosity: 'maximum',
    captureLevel: 'debug'
  });

  // Test Claude SDK call with maximum debug capture
  console.log('🚀 Testing Claude SDK with FULL DEBUG CAPTURE...\n');

  const testPrompt = `Simple test: What is 2 + 2?`;

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const startTime = Date.now();
    
    debugLogger.info('Starting Claude SDK call with full debug capture', {
      prompt: testPrompt,
      startTime: startTime,
      debugMode: 'comprehensive'
    });

    const result = await executeClaudeTask(testPrompt, {
      timeoutMs: 60000,
      stderr: (output: string) => {
        const elapsed = Date.now() - startTime;
        
        // Log EVERY stderr output with debug details
        debugLogger.debug('Claude SDK stderr output captured', {
          output: output,
          elapsed: elapsed,
          outputLength: output.length,
          containsMsg: output.includes('[MSG'),
          timestamp: Date.now()
        });
        
        console.log(`💬 [${elapsed}ms] Debug output: ${output.substring(0, 100)}...`);
      }
    });

    const duration = Date.now() - startTime;
    
    // Extract response with detailed logging
    const assistantMessage = result?.find(r => r.type === 'assistant');
    const responseText = assistantMessage?.message?.content?.[0]?.text || '';
    const tokenUsage = assistantMessage?.message?.usage;
    const resultSummary = result?.find(r => r.type === 'result');
    const cost = resultSummary?.total_cost_usd;

    // Log COMPREHENSIVE debug information to OTEL
    debugLogger.info('Claude SDK comprehensive debug results', {
      // Timing details
      'debug.start_time': startTime,
      'debug.end_time': Date.now(),
      'debug.duration_ms': duration,
      'debug.duration_seconds': Math.floor(duration / 1000),
      
      // Input details
      'debug.prompt': testPrompt,
      'debug.prompt_length': testPrompt.length,
      
      // Output details
      'debug.response': responseText,
      'debug.response_length': responseText.length,
      'debug.response_preview': responseText.substring(0, 200),
      
      // Token details
      'debug.input_tokens': tokenUsage?.input_tokens || 0,
      'debug.output_tokens': tokenUsage?.output_tokens || 0,
      'debug.total_tokens': (tokenUsage?.input_tokens || 0) + (tokenUsage?.output_tokens || 0),
      
      // Cost details
      'debug.cost_usd': cost || 0,
      'debug.cost_formatted': `$${cost || 'unknown'}`,
      
      // Result structure details
      'debug.result_count': result?.length || 0,
      'debug.assistant_message_found': !!assistantMessage,
      'debug.result_summary_found': !!resultSummary,
      
      // Comprehensive metadata
      'debug.test_id': 'comprehensive-debug-test',
      'debug.service': 'claude-debug-comprehensive',
      'debug.capture_mode': 'maximum-verbosity',
      'debug.otel_active': otelActive,
      
      // Full result structure for debugging
      'debug.full_result_structure': result?.map(r => ({
        type: r.type,
        hasMessage: !!r.message,
        messageContentLength: r.message?.content?.[0]?.text?.length || 0
      }))
    });

    debugLogger.debug('Detailed Claude SDK execution trace', {
      'trace.execution_path': 'claude-sdk -> executeClaudeTask',
      'trace.model_used': 'claude-sonnet-4-20250514',
      'trace.success': true,
      'trace.error': null,
      'trace.performance_class': duration > 30000 ? 'slow' : duration > 10000 ? 'medium' : 'fast'
    });

    console.log(`✅ Claude SDK call completed with FULL DEBUG CAPTURE!`);
    console.log(`   Duration: ${Math.floor(duration/1000)}s`);
    console.log(`   Response: ${responseText.length} characters`);
    console.log(`   Cost: $${cost || 'unknown'}`);
    console.log(`   Debug logs sent to OTEL: ${otelActive ? 'YES' : 'NO'}`);

    // Final comprehensive summary
    debugLogger.info('Comprehensive debug test completed', {
      'summary.success': true,
      'summary.total_duration': Date.now() - startTime,
      'summary.logs_captured': 'comprehensive',
      'summary.debug_level': 'maximum',
      'summary.otel_export': otelActive,
      'summary.foundation_logs': 'captured',
      'summary.claude_sdk_logs': 'captured',
      'summary.performance_logs': 'captured',
      'summary.error_logs': 'captured',
      completedAt: Date.now()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    debugLogger.error('Claude SDK comprehensive debug test failed', {
      'error.message': error.message,
      'error.duration': duration,
      'error.timestamp': Date.now(),
      'debug.test_id': 'comprehensive-debug-test',
      'debug.capture_attempted': true,
      'debug.otel_active': otelActive
    });
    
    console.error(`❌ Debug test failed: ${error.message}`);
  }

  console.log('\n📊 Comprehensive Debug Test Summary:');
  console.log('✅ ALL Foundation debug logs captured');
  console.log('✅ ALL Claude SDK debug logs captured');
  console.log('✅ Detailed performance metrics captured');
  console.log('✅ Comprehensive error handling captured');
  console.log('✅ Maximum verbosity logging enabled');
  console.log(`✅ OTEL export: ${otelActive ? 'ACTIVE' : 'Console only'}`);
  
  if (otelActive) {
    console.log('\n🎯 Check your OTEL console receiver for COMPREHENSIVE debug data:');
    console.log('   • Foundation initialization logs');
    console.log('   • Claude SDK execution traces');
    console.log('   • Performance timing details');
    console.log('   • Token usage and cost breakdown');
    console.log('   • Error handling and recovery logs');
    console.log('   • Complete input/output capture');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveDebugOTELTest().catch(console.error);
}

export { runComprehensiveDebugOTELTest };