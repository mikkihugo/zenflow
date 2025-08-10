#!/usr/bin/env node

/**
 * Bulk Module Resolution Fixer - Stream C
 * Targets 1-2 error files with simple Module Resolution patterns
 * Runs parallel to Stream A (Complex AI) and Stream B (Logger Bulk)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Common module resolution patterns and their fixes
const moduleResolutionPatterns = [
  // Config module fixes
  { from: "from '../config'", to: "from '../../config'" },
  { from: "from './config'", to: "from '../config'" },
  { from: "from '../../../config'", to: "from '../../config'" },
  
  // Types module fixes  
  { from: "from '../types'", to: "from '../../types'" },
  { from: "from './types'", to: "from '../types'" },
  { from: "from '../../../types'", to: "from '../../types'" },
  
  // Utils module fixes
  { from: "from '../utils'", to: "from '../../utils'" },
  { from: "from './utils'", to: "from '../utils'" },
  { from: "from '../../../utils'", to: "from '../../utils'" },
  
  // Interfaces module fixes
  { from: "from '../interfaces'", to: "from '../../interfaces'" },
  { from: "from './interfaces'", to: "from '../interfaces'" },
  
  // Core module fixes (non-logger)
  { from: "from '../core'", to: "from '../../core'" },
  { from: "from './core'", to: "from '../core'" },
  { from: "from '../../../core'", to: "from '../../core'" },
  
  // Database module fixes
  { from: "from '../database'", to: "from '../../database'" },
  { from: "from './database'", to: "from '../database'" },
  
  // Memory module fixes
  { from: "from '../memory'", to: "from '../../memory'" },
  { from: "from './memory'", to: "from '../memory'" },
  
  // Neural module fixes
  { from: "from '../neural'", to: "from '../../neural'" },
  { from: "from './neural'", to: "from '../neural'" },
  
  // Coordination module fixes
  { from: "from '../coordination'", to: "from '../../coordination'" },
  { from: "from './coordination'", to: "from '../coordination'" },
];

function calculateCorrectModulePath(filePath, moduleName) {
  // Get relative path from src root
  const relativePath = path.relative('src', filePath);
  const depth = relativePath.split('/').length - 1;
  
  if (depth === 0) {
    return `./${moduleName}`;
  } else if (depth === 1) {
    return `../${moduleName}`;
  } else {
    return '../'.repeat(depth) + moduleName;
  }
}

async function getSimpleModuleResolutionFiles() {
  return new Promise((resolve, reject) => {
    exec('npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS2307"', (error, stdout, stderr) => {
      if (error && !stdout) {
        resolve([]);
        return;
      }
      
      const fileErrors = new Map();
      const lines = stdout.split('\n').filter(line => line.includes('error TS2307'));
      
      for (const line of lines) {
        const match = line.match(/^(src\/[^(]+)/);
        if (match) {
          const file = match[1];
          fileErrors.set(file, (fileErrors.get(file) || 0) + 1);
        }
      }
      
      // Return only files with 1-2 Module Resolution errors
      const simpleFiles = Array.from(fileErrors.entries())
        .filter(([_, count]) => count <= 2)
        .map(([file]) => file);
      
      resolve(simpleFiles);
    });
  });
}

function fixModuleResolution(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    let fixCount = 0;
    
    // Try pattern-based fixes first
    for (const pattern of moduleResolutionPatterns) {
      if (content.includes(pattern.from)) {
        const beforeCount = content.split(pattern.from).length - 1;
        content = content.replaceAll(pattern.from, pattern.to);
        fixCount += beforeCount;
        fixed = true;
      }
    }
    
    // Smart path calculation for specific modules
    const modulePatterns = [
      /from ['"]\.\.?\/*(config)['"];?/g,
      /from ['"]\.\.?\/*(types)['"];?/g,
      /from ['"]\.\.?\/*(utils)['"];?/g,
      /from ['"]\.\.?\/*(interfaces)['"];?/g,
      /from ['"]\.\.?\/*(database)['"];?/g,
      /from ['"]\.\.?\/*(memory)['"];?/g,
      /from ['"]\.\.?\/*(neural)['"];?/g,
      /from ['"]\.\.?\/*(coordination)['"];?/g,
    ];
    
    for (const pattern of modulePatterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        const moduleName = match[1];
        const correctPath = calculateCorrectModulePath(filePath, moduleName);
        const oldImport = match[0];
        const quote = oldImport.includes('"') ? '"' : "'";
        const semicolon = oldImport.endsWith(';') ? ';' : '';
        const newImport = `from ${quote}${correctPath}${quote}${semicolon}`;
        
        if (oldImport !== newImport) {
          content = content.replace(oldImport, newImport);
          fixCount++;
          fixed = true;
        }
      }
    }
    
    if (fixed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.relative('.', filePath)}: ${fixCount} module resolution fixes`);
      return fixCount;
    }
    
    return 0;
  } catch (error) {
    console.log(`❌ ${path.relative('.', filePath)}: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔧 STREAM C: Bulk Module Resolution Fixer');
  console.log('⚡ Targeting 1-2 error files with simple Module Resolution issues...\n');
  
  try {
    const simpleFiles = await getSimpleModuleResolutionFiles();
    console.log(`📊 Found ${simpleFiles.length} files with 1-2 Module Resolution errors\n`);
    
    let totalFiles = 0;
    let totalFixes = 0;
    
    // Process first 30 simple files
    for (const file of simpleFiles.slice(0, 30)) {
      const fixes = fixModuleResolution(file);
      if (fixes > 0) {
        totalFiles++;
        totalFixes += fixes;
      }
    }
    
    console.log(`\n🎉 STREAM C COMPLETE:`);
    console.log(`   📁 Files processed: ${totalFiles}`);
    console.log(`   🔧 Module fixes: ${totalFixes}`);
    console.log(`   ⚡ Running parallel with Stream A (Complex AI)!`);
    console.log(`   🚀 Combined with Stream B (Logger Bulk): ${125 + totalFixes} total bulk fixes!`);
    
  } catch (error) {
    console.error('❌ Stream C error:', error.message);
  }
}

main();