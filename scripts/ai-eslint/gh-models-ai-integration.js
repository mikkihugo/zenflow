#!/usr/bin/env node

/**
 * GitHub Models AI Integration for Zen AI Fixer
 * 
 * Uses GitHub Models CLI to access multiple AI providers:
 * - OpenAI GPT-4o, GPT-5, o1-preview, o1-mini
 * - DeepSeek-V3, DeepSeek-R1  
 * - Meta Llama models
 * - Mistral models
 * - Anthropic Claude via GitHub Models
 * 
 * Command structure: gh models run [model] [prompt]
 * Example: gh models run openai/gpt-4o "Fix TypeScript errors"
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create simple logger fallback for script usage
const createSimpleLogger = (prefix) => ({
  info: (...args) => console.log(`[${prefix}]`, ...args),
  warn: (...args) => console.warn(`[${prefix}]`, ...args),  
  error: (...args) => console.error(`[${prefix}]`, ...args),
  debug: (...args) => console.debug(`[${prefix}]`, ...args)
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GitHub Models AI Integration - Multiple AI providers via gh CLI
 */
export class GHModelsAIIntegration {
  constructor() {
    this.logger = createSimpleLogger('gh-models');
    this.sessionId = null;
    this.defaultModel = 'openai/gpt-4o'; // Fast, reliable default
    
    // Initialize structured logging
    this.initializeLogging();
  }

  /**
   * Initialize structured logging for GitHub Models operations
   */
  initializeLogging() {
    try {
      // Import logtape logging system
      import('@logtape/logtape').then(({ getLogger }) => {
        this.logger = getLogger(['gh-models-integration']);
        this.logger.info('GitHub Models AI Integration initialized with structured logging');
      }).catch(err => {
        console.warn('Failed to initialize structured logging:', err.message);
      });
    } catch (error) {
      console.warn('Logtape import failed, using simple logger');
    }
  }

  /**
   * Test GitHub Models CLI availability
   */
  static async testGHModelsAvailability() {
    return new Promise((resolve) => {
      const testProcess = spawn('gh', ['models', 'list'], { 
        stdio: ['ignore', 'pipe', 'pipe'] 
      });

      let hasOutput = false;
      testProcess.stdout.on('data', () => {
        hasOutput = true;
      });

      testProcess.on('close', (code) => {
        resolve(code === 0 && hasOutput);
      });

      testProcess.on('error', () => {
        resolve(false);
      });

      // Kill test after 3 seconds if stuck
      setTimeout(() => {
        testProcess.kill();
        resolve(false);
      }, 3000);
    });
  }

  /**
   * List available GitHub Models
   */
  async listAvailableModels() {
    return new Promise((resolve, reject) => {
      const listProcess = spawn('gh', ['models', 'list'], { 
        stdio: ['ignore', 'pipe', 'pipe'] 
      });

      let output = '';
      listProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      listProcess.on('close', (code) => {
        if (code === 0) {
          const models = output.split('\n')
            .filter(line => line.trim())
            .map(line => {
              const parts = line.split('\t');
              return {
                id: parts[0],
                name: parts[1] || parts[0]
              };
            });
          resolve(models);
        } else {
          reject(new Error('Failed to list GitHub Models'));
        }
      });
    });
  }

  /**
   * Select optimal model for TypeScript error fixing
   */
  getOptimalModel(errorTypes = [], fileSize = 'medium') {
    // Model selection logic based on task complexity
    const hasComplexErrors = errorTypes.some(type => 
      ['type_inference', 'generic_constraints', 'conditional_types'].includes(type)
    );

    if (hasComplexErrors || fileSize === 'large') {
      return 'openai/gpt-4o'; // Best reasoning for complex cases
    }
    
    if (errorTypes.some(type => ['syntax_error', 'import_resolution'].includes(type))) {
      return 'deepseek/deepseek-v3'; // Excellent for code understanding  
    }
    
    // Fast and cost-effective for simple fixes
    return 'openai/gpt-4o-mini';
  }

  /**
   * Claude CLI compatibility interface - redirects to GitHub Models
   */
  async callClaudeCLI(filePath, prompt) {
    return await this.callGHModelsCLI(filePath, prompt);
  }

