#!/usr/bin/env node

/**
 * Code Quality and Complexity Analyzer
 * Based on industry best practices for maintainable TypeScript code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Code quality thresholds (based on industry standards)
const QUALITY_THRESHOLDS = {
  // File metrics
  MAX_FILE_LENGTH: 500, // lines
  MAX_FILE_SIZE: 50 * 1024, // 50KB

  // Function metrics
  MAX_FUNCTION_LENGTH: 50, // lines
  MAX_FUNCTION_PARAMS: 5, // parameters
  MAX_CYCLOMATIC_COMPLEXITY: 10,

  // Class metrics
  MAX_CLASS_LENGTH: 300, // lines
  MAX_CLASS_METHODS: 20, // methods

  // Import metrics
  MAX_IMPORTS: 30, // import statements
  MAX_IMPORT_DEPTH: 5, // ../../../.. levels

  // Naming metrics
  MIN_NAME_LENGTH: 3, // characters (excluding i, j for loops)
  MAX_NAME_LENGTH: 50, // characters

  // Documentation
  MIN_JSDOC_COVERAGE: 0.7, // 70% of functions should have docs
};

/**
 * Analyze code quality for a file
 */
class CodeQualityAnalyzer {
  constructor() {
    this.violations = [];
    this.metrics = {};
  }

