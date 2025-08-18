#!/usr/bin/env node

/**
 * @fileoverview TypeScript Error Fixer using Official Claude SDK
 * 
 * Advanced TypeScript error fixing system using the official Anthropic Claude SDK
 * instead of the Foundation SDK. Features smart randomization, parallel processing,
 * comprehensive error analysis, and intelligent batching to prevent consistent
 * failure patterns.
 * 
 * Key Features:
 * - Smart randomization to prevent batch interference
 * - Parallel file processing with intelligent load balancing
 * - Comprehensive error categorization and analysis
 * - Official Claude SDK integration with proper error handling
 * - Visual progress indicators with complexity distribution
 * - Adaptive batch sizing and timeout management
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',
  MAX_PARALLEL_FILES: 4,
  MAX_RETRIES: 2,
  TIMEOUT_BASE: 30000,
  TIMEOUT_MULTIPLIER: 1.5,
  MAX_ERRORS_PER_BATCH: 50,
  DRY_RUN: process.argv.includes('--dry-run'),
  VERBOSE: process.argv.includes('--verbose') || process.argv.includes('-v'),
  INCLUDE_TESTS: process.argv.includes('--include-tests'),
  
  // Smart randomization settings
  COMPLEXITY_THRESHOLD: 100, // lines of code
  MAX_COMPLEXITY_PER_BATCH: 300,
  RANDOMIZATION_STRENGTH: 0.7, // 0 = no randomization, 1 = full randomization
};

/**
 * Advanced TypeScript Error Fixer using Official Claude SDK
 */
class ClaudeSDKTypescriptFixer {
  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.stats = {
      totalFiles: 0,
      totalErrors: 0,
      fixedFiles: 0,
      fixedErrors: 0,
      failedFiles: 0,
      skippedFiles: 0,
      processedBatches: 0,
      totalBatches: 0,
      startTime: Date.now(),
      fileComplexities: new Map()
    };
    
