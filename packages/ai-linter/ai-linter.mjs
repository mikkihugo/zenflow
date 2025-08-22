#!/usr/bin/env node

/**
 * AI Linter - MJS Version
 * Working AI-powered linter for the monorepo
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 AI Linter - MJS Version');
console.log('=' .repeat(50));

// Mock logger since foundation has issues
const logger = {
  info: (...args) => console.log('ℹ️', ...args),
  warn: (...args) => console.warn('⚠️', ...args),
  error: (...args) => console.error('❌', ...args),
  debug: (...args) => console.log('🐛', ...args),
};

/**
 * Simple AI Linter Implementation
 */
class AILinter {
  constructor() {
    this.logger = logger;
  }

  /**
   * Create linter context for a file
   */
  createLinterContext(filePath, language = 'typescript', projectRoot = process.cwd()) {
    return {
      language,
      filePath,
      projectRoot,
      mode: 'balanced',
      preferences: {
        enableAIRules: true,
        enableSwarmAnalysis: true,
        confidenceThreshold: 0.8,
        autoFixThreshold: 0.9,
        focusAreas: ['complexity', 'maintainability', 'type-safety'],
        customPriorities: {},
        enableCaching: true,
      },
      metadata: {
        analyzerVersion: '1.0.0-mjs',
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Analyze a file for linting issues
   */
  async analyzeFile(filePath) {
    this.logger.info(`🔍 Analyzing ${path.basename(filePath)}...`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const analysis = await this.analyzeCode(filePath, content);

      return {
        filePath,
        success: true,
        issues: analysis.issues,
        suggestions: analysis.suggestions,
        qualityScore: analysis.qualityScore,
        canAutoFix: analysis.autoFixableIssues.length > 0,
        autoFixableIssues: analysis.autoFixableIssues,
        complexIssues: analysis.complexIssues,
      };

    } catch (error) {
      this.logger.error(`Failed to analyze ${filePath}:`, error.message);
      return {
        filePath,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Actual code analysis implementation
   */
  async analyzeCode(filePath, content) {
    const lines = content.split('\n');
    const issues = [];
    const suggestions = [];
    const autoFixableIssues = [];
    const complexIssues = [];

    let typeIssues = 0;
    let complexityIssues = 0;
    let performanceIssues = 0;
    let securityIssues = 0;

    // Analyze each line
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for 'any' types
      if (line.includes(': any') || line.includes('any[]') || line.includes('any,')) {
        typeIssues++;
        issues.push({
          line: lineNum,
          column: line.indexOf('any') + 1,
          severity: 'warning',
          message: 'Generic any type detected - consider specific typing',
          type: 'type-safety',
        });
        autoFixableIssues.push(`Line ${lineNum}: Replace 'any' with specific type`);
      }

      // Check for console.log (should use logger)
      if (line.includes('console.log') || line.includes('console.error')) {
        issues.push({
          line: lineNum,
          column: line.indexOf('console') + 1,
          severity: 'info',
          message: 'Consider using structured logging instead of console',
          type: 'best-practices',
        });
        autoFixableIssues.push(`Line ${lineNum}: Replace console with logger`);
      }

      // Check for complex function signatures
      if (line.includes('function') && line.length > 120) {
        complexityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'warning',
          message: 'Complex function signature - consider breaking down',
          type: 'complexity',
        });
        complexIssues.push(`Line ${lineNum}: Simplify complex function signature`);
      }

      // Check for missing return type annotations
      if (line.match(/function\s+\w+\s*\([^)]*\)\s*{/) && !line.includes(':')) {
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'warning',
          message: 'Missing return type annotation',
          type: 'type-safety',
        });
        complexIssues.push(`Line ${lineNum}: Add return type annotation`);
      }

      // Check for async functions without proper error handling
      if (line.includes('async ') && !content.includes('try') && !content.includes('catch')) {
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'warning',
          message: 'Async function lacks error handling',
          type: 'error-handling',
        });
        complexIssues.push(`Line ${lineNum}: Add proper error handling to async function`);
      }

      // Check for TODO/FIXME comments
      if (line.includes('TODO') || line.includes('FIXME') || line.includes('HACK')) {
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'info',
          message: 'Technical debt marker found',
          type: 'technical-debt',
        });
        complexIssues.push(`Line ${lineNum}: Address technical debt comment`);
      }

      // Check for complex conditionals
      if ((line.match(/&&/g) || []).length > 2 || (line.match(/\|\|/g) || []).length > 2) {
        complexityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'warning',
          message: 'Complex conditional logic - consider extracting to functions',
          type: 'complexity',
        });
        complexIssues.push(`Line ${lineNum}: Simplify complex conditional logic`);
      }

      // Check for performance issues
      if (line.includes('for (') && content.includes('.forEach(')) {
        performanceIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'info',
          message: 'Mixed loop patterns - consider consistency',
          type: 'performance',
        });
        complexIssues.push(`Line ${lineNum}: Standardize iteration approach`);
      }

      // SECURITY VULNERABILITY CHECKS

      // Check for eval() usage (critical security risk)
      if (line.includes('eval(')) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: line.indexOf('eval(') + 1,
          severity: 'error',
          message: 'CRITICAL: eval() usage detected - code injection vulnerability',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: CRITICAL - Replace eval() with safe alternatives`);
      }

      // Check for shell command execution
      if (line.includes('exec(') || line.includes('spawn(') || line.includes('execSync(')) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'error',
          message: 'CRITICAL: Shell command execution detected - RCE vulnerability risk',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: CRITICAL - Validate and sanitize shell commands`);
      }

      // Check for SQL injection patterns
      if (line.match(/SELECT.*\$\{.*\}|INSERT.*\$\{.*\}|UPDATE.*\$\{.*\}|DELETE.*\$\{.*\}/)) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'error',
          message: 'CRITICAL: SQL injection vulnerability - unsanitized input in query',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: CRITICAL - Use parameterized queries`);
      }

      // Check for XSS vulnerabilities
      if (line.includes('innerHTML') || line.includes('outerHTML') || line.includes('document.write')) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'error',
          message: 'CRITICAL: XSS vulnerability - unsafe HTML injection',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: CRITICAL - Sanitize HTML content or use textContent`);
      }

      // Check for hardcoded secrets/credentials
      if (line.match(/(?:api[_-]?key|password|secret|token|credential)\s*[=:]\s*["'][\w-]{8,}/i)) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'error',
          message: 'CRITICAL: Hardcoded credentials detected - security leak',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: CRITICAL - Move credentials to environment variables`);
      }

      // Check for insecure random
      if (line.includes('Math.random()')) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: line.indexOf('Math.random()') + 1,
          severity: 'warning',
          message: 'Insecure random number generation - not cryptographically secure',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: Use crypto.randomBytes() for security purposes`);
      }

      // Check for dangerous file operations
      if (line.match(/readFileSync\(.*userPath|writeFileSync\(.*userPath|unlinkSync\(.*userPath/)) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'error',
          message: 'CRITICAL: Path traversal vulnerability - unsanitized file path',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: CRITICAL - Validate and sanitize file paths`);
      }

      // Check for dangerous require() patterns
      if (line.match(/require\(.*\$\{.*\}/) || line.match(/require\(.*userInput/)) {
        securityIssues++;
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'error',
          message: 'CRITICAL: Dynamic require() detected - code injection risk',
          type: 'security',
        });
        complexIssues.push(`Line ${lineNum}: CRITICAL - Validate module names before require()`);
      }
    });

    // Generate suggestions
    if (typeIssues > 0) {
      suggestions.push(`Found ${typeIssues} type safety issues - consider adding specific types`);
    }
    if (complexityIssues > 0) {
      suggestions.push(`Found ${complexityIssues} complexity issues - consider refactoring`);
    }
    if (performanceIssues > 0) {
      suggestions.push(`Found ${performanceIssues} performance opportunities`);
    }
    if (securityIssues > 0) {
      suggestions.push(`CRITICAL: Found ${securityIssues} security vulnerabilities - immediate attention required`);
    }

    // Calculate quality score (heavily penalize security issues)
    const totalLines = lines.length;
    const issueCount = issues.length;
    const securityPenalty = securityIssues * 15; // Heavy penalty for security issues
    const baseScore = Math.max(10, 100 - Math.round((issueCount / totalLines) * 200));
    const qualityScore = Math.max(0, baseScore - securityPenalty);

    return {
      issues,
      suggestions,
      autoFixableIssues,
      complexIssues,
      qualityScore,
    };
  }

  /**
   * Generate Claude-assisted fix prompt
   */
  generateClaudePrompt(analysisResult) {
    if (analysisResult.complexIssues.length === 0) {
      return null;
    }

    const prompt = `Please lint and fix this file: ${analysisResult.filePath}

Specific problems to address:
${analysisResult.complexIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

${analysisResult.suggestions.length > 0 ? `
General improvements:
${analysisResult.suggestions.map(s => `• ${s}`).join('\n')}
` : ''}

Focus areas: ${analysisResult.issues.map(i => i.type).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
Quality score: ${analysisResult.qualityScore}/100`;

    return prompt;
  }

  /**
   * Lint multiple files in the monorepo
   */
  async lintMonorepo(filePatterns = ['**/*.ts', '**/*.js']) {
    this.logger.info('🔍 Scanning monorepo for files to lint...');

    // Simple file discovery (without glob for now)
    const filesToLint = [
      './apps/claude-code-zen-server/src/coordination/agents/agent.ts',
      './apps/claude-code-zen-server/src/coordination/core/event-bus.ts',
      './apps/claude-code-zen-server/src/interfaces/api/http/client.ts',
      './packages/ai-linter/src/claude-sdk-integration.ts',
    ];

    const results = [];

    for (const filePath of filesToLint) {
      try {
        // Check if file exists
        await fs.access(filePath);
        const result = await this.analyzeFile(filePath);
        results.push(result);

        if (result.success) {
          this.logger.info(`📊 ${path.basename(filePath)}: Quality ${result.qualityScore}/100, ${result.issues.length} issues`);

          // Generate Claude prompt if needed
          if (result.complexIssues.length > 0) {
            const prompt = this.generateClaudePrompt(result);
            console.log(`\n🤖 Claude prompt for ${path.basename(filePath)}:`);
            console.log('─'.repeat(60));
            console.log(prompt);
            console.log('─'.repeat(60));
          }
        }

      } catch (error) {
        this.logger.warn(`Skipping ${filePath}: ${error.message}`);
      }
    }

    return results;
  }
}

/**
 * Main function to run the linter
 */
async function main() {
  const linter = new AILinter();

  // Check command line arguments
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Lint specific file
    const filePath = args[0];
    const result = await linter.analyzeFile(filePath);

    if (result.success) {
      console.log(`\n📊 Analysis Results for ${path.basename(filePath)}:`);
      console.log(`   Quality Score: ${result.qualityScore}/100`);
      console.log(`   Total Issues: ${result.issues.length}`);
      console.log(`   Auto-fixable: ${result.autoFixableIssues.length}`);
      console.log(`   Need Claude: ${result.complexIssues.length}`);

      if (result.complexIssues.length > 0) {
        const prompt = linter.generateClaudePrompt(result);
        console.log('\n🤖 Claude Prompt:');
        console.log('─'.repeat(60));
        console.log(prompt);
        console.log('─'.repeat(60));
      }
    }
  } else {
    // Lint entire monorepo
    console.log('🚀 Linting entire monorepo...\n');
    const results = await linter.lintMonorepo();

    const successfulResults = results.filter(r => r.success);

    console.log('\n📈 Monorepo Linting Summary:');
    console.log(`   Files analyzed: ${successfulResults.length}`);
    console.log(`   Average quality: ${Math.round(successfulResults.reduce((sum, r) => sum + r.qualityScore, 0) / successfulResults.length)}/100`);
    console.log(`   Total issues: ${successfulResults.reduce((sum, r) => sum + r.issues.length, 0)}`);
    console.log(`   Files needing Claude: ${successfulResults.filter(r => r.complexIssues.length > 0).length}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AILinter };