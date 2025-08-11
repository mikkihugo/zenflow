#!/usr/bin/env node

/**
 * Test Batch Processing for Single-Error Files
 *
 * This script demonstrates batching 10-15 single-error files instead of processing individually
 * Run when the main fixer reaches the single-error files (around iteration 15-20)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClaudeAIIntegration } from './ai-eslint/claude-ai-integration.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class BatchProcessingTest {
  constructor() {
    this.claude = new ClaudeAIIntegration();
  }

  async testBatchProcessing() {
    // console.log('🧪 Testing Batch Processing for Single-Error Files\n');

    // Get current TypeScript errors
    const errors = await this.runTypeScriptCompiler();
    // console.log(`📊 Total errors: ${errors.length}\n`);

    // Group by file and find single-error files
    const errorsByFile = this.groupErrorsByFile(errors);
    const singleErrorFiles = Array.from(errorsByFile.entries())
      .filter(([filePath, fileErrors]) => fileErrors.length === 1)
      .slice(0, 10); // Test with first 10 single-error files

    if (singleErrorFiles.length === 0) {
      // console.log('❌ No single-error files found for testing');
      return;
    }

    // console.log(`🎯 Testing with ${singleErrorFiles.length} single-error files:`);
    singleErrorFiles.forEach(([filePath, fileErrors]) => {
      const error = fileErrors[0];
      // console.log(
      `   ${path.basename(filePath)}: ${error.code} - ${error.message.slice(0, 60)}...`;
      )
    });

    // Group by error type
    const errorGroups = this.groupSingleErrorFilesByType(singleErrorFiles);

    // console.log(`\n📦 Error type groups:`);
    for (const [errorType, files] of errorGroups.entries()) {
      // console.log(`   ${errorType}: ${files.length} files`);
    }

    // Test batch processing vs individual processing
    const testSize = Math.min(5, singleErrorFiles.length); // Test with 5 files max
    const testFiles = singleErrorFiles.slice(0, testSize);

    // console.log(`\n⚡ SPEED TEST: Processing ${testSize} files\n`);

    // Method 1: Individual Processing (current approach)
    // console.log('🔄 Method 1: Individual Processing');
    const individualStart = Date.now();
    let individualSuccess = 0;

    for (const [filePath, fileErrors] of testFiles) {
      // console.log(`   Processing ${path.basename(filePath)}...`);
      const result = await this.processIndividualFile(filePath, fileErrors[0]);
      if (result.success) individualSuccess++;
      await this.sleep(500); // Simulate processing time
    }

    const individualTime = Date.now() - individualStart;
    // console.log(`   ✅ Individual: ${individualSuccess}/${testSize} files, ${individualTime}ms\n`);

    // Method 2: Batch Processing (new approach)
    // console.log('🚀 Method 2: Batch Processing');
    const batchStart = Date.now();

    const batchResult = await this.processBatch(testFiles);
    const batchTime = Date.now() - batchStart;

    // console.log(
    `   ✅ Batch: ${batchResult.success ? testSize : 0}/${testSize} files, ${batchTime}ms\n`;
    )

    // Results
    const speedup = individualTime / batchTime;
    // console.log(`📊 RESULTS:`);
    // console.log(`   Individual approach: ${individualTime}ms`);
    // console.log(`   Batch approach: ${batchTime}ms`);
    // console.log(`   🚀 Speedup: ${speedup.toFixed(2)}x faster`);
    // console.log(`   💾 Tool calls: ${testSize} → 1 (${testSize}x reduction)`);

    if (speedup > 3) {
      // console.log(`\n🔥 EXCELLENT: Batching provides significant speedup!`);
      // console.log(`💡 Recommendation: Integrate batching into main fixer for single-error files`);
    } else if (speedup > 1.5) {
      // console.log(`\n⚡ GOOD: Batching provides moderate speedup`);
      // console.log(`💡 Recommendation: Consider batching for efficiency gains`);
    } else {
      // console.log(`\n📋 NEUTRAL: Limited speedup for small batches`);
      // console.log(`💡 Note: Larger batches (15-20 files) would show better results`);
    }
  }

  async processIndividualFile(filePath, error) {
    // Simulate individual file processing (without actually calling Claude)
    // console.log(`     Fixing ${error.code} error...`);

    try {
      // Mock processing - in real implementation this would call Claude CLI
      await this.sleep(100 + Math.random() * 200); // Simulate variable processing time
      return { success: Math.random() > 0.2 }; // 80% success rate simulation
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async processBatch(files) {
    // console.log(`     Processing batch of ${files.length} files...`);

    const fileList = files
      .map(
        ([filePath, fileErrors]) =>
          `${path.basename(filePath)}: ${fileErrors[0].code} - ${fileErrors[0].message.slice(0, 40)}...`
      )
      .join('\\n');

    const prompt = `BATCH PROCESSING TEST: Fix ${files.length} single-error files efficiently.

FILES IN BATCH:
${fileList}

STRATEGY: Process all files in a single coordinated approach using parallel operations.
This is a SIMULATION - respond with a brief acknowledgment of the batch processing approach.`;

    try {
      // In a real implementation, this would call Claude CLI
      // const result = await this.claude.callClaudeCLI('batch-test', prompt);

      // Simulate batch processing time (faster than individual)
      await this.sleep(300 + Math.random() * 200);

      // console.log(`     ✅ Batch processed ${files.length} files with coordinated fixes`);
      return { success: true, processedFiles: files.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  groupSingleErrorFilesByType(singleErrorFiles) {
    const groups = new Map();

    for (const [filePath, fileErrors] of singleErrorFiles) {
      const error = fileErrors[0];
      const errorType = this.categorizeErrorType(error);

      if (!groups.has(errorType)) {
        groups.set(errorType, []);
      }

      groups.get(errorType).push({ filePath, error });
    }

    return groups;
  }

  categorizeErrorType(error) {
    if (error.code === 'TS2307' || error.message.includes('Cannot find module')) {
      return 'Module Resolution';
    }
    if (error.code === 'TS2304' || error.message.includes('Cannot find name')) {
      return 'Missing Types';
    }
    if (
      error.code === 'TS2305' ||
      error.code === 'TS2724' ||
      error.message.includes('has no exported member')
    ) {
      return 'Export Members';
    }
    if (error.code === 'TS2322' || error.message.includes('not assignable')) {
      return 'Type Assignment';
    }
    if (
      error.code === 'TS2339' ||
      (error.message.includes('Property') && error.message.includes('does not exist'))
    ) {
      return 'Missing Properties';
    }

    return 'Other';
  }

  async runTypeScriptCompiler() {
    return new Promise((resolve) => {
      const tsc = spawn(
        'node',
        [
          './node_modules/typescript/lib/tsc.js',
          '--noEmitOnError',
          'false',
          '--skipLibCheck',
          'true',
          '--noEmit',
          'true',
          '--pretty',
          'false',
        ],
        {
          stdio: 'pipe',
          cwd: path.resolve(__dirname, '..'),
        }
      );

      let stdout = '';
      let stderr = '';

      tsc.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      tsc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      tsc.on('close', (code) => {
        const errors = this.parseTypeScriptErrors(stdout + stderr);
        resolve(errors);
      });
    });
  }

  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (match) {
        errors.push({
          file: path.resolve(__dirname, '..', match[1]),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5],
        });
      }
    }

    return errors;
  }

  groupErrorsByFile(errors) {
    const errorsByFile = new Map();

    for (const error of errors) {
      if (this.shouldSkipFile(error.file)) continue;

      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    }

    return errorsByFile;
  }

  shouldSkipFile(filePath) {
    const skipPatterns = ['node_modules/', '.d.ts', '/dist/', '/build/'];
    return skipPatterns.some((pattern) => filePath.includes(pattern));
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

async function main() {
  const tester = new BatchProcessingTest();
  await tester.testBatchProcessing();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
