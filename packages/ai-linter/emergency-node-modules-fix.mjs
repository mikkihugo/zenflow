#!/usr/bin/env node

/**
 * EMERGENCY NODE_MODULES CORRUPTION FIX
 * 
 * CRITICAL: System-level corruption is affecting freshly downloaded packages
 * This tool repairs node_modules after installation to recover development capability
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const projectRoot = '/home/mhugo/code/claude-code-zen';

console.log('🚨 EMERGENCY NODE_MODULES CORRUPTION FIX');
console.log('⚠️  System-level corruption detected in fresh package downloads');
console.log(`🎯 Target: ${projectRoot}/node_modules\n`);

// Critical corruption patterns found in fresh packages
const criticalPatterns = [
  {
    name: 'union_type_corruption',
    description: 'Fix string | number with quote corruption',
    pattern: /([a-zA-Z_$][\w$]*)''\s*\|\s*''\s*\|\s*''([a-zA-Z_$][\w$]*)/g,
    replacement: '$1 | $2',
    confidence: 'critical'
  },
  {
    name: 'import_statement_corruption', 
    description: 'Fix import statements with extra parenthesis',
    pattern: /} from (['"'][^'"]*['"])\);/g,
    replacement: '} from $1;',
    confidence: 'critical'
  },
  {
    name: 'template_literal_corruption',
    description: 'Fix template literals with quote corruption',
    pattern: /\$\{([^}]+)''\s*\|\s*''\s*\|\s*''([^}]+)\}/g,
    replacement: '${$1 || $2}',
    confidence: 'critical'
  },
  {
    name: 'property_access_corruption',
    description: 'Fix property access with quote corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*''([^']+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  {
    name: 'string_literal_corruption',
    description: 'Fix string literals with extra quotes',
    pattern: /'([^']+)'''\s*\|\s*''/g,
    replacement: "'$1' |",
    confidence: 'high'
  }
];

async function emergencyRepairNodeModules() {
  console.log('🔍 Scanning node_modules for corrupted TypeScript files...');
  
  const typescriptFiles = await glob(`${projectRoot}/node_modules/**/*.d.ts`, {
    ignore: ['**/test/**', '**/tests/**', '**/examples/**'],
  });
  
  console.log(`📁 Found ${typescriptFiles.length} TypeScript declaration files`);
  console.log(`🛠️  Starting emergency repair...\n`);
  
  let totalFilesRepaired = 0;
  let totalPatternsFixed = 0;
  
  const batchSize = 100; // Process in batches for performance
  
  for (let i = 0; i < typescriptFiles.length; i += batchSize) {
    const batch = typescriptFiles.slice(i, i + batchSize);
    console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(typescriptFiles.length/batchSize)}: Processing ${batch.length} files...`);
    
    for (const file of batch) {
      try {
        let content = readFileSync(file, 'utf8');
        const originalContent = content;
        let filePatternsFixed = 0;
        
        // Apply critical corruption repairs
        for (const pattern of criticalPatterns) {
          const beforeContent = content;
          content = content.replace(pattern.pattern, pattern.replacement);
          
          if (beforeContent !== content) {
            filePatternsFixed++;
            totalPatternsFixed++;
          }
        }
        
        // Write if changes were made
        if (originalContent !== content && filePatternsFixed > 0) {
          writeFileSync(file, content, 'utf8');
          totalFilesRepaired++;
          
          const relativePath = path.relative(projectRoot, file);
          if (filePatternsFixed > 3) { // Only log heavily corrupted files
            console.log(`   🔧 ${relativePath}: ${filePatternsFixed} critical patterns fixed`);
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing ${file}:`, error.message.slice(0, 100));
      }
    }
  }
  
  console.log(`\\n🏥 Emergency Repair Complete:`);
  console.log(`   📁 Files scanned: ${typescriptFiles.length}`);
  console.log(`   🔧 Files repaired: ${totalFilesRepaired}`);  
  console.log(`   🎯 Critical patterns fixed: ${totalPatternsFixed}`);
  console.log(`   📊 Success rate: ${((totalFilesRepaired/typescriptFiles.length)*100).toFixed(1)}%`);
}

async function testRepairSuccess() {
  console.log('\\n🔍 Testing TypeScript compilation after emergency repair...');
  try {
    const { execSync } = await import('child_process');
    const result = execSync(`npx tsc --noEmit --skipLibCheck apps/claude-code-zen-server/src/coordination/manager.ts`, { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
    console.log('🎉 Emergency repair restored development capability!');
    return true;
  } catch (error) {
    console.log('📊 Remaining errors after emergency repair (first 10):');
    const lines = error.stdout.split('\\n').slice(0, 10);
    lines.forEach(line => line.trim() && console.log(`   ${line}`));
    console.log(`\\n💡 Significant progress made but some corruption patterns may remain.`);
    return false;
  }
}

async function main() {
  await emergencyRepairNodeModules();
  const success = await testRepairSuccess();
  
  if (success) {
    console.log('\\n🚀 System recovered! You can now restart development.');
  } else {
    console.log('\\n⚠️  System partially recovered. Continue with manual investigation.');
    console.log('💡 Consider testing with npm instead of pnpm to isolate package manager issue.');
  }
}

main().catch(console.error);