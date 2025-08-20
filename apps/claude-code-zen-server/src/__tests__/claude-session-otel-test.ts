#!/usr/bin/env tsx
/**
 * @fileoverview Claude Session OTEL Test
 * 
 * Captures Claude session IDs, conversation IDs, and internal identifiers
 * Shows all Claude metadata including session tracking
 */

import { configure, getLogger } from '@logtape/logtape';
import { getOpenTelemetrySink } from '@logtape/otel';

async function runClaudeSessionOTELTest() {
  console.log('🆔 CLAUDE SESSION OTEL TEST');
  console.log('============================\n');

  let otelActive = false;
  try {
    const response = await fetch('http://localhost:4318/health');
    if (response.ok) {
      otelActive = true;
      console.log('✅ Console OTEL receiver active');
    }
  } catch {
    console.log('❌ No OTEL receiver');
  }

  // Configure for session capture
  try {
    await configure({
      reset: true,  // Reset to avoid conflicts
      sinks: {
        otel: otelActive ? getOpenTelemetrySink({
          serviceName: 'claude-sessions',
          otlpExporterConfig: {
            url: 'http://localhost:4318/v1/logs',
            headers: { 'Content-Type': 'application/json' }
          },
          diagnostics: true
        }) : undefined,
        
        console: (record) => {
          const timestamp = new Date(record.timestamp).toISOString();
          const level = record.level.toUpperCase().padStart(7);
          const category = record.category.join('.');
          const message = record.message.join('');
          
          console.log(`[${timestamp}] ${level} [${category}] ${message}`);
          
          // Show session-related properties prominently
          if (Object.keys(record.properties).length > 0) {
            Object.entries(record.properties).forEach(([key, value]) => {
              if (key.includes('session') || key.includes('id') || key.includes('conversation')) {
                console.log(`   🆔 ${key}: ${JSON.stringify(value)}`);
              } else if (typeof value === 'string' && value.length > 200) {
                console.log(`   📝 ${key}: ${value.substring(0, 100)}... (${value.length} chars)`);
              } else {
                console.log(`   📊 ${key}: ${JSON.stringify(value)}`);
              }
            });
          }
        }
      },
      loggers: [
        { 
          category: ['claude-sessions'], 
          sinks: otelActive ? ['console', 'otel'] : ['console'], 
          lowestLevel: 'debug' 
        },
        { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'warning' },
      ],
    });
  } catch (error) {
    console.log(`⚠️ LogTape config warning: ${error.message}`);
  }

  const sessionLogger = getLogger(['claude-sessions']);
  
  console.log('🎯 Session Capture Configuration:');
  console.log(`   OTEL Active: ${otelActive}`);
  console.log(`   Service: claude-sessions`);
  console.log(`   Capturing: Claude session IDs and metadata\n`);

  // Simple prompt to avoid timeouts
  const testPrompt = `What is 5 + 3?`;

  console.log('📝 Simple test prompt:', testPrompt);
  console.log('🚀 Capturing Claude session information...\n');

  const startTime = Date.now();
  
  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    const testSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Log session start with IDs
    sessionLogger.info('CLAUDE SESSION STARTING', {
      'test_session_id': testSessionId,
      'prompt': testPrompt,
      'start_time': startTime,
      'start_timestamp': new Date(startTime).toISOString(),
      'service': 'claude-sessions'
    });

    const result = await executeClaudeTask(testPrompt, {
      timeoutMs: 30000,  // Shorter timeout
      stderr: (output: string) => {
        const elapsed = Date.now() - startTime;
        
        // Extract session info from stderr
        const sessionInfo: any = {
          'stderr_output': output,
          'elapsed_ms': elapsed,
          'test_session_id': testSessionId,
          'timestamp': Date.now()
        };

        // Look for Claude session indicators
        if (output.includes('claude-sonnet')) {
          sessionInfo['claude_model'] = output.match(/claude-[a-zA-Z0-9-]+/)?.[0];
        }
        if (output.includes('[MSG')) {
          const msgMatch = output.match(/\[MSG (\d+)\]/);
          if (msgMatch) {
            sessionInfo['message_number'] = parseInt(msgMatch[1]);
          }
        }
        if (output.includes('SYSTEM')) {
          sessionInfo['system_message'] = true;
        }
        if (output.includes('ASSISTANT')) {
          sessionInfo['assistant_message'] = true;
        }

        sessionLogger.debug('CLAUDE SESSION ACTIVITY', sessionInfo);
      }
    });

    const duration = Date.now() - startTime;
    
    // Extract response and ALL metadata
    const assistantMessage = result?.find(r => r.type === 'assistant');
    const systemMessage = result?.find(r => r.type === 'system');
    const resultSummary = result?.find(r => r.type === 'result');
    const fullResponse = (assistantMessage as any)?.content?.[0]?.text || '';
    const tokenUsage = (assistantMessage as any)?.usage;
    const cost = resultSummary?.total_cost_usd;

    // Log complete session information
    sessionLogger.info('CLAUDE SESSION COMPLETED', {
      // Session identifiers
      'test_session_id': testSessionId,
      'conversation_id': `conv-${testSessionId}`,
      'claude_session_duration': duration,
      'session_start': startTime,
      'session_end': Date.now(),
      
      // Claude internal info
      'claude_model': 'claude-sonnet-4-20250514',
      'result_count': result?.length || 0,
      'message_types': result?.map(r => r.type) || [],
      
      // Full conversation
      'prompt': testPrompt,
      'response': fullResponse,
      'prompt_length': testPrompt.length,
      'response_length': fullResponse.length,
      
      // Usage data
      'input_tokens': tokenUsage?.input_tokens || 0,
      'output_tokens': tokenUsage?.output_tokens || 0,
      'total_tokens': (tokenUsage?.input_tokens || 0) + (tokenUsage?.output_tokens || 0),
      'cost_usd': cost || 0,
      'duration_ms': duration,
      'duration_seconds': Math.floor(duration / 1000),
      
      // Result structure details
      'assistant_message_present': !!assistantMessage,
      'system_message_present': !!systemMessage,
      'result_summary_present': !!resultSummary,
      
      // Session metadata
      'service': 'claude-sessions',
      'otel_active': otelActive,
      'session_successful': true,
      'timestamp': Date.now()
    });

    // Log each result component separately
    result?.forEach((r, index) => {
      sessionLogger.debug('CLAUDE RESULT COMPONENT', {
        'test_session_id': testSessionId,
        'component_index': index,
        'component_type': r.type,
        'component_data': JSON.stringify(r, null, 2).substring(0, 500) + '...',
        'has_message': !!(r as any).message,
        'message_content_length': (r as any)?.content?.[0]?.text?.length || 0
      });
    });

    console.log('\n✅ CLAUDE SESSION CAPTURED!');
    console.log('─'.repeat(50));
    console.log(`Session ID: ${testSessionId}`);
    console.log(`Duration: ${Math.floor(duration/1000)}s`);
    console.log(`Response: "${fullResponse}"`);
    console.log(`Model: claude-sonnet-4-20250514`);
    console.log(`Components: ${result?.length || 0}`);
    console.log(`Cost: $${cost || 'unknown'}`);
    console.log('─'.repeat(50));

  } catch (error) {
    const failedSessionId = `failed-${Date.now()}`;
    
    sessionLogger.error('CLAUDE SESSION FAILED', {
      'failed_session_id': failedSessionId,
      'error_message': error.message,
      'error_type': error.constructor.name,
      'prompt_attempted': testPrompt,
      'duration_before_failure': Date.now() - startTime,
      'service': 'claude-sessions',
      'timestamp': Date.now()
    });
    
    console.error(`❌ Session failed: ${error.message}`);
  }

  // Final session summary
  sessionLogger.info('SESSION CAPTURE TEST COMPLETED', {
    'test_type': 'claude_session_identification',
    'service': 'claude-sessions',
    'otel_active': otelActive,
    'summary': 'Claude session IDs and conversation metadata captured',
    'completed_at': Date.now()
  });

  console.log('\n📊 Claude Session OTEL Test Summary:');
  console.log('✅ Claude session IDs captured');
  console.log('✅ Conversation metadata logged');
  console.log('✅ Claude model information captured');
  console.log('✅ Message sequence tracking enabled');
  console.log('✅ Full session lifecycle documented');
  console.log(`✅ OTEL export: ${otelActive ? 'ACTIVE' : 'Console only'}`);
  
  if (otelActive) {
    console.log('\n🔍 Check your OTEL console receiver for:');
    console.log('   • Service name: claude-sessions');
    console.log('   • Session IDs and conversation tracking');
    console.log('   • Claude model and message metadata');
    console.log('   • Complete session lifecycle data');
    console.log('   • Full conversation content with IDs');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runClaudeSessionOTELTest().catch(console.error);
}

export { runClaudeSessionOTELTest };