  analyzeFile(filePath) {
    this.violations = [];
    this.metrics = {};

    if (!fs.existsSync(filePath)) {
      this.addViolation('file', 'File does not exist', filePath, 0);
      return this.getReport();
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    const lines = content.split('\n');

    // Basic file metrics
    this.metrics = {
      filePath,
      fileSize: stats.size,
      lineCount: lines.length,
      nonEmptyLines: lines.filter((line) => line.trim()).length,
      importCount: 0,
      functionCount: 0,
      classCount: 0,
      complexityScore: 0,
    };

    // Analyze file size and length
    this.checkFileMetrics(stats.size, lines.length);

    // Analyze code structure
    this.analyzeCodeStructure(content, lines);

    // Check naming conventions
    this.checkNamingConventions(content);

    // Calculate overall quality score
    this.calculateQualityScore();

    return this.getReport();
  }

  checkFileMetrics(fileSize, lineCount) {
    if (fileSize > QUALITY_THRESHOLDS.MAX_FILE_SIZE) {
      this.addViolation(
        'file-size',
        `File too large: ${Math.round(fileSize / 1024)}KB (max: ${QUALITY_THRESHOLDS.MAX_FILE_SIZE / 1024}KB)`,
        this.metrics.filePath,
        0,
        'high'
      );
    }

    if (lineCount > QUALITY_THRESHOLDS.MAX_FILE_LENGTH) {
      this.addViolation(
        'file-length',
        `File too long: ${lineCount} lines (max: ${QUALITY_THRESHOLDS.MAX_FILE_LENGTH})`,
        this.metrics.filePath,
        0,
        'medium'
      );
    }
  }

  analyzeCodeStructure(content, lines) {
    // Count imports
    const importLines = lines.filter(
      (line) =>
        line.trim().startsWith('import ') ||
        (line.trim().startsWith('const ') && line.includes('require('))
    );
    this.metrics.importCount = importLines.length;

    if (importLines.length > QUALITY_THRESHOLDS.MAX_IMPORTS) {
      this.addViolation(
        'too-many-imports',
        `Too many imports: ${importLines.length} (max: ${QUALITY_THRESHOLDS.MAX_IMPORTS})`,
        this.metrics.filePath,
        0,
        'medium'
      );
    }

    // Check import depth
    importLines.forEach((line, index) => {
      const depthMatch = line.match(/(\.\.\/)*/);
      if (depthMatch && depthMatch[0]) {
        const depth = depthMatch[0].length / 3; // Each "../" is 3 chars
        if (depth > QUALITY_THRESHOLDS.MAX_IMPORT_DEPTH) {
          this.addViolation(
            'deep-import',
            `Import too deep: ${depth} levels (max: ${QUALITY_THRESHOLDS.MAX_IMPORT_DEPTH})`,
            this.metrics.filePath,
            index + 1,
            'low'
          );
        }
      }
    });

    // Analyze functions
    this.analyzeFunctions(content, lines);

    // Analyze classes
    this.analyzeClasses(content, lines);
  }

  analyzeFunctions(content, lines) {
    // Simple function detection (regex-based)
    const functionRegex =
      /(async\s+)?function\s+(\w+)|(\w+)\s*[=:]\s*(async\s+)?\([^)]*\)\s*[=>{]/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      this.metrics.functionCount++;
      const functionName = match[2] || match[3];
      const startPos = match.index;

      // Find function boundaries (simplified)
      const functionLines = this.getFunctionLines(content, startPos);

      if (functionLines > QUALITY_THRESHOLDS.MAX_FUNCTION_LENGTH) {
        const lineNumber = content.substring(0, startPos).split('\n').length;
        this.addViolation(
          'long-function',
          `Function '${functionName}' too long: ${functionLines} lines (max: ${QUALITY_THRESHOLDS.MAX_FUNCTION_LENGTH})`,
          this.metrics.filePath,
          lineNumber,
          'medium'
        );
      }

      // Check parameter count
      const paramMatch = content.substring(startPos).match(/\(([^)]*)\)/);
      if (paramMatch) {
        const params = paramMatch[1].split(',').filter((p) => p.trim()).length;
        if (params > QUALITY_THRESHOLDS.MAX_FUNCTION_PARAMS) {
          const lineNumber = content.substring(0, startPos).split('\n').length;
          this.addViolation(
            'too-many-params',
            `Function '${functionName}' has too many parameters: ${params} (max: ${QUALITY_THRESHOLDS.MAX_FUNCTION_PARAMS})`,
            this.metrics.filePath,
            lineNumber,
            'medium'
          );
        }
      }
    }
  }

  analyzeClasses(content, lines) {
    const classRegex = /class\s+(\w+)/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      this.metrics.classCount++;
      const className = match[1];
      const startPos = match.index;

      // Find class boundaries (simplified)
      const classLines = this.getClassLines(content, startPos);

      if (classLines > QUALITY_THRESHOLDS.MAX_CLASS_LENGTH) {
        const lineNumber = content.substring(0, startPos).split('\n').length;
        this.addViolation(
          'large-class',
          `Class '${className}' too large: ${classLines} lines (max: ${QUALITY_THRESHOLDS.MAX_CLASS_LENGTH})`,
          this.metrics.filePath,
          lineNumber,
          'high'
        );
      }

      // Count methods in class (simplified)
      const classContent = this.getClassContent(content, startPos);
      const methodCount = (classContent.match(/\w+\s*\([^)]*\)\s*[:{]/g) || []).length;

      if (methodCount > QUALITY_THRESHOLDS.MAX_CLASS_METHODS) {
        const lineNumber = content.substring(0, startPos).split('\n').length;
        this.addViolation(
          'too-many-methods',
          `Class '${className}' has too many methods: ${methodCount} (max: ${QUALITY_THRESHOLDS.MAX_CLASS_METHODS})`,
          this.metrics.filePath,
          lineNumber,
          'medium'
        );
      }
    }
  }

  checkNamingConventions(content) {
    // Check for generic names
    const genericNames = [
      'data',
      'info',
      'item',
      'obj',
      'temp',
      'tmp',
      'value',
      'val',
      'result',
      'response',
      'request',
      'params',
      'options',
      'config',
      'manager',
      'handler',
      'service',
      'util',
      'helper',
    ];

    // Simple variable detection
    const varRegex = /(?:const|let|var)\s+(\w+)/g;
    let match;

    while ((match = varRegex.exec(content)) !== null) {
      const varName = match[1];

      if (genericNames.includes(varName.toLowerCase())) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        this.addViolation(
          'generic-naming',
          `Generic variable name '${varName}' should be more descriptive`,
          this.metrics.filePath,
          lineNumber,
          'low'
        );
      }

      if (
        varName.length < QUALITY_THRESHOLDS.MIN_NAME_LENGTH &&
        !['i', 'j', 'k', 'id'].includes(varName)
      ) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        this.addViolation(
          'short-name',
          `Variable name '${varName}' too short (min: ${QUALITY_THRESHOLDS.MIN_NAME_LENGTH} chars)`,
          this.metrics.filePath,
          lineNumber,
          'low'
        );
      }
    }
  }

  getFunctionLines(content, startPos) {
    // Simplified function line counting
    const remainingContent = content.substring(startPos);
    let braceCount = 0;
    let inFunction = false;
    let lines = 0;

    for (let i = 0; i < remainingContent.length; i++) {
      const char = remainingContent[i];

      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inFunction) {
          break;
        }
      } else if (char === '\n') {
        lines++;
      }
    }

    return lines;
  }

  getClassLines(content, startPos) {
    // Similar to getFunctionLines but for classes
    return this.getFunctionLines(content, startPos);
  }

  getClassContent(content, startPos) {
    const remainingContent = content.substring(startPos);
    let braceCount = 0;
    let inClass = false;
    let classContent = '';

    for (let i = 0; i < remainingContent.length; i++) {
      const char = remainingContent[i];

      if (char === '{') {
        braceCount++;
        inClass = true;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inClass) {
          break;
        }
      }

      if (inClass) {
        classContent += char;
      }
    }

    return classContent;
  }

  calculateQualityScore() {
    const totalViolations = this.violations.length;
    const highSeverity = this.violations.filter((v) => v.severity === 'high').length;
    const mediumSeverity = this.violations.filter((v) => v.severity === 'medium').length;

    // Score out of 100
    let score = 100;
    score -= highSeverity * 20; // -20 for each high severity
    score -= mediumSeverity * 10; // -10 for each medium severity
    score -= (totalViolations - highSeverity - mediumSeverity) * 5; // -5 for each low severity

    this.metrics.qualityScore = Math.max(0, score);

    // Determine quality grade
    if (score >= 90) this.metrics.grade = 'A';
    else if (score >= 80) this.metrics.grade = 'B';
    else if (score >= 70) this.metrics.grade = 'C';
    else if (score >= 60) this.metrics.grade = 'D';
    else this.metrics.grade = 'F';
  }

  addViolation(type, message, file, line, severity = 'medium') {
    this.violations.push({
      type,
      message,
      file,
      line,
      severity,
    });
  }

  getReport() {
    return {
      metrics: this.metrics,
      violations: this.violations,
      summary: {
        totalViolations: this.violations.length,
        highSeverity: this.violations.filter((v) => v.severity === 'high').length,
        mediumSeverity: this.violations.filter((v) => v.severity === 'medium').length,
        lowSeverity: this.violations.filter((v) => v.severity === 'low').length,
      },
    };
  }
}

