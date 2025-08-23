#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

// Find all TypeScript files in packages/foundation/src
const files = globSync('packages/foundation/src/**/*.ts');

let totalFixed = 0;

for (const filePath of files) {
  console.log(`Processing: ${filePath}`);
  
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix malformed union types like 'value1|value2|value3' -> 'value1' | 'value2' | 'value3'
  const unionTypePattern = /'([^']+\|[^']+)'/g;
  content = content.replace(unionTypePattern, (match, unionContent) => {
    if (!unionContent.includes(' | ')) {
      // Split by | and rejoin with proper TypeScript union syntax
      const values = unionContent.split('|').map(v => v.trim());
      const fixedUnion = values.map(v => `'${v}'`).join(' | ');
      console.log(`  Fixed: ${match} -> ${fixedUnion}`);
      modified = true;
      totalFixed++;
      return fixedUnion;
    }
    return match;
  });
  
  // Fix callable expression errors - remove extra parentheses
  const callablePattern = /(\w+(?:\.\w+)*)\(\)\(\)/g;
  content = content.replace(callablePattern, (match, baseName) => {
    console.log(`  Fixed callable: ${match} -> ${baseName}()`);
    modified = true;
    totalFixed++;
    return `${baseName}()`;
  });
  
  // Fix Array.from(...).values()() pattern
  const arrayFromPattern = /Array\.from\([^)]+\)\(\)/g;
  content = content.replace(arrayFromPattern, (match) => {
    const fixed = match.replace(/\(\)$/, '');
    console.log(`  Fixed Array.from: ${match} -> ${fixed}`);
    modified = true;
    totalFixed++;
    return fixed;
  });
  
  // Fix unterminated strings like let x = '; -> let x = '';
  const unterminatedPattern = /= '[^']*';(?=\s*$)/gm;
  content = content.replace(unterminatedPattern, (match) => {
    if (match.includes("= ';")) {
      const fixed = match.replace("= ';", "= '';");
      console.log(`  Fixed unterminated string: ${match} -> ${fixed}`);
      modified = true;
      totalFixed++;
      return fixed;
    }
    return match;
  });
  
  if (modified) {
    writeFileSync(filePath, content);
    console.log(`  ✅ Updated: ${filePath}`);
  }
}

console.log(`\n✅ Fixed ${totalFixed} TypeScript syntax issues across ${files.length} files.`);