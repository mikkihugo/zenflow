#!/usr/bin/env node
/**
 * Critical File TypeScript Syntax Fix Script
 * Targets the most important files causing build failures
 */

import fs from 'fs';
import path from 'path';

const criticalFiles = [
  'src/claude-zen-integrated.ts',
  'src/coordination/api.ts',
  'src/zen-orchestrator-integration.ts'
];

function fixTypeScriptSyntax(content) {
  let fixed = content;
  
  // Fix unterminated string literals
  fixed = fixed.replace(/'\s*$/gm, "'");
  fixed = fixed.replace(/"\s*$/gm, '"');
  fixed = fixed.replace(/`\s*$/gm, '`');
  
  // Fix single quotes that should be double quotes in certain contexts
  fixed = fixed.replace(/'\s*;$/gm, "';");
  
  // Fix concatenated import statements
  fixed = fixed.replace(/import\s*\{([^}]+)\}\s*from\s*(['"][^'"]*['"])\s*import/g, 
    "import {$1} from $2;\nimport");
  
  // Fix missing semicolons at end of statements
  fixed = fixed.replace(/(\w+|\)|\})\s*$/gm, '$1;');
  fixed = fixed.replace(/;+$/gm, ';');
  
  // Fix missing commas in object literals
  fixed = fixed.replace(/(\w+:\s*[^,\n}]+)\s*(\w+:)/gm, '$1,$2');
  
  // Fix enum definitions - ensure commas between values
  fixed = fixed.replace(/(=\s*'[^']*')\s+([A-Z_]+\s*=)/g, '$1,\n  $2');
  
  // Fix interface and class definitions
  fixed = fixed.replace(/(\w+)\s*\{\s*([^}]+)\s*\}/g, (match, name, body) => {
    const fixedBody = body.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith(',') && !trimmed.endsWith('{')) {
        return line + ';';
      }
      return line;
    }).join('\n');
    return `${name} {\n${fixedBody}\n}`;
  });
  
  // Fix method definitions
  fixed = fixed.replace(/(\w+)\s*\([^)]*\)\s*\{/g, '$1($2) {');
  
  // Fix template literals
  fixed = fixed.replace(/`([^`]*)\n([^`]*)`/gm, '`$1 $2`');
  
  // Fix object method shorthand
  fixed = fixed.replace(/(\w+)\s*\([^)]*\)\s*{/g, '$1($2) {');
  
  return fixed;
}

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), 'apps/claude-code-zen-server', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fixed = fixTypeScriptSyntax(content);
    
    if (content !== fixed) {
      fs.writeFileSync(fullPath, fixed, 'utf-8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔧 Starting critical TypeScript syntax fixes...\n');

criticalFiles.forEach(processFile);

console.log('\n✅ Critical file fixes completed!');