#!/usr/bin/env node

/**
 * AI Code Pattern Validator
 * Detects and prevents common AI code generation anti-patterns
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const AI_ANTIPATTERNS = [
  // Real AI problems we actually see:
  
  // Lazy implementations (AI's biggest weakness)
  {
    pattern: /return .*;\s*\/\/\s*TODO/gi,
    message: 'Replace stub return with real implementation',
    severity: 'error'
  },
  {
    pattern: /throw new Error\(['"`](Not implemented|TODO)['"`]\)/gi,
    message: 'Implement the actual functionality instead of throwing',
    severity: 'error'
  },
  {
    pattern: /\/\/\s*Implementation\s*here/gi,
    message: 'Add the actual implementation',
    severity: 'error'
  },
  
  // Event system anti-patterns
  {
    pattern: /eventBus\.emit\([^,]+,.*as any/gi,
    message: 'Event payloads should be properly typed, not "as any"',
    severity: 'error'
  },
  {
    pattern: /\.emit\(['"][a-zA-Z]+['"][,)]/gi,
    message: 'Event names should follow domain:action pattern (e.g., "brain:initialized")',
    severity: 'warning'
  },
  {
    pattern: /import.*@claude-zen\/(brain|coordination|knowledge|telemetry).*from.*@claude-zen\/(brain|coordination|knowledge|telemetry)/gi,
    message: 'Use EventBus for cross-package communication instead of direct imports',
    severity: 'error'
  },
  
  // Type safety issues
  {
    pattern: /as any/gi,
    message: 'Replace "as any" with proper type definitions',
    severity: 'error'
  },
  {
    pattern: /@ts-ignore/gi,
    message: 'Fix TypeScript errors instead of using @ts-ignore',
    severity: 'error'
  },
  {
    pattern: /@ts-nocheck/gi,
    message: 'Remove @ts-nocheck and fix TypeScript errors',
    severity: 'error'
  },
  
  // Code quality issues
  {
    pattern: /\.catch\(\(\) => \{\}\)/gi,
    message: 'Empty catch blocks hide errors - implement proper error handling',
    severity: 'error'
  },
  {
    pattern: /if \(true\)/gi,
    message: 'Remove hardcoded true conditions',
    severity: 'warning'
  },
  {
    pattern: /\/\/ FIXME/gi,
    message: 'Address FIXME comments before commit',
    severity: 'error'
  },
  
  // Security patterns
  {
    pattern: /eval\s*\(/gi,
    message: 'Remove eval() usage - security risk',
    severity: 'error'
  },
  {
    pattern: /innerHTML\s*=/gi,
    message: 'Use textContent or proper DOM manipulation instead of innerHTML',
    severity: 'warning'
  },
  
  // Performance anti-patterns
  {
    pattern: /JSON\.parse\(JSON\.stringify/gi,
    message: 'Replace deep clone anti-pattern with proper cloning',
    severity: 'warning'
  },
  {
    pattern: /setInterval.*1\)/gi,
    message: 'Avoid 1ms intervals - performance issue',
    severity: 'warning'
  }
];

const REQUIRED_PATTERNS = [
  // Ensure proper error handling
  {
    pattern: /try\s*\{[\s\S]*?\}\s*catch/gi,
    message: 'Functions with async operations should include error handling',
    filePattern: /async.*function|function.*async/gi,
    required: true
  },
  
  // Ensure proper types
  {
    pattern: /:\s*\w+(\[\])?(\s*\|\s*\w+)*\s*[=;]/gi,
    message: 'All parameters should have explicit types',
    filePattern: /function.*\(/gi,
    required: true
  }
];

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const issues = [];
    
    // Check anti-patterns
    for (const antipattern of AI_ANTIPATTERNS) {
      const matches = content.match(antipattern.pattern);
      if (matches) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (antipattern.pattern.test(lines[i])) {
            issues.push({
              file: filePath,
              line: i + 1,
              severity: antipattern.severity,
              message: antipattern.message,
              code: lines[i].trim()
            });
          }
        }
      }
    }
    
    return issues;
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dir, issues = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build directories
      if (!['node_modules', 'dist', 'build', '.git', '.svelte-kit'].includes(item)) {
        scanDirectory(fullPath, issues);
      }
    } else if (stat.isFile()) {
      const ext = extname(fullPath);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        const fileIssues = scanFile(fullPath);
        issues.push(...fileIssues);
      }
    }
  }
  
  return issues;
}

function main() {
  console.log('🤖 Scanning for AI code generation anti-patterns...');
  
  // Get staged files for commit
  let stagedFiles = [];
  try {
    const stagedOutput = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf-8' });
    stagedFiles = stagedOutput.split('\n').filter(file => 
      file.trim() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))
    );
  } catch (error) {
    console.log('No staged files found, scanning all files...');
  }
  
  let allIssues = [];
  
  if (stagedFiles.length > 0) {
    // Scan only staged files
    for (const file of stagedFiles) {
      try {
        const issues = scanFile(file);
        allIssues.push(...issues);
      } catch (error) {
        // File might be deleted, skip
      }
    }
  } else {
    // Scan all source files
    allIssues = scanDirectory('.');
  }
  
  // Report issues
  const errors = allIssues.filter(issue => issue.severity === 'error');
  const warnings = allIssues.filter(issue => issue.severity === 'warning');
  
  if (warnings.length > 0) {
    console.log('\n⚠️  AI Code Quality Warnings:');
    for (const warning of warnings) {
      console.log(`  ${warning.file}:${warning.line} - ${warning.message}`);
      console.log(`    ${warning.code}`);
    }
  }
  
  if (errors.length > 0) {
    console.log('\n❌ AI Code Quality Errors:');
    for (const error of errors) {
      console.log(`  ${error.file}:${error.line} - ${error.message}`);
      console.log(`    ${error.code}`);
    }
    
    console.log(`\n💡 Found ${errors.length} AI code quality errors that must be fixed before commit.`);
    console.log('These patterns indicate AI-generated code that needs human refinement.');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.log(`\n✅ No blocking errors, but ${warnings.length} warnings found.`);
  } else {
    console.log('\n✅ No AI anti-patterns detected. Code quality looks good!');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanFile, scanDirectory, AI_ANTIPATTERNS };
