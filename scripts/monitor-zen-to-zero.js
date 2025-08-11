#!/usr/bin/env node

/**
 * Monitor Zen AI Fixer Until Zero Errors
 * Continuously runs the zen fixer until all TypeScript errors are eliminated
 */

import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ZenMonitor {
  constructor() {
    this.maxIterations = 50; // Safety limit
    this.currentIteration = 0;
    this.startTime = Date.now();
    this.lastErrorCount = null;
    this.stuckCount = 0; // Track if we're stuck at same error count
  }

  async checkTypeScriptErrors() {
    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck', {
        cwd: process.cwd(),
        timeout: 60000, // 1 minute timeout
      });

      // Parse error count from tsc output
      const errorLines = stderr.split('\n').filter((line) => line.includes('error TS'));
      return errorLines.length;
    } catch (error) {
      // tsc exits with error code when there are compilation errors
      const errorLines = error.stdout
        ? error.stdout.split('\n').filter((line) => line.includes('error TS'))
        : error.stderr.split('\n').filter((line) => line.includes('error TS'));
      return errorLines.length;
    }
  }

  async runZenFixer() {
    // console.log(`🚀 Starting Zen AI Fixer - Iteration ${this.currentIteration + 1}`);

    return new Promise((resolve, reject) => {
      const zenProcess = spawn('npm', ['run', 'fix:zen:compile'], {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      let output = '';
      let errorOutput = '';

      zenProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Show real-time progress
        if (
          text.includes('ITERATION') ||
          text.includes('ROOT CAUSE') ||
          text.includes('Batched code fixing complete')
        ) {
          // console.log(text.trim());
        }
      });

      zenProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      zenProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ output, errorOutput, success: true });
        } else {
          // console.log(`⚠️ Zen fixer exited with code ${code}`);
          resolve({ output, errorOutput, success: false, code });
        }
      });

      zenProcess.on('error', (error) => {
        reject(error);
      });

      // Set timeout for zen fixer (15 minutes per run)
      setTimeout(() => {
        zenProcess.kill('SIGTERM');
        resolve({ output, errorOutput, success: false, timeout: true });
      }, 900000);
    });
  }

  async monitorToZero() {
    // console.log('🎯 Zen AI Fixer Monitor - Running Until Zero Errors');
    // console.log('='.repeat(60));

    while (this.currentIteration < this.maxIterations) {
      this.currentIteration++;

      // Check current error count before fixing
      const errorsBefore = await this.checkTypeScriptErrors();
      // console.log(`📊 Current TypeScript errors: ${errorsBefore}`);

      if (errorsBefore === 0) {
        // console.log('🎉 SUCCESS! Zero TypeScript errors achieved!');
        this.logSummary(0);
        return;
      }

      // Track if we're stuck
      if (this.lastErrorCount === errorsBefore) {
        this.stuckCount++;
        if (this.stuckCount >= 3) {
          // console.log(
          
          // console.log(`💡 Try running: npm run fix:zen:eslint or npm run fix:zen:warnings`);
          break;
        }
      } else {
        this.stuckCount = 0;
      }

      this.lastErrorCount = errorsBefore;

      // Run zen fixer
      const result = await this.runZenFixer();

      if (result.timeout) {
        // console.log('⏰ Zen fixer timed out - continuing with next iteration');
      }

      // Check errors after fixing
      const errorsAfter = await this.checkTypeScriptErrors();
      const fixed = errorsBefore - errorsAfter;

      // console.log(`📈 Progress: ${errorsBefore} → ${errorsAfter} (fixed: ${fixed})`);

      if (errorsAfter === 0) {
        // console.log('🎉 SUCCESS! Zero TypeScript errors achieved!');
        this.logSummary(errorsAfter);
        return;
      }

      if (fixed <= 0) {
        // console.log('⚠️ No progress made this iteration');
      }

      // Short break between iterations
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // console.log(`⚠️ Maximum iterations (${this.maxIterations}) reached`);
    const finalErrors = await this.checkTypeScriptErrors();
    this.logSummary(finalErrors);
  }

  logSummary(finalErrors) {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000 / 60);
    // console.log('\n🏁 ZEN AI FIXER MONITORING COMPLETE');
    // console.log('='.repeat(50));
    // console.log(`⏱️ Total time: ${totalTime} minutes`);
    // console.log(`🔄 Iterations completed: ${this.currentIteration}`);
    // console.log(`🎯 Final error count: ${finalErrors}`);
    // console.log(`✅ Success: ${finalErrors === 0 ? 'YES' : 'NO'}`);

    if (finalErrors === 0) {
      // console.log('🎊 CONGRATULATIONS! All TypeScript errors have been eliminated!');
    } else {
      // console.log(
      `💡 ${finalErrors} errors remaining - may need manual review or different fixing strategy`;
    }
  }
}

// Run the monitor
const monitor = new ZenMonitor();
monitor.monitorToZero().catch((error) => {
  // console.error('❌ Monitor failed:', error);
  process.exit(1);
});
