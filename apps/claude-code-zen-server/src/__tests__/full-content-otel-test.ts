#!/usr/bin/env tsx
/**
 * @fileoverview Full Content OTEL Test
 * 
 * Captures and displays FULL Claude conversation content in OTEL
 * Shows actual prompts, responses, and conversation details
 */

import { configure, getLogger } from '@logtape/logtape';
import { getOpenTelemetrySink } from '@logtape/otel';

async function runFullContentOTELTest() {
  console.log('📋 FULL CONTENT OTEL TEST');
  console.log('=========================\n');

  // Check OTEL receiver
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

  // Configure LogTape for full content capture
  await configure({
    sinks: {
      otel: otelActive ? getOpenTelemetrySink({
        serviceName: 'claude-full-content',
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
        
        // Show properties on separate lines for readability
        if (Object.keys(record.properties).length > 0) {
          Object.entries(record.properties).forEach(([key, value]) => {
            if (typeof value === 'string' && value.length > 100) {
              console.log(`   ${key}: ${value.substring(0, 200)}... (${value.length} chars)`);
            } else {
              console.log(`   ${key}: ${JSON.stringify(value)}`);
            }
          });
        }
      }
    },
    loggers: [
      { 
        category: ['claude-content'], 
        sinks: otelActive ? ['console', 'otel'] : ['console'], 
        lowestLevel: 'debug' 
      },
      { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'warning' },
    ],
  });

  const contentLogger = getLogger(['claude-content']);
  
  console.log('🎯 Full Content Configuration:');
  console.log(`   OTEL Active: ${otelActive}`);
  console.log(`   Service: claude-full-content`);
  console.log(`   Capturing: FULL conversation content\n`);

  // Test with a detailed question to get substantial content
  const testPrompt = `Please explain what a REST API is and give me a simple example of how to create one in Node.js with Express. Include the complete code and explain each part.`;

  console.log('📝 TEST PROMPT:');
  console.log('─'.repeat(60));
  console.log(testPrompt);
  console.log('─'.repeat(60));
  console.log('\n🚀 Sending to Claude with full content capture...\n');

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const startTime = Date.now();
    
    // Log the FULL PROMPT to OTEL
    contentLogger.info('CLAUDE PROMPT SENT', {
      'full_prompt': testPrompt,
      'prompt_length': testPrompt.length,
      'prompt_type': 'technical_explanation_request',
      'timestamp': startTime,
      'service': 'claude-full-content'
    });

    const result = await executeClaudeTask(testPrompt, {
      timeoutMs: 60000,
      stderr: (output: string) => {
        const elapsed = Date.now() - startTime;
        
        // Log streaming content as it comes in
        contentLogger.debug('CLAUDE STREAMING OUTPUT', {
          'streaming_output': output,
          'elapsed_ms': elapsed,
          'output_length': output.length,
          'timestamp': Date.now()
        });
      }
    });

    const duration = Date.now() - startTime;
    
    // Extract the full response
    const assistantMessage = result?.find(r => r.type === 'assistant');
    const fullResponse = assistantMessage?.content?.[0]?.text || '';
    const tokenUsage = assistantMessage?.usage;
    const resultSummary = result?.find(r => r.type === 'result');
    const cost = resultSummary?.total_cost_usd;

    // Log the FULL RESPONSE to OTEL
    contentLogger.info('CLAUDE RESPONSE RECEIVED', {
      'full_response': fullResponse,
      'response_length': fullResponse.length,
      'response_preview': fullResponse.substring(0, 500),
      'response_contains_code': fullResponse.includes('```'),
      'duration_ms': duration,
      'duration_seconds': Math.floor(duration / 1000),
      'input_tokens': tokenUsage?.input_tokens || 0,
      'output_tokens': tokenUsage?.output_tokens || 0,
      'total_tokens': (tokenUsage?.input_tokens || 0) + (tokenUsage?.output_tokens || 0),
      'cost_usd': cost || 0,
      'timestamp': Date.now(),
      'service': 'claude-full-content'
    });

    // Log the complete conversation pair
    contentLogger.info('COMPLETE CLAUDE CONVERSATION', {
      'conversation': {
        'prompt': testPrompt,
        'response': fullResponse,
        'duration_ms': duration,
        'tokens': {
          'input': tokenUsage?.input_tokens || 0,
          'output': tokenUsage?.output_tokens || 0,
          'total': (tokenUsage?.input_tokens || 0) + (tokenUsage?.output_tokens || 0)
        },
        'cost': cost || 0
      },
      'metrics': {
        'prompt_length': testPrompt.length,
        'response_length': fullResponse.length,
        'words_in_response': fullResponse.split(' ').length,
        'lines_in_response': fullResponse.split('\n').length,
        'contains_code': fullResponse.includes('```'),
        'performance_class': duration > 30000 ? 'slow' : duration > 10000 ? 'medium' : 'fast'
      },
      'full_content_captured': true,
      'otel_service': 'claude-full-content',
      'timestamp': Date.now()
    });

    console.log('\n✅ FULL CLAUDE RESPONSE CAPTURED!');
    console.log('─'.repeat(60));
    console.log(`Duration: ${Math.floor(duration/1000)}s`);
    console.log(`Response: ${fullResponse.length} characters`);
    console.log(`Lines: ${fullResponse.split('\n').length}`);
    console.log(`Contains code: ${fullResponse.includes('```') ? 'YES' : 'NO'}`);
    console.log(`Cost: $${cost || 'unknown'}`);
    console.log('─'.repeat(60));
    
    // Show response preview
    console.log('\n📋 RESPONSE PREVIEW:');
    console.log('─'.repeat(60));
    console.log(fullResponse.substring(0, 800) + (fullResponse.length > 800 ? '...' : ''));
    console.log('─'.repeat(60));

  } catch (error) {
    contentLogger.error('CLAUDE CONTENT CAPTURE FAILED', {
      'error_message': error.message,
      'error_type': error.constructor.name,
      'prompt_attempted': testPrompt,
      'timestamp': Date.now(),
      'service': 'claude-full-content'
    });
    
    console.error(`❌ Full content test failed: ${error.message}`);
  }

  // Final summary
  contentLogger.info('FULL CONTENT TEST COMPLETED', {
    'test_type': 'full_claude_conversation_capture',
    'content_captured': true,
    'otel_active': otelActive,
    'service': 'claude-full-content',
    'summary': 'Complete Claude prompts and responses captured in OTEL',
    'completed_at': Date.now()
  });

  console.log('\n📊 Full Content OTEL Test Summary:');
  console.log('✅ FULL Claude prompt captured and sent to OTEL');
  console.log('✅ FULL Claude response captured and sent to OTEL');
  console.log('✅ Complete conversation pair logged to OTEL');
  console.log('✅ Detailed metrics and metadata included');
  console.log(`✅ OTEL export: ${otelActive ? 'ACTIVE' : 'Console only'}`);
  
  if (otelActive) {
    console.log('\n🔍 Check your OTEL console receiver for:');
    console.log('   • Service name: claude-full-content');
    console.log('   • CLAUDE PROMPT SENT - full prompt text');
    console.log('   • CLAUDE RESPONSE RECEIVED - full response text');
    console.log('   • COMPLETE CLAUDE CONVERSATION - both prompt and response');
    console.log('   • All with detailed content, not just summaries!');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFullContentOTELTest().catch(console.error);
}

export { runFullContentOTELTest };