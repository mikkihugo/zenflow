#!/usr/bin/env npx tsx

/**
 * @fileoverview TSDoc/JSDoc Coverage Checker
 * 
 * Analyzes TypeScript files to determine documentation coverage.
 * Checks for JSDoc comments on functions, classes, interfaces, and exports.
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';

interface CoverageResult {
  file: string;
  totalItems: number;
  documentedItems: number;
  coverage: number;
  undocumentedItems: Array<{
    type: 'function' | 'class' | 'interface' | 'export';
    name: string;
    line: number;
  }>;
}

async function checkTSDocCoverage(filePath: string): Promise<CoverageResult> {
  const content = await readFile(filePath, 'utf8');
  const lines = content.split('\n');
  
  const items: Array<{ type: string; name: string; line: number }> = [];
  const documented = new Set<number>();
  
  // Find all JSDoc comments and mark their target lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for JSDoc comment blocks
    if (line.trim().includes('/**')) {
      // Find the end of the JSDoc block
      let j = i;
      while (j < lines.length && !lines[j].includes('*/')) {
        j++;
      }
      if (j < lines.length) {
        // Mark the next non-empty line as documented
        for (let k = j + 1; k < lines.length; k++) {
          if (lines[k].trim() && !lines[k].trim().startsWith('//')) {
            documented.add(k);
            break;
          }
        }
      }
    }
  }
  
  // Find functions, classes, interfaces, and exports
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Functions
    const functionMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (functionMatch) {
      items.push({ type: 'function', name: functionMatch[1], line: i });
    }
    
    // Arrow functions assigned to variables
    const arrowFunctionMatch = line.match(/(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s+)?\(/);
    if (arrowFunctionMatch) {
      items.push({ type: 'function', name: arrowFunctionMatch[1], line: i });
    }
    
    // Methods in classes
    const methodMatch = line.match(/^\s*(?:public\s+|private\s+|protected\s+)?(?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (methodMatch && !line.includes('function') && !line.includes('=')) {
      items.push({ type: 'function', name: methodMatch[1], line: i });
    }
    
    // Classes
    const classMatch = line.match(/(?:export\s+)?class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (classMatch) {
      items.push({ type: 'class', name: classMatch[1], line: i });
    }
    
    // Interfaces
    const interfaceMatch = line.match(/(?:export\s+)?interface\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (interfaceMatch) {
      items.push({ type: 'interface', name: interfaceMatch[1], line: i });
    }
    
    // Type aliases
    const typeMatch = line.match(/(?:export\s+)?type\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (typeMatch) {
      items.push({ type: 'export', name: typeMatch[1], line: i });
    }
  }
  
  // Calculate coverage
  const undocumentedItems = items
    .filter(item => !documented.has(item.line))
    .map(item => ({
      type: item.type as 'function' | 'class' | 'interface' | 'export',
      name: item.name,
      line: item.line + 1 // 1-based line numbers
    }));
  
  const documentedCount = items.length - undocumentedItems.length;
  const coverage = items.length > 0 ? (documentedCount / items.length) * 100 : 100;
  
  return {
    file: basename(filePath),
    totalItems: items.length,
    documentedItems: documentedCount,
    coverage,
    undocumentedItems
  };
}

async function checkFiles() {
  const filesToCheck = [
    'src/workflows/intelligent-doc-import.ts',
    'src/core/document-processor.ts',
    'src/database/managers/document-manager.ts',
    'src/coordination/workflows/workflow-gate-request.ts',
    'test-existing-repo-import.ts',
    'import-singularity-docs.ts',
    'demo-repo-import.ts'
  ];
  
  console.log('📋 TSDoc/JSDoc Coverage Report');
  console.log('===============================\n');
  
  let totalItems = 0;
  let totalDocumented = 0;
  const results: CoverageResult[] = [];
  
  for (const file of filesToCheck) {
    try {
      const result = await checkTSDocCoverage(file);
      results.push(result);
      
      totalItems += result.totalItems;
      totalDocumented += result.documentedItems;
      
      const statusIcon = result.coverage >= 80 ? '✅' : result.coverage >= 60 ? '⚠️' : '❌';
      
      console.log(`${statusIcon} ${result.file}`);
      console.log(`   Coverage: ${result.coverage.toFixed(1)}% (${result.documentedItems}/${result.totalItems})`);
      
      if (result.undocumentedItems.length > 0) {
        console.log('   Missing documentation:');
        result.undocumentedItems.slice(0, 5).forEach(item => {
          console.log(`     • ${item.type}: ${item.name} (line ${item.line})`);
        });
        if (result.undocumentedItems.length > 5) {
          console.log(`     ... and ${result.undocumentedItems.length - 5} more`);
        }
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${file} - Error: ${error.message}\n`);
    }
  }
  
  // Overall summary
  const overallCoverage = totalItems > 0 ? (totalDocumented / totalItems) * 100 : 100;
  
  console.log('📊 Overall Summary');
  console.log('==================');
  console.log(`Total items analyzed: ${totalItems}`);
  console.log(`Documented items: ${totalDocumented}`);
  console.log(`Overall coverage: ${overallCoverage.toFixed(1)}%`);
  
  if (overallCoverage >= 80) {
    console.log('🎉 Excellent documentation coverage!');
  } else if (overallCoverage >= 60) {
    console.log('⚠️  Good coverage, but could be improved.');
  } else {
    console.log('❌ Poor coverage, needs significant improvement.');
  }
  
  console.log('\n📋 Recommendations:');
  
  const needsImprovement = results.filter(r => r.coverage < 80);
  if (needsImprovement.length > 0) {
    console.log('Files needing documentation improvements:');
    needsImprovement.forEach(result => {
      console.log(`• ${result.file}: Add ${result.undocumentedItems.length} missing docs`);
    });
  } else {
    console.log('✅ All files have good documentation coverage (80%+)');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  checkFiles().catch(console.error);
}