/**
 * Analyze multiple files
 */
function analyzeBulk(pattern = 'src/**/*.ts') {
  const glob = require('glob');
  const analyzer = new CodeQualityAnalyzer();

  console.log('🔍 Code Quality Analysis Starting...');
  console.log(`📁 Pattern: ${pattern}\n`);

  const files = glob.sync(pattern, { ignore: ['**/*.d.ts', '**/node_modules/**'] });
  const results = [];

  for (const file of files) {
    const report = analyzer.analyzeFile(file);
    results.push(report);

    if (report.violations.length > 0) {
      console.log(`📄 ${file}:`);
      console.log(`   Grade: ${report.metrics.grade} (${report.metrics.qualityScore}/100)`);
      console.log(
        `   Violations: ${report.summary.totalViolations} (🔴 ${report.summary.highSeverity} 🟡 ${report.summary.mediumSeverity} ⚪ ${report.summary.lowSeverity})`
      );

      // Show top violations
      report.violations
        .sort((a, b) => {
          const severityOrder = { high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, 3)
        .forEach((v) => {
          const icon = v.severity === 'high' ? '🔴' : v.severity === 'medium' ? '🟡' : '⚪';
          console.log(`     ${icon} Line ${v.line}: ${v.message}`);
        });
      console.log();
    }
  }

  // Overall summary
  const averageScore = results.reduce((sum, r) => sum + r.metrics.qualityScore, 0) / results.length;
  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);

  console.log('📊 OVERALL QUALITY REPORT');
  console.log('='.repeat(50));
  console.log(`Files analyzed: ${results.length}`);
  console.log(`Average quality score: ${averageScore.toFixed(1)}/100`);
  console.log(`Total violations: ${totalViolations}`);
  console.log(`Files needing attention: ${results.filter((r) => r.violations.length > 0).length}`);

  return results;
}

// CLI execution
if (require.main === module) {
  const pattern = process.argv[2] || 'src/**/*.ts';
  analyzeBulk(pattern);
}

module.exports = { CodeQualityAnalyzer, analyzeBulk, QUALITY_THRESHOLDS };
