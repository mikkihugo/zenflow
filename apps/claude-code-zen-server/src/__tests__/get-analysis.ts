#!/usr/bin/env tsx
/**
 * @fileoverview Get Complete Claude Analysis
 * 
 * Extract and display the complete Claude analysis without streaming output noise
 */

async function getCompleteAnalysis() {
  console.log('📋 Getting Complete Claude Analysis');
  console.log('==================================\n');

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, analyze this epic proposal:

Title: Customer Analytics Platform  
Business Case: Build ML-powered customer segmentation and predictive analytics
Estimated Value: $750,000 annual revenue increase
Estimated Cost: $250,000 development cost
Timeline: 4 months
Risk Level: Medium

Provide a structured analysis with:
1. Business Value Assessment
2. ROI Calculation 
3. Risk Evaluation
4. Resource Requirements
5. Final Decision (approve/reject/defer)

Respond in clear, structured format.`;

    console.log('🚀 Making Claude API call (no streaming output)...');
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 120000
      // No stderr callback - clean output
    });
    
    console.log('✅ Analysis complete!\n');
    
    if (result && result.length > 0 && result[0] && result[0].message && result[0].message.content) {
      const content = result[0].message.content;
      
      if (Array.isArray(content) && content[0] && content[0].text) {
        const analysis = content[0].text;
        
        console.log('📄 COMPLETE SAFe EPIC OWNER ANALYSIS:');
        console.log('═'.repeat(100));
        console.log(analysis);
        console.log('═'.repeat(100));
        console.log(`\n📊 Analysis Statistics:`);
        console.log(`   Length: ${analysis.length} characters`);
        console.log(`   Lines: ${analysis.split('\n').length}`);
        console.log(`   Word count: ~${analysis.split(/\s+/).length} words`);
        
        // Try to extract decision
        const lines = analysis.toLowerCase().split('\n');
        for (const line of lines) {
          if (line.includes('decision') || line.includes('recommendation')) {
            if (line.includes('approve') || line.includes('reject') || line.includes('defer')) {
              console.log(`\n🏛️ KEY DECISION FOUND: ${line.trim()}`);
              break;
            }
          }
        }
        
      } else {
        console.log('⚠️  Unexpected content format:', content);
      }
    } else {
      console.log('⚠️  No analysis content received');
      console.log('Result structure:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Failed to get analysis:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  getCompleteAnalysis().catch(console.error);
}