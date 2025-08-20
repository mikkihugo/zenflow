/**
 * @fileoverview Claude SDK Streaming Output Test
 * 
 * Tests to demonstrate and validate Claude SDK streaming output capabilities
 */

import { describe, test, expect } from '@jest/globals';

describe('Claude SDK Streaming Output Tests', () => {
  test('should show streaming output from Claude SDK', async () => {
    console.log('🎥 Testing Claude SDK streaming output...\n');
    
    try {
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const prompt = `Analyze this business case step by step:

Title: Customer Analytics Platform
Business Value: $500,000 annual revenue increase
Implementation Cost: $200,000
Timeline: 6 months
Risk Level: Medium

Please provide:
1. ROI calculation
2. Risk assessment
3. Implementation feasibility
4. Final recommendation

Take your time and be thorough in your analysis.`;

      console.log('📡 Making streaming Claude SDK call...');
      console.log('=' * 60);
      
      let messageCount = 0;
      const streamOutput: string[] = [];
      
      const result = await executeClaudeTask(prompt, {
        timeoutMs: 120000, // 2 minute timeout
        stderr: (output: string) => {
          messageCount++;
          streamOutput.push(output);
          
          // Show real-time streaming output
          console.log(`[STREAM ${messageCount.toString().padStart(2, '0')}] ${output}`);
        }
      });
      
      console.log('=' * 60);
      console.log('✅ Streaming completed!\n');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      console.log(`📊 Stream Statistics:`);
      console.log(`   Total stream messages: ${messageCount}`);
      console.log(`   Response messages: ${result.length}`);
      
      if (result[0] && result[0].message && result[0].message.content) {
        const content = result[0].message.content;
        console.log(`\n📝 Final Response Preview:`);
        
        if (Array.isArray(content) && content[0] && content[0].text) {
          const text = content[0].text;
          console.log(`   First 200 chars: "${text.substring(0, 200)}..."`);
          console.log(`   Total length: ${text.length} characters`);
        }
      }
      
      console.log('\n🎯 Stream Output Summary:');
      streamOutput.forEach((output, index) => {
        if (output.includes('Claude') || output.includes('message') || output.includes('processing')) {
          console.log(`   ${index + 1}. ${output.substring(0, 80)}...`);
        }
      });
      
    } catch (error) {
      console.error('❌ Streaming test failed:', error);
      throw error;
    }
  }, 180000); // 3 minute timeout

  test('should show streaming output from LLMProvider', async () => {
    console.log('\n🧪 Testing LLMProvider streaming output...\n');
    
    try {
      const { getGlobalLLM } = await import('@claude-zen/foundation');
      const llm = getGlobalLLM();
      
      if (!llm) {
        console.log('⚠️  No global LLM configured - skipping test');
        return;
      }
      
      llm.setRole('analyst');
      
      const businessCase = `Epic Proposal: AI-Powered Customer Segmentation System

Business Context:
- Current manual segmentation takes 2 weeks per campaign
- Missing 40% revenue opportunities due to poor targeting  
- Customer churn rate at 15% (industry average: 8%)
- Marketing team of 12 people spending 60% time on manual analysis

Proposed Solution:
- Machine learning segmentation engine
- Real-time behavioral analysis
- Automated campaign targeting
- Predictive churn modeling

Investment Required:
- Development: $400,000
- Infrastructure: $100,000  
- Training & rollout: $50,000
- Total: $550,000

Expected Returns:
- 25% increase in campaign conversion rates
- 40% reduction in manual analysis time
- 50% improvement in customer retention
- Estimated annual value: $1,200,000

Timeline: 8 months
Risk Level: Medium-High

As a SAFe Epic Owner, provide your detailed analysis and decision.`;

      console.log('📡 Making LLMProvider analysis call...');
      console.log('=' * 60);
      
      const startTime = Date.now();
      let hasStarted = false;
      
      // Simulate streaming by showing progress
      const progressInterval = setInterval(() => {
        if (!hasStarted) {
          hasStarted = true;
          console.log('[PROGRESS] 🔄 LLM analysis starting...');
        } else {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          console.log(`[PROGRESS] ⏱️  Analysis in progress... ${elapsed}s`);
        }
      }, 3000);
      
      const result = await llm.executeAsAnalyst(businessCase);
      
      clearInterval(progressInterval);
      
      const duration = Date.now() - startTime;
      console.log('=' * 60);
      console.log(`✅ LLMProvider analysis completed in ${duration}ms!\n`);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
      
      console.log(`📝 Epic Owner Analysis Preview:`);
      console.log(`   Length: ${result.length} characters`);
      console.log(`   First 300 chars: "${result.substring(0, 300)}..."`);
      
      // Try to extract decision if it's JSON format
      try {
        const parsed = JSON.parse(result);
        if (parsed.decision) {
          console.log(`\n🏛️ Decision Summary:`);
          console.log(`   Decision: ${parsed.decision}`);
          console.log(`   Confidence: ${parsed.confidence || 'N/A'}`);
          console.log(`   Reasoning: ${(parsed.reasoning || '').substring(0, 150)}...`);
        }
      } catch (parseError) {
        console.log(`\n📄 Full Text Analysis (first 500 chars):`);
        console.log(`"${result.substring(0, 500)}..."`);
      }
      
    } catch (error) {
      console.error('❌ LLMProvider streaming test failed:', error);
      throw error;
    }
  }, 180000);

  test('should show streaming SAFe workflow output', async () => {
    console.log('\n🎯 Testing SAFe workflow streaming output...\n');
    
    try {
      const { createSafeSparcWorkflow } = await import('../workflows/safe-sparc-standalone');
      
      const workflow = await createSafeSparcWorkflow();
      console.log('✅ SAFe-SPARC workflow created');
      
      const epic = {
        id: 'streaming-test-001',
        title: 'Real-time Analytics Dashboard',
        businessCase: 'Build real-time analytics dashboard for executive decision making with ML predictions and automated reporting',
        estimatedValue: 800000,
        estimatedCost: 300000,
        timeframe: '6 months',
        riskLevel: 'medium' as const
      };
      
      console.log(`🚀 Running SAFe workflow with streaming output...`);
      console.log(`📊 Epic: ${epic.title}`);
      console.log(`💰 ROI: ${((epic.estimatedValue - epic.estimatedCost) / epic.estimatedCost * 100).toFixed(1)}%`);
      console.log('=' * 80);
      
      const startTime = Date.now();
      let roleCount = 0;
      
      // Listen to workflow events for streaming updates
      workflow.on('role-decision', (event: any) => {
        roleCount++;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        
        console.log(`[WORKFLOW ${roleCount}/5] ⏱️  ${elapsed}s - ${event.role} Decision:`);
        console.log(`   🏛️ Decision: ${event.decision}`);
        console.log(`   📊 Confidence: ${(event.confidence * 100).toFixed(1)}%`);
        console.log(`   💭 Reasoning: ${event.reasoning.substring(0, 100)}...`);
        console.log();
      });
      
      workflow.on('sparc-phase', (event: any) => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`[SPARC] ⏱️  ${elapsed}s - ${event.phase} Phase:`);
        console.log(`   Status: ${event.status}`);
        if (event.artifacts) {
          console.log(`   Artifacts: ${JSON.stringify(event.artifacts).substring(0, 80)}...`);
        }
        console.log();
      });
      
      const result = await workflow.processSafeEpic(epic);
      
      const duration = Date.now() - startTime;
      console.log('=' * 80);
      console.log(`✅ Complete SAFe workflow finished in ${duration}ms!\n`);
      
      expect(result).toBeDefined();
      expect(result.roleDecisions).toHaveLength(5);
      
      console.log(`📋 Final Workflow Results:`);
      console.log(`   Overall Decision: ${result.overallDecision}`);
      console.log(`   Consensus Reached: ${result.consensusReached}`);
      console.log(`   Role Decisions: ${result.roleDecisions.length}`);
      
      if (result.sparcArtifacts) {
        console.log(`   SPARC Status: ${result.sparcArtifacts.status}`);
      }
      
      console.log(`\n🎊 Streaming SAFe workflow test completed successfully!`);
      
    } catch (error) {
      console.error('❌ SAFe workflow streaming test failed:', error);
      throw error;
    }
  }, 300000); // 5 minute timeout for full workflow
});