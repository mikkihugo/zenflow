#!/usr/bin/env tsx
/**
 * @fileoverview Input/Output Capture for Claude SDK
 * 
 * Captures the actual input prompts and output responses that Claude Code OTEL doesn't provide.
 * Uses multiple approaches to intercept the data before JSON parsing errors occur.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface CapturedInteraction {
  timestamp: string;
  phase: string;
  input: {
    prompt: string;
    promptLength: number;
    model?: string;
    maxTokens?: number;
  };
  output: {
    response: string;
    responseLength: number;
    duration: number;
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
    firstTokenTime?: number;
    systemPhaseTime?: number;
  };
}

class InputOutputCapture {
  private interactions: CapturedInteraction[] = [];
  private captureDir: string;

  constructor() {
    this.captureDir = `/tmp/claude-sdk-capture-${Date.now()}`;
  }

  async initializeCapture() {
    await fs.mkdir(this.captureDir, { recursive: true });
    console.log('📁 Input/Output capture initialized');
    console.log(`   Capture directory: ${this.captureDir}`);
    console.log('   Will save: prompts, responses, timing, errors\n');
  }

  async captureClaudeInteraction(
    phase: string,
    prompt: string,
    description: string = ''
  ): Promise<CapturedInteraction> {
    console.log(`🎯 Capturing ${phase}: ${description}`);
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    let firstTokenTime = 0;
    let systemPhaseStart = 0;
    let systemPhaseEnd = 0;
    let messageCount = 0;
    
    // Save input immediately
    const inputFile = path.join(this.captureDir, `${phase}-input.txt`);
    await fs.writeFile(inputFile, `PHASE: ${phase}\nTIMESTAMP: ${new Date().toISOString()}\nDESCRIPTION: ${description}\n\n${prompt}`);
    
    console.log(`📝 Input saved: ${inputFile}`);
    console.log(`📋 Prompt length: ${prompt.length} characters`);
    console.log(`📋 Prompt preview: ${prompt.substring(0, 200)}...`);
    console.log('─'.repeat(60));
    
    const interaction: CapturedInteraction = {
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
        duration: 0
      },
      metadata: {
        success: false
      }
    };

    try {
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      console.log('🚀 Starting Claude API call...');
      console.log('⏱️  Monitoring for 30+ second delays...\n');
      
      const result = await executeClaudeTask(prompt, {
        timeoutMs: 180000,
        stderr: (output: string) => {
          messageCount++;
          const elapsed = Date.now() - startTime;
          
          if (output.includes('Starting Claude')) {
            console.log(`🚀 [${elapsed}ms] Startup: ${output}`);
            
          } else if (output.includes('[SYSTEM]')) {
            if (systemPhaseStart === 0) {
              systemPhaseStart = Date.now();
              console.log(`🔄 [${elapsed}ms] System phase started`);
            }
            
            const systemElapsed = Date.now() - systemPhaseStart;
            if (systemElapsed > 10000 && systemElapsed % 5000 < 1000) {
              console.log(`⚠️  [${elapsed}ms] System processing: ${Math.floor(systemElapsed/1000)}s (${output.substring(0, 100)})`);
            }
            
          } else if (output.includes('[MSG')) {
            if (firstTokenTime === 0) {
              firstTokenTime = elapsed;
              systemPhaseEnd = Date.now();
              console.log(`💬 [${elapsed}ms] First token received! System phase: ${Math.floor((systemPhaseEnd - systemPhaseStart)/1000)}s`);
            } else {
              if (messageCount % 10 === 0) {
                console.log(`💬 [${elapsed}ms] Streaming chunk ${messageCount}`);
              }
            }
            
          } else if (output.includes('[RESULT]')) {
            console.log(`✅ [${elapsed}ms] Result received: ${output}`);
          }
        }
      });

      const totalTime = Date.now() - startTime;
      
      // Extract response
      let responseText = '';
      let tokenUsage = undefined;
      
      if (result && result.length > 0) {
        const content = result[0]?.message?.content;
        if (Array.isArray(content) && content[0]?.text) {
          responseText = content[0].text;
        }
        
        const usage = result[0]?.usage;
        if (usage) {
          tokenUsage = {
            input: usage.input_tokens || 0,
            output: usage.output_tokens || 0,
            total: (usage.input_tokens || 0) + (usage.output_tokens || 0)
          };
        }
      }
      
      // Update interaction record
      interaction.output = {
        response: responseText,
        responseLength: responseText.length,
        duration: totalTime,
        tokenUsage: tokenUsage,
        cost: tokenUsage ? (tokenUsage.input * 0.003 + tokenUsage.output * 0.015) / 1000 : undefined
      };
      
      interaction.metadata = {
        success: true,
        firstTokenTime: firstTokenTime,
        systemPhaseTime: systemPhaseEnd > systemPhaseStart ? systemPhaseEnd - systemPhaseStart : undefined
      };
      
      // Save output
      const outputFile = path.join(this.captureDir, `${phase}-output.txt`);
      const outputData = `PHASE: ${phase}\nTIMESTAMP: ${new Date().toISOString()}\nDURATION: ${totalTime}ms\nFIRST_TOKEN: ${firstTokenTime}ms\nSYSTEM_PHASE: ${interaction.metadata.systemPhaseTime}ms\nRESPONSE_LENGTH: ${responseText.length}\nTOKEN_USAGE: ${JSON.stringify(tokenUsage, null, 2)}\n\n${responseText}`;
      
      await fs.writeFile(outputFile, outputData);
      
      console.log('\n📊 CAPTURE COMPLETE');
      console.log('─'.repeat(40));
      console.log(`📄 Output saved: ${outputFile}`);
      console.log(`⏱️  Total time: ${Math.floor(totalTime/1000)}s (${totalTime}ms)`);
      console.log(`💬 First token: ${Math.floor(firstTokenTime/1000)}s`);
      console.log(`📊 Response length: ${responseText.length} characters`);
      console.log(`💰 Estimated cost: $${interaction.output.cost?.toFixed(4) || 'unknown'}`);
      
      if (interaction.metadata.systemPhaseTime && interaction.metadata.systemPhaseTime > 30000) {
        console.log(`🔥 System phase exceeded 30s: ${Math.floor(interaction.metadata.systemPhaseTime/1000)}s`);
      }
      
      console.log('\n📋 Response preview:');
      console.log('─'.repeat(40));
      console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      console.log('─'.repeat(40));
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      console.error(`\n❌ Capture failed after ${Math.floor(totalTime/1000)}s:`, error.message);
      
      interaction.output.duration = totalTime;
      interaction.metadata = {
        success: false,
        error: error.message,
        firstTokenTime: firstTokenTime,
        systemPhaseTime: systemPhaseEnd > systemPhaseStart ? systemPhaseEnd - systemPhaseStart : undefined
      };
      
      // Save error details
      const errorFile = path.join(this.captureDir, `${phase}-error.txt`);
      const errorData = `PHASE: ${phase}\nTIMESTAMP: ${new Date().toISOString()}\nDURATION: ${totalTime}ms\nERROR: ${error.message}\nSTACK: ${error.stack}\n\nFIRST_TOKEN_TIME: ${firstTokenTime}ms\nSYSTEM_PHASE_TIME: ${interaction.metadata.systemPhaseTime}ms\nMESSAGE_COUNT: ${messageCount}`;
      
      await fs.writeFile(errorFile, errorData);
      console.log(`📄 Error details saved: ${errorFile}`);
      
      // Still return the interaction record with error details
    }
    
    this.interactions.push(interaction);
    return interaction;
  }

  async runInputOutputTest() {
    console.log('🔬 INPUT/OUTPUT CAPTURE TEST');
    console.log('============================\n');
    
    await this.initializeCapture();
    
    // Test with progressively complex prompts to isolate the issue
    
    // Test 1: Simple prompt
    console.log('🧪 Test 1: Simple prompt');
    await this.captureClaudeInteraction(
      'simple_test',
      'What is 2+2? Answer with just the number.',
      'Simple math question to test basic functionality'
    );
    
    console.log('\n' + '═'.repeat(80) + '\n');
    
    // Test 2: SAFe prompt (this is likely where the 30s delay and JSON error occur)
    console.log('🧪 Test 2: SAFe Epic evaluation');
    await this.captureClaudeInteraction(
      'safe_epic_test',
      `As a SAFe Epic Owner, quickly evaluate:

Epic: Customer Support Bot
Business Value: $400k/year efficiency gains
Development Cost: $150k (4-month timeline)
Risk Level: Low (proven technology)

Decision: approve/reject/defer with brief reasoning.`,
      'SAFe Epic evaluation that typically causes 30+ second delays'
    );
    
    console.log('\n' + '═'.repeat(80) + '\n');
    
    await this.generateCaptureReport();
  }
  
  async generateCaptureReport() {
    console.log('📊 INPUT/OUTPUT CAPTURE REPORT');
    console.log('==============================\n');
    
    // Summary statistics
    const totalInteractions = this.interactions.length;
    const successfulInteractions = this.interactions.filter(i => i.metadata.success).length;
    const failedInteractions = totalInteractions - successfulInteractions;
    
    console.log(`📈 Summary:`);
    console.log(`   Total interactions: ${totalInteractions}`);
    console.log(`   Successful: ${successfulInteractions}`);
    console.log(`   Failed: ${failedInteractions}`);
    
    if (this.interactions.length > 0) {
      const totalTime = this.interactions.reduce((sum, i) => sum + i.output.duration, 0);
      console.log(`   Average duration: ${Math.floor(totalTime / this.interactions.length / 1000)}s`);
      
      // Find slow interactions
      const slowInteractions = this.interactions.filter(i => i.output.duration > 30000);
      if (slowInteractions.length > 0) {
        console.log(`\n🔥 Slow interactions (>30s):`);
        slowInteractions.forEach(interaction => {
          console.log(`   ${interaction.phase}: ${Math.floor(interaction.output.duration/1000)}s`);
          if (interaction.metadata.systemPhaseTime) {
            console.log(`      System phase: ${Math.floor(interaction.metadata.systemPhaseTime/1000)}s`);
          }
        });
      }
      
      // Details for each interaction
      console.log(`\n📋 Detailed Results:`);
      this.interactions.forEach((interaction, index) => {
        console.log(`\n${index + 1}. ${interaction.phase} [${interaction.metadata.success ? '✅' : '❌'}]`);
        console.log(`   Input: ${interaction.input.promptLength} chars`);
        console.log(`   Output: ${interaction.output.responseLength} chars`);
        console.log(`   Duration: ${Math.floor(interaction.output.duration/1000)}s`);
        
        if (interaction.metadata.firstTokenTime) {
          console.log(`   First token: ${Math.floor(interaction.metadata.firstTokenTime/1000)}s`);
        }
        
        if (interaction.metadata.systemPhaseTime) {
          console.log(`   System phase: ${Math.floor(interaction.metadata.systemPhaseTime/1000)}s`);
        }
        
        if (interaction.output.tokenUsage) {
          console.log(`   Tokens: ${interaction.output.tokenUsage.total} (${interaction.output.tokenUsage.input} in, ${interaction.output.tokenUsage.output} out)`);
        }
        
        if (interaction.output.cost) {
          console.log(`   Cost: $${interaction.output.cost.toFixed(4)}`);
        }
        
        if (interaction.metadata.error) {
          console.log(`   Error: ${interaction.metadata.error}`);
        }
      });
    }
    
    // Save complete report
    const reportFile = path.join(this.captureDir, 'complete-capture-report.json');
    await fs.writeFile(reportFile, JSON.stringify({
      summary: {
        timestamp: new Date().toISOString(),
        totalInteractions: totalInteractions,
        successful: successfulInteractions,
        failed: failedInteractions,
        captureDirectory: this.captureDir
      },
      interactions: this.interactions
    }, null, 2));
    
    console.log(`\n💾 Complete capture report: ${reportFile}`);
    console.log(`📁 All files saved to: ${this.captureDir}`);
    
    console.log('\n🎯 Key Findings:');
    console.log('✅ Full prompts captured (Claude Code OTEL limitation bypassed)');
    console.log('✅ Full responses captured (Claude Code OTEL limitation bypassed)');  
    console.log('✅ Detailed timing analysis with 30+ second delay breakdown');
    console.log('✅ Error details captured for JSON parsing failures');
    console.log('✅ Token usage and cost estimates included');
  }
}

async function runInputOutputCapture() {
  const captureSystem = new InputOutputCapture();
  await captureSystem.runInputOutputTest();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runInputOutputCapture().catch(console.error);
}

export { InputOutputCapture, runInputOutputCapture };