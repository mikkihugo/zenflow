#!/usr/bin/env tsx
/**
 * @fileoverview Claude SDK with Structured Logging
 * 
 * Capture and structure all Claude SDK logs for learning and analysis.
 * This avoids the JSON parsing issues with debug environment variables.
 */

interface LogEntry {
  timestamp: number;
  elapsed: number;
  category: 'system' | 'message' | 'result' | 'debug' | 'startup';
  message: string;
  metadata?: any;
}

interface StructuredLogs {
  execution: {
    startTime: number;
    endTime?: number;
    totalTime?: number;
    messageCount: number;
  };
  logs: LogEntry[];
  result?: any;
  error?: any;
}

async function claudeWithStructuredLogging() {
  console.log('📊 Claude SDK with Structured Logging');
  console.log('======================================\n');

  const structuredLogs: StructuredLogs = {
    execution: {
      startTime: Date.now(),
      messageCount: 0
    },
    logs: []
  };

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, evaluate this proposal:

Epic: Mobile App Enhancement
Business Value: $300k/year increase in user engagement  
Development Cost: $150k
Timeline: 3 months
Risk: Low

Provide:
1. Quick ROI analysis
2. Strategic fit assessment
3. Decision: approve/reject/defer

Keep response brief but decisive.`;

    console.log('🚀 Making Claude SDK call with structured logging...\n');
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 120000,
      stderr: (output: string) => {
        const elapsed = Date.now() - structuredLogs.execution.startTime;
        structuredLogs.execution.messageCount++;
        
        let category: LogEntry['category'] = 'debug';
        if (output.includes('Starting Claude')) category = 'startup';
        else if (output.includes('[SYSTEM]')) category = 'system';
        else if (output.includes('[MSG')) category = 'message';
        else if (output.includes('[RESULT]')) category = 'result';
        
        const logEntry: LogEntry = {
          timestamp: Date.now(),
          elapsed,
          category,
          message: output.trim()
        };
        
        structuredLogs.logs.push(logEntry);
        
        // Real-time console output with categories
        const categoryEmoji = {
          startup: '🚀',
          system: '⚙️',
          message: '💬',
          result: '✅', 
          debug: '📝'
        };
        
        console.log(`${categoryEmoji[category]} [${elapsed.toString().padStart(5)}ms] ${output}`);
      }
    });
    
    structuredLogs.execution.endTime = Date.now();
    structuredLogs.execution.totalTime = structuredLogs.execution.endTime - structuredLogs.execution.startTime;
    structuredLogs.result = result;
    
    console.log(`\n⏱️  Total execution: ${structuredLogs.execution.totalTime}ms`);
    console.log(`📊 Debug messages: ${structuredLogs.execution.messageCount}`);
    
    // Analyze structured logs
    console.log('\n📈 LOG ANALYSIS:');
    console.log('===============');
    
    const categoryCounts = structuredLogs.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category.toUpperCase()}: ${count} messages`);
    });
    
    // Show timing analysis
    if (structuredLogs.logs.length > 0) {
      const firstMessage = structuredLogs.logs[0];
      const lastMessage = structuredLogs.logs[structuredLogs.logs.length - 1];
      
      console.log(`\n⚡ TIMING ANALYSIS:`);
      console.log(`   First message: ${firstMessage.elapsed}ms`);
      console.log(`   Last message: ${lastMessage.elapsed}ms`);
      console.log(`   Streaming duration: ${lastMessage.elapsed - firstMessage.elapsed}ms`);
    }
    
    // Extract and display the SAFe analysis
    if (result && result.length > 0) {
      console.log(`\n📄 SAFe Epic Owner Decision:`);
      console.log('═'.repeat(80));
      
      result.forEach((msg, index) => {
        if (msg.message && msg.message.content) {
          const content = msg.message.content;
          
          if (Array.isArray(content)) {
            content.forEach((block, blockIndex) => {
              if (block.type === 'text' && block.text) {
                console.log(`\n[Message ${index + 1}, Block ${blockIndex + 1}]:`);
                console.log(block.text);
              }
            });
          }
        }
      });
      
      console.log('═'.repeat(80));
    }
    
    // Export structured logs for learning
    console.log('\n📚 STRUCTURED LOGS FOR LEARNING:');
    console.log('=================================');
    console.log('Logs can be exported as JSON for analysis:');
    console.log('- Message patterns and timing');
    console.log('- Performance metrics');  
    console.log('- Error patterns');
    console.log('- Response quality analysis');
    
    // Option 1: Console JSON (for OpenTelemetry/structured logging systems)
    console.log('\n🔍 OTEL-Compatible Structured Data:');
    const otelData = {
      service: 'claude-zen-safe-sparc',
      operation: 'safe-epic-evaluation',
      duration_ms: structuredLogs.execution.totalTime,
      message_count: structuredLogs.execution.messageCount,
      categories: categoryCounts,
      success: !!result
    };
    console.log(JSON.stringify(otelData, null, 2));
    
    console.log('\n🎊 Structured logging test completed successfully!');
    return { structuredLogs, result };
    
  } catch (error) {
    structuredLogs.error = error;
    console.error('\n❌ Structured logging test failed:', error);
    
    // Still export logs even on failure for debugging
    console.log('\n🚨 ERROR LOGS FOR ANALYSIS:');
    console.log(JSON.stringify({
      error: error.message,
      logCount: structuredLogs.logs.length,
      executionTime: Date.now() - structuredLogs.execution.startTime
    }, null, 2));
    
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeWithStructuredLogging().catch(console.error);
}

export { claudeWithStructuredLogging };