  /**
   * Main GitHub Models CLI interface compatible with zen-ai-fixer-complete.js
   */
  async callGHModelsCLI(filePath, prompt, model = null) {
    const sessionId = `gh-models-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    const selectedModel = model || this.defaultModel;

    this.logger.info('GitHub Models session started', {
      sessionId,
      filePath: path.basename(filePath),
      model: selectedModel,
      method: 'gh-models-cli'
    });

    try {
      // Read file content for context
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Enhanced prompt with file context
      const enhancedPrompt = this.buildEnhancedPrompt(prompt, filePath, fileContent);
      
      // Log full prompt for debugging
      this.logger.debug('GitHub Models full prompt', {
        sessionId,
        model: selectedModel,
        promptLength: enhancedPrompt.length,
        fullPrompt: enhancedPrompt
      });

      // Execute GitHub Models CLI
      const result = await this.executeGHModelsCommand(selectedModel, enhancedPrompt, sessionId);
      
      if (!result.success) {
        throw new Error(`GitHub Models execution failed: ${result.error}`);
      }

      // Process and apply the response
      const changes = await this.processGHModelsResponse(result.output, filePath, fileContent, sessionId);
      
      // Calculate metrics
      const duration = Date.now() - startTime;
      const cost = this.estimateCost(selectedModel, enhancedPrompt.length, result.output?.length || 0);

      this.logger.info('GitHub Models session completed', {
        sessionId,
        model: selectedModel,
        success: changes.success,
        changesApplied: changes.changesApplied,
        duration: `${(duration/1000).toFixed(1)}s`,
        estimatedCost: `$${cost.toFixed(4)}`,
        outputTokens: result.outputTokens,
        method: 'gh-models-cli'
      });

      return {
        success: changes.success,
        appliedFixes: changes.changesApplied,
        cost,
        duration,
        method: 'GitHub-Models',
        model: selectedModel,
        outputTokens: result.outputTokens,
        changes: changes.changes
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('GitHub Models session failed', {
        sessionId,
        model: selectedModel,
        error: error.message,
        duration: `${(duration/1000).toFixed(1)}s`,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message,
        method: 'GitHub-Models',
        model: selectedModel,
        duration
      };
    }
  }

  /**
   * Execute GitHub Models command via CLI
   */
  async executeGHModelsCommand(model, prompt, sessionId) {
    return new Promise((resolve) => {
      this.logger.debug('Executing gh models command', {
        sessionId,
        model,
        command: `gh models run ${model} [prompt]`
      });

      const ghProcess = spawn('gh', ['models', 'run', model, prompt], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      ghProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        this.logger.debug('GitHub Models output chunk', { 
          sessionId,
          model,
          chunkLength: chunk.length 
        });
      });

      ghProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ghProcess.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          this.logger.debug('GitHub Models execution successful', {
            sessionId,
            model,
            outputLength: stdout.length
          });

          resolve({
            success: true,
            output: stdout.trim(),
            outputTokens: Math.ceil(stdout.length / 4), // Rough token estimate
            model
          });
        } else {
          this.logger.warn('GitHub Models execution failed', {
            sessionId,
            model,
            exitCode: code,
            stderr: stderr.substring(0, 200)
          });

          resolve({
            success: false,
            error: stderr || `Process exited with code ${code}`,
            exitCode: code
          });
        }
      });

      ghProcess.on('error', (error) => {
        this.logger.error('GitHub Models spawn error', {
          sessionId,
          model,
          error: error.message
        });

        resolve({
          success: false,
          error: `Failed to execute gh models: ${error.message}`
        });
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        ghProcess.kill('SIGTERM');
        resolve({
          success: false,
          error: 'GitHub Models execution timed out after 60 seconds'
        });
      }, 60000);
    });
  }

  /**
   * Build enhanced prompt with file context and instructions
   */
  buildEnhancedPrompt(originalPrompt, filePath, fileContent) {
    const fileName = path.basename(filePath);
    const fileType = path.extname(filePath);
    const lines = fileContent.split('\n');
    const contextLines = Math.min(50, lines.length); // Show up to 50 lines for context

    return `You are an expert TypeScript/JavaScript developer. Fix the errors in this file by making precise edits.

FILE: ${fileName} (${fileType})
CONTEXT: First ${contextLines} lines shown below

\`\`\`typescript
${lines.slice(0, contextLines).join('\n')}
${lines.length > contextLines ? `\n... (${lines.length - contextLines} more lines)` : ''}
\`\`\`

TASK: ${originalPrompt}

REQUIREMENTS:
- Fix TypeScript compilation errors precisely
- Preserve existing functionality and logic  
- Use modern TypeScript best practices
- Maintain consistent code style
- Add imports only if needed
- Prefer explicit types over 'any'

OUTPUT FORMAT:
Provide the complete corrected file content. Do not include explanations or markdown - just the raw fixed code.`;
  }

