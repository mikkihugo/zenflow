#!/usr/bin/env tsx
/**
 * @fileoverview Quick Fix Demo - Shows the solution in action
 */

async function quickFixDemo() {
  console.log('🔧 QUICK FIX DEMONSTRATION');
  console.log('==========================\n');

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = "What is the capital of France? One word answer.";
    
    console.log('📋 Testing prompt:', prompt);
    console.log('🔍 Demonstrating FIXED response extraction...\n');
    
    const startTime = Date.now();
    let systemStart = 0;
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 60000,
      stderr: (output: string) => {
        const elapsed = Date.now() - startTime;
        
        if (output.includes('[SYSTEM]') && systemStart === 0) {
          systemStart = Date.now();
          console.log(`🔄 [${elapsed}ms] System processing started`);
        } else if (output.includes('[MSG')) {
          const systemTime = systemStart > 0 ? Date.now() - systemStart : 0;
          console.log(`💬 [${elapsed}ms] First token (system: ${Math.floor(systemTime/1000)}s)`);
        }
      }
    });
    
    console.log('\n🔍 RESULT STRUCTURE ANALYSIS:');
    console.log(`   Array length: ${result?.length}`);
    console.log(`   Element types: [${result?.map(r => r.type).join(', ')}]`);
    
    // OLD (BROKEN) WAY:
    console.log('\n❌ OLD (BROKEN) EXTRACTION:');
    const oldWay = (result?.[0] as any)?.content?.[0]?.text;
    console.log(`   (result[0] as any)?.content[0].text = "${oldWay || 'undefined'}"`);
    
    // NEW (FIXED) WAY:  
    console.log('\n✅ NEW (FIXED) EXTRACTION:');
    const assistantMsg = result?.find(r => r.type === 'assistant');
    const newWay = (assistantMsg as any)?.content?.[0]?.text;
    console.log(`   Find assistant message: ${!!assistantMsg}`);
    console.log(`   assistant.content[0].text = "${newWay || 'undefined'}"`);
    
    // COST AND USAGE:
    const resultSummary = result?.find(r => r.type === 'result');
    console.log('\n💰 COST & USAGE DATA:');
    console.log(`   Cost: $${resultSummary?.total_cost_usd || 'unknown'}`);
    console.log(`   Input tokens: ${(assistantMsg as any)?.usage?.input_tokens || 0}`);
    console.log(`   Output tokens: ${(assistantMsg as any)?.usage?.output_tokens || 0}`);
    
    console.log('\n🎯 DEMONSTRATION COMPLETE!');
    console.log(`   Old method result: "${oldWay || 'EMPTY'}"`);
    console.log(`   Fixed method result: "${newWay || 'EMPTY'}"`);
    console.log(`   Success rate: ${newWay ? '100%' : '0%'} ✅`);
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  quickFixDemo().catch(console.error);
}

export { quickFixDemo };