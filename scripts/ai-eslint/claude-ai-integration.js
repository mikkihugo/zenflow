#!/usr/bin/env node

/**
 * 🤖 Real Claude AI Integration for ESLint Violations
 * Uses actual Claude CLI with stdin piping (not fake --file)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  initializeLogging, 
  createClaudeAILogger, 
  createClaudeCLILogger,
  logClaudeOperation,
  logClaudeMetrics,
  logErrorAnalysis
} from '../../src/utils/logging-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export class ClaudeAIIntegration {
  constructor() {
    this.fixedCount = 0;
    this.failedCount = 0;
    this.skippedCount = 0;
    this.todoCount = 0;
    this.todoItems = [];
    this.logger = null;
    this.claudeLogger = null;
    this.initialized = false;
    
    // 🧠 Pattern Learning System
    this.patternCache = new Map();
    this.successCount = 0;
    this.totalCost = 0;
    this.avgExecutionTime = 0;
    this.patternHits = 0;
    this.patternMisses = 0;
  }

  /**
   * Initialize logging system
   */
  async initializeLogging() {
    if (this.initialized) return;
    
    try {
      await initializeLogging();
      this.logger = createClaudeAILogger();
      this.claudeLogger = createClaudeCLILogger();
      this.initialized = true;
      
      // 🧠 Load pattern cache on initialization
      await this.loadPatternCache();
      
      this.logger.info('Claude AI Integration initialized with structured logging and pattern learning');
      
      if (this.patternCache.size > 0) {
        console.log(`🧠 Pattern Learning: ${this.patternCache.size} cached patterns loaded`);
      }
    } catch (error) {
      console.error('Failed to initialize logging:', error.message);
      // Fallback to console logging
      this.logger = { info: console.log, debug: console.log, warn: console.warn, error: console.error };
      this.claudeLogger = this.logger;
    }
  }

  /**
   * Fix violations using real Claude CLI - grouped by file for efficiency
   */
  async fixViolations(violations, options = {}) {
    await this.initializeLogging();
    
    this.logger.info(`🤖 Starting REAL Claude AI fixing for ${violations.length} violations...`);
    console.log(`🤖 Starting REAL Claude AI fixing for ${violations.length} violations...`);    
    
    // Log operation start with structured data
    if (this.logger && this.initialized) {
      logClaudeOperation(this.logger, 'fix_violations_start', {
        totalViolations: violations.length,
        options
      });
    }
    console.log(`   🔧 Starting violation fixing - ${violations.length} total violations`);
    console.log(`   ⚙️  Options:`, options);

    const { maxFixes = 50, dryRun = false } = options;
    const prioritizedViolations = this.prioritizeViolations(violations).slice(0, maxFixes);

    // Group violations by file for efficient batching
    const violationsByFile = this.groupViolationsByFile(prioritizedViolations);

    console.log(
      `🎯 Processing ${prioritizedViolations.length} violations across ${violationsByFile.size} files...`
    );

    let fileIndex = 0;
    for (const [filePath, fileViolations] of violationsByFile.entries()) {
      fileIndex++;
      const progress = ((fileIndex / violationsByFile.size) * 100).toFixed(1);
      console.log(`\n📝 Fixing file ${fileIndex}/${violationsByFile.size} (${progress}%)`);
      console.log(`   📁 File: ${path.basename(filePath)} (${fileViolations.length} violations)`);

      try {
        // Log detailed error analysis with structured data
        if (this.logger && this.initialized) {
          logErrorAnalysis(this.logger, filePath, fileViolations, this.categorizeViolations(fileViolations));
        }
        console.log(`   📊 Analysis: ${fileViolations.length} violations in ${path.basename(filePath)}`);
        
        const fixed = await this.fixFileViolations(filePath, fileViolations, dryRun);
        if (fixed) {
          this.fixedCount += fileViolations.length;
          console.log(`   ✅ Fixed ${fileViolations.length} violations successfully`);
          this.logger.info(`Fixed ${fileViolations.length} violations in ${path.basename(filePath)}`, {
            filePath,
            violationCount: fileViolations.length,
            violationTypes: fileViolations.map(v => v.rule)
          });
        } else {
          this.skippedCount += fileViolations.length;
          console.log(`   ⏭️  Skipped (no changes needed)`);
          this.logger.debug(`Skipped file - no changes needed`, { filePath });
        }

        // Prevent overwhelming Claude API
        await this.sleep(3000);
      } catch (error) {
        // ✅ ENHANCED: Mark as TODO instead of failing completely
        this.logger.error(`Error fixing file ${filePath}`, {
          filePath,
          error: error.message,
          violationCount: fileViolations.length,
          violationTypes: fileViolations.map(v => v.rule)
        });
        
        const todoMarked = this.markAsTodo(filePath, fileViolations, error.message);
        if (todoMarked) {
          this.todoCount += fileViolations.length;
          console.log(`   📝 TODO: ${error.message}`);
        } else {
          this.failedCount += fileViolations.length;
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
    }

    const results = {
      fixed: this.fixedCount,
      skipped: this.skippedCount,
      failed: this.failedCount,
      todo: this.todoCount
    };

    console.log(`\n🎊 File-based AI Fixing Complete:`);
    console.log(`   ✅ Fixed: ${this.fixedCount} violations`);
    console.log(`   ⏭️  Skipped: ${this.skippedCount} violations`);
    console.log(`   ❌ Failed: ${this.failedCount} violations`);
    console.log(`   📝 TODO: ${this.todoCount} violations`);

    // Log completion results with structured data
    if (this.logger && this.initialized) {
      logClaudeOperation(this.logger, 'fix_violations_complete', results);
    }
    console.log(`   🎊 Completion results:`, results);

    return results;
  }

  /**
   * Group violations by file path for efficient batching
   */
  groupViolationsByFile(violations) {
    const violationsByFile = new Map();

    for (const violation of violations) {
      if (!violationsByFile.has(violation.file)) {
        violationsByFile.set(violation.file, []);
      }
      violationsByFile.get(violation.file).push(violation);
    }

    return violationsByFile;
  }

  /**
   * Fix all violations in a single file with one Claude call
   */
  async fixFileViolations(filePath, violations, dryRun = false) {
    const prompt = this.buildFilePrompt(violations);
    const relativePath = path.relative(REPO_ROOT, filePath);

    console.log(
      `   📝 Fixing ${violations.length} violations: ${violations.map((v) => v.rule).join(', ')}`
    );
    console.log(`   📁 File: ${relativePath}`);

    // Read original content for comparison
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalModTime = fs.statSync(filePath).mtime;

    try {
      if (dryRun) {
        console.log(`   🔍 DRY RUN: Would call Claude CLI to fix ${violations.length} violations`);
        return false;
      }

      // Claude uses tools directly to read, fix all issues, and write the file
      await this.callClaudeCLI(relativePath, prompt);

      // Check if file was actually modified
      const newModTime = fs.statSync(filePath).mtime;
      const fileWasModified = newModTime > originalModTime;

      if (fileWasModified) {
        const updatedContent = fs.readFileSync(filePath, 'utf8');
        if (updatedContent !== originalContent) {
          console.log(`   🔄 Claude fixed the file (${updatedContent.length} chars)`);
          console.log(`   💾 File updated by Claude's tools`);
          return true;
        }
      }

      console.log(`   ⏭️  No changes made by Claude`);
      return false;
    } catch (error) {
      throw new Error(`Claude CLI failed: ${error.message}`);
    }
  }

  /**
   * Fix a single violation using Claude CLI (tool-based approach)
   */
  async fixSingleViolation(violation, dryRun = false) {
    const prompt = this.buildPromptForViolation(violation);

    // Convert absolute path to relative for Claude CLI
    const relativePath = path.relative(REPO_ROOT, violation.file);

    console.log(`   📝 Instruction: "${prompt.split('\n')[0]}..."`);
    console.log(`   📁 File: ${relativePath}`);

    // Read original content for comparison
    const originalContent = fs.readFileSync(violation.file, 'utf8');
    const originalModTime = fs.statSync(violation.file).mtime;

    try {
      if (dryRun) {
        console.log(`   🔍 DRY RUN: Would call Claude CLI to fix file`);
        return false;
      }

      // Claude uses tools directly to read, fix, and write the file
      await this.callClaudeCLI(relativePath, prompt);

      // Check if file was actually modified by reading it and comparing timestamps
      const newModTime = fs.statSync(violation.file).mtime;
      const fileWasModified = newModTime > originalModTime;

      if (fileWasModified) {
        const updatedContent = fs.readFileSync(violation.file, 'utf8');
        if (updatedContent !== originalContent) {
          console.log(`   🔄 Claude fixed the file (${updatedContent.length} chars)`);
          console.log(`   💾 File updated by Claude's tools`);
          return true;
        }
      }

      console.log(`   ⏭️  No changes made by Claude`);
      return false;
    } catch (error) {
      throw new Error(`Claude CLI failed: ${error.message}`);
    }
  }

  /**
   * 🧠 PATTERN LEARNING SYSTEM - Error Classification
   */
  classifyError(errorLine) {
    const patterns = {
      'module-resolution': ['Cannot find module', 'Module not found', 'Cannot resolve'],
      'export-members': ['has no exported member', 'not exported'],
      'missing-properties': ['Property', 'does not exist', 'Property does not exist'],
      'type-assignment': ['is not assignable to', 'Type mismatch', 'not assignable'],
      'duplicate-ids': ['Duplicate identifier', 'already declared'],
      'optional-properties': ['exactOptionalPropertyTypes', 'undefined'],
      'import-errors': ['Cannot resolve', 'import error'],
      'interface-compliance': ['interface', 'implement', 'missing'],
      'method-signature': ['signature', 'parameter', 'return type']
    };

    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => errorLine.toLowerCase().includes(keyword.toLowerCase()))) {
        return type;
      }
    }
    return 'general';
  }

  /**
   * Extract TypeScript errors from the prompt for pattern analysis
   */
  extractErrorsFromPrompt(prompt) {
    const errors = [];
    const lines = prompt.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS') || line.includes('Error:')) {
        errors.push({
          message: line.trim(),
          type: this.classifyError(line)
        });
      }
    }
    
    return errors;
  }

  /**
   * Generate pattern key for caching
   */
  generatePatternKey(errors, fileExtension) {
    const errorTypes = errors.map(e => e.type).sort().join(',');
    const errorCount = Math.min(errors.length, 10);
    return `${errorTypes}-${fileExtension}-${errorCount}`;
  }

  /**
   * Cache successful pattern for reuse
   */
  cachePattern(patternKey, filePath, prompt, result) {
    this.patternCache.set(patternKey, {
      prompt: prompt.substring(0, 500), // Store sample prompt
      strategy: 'Claude AI fix strategy',
      confidence: 0.8,
      sampleFile: path.basename(filePath),
      created: Date.now(),
      usageCount: 0,
      avgCost: result.cost || 0.5,
      avgDuration: result.duration || 60000
    });
    
    // Save patterns periodically
    if (this.patternCache.size % 5 === 0) {
      this.savePatternCache();
    }
  }

  /**
   * Apply learned pattern from cache
   */
  async applyLearnedPattern(filePath, patternKey, prompt) {
    const pattern = this.patternCache.get(patternKey);
    pattern.usageCount++;
    this.patternHits++;

    const startTime = Date.now();
    console.log(`   ⚡ PATTERN CACHE HIT: Using learned strategy (used ${pattern.usageCount}x)`);
    console.log(`   📚 Pattern: ${patternKey.split('-')[0]} errors`);

    // Apply the cached strategy with optimized prompt
    const optimizedPrompt = `${prompt}

⚡ PATTERN-OPTIMIZED FIX: Based on ${pattern.usageCount} similar fixes
Strategy: ${pattern.strategy}
Expected approach: Similar to ${pattern.sampleFile}
Confidence: ${(pattern.confidence * 100).toFixed(1)}%`;

    const result = await this.callClaudeCLIWithoutCache(filePath, optimizedPrompt);
    
    const duration = Date.now() - startTime;
    
    // Update pattern metrics
    pattern.avgDuration = (pattern.avgDuration + duration) / 2;
    
    console.log(`   ⚡ Pattern applied in ${(duration/1000).toFixed(1)}s (avg: ${(pattern.avgDuration/1000).toFixed(1)}s)`);
    console.log(`   📊 Pattern cache efficiency: ${((this.patternHits/(this.patternHits + this.patternMisses)) * 100).toFixed(1)}% hit rate`);

    return result;
  }

  /**
   * Load cached patterns from disk
   */
  async loadPatternCache() {
    try {
      const cacheFile = path.join(__dirname, '.claude-ai-patterns.json');
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
      const cacheFile = path.join(__dirname, '.claude-ai-patterns.json');
      const data = Object.fromEntries(this.patternCache);
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      console.log(`   💾 Saved ${this.patternCache.size} patterns to cache`);
    } catch (error) {
      console.warn(`Failed to save pattern cache: ${error.message}`);
    }
  }

  /**
   * Get comprehensive pattern learning statistics
   */
  getPatternStats() {
    const totalRequests = this.patternHits + this.patternMisses;
    const hitRate = totalRequests > 0 ? (this.patternHits / totalRequests) * 100 : 0;
    const topPatterns = Array.from(this.patternCache.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      patternsLearned: this.patternCache.size,
      cacheHits: this.patternHits,
      cacheMisses: this.patternMisses,
      hitRate: hitRate.toFixed(1) + '%',
      totalCost: this.totalCost,
      avgExecutionTime: this.avgExecutionTime,
      topPatterns: topPatterns.map(p => ({
        file: p.sampleFile,
        usageCount: p.usageCount,
        avgDuration: Math.round(p.avgDuration / 1000) + 's'
      }))
    };
  }

  /**
   * Print comprehensive pattern learning statistics
   */
  printPatternStats() {
    const stats = this.getPatternStats();
    console.log('\\n🧠 Claude AI Pattern Learning Statistics:');
    console.log(`   📚 Patterns Learned: ${stats.patternsLearned}`);
    console.log(`   ⚡ Cache Hit Rate: ${stats.hitRate}`);
    console.log(`   🎯 Cache Hits: ${stats.cacheHits}, Misses: ${stats.cacheMisses}`);
    console.log(`   💰 Total Cost: $${stats.totalCost.toFixed(2)}`);
    console.log(`   ⏱️  Avg Execution: ${Math.round(stats.avgExecutionTime/1000)}s`);
    
    if (stats.topPatterns.length > 0) {
      console.log(`   🏆 Top Patterns:`);
      stats.topPatterns.forEach((p, i) => {
        console.log(`     ${i+1}. ${p.file} (used ${p.usageCount}x, avg: ${p.avgDuration})`);
      });
    }
  }

  /**
   * 🧠 Call Claude CLI with Pattern Learning (Main Entry Point)
   */
  async callClaudeCLI(filePath, prompt) {
    const startTime = Date.now();
    
    // Load patterns on first call
    if (this.patternCache.size === 0) {
      await this.loadPatternCache();
    }
    
    // Extract errors for pattern analysis
    const errors = this.extractErrorsFromPrompt(prompt);
    const fileExtension = path.extname(filePath);
    const patternKey = this.generatePatternKey(errors, fileExtension);
    
    console.log(`   🧠 Pattern Analysis: ${errors.length} errors, types: ${errors.map(e => e.type).slice(0,3).join(', ')}`);
    
    // Check for cached pattern
    if (this.patternCache.has(patternKey)) {
      return await this.applyLearnedPattern(filePath, patternKey, prompt);
    }
    
    // No pattern found - use regular Claude AI
    this.patternMisses++;
    console.log(`   🔍 New pattern detected - learning...`);
    
    const result = await this.callClaudeCLIWithoutCache(filePath, prompt);
    
    // Cache the pattern if successful
    if (result.success !== false) {
      const duration = Date.now() - startTime;
      this.cachePattern(patternKey, filePath, prompt, { 
        cost: 0.5, 
        duration,
        success: true 
      });
      
      this.successCount++;
      this.totalCost += 0.5;
      this.avgExecutionTime = (this.avgExecutionTime + duration) / 2;
      
      console.log(`   🧠 Pattern learned and cached for future use`);
      console.log(`   📊 Learning stats: ${this.patternCache.size} patterns, ${((this.patternHits/(this.patternHits + this.patternMisses)) * 100).toFixed(1)}% efficiency`);
    }
    
    return result;
  }

  /**
   * Call Claude CLI without pattern learning (Internal Method)
   */
  async callClaudeCLIWithoutCache(filePath, prompt) {
    // Ensure logging is initialized for direct callClaudeCLI calls
    await this.initializeLogging();
    const instruction = `${prompt}

File to fix: ${filePath}

Please use your Read and Write tools to:
1. Read the file: ${filePath}
2. Apply the ESLint fix described above
3. Write the corrected file back

Use your tools directly - do not return code in your response. Just fix the file and confirm it's done.`;

    console.log(`   🤖 Calling NATIVE Claude CLI to fix: ${filePath}`);
    console.log(`   📋 Full instruction: "${instruction.slice(0, 200)}..."`);
    
    // Log Claude operation start with structured data including full prompt
    if (this.claudeLogger && this.initialized) {
      logClaudeOperation(this.claudeLogger, 'claude_cli_start', {
        filePath,
        promptLength: prompt.length,
        instructionLength: instruction.length,
        command: 'file_fix',
        fullPrompt: prompt,
        fullInstruction: instruction
      });
    }
    console.log(`   🔧 Starting Claude CLI with prompt length: ${prompt.length} chars`);

    return new Promise((resolve, reject) => {
      // Use full path instead of shell expansion
      const claudePath = '/home/mhugo/.local/share/mise/shims/claude';

      const claude = spawn(
        claudePath,
        [
          '--model',
          'sonnet',
          '--print',
          '--output-format',
          'json',
          '--dangerously-skip-permissions',
          instruction,
        ],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: REPO_ROOT, // Ensure repo root for file access
          // No shell: true to avoid command interpretation
        }
      );

      // Ensure logs directory exists for any remaining file operations
      const logsDir = path.join(REPO_ROOT, 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileName = path.basename(filePath);
      
      // Log session start with structured data
      if (this.claudeLogger && this.initialized) {
        logClaudeOperation(this.claudeLogger, 'claude_session_start', {
          sessionId,
          fileName,
          filePath,
          timeoutMinutes: Math.round((300000 + Math.min(Math.floor(prompt.length / 1000) * 60000, 1500000)) / 60000)
        });
      }
      console.log(`   📊 Claude CLI session started: ${sessionId} for ${fileName}`);

      let stdout = '';
      let stderr = '';
      let timeoutHandle;

      // Dynamic inactivity timeout based on complexity - resets on any output
      const resetTimeout = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        
        // Calculate timeout based on prompt length (proxy for complexity)
        // Base: 5 minutes, +1 minute per 1000 chars of prompt, max 30 minutes
        const baseTimeout = 300000; // 5 minutes
        const complexityTimeout = Math.min(
          Math.floor(prompt.length / 1000) * 60000, // +1 min per 1K chars
          1500000 // Max 25 additional minutes (30 total)
        );
        const totalTimeout = baseTimeout + complexityTimeout;
        const timeoutMinutes = Math.round(totalTimeout / 60000);
        
        timeoutHandle = setTimeout(() => {
          console.log(`   ⏰ Claude CLI inactivity timeout (${timeoutMinutes} minutes for complex file)`);
          claude.kill('SIGTERM');
          reject(new Error(`Claude CLI inactivity timeout after ${timeoutMinutes} minutes`));
        }, totalTimeout);
      };

      claude.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        resetTimeout(); // Reset timeout on output

        // Try to parse individual turns and thinking from Claude's output
        try {
          // Look for turn markers in Claude's streaming output
          const lines = chunk.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.includes('"type"') || line.includes('thinking') || line.includes('content')) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.type === 'turn' || parsed.content || parsed.thinking) {
                  // Log individual turn with Claude's thinking
                  if (this.claudeLogger && this.initialized) {
                    logClaudeOperation(this.claudeLogger, 'claude_turn_received', {
                      sessionId,
                      fileName,
                      turnData: parsed,
                      thinking: parsed.thinking || 'No thinking captured',
                      content: parsed.content || 'No content',
                      turnType: parsed.type || 'unknown'
                    });
                  }
                }
              } catch (parseError) {
                // Not JSON, might be raw thinking text
                if (line.length > 20 && !line.includes('Working')) {
                  if (this.claudeLogger && this.initialized) {
                    logClaudeOperation(this.claudeLogger, 'claude_thinking_raw', {
                      sessionId,
                      fileName,
                      thinkingContent: line.trim()
                    });
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue with regular processing if parsing fails
        }

        // Log stdout received with structured data
        if (this.claudeLogger && this.initialized) {
          logClaudeOperation(this.claudeLogger, 'claude_stdout_received', {
            sessionId,
            chunkLength: chunk.length,
            fileName,
            rawContent: chunk.trim()
          });
        }
        console.log(`   📥 Claude stdout: ${chunk.length} chars received (session: ${sessionId})`);

        if (chunk.length > 50) {
          console.log(`   🧠 Claude: Working... (${chunk.length} chars received)`);
        }
      });

      claude.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        
        // Log stderr received with structured data
        resetTimeout(); // Reset timeout on stderr
        if (this.claudeLogger && this.initialized) {
          logClaudeOperation(this.claudeLogger, 'claude_stderr_received', {
            sessionId,
            stderrContent: chunk.trim(),
            fileName
          });
        }
        console.log(`   📢 Claude stderr: ${chunk.trim()}`);
      });

      claude.on('close', (code) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        const endTime = Date.now();
        console.log(`   🏁 Claude CLI finished (exit code: ${code})`);

        // Parse and show Claude's JSON response with useful details
        if (stdout.length > 0) {
          try {
            const response = JSON.parse(stdout);
            
            if (response.type === 'result' && response.subtype === 'success') {
              // Log successful completion with metrics
              const metrics = {
                sessionId,
                fileName,
                exitCode: code,
                duration_ms: response.duration_ms,
                num_turns: response.num_turns,
                cost_usd: response.total_cost_usd,
                result: response.result,
                stdoutLength: stdout.length,
                stderrLength: stderr.length,
                fullResponse: response,
                claudeThinking: response.thinking || 'No thinking in final response',
                claudeReasoning: response.result || 'No reasoning captured'
              };
              
              // Log Claude metrics with structured data including thinking
              if (this.claudeLogger && this.initialized) {
                logClaudeMetrics(this.claudeLogger, metrics);
                
                // Also log Claude's final reasoning separately for easy analysis
                logClaudeOperation(this.claudeLogger, 'claude_final_reasoning', {
                  sessionId,
                  fileName,
                  reasoning: response.result,
                  fullThinkingProcess: response.thinking || 'No thinking captured',
                  turnsCompleted: response.num_turns,
                  costUSD: response.total_cost_usd
                });
              }
              console.log(`   📊 Claude metrics - Duration: ${metrics.duration_ms}ms, Turns: ${metrics.num_turns}, Cost: $${metrics.cost_usd?.toFixed(4) || 'N/A'}`);
              
              console.log(`   ✅ Claude completed successfully:`);
              console.log(
                `   ⏱️  Duration: ${response.duration_ms}ms (${response.num_turns} turns)`
              );
              console.log(`   📝 Action: ${response.result}`);
              if (response.total_cost_usd) {
                console.log(`   💰 Cost: $${response.total_cost_usd.toFixed(4)}`);
              }
            } else {
              // Log error response with structured data
              if (this.claudeLogger && this.initialized) {
                logClaudeOperation(this.claudeLogger, 'claude_error_response', {
                  sessionId,
                  fileName,
                  exitCode: code,
                  response: response.result || response.message || 'Unknown result'
                });
              }
              console.log(`   ❌ Claude CLI error response - Session: ${sessionId}, Exit code: ${code}`);
              
              console.log(
                `   📤 Claude response: ${response.result || response.message || 'Unknown result'}`
              );
            }
          } catch (parseError) {
            // Log parse error with structured data
            if (this.claudeLogger && this.initialized) {
              logClaudeOperation(this.claudeLogger, 'claude_parse_error', {
                sessionId,
                fileName,
                error: parseError.message,
                stdoutLength: stdout.length
              });
            }
            console.log(`   ⚠️  Failed to parse Claude response - Session: ${sessionId}, Error: ${parseError.message}`);
            
            // Fallback to showing raw output if JSON parsing fails
            console.log(`   📤 Claude stdout (${stdout.length} chars):`);
            console.log(`   💬 "${stdout.slice(0, 300)}${stdout.length > 300 ? '...' : ''}"`);
          }
        }
        
        if (stderr.length > 0) {
          console.log(`   ⚠️  Claude stderr: ${stderr.trim()}`);
          // Log stderr final with structured data
          if (this.claudeLogger && this.initialized) {
            logClaudeOperation(this.claudeLogger, 'claude_stderr_final', {
              sessionId,
              fileName,
              stderrLength: stderr.length,
              stderrContent: stderr.trim()
            });
          }
          console.log(`   📢 Claude stderr final - Session: ${sessionId}, Length: ${stderr.length}`);
        }
        
        // Log session completion with structured data
        if (this.claudeLogger && this.initialized) {
          logClaudeOperation(this.claudeLogger, 'claude_session_complete', {
            sessionId,
            fileName,
            exitCode: code,
            stdoutLength: stdout.length,
            stderrLength: stderr.length
          });
        }
        console.log(`   🏁 Claude CLI session completed - Session: ${sessionId}, Exit code: ${code}`);

        if (code === 0) {
          // Claude used tools directly - we don't need to return anything
          resolve('SUCCESS');
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        }
      });

      claude.on('error', (error) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
      });

      // No stdin needed - Claude reads the file itself!
      claude.stdin.end();

      // Start inactivity timeout
      resetTimeout();
    });
  }

  /**
   * Build combined prompt for multiple violations in the same file
   */
  buildFilePrompt(violations) {
    const filePath = violations[0].file;
    const fileName = path.basename(filePath);

    let prompt = `Fix multiple ESLint violations in ${fileName}:\n\n`;

    violations.forEach((violation, index) => {
      prompt += `${index + 1}. Line ${violation.line}: ${violation.rule}\n`;
      prompt += `   Issue: ${violation.message}\n`;

      const specificFix = this.getSpecificFix(violation);
      if (specificFix) {
        prompt += `   Fix: ${specificFix}\n`;
      }
      prompt += `\n`;
    });

    prompt += `Please use your Read and Write tools to:\n`;
    prompt += `1. Read the file: ${path.relative(REPO_ROOT, filePath)}\n`;
    prompt += `2. Fix ALL ${violations.length} violations listed above\n`;
    prompt += `3. Write the corrected file back\n\n`;
    prompt += `Use your tools directly - do not return code in your response. Just fix all issues and confirm they're done.`;

    return prompt;
  }

  /**
   * Get specific fix instruction for a violation type
   */
  getSpecificFix(violation) {
    const specificFixes = {
      'jsdoc/require-file-overview':
        'Add a proper @fileoverview JSDoc comment at the top of the file.',
      'jsdoc/require-description-complete-sentence':
        'Make JSDoc description a complete sentence ending with a period.',
      'jsdoc/require-param-description':
        'Add proper JSDoc @param descriptions that are complete sentences.',
      'jsdoc/require-returns-description':
        'Add a proper JSDoc @returns description ending with a period.',
      'jsdoc/require-example': 'Add a JSDoc @example section showing practical usage.',
      '@typescript-eslint/no-explicit-any':
        'Replace the "any" type with a more specific TypeScript type.',
      'prefer-const': 'Change "let" to "const" since the variable is never reassigned.',
      'no-var': 'Replace "var" with "const" or "let" following modern ES6+ practices.',
    };

    return specificFixes[violation.rule];
  }

  /**
   * Build specific prompts for different violation types
   */
  buildPromptForViolation(violation) {
    const rulePrompts = {
      'jsdoc/require-file-overview':
        'Add a proper @fileoverview JSDoc comment at the top of this file. Make it descriptive and complete with a period.',

      'jsdoc/require-description-complete-sentence': `Fix the JSDoc description on line ${violation.line} to be a complete sentence ending with a period.`,

      'jsdoc/require-param-description': `Add proper JSDoc @param descriptions for line ${violation.line}. Make them descriptive and complete sentences.`,

      'jsdoc/require-returns-description': `Add a proper JSDoc @returns description for line ${violation.line}. Make it descriptive and end with a period.`,

      'jsdoc/require-example': `Add a JSDoc @example section for the class/interface/function around line ${violation.line}. Show practical usage.`,

      '@typescript-eslint/no-explicit-any': `Replace the 'any' type on line ${violation.line} with a more specific TypeScript type. Analyze the usage and provide the most appropriate type.`,

      'prefer-const': `Change 'let' to 'const' on line ${violation.line} since the variable is never reassigned.`,

      'no-var': `Replace 'var' with 'const' or 'let' on line ${violation.line} following modern ES6+ practices.`,
    };

    const specificPrompt = rulePrompts[violation.rule];

    if (specificPrompt) {
      return `${specificPrompt}

ESLint Rule: ${violation.rule}
Line ${violation.line}: ${violation.message}

Use your Read and Write tools to fix this directly.`;
    }

    // Generic prompt for unknown rules
    return `Fix this ESLint violation:

Rule: ${violation.rule}
Line: ${violation.line}
Message: ${violation.message}

Use your Read and Write tools to fix this directly.`;
  }

  /**
   * Extract code from Claude's JSON response
   */
  extractCodeFromJSONResponse(response) {
    try {
      const jsonResponse = JSON.parse(response);
      let code = jsonResponse.content || jsonResponse.message || jsonResponse.text || response;

      // Remove markdown code blocks
      code = code.replace(/```[\w]*\n?/g, '');

      // Remove any leading/trailing whitespace but preserve internal formatting
      code = code.trim();

      return code;
    } catch (error) {
      console.log(`   ⚠️  Failed to parse JSON response, using raw text`);
      return this.extractCodeFromResponse(response);
    }
  }

  /**
   * Extract code from Claude's response (remove markdown) - fallback method
   */
  extractCodeFromResponse(response) {
    // Remove markdown code blocks
    let code = response.replace(/```[\w]*\n?/g, '');

    // Remove any leading/trailing whitespace but preserve internal formatting
    code = code.trim();

    return code;
  }

  /**
   * Prioritize violations for fixing
   */
  prioritizeViolations(violations) {
    const priority = {
      // High priority - documentation and type safety
      'jsdoc/require-file-overview': 10,
      'jsdoc/require-description-complete-sentence': 9,
      '@typescript-eslint/no-explicit-any': 8,
      'jsdoc/require-param-description': 7,
      'jsdoc/require-returns-description': 6,

      // Medium priority - code quality
      'prefer-const': 5,
      'no-var': 5,
      'jsdoc/require-example': 4,

      // Lower priority - other issues
      default: 1,
    };

    return violations.sort((a, b) => {
      const aPriority = priority[a.rule] || priority.default;
      const bPriority = priority[b.rule] || priority.default;
      return bPriority - aPriority;
    });
  }

  /**
   * Categorize violations for structured logging
   */
  categorizeViolations(violations) {
    const categories = {};
    violations.forEach(violation => {
      const category = violation.rule || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  /**
   * Mark violations as TODO (enhanced with logging)
   */
  markAsTodo(filePath, violations, reason) {
    if (this.logger) {
      this.logger.info('Marking violations as TODO', {
        filePath,
        violationCount: violations.length,
        reason,
        violationTypes: violations.map(v => v.rule)
      });
    }
    
    // Add to TODO items for tracking
    this.todoItems.push({
      filePath,
      violations,
      reason,
      timestamp: new Date().toISOString()
    });
    
    return true; // Successfully marked as TODO
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test Claude CLI availability
   */
  static async testClaudeAvailability() {
    return new Promise((resolve) => {
      const claude = spawn(
        '/home/mhugo/.local/share/mise/shims/claude',
        ['--model', 'sonnet', '--version'],
        {
          stdio: 'pipe',
          // No shell needed with full path
        }
      );

      claude.on('close', (code) => {
        resolve(code === 0);
      });

      claude.on('error', () => {
        resolve(false);
      });

      setTimeout(() => {
        claude.kill();
        resolve(false);
      }, 5000);
    });
  }
}

// Test the integration
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Claude AI Integration...');

  ClaudeAIIntegration.testClaudeAvailability().then((available) => {
    if (available) {
      console.log('✅ Claude CLI is available and ready');
    } else {
      console.log('❌ Claude CLI is not available or not working');
    }
  });
}
