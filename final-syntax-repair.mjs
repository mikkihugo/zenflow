#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, 'apps/claude-code-zen-server/src');

// Comprehensive final repair patterns to fix remaining syntax issues
const finalRepairs = [
  // Fix template literal issues - convert all to string concatenation to avoid Unicode issues
  { regex: /`([^`\$]*)\$\{([^}]+)\}([^`]*)`/g, replacement: "'$1' + $2 + '$3'" },
  { regex: /`([^`\$]+)`/g, replacement: "'$1'" },
  
  // Fix object property syntax with broken quotes
  { regex: /([a-zA-Z_$][a-zA-Z0-9_$]*)':/g, replacement: "$1:" },
  { regex: /'([a-zA-Z_$][a-zA-Z0-9_$]*):/g, replacement: "$1:" },
  
  // Fix Agent['status'] type syntax
  { regex: /Agent\['status,?\s*'\]'/g, replacement: "Agent['status']" },
  { regex: /Agent\['type,?\s*'\]'/g, replacement: "Agent['type']" },
  { regex: /Task\['status,?\s*'\]'/g, replacement: "Task['status']" },
  { regex: /Task\['priority,?\s*'\]'/g, replacement: "Task['priority']" },
  
  // Fix broken function syntax
  { regex: /\(\s*_?([a-zA-Z_$][a-zA-Z0-9_$]*')\s*:/g, replacement: "($_$1:" },
  { regex: /_pa'ams:/g, replacement: "_params:" },
  
  // Fix method calls with broken quotes
  { regex: /throw new Error\('([^']+)'\)'/g, replacement: "throw new Error('$1');" },
  
  // Fix return type syntax
  { regex: /\):\s+\{/g, replacement: "): {" },
  
  // Fix string literal breaks in type guards
  { regex: /typeof obj\.\w+ === 'string'\s*'/g, replacement: match => match.replace("'", "") },
  { regex: /'code' in obj\s*'/g, replacement: "'code' in obj" },
  { regex: /'message' in obj\s*'/g, replacement: "'message' in obj" },
  
  // Fix broken function calls
  { regex: /return typeof obj\.\w+ === 'string'\s*'/g, replacement: match => match.replace("'", "") },
  
  // Fix unterminated string literals
  { regex: /(\w+\s*:\s*'[^']*)'?\s*$/gm, replacement: "$1'" },
  
  // Fix broken JSON-like syntax
  { regex: /,\s*'\]/g, replacement: "]" },
  { regex: /\[\s*'/g, replacement: "['" },
  
  // Fix return statements with broken syntax
  { regex: /return ([^;]+)'(\s*;?\s*$)/gm, replacement: "return $1;$2" },
  
  // Fix type annotation syntax
  { regex: /:\s*([A-Za-z_$][A-Za-z0-9_$<>[\]'|&\s]*)'(\s*[;,}])/g, replacement: ": $1$2" },
  
  // Fix parameter syntax
  { regex: /\(([^)]*')\):/g, replacement: match => match.replace("')", ")") },
  
  // Fix export syntax
  { regex: /export\s*\{\s*([^}]*)'([^}]*)\}/g, replacement: "export { $1$2 }" },
  
  // Fix method parameter lists with quotes
  { regex: /\(([^)]*),\s*'\]/g, replacement: "($1]" },
  
  // Fix object method syntax
  { regex: /(\w+)\s*\(\s*([^)]*)'(\s*\))/g, replacement: "$1($2$3" },
  
  // Clean up extra quotes around property names
  { regex: /'(\w+)':/g, replacement: "$1:" },
  
  // Fix broken conditional syntax
  { regex: /if\s*\(\s*([^)]+)'\s*\)/g, replacement: "if ($1)" },
  
  // Fix arrow function syntax
  { regex: /=>\s*\{([^}]*)'([^}]*)\}/g, replacement: "=> {$1$2}" }
];

function repairFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changesApplied = 0;
    
    // Apply all repairs
    for (const repair of finalRepairs) {
      const matches = content.match(repair.regex);
      if (matches) {
        content = content.replace(repair.regex, repair.replacement);
        changesApplied += matches.length;
      }
    }
    
    // Additional manual fixes for specific problematic patterns
    
    // Fix specific broken template literals
    content = content.replace(/import\.meta\.url === `file:\/\/\$\{process\.argv\[1\]\}`/g, 
                             "import.meta.url === 'file://' + process.argv[1]");
    
    // Fix specific console.log patterns
    content = content.replace(/console\.log\(`([^`]*)`\)/g, "console.log('$1')");
    
    // Fix logger patterns with template literals
    content = content.replace(/logger\.(info|error|warn|debug)\(`([^`\$]*)\$\{([^}]+)\}([^`]*)`\)/g,
                             "logger.$1('$2' + $3 + '$4')");
    
    // Fix specific error patterns
    content = content.replace(/logger\.error\(`([^`\$]*)\$\{([^}]+)\}([^`]*)`\)/g,
                             "logger.error('$1' + $2 + '$3')");
    
    // Clean up any remaining malformed quotes
    content = content.replace(/([^\\])'/g, "$1'");
    content = content.replace(/^'/gm, "'");
    
    // Fix line endings and remove extra whitespace
    content = content.replace(/\r\n/g, '\n');
    content = content.replace(/[ \t]+$/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Repaired ${changesApplied} issues in ${path.relative(baseDir, filePath)}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error repairing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let filesProcessed = 0;
  let filesChanged = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = processDirectory(fullPath);
      filesProcessed += subResults.processed;
      filesChanged += subResults.changed;
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      filesProcessed++;
      filesChanged += repairFile(fullPath);
    }
  }
  
  return { processed: filesProcessed, changed: filesChanged };
}

console.log('🔧 Starting final TypeScript syntax repair...');
console.log(`📁 Processing: ${baseDir}`);

const results = processDirectory(baseDir);

console.log(`\n📊 Final Repair Summary:`);
console.log(`   Files processed: ${results.processed}`);
console.log(`   Files repaired: ${results.changed}`);

if (results.changed > 0) {
  console.log('\n🎯 Running final TypeScript validation...');
  
  // Run TypeScript check
  import('child_process').then(({ exec }) => {
    exec('npx tsc --noEmit --skipLibCheck', 
         { cwd: path.join(__dirname, 'apps/claude-code-zen-server') }, 
         (error, stdout, stderr) => {
           if (error) {
             console.log('\n⚠️ TypeScript errors remaining:');
             const lines = (stdout || stderr).split('\n').slice(0, 50); // First 50 lines
             console.log(lines.join('\n'));
           } else {
             console.log('\n🎉 All TypeScript syntax errors have been resolved!');
           }
         });
  });
} else {
  console.log('\n✨ No additional repairs needed.');
}