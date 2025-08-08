#!/usr/bin/env node

/**
 * Claude Code Zen AI-Assisted ESLint Fixer
 * Intelligent code fixing with mindful AI assistance
 * 
 * Key features:
 * - Smart violation categorization (Group 1/2/3 by complexity)
 * - Tree-sitter for precise code context
 * - Batch processing for efficiency
 * - Claude Code AI-powered systematic fixing
 * - Zen approach: Thoughtful, measured, effective
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Import CommonJS modules in ES module environment
const require = createRequire(import.meta.url);
const Parser = require('tree-sitter');
const TypeScript = require('tree-sitter-typescript');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, 'reports');
const BATCH_SIZE = 10;

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Violation categories based on Docker blog methodology
 */
const VIOLATION_GROUPS = {
  GROUP_1: {
    name: 'Complex violations requiring architectural changes',
    rules: [
      'max-complexity',
      'max-lines-per-function',
      'max-depth',
      'no-duplicate-imports',
      'prefer-const'
    ],
    aiSupervision: 'high',
    autoFixable: false
  },
  GROUP_2: {
    name: 'Moderate violations requiring context analysis',
    rules: [
      'no-unused-vars',
      '@typescript-eslint/no-explicit-any',
      'no-console',
      'no-undef',
      'prefer-template'
    ],
    aiSupervision: 'medium',
    autoFixable: true
  },
  GROUP_3: {
    name: 'Simple violations with clear fixes',
    rules: [
      'semi',
      'quotes',
      'indent',
      'comma-dangle',
      'no-trailing-spaces',
      'eol-last',
      'no-multiple-empty-lines'
    ],
    aiSupervision: 'low',
    autoFixable: true
  }
};

/**
 * Tree-sitter parser for precise code context extraction
 */
