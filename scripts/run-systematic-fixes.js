#!/usr/bin/env node

/**
 * Run All Systematic Fixes Script
 * Executes all automated fix scripts to resolve bulk TypeScript/ESLint issues
 * This should significantly reduce the error count before individual AI fixes
 */

import { spawn } from 'child_process';
import path from 'path';

class SystematicFixRunner {
  constructor() {
    this.scriptsDir = path.resolve(process.cwd(), 'scripts');
    this.results = [];
  }

  async runAllFixes() {
    console.log('🚀 Running All Systematic Fix Scripts...');
    console.log('=====================================');

    // Define fix scripts in order of execution
    const fixScripts = [
      {
        name: 'Missing Types Generator',
        script: 'fix-missing-types.js',
        description: 'Auto-generates missing type definitions (WorkflowContext, NeuralError, etc.)',
      },
      {
        name: 'Import Path Fixer',
        script: 'fix-import-paths.js',
        description: 'Fixes TS2307 "Cannot find module" import errors',
      },
      {
        name: 'Optional Chaining Fixer',
        script: 'fix-optional-chaining.js',
        description: 'Fixes TS2779 optional property access assignment errors',
      },
      {
        name: 'Test Any Types Fixer',
        script: 'fix-test-any-types.js',
        description: 'Replaces test file "any" types with proper interfaces',
      },
      {
        name: 'JSDoc Violations Fixer',
        script: 'fix-jsdoc-violations.js',
        description: 'Adds missing JSDoc file overviews and descriptions',
      },
    ];

    console.log(`\n📋 Planned fixes (${fixScripts.length} scripts):`);
    fixScripts.forEach((fix, i) => {
      console.log(`   ${i + 1}. ${fix.name}`);
      console.log(`      ${fix.description}`);
    });

    console.log(`\n⏱️  Starting systematic fixes...`);

    // Run each fix script
    for (let i = 0; i < fixScripts.length; i++) {
      const fix = fixScripts[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Running ${i + 1}/${fixScripts.length}: ${fix.name}`);
      console.log(`${'='.repeat(60)}`);

      const result = await this.runScript(fix.script);
      this.results.push({
        ...fix,
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration,
      });

      if (result.success) {
        console.log(`✅ ${fix.name} completed successfully`);
      } else {
        console.log(`❌ ${fix.name} failed: ${result.error}`);
        // Continue with other fixes even if one fails
      }
    }

    // Generate final report
    await this.generateReport();
  }

  async runScript(scriptName) {
    const scriptPath = path.join(this.scriptsDir, scriptName);
    const startTime = Date.now();

    return new Promise((resolve) => {
      const childProcess = spawn('node', [scriptPath], {
        stdio: 'pipe',
        cwd: path.resolve(process.cwd()),
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=2048',
        },
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        // Stream output in real-time
        process.stdout.write(output);
      });

      childProcess.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        // Stream errors in real-time
        process.stderr.write(error);
      });

      childProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        resolve({
          success: code === 0,
          output: stdout,
          error: stderr || (code !== 0 ? `Process exited with code ${code}` : null),
          duration,
        });
      });

      childProcess.on('error', (error) => {
        const duration = Date.now() - startTime;
        resolve({
          success: false,
          output: stdout,
          error: error.message,
          duration,
        });
      });
    });
  }

  async generateReport() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 SYSTEMATIC FIXES COMPLETE - FINAL REPORT`);
    console.log(`${'='.repeat(60)}`);

    const successful = this.results.filter((r) => r.success);
    const failed = this.results.filter((r) => !r.success);

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful: ${successful.length}/${this.results.length} scripts`);
    console.log(`   ❌ Failed: ${failed.length}/${this.results.length} scripts`);
    console.log(
      `   ⏱️  Total time: ${this.formatDuration(this.results.reduce((sum, r) => sum + r.duration, 0))}`
    );

    if (successful.length > 0) {
      console.log(`\n✅ Successful fixes:`);
      successful.forEach((result) => {
        console.log(`   • ${result.name} (${this.formatDuration(result.duration)})`);
      });
    }

    if (failed.length > 0) {
      console.log(`\n❌ Failed fixes:`);
      failed.forEach((result) => {
        console.log(`   • ${result.name}: ${result.error}`);
      });
    }

    console.log(`\n🎉 Systematic fixes completed!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Run TypeScript compilation to see error reduction:`);
    console.log(`      npm run build`);
    console.log(`   2. Run ESLint to see violation reduction:`);
    console.log(`      npm run lint`);
    console.log(`   3. Run Phase 1 AI fixer for remaining errors:`);
    console.log(`      node scripts/ai-eslint/zen-ai-fixer-complete.js --phase=compile`);
    console.log(`   4. Run Phase 2 AI fixer for remaining ESLint issues:`);
    console.log(`      node scripts/ai-eslint/zen-ai-fixer-complete.js --phase=eslint`);

    // Check if we should recommend running build/lint
    if (successful.length >= 2) {
      console.log(`\n🔍 Checking build status...`);
      await this.checkBuildStatus();
    }
  }

  async checkBuildStatus() {
    console.log(`Running quick TypeScript check...`);

    const buildResult = await this.runCommand('npm', ['run', 'build']);

    if (buildResult.success) {
      console.log(`🎉 BUILD SUCCESS! All TypeScript errors may be fixed!`);
    } else {
      // Count remaining errors
      const errorMatches = buildResult.output.match(/error TS\d+/g);
      const errorCount = errorMatches ? errorMatches.length : 'unknown';
      console.log(`📊 Build still has ~${errorCount} TypeScript errors`);
      console.log(`   This is likely a significant reduction from the original 3,500+ errors`);
    }
  }

  async runCommand(command, args) {
    return new Promise((resolve) => {
      const childProcess = spawn(command, args, {
        stdio: 'pipe',
        cwd: path.resolve(process.cwd()),
      });

      let output = '';
      let error = '';

      childProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      childProcess.on('close', (code) => {
        resolve({
          success: code === 0,
          output: output + error,
        });
      });
    });
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
}

// Main execution
async function main() {
  try {
    console.log(`🧘 Claude Code Zen - Systematic Fix Runner`);
    console.log(`🎯 Goal: Bulk fix systematic TypeScript/ESLint issues`);
    console.log(`📈 Expected: Reduce 3,500+ TypeScript errors to manageable number\n`);

    const runner = new SystematicFixRunner();
    await runner.runAllFixes();
  } catch (error) {
    console.error('❌ Systematic fix runner failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SystematicFixRunner };
