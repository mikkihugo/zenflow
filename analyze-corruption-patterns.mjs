#!/usr/bin/env node

/**
 * ANALYZE CORRUPTION PATTERNS - Find specific corruption patterns in errors
 */

import { readFileSync } from 'fs';

async function analyzeErrorPatterns() {
  console.log('🔍 Analyzing specific corruption patterns from TypeScript errors...');
  
  try {
    const { execSync } = await import('child_process');
    const result = execSync('pnpm --filter @claude-zen/server type-check', { 
      cwd: '/home/mhugo/code/claude-code-zen', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch (error) {
    const errorLines = error.stdout.split('\n');
    const syntaxErrors = errorLines.filter(line => 
      line.includes(': error TS1005:') || 
      line.includes(': error TS1002:') ||
      line.includes(': error TS1011:') ||
      line.includes(': error TS1128:')
    );
    
    console.log(`📊 Found ${syntaxErrors.length} syntax errors to analyze`);
    
    // Group errors by file to see patterns
    const errorsByFile = {};
    syntaxErrors.forEach(line => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        const file = match[1];
        if (!errorsByFile[file]) errorsByFile[file] = [];
        errorsByFile[file].push(line);
      }
    });
    
    // Find top corrupted files
    const topFiles = Object.entries(errorsByFile)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    
    console.log('\n🎯 Top 5 most corrupted files:');
    for (const [file, errors] of topFiles) {
      console.log(`   ${file}: ${errors.length} errors`);
    }
    
    // Sample the actual code from top corrupted files
    console.log('\n🔬 Analyzing actual corruption patterns...');
    for (const [file, errors] of topFiles.slice(0, 2)) {
      console.log(`\n📄 ${file}:`);
      
      // Get line numbers from errors
      const lineNumbers = errors.map(error => {
        const match = error.match(/\((\d+),\d+\)/);
        return match ? parseInt(match[1]) : null;
      }).filter(n => n !== null);
      
      try {
        const fullPath = `/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/${file}`;
        const content = readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        // Show unique corrupted lines (first 5)
        const uniqueLines = [...new Set(lineNumbers.slice(0, 5))];
        for (const lineNum of uniqueLines) {
          const line = lines[lineNum - 1];
          if (line && line.includes("' | '")) {
            console.log(`   Line ${lineNum}: ${line.trim()}`);
          }
        }
      } catch (readError) {
        console.log(`   Error reading file: ${readError.message}`);
      }
    }
  }
}

analyzeErrorPatterns().catch(console.error);