  /**
   * Process GitHub Models response and apply changes
   */
  async processGHModelsResponse(response, filePath, originalContent, sessionId) {
    try {
      // GitHub Models should return the complete corrected file
      const correctedContent = response.trim();
      
      // Validate the response looks like code
      if (!this.validateCodeResponse(correctedContent, originalContent)) {
        throw new Error('Invalid response format from GitHub Models');
      }
      
      // Write the corrected content to file
      fs.writeFileSync(filePath, correctedContent);
      
      // Count changes made
      const changesApplied = this.countChanges(originalContent, correctedContent);
      
      this.logger.info('Applied GitHub Models fixes', {
        sessionId,
        filePath: path.basename(filePath),
        changesApplied,
        originalLines: originalContent.split('\n').length,
        correctedLines: correctedContent.split('\n').length
      });

      return {
        success: true,
        changesApplied,
        changes: [{
          type: 'file_replacement',
          description: `Fixed ${changesApplied} issues via GitHub Models`,
          originalLength: originalContent.length,
          correctedLength: correctedContent.length
        }]
      };

    } catch (error) {
      this.logger.error('Failed to process GitHub Models response', {
        sessionId,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        changesApplied: 0
      };
    }
  }

  /**
   * Validate that response looks like valid code
   */
  validateCodeResponse(response, originalContent) {
    // Basic validation checks
    if (!response || response.length < 10) return false;
    
    // Should contain some code-like patterns
    const codePatterns = [
      /import\s+.*from/,
      /export\s+(class|interface|function|const)/,
      /function\s+\w+/,
      /const\s+\w+\s*=/,
      /class\s+\w+/,
      /interface\s+\w+/
    ];
    
    const hasCodePattern = codePatterns.some(pattern => pattern.test(response));
    if (!hasCodePattern) return false;
    
    // Check that response is reasonably similar in structure to original
    const originalLines = originalContent.split('\n').length;
    const responseLines = response.split('\n').length;
    const lineDiff = Math.abs(responseLines - originalLines) / originalLines;
    
    // Allow up to 50% difference in line count
    return lineDiff <= 0.5;
  }

  /**
   * Count changes between original and corrected content
   */
  countChanges(original, corrected) {
    const originalLines = original.split('\n');
    const correctedLines = corrected.split('\n');
    
    let changes = 0;
    const maxLines = Math.max(originalLines.length, correctedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const correctedLine = correctedLines[i] || '';
      
      if (originalLine !== correctedLine) {
        changes++;
      }
    }
    
    return changes;
  }

  /**
   * Estimate cost based on model and token usage
   */
  estimateCost(model, inputLength, outputLength) {
    // Rough cost estimates for GitHub Models (free tier for now)
    const inputTokens = Math.ceil(inputLength / 4);
    const outputTokens = Math.ceil(outputLength / 4);
    
    // GitHub Models pricing (estimated)
    const modelRates = {
      'openai/gpt-4o': { input: 0.0025, output: 0.010 },
      'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'openai/gpt-5': { input: 0.005, output: 0.015 },
      'deepseek/deepseek-v3': { input: 0.0014, output: 0.0028 },
      'meta/meta-llama-3.1-70b-instruct': { input: 0.0009, output: 0.0009 }
    };

    const rates = modelRates[model] || { input: 0.001, output: 0.002 };
    const inputCost = (inputTokens / 1000) * rates.input;
    const outputCost = (outputTokens / 1000) * rates.output;
    
    return inputCost + outputCost;
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      method: 'GitHub-Models',
      defaultModel: this.defaultModel,
      provider: 'GitHub Models CLI',
      features: [
        'Multiple AI providers',
        'OpenAI GPT-4o/GPT-5',
        'DeepSeek-V3',
        'Meta Llama',
        'Free tier available'
      ]
    };
  }
}

export default GHModelsAIIntegration;