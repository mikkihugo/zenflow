#!/usr/bin/env tsx
/**
 * Simple Claude Content Capture Test
 * 
 * Very basic test to capture Claude prompt and response clearly
 */

import { configure, getLogger } from '@logtape/logtape';
import { getOpenTelemetrySink } from '@logtape/otel';

async function runSimpleClaudeCaptureTest() {
  console.log('🎯 SIMPLE CLAUDE CAPTURE TEST');
  console.log('==============================\n');

  let otelActive = false;
  try {
    const response = await fetch('http://localhost:4318/health');
    if (response.ok) {
      otelActive = true;
      console.log('✅ Console OTEL receiver active');
      const data = await response.json();
      console.log(`   Current traces: ${data.traces}`);
    }
  } catch {
    console.log('❌ No OTEL receiver');
  }

  try {
    await configure({
      reset: true,
      sinks: {
        otel: otelActive ? getOpenTelemetrySink({
          serviceName: 'simple-claude-test',
          otlpExporterConfig: {
            url: 'http://localhost:4318/v1/logs',
            headers: { 'Content-Type': 'application/json' }
          }
        }) : undefined,
        
        console: (record) => {
          console.log(`\n🔍 CONSOLE LOG: ${record.message.join('')}`);
          if (Object.keys(record.properties).length > 0) {
            console.log('📊 Properties:', JSON.stringify(record.properties, null, 2));
          }
        }
      },
      loggers: [
        { 
          category: ['simple-test'], 
          sinks: otelActive ? ['console', 'otel'] : ['console'], 
          lowestLevel: 'info' 
        }
      ]
    });
  } catch (e) {
    console.log('⚠️ Config warning, continuing...');
  }

  const logger = getLogger(['simple-test']);
  
  console.log('\n📝 Testing simple Claude call...');
  
  // Very simple prompt
  const prompt = "Hello, what is your name?";
  
  console.log(`\n🚀 SENDING TO CLAUDE: "${prompt}"`);
  
  // Log the prompt clearly to OTEL
  logger.info('CLAUDE_PROMPT_SENT', {
    'PROMPT_TEXT': prompt,
    'PROMPT_LENGTH': prompt.length,
    'TEST_TYPE': 'simple_capture'
  });

  try {
    // Import claude SDK
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const startTime = Date.now();
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 20000,
      stderr: (output: string) => {
        console.log(`📡 Claude output: ${output}`);
      }
    });
    
    const duration = Date.now() - startTime;
    
    // Extract response
    const assistantMessage = result?.find(r => r.type === 'assistant');
    const responseText = assistantMessage?.content?.[0]?.text || 'NO_RESPONSE';
    
    console.log(`\n📨 CLAUDE RESPONDED: "${responseText}"`);
    console.log(`⏱️ Duration: ${duration}ms`);
    
    // Log the response clearly to OTEL  
    logger.info('CLAUDE_RESPONSE_RECEIVED', {
      'RESPONSE_TEXT': responseText,
      'RESPONSE_LENGTH': responseText.length,
      'DURATION_MS': duration,
      'ORIGINAL_PROMPT': prompt,
      'TEST_TYPE': 'simple_capture'
    });

    // Log the complete conversation
    logger.info('CLAUDE_CONVERSATION_COMPLETE', {
      'CONVERSATION': {
        'PROMPT': prompt,
        'RESPONSE': responseText,
        'DURATION': duration
      },
      'SUCCESS': true
    });

    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    
    logger.info('CLAUDE_TEST_FAILED', {
      'ERROR': error.message,
      'PROMPT_ATTEMPTED': prompt
    });
  }

  // Check final trace count
  try {
    const response = await fetch('http://localhost:4318/health');
    if (response.ok) {
      const data = await response.json();
      console.log(`\n📊 Final trace count: ${data.traces}`);
    }
  } catch {}

  console.log('\n🎯 What to look for in your OTEL console receiver:');
  console.log('   Service name: simple-claude-test');
  console.log('   Log messages: CLAUDE_PROMPT_SENT, CLAUDE_RESPONSE_RECEIVED, CLAUDE_CONVERSATION_COMPLETE');
  console.log('   Look for PROMPT_TEXT and RESPONSE_TEXT fields');
  console.log('   The actual conversation content should be there!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleClaudeCaptureTest().catch(console.error);
}

export { runSimpleClaudeCaptureTest };