class CodeContextExtractor {
  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript.typescript);
  }

  /**
   * Extract precise context around a violation
   * @param {string} filePath - Path to the file
   * @param {number} line - Line number of violation
   * @param {number} column - Column number of violation
   * @returns {Object} Context information
   */
  extractContext(filePath, line, column) {
    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      const tree = this.parser.parse(sourceCode);
      
      // Get the node at the specific location
      const targetNode = this.findNodeAtPosition(tree.rootNode, line - 1, column);
      
      return {
        violation: {
          line,
          column,
          nodeType: targetNode?.type || 'unknown'
        },
        context: {
          function: this.getFunctionContext(targetNode),
          class: this.getClassContext(targetNode),
          imports: this.getImports(tree.rootNode),
          surroundingLines: this.getSurroundingLines(sourceCode, line, 5)
        },
        ast: {
          nodeText: targetNode?.text?.slice(0, 200) || '',
          parentType: targetNode?.parent?.type || 'unknown',
          childrenTypes: targetNode?.children?.map(c => c.type) || []
        }
      };
    } catch (error) {
      console.warn(`Failed to extract context for ${filePath}:${line}:${column}`, error.message);
      return this.getFallbackContext(filePath, line);
    }
  }

  findNodeAtPosition(node, line, column) {
    if (node.startPosition.row <= line && node.endPosition.row >= line) {
      for (const child of node.children) {
        const result = this.findNodeAtPosition(child, line, column);
        if (result) return result;
      }
      return node;
    }
    return null;
  }

  getFunctionContext(node) {
    let current = node;
    while (current) {
      if (['function_declaration', 'method_definition', 'arrow_function'].includes(current.type)) {
        const nameNode = current.children.find(c => c.type === 'identifier');
        return {
          name: nameNode?.text || 'anonymous',
          type: current.type,
          parameters: this.extractParameters(current)
        };
      }
      current = current.parent;
    }
    return null;
  }

  getClassContext(node) {
    let current = node;
    while (current) {
      if (current.type === 'class_declaration') {
        const nameNode = current.children.find(c => c.type === 'type_identifier');
        return {
          name: nameNode?.text || 'unknown',
          methods: this.extractMethods(current)
        };
      }
      current = current.parent;
    }
    return null;
  }

  getImports(rootNode) {
    const imports = [];
    for (const child of rootNode.children) {
      if (child.type === 'import_statement') {
        imports.push(child.text);
      }
    }
    return imports;
  }

  getSurroundingLines(sourceCode, targetLine, contextSize) {
    const lines = sourceCode.split('\n');
    const start = Math.max(0, targetLine - contextSize - 1);
    const end = Math.min(lines.length, targetLine + contextSize);
    
    return lines.slice(start, end).map((line, index) => ({
      number: start + index + 1,
      content: line,
      isViolation: start + index + 1 === targetLine
    }));
  }

  extractParameters(functionNode) {
    const params = functionNode.children.find(c => c.type === 'formal_parameters');
    return params?.children?.map(p => p.text) || [];
  }

  extractMethods(classNode) {
    const body = classNode.children.find(c => c.type === 'class_body');
    return body?.children?.filter(c => c.type === 'method_definition').map(m => ({
      name: m.children.find(c => c.type === 'property_identifier')?.text || 'unknown',
      type: m.type
    })) || [];
  }

  getFallbackContext(filePath, line) {
    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      return {
        violation: { line, column: 0, nodeType: 'unknown' },
        context: {
          function: null,
          class: null,
          imports: [],
          surroundingLines: this.getSurroundingLines(sourceCode, line, 3)
        },
        ast: { nodeText: '', parentType: 'unknown', childrenTypes: [] }
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * ESLint violation analyzer and categorizer
 */
class ViolationAnalyzer {
  constructor() {
    this.contextExtractor = new CodeContextExtractor();
  }

  /**
   * Run ESLint and parse violations
   * @returns {Array} Parsed violations
   */
  analyzeViolations() {
    console.log('🔍 Running ESLint analysis...');
    
    try {
      // Get violations in JSON format
      const eslintOutput = execSync(
        'npx eslint . --format json --max-warnings 0',
        { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
      );
      
      const results = JSON.parse(eslintOutput);
      return this.parseViolations(results);
    } catch (error) {
      // ESLint returns non-zero exit code when violations found
      if (error.stdout) {
        const results = JSON.parse(error.stdout);
        return this.parseViolations(results);
      }
      throw error;
    }
  }

  /**
   * Parse ESLint output into structured violations
   * @param {Array} eslintResults - Raw ESLint results
   * @returns {Array} Structured violations
   */
  parseViolations(eslintResults) {
    const violations = [];
    
    for (const file of eslintResults) {
      if (file.messages && file.messages.length > 0) {
        for (const message of file.messages) {
          const violation = {
            file: file.filePath,
            rule: message.ruleId,
            message: message.message,
            severity: message.severity === 2 ? 'error' : 'warning',
            line: message.line,
            column: message.column,
            fixable: message.fixable || false,
            group: this.categorizeViolation(message.ruleId),
            context: null // Will be populated later
          };
          
          violations.push(violation);
        }
      }
    }
    
    return violations;
  }

  /**
   * Categorize violation based on Docker methodology
   * @param {string} ruleId - ESLint rule ID
   * @returns {string} Violation group
   */
  categorizeViolation(ruleId) {
    if (!ruleId) return 'GROUP_2';
    
    for (const [group, config] of Object.entries(VIOLATION_GROUPS)) {
      if (config.rules.includes(ruleId)) {
        return group;
      }
    }
    
    // Default to Group 2 for uncategorized rules
    return 'GROUP_2';
  }

  /**
   * Add context information to violations using Tree-sitter
   * @param {Array} violations - Violations to enhance
   * @returns {Array} Enhanced violations
   */
  async enhanceWithContext(violations) {
    console.log('🌳 Extracting code context using Tree-sitter...');
    
    const enhanced = [];
    let processed = 0;
    
    for (const violation of violations) {
      if (processed % 10 === 0) {
        console.log(`  Processed ${processed}/${violations.length} violations`);
      }
      
      const context = this.contextExtractor.extractContext(
        violation.file,
        violation.line,
        violation.column
      );
      
      enhanced.push({
        ...violation,
        context
      });
      
      processed++;
    }
    
    return enhanced;
  }
}

/**
 * AI-powered violation fixer using Claude Code
 */
class AIViolationFixer {
  constructor() {
    this.fixAttempts = new Map();
    this.successRate = new Map();
  }

  /**
   * Process violations in batches using AI assistance
   * @param {Array} violations - Categorized violations
   * @returns {Object} Fix results
   */
  async processViolations(violations) {
    console.log('🤖 Starting AI-assisted violation fixing...');
    
    const results = {
      GROUP_1: { attempted: 0, fixed: 0, failed: 0 },
      GROUP_2: { attempted: 0, fixed: 0, failed: 0 },
      GROUP_3: { attempted: 0, fixed: 0, failed: 0 }
    };
    
    // Group violations by category
    const groupedViolations = this.groupViolations(violations);
    
    // Process Group 3 first (easiest, highest success rate)
    if (groupedViolations.GROUP_3.length > 0) {
      console.log(`\n📝 Processing ${groupedViolations.GROUP_3.length} Group 3 violations (simple fixes)...`);
      const group3Results = await this.fixGroup3Violations(groupedViolations.GROUP_3);
      results.GROUP_3 = group3Results;
    }
    
    // Process Group 2 (moderate complexity)
    if (groupedViolations.GROUP_2.length > 0) {
      console.log(`\n🔧 Processing ${groupedViolations.GROUP_2.length} Group 2 violations (context-aware)...`);
      const group2Results = await this.fixGroup2Violations(groupedViolations.GROUP_2);
      results.GROUP_2 = group2Results;
    }
    
    // Process Group 1 (complex, requires human review)
    if (groupedViolations.GROUP_1.length > 0) {
      console.log(`\n⚠️  Processing ${groupedViolations.GROUP_1.length} Group 1 violations (requires review)...`);
      const group1Results = await this.analyzeGroup1Violations(groupedViolations.GROUP_1);
      results.GROUP_1 = group1Results;
    }
    
    return results;
  }

  groupViolations(violations) {
    return {
      GROUP_1: violations.filter(v => v.group === 'GROUP_1'),
      GROUP_2: violations.filter(v => v.group === 'GROUP_2'),
      GROUP_3: violations.filter(v => v.group === 'GROUP_3')
    };
  }

  /**
   * Fix simple Group 3 violations using standard patterns
   */
  async fixGroup3Violations(violations) {
    const results = { attempted: 0, fixed: 0, failed: 0 };
    
    for (const violation of violations.slice(0, 20)) { // Limit to prevent overwhelming
      results.attempted++;
      
      try {
        const fixed = await this.applySimpleFix(violation);
        if (fixed) {
          results.fixed++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.warn(`Failed to fix simple violation: ${error.message}`);
        results.failed++;
      }
    }
    
    return results;
  }

  /**
   * Fix moderate Group 2 violations using AI context analysis
   */
  async fixGroup2Violations(violations) {
    const results = { attempted: 0, fixed: 0, failed: 0 };
    
    // Process in batches
    const batches = this.createBatches(violations.slice(0, 30), BATCH_SIZE);
    
    for (const batch of batches) {
      console.log(`  Processing batch of ${batch.length} Group 2 violations...`);
      
      for (const violation of batch) {
        results.attempted++;
        
        try {
          const fixed = await this.applyContextAwareFix(violation);
          if (fixed) {
            results.fixed++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.warn(`Failed to fix context-aware violation: ${error.message}`);
          results.failed++;
        }
      }
      
      // Rate limiting
      await this.sleep(1000);
    }
    
    return results;
  }

  /**
   * Analyze complex Group 1 violations for human review
   */
  async analyzeGroup1Violations(violations) {
    const results = { attempted: 0, fixed: 0, failed: 0 };
    
    // Generate analysis report for human review
    const analysisReport = await this.generateAnalysisReport(violations);
    
    const reportPath = path.join(REPORTS_DIR, `group1-analysis-${Date.now()}.md`);
    fs.writeFileSync(reportPath, analysisReport);
    
    console.log(`📋 Group 1 analysis report saved: ${reportPath}`);
    
    results.attempted = violations.length;
    // Group 1 violations require human review, not automatic fixing
    
    return results;
  }

  /**
   * Apply simple pattern-based fixes
   */
  async applySimpleFix(violation) {
    const fixes = {
      'semi': (content, line) => {
        const lines = content.split('\n');
        const targetLine = lines[line - 1];
        if (!targetLine.trim().endsWith(';')) {
          lines[line - 1] = targetLine + ';';
          return lines.join('\n');
        }
        return null;
      },
      'quotes': (content, line) => {
        const lines = content.split('\n');
        lines[line - 1] = lines[line - 1].replace(/"/g, "'");
        return lines.join('\n');
      },
      'no-trailing-spaces': (content) => {
        return content.replace(/[ \t]+$/gm, '');
      },
      'eol-last': (content) => {
        return content.endsWith('\n') ? content : content + '\n';
      }
    };

    const fix = fixes[violation.rule];
    if (!fix) return false;

    try {
      const content = fs.readFileSync(violation.file, 'utf8');
      const fixed = fix(content, violation.line);
      
      if (fixed && fixed !== content) {
        fs.writeFileSync(violation.file, fixed);
        console.log(`  ✅ Fixed ${violation.rule} in ${violation.file}:${violation.line}`);
        return true;
      }
    } catch (error) {
      console.warn(`  ❌ Failed to apply simple fix: ${error.message}`);
    }
    
    return false;
  }

  /**
   * Apply context-aware fixes using Claude Code
   */
  async applyContextAwareFix(violation) {
    if (!violation.context) return false;

    const prompt = this.buildContextAwarePrompt(violation);
    
    try {
      // Use Claude Code for context-aware fixing
      const claudeCommand = `claude code "${prompt}"`;
      const result = execSync(claudeCommand, { 
        encoding: 'utf8', 
        timeout: 30000,
        maxBuffer: 1024 * 1024 
      });
      
      // Parse Claude Code response and apply fix
      const success = await this.parseAndApplyClaudeFix(violation, result);
      
      if (success) {
        console.log(`  ✅ AI-fixed ${violation.rule} in ${violation.file}:${violation.line}`);
        return true;
      }
    } catch (error) {
      console.warn(`  ❌ AI fix failed for ${violation.rule}: ${error.message}`);
    }
    
    return false;
  }

  buildContextAwarePrompt(violation) {
    const context = violation.context;
    
    return `Fix this ESLint violation using proper TypeScript patterns:

**Violation Details:**
- Rule: ${violation.rule}
- Message: ${violation.message}
- File: ${path.basename(violation.file)}
- Location: Line ${violation.line}, Column ${violation.column}

**Code Context:**
\`\`\`typescript
${context.context.surroundingLines.map(l => 
  `${l.number.toString().padStart(3, ' ')}${l.isViolation ? '>' : ':'} ${l.content}`
).join('\n')}
\`\`\`

**Additional Context:**
${context.context.function ? `- Function: ${context.context.function.name} (${context.context.function.type})` : ''}
${context.context.class ? `- Class: ${context.context.class.name}` : ''}
- AST Node: ${context.ast.nodeType}
- Parent Node: ${context.ast.parentType}

**Instructions:**
1. Provide ONLY the corrected code for the problematic line(s)
2. Maintain existing functionality and type safety
3. Follow TypeScript best practices
4. Keep the fix minimal and focused

**Expected Response Format:**
\`\`\`typescript
// Fixed code here
\`\`\`

Fix the violation:`;
  }

  async parseAndApplyClaudeFix(violation, claudeResponse) {
    // Extract code blocks from Claude's response
    const codeBlockRegex = /```(?:typescript|ts)?\n([\s\S]*?)\n```/g;
    const matches = [...claudeResponse.matchAll(codeBlockRegex)];
    
    if (matches.length === 0) return false;
    
    const fixedCode = matches[0][1].trim();
    if (!fixedCode) return false;
    
    try {
      // Apply the fix to the specific line
      const content = fs.readFileSync(violation.file, 'utf8');
      const lines = content.split('\n');
      
      // Simple line replacement for now - could be made more sophisticated
      lines[violation.line - 1] = fixedCode;
      
      fs.writeFileSync(violation.file, lines.join('\n'));
      return true;
    } catch (error) {
      console.warn(`Failed to apply Claude fix: ${error.message}`);
      return false;
    }
  }

  async generateAnalysisReport(violations) {
    const timestamp = new Date().toISOString();
    
    let report = `# Group 1 Violations Analysis Report\n\n`;
    report += `Generated: ${timestamp}\n`;
    report += `Total Complex Violations: ${violations.length}\n\n`;
    
    report += `## Summary\n\n`;
    report += `These violations require architectural changes and human review:\n\n`;
    
    const ruleGroups = violations.reduce((acc, v) => {
      acc[v.rule] = (acc[v.rule] || 0) + 1;
      return acc;
    }, {});
    
    for (const [rule, count] of Object.entries(ruleGroups)) {
      report += `- **${rule}**: ${count} violations\n`;
    }
    
    report += `\n## Detailed Analysis\n\n`;
    
    for (const violation of violations.slice(0, 10)) { // Limit to prevent huge reports
      report += `### ${violation.rule} - ${path.basename(violation.file)}:${violation.line}\n\n`;
      report += `**Message**: ${violation.message}\n\n`;
      
      if (violation.context?.context.surroundingLines) {
        report += `**Code Context**:\n\`\`\`typescript\n`;
        report += violation.context.context.surroundingLines
          .map(l => `${l.number}: ${l.content}`)
          .join('\n');
        report += `\n\`\`\`\n\n`;
      }
      
      report += `**Recommended Action**: Manual review and refactoring required\n\n`;
      report += `---\n\n`;
    }
    
    return report;
  }

  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();
  
  console.log('🧘 Claude Code Zen AI ESLint Fixer');
  console.log('===================================\n');
  
  try {
    // Step 1: Analyze violations
    const analyzer = new ViolationAnalyzer();
    const violations = analyzer.analyzeViolations();
    
    console.log(`📊 Found ${violations.length} total violations`);
    
    // Group by category for reporting
    const grouped = {
      GROUP_1: violations.filter(v => v.group === 'GROUP_1'),
      GROUP_2: violations.filter(v => v.group === 'GROUP_2'),
      GROUP_3: violations.filter(v => v.group === 'GROUP_3')
    };
    
    console.log(`  - Group 1 (Complex): ${grouped.GROUP_1.length}`);
    console.log(`  - Group 2 (Moderate): ${grouped.GROUP_2.length}`);
    console.log(`  - Group 3 (Simple): ${grouped.GROUP_3.length}\n`);
    
    // Step 2: Enhance with context
    const enhancedViolations = await analyzer.enhanceWithContext(violations);
    
    // Step 3: Process with AI
    const fixer = new AIViolationFixer();
    const results = await fixer.processViolations(enhancedViolations);
    
    // Step 4: Generate final report
    const duration = Math.round((Date.now() - startTime) / 1000);
    const report = generateFinalReport(results, duration, violations.length);
    
    console.log('\n' + report);
    
    // Save report
    const reportPath = path.join(REPORTS_DIR, `ai-eslint-fix-${Date.now()}.md`);
    fs.writeFileSync(reportPath, report);
    console.log(`\n📋 Detailed report saved: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error during AI-assisted fixing:', error.message);
    process.exit(1);
  }
}

function generateFinalReport(results, duration, totalViolations) {
  const totalFixed = results.GROUP_1.fixed + results.GROUP_2.fixed + results.GROUP_3.fixed;
  const totalAttempted = results.GROUP_1.attempted + results.GROUP_2.attempted + results.GROUP_3.attempted;
  const successRate = totalAttempted > 0 ? ((totalFixed / totalAttempted) * 100).toFixed(1) : '0.0';
  
  return `# AI-Assisted ESLint Fix Report

## Summary
- **Total Violations**: ${totalViolations}
- **Total Attempted**: ${totalAttempted}
- **Total Fixed**: ${totalFixed}
- **Success Rate**: ${successRate}%
- **Duration**: ${duration}s

## Results by Group

### Group 1 (Complex - Requires Human Review)
- Attempted: ${results.GROUP_1.attempted}
- Fixed: ${results.GROUP_1.fixed}
- Failed: ${results.GROUP_1.failed}

### Group 2 (Moderate - AI Context-Aware)
- Attempted: ${results.GROUP_2.attempted}
- Fixed: ${results.GROUP_2.fixed}
- Failed: ${results.GROUP_2.failed}

### Group 3 (Simple - Pattern-Based)
- Attempted: ${results.GROUP_3.attempted}
- Fixed: ${results.GROUP_3.fixed}
- Failed: ${results.GROUP_3.failed}

## Next Steps
1. Review Group 1 violations manually
2. Re-run ESLint to verify fixes
3. Run tests to ensure no functionality broken
4. Consider updating ESLint rules based on patterns found
`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ViolationAnalyzer, AIViolationFixer, CodeContextExtractor };