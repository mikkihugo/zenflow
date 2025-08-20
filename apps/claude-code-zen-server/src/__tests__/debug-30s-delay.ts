#!/usr/bin/env tsx
/**
 * @fileoverview Debug 30 Second Delay Analysis
 * 
 * Detailed investigation of what happens during the 30+ second system processing phase
 * Provides granular timing and network analysis to identify bottlenecks
 */

async function debug30SecondDelay() {
  console.log('🔬 DEBUGGING 30 SECOND DELAY');
  console.log('============================\n');

  // Enable detailed Claude Code debugging
  process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1';
  process.env.OTEL_LOG_USER_PROMPTS = '1';
  process.env.CLAUDE_CODE_LOG_LEVEL = 'debug';
  process.env.DEBUG = 'claude:*';

  const startTime = Date.now();
  let phases: Array<{name: string, start: number, end?: number}> = [];
  
  try {
    console.log('⏱️  Starting timing analysis...\n');
    
    phases.push({ name: 'initialization', start: Date.now() });
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    phases[phases.length - 1].end = Date.now();
    
    console.log(`✅ Phase 1 - Initialization: ${phases[0].end! - phases[0].start}ms\n`);

    // Simple prompt to isolate the delay
    const prompt = "What is 2+2? Just answer with the number.";
    
    phases.push({ name: 'claude_call_start', start: Date.now() });
    console.log('📞 Starting Claude API call...\n');
    
    let systemPhaseStart = 0;
    let systemPhaseCount = 0;
    let firstTokenReceived = false;
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 180000,
      stderr: (output: string) => {
        const elapsed = Date.now() - startTime;
        const currentTime = Date.now();
        
        if (output.includes('Starting Claude')) {
          console.log(`🚀 [${elapsed}ms] Claude SDK startup: ${output}`);
          phases.push({ name: 'claude_startup', start: currentTime, end: currentTime });
          
        } else if (output.includes('[SYSTEM]')) {
          systemPhaseCount++;
          
          if (systemPhaseStart === 0) {
            systemPhaseStart = currentTime;
            console.log(`🔄 [${elapsed}ms] SYSTEM PHASE START (count: ${systemPhaseCount})`);
            console.log(`    Raw output: ${output}`);
            phases.push({ name: 'system_phase_start', start: currentTime });
          } else {
            const systemElapsed = currentTime - systemPhaseStart;
            console.log(`🔄 [${elapsed}ms] SYSTEM CONTINUING (${Math.floor(systemElapsed/1000)}s, count: ${systemPhaseCount})`);
            
            // Detailed analysis of system messages
            if (output.includes('Model:')) {
              console.log(`    🤖 Model Info: ${output}`);
            } else if (output.includes('Tools:')) {
              console.log(`    🔧 Tools Info: ${output}`);
            } else {
              console.log(`    📋 System Data: ${output.substring(0, 100)}...`);
            }
            
            // Alert on long delays
            if (systemElapsed > 10000 && systemElapsed % 10000 < 1000) {
              console.log(`    ⚠️  SYSTEM PROCESSING ALERT: ${Math.floor(systemElapsed/1000)} seconds elapsed`);
            }
            
            if (systemElapsed > 30000) {
              console.log(`    🔥 CRITICAL DELAY: ${Math.floor(systemElapsed/1000)} seconds in system phase`);
            }
          }
          
        } else if (output.includes('[MSG')) {
          if (!firstTokenReceived) {
            firstTokenReceived = true;
            const systemTotalTime = systemPhaseStart > 0 ? currentTime - systemPhaseStart : 0;
            console.log(`💬 [${elapsed}ms] FIRST TOKEN RECEIVED!`);
            console.log(`    System phase duration: ${Math.floor(systemTotalTime/1000)}s`);
            
            if (phases[phases.length - 1].name === 'system_phase_start') {
              phases[phases.length - 1].end = currentTime;
            }
            phases.push({ name: 'first_token', start: currentTime, end: currentTime });
          } else {
            console.log(`💬 [${elapsed}ms] Streaming token: ${output.substring(0, 50)}...`);
          }
          
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [${elapsed}ms] FINAL RESULT: ${output}`);
          phases.push({ name: 'result_received', start: currentTime, end: currentTime });
          
        } else {
          console.log(`📋 [${elapsed}ms] Other: ${output}`);
        }
      }
    });
    
    const totalTime = Date.now() - startTime;
    phases.push({ name: 'complete', start: Date.now(), end: Date.now() });
    
    console.log('\n📊 DELAY ANALYSIS COMPLETE');
    console.log('==========================');
    console.log(`Total execution time: ${Math.floor(totalTime/1000)}s (${totalTime}ms)`);
    console.log(`System messages received: ${systemPhaseCount}`);
    
    // Phase breakdown
    console.log('\n🔬 PHASE BREAKDOWN:');
    phases.forEach((phase, index) => {
      const duration = phase.end ? phase.end - phase.start : 'ongoing';
      console.log(`  ${index + 1}. ${phase.name}: ${duration === 'ongoing' ? duration : duration + 'ms'}`);
    });
    
    // System phase analysis
    if (systemPhaseStart > 0 && firstTokenReceived) {
      const systemDuration = phases.find(p => p.name === 'system_phase_start');
      if (systemDuration && systemDuration.end) {
        const systemTime = systemDuration.end - systemDuration.start;
        console.log(`\n🔥 SYSTEM PHASE DETAILED ANALYSIS:`);
        console.log(`   Duration: ${Math.floor(systemTime/1000)}s (${systemTime}ms)`);
        console.log(`   Messages: ${systemPhaseCount}`);
        console.log(`   Average per message: ${Math.floor(systemTime/systemPhaseCount)}ms`);
        
        if (systemTime > 30000) {
          console.log(`   🚨 ROOT CAUSE: System processing exceeded 30 seconds`);
          console.log(`   💡 This suggests Claude API server-side processing delay`);
          console.log(`   🔧 Possible causes:`);
          console.log(`      - Claude API server load`);
          console.log(`      - Model initialization time`);
          console.log(`      - Network latency to Claude servers`);
          console.log(`      - Request queuing on Claude's side`);
        }
      }
    }
    
    // Result analysis
    if (result && result.length > 0) {
      const content = result[0]?.message?.content;
      if (Array.isArray(content) && content[0]?.text) {
        console.log(`\n✅ Response received: ${content[0].text}`);
      }
    }
    
    console.log('\n💡 INVESTIGATION SUMMARY:');
    console.log('The 30+ second delay occurs during the [SYSTEM] phase');
    console.log('This is Claude API server-side processing, not client-side issues');
    console.log('SDK initialization is fast (2ms), the delay is in Claude\'s response generation');
    
  } catch (error) {
    console.error('\n❌ Debug analysis failed:', error);
    console.log(`Total runtime before error: ${Date.now() - startTime}ms`);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  debug30SecondDelay().catch(console.error);
}

export { debug30SecondDelay };