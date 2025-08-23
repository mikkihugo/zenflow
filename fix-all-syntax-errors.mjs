#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';

console.log('🔧 Comprehensive TypeScript Syntax Error Fix Script');
console.log('====================================================');

// Get all TypeScript files that need fixing
const tsFiles = glob.sync('apps/claude-code-zen-server/src/**/*.ts', { 
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
});

console.log(`📁 Found ${tsFiles.length} TypeScript files to process`);

let filesFixed = 0;
let totalErrors = 0;

for (const file of tsFiles) {
  try {
    console.log(`🔍 Processing: ${file}`);
    
    let content = readFileSync(file, 'utf8');
    let originalContent = content;
    let hasChanges = false;

    // Fix common syntax errors pattern by pattern
    
    // 1. Fix unterminated string literals with semicolons
    content = content.replace(/(['"`])([^'"`]*?)(?<!\\);/g, (match, quote, text) => {
      if (text.includes('\n')) return match; // Skip multi-line strings
      return `${quote}${text}${quote};`;
    });
    
    // 2. Fix concatenated import statements  
    content = content.replace(/import\s*\{([^}]*)\}\s*from\s*['"][^'"]*['"];?\s*import/g, (match, imports) => {
      // Split concatenated imports properly
      const cleanImports = imports.split(',').map(imp => imp.trim()).filter(Boolean);
      const firstPart = match.split('import')[0];
      const remaining = 'import' + match.split('import').slice(2).join('import');
      return firstPart + '\n\n' + remaining;
    });

    // 3. Fix string concatenation issues
    content = content.replace(/([^\\])(['"`])([^'"`]*?)(?<!\\)\1(?!\s*[;,})\]])/g, '$1$2$3$2');
    
    // 4. Fix object/interface syntax
    content = content.replace(/\{\s*([^:}]+):\s*([^;,}]+);\s*([^:}]+):\s*([^;,}]+);\s*\}/g, 
      '{\n  $1: $2;\n  $3: $4;\n}');

    // 5. Fix enum syntax
    content = content.replace(/enum\s+(\w+)\s*\{\s*([^}]+)\s*\}/g, (match, enumName, enumBody) => {
      const members = enumBody.split(/[,;]/).map(member => member.trim()).filter(Boolean);
      const formattedMembers = members.map(member => {
        if (member.includes('=')) {
          return `  ${member.replace(/\s*=\s*/, ' = ')},`;
        } else {
          return `  ${member},`;
        }
      }).join('\n');
      return `enum ${enumName} {\n${formattedMembers}\n}`;
    });

    // 6. Fix method signatures
    content = content.replace(/(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*([^{;]+)\s*\{/g, 
      '$1($2): $3 {');

    // 7. Fix template literal issues
    content = content.replace(/`([^`]*?)(?<!\\)'/g, '`$1`');
    content = content.replace(/`([^`]*?)(?<!\\)"/g, '`$1`');

    // 8. Fix array/object literal syntax
    content = content.replace(/\[\s*([^[\]]+)\s*([^[\]]+)\s*\]/g, (match, first, second) => {
      if (first.includes("'") || first.includes('"') || first.includes('`')) {
        return `[${first.trim()}, ${second.trim()}]`;
      }
      return match;
    });

    // 9. Fix export statements
    content = content.replace(/export\s*\{([^}]*)\}\s*(?!from)/g, (match, exports) => {
      const cleanExports = exports.split(',').map(exp => exp.trim()).filter(Boolean);
      if (cleanExports.length > 1) {
        return `export {\n  ${cleanExports.join(',\n  ')}\n}`;
      }
      return match;
    });

    // 10. Fix type definitions
    content = content.replace(/type\s+(\w+)\s*=\s*([^;]+);/g, (match, typeName, typeDefinition) => {
      if (typeDefinition.includes('|')) {
        const types = typeDefinition.split('|').map(t => t.trim()).filter(Boolean);
        return `type ${typeName} =\n  | ${types.join('\n  | ')};`;
      }
      return match;
    });

    // 11. Fix interface definitions
    content = content.replace(/interface\s+(\w+)\s*\{([^}]+)\}/g, (match, interfaceName, interfaceBody) => {
      const properties = interfaceBody.split(';').map(prop => prop.trim()).filter(Boolean);
      if (properties.length > 1) {
        const formattedProps = properties.map(prop => `  ${prop};`).join('\n');
        return `interface ${interfaceName} {\n${formattedProps}\n}`;
      }
      return match;
    });

    // 12. Fix function calls and parameters
    content = content.replace(/(\w+)\s*\(\s*([^)]*?)\s*,\s*([^)]*?)\s*,\s*([^)]*?)\s*\)/g, 
      '$1(\n  $2,\n  $3,\n  $4\n)');

    // 13. Clean up extra semicolons and commas
    content = content.replace(/;;+/g, ';');
    content = content.replace(/,,+/g, ',');
    content = content.replace(/\s*;\s*\}/g, '\n}');
    content = content.replace(/\s*,\s*\}/g, '\n}');

    // 14. Fix line breaks and indentation
    content = content.replace(/\{\s*([^{}]*)\s*\}/g, (match, body) => {
      if (body.length > 50 || body.includes(',')) {
        return `{\n  ${body.replace(/,\s*/g, ',\n  ')}\n}`;
      }
      return match;
    });

    // 15. Fix catch/finally blocks
    content = content.replace(/\}\s*catch\s*\(/g, '} catch (');
    content = content.replace(/\}\s*finally\s*\{/g, '} finally {');

    // Check if any changes were made
    if (content !== originalContent) {
      hasChanges = true;
      writeFileSync(file, content, 'utf8');
      console.log(`  ✅ Fixed syntax errors in ${file}`);
      filesFixed++;
    } else {
      console.log(`  ✨ No changes needed for ${file}`);
    }

  } catch (error) {
    console.error(`  ❌ Error processing ${file}:`, error.message);
    totalErrors++;
  }
}

console.log('\n📊 Summary:');
console.log(`  Files processed: ${tsFiles.length}`);
console.log(`  Files fixed: ${filesFixed}`);
console.log(`  Errors encountered: ${totalErrors}`);

// Run type check to see remaining issues
console.log('\n🔍 Running final type check...');
try {
  execSync('cd apps/claude-code-zen-server && npm run type-check', { stdio: 'pipe' });
  console.log('✅ All TypeScript errors resolved!');
} catch (error) {
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
  const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
  console.log(`⚠️  ${errorCount} TypeScript errors remaining`);
  
  // Show first 20 errors for analysis
  const lines = errorOutput.split('\n');
  const errorLines = lines.filter(line => line.includes('error TS')).slice(0, 20);
  console.log('\n🔍 First 20 remaining errors:');
  errorLines.forEach(line => console.log(`  ${line}`));
}

console.log('\n🎉 Comprehensive syntax fix complete!');