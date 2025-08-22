/**
 * Final Union Type Quote Boundary Corruption Fix
 * Targets the exact corruption patterns found in the codebase
 */

import fs from 'fs';
import { glob } from 'glob';

// Specific patterns found in the codebase analysis
const unionCorruptionPatterns = [
  {
    name: 'double_quote_end_corruption',
    description: 'Fix \'value\'\' -> \'value\'',
    pattern: /'([^']+)''/g,
    replacement: "'$1'"
  },
  {
    name: 'double_quote_start_corruption', 
    description: 'Fix \'\'value\' -> \'value\'',
    pattern: /''([^']+)'/g,
    replacement: "'$1'"
  },
  {
    name: 'triple_quote_corruption',
    description: 'Fix \'value\'\'\' -> \'value\'',
    pattern: /'([^']+)'''/g,
    replacement: "'$1'"
  },
  {
    name: 'union_boundary_corruption',
    description: 'Fix \'high\'\' | \'\'medium\' -> \'high\' | \'medium\'',
    pattern: /'([^']+)''\s*\|\s*''([^']+)'/g,
    replacement: "'$1' | '$2'"
  },
  {
    name: 'triple_union_corruption',
    description: 'Fix \'a\'\' | \'\'b\'\' | \'\'c\' -> \'a\' | \'b\' | \'c\'',
    pattern: /'([^']+)''\s*\|\s*''([^']+)''\s*\|\s*''([^']+)'/g,
    replacement: "'$1' | '$2' | '$3'"
  },
  {
    name: 'quad_union_corruption',
    description: 'Fix 4-part union corruption',
    pattern: /'([^']+)''\s*\|\s*''([^']+)''\s*\|\s*''([^']+)''\s*\|\s*''([^']+)'/g,
    replacement: "'$1' | '$2' | '$3' | '$4'"
  }
];

async function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;
    
    for (const pattern of unionCorruptionPatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        const beforeCount = matches.length;
        content = content.replace(pattern.pattern, pattern.replacement);
        totalChanges += beforeCount;
        
        if (beforeCount > 0) {
          console.log(`  ✅ ${pattern.name}: ${beforeCount} fixes`);
        }
      }
    }
    
    if (totalChanges > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`📝 Fixed ${filePath} (${totalChanges} total changes)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Final Union Type Corruption Fix - Targeting Exact Patterns\n');
  
  const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
    cwd: '/home/mhugo/code/claude-code-zen',
    absolute: true
  });
  
  console.log(`📄 Found ${files.length} TypeScript files\n`);
  
  let processedCount = 0;
  let fixedCount = 0;
  
  // Process files in smaller batches for better control
  const batchSize = 5;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}:`);
    
    for (const filePath of batch) {
      const wasFixed = await fixFile(filePath);
      processedCount++;
      if (wasFixed) {
        fixedCount++;
      }
    }
    
    console.log(`   Progress: ${processedCount}/${files.length} files processed\n`);
  }
  
  console.log('📊 Final Results:');
  console.log(`   📄 Files processed: ${processedCount}`);
  console.log(`   ✅ Files fixed: ${fixedCount}`);
  console.log(`   📈 Fix rate: ${((fixedCount / processedCount) * 100).toFixed(1)}%`);
  
  if (fixedCount > 0) {
    console.log('\n🔍 Running TypeScript compilation check...');
    
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const tscCheck = spawn('npx', ['tsc', '--noEmit', '--project', 'apps/claude-code-zen-server/tsconfig.json'], {
        cwd: '/home/mhugo/code/claude-code-zen',
        stdio: 'pipe'
      });
      
      let stdout = '';
      let stderr = '';
      
      tscCheck.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      tscCheck.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      tscCheck.on('close', (code) => {
        const output = stdout + stderr;
        
        if (code === 0) {
          console.log('🎉 TypeScript compilation SUCCESSFUL! All union types fixed!');
        } else {
          // Count errors
          const errorMatches = output.match(/error TS\d+:/g);
          const errorCount = errorMatches ? errorMatches.length : 0;
          
          console.log(`📊 TypeScript status: ${errorCount} errors remaining`);
          
          // Show sample of remaining errors
          const lines = output.split('\n').filter(line => line.includes('error TS')).slice(0, 3);
          if (lines.length > 0) {
            console.log('\n🔍 Sample remaining errors:');
            lines.forEach(line => console.log(`   ${line.trim()}`));
          }
        }
        
        console.log('\n✨ Final union type fix complete!');
        resolve();
      });
    });
  } else {
    console.log('\n💡 No union type corruption found.');
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});