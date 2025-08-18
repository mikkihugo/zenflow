#!/usr/bin/env node

/**
 * @fileoverview TypeScript Auto-Fix Script
 * 
 * Automatically fixes TypeScript compilation errors using Claude CLI for files
 * that don't compile successfully. Analyzes TypeScript errors, identifies patterns,
 * and feeds them to Claude for systematic resolution until the project compiles cleanly.
 * 
 * Features:
 * - Scans for TypeScript compilation errors across the project
 * - Uses Claude CLI with bypass permissions for automated fixes
 * - Provides detailed prompts for systematic error resolution
 * - Supports iterative fixing until compilation succeeds
 * - Validates improvements after Claude processes files
 * - Prioritizes by error frequency and file impact
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';  // Still needed for runTypeCheck()
import { executeClaudeTask } from '../packages/foundation/dist/src/claude-sdk.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for TypeScript auto-fix operations
 */
const CONFIG = {
  /** Maximum iterations to prevent infinite loops */
  MAX_ITERATIONS: 50,
  /** Maximum files to process in one batch */
  MAX_BATCH_SIZE: 10,
  /** Maximum parallel file processing */
  MAX_PARALLEL_FILES: 3,
  /** Claude CLI model to use */
  CLAUDE_MODEL: 'sonnet',
  /** Maximum turns per file (for complex TypeScript fixing) */
  MAX_TURNS: 100, // Reasonable limit for complex files
  /** Timeout in milliseconds per file */
  TIMEOUT_MS: 1800000, // 30 minutes for complex files
  /** Error types to skip (unfixable by Claude) */
  SKIP_ERROR_TYPES: [
    'TS1208', // Top-level await
    'TS1005', // Syntax errors that need manual review
  ],
  /** Prompt enhancement options */
  PROMPT: {
    includeErrorContext: true,
    includeFileContext: true,
    includeSystemInstructions: true,
    enhancedMode: true
  },
  /** Output options */
  OUTPUT: {
    verbose: true,  // Enable to see Foundation SDK messages
    showProgress: true,
    colorOutput: true,
    generateReport: true,
    cleanOutput: false,  // Clean minimal output mode
    jsonLogs: true      // Save detailed JSON interaction logs
  }
};

/**
 * ANSI color codes for terminal output
 */
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Colorizes text for terminal output
 */
