#!/usr/bin/env tsx
/**
 * @fileoverview Show Claude SDK Streaming Output
 * 
 * Direct script to demonstrate real-time streaming output from Claude SDK
 * Run with: npx tsx src/__tests__/show-streaming.ts
 */

async function showStreamingOutput() {
  console.log('🎥 Claude SDK Streaming Output Demo');
  console.log('====================================\n');

  try {
    // Import Claude SDK
    console.log('📦 Loading Claude SDK...');
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `Analyze this SAFe epic proposal:

Title: Customer Analytics Platform
Business Case: Build ML-powered customer segmentation and predictive analytics
Estimated Value: $750,000 annual revenue increase
Estimated Cost: $250,000 development cost
Timeline: 4 months
Risk Level: Medium

As a SAFe Epic Owner, evaluate this proposal and provide:
1. Business value assessment
2. ROI calculation and analysis
3. Risk evaluation
4. Resource requirements
5. Final decision (approve/reject/defer)

Be thorough in your analysis.`;

    console.log('🚀 Starting Claude SDK call with streaming output...\n');
    console.log('='.repeat(70));
    
    let streamMessageCount = 0;
    const startTime = Date.now();
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 180000, // 3 minute timeout
      stderr: (output: string) => {
        streamMessageCount++;
        const elapsed = Date.now() - startTime;
        
        // Show real-time streaming output with timestamps
        console.log(`[${elapsed.toString().padStart(5, '0')}ms] [STREAM-${streamMessageCount.toString().padStart(2, '0')}] ${output}`);
        
        // Flush output immediately
        process.stdout.write('');
      }
    });
    
    console.log('='.repeat(70));
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Streaming completed in ${totalTime}ms!`);
    console.log(`📊 Total stream messages: ${streamMessageCount}`);
    
    // Show final result
    if (result && result.length > 0) {
      console.log(`📝 Claude response received: ${result.length} message(s)`);
      
      if (result[0] && (result[0] as any).content) {
        const content = (result[0] as any)?.content;
        
        if (Array.isArray(content) && content[0] && content[0].text) {
          const text = content[0].text;
          console.log(`\n📄 Epic Owner Analysis:`);
          console.log('═'.repeat(80));
          console.log(text);
          console.log('═'.repeat(80));
          console.log(`📊 Response length: ${text.length} characters`);
        }
      }
    }
    
    console.log('\n🎊 Streaming demo completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Streaming demo failed:', error);
    
    if (error.message.includes('timeout')) {
      console.log('⚠️  Claude API call timed out');
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('⚠️  Claude API authentication failed - check ANTHROPIC_API_KEY');
    }
    
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  showStreamingOutput().catch(console.error);
}

export default showStreamingOutput;