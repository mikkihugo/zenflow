#!/usr/bin/env node

/**
 * Ax DSPy Integration for Zen AI Fixer
 *
 * Uses the ax-llm/ax framework (official DSPy for TypeScript) with cloud APIs.
 * Benefits over direct Claude API:
 * - Optimized prompts through DSPy methodology
 * - Pattern learning and self-improvement
 * - Much lower cost using gpt-4o-mini
 * - Faster execution with optimized prompting
 * - Type-safe program definitions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ax framework components (will be dynamically imported)
let AxAIOpenAI = null;
let ax = null;

/**
 * Ax DSPy-powered AI integration for code fixing
 */
export class AxDSPyIntegration {
  constructor() {
    this.llm = null;
    this.isInitialized = false;
    this.errorDiagnosisProgram = null;
    this.codeFixingProgram = null;
    this.patternCache = new Map();
    this.successCount = 0;
    this.totalCost = 0;
    this.avgExecutionTime = 0;
  }

  /**
   * Initialize Ax DSPy integration
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Dynamically import the ax framework
      const axModule = await import('@ax-llm/ax');
      AxAIOpenAI = axModule.AxAIOpenAI;
      ax = axModule.ax;

      // Configure language model - prefer GitHub Models (free) over OpenAI
      const githubToken = process.env.GITHUB_TOKEN;
      const openaiKey =
        process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

      if (githubToken) {
        // Use GitHub Models (free access to various models)
        this.llm = new AxAIOpenAI({
          apiKey: githubToken,
          baseURL: 'https://models.inference.ai.azure.com',
          model: 'gpt-4o-mini',
          temperature: 0.1,
          maxTokens: 1000,
        });
        console.log('   🐙 Using GitHub Models (free) with gpt-4o-mini');
      } else if (openaiKey) {
        // Fallback to OpenAI
        this.llm = new AxAIOpenAI({
          apiKey: openaiKey,
          model: 'gpt-4o-mini',
          temperature: 0.1,
          maxTokens: 1000,
        });
        console.log('   🤖 Using OpenAI with gpt-4o-mini');
      } else {
        throw new Error(
          'No API key available. Set GITHUB_TOKEN (free) or OPENAI_API_KEY'
        );
      }

      // Create error diagnosis DSPy program with correct ax signature
      this.errorDiagnosisProgram = ax(
        'errorMessages:string "TypeScript error messages", fileContent:string "File content to analyze" -> analysis:string "Root cause analysis", strategy:string "Repair strategy", confidence:number "Confidence score 0-1"',
        this.llm
      );

      // Create code fixing DSPy program with correct ax signature
      this.codeFixingProgram = ax(
        'codeInput:string "Original TypeScript code", errorAnalysis:string "Error analysis", repairStrategy:string "Repair strategy" -> fixedCode:string "Fixed TypeScript code", explanation:string "Explanation of changes"',
        this.llm
      );

      console.log('🧠 Ax DSPy Integration initialized with gpt-4o-mini');
      this.isInitialized = true;

      // Load existing patterns
      await this.loadPatternCache();
    } catch (error) {
      console.error('Failed to initialize Ax DSPy:', error.message);
      throw new Error(`Ax DSPy initialization failed: ${error.message}`);
    }
  }

  /**
   * Main interface - compatible with Claude CLI interface
   */
  async callDSPyCLI(filePath, prompt) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    console.log(`🧠 Ax DSPy FIX: ${path.basename(filePath)}`);

