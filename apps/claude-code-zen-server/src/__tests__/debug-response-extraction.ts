#!/usr/bin/env tsx
/**
 * @fileoverview Debug Response Extraction
 * 
 * Investigates why responses are showing in stderr but not being extracted from result structure
 */

async function debugResponseExtraction() {
  console.log('🔬 DEBUG RESPONSE EXTRACTION');
  console.log('============================\n');

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = "What is 2+2? Just the number.";
    
    console.log('📋 Testing with simple prompt:', prompt);
    console.log('🔍 Will examine complete result structure...\n');
    
    let fullStderrOutput = '';
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 60000,
      stderr: (output: string) => {
        console.log(`📝 STDERR: ${output}`);
        fullStderrOutput += output + '\n';
      }
    });
    
    console.log('\n🔍 COMPLETE RESULT STRUCTURE ANALYSIS');
    console.log('═'.repeat(60));
    console.log('Raw result:', JSON.stringify(result, null, 2));
    console.log('═'.repeat(60));
    
    console.log('\n📊 RESULT ANALYSIS:');
    console.log(`   Result type: ${typeof result}`);
    console.log(`   Result is array: ${Array.isArray(result)}`);
    console.log(`   Result length: ${result?.length || 'N/A'}`);
    
    if (result && Array.isArray(result) && result.length > 0) {
      const firstResult = result[0];
      console.log(`\n📋 First result structure:`);
      console.log(`   Type: ${typeof firstResult}`);
      console.log(`   Keys: ${Object.keys(firstResult || {})}`);
      
      if (firstResult?.message) {
        console.log(`\n💬 Message structure:`);
        console.log(`   Message type: ${typeof firstResult.message}`);
        console.log(`   Message keys: ${Object.keys(firstResult.message || {})}`);
        
        if (firstResult.message.content) {
          console.log(`\n📄 Content structure:`);
          console.log(`   Content type: ${typeof firstResult.message.content}`);
          console.log(`   Content is array: ${Array.isArray(firstResult.message.content)}`);
          console.log(`   Content: ${JSON.stringify(firstResult.message.content, null, 2)}`);
          
          if (Array.isArray(firstResult.message.content) && firstResult.message.content[0]?.text) {
            const text = firstResult.message.content[0].text;
            console.log(`\n✅ EXTRACTED TEXT: "${text}"`);
            console.log(`   Text length: ${text.length}`);
          } else {
            console.log(`\n❌ NO TEXT FOUND in content[0].text`);
          }
        } else {
          console.log(`\n❌ NO CONTENT in message`);
        }
      } else {
        console.log(`\n❌ NO MESSAGE in result[0]`);
      }
      
      if (firstResult?.usage) {
        console.log(`\n📊 Usage data found:`);
        console.log(`   Usage: ${JSON.stringify(firstResult.usage, null, 2)}`);
      } else {
        console.log(`\n❌ NO USAGE DATA`);
      }
    }
    
    console.log('\n📝 FULL STDERR OUTPUT:');
    console.log('─'.repeat(50));
    console.log(fullStderrOutput);
    console.log('─'.repeat(50));
    
    // Try to extract response from stderr as fallback
    const responseInStderr = fullStderrOutput.match(/\[RESULT\]\s*(.+)/);
    if (responseInStderr && responseInStderr[1]) {
      console.log(`\n💡 RESPONSE FOUND IN STDERR:`);
      console.log(`   Content: "${responseInStderr[1]}"`);
      console.log(`   Length: ${responseInStderr[1].length}`);
    }
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  debugResponseExtraction().catch(console.error);
}

export { debugResponseExtraction };