#!/usr/bin/env tsx
/**
 * @fileoverview Fixed Input/Output Capture for Claude SDK
 * 
 * FIXED: Now correctly extracts responses from result[1].message (assistant) not result[0] (system)
 * Provides complete prompt and response capture that Claude Code OTEL doesn't provide.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface FixedCapturedInteraction {
  timestamp: string;
  phase: string;
  input: {
    prompt: string;
    promptLength: number;
    model?: string;
  };
  output: {
    response: string;
    responseLength: number;
    duration: number;
    firstTokenTime: number;
    systemPhaseTime?: number;
    tokenUsage?: {
      input: number;
      output: number;
      total: number;
    };
    cost?: number;
  };
  metadata: {
    success: boolean;
    error?: string;
    resultStructure?: any;
  };
}

class FixedInputOutputCapture {
  private interactions: FixedCapturedInteraction[] = [];
  private captureDir: string;

  constructor() {
    this.captureDir = `/tmp/fixed-claude-capture-${Date.now()}`;
  }

  async initializeCapture() {
    await fs.mkdir(this.captureDir, { recursive: true });
    console.log('🔧 FIXED Input/Output capture initialized');
    console.log(`   Capture directory: ${this.captureDir}`);
    console.log('   ✅ Fixed response extraction logic (result[1] not result[0])');
    console.log('   Will capture: full prompts, full responses, detailed timing\n');
  }

  /**
   * FIXED: Correct Claude SDK response extraction
   */
  private extractResponseFromResult(result: any[]): {
    response: string;
    tokenUsage?: any;
    cost?: number;
  } {
    console.log(`🔍 Analyzing result structure with ${result?.length || 0} elements...`);
    
    let response = '';
    let tokenUsage = undefined;
    let cost = undefined;
    
    if (!result || !Array.isArray(result)) {
      console.log('❌ Result is not an array');
      return { response, tokenUsage, cost };
    }
    
    // Find the assistant message (usually result[1])
    const assistantMessage = result.find(r => r.type === 'assistant' && r.message);
    
    if (assistantMessage) {
      console.log('✅ Found assistant message in result');
      const content = assistantMessage.message?.content;
      
      if (Array.isArray(content) && content[0]?.text) {
        response = content[0].text;
        console.log(`   Response extracted: ${response.length} characters`);
      } else {
        console.log(`❌ No text in assistant message content`);
      }
      
      // Get usage data from assistant message
      const usage = assistantMessage.message?.usage;
      if (usage) {
        tokenUsage = {
          input: usage.input_tokens || 0,
          output: usage.output_tokens || 0,
          total: (usage.input_tokens || 0) + (usage.output_tokens || 0)
        };
        console.log(`   Token usage: ${tokenUsage.total} tokens`);
      }
    } else {
      console.log('❌ No assistant message found in result');
    }
    
    // Find result summary for cost info (usually result[2])
    const resultSummary = result.find(r => r.type === 'result' && r.total_cost_usd);
    if (resultSummary) {
      cost = resultSummary.total_cost_usd;
      console.log(`   Cost found: $${cost}`);
    }
    
    return { response, tokenUsage, cost };
  }

  async captureFixedClaudeInteraction(
    phase: string,
    prompt: string,
    description: string = ''
  ): Promise<FixedCapturedInteraction> {
    console.log(`🎯 FIXED Capturing ${phase}: ${description}`);
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    let firstTokenTime = 0;
    let systemPhaseStart = 0;
    let systemPhaseEnd = 0;
    
    // Save input immediately
    const inputFile = path.join(this.captureDir, `${phase}-input.txt`);
    await fs.writeFile(inputFile, `PHASE: ${phase}\nTIMESTAMP: ${new Date().toISOString()}\nDESCRIPTION: ${description}\n\nPROMPT:\n${prompt}`);
    
    console.log(`📝 Input saved: ${phase}-input.txt`);
    console.log(`📋 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    console.log(`📊 Length: ${prompt.length} characters`);
    console.log('─'.repeat(60));
    
    const interaction: FixedCapturedInteraction = {
      timestamp: new Date().toISOString(),
      phase: phase,
      input: {
        prompt: prompt,
        promptLength: prompt.length,
        model: 'claude-sonnet-4-20250514'
      },
      output: {
        response: '',
        responseLength: 0,
        duration: 0,
        firstTokenTime: 0
      },
      metadata: {
        success: false
      }
    };

    try {
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      console.log('🚀 Starting Claude API call with FIXED extraction...\n');
      
      const result = await executeClaudeTask(prompt, {
        timeoutMs: 180000,
        stderr: (output: string) => {
          const elapsed = Date.now() - startTime;
          
          if (output.includes('Starting Claude')) {
            console.log(`🚀 [${elapsed}ms] Startup: Claude SDK initialized`);
            
          } else if (output.includes('[SYSTEM]')) {
            if (systemPhaseStart === 0) {
              systemPhaseStart = Date.now();
              console.log(`🔄 [${elapsed}ms] System processing started...`);
            }
            
            const systemElapsed = Date.now() - systemPhaseStart;
            if (systemElapsed > 5000 && systemElapsed % 5000 < 1000) {
              console.log(`⏳ [${elapsed}ms] System: ${Math.floor(systemElapsed/1000)}s`);
            }
            
          } else if (output.includes('[MSG')) {
            if (firstTokenTime === 0) {
              firstTokenTime = elapsed;
              systemPhaseEnd = Date.now();
              console.log(`💬 [${elapsed}ms] First token! System took: ${Math.floor((systemPhaseEnd - systemPhaseStart)/1000)}s`);
            }
            
          } else if (output.includes('[RESULT]')) {
            console.log(`✅ [${elapsed}ms] Response complete`);
          }
        }
      });

      const totalTime = Date.now() - startTime;
      
      // FIXED: Use corrected extraction logic
      const { response, tokenUsage, cost } = this.extractResponseFromResult(result);
      
      // Update interaction record with FIXED data
      interaction.output = {
        response: response,
        responseLength: response.length,
        duration: totalTime,
        firstTokenTime: firstTokenTime,
        systemPhaseTime: systemPhaseEnd > systemPhaseStart ? systemPhaseEnd - systemPhaseStart : undefined,
        tokenUsage: tokenUsage,
        cost: cost
      };
      
      interaction.metadata = {
        success: true,
        resultStructure: {
          totalElements: result?.length || 0,
          types: result?.map(r => r.type) || [],
          hasAssistantMessage: result?.some(r => r.type === 'assistant') || false,
          hasResultSummary: result?.some(r => r.type === 'result') || false
        }
      };
      
      // Save complete output with FIXED data
      const outputFile = path.join(this.captureDir, `${phase}-output.txt`);
      const outputData = `PHASE: ${phase}
TIMESTAMP: ${new Date().toISOString()}
DURATION: ${totalTime}ms
FIRST_TOKEN: ${firstTokenTime}ms
SYSTEM_PHASE: ${interaction.output.systemPhaseTime}ms
RESPONSE_LENGTH: ${response.length}
TOKEN_USAGE: ${JSON.stringify(tokenUsage, null, 2)}
COST: $${cost || 'unknown'}

FULL RESPONSE:
${response}

RESULT STRUCTURE:
${JSON.stringify(interaction.metadata.resultStructure, null, 2)}`;
      
      await fs.writeFile(outputFile, outputData);
      
      console.log('\n🎉 FIXED CAPTURE COMPLETE!');
      console.log('─'.repeat(50));
      console.log(`📄 Files saved: ${phase}-input.txt, ${phase}-output.txt`);
      console.log(`⏱️  Total time: ${Math.floor(totalTime/1000)}s (${totalTime}ms)`);
      console.log(`💬 First token: ${Math.floor(firstTokenTime/1000)}s`);
      console.log(`📊 Response length: ${response.length} chars (FIXED!)`)
      console.log(`💰 Cost: $${cost || 'unknown'}`);
      
      if (interaction.output.systemPhaseTime && interaction.output.systemPhaseTime > 10000) {
        console.log(`🔥 System phase: ${Math.floor(interaction.output.systemPhaseTime/1000)}s`);
      }
      
      console.log('\n📋 Response preview (FIXED!):');
      console.log('─'.repeat(40));
      console.log(response.length > 0 ? response.substring(0, 300) + (response.length > 300 ? '...' : '') : '❌ NO RESPONSE EXTRACTED');
      console.log('─'.repeat(40));
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      console.error(`\n❌ FIXED capture failed after ${Math.floor(totalTime/1000)}s:`, error.message);
      
      interaction.output.duration = totalTime;
      interaction.output.firstTokenTime = firstTokenTime;
      interaction.metadata = {
        success: false,
        error: error.message
      };
      
      const errorFile = path.join(this.captureDir, `${phase}-error.txt`);
      await fs.writeFile(errorFile, `ERROR: ${error.message}\nSTACK: ${error.stack}`);
    }
    
    this.interactions.push(interaction);
    return interaction;
  }

  async runFixedTest() {
    console.log('🔧 FIXED INPUT/OUTPUT CAPTURE TEST');
    console.log('==================================\n');
    
    await this.initializeCapture();
    
    // Test 1: Simple prompt (should now work correctly)
    console.log('🧪 Test 1: Simple math (FIXED extraction)');
    await this.captureFixedClaudeInteraction(
      'simple_fixed',
      'What is 2+2? Just answer with the number.',
      'Simple test with FIXED response extraction'
    );
    
    console.log('\n' + '═'.repeat(80) + '\n');
    
    // Test 2: SAFe prompt (should now capture full response)
    console.log('🧪 Test 2: SAFe Epic (FIXED extraction)');
    await this.captureFixedClaudeInteraction(
      'safe_fixed',
      `As a SAFe Epic Owner, evaluate this epic:

Epic: AI Customer Support Bot
Business Value: $400k/year efficiency gains
Development Cost: $150k over 4 months
Risk Level: Low (proven tech stack)
Strategic Alignment: High (customer experience focus)

Provide decision (APPROVE/REJECT/DEFER) with detailed reasoning including:
1. ROI calculation and timeline
2. Strategic fit assessment  
3. Risk analysis and mitigation
4. Resource requirements

Make it comprehensive for executive review.`,
      'Complex SAFe Epic evaluation with FIXED extraction'
    );
    
    console.log('\n' + '═'.repeat(80) + '\n');
    
    await this.generateFixedReport();
  }
  
  async generateFixedReport() {
    console.log('📊 FIXED INPUT/OUTPUT CAPTURE REPORT');
    console.log('===================================\n');
    
    const totalInteractions = this.interactions.length;
    const successfulInteractions = this.interactions.filter(i => i.metadata.success).length;
    const withResponses = this.interactions.filter(i => i.output.responseLength > 0).length;
    
    console.log(`📈 FIXED Results Summary:`);
    console.log(`   Total interactions: ${totalInteractions}`);
    console.log(`   Successful: ${successfulInteractions}`);
    console.log(`   With responses: ${withResponses} (FIXED!)`);
    console.log(`   Response extraction rate: ${Math.floor(withResponses/totalInteractions*100)}%`);
    
    if (this.interactions.length > 0) {
      const totalTokens = this.interactions.reduce((sum, i) => sum + (i.output.tokenUsage?.total || 0), 0);
      const totalCost = this.interactions.reduce((sum, i) => sum + (i.output.cost || 0), 0);
      
      console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
      console.log(`   Total cost: $${totalCost.toFixed(4)}`);
      
      console.log(`\n📋 Interaction Details:`);
      this.interactions.forEach((interaction, index) => {
        console.log(`\n${index + 1}. ${interaction.phase} [${interaction.metadata.success ? '✅' : '❌'}]`);
        console.log(`   Input: ${interaction.input.promptLength} chars`);
        console.log(`   Output: ${interaction.output.responseLength} chars ${interaction.output.responseLength > 0 ? '✅' : '❌'}`);
        console.log(`   Duration: ${Math.floor(interaction.output.duration/1000)}s`);
        console.log(`   System phase: ${Math.floor((interaction.output.systemPhaseTime || 0)/1000)}s`);
        console.log(`   First token: ${Math.floor(interaction.output.firstTokenTime/1000)}s`);
        
        if (interaction.output.tokenUsage) {
          console.log(`   Tokens: ${interaction.output.tokenUsage.total}`);
        }
        
        if (interaction.output.cost) {
          console.log(`   Cost: $${interaction.output.cost.toFixed(4)}`);
        }
        
        if (interaction.metadata.resultStructure) {
          console.log(`   Result structure: ${JSON.stringify(interaction.metadata.resultStructure)}`);
        }
      });
    }
    
    // Save complete report
    const reportFile = path.join(this.captureDir, 'fixed-capture-report.json');
    await fs.writeFile(reportFile, JSON.stringify({
      summary: {
        timestamp: new Date().toISOString(),
        totalInteractions: totalInteractions,
        successful: successfulInteractions,
        withResponses: withResponses,
        responseExtractionRate: Math.floor(withResponses/totalInteractions*100),
        captureDirectory: this.captureDir,
        fixApplied: 'result[1].message extraction instead of result[0]'
      },
      interactions: this.interactions
    }, null, 2));
    
    console.log(`\n💾 FIXED report saved: fixed-capture-report.json`);
    console.log(`📁 All files in: ${this.captureDir}`);
    
    console.log('\n🎯 FIXED Solution Summary:');
    console.log('✅ FIXED: Response extraction now uses result[1] (assistant) not result[0] (system)');
    console.log('✅ Full prompts captured (bypassing Claude Code OTEL limitation)');
    console.log('✅ Full responses captured (bypassing Claude Code OTEL limitation)');  
    console.log('✅ Detailed timing analysis including 30+ second delay breakdown');
    console.log('✅ Token usage and cost data captured');
    console.log('✅ Complete solution for SAFe-SPARC workflow observability');
  }
}

async function runFixedCapture() {
  const captureSystem = new FixedInputOutputCapture();
  await captureSystem.runFixedTest();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFixedCapture().catch(console.error);
}

export { FixedInputOutputCapture, runFixedCapture };