function colorize(text, color) {
  if (!CONFIG.OUTPUT.colorOutput) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

/**
 * Runs TypeScript type checking and returns error analysis
 */
async function runTypeCheck() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Running TypeScript compilation check...');
    
    const child = spawn('pnpm', ['--filter', '@claude-zen/server', 'type-check'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      // Don't show output during parsing to avoid confusion
    });

    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      // Don't show error output during parsing
    });

    child.on('close', (code) => {
      // Parse TypeScript errors from both stdout and stderr (TypeScript may output to either)
      // Apply the same filtering approach as prompt validation to prevent parsing interference
      const errors = [];
      
      // Check both stdout and stderr for TypeScript errors
      const combinedOutput = stdout + '\n' + stderr;
      let cleanOutput = combinedOutput;
      try {
        // Import the foundation package's filtering function if available
        // For now, apply basic filtering to remove Claude's descriptive patterns
        cleanOutput = combinedOutput.replace(/^📁\s+(File:|Directory:|Path:).*$/gm, '')
                          .replace(/^📄\s+.*$/gm, '')
                          .replace(/^🔍\s+.*$/gm, '')
                          .replace(/^(✅|❌|⚠️|🔄|⏳|🚀|📊|📈|📉)\s+.*$/gm, '')
                          .replace(/^(I'll|I'm|Let me|Here's|This|The|Based on).*$/gm, '')
                          .replace(/^(Analysis:|Summary:|Results:|Findings:).*$/gm, '');
      } catch (err) {
        // If filtering fails, use original output
        console.log(`Debug: Could not apply filtering: ${err.message}`);
      }
      
      const lines = cleanOutput.split('\n');
      
      if (CONFIG.OUTPUT.verbose) {
        console.log(`Debug: Found ${lines.length} lines in stderr after filtering`);
        console.log(`Debug: Exit code: ${code}`);
        console.log(`Debug: Sample lines:`, lines.slice(0, 3).map(l => `"${l}"`));
      }
      
      for (const line of lines) {
        // Only match actual TypeScript compiler error format: file.ts(line,col): error TSnnnn: message
        // Must be clean compiler output, not Claude's descriptive text
        const cleanLine = line.trim();
        
        // Skip empty lines or lines that are clearly not compiler errors
        if (!cleanLine || cleanLine.length === 0) continue;
        
        // TypeScript compiler errors have this exact format: path(line,col): error TScode: message
        const errorMatch = cleanLine.match(/^([a-zA-Z0-9._/\\-]+\.tsx?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
        
        if (errorMatch) {
          let filePath = errorMatch[1];
          const lineNum = parseInt(errorMatch[2], 10);
          const column = parseInt(errorMatch[3], 10);
          const errorCode = errorMatch[4];
          const message = errorMatch[5].trim();
          
          // Validate that this looks like a real file path (no emoji, reasonable length)
          if (filePath.includes('📁') || filePath.includes('File:') || filePath.length > 150) {
            if (CONFIG.OUTPUT.verbose) {
              console.log(`Debug: Skipping invalid path: "${filePath}"`);
            }
            continue;
          }
          
          // Validate line and column numbers are reasonable
          if (lineNum <= 0 || column <= 0 || lineNum > 50000 || column > 1000) {
            if (CONFIG.OUTPUT.verbose) {
              console.log(`Debug: Skipping invalid line/col: ${lineNum},${column}`);
            }
            continue;
          }
          
          // Handle relative paths from the server directory
          if (!path.isAbsolute(filePath)) {
            filePath = path.resolve(process.cwd(), 'apps/claude-code-zen-server', filePath);
          }
          
          // Verify the file actually exists before adding to error list
          try {
            if (fs.existsSync(filePath)) {
              errors.push({
                file: filePath,
                line: lineNum,
                column: column, 
                code: errorCode,
                message: message
              });
            } else if (CONFIG.OUTPUT.verbose) {
              console.log(`Debug: File does not exist: ${filePath}`);
            }
          } catch (err) {
            if (CONFIG.OUTPUT.verbose) {
              console.log(`Debug: Error checking file existence: ${err.message}`);
            }
          }
        }
      }

      // Always show debug info for now to diagnose the issue
      console.log(`Debug: Parsed ${errors.length} TypeScript errors from ${lines.length} lines`);
      console.log(`Debug: Exit code: ${code}`);
      console.log(`Debug: Stdout length: ${stdout.length}, Stderr length: ${stderr.length}`);
      if (errors.length > 0) {
        console.log(`Debug: First error:`, errors[0]);
      } else {
        console.log(`Debug: Sample raw output lines:`, lines.slice(0, 5).map(l => `"${l.substring(0, 100)}"`));
      }

      resolve({ errors, exitCode: code, output: stdout + stderr });
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to run TypeScript check: ${error.message}`));
    });
  });
}

/**
 * Analyzes errors to group by file and identify patterns
 */
function analyzeErrors(errors) {
  const fileErrors = {};
  const errorTypes = {};
  
  for (const error of errors) {
    // Skip unfixable error types
    if (CONFIG.SKIP_ERROR_TYPES.includes(error.code)) {
      continue;
    }
    
    // Group by file
    if (!fileErrors[error.file]) {
      fileErrors[error.file] = [];
    }
    fileErrors[error.file].push(error);
    
    // Group by error type
    if (!errorTypes[error.code]) {
      errorTypes[error.code] = [];
    }
    errorTypes[error.code].push(error);
  }
  
  // Sort files by error count (highest first)
  const fileList = Object.entries(fileErrors)
    .map(([file, errors]) => ({ file, errors, count: errors.length }))
    .sort((a, b) => b.count - a.count);
  
  return { fileErrors: fileList, errorTypes };
}

/**
 * Generates comprehensive prompt for TypeScript error fixing
 */
function generateTypeScriptPrompt(file, errors, fileAnalysis = null) {
  const errorsList = errors.map((err, index) => 
    `${index + 1}. Line ${err.line}, Column ${err.column} - ${err.code}: ${err.message}`
  ).join('\n');

  if (!CONFIG.PROMPT.enhancedMode) {
    return `Please fix the TypeScript compilation errors in this file:

${errorsList}

Requirements:
1. Fix all TypeScript errors listed above
2. Maintain existing functionality and code structure
3. Use proper TypeScript types and interfaces
4. Follow TypeScript best practices
5. Ensure no breaking changes to public APIs
6. Add necessary imports for any new types used

Please analyze the file and fix all TypeScript compilation errors systematically.`;
  }

  const fileContext = `
📁 File: ${file}
🚨 TypeScript Errors: ${errors.length} compilation issues
🎯 Target: Zero compilation errors
🏗️ Project: claude-code-zen (AI swarm orchestration platform)`;

  const errorContext = CONFIG.PROMPT.includeErrorContext ? `

🔍 ERROR ANALYSIS:
${errors.map((err, index) => {
  let category = 'Type Mismatch';
  if (err.code.includes('2339')) category = 'Property Missing';
  else if (err.code.includes('2554')) category = 'Argument Count';
  else if (err.code.includes('2448')) category = 'Variable Declaration';
  else if (err.code.includes('2564')) category = 'Property Not Initialized';

  return `${index + 1}. [${category}] ${err.code} at line ${err.line}:${err.column}
   → ${err.message}`;
}).join('\n')}` : '';

  const systemInstructions = CONFIG.PROMPT.includeSystemInstructions ? `

SYSTEM INSTRUCTIONS:
You are a TypeScript expert specializing in systematic error resolution for large codebases.
Your task is to fix all compilation errors while maintaining code quality and functionality.

CRITICAL REQUIREMENTS:
1. Fix ALL TypeScript errors listed - do not ignore any
2. Maintain existing functionality - no breaking changes
3. Use proper TypeScript types - avoid 'any' unless absolutely necessary
4. Add proper imports for any types or functions used
5. Follow existing code patterns and conventions in the file
6. Preserve all existing exports and public APIs

SYSTEMATIC APPROACH:
1. Analyze each error to understand the root cause
2. Fix missing imports and type declarations first - USE PUBLIC PACKAGES (@claude-zen/foundation, @claude-zen/sparc, etc.)
3. Address type mismatches with proper type assertions or interface updates
4. Handle missing properties by EXPANDING interfaces and types, never disable or remove functionality
5. Resolve function signature mismatches by implementing missing methods or updating interfaces
6. Use TypeScript utility types when helpful (Partial, Pick, Omit, etc.)

CRITICAL: EXPAND AND FIX, DO NOT DISABLE OR REMOVE:
- DO NOT comment out code or disable functionality
- DO NOT use 'any' types to bypass errors
- DO NOT remove properties or methods from interfaces
- DO NOT delete example files or test files
- INSTEAD: Add missing properties, implement missing methods, expand type definitions
- INSTEAD: Use proper types from public @claude-zen packages
- INSTEAD: Create comprehensive type definitions that cover all use cases

PACKAGE USAGE PRIORITIES:
1. ✅ USE PUBLIC PACKAGES: @claude-zen/foundation, @claude-zen/event-system, @claude-zen/sparc, @claude-zen/brain, etc.
2. ✅ PREFER public package exports over private implementations
3. ✅ Use foundation storage abstraction (getDatabaseAccess, getKV, getSQL, etc.)
4. ✅ Import proper types from @claude-zen/sparc for SPARC methodology
5. ✅ Use @claude-zen/brain for neural coordination and intelligence
6. ❌ DO NOT use private packages (@claude-zen/database directly)
7. ❌ DO NOT bypass proper package abstractions

TYPESCRIPT BEST PRACTICES:
- Use explicit return types for functions
- Prefer interfaces over type aliases for object shapes
- Use proper generic constraints
- Handle undefined/null cases appropriately with proper null checks
- Use type guards for runtime type checking
- Leverage TypeScript's strict mode features
- Expand types to cover all possible cases rather than narrowing

` : '';

  const contextGuidelines = CONFIG.PROMPT.includeFileContext ? `
FILE CONTEXT GUIDELINES:
- This is part of the claude-code-zen AI swarm orchestration platform
- The codebase uses modern TypeScript with ES2022 features
- Packages use @claude-zen namespace with proper exports
- Foundation storage abstraction is used instead of direct database access
- Event-driven architecture with type-safe event systems
- Coordination patterns: Queens → Commanders → Cubes → Matrons → Agents

COMMON PATTERNS TO MAINTAIN:
- Event emitter patterns with proper typing
- Dependency injection through constructor parameters
- Async/await for all database and external operations
- Proper error handling with custom error types
- Interface segregation for clean architecture

` : '';

  const userPrompt = `TYPESCRIPT ERROR RESOLUTION TASK

📁 Context: TypeScript compilation errors in claude-code-zen AI swarm orchestration platform
🎯 Goal: Resolve all compilation errors while maintaining functionality

🚨 ERRORS TO FIX:
${errorsList}

CRITICAL REQUIREMENTS:
✅ Fix ALL listed TypeScript errors
✅ Use PUBLIC packages: @claude-zen/foundation, @claude-zen/sparc, @claude-zen/brain, @claude-zen/event-system
✅ EXPAND functionality - never disable or comment out code
✅ Add missing properties/methods to interfaces
✅ Import proper types from @claude-zen packages
✅ Maintain all public APIs and exports
✅ Proper error handling and type safety
✅ Documentation comments preserved and updated if needed

SYSTEMATIC APPROACH:
1. Analyze root cause of each error
2. Use proper @claude-zen package imports (prefer public packages)
3. Expand type definitions to cover all cases
4. Implement missing methods/properties
5. Verify no breaking changes to public APIs
6. Add necessary type guards and null checks
7. Follow existing code patterns and conventions

${contextGuidelines}
Execute systematic resolution of all TypeScript compilation errors with expanding approach.`;

  return `${fileContext}${errorContext}

${systemInstructions}${userPrompt}`;
}

/**
 * Smart randomization that balances file complexity across batches
 * Prevents all complex files from ending up in the same parallel batch
 */
function smartRandomizeFiles(filesToProcess) {
  // Sort files by error count (complexity)
  const sorted = [...filesToProcess].sort((a, b) => b.errors.length - a.errors.length);
  
  // Create balanced groups by distributing complex files evenly
  const groups = [];
  const groupCount = Math.min(CONFIG.MAX_PARALLEL_FILES, filesToProcess.length);
  
  for (let i = 0; i < groupCount; i++) {
    groups[i] = [];
  }
  
  // Round-robin distribution: most complex files spread across groups
  sorted.forEach((file, index) => {
    groups[index % groupCount].push(file);
  });
  
  // Shuffle each group internally and then shuffle the groups
  groups.forEach(group => {
    group.sort(() => Math.random() - 0.5);
  });
  
  // Randomly interleave the groups
  const result = [];
  while (groups.some(group => group.length > 0)) {
    const availableGroups = groups.filter(group => group.length > 0);
    if (availableGroups.length === 0) break;
    
    const randomGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
    result.push(randomGroup.shift());
  }
  
  return result;
}

/**
 * Process files in parallel batches for performance
 */
async function processFilesInParallel(filesToProcess) {
  const allResults = [];
  const totalFiles = filesToProcess.length;
  
  // 🎲 SMART RANDOMIZATION to prevent consistent interference patterns
  // Balance by error complexity to avoid all complex files in same batch
  const shuffledFiles = smartRandomizeFiles(filesToProcess);
  console.log(colorize(`🎲 Files intelligently randomized to prevent batch interference patterns`, 'magenta'));
  
  const expectedBatches = Math.ceil(totalFiles / CONFIG.MAX_PARALLEL_FILES);
  
  console.log(colorize(`\n🎯 PARALLEL PROCESSING PLAN:`, 'bright'));
  console.log(colorize(`   📁 Total files: ${totalFiles}`, 'blue'));
  console.log(colorize(`   ⚡ Parallel limit: ${CONFIG.MAX_PARALLEL_FILES} files`, 'blue'));
  console.log(colorize(`   📦 Expected batches: ${expectedBatches}`, 'blue'));
  
  // Show complexity distribution
  const complexityInfo = shuffledFiles.slice(0, 3).map(f => 
    `${path.basename(f.file)}(${f.errors.length})`
  ).join(', ');
  console.log(colorize(`   🎲 Smart order: ${complexityInfo}...`, 'magenta'));
  
  let batchNumber = 1;
  
  // Split randomized files into parallel batches
  for (let i = 0; i < shuffledFiles.length; i += CONFIG.MAX_PARALLEL_FILES) {
    const batch = shuffledFiles.slice(i, i + CONFIG.MAX_PARALLEL_FILES);
    
    console.log(colorize(`\n🚀 BATCH ${batchNumber}/${expectedBatches}: Processing ${batch.length} files in parallel`, 'bright'));
    batch.forEach((fileData, idx) => {
      console.log(`  ${idx + 1}. ${path.basename(fileData.file)} (${fileData.count} errors)`);
    });
    
    batchNumber++;
    
    // Process batch in parallel with visual indicators
    const batchPromises = batch.map(async (fileData, batchIndex) => {
      const fileId = `File ${batchIndex + 1}`;
      const fileName = path.basename(fileData.file);
      
      try {
        // Start indicator
        console.log(colorize(`🚀 [${fileId}] STARTING: ${fileName} (${fileData.errors.length} errors)`, 'cyan'));
        
        console.log(`\n${'─'.repeat(30)} [${fileName}]`);
        console.log(colorize(`📄 Processing: ${fileName}`, 'cyan'));
        console.log(colorize(`🚨 Errors to fix: ${fileData.errors.length}`, 'yellow'));
        
        // Show top error types for this file
        const errorTypes = {};
        fileData.errors.forEach(err => {
          errorTypes[err.code] = (errorTypes[err.code] || 0) + 1;
        });
        const topTypes = Object.entries(errorTypes)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([code, count]) => `${code}(${count})`)
          .join(', ');
        console.log(colorize(`🔍 Top error types: ${topTypes}`, 'yellow'));
        
        // Fix with Claude
        const claudeResult = await fixFileWithClaude(fileData.file, fileData.errors, fileData, fileId);
        
        // Completion indicator
        if (claudeResult.success) {
          console.log(colorize(`✅ [${fileId}] COMPLETED: ${fileName} fixed successfully!`, 'green'));
        } else {
          console.log(colorize(`❌ [${fileId}] FAILED: ${fileName} - ${claudeResult.error}`, 'red'));
        }
        
        return {
          file: fileData.file,
          success: claudeResult.success,
          errorsAttempted: fileData.errors.length,
          error: claudeResult.error
        };
        
      } catch (error) {
        console.error(colorize(`💥 ERROR processing ${fileData.file}: ${error.message}`, 'red'));
        return {
          file: fileData.file,
          success: false,
          errorsAttempted: fileData.errors.length,
          error: error.message
        };
      }
    });
    
    // Wait for batch completion
    const batchResults = await Promise.all(batchPromises);
    allResults.push(...batchResults);
    
    // Show batch summary
    const successful = batchResults.filter(r => r.success).length;
    const failed = batchResults.length - successful;
    console.log(colorize(`\n📊 BATCH ${batchNumber-1} COMPLETE:`, 'bright'));
    console.log(colorize(`   ✅ Successful: ${successful}`, successful > 0 ? 'green' : 'yellow'));
    console.log(colorize(`   ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green'));
    console.log(colorize(`   📈 Progress: ${allResults.length}/${totalFiles} total files processed`, 'cyan'));
    
    // Brief pause between batches to avoid overwhelming system
    if (i + CONFIG.MAX_PARALLEL_FILES < filesToProcess.length) {
      console.log(colorize('⏳ Brief pause before next batch...', 'blue'));
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return allResults;
}

/**
 * Uses Foundation SDK with dangerous permissions to fix TypeScript errors in a file
 */
async function fixFileWithClaude(file, errors, fileAnalysis = null, fileId = null) {
  const prompt = generateTypeScriptPrompt(file, errors, fileAnalysis);
  
  const filePrefix = fileId ? `[${fileId}] ` : '';
  
  if (CONFIG.OUTPUT.cleanOutput) {
    // Clean mode: minimal output
    console.log(colorize(`🔧 ${filePrefix}${path.basename(file)} (${errors.length} errors)`, 'blue'));
  } else {
    // Normal/verbose mode
    console.log(colorize(`🔧 ${filePrefix}Claude processing ${errors.length} TypeScript errors in ${path.basename(file)}...`, 'blue'));
    
    if (CONFIG.OUTPUT.verbose) {
      console.log(colorize(`📝 ${filePrefix}Error Analysis:`, 'cyan'));
      errors.slice(0, 3).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.code}: ${err.message.substring(0, 80)}...`);
      });
      if (errors.length > 3) {
        console.log(`  ... and ${errors.length - 3} more errors`);
      }
      console.log('');
    }
  }

  try {
    // Capture all Claude interactions for logging and deception detection
    let claudeInteractionLog = [];
    
    // Calculate dynamic turns based on error count (minimum 3 turns per error, max 100)
    const dynamicTurns = Math.min(Math.max(errors.length * 3, CONFIG.MAX_TURNS), 100);
    const dynamicTimeout = Math.min(Math.max(errors.length * 15000, CONFIG.TIMEOUT_MS), 3600000); // 15s per error, max 1 hour
    
    console.log(colorize(`⚙️  ${filePrefix}SDK Config: ${errors.length} errors → ${dynamicTurns} turns, ${dynamicTimeout/1000}s timeout`, 'blue'));
    
    const messages = await executeClaudeTask(prompt, {
      model: CONFIG.CLAUDE_MODEL,
      permissionMode: 'bypassPermissions', // ✅ This is the "dangerous" flag equivalent
      additionalDirectories: [path.dirname(path.resolve(file))],
      maxTurns: dynamicTurns, // ✅ Dynamic turn limit based on error count
      timeoutMs: dynamicTimeout, // ✅ Dynamic timeout based on complexity
      stderr: (data) => {
        // Capture stderr for deception detection and logging
        claudeInteractionLog.push({
          type: 'stderr',
          timestamp: new Date().toISOString(),
          content: data,
          file: path.basename(file)
        });
        
        if (CONFIG.OUTPUT.verbose) {
          process.stderr.write(data);
        }
      }
    });

    if (CONFIG.OUTPUT.verbose && messages.length > 0) {
      console.log(colorize(`📊 ${filePrefix}Received ${messages.length} messages from Claude`, 'cyan'));
    }

    // Extract text content from messages and show actual Claude output
    let outputText = '';
    let assistantResponses = [];
    
    for (const message of messages) {
      if (message.type === 'result' && message.result) {
        outputText += message.result + '\n';
      } else if (message.type === 'assistant' && message.message?.content) {
        for (const content of message.message.content) {
          if (content.type === 'text' && content.text) {
            outputText += content.text + '\n';
            assistantResponses.push(content.text);
          }
        }
      }
    }

    // Log all Claude responses for deception detection and monitoring
    assistantResponses.forEach((response, i) => {
      claudeInteractionLog.push({
        type: 'assistant_response',
        timestamp: new Date().toISOString(),
        content: response,
        file: path.basename(file),
        responseNumber: i + 1
      });
    });

    // Show actual Claude responses for logging if verbose
    if (CONFIG.OUTPUT.verbose && assistantResponses.length > 0) {
      console.log(colorize(`\n📝 Claude's Actual Responses:`, 'cyan'));
      assistantResponses.forEach((response, i) => {
        console.log(colorize(`\n--- Response ${i + 1} ---`, 'yellow'));
        // Show first 500 chars of each response to see what Claude actually said
        console.log(response.substring(0, 500) + (response.length > 500 ? '...' : ''));
      });
      console.log(colorize(`--- End Claude Responses ---\n`, 'yellow'));
    }

    // Save interaction log for deception detection analysis
    if (CONFIG.OUTPUT.jsonLogs && claudeInteractionLog.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = `logs/claude-${path.basename(file, '.ts')}-${timestamp}.json`;
      
      try {
        const fs = await import('fs');
        
        // Create logs directory if it doesn't exist
        await fs.promises.mkdir('logs', { recursive: true });
        
        await fs.promises.writeFile(logFile, JSON.stringify({
          session: {
            file: path.basename(file),
            fileId: fileId || 'single',
            timestamp: new Date().toISOString(),
            errorsFixed: errors.length,
            model: CONFIG.CLAUDE_MODEL,
            permissionMode: 'bypassPermissions',
            dynamicTurns,
            dynamicTimeout
          },
          interactions: claudeInteractionLog,
          summary: {
            totalMessages: messages.length,
            assistantResponses: assistantResponses.length,
            stderrEntries: claudeInteractionLog.filter(log => log.type === 'stderr').length
          },
          fullResponses: assistantResponses
        }, null, 2));
        
        if (CONFIG.OUTPUT.verbose) {
          console.log(colorize(`💾 ${filePrefix}Detailed log: ${logFile}`, 'green'));
        }
      } catch (logError) {
        console.warn(colorize(`⚠️  Could not save interaction log: ${logError.message}`, 'yellow'));
      }
    }

    console.log(colorize(`✅ ${filePrefix}Claude completed TypeScript fixes for ${path.basename(file)}`, 'green'));
    return { success: true, output: outputText };

  } catch (error) {
    console.error(colorize(`❌ ${filePrefix}Claude failed to process ${path.basename(file)}: ${error.message}`, 'red'));
    return { success: false, error: error.message };
  }
}

/**
 * Validates that TypeScript fixes were applied successfully
 */
async function validateFixes() {
  try {
    const result = await runTypeCheck();
    return { 
      success: result.exitCode === 0, 
      errorCount: result.errors.length,
      errors: result.errors
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main iterative fixing process
 */
async function iterativeTypescriptFix() {
  console.log(colorize('🚀 Starting iterative TypeScript error fixing process...', 'bright'));
  
  let iteration = 1;
  let allResults = [];
  
  while (iteration <= CONFIG.MAX_ITERATIONS) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(colorize(`🔄 ITERATION ${iteration}/${CONFIG.MAX_ITERATIONS}`, 'bright'));
    console.log('═'.repeat(60));
    
    // Check current TypeScript status
    console.log(colorize('🔍 Analyzing TypeScript compilation...', 'blue'));
    const typeCheckResult = await runTypeCheck();
    
    if (typeCheckResult.errors.length === 0) {
      console.log(colorize('🎉 SUCCESS: All TypeScript errors have been resolved!', 'green'));
      break;
    }
    
    console.log(colorize(`📋 Found ${typeCheckResult.errors.length} TypeScript errors`, 'yellow'));
    
    // Analyze errors and identify top files to fix
    const analysis = analyzeErrors(typeCheckResult.errors);
    
    if (analysis.fileErrors.length === 0) {
      console.log(colorize('⚠️  No fixable errors found (all errors are in skip list)', 'yellow'));
      break;
    }
    
    // Process top files with most errors (batch processing)
    const filesToProcess = analysis.fileErrors.slice(0, CONFIG.MAX_BATCH_SIZE);
    
    console.log(colorize(`\n📁 Processing ${filesToProcess.length} files with highest error counts:`, 'cyan'));
    filesToProcess.forEach((fileData, i) => {
      console.log(`  ${i + 1}. ${path.basename(fileData.file)} (${fileData.count} errors)`);
    });
    
    // Process files in parallel batches
    const iterationResults = await processFilesInParallel(filesToProcess);
    
    allResults.push({ iteration, results: iterationResults });
    
    // Show iteration summary
    const successful = iterationResults.filter(r => r.success).length;
    console.log(`\n${'─'.repeat(30)}`);
    console.log(colorize(`📊 Iteration ${iteration} Summary:`, 'bright'));
    console.log(`   Files processed: ${iterationResults.length}`);
    console.log(colorize(`   Successfully processed: ${successful}`, successful > 0 ? 'green' : 'red'));
    console.log(colorize(`   Failed: ${iterationResults.length - successful}`, 'yellow'));
    
    iteration++;
  }
  
  // Final validation
  console.log(`\n${'═'.repeat(60)}`);
  console.log(colorize('🔍 Final TypeScript validation...', 'blue'));
  const finalCheck = await validateFixes();
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(colorize('📊 FINAL RESULTS', 'bright'));
  console.log('═'.repeat(60));
  
  if (finalCheck.success) {
    console.log(colorize('🎉 SUCCESS: All TypeScript errors resolved!', 'green'));
    console.log(colorize('✅ Project compiles cleanly', 'green'));
  } else {
    console.log(colorize(`⚠️  ${finalCheck.errorCount} TypeScript errors remain`, 'yellow'));
    console.log(colorize('🔄 Additional iterations may be needed', 'yellow'));
  }
  
  const totalIterations = allResults.length;
  const totalFilesProcessed = allResults.reduce((sum, iter) => sum + iter.results.length, 0);
  const totalSuccessful = allResults.reduce((sum, iter) => 
    sum + iter.results.filter(r => r.success).length, 0);
  
  console.log(`\nTotal iterations: ${totalIterations}`);
  console.log(`Total files processed: ${totalFilesProcessed}`);
  console.log(`Total successful fixes: ${totalSuccessful}`);
  console.log(`Overall success rate: ${totalFilesProcessed > 0 ? ((totalSuccessful / totalFilesProcessed) * 100).toFixed(1) : 0}%`);
  
  return { 
    success: finalCheck.success, 
    iterations: totalIterations,
    finalErrorCount: finalCheck.errorCount || 0,
    results: allResults 
  };
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colorize('TypeScript Auto-Fix with Claude CLI', 'bright')}
${colorize('Iterative error resolution until project compiles cleanly', 'cyan')}

${colorize('Usage:', 'blue')} node fix-typescript.mjs [options]

${colorize('Options:', 'blue')}
  --model <model>           Claude model to use (default: ${CONFIG.CLAUDE_MODEL})
  --max-iterations <number> Maximum fix iterations (default: ${CONFIG.MAX_ITERATIONS})
  --batch-size <number>     Maximum files per iteration (default: ${CONFIG.MAX_BATCH_SIZE})
  --parallel <number>       Maximum parallel file processing (default: ${CONFIG.MAX_PARALLEL_FILES})
  --verbose                 Enable verbose output with error analysis
  --clean                   Clean minimal output mode (less noise)
  --no-json-logs            Disable JSON interaction logs
  --no-color                Disable colored output
  --help, -h                Show this help message

${colorize('Features:', 'blue')}
  ✅ Iterative fixing until compilation succeeds
  ✅ Smart error prioritization by file impact
  ✅ Comprehensive TypeScript error analysis
  ✅ Safe fixes with functionality preservation
  ✅ Progress tracking and detailed reporting
  ✅ Parallel processing for maximum performance
  ✅ Configurable batch sizes (up to 10 files per iteration)

${colorize('Examples:', 'blue')}
  node fix-typescript.mjs                         # Fix all TypeScript errors iteratively
  node fix-typescript.mjs --model opus            # Use Claude Opus for highest quality
  node fix-typescript.mjs --verbose               # Show detailed error analysis
  node fix-typescript.mjs --batch-size 10         # Process 10 files per iteration
  node fix-typescript.mjs --parallel 2            # Process 2 files simultaneously
  node fix-typescript.mjs --batch-size 15 --parallel 5  # High performance: 15 files, 5 parallel
    `);
    process.exit(0);
  }

  // Parse options
  if (args.includes('--verbose')) {
    CONFIG.OUTPUT.verbose = true;
  }
  if (args.includes('--clean')) {
    CONFIG.OUTPUT.cleanOutput = true;
    CONFIG.OUTPUT.verbose = false;  // Clean mode overrides verbose
  }
  if (args.includes('--no-json-logs')) {
    CONFIG.OUTPUT.jsonLogs = false;
  }
  if (args.includes('--no-color')) {
    CONFIG.OUTPUT.colorOutput = false;
  }
  
  const modelIndex = args.indexOf('--model');
  if (modelIndex !== -1 && args[modelIndex + 1]) {
    CONFIG.CLAUDE_MODEL = args[modelIndex + 1];
  }
  
  const iterIndex = args.indexOf('--max-iterations');
  if (iterIndex !== -1 && args[iterIndex + 1]) {
    CONFIG.MAX_ITERATIONS = parseInt(args[iterIndex + 1], 10);
  }
  
  const batchIndex = args.indexOf('--batch-size');
  if (batchIndex !== -1 && args[batchIndex + 1]) {
    CONFIG.MAX_BATCH_SIZE = parseInt(args[batchIndex + 1], 10);
  }
  
  const parallelIndex = args.indexOf('--parallel');
  if (parallelIndex !== -1 && args[parallelIndex + 1]) {
    CONFIG.MAX_PARALLEL_FILES = parseInt(args[parallelIndex + 1], 10);
  }
  
  const turnsIndex = args.indexOf('--max-turns');
  if (turnsIndex !== -1 && args[turnsIndex + 1]) {
    CONFIG.MAX_TURNS = parseInt(args[turnsIndex + 1], 10);
  }
  
  const timeoutIndex = args.indexOf('--timeout');
  if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
    CONFIG.TIMEOUT_MS = parseInt(args[timeoutIndex + 1], 10) * 1000; // Convert seconds to ms
  }

  console.log(colorize('🔧 TypeScript Auto-Fix with Claude CLI', 'bright'));
  console.log(colorize(`Using model: ${CONFIG.CLAUDE_MODEL}`, 'blue'));
  console.log(colorize(`Max iterations: ${CONFIG.MAX_ITERATIONS}`, 'blue'));
  console.log(colorize(`Batch size: ${CONFIG.MAX_BATCH_SIZE}`, 'blue'));
  console.log(colorize(`Parallel processing: ${CONFIG.MAX_PARALLEL_FILES} files`, 'blue'));
  console.log(colorize(`Max turns per file: ${CONFIG.MAX_TURNS}`, 'blue'));
  console.log(colorize(`Timeout per file: ${CONFIG.TIMEOUT_MS / 1000}s`, 'blue'));
  
  try {
    const result = await iterativeTypescriptFix();
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error(colorize(`💥 Fatal error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize(`💥 Unhandled error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

export { runTypeCheck, fixFileWithClaude, validateFixes, CONFIG };