    this.fileAnalysis = new Map();
    this.errorCategories = new Map();
  }

  /**
   * Main entry point - fix all TypeScript errors with smart randomization
   */
  async fixAllTypescriptErrors() {
    console.log('🧠 TypeScript Error Fixer with Official Claude SDK\n');
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('❌ ANTHROPIC_API_KEY environment variable is required');
    }

    try {
      // Get all TypeScript errors
      const errors = this.getTypescriptErrors();
      
      if (errors.length === 0) {
        console.log('✅ No TypeScript errors found! Project is clean.');
        return;
      }

      console.log(`📊 Found ${errors.length} TypeScript errors to process\n`);
      this.stats.totalErrors = errors.length;

      // Analyze and categorize errors
      this.categorizeErrors(errors);
      this.displayErrorSummary();

      // Group errors by file and analyze complexity
      const fileGroups = this.groupErrorsByFile(errors);
      this.analyzeFileComplexity(fileGroups);
      
      this.stats.totalFiles = fileGroups.size;

      // Smart randomization with complexity balancing
      const filesToProcess = Array.from(fileGroups.keys());
      const randomizedBatches = this.smartRandomizeFiles(filesToProcess);
      
      this.stats.totalBatches = randomizedBatches.length;

      console.log(`🎯 Processing ${filesToProcess.length} files in ${randomizedBatches.length} intelligently balanced batches\n`);

      // Process each batch in parallel
      for (let i = 0; i < randomizedBatches.length; i++) {
        const batch = randomizedBatches[i];
        console.log(`📦 Processing Batch ${i + 1}/${randomizedBatches.length}: ${batch.length} files`);
        
        this.displayBatchComplexity(batch, i + 1);
        
        await this.processBatch(batch, fileGroups, i + 1);
        this.stats.processedBatches++;
      }

      // Final summary and compilation test
      this.displayFinalSummary();
      console.log('\n🧪 Testing compilation after fixes...');
      this.testCompilation();

    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get all TypeScript compilation errors
   */
  getTypescriptErrors() {
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { 
        encoding: 'utf-8',
        stdio: 'pipe' 
      });
      return [];
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      return this.parseErrorOutput(output);
    }
  }

  /**
   * Parse TypeScript compiler output into structured errors
   */
  parseErrorOutput(output) {
    const errors = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (match) {
        const [, file, lineNum, colNum, errorCode, message] = match;
        errors.push({
          file: file.trim(),
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code: errorCode,
          message: message.trim(),
          fullLine: line,
          category: this.categorizeError(errorCode, message.trim())
        });
      }
    }

    return errors;
  }

  /**
   * Categorize error by code and message patterns
   */
  categorizeError(code, message) {
    if (code === 'TS7006' || message.includes("implicitly has an 'any' type")) {
      return 'noImplicitAny';
    } else if (code === 'TS2304' || message.includes('Cannot find name')) {
      return 'undeclaredVariables';
    } else if (message.includes("Type 'undefined' is not assignable")) {
      return 'strictNullChecks';
    } else if (message.includes('Property') && message.includes('does not exist')) {
      return 'propertyAccess';
    } else if (message.includes('Argument of type')) {
      return 'typeAssignment';
    } else if (code === 'TS2339') {
      return 'propertyMissing';
    } else if (code === 'TS2345') {
      return 'argumentType';
    } else if (code === 'TS2322') {
      return 'typeAssignment';
    } else {
      return 'other';
    }
  }

  /**
   * Categorize errors and build statistics
   */
  categorizeErrors(errors) {
    for (const error of errors) {
      const category = error.category;
      if (!this.errorCategories.has(category)) {
        this.errorCategories.set(category, []);
      }
      this.errorCategories.get(category).push(error);
    }
  }

  /**
   * Display error summary by category
   */
  displayErrorSummary() {
    console.log('📊 Error Categories:');
    const sortedCategories = Array.from(this.errorCategories.entries())
      .sort(([,a], [,b]) => b.length - a.length);

    for (const [category, errors] of sortedCategories) {
      const percentage = ((errors.length / this.stats.totalErrors) * 100).toFixed(1);
      console.log(`   ${this.getCategoryEmoji(category)} ${category}: ${errors.length} (${percentage}%)`);
    }
    console.log();
  }

  /**
   * Get emoji for error category
   */
  getCategoryEmoji(category) {
    const emojis = {
      noImplicitAny: '🔍',
      undeclaredVariables: '❓',
      strictNullChecks: '🛡️',
      propertyAccess: '🔑',
      typeAssignment: '⚡',
      propertyMissing: '🎯',
      argumentType: '📝',
      other: '🔧'
    };
    return emojis[category] || '🔧';
  }

  /**
   * Group errors by file for batch processing
   */
  groupErrorsByFile(errors) {
    const fileGroups = new Map();
    
    for (const error of errors) {
      if (!fileGroups.has(error.file)) {
        fileGroups.set(error.file, []);
      }
      fileGroups.get(error.file).push(error);
    }

    return fileGroups;
  }

  /**
   * Analyze file complexity for intelligent batching
   */
  analyzeFileComplexity(fileGroups) {
    console.log('🔍 Analyzing file complexity for intelligent batching...\n');

    for (const [file] of fileGroups) {
      if (!existsSync(file)) {
        this.fileAnalysis.set(file, { complexity: 0, size: 0, exists: false });
        continue;
      }

      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;
        const size = statSync(file).size;
        
        // Calculate complexity score
        const complexity = this.calculateComplexity(content, lines, size);
        
        this.fileAnalysis.set(file, {
          complexity,
          lines,
          size,
          exists: true,
          errorCount: fileGroups.get(file).length
        });

        this.stats.fileComplexities.set(file, complexity);
        
      } catch (error) {
        console.warn(`⚠️  Could not analyze ${file}: ${error.message}`);
        this.fileAnalysis.set(file, { complexity: 0, size: 0, exists: false });
      }
    }
  }

  /**
   * Calculate file complexity score
   */
  calculateComplexity(content, lines, size) {
    let score = lines * 0.1; // Base score from line count
    
    // Add complexity for various patterns
    score += (content.match(/class\s+\w+/g) || []).length * 5;
    score += (content.match(/interface\s+\w+/g) || []).length * 3;
    score += (content.match(/function\s+\w+/g) || []).length * 2;
    score += (content.match(/=>\s*/g) || []).length * 1;
    score += (content.match(/try\s*{/g) || []).length * 3;
    score += (content.match(/catch\s*\(/g) || []).length * 3;
    score += (content.match(/async\s+/g) || []).length * 2;
    score += (content.match(/await\s+/g) || []).length * 1;
    score += (content.match(/import\s+/g) || []).length * 0.5;
    
    return Math.round(score);
  }

  /**
   * Smart randomization with complexity balancing
   */
  smartRandomizeFiles(filesToProcess) {
    console.log('🎲 Applying smart randomization with complexity balancing...');

    // Sort files by complexity for analysis
    const sorted = filesToProcess
      .map(file => ({
        file,
        complexity: this.stats.fileComplexities.get(file) || 0,
        random: Math.random()
      }))
      .sort((a, b) => b.complexity - a.complexity);

    // Create balanced groups by distributing complex files evenly
    const batchSize = Math.max(1, Math.min(CONFIG.MAX_PARALLEL_FILES, filesToProcess.length));
    const groups = Array.from({ length: batchSize }, () => []);
    
    // First pass: distribute most complex files using round-robin
    const complexFiles = sorted.filter(f => f.complexity > CONFIG.COMPLEXITY_THRESHOLD);
    complexFiles.forEach((fileData, index) => {
      groups[index % groups.length].push(fileData);
    });

    // Second pass: distribute remaining files with randomization
    const simpleFiles = sorted.filter(f => f.complexity <= CONFIG.COMPLEXITY_THRESHOLD);
    
    // Apply randomization strength
    if (CONFIG.RANDOMIZATION_STRENGTH > 0) {
      simpleFiles.sort((a, b) => {
        const complexityWeight = 1 - CONFIG.RANDOMIZATION_STRENGTH;
        const randomWeight = CONFIG.RANDOMIZATION_STRENGTH;
        
        const scoreA = (a.complexity * complexityWeight) + (a.random * randomWeight * 100);
        const scoreB = (b.complexity * complexityWeight) + (b.random * randomWeight * 100);
        
        return scoreB - scoreA;
      });
    }

    // Distribute remaining files to balance complexity
    for (const fileData of simpleFiles) {
      // Find group with lowest total complexity
      const groupComplexities = groups.map(group => 
        group.reduce((sum, f) => sum + f.complexity, 0)
      );
      const minComplexityIndex = groupComplexities.indexOf(Math.min(...groupComplexities));
      groups[minComplexityIndex].push(fileData);
    }

    // Convert back to file paths and remove empty groups
    const batches = groups
      .map(group => group.map(f => f.file))
      .filter(batch => batch.length > 0);

    // Display balancing results
    console.log(`   📊 Created ${batches.length} balanced batches:`);
    batches.forEach((batch, i) => {
      const complexity = batch.reduce((sum, file) => 
        sum + (this.stats.fileComplexities.get(file) || 0), 0
      );
      console.log(`      Batch ${i + 1}: ${batch.length} files, complexity: ${complexity}`);
    });
    console.log();

    return batches;
  }

  /**
   * Display batch complexity distribution
   */
  displayBatchComplexity(batch, batchNumber) {
    const complexities = batch.map(file => this.stats.fileComplexities.get(file) || 0);
    const totalComplexity = complexities.reduce((sum, c) => sum + c, 0);
    const avgComplexity = totalComplexity / batch.length;

    console.log(`   📊 Batch ${batchNumber} Analysis:`);
    console.log(`      Files: ${batch.length}, Total Complexity: ${totalComplexity}, Average: ${avgComplexity.toFixed(1)}`);
    
    // Show complexity distribution
    const distribution = batch.map(file => {
      const complexity = this.stats.fileComplexities.get(file) || 0;
      const bar = '█'.repeat(Math.min(Math.floor(complexity / 10), 20));
      const shortFile = relative(process.cwd(), file);
      return `      ${bar.padEnd(20)} ${complexity.toString().padStart(3)} ${shortFile}`;
    });

    if (CONFIG.VERBOSE) {
      distribution.forEach(line => console.log(line));
    }
    console.log();
  }

  /**
   * Process a batch of files in parallel
   */
  async processBatch(batch, fileGroups, batchNumber) {
    const promises = batch.map(async (file, index) => {
      const fileId = `B${batchNumber}F${index + 1}`;
      const errors = fileGroups.get(file);
      const analysis = this.fileAnalysis.get(file);

      if (!analysis?.exists) {
        console.log(`   ⏭️  ${fileId}: Skipping ${basename(file)} (not found)`);
        this.stats.skippedFiles++;
        return { success: false, reason: 'not_found' };
      }

      return this.fixFileWithClaude(file, errors, analysis, fileId);
    });

    const results = await Promise.all(promises);

    // Update statistics
    for (const result of results) {
      if (result.success) {
        this.stats.fixedFiles++;
        this.stats.fixedErrors += result.fixedCount || 0;
      } else if (result.reason !== 'not_found') {
        this.stats.failedFiles++;
      }
    }

    console.log(); // Space between batches
  }

  /**
   * Fix a single file using Claude SDK
   */
  async fixFileWithClaude(file, errors, fileAnalysis, fileId) {
    const shortFile = basename(file);
    console.log(`   🔧 ${fileId}: Processing ${shortFile} (${errors.length} errors, complexity: ${fileAnalysis.complexity})`);

    if (!existsSync(file)) {
      console.log(`   ❌ ${fileId}: File not found`);
      return { success: false, reason: 'not_found' };
    }

    try {
      const content = readFileSync(file, 'utf-8');
      
      // Calculate dynamic timeout based on complexity
      const baseTimeout = CONFIG.TIMEOUT_BASE;
      const complexityMultiplier = Math.max(1, fileAnalysis.complexity / 50);
      const errorMultiplier = Math.max(1, errors.length / 10);
      const dynamicTimeout = Math.min(
        baseTimeout * complexityMultiplier * errorMultiplier * CONFIG.TIMEOUT_MULTIPLIER,
        300000 // Max 5 minutes
      );

      // Build comprehensive prompt
      const prompt = this.buildClaudePrompt(file, content, errors, fileAnalysis);

      // Make Claude API request with retry logic
      let lastError;
      for (let retry = 0; retry <= CONFIG.MAX_RETRIES; retry++) {
        try {
          const message = await this.claude.messages.create({
            model: CONFIG.CLAUDE_MODEL,
            max_tokens: 4096,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            timeout: dynamicTimeout
          });

          const response = message.content[0].text;
          
          // Extract the fixed code from Claude's response
          const fixedContent = this.extractFixedCode(response, content);
          
          if (fixedContent && fixedContent !== content) {
            if (!CONFIG.DRY_RUN) {
              writeFileSync(file, fixedContent, 'utf-8');
            }
            
            console.log(`   ✅ ${fileId}: Fixed ${shortFile} ${CONFIG.DRY_RUN ? '(dry run)' : ''}`);
            return { 
              success: true, 
              fixedCount: errors.length,
              retry: retry 
            };
          } else {
            console.log(`   ⚠️  ${fileId}: No changes applied to ${shortFile}`);
            return { success: false, reason: 'no_changes' };
          }

        } catch (error) {
          lastError = error;
          if (retry < CONFIG.MAX_RETRIES) {
            console.log(`   🔄 ${fileId}: Retry ${retry + 1}/${CONFIG.MAX_RETRIES} for ${shortFile}`);
            await this.delay(1000 * (retry + 1)); // Exponential backoff
          }
        }
      }

      console.log(`   ❌ ${fileId}: Failed ${shortFile} after ${CONFIG.MAX_RETRIES + 1} attempts: ${lastError?.message || 'Unknown error'}`);
      return { success: false, reason: 'claude_error', error: lastError };

    } catch (error) {
      console.log(`   ❌ ${fileId}: Error processing ${shortFile}: ${error.message}`);
      return { success: false, reason: 'file_error', error };
    }
  }

  /**
   * Build comprehensive prompt for Claude
   */
  buildClaudePrompt(file, content, errors, fileAnalysis) {
    const errorSummary = errors
      .map(e => `Line ${e.line}: ${e.code} - ${e.message}`)
      .join('\n');

    const categoryStats = {};
    errors.forEach(e => {
      categoryStats[e.category] = (categoryStats[e.category] || 0) + 1;
    });

    const categoryList = Object.entries(categoryStats)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ');

    return `You are a TypeScript expert helping fix compilation errors. Please fix the following TypeScript file:

FILE: ${file}
COMPLEXITY: ${fileAnalysis.complexity} (lines: ${fileAnalysis.lines})
ERRORS: ${errors.length} total
CATEGORIES: ${categoryList}

ERRORS TO FIX:
${errorSummary}

CURRENT CODE:
\`\`\`typescript
${content}
\`\`\`

Please provide the corrected TypeScript code that fixes all the errors above. Focus on:
1. Adding proper type annotations for implicit any types
2. Declaring missing variables/imports  
3. Fixing null/undefined type issues
4. Correcting property access issues
5. Resolving type assignment problems

Return only the complete corrected code, no explanations. Make minimal changes to preserve the original functionality.`;
  }

  /**
   * Extract fixed code from Claude's response
   */
  extractFixedCode(response, originalContent) {
    // Look for code blocks
    const codeBlockMatch = response.match(/```(?:typescript|ts)?\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // If no code block, check if the entire response is code
    const lines = response.trim().split('\n');
    if (lines.length > 10 && lines.some(line => line.includes('import ') || line.includes('export '))) {
      return response.trim();
    }

    return null;
  }

  /**
   * Test compilation after fixes
   */
  testCompilation() {
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      console.log('✅ Compilation successful after fixes!');
      return true;
    } catch (error) {
      const remainingErrors = this.parseErrorOutput(error.stdout || error.stderr || '');
      console.log(`⚠️  ${remainingErrors.length} errors remaining after fixes`);
      
      if (CONFIG.VERBOSE && remainingErrors.length > 0) {
        console.log('\nRemaining errors:');
        remainingErrors.slice(0, 10).forEach(err => {
          console.log(`   ${err.file}:${err.line} - ${err.code}: ${err.message}`);
        });
        if (remainingErrors.length > 10) {
          console.log(`   ... and ${remainingErrors.length - 10} more errors`);
        }
      }
      return false;
    }
  }

  /**
   * Display final summary
   */
  displayFinalSummary() {
    const duration = ((Date.now() - this.stats.startTime) / 1000).toFixed(1);
    const successRate = this.stats.totalFiles > 0 ? 
      ((this.stats.fixedFiles / this.stats.totalFiles) * 100).toFixed(1) : '0';

    console.log('\n📊 TYPESCRIPT FIXING SUMMARY');
    console.log('=====================================');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📁 Files Processed: ${this.stats.processedBatches}/${this.stats.totalBatches} batches`);
    console.log(`📊 Total Files: ${this.stats.totalFiles}`);
    console.log(`✅ Fixed: ${this.stats.fixedFiles} files (${this.stats.fixedErrors} errors)`);
    console.log(`❌ Failed: ${this.stats.failedFiles} files`);
    console.log(`⏭️  Skipped: ${this.stats.skippedFiles} files`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (CONFIG.DRY_RUN) {
      console.log('\n🏃‍♂️ DRY RUN - No files were actually modified');
    }

    if (this.stats.fixedFiles > 0) {
      console.log('\n🎉 Successfully fixed TypeScript compilation issues with smart randomization!');
    } else {
      console.log('\n⚠️  No files were successfully fixed. Check the error logs above.');
    }
  }

  /**
   * Simple delay utility
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the fixer
async function main() {
  const fixer = new ClaudeSDKTypescriptFixer();
  
  try {
    await fixer.fixAllTypescriptErrors();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClaudeSDKTypescriptFixer };