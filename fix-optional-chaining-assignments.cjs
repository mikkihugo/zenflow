#!/usr/bin/env node

/**
 * Quick fix for invalid optional chaining assignments
 * Fixes patterns like `obj?.prop = value` → `obj.prop = value`
 */

const fs = require('fs');
const path = require('path');

// Files that were failing in the transformer
const problematicFiles = ['src/optimization/benchmarks/performance-benchmarks.ts'];

function fixOptionalChainingAssignments(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix patterns like: obj?.prop = value
  // Handle bracket notation: obj?.[key] = value → obj[key] = value
  content = content.replace(/(\w+)\?\.\[([^\]]+)\]\s*=/g, '$1[$2] =');

  // Handle property access: obj?.prop = value → obj.prop = value
  content = content.replace(/(\w+)\?\.([\w]+)\s*=/g, '$1.$2 =');

  // Handle complex nested properties: this.results?.neural = value → this.results.neural = value
  content = content.replace(/([\w.]+)\?\.([\w]+)\s*=/g, '$1.$2 =');

  // Handle deep property chains: obj?.prop?.subprop = value → obj.prop.subprop = value
  content = content.replace(/([\w.]+)\?\.([\w.]+)\s*=/g, '$1.$2 =');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⚪ No issues: ${filePath}`);
    return false;
  }
}

console.log('🔧 Fixing invalid optional chaining assignments...\n');

let fixedCount = 0;
for (const file of problematicFiles) {
  if (fixOptionalChainingAssignments(file)) {
    fixedCount++;
  }
}

console.log(`\n📊 Summary: Fixed ${fixedCount} files`);
