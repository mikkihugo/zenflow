#!/usr/bin/env node

/**
 * Test script to demonstrate batching optimization for single-error files
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class BatchingTester {
  async testBatchingOpportunity() {
    // console.log('🧪 Analyzing current TypeScript errors for batching opportunities...\n');

    const errors = await this.runTypeScriptCompiler();
    // console.log(`📊 Total errors found: ${errors.length}\n`);

    // Group errors by file
    const errorsByFile = this.groupErrorsByFile(errors);

    // Analyze single-error files
    const singleErrorFiles = Array.from(errorsByFile.entries()).filter(
      ([filePath, fileErrors]) => fileErrors.length === 1
    );

    const multiErrorFiles = Array.from(errorsByFile.entries()).filter(
      ([filePath, fileErrors]) => fileErrors.length > 1
    );

    // console.log(`📦 BATCHING ANALYSIS:`);
    // console.log(`   📁 Total files with errors: ${errorsByFile.size}`);
    // console.log(`   📦 Single-error files: ${singleErrorFiles.length} (BATCHABLE)`);
    // console.log(`   📋 Multi-error files: ${multiErrorFiles.length} (individual processing)`);

    if (singleErrorFiles.length === 0) {
      // console.log('\n✅ No single-error files to batch at this time.');
      return;
    }

    // Group single-error files by error type
    const errorTypeGroups = new Map();

    for (const [filePath, fileErrors] of singleErrorFiles) {
      const error = fileErrors[0];
      const errorType = this.categorizeErrorType(error);

      if (!errorTypeGroups.has(errorType)) {
        errorTypeGroups.set(errorType, []);
      }

      errorTypeGroups.get(errorType).push({ filePath, error });
    }

    // console.log(`\n🎯 BATCH GROUPS (by error type):`);
    let totalBatches = 0;
    const batchSize = 15;

    for (const [errorType, files] of errorTypeGroups.entries()) {
      const batches = Math.ceil(files.length / batchSize);
      totalBatches += batches;

      // console.log(`   ${errorType}: ${files.length} files → ${batches} batches`);

      // Show sample files for this error type
      const sampleFiles = files.slice(0, 5).map((f) => path.basename(f.filePath));
      // console.log(`      Samples: ${sampleFiles.join(', ')}${files.length > 5 ? ', ...' : ''}`);
    }

    const currentApproach = singleErrorFiles.length; // 1 AI call per file
    const batchedApproach = totalBatches; // 1 AI call per batch
    const speedup = Math.round(currentApproach / batchedApproach);

    // console.log(`\n⚡ OPTIMIZATION POTENTIAL:`);
    // console.log(`   Current approach: ${currentApproach} AI calls (1 per file)`);
    // console.log(`   Batched approach: ${batchedApproach} AI calls (1 per batch)`);
    // console.log(`   🚀 Estimated speedup: ${speedup}x faster for single-error files`);

    const timeSavings = (currentApproach - batchedApproach) * 2; // Assume 2 min per AI call
    // console.log(`   ⏰ Estimated time savings: ~${timeSavings} minutes`);

    // console.log(`\n💡 RECOMMENDATION:`);
    if (speedup >= 10) {
      // console.log(`   🔥 MASSIVE speedup potential! Batching highly recommended.`);
    } else if (speedup >= 5) {
      // console.log(`   🚀 Significant speedup available. Batching recommended.`);
    } else if (speedup >= 2) {
      // console.log(`   ⚡ Moderate speedup available. Batching beneficial.`);
    } else {
      // console.log(`   📋 Limited batching benefit at current error distribution.`);
    }
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
          env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' },
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
}

async function main() {
  const tester = new BatchingTester();
  await tester.testBatchingOpportunity();
}

main().catch(console.error);