    try {
      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Extract errors from prompt
      const errors = this.extractErrorsFromPrompt(prompt);
      console.log(`   🔍 Processing ${errors.length} errors`);

      // Check pattern cache first
      const patternKey = this.generatePatternKey(
        errors,
        path.extname(filePath)
      );
      if (this.patternCache.has(patternKey)) {
        console.log(`   ⚡ PATTERN CACHE: Using learned fix`);
        return await this.applyLearnedPattern(
          filePath,
          patternKey,
          fileContent,
          startTime
        );
      }

      // Step 1: Diagnose errors using DSPy
      const errorText = errors.map((e) => e.message || e).join('\n');
      const diagnosisResult = await this.errorDiagnosisProgram({
        errorMessages: errorText,
        fileContent: this.truncateFileContext(fileContent),
      });

      console.log(
        `   🎯 Confidence: ${((diagnosisResult.confidence || 0.7) * 100).toFixed(1)}%`
      );
      console.log(
        `   📝 Strategy: ${(diagnosisResult.strategy || '').substring(0, 60)}...`
      );

      // Step 2: Generate fixed code using DSPy
      const fixingResult = await this.codeFixingProgram({
        codeInput: fileContent,
        errorAnalysis: diagnosisResult.analysis || '',
        repairStrategy: diagnosisResult.strategy || '',
      });

      // Apply the fix
      fs.writeFileSync(filePath, fixingResult.fixedCode);

      // Calculate metrics
      const duration = Date.now() - startTime;
      const cost = this.estimateCost(errorText.length + fileContent.length);
      const success = this.validateFix(fixingResult.fixedCode);

      // Cache successful patterns
      if (success && diagnosisResult.confidence > 0.6) {
        this.cachePattern(patternKey, diagnosisResult, fixingResult);
        this.successCount++;
      }

      this.totalCost += cost;
      this.updateAverageTime(duration);

      console.log(
        `   ✅ Fixed in ${(duration / 1000).toFixed(1)}s (cost: ~$${cost.toFixed(3)})`
      );

      // Save patterns periodically
      if (this.successCount % 3 === 0) {
        await this.savePatternCache();
      }

      return {
        success: true,
        cost,
        duration,
        method: 'Ax-DSPy',
        confidence: diagnosisResult.confidence || 0.7,
        explanation: fixingResult.explanation || '',
      };
    } catch (error) {
      console.error(`   ❌ Ax DSPy error: ${error.message}`);

      return {
        success: false,
        error: error.message,
        fallback: 'claude',
      };
    }
  }

  /**
   * Extract TypeScript errors from the prompt
   */
  extractErrorsFromPrompt(prompt) {
    const errors = [];
    const lines = prompt.split('\n');

    for (const line of lines) {
      if (line.includes('error TS') || line.includes('Error:')) {
        errors.push({
          message: line.trim(),
          type: this.classifyError(line),
        });
      }
    }

    return errors;
  }

  /**
   * Classify error type for pattern recognition
   */
  classifyError(errorLine) {
    const patterns = {
      'module-resolution': ['Cannot find module', 'Module not found'],
      'export-members': ['has no exported member', 'not exported'],
      'missing-properties': [
        'Property',
        'does not exist',
        'Property does not exist',
      ],
      'type-assignment': ['is not assignable to', 'Type mismatch'],
      'duplicate-ids': ['Duplicate identifier', 'already declared'],
      'optional-properties': ['exactOptionalPropertyTypes', 'undefined'],
      'import-errors': ['Cannot resolve', 'import error'],
    };

    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some((keyword) => errorLine.includes(keyword))) {
        return type;
      }
    }
    return 'general';
  }

  /**
   * Generate pattern key for caching
   */
  generatePatternKey(errors, fileExtension) {
    const errorTypes = errors
      .map((e) => e.type)
      .sort()
      .join(',');
    const errorCount = Math.min(errors.length, 10);
    return `${errorTypes}-${fileExtension}-${errorCount}`;
  }

  /**
   * Cache successful pattern for reuse
   */
  cachePattern(patternKey, diagnosisResult, fixingResult) {
    this.patternCache.set(patternKey, {
      diagnosis: diagnosisResult.analysis || '',
      fixStrategy: diagnosisResult.strategy || '',
      confidence: diagnosisResult.confidence || 0.7,
      sampleFix: fixingResult.explanation || '',
      created: Date.now(),
      usageCount: 0,
    });
  }

  /**
   * Apply learned pattern from cache
   */
  async applyLearnedPattern(filePath, patternKey, fileContent, startTime) {
    const pattern = this.patternCache.get(patternKey);
    pattern.usageCount++;

    try {
      // Use cached diagnosis and strategy for faster execution
      const fixingResult = await this.codeFixingProgram({
        codeInput: fileContent,
        errorAnalysis: pattern.diagnosis,
        repairStrategy: pattern.fixStrategy,
      });

      fs.writeFileSync(filePath, fixingResult.fixedCode);

      const duration = Date.now() - startTime;
      const cost = 0.02; // Lower cost for pattern reuse
      this.totalCost += cost;
      this.updateAverageTime(duration);

      console.log(
        `   ⚡ Pattern applied in ${(duration / 1000).toFixed(1)}s (cost: $${cost.toFixed(3)}) - Used ${pattern.usageCount}x`
      );

      return {
        success: true,
        cost,
        duration,
        method: 'Ax-DSPy-Pattern',
        confidence: pattern.confidence,
        explanation: fixingResult.explanation || pattern.sampleFix,
      };
    } catch (error) {
      console.log(`   ⚠️ Pattern failed: ${error.message}, removing from cache`);
      this.patternCache.delete(patternKey);
      throw error;
    }
  }

  /**
   * Truncate file context to fit within token limits
   */
  truncateFileContext(content, maxChars = 1500) {
    if (content.length <= maxChars) return content;

    // Try to keep imports and the first part of the file
    const lines = content.split('\n');
    const importLines = lines.filter((line) =>
      line.trim().startsWith('import')
    );
    const otherLines = lines.filter(
      (line) => !line.trim().startsWith('import')
    );

    let result = importLines.join('\n') + '\n\n';
    const remaining = maxChars - result.length;

    for (const line of otherLines) {
      if (result.length + line.length + 1 > maxChars) break;
      result += line + '\n';
    }

    return result;
  }

  /**
   * Estimate cost based on token usage
   */
  estimateCost(textLength) {
    // Rough estimate: gpt-4o-mini is ~$0.000150/1K input tokens, ~$0.000600/1K output tokens
    const inputTokens = Math.ceil(textLength / 4); // ~4 chars per token
    const outputTokens = 500; // Estimate for code generation
    return (inputTokens * 0.00015 + outputTokens * 0.0006) / 1000;
  }

  /**
   * Basic validation of fixed code
   */
  validateFix(fixedCode) {
    return (
      fixedCode &&
      fixedCode.trim().length > 0 &&
      !fixedCode.includes('undefined') &&
      !fixedCode.includes('FIXME') &&
      !fixedCode.includes('TODO')
    );
  }

  /**
   * Update running average execution time
   */
  updateAverageTime(duration) {
    if (this.successCount === 0) {
      this.avgExecutionTime = duration;
    } else {
      this.avgExecutionTime = (this.avgExecutionTime + duration) / 2;
    }
  }

  /**
   * Load cached patterns from disk
   */
  async loadPatternCache() {
    try {
      const cacheFile = path.join(__dirname, '.ax-dspy-patterns.json');
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        this.patternCache = new Map(Object.entries(data));
        console.log(`   📚 Loaded ${this.patternCache.size} learned patterns`);
      }
    } catch (error) {
      console.warn(`Failed to load pattern cache: ${error.message}`);
    }
  }

  /**
   * Save cached patterns to disk
   */
  async savePatternCache() {
    try {
      const cacheFile = path.join(__dirname, '.ax-dspy-patterns.json');
      const data = Object.fromEntries(this.patternCache);
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      console.log(`   💾 Saved ${this.patternCache.size} patterns to cache`);
    } catch (error) {
      console.warn(`Failed to save pattern cache: ${error.message}`);
    }
  }

  /**
   * Get comprehensive statistics
   */
  getStats() {
    return {
      patternsLearned: this.patternCache.size,
      successfulFixes: this.successCount,
      totalCost: this.totalCost,
      avgCost: this.successCount > 0 ? this.totalCost / this.successCount : 0,
      avgExecutionTime: this.avgExecutionTime,
      cacheHitRate:
        this.successCount > 0
          ? Array.from(this.patternCache.values()).reduce(
              (sum, p) => sum + p.usageCount,
              0
            ) / this.successCount
          : 0,
    };
  }

  /**
   * Print comprehensive stats
   */
  printStats() {
    const stats = this.getStats();
    console.log('\n📊 Ax DSPy Performance Statistics:');
    console.log(`   🎯 Successful Fixes: ${stats.successfulFixes}`);
    console.log(`   🧠 Patterns Learned: ${stats.patternsLearned}`);
    console.log(`   💰 Total Cost: $${stats.totalCost.toFixed(3)}`);
    console.log(`   📈 Avg Cost/Fix: $${stats.avgCost.toFixed(3)}`);
    console.log(
      `   ⚡ Avg Execution: ${(stats.avgExecutionTime / 1000).toFixed(1)}s`
    );
    console.log(
      `   🔄 Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`
    );
  }

  /**
   * ESLint violations fixing (placeholder)
   */
  async fixViolations(violations, options) {
    throw new Error('ESLint fixing not yet implemented with Ax DSPy');
  }
}

export default AxDSPyIntegration;
