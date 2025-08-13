#!/usr/bin/env node

/**
 * Dead Code Detection Script for Claude Code Zen
 *
 * This script analyzes TypeScript files to find potentially unused:
 * - Exported functions
 * - Exported classes
 * - Exported constants
 * - Exported interfaces/types
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class DeadCodeAnalyzer {
  constructor(srcDir = 'src') {
    this.srcDir = srcDir;
    this.exports = new Map(); // name -> {file, type, line}
    this.imports = new Set(); // name
    this.potentialDeadCode = [];
  }

  // Find all TypeScript files
  findTsFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.findTsFiles(fullPath));
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Extract exports from a file
  extractExports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Match various export patterns
        const exportPatterns = [
          /export\s+(function|class|interface|type|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
          /export\s*\{\s*([^}]+)\s*\}/,
          /export\s+default\s+(function|class|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
        ];

        for (const pattern of exportPatterns) {
          const match = line.match(pattern);
          if (match) {
            if (match[1] && match[2]) {
              // Direct export
              this.exports.set(match[2], {
                file: filePath,
                type: match[1],
                line: index + 1,
                exportLine: line.trim(),
              });
            } else if (match[1] && !match[2]) {
              // Export block - parse individual items
              const exportItems = match[1]
                .split(',')
                .map((item) => item.trim());
              exportItems.forEach((item) => {
                const cleanItem = item.replace(/\s+as\s+\w+/, '').trim();
                if (
                  cleanItem &&
                  !cleanItem.includes('{') &&
                  !cleanItem.includes('}')
                ) {
                  this.exports.set(cleanItem, {
                    file: filePath,
                    type: 'export',
                    line: index + 1,
                    exportLine: line.trim(),
                  });
                }
              });
            }
          }
        }
      });
    } catch (error) {
      console.warn(`Error reading ${filePath}: ${error.message}`);
    }
  }

  // Extract imports from a file
  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line) => {
        // Match various import patterns
        const importPatterns = [
          /import\s+\{\s*([^}]+)\s*\}/,
          /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
          /import\s*\*\s*as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
        ];

        for (const pattern of importPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            if (match[1].includes(',')) {
              // Multiple imports
              const imports = match[1]
                .split(',')
                .map((item) => item.replace(/\s+as\s+\w+/, '').trim());
              imports.forEach((imp) => {
                if (imp && !imp.includes('{') && !imp.includes('}')) {
                  this.imports.add(imp);
                }
              });
            } else {
              // Single import
              this.imports.add(match[1].trim());
            }
          }
        }

        // Also check for usage within the same file (not just imports)
        const usagePatterns = [
          /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/, // function calls
          /\bnew\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/, // constructor calls
          /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\./, // property access
        ];

        for (const pattern of usagePatterns) {
          const matches = line.matchAll(new RegExp(pattern.source, 'g'));
          for (const match of matches) {
            if (match[1]) {
              this.imports.add(match[1]);
            }
          }
        }
      });
    } catch (error) {
      console.warn(`Error reading ${filePath}: ${error.message}`);
    }
  }

  // Analyze the codebase
  analyze() {
    console.log('🔍 Starting dead code analysis...\n');

    const files = this.findTsFiles(this.srcDir);
    console.log(`📁 Found ${files.length} TypeScript files`);

    // Extract all exports
    console.log('📤 Extracting exports...');
    files.forEach((file) => this.extractExports(file));
    console.log(`Found ${this.exports.size} exports`);

    // Extract all imports and usages
    console.log('📥 Extracting imports and usages...');
    files.forEach((file) => this.extractImports(file));
    console.log(`Found ${this.imports.size} imports/usages`);

    // Find potential dead code
    console.log('🕵️ Analyzing for dead code...\n');

    for (const [exportName, exportInfo] of this.exports) {
      if (!this.imports.has(exportName)) {
        // Additional check: might be used in tests or other patterns
        const usageCount = this.countUsages(exportName);

        this.potentialDeadCode.push({
          name: exportName,
          ...exportInfo,
          usageCount,
          confidence: this.calculateConfidence(
            exportName,
            exportInfo,
            usageCount
          ),
        });
      }
    }

    // Sort by confidence (highest first)
    this.potentialDeadCode.sort((a, b) => b.confidence - a.confidence);

    return this.potentialDeadCode;
  }

  // Count actual usages with grep
  countUsages(name) {
    try {
      const result = execSync(
        `grep -r "\\b${name}\\b" ${this.srcDir} --include="*.ts" | wc -l`,
        { encoding: 'utf8' }
      );
      return Number.parseInt(result.trim()) - 1; // Subtract the export declaration
    } catch (error) {
      return 0;
    }
  }

  // Calculate confidence that code is actually dead
  calculateConfidence(name, info, usageCount) {
    let confidence = 0.5; // Base confidence

    // Higher confidence if no grep matches
    if (usageCount === 0) confidence += 0.4;
    else if (usageCount === 1)
      confidence += 0.2; // Only the export itself
    else confidence -= 0.2; // Has some usages

    // Test files might use things not used in production
    if (info.file.includes('__tests__') || info.file.includes('.test.')) {
      confidence += 0.2;
    }

    // Certain patterns more likely to be dead
    if (
      name.includes('Test') ||
      name.includes('Mock') ||
      name.includes('Demo')
    ) {
      confidence += 0.1;
    }

    // Some exports might be public API (lower confidence they're dead)
    if (info.file.includes('index.ts') || info.file.includes('public-api')) {
      confidence -= 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  // Generate report
  generateReport() {
    const deadCode = this.analyze();

    console.log('📊 DEAD CODE ANALYSIS REPORT');
    console.log('='.repeat(50));
    console.log(`Total exports analyzed: ${this.exports.size}`);
    console.log(`Potential dead code items: ${deadCode.length}`);
    console.log('');

    if (deadCode.length === 0) {
      console.log('🎉 No obvious dead code found!');
      return;
    }

    // High confidence dead code
    const highConfidence = deadCode.filter((item) => item.confidence > 0.7);
    if (highConfidence.length > 0) {
      console.log('🚨 HIGH CONFIDENCE DEAD CODE:');
      console.log('-'.repeat(30));
      highConfidence.forEach((item) => {
        console.log(`📍 ${item.name} (${item.type})`);
        console.log(`   File: ${item.file}:${item.line}`);
        console.log(`   Export: ${item.exportLine}`);
        console.log(`   Confidence: ${(item.confidence * 100).toFixed(1)}%`);
        console.log(`   Usage count: ${item.usageCount}`);
        console.log('');
      });
    }

    // Medium confidence dead code
    const mediumConfidence = deadCode.filter(
      (item) => item.confidence > 0.4 && item.confidence <= 0.7
    );
    if (mediumConfidence.length > 0) {
      console.log('⚠️  MEDIUM CONFIDENCE DEAD CODE:');
      console.log('-'.repeat(30));
      mediumConfidence.forEach((item) => {
        console.log(
          `📍 ${item.name} (${item.type}) - ${item.file}:${item.line} - ${(item.confidence * 100).toFixed(1)}%`
        );
      });
      console.log('');
    }

    // Summary and recommendations
    console.log('💡 RECOMMENDATIONS:');
    console.log('-'.repeat(20));
    console.log('1. Review high confidence items for removal');
    console.log('2. Double-check medium confidence items manually');
    console.log('3. Consider using TypeScript --noUnusedLocals flag');
    console.log('4. Run ESLint with no-unused-vars rule');
    console.log('5. Use bundler analysis tools for production builds');

    return deadCode;
  }
}

// Run the analysis
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const analyzer = new DeadCodeAnalyzer();
  analyzer.generateReport();
}

export default DeadCodeAnalyzer;
