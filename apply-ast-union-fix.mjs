/**
 * Batch AST transformation for union type corruption fixing
 * Applies union-ast-transform.mjs to all TypeScript files in the project
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { transformFile } from './union-ast-transform.mjs';

async function main() {
  console.log('🔧 Starting AST-based union type corruption fix...\n');
  
  // Find all TypeScript files in the project
  const pattern = 'apps/claude-code-zen-server/src/**/*.ts';
  console.log(`📁 Searching for files with pattern: ${pattern}`);
  
  const files = await glob(pattern, { 
    cwd: '/home/mhugo/code/claude-code-zen',
    absolute: true 
  });
  
  console.log(`📄 Found ${files.length} TypeScript files\n`);
  
  let processedCount = 0;
  let fixedCount = 0;
  let errorCount = 0;
  
  // Process files in batches to avoid overwhelming the system
  const batchSize = 10;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)} (${batch.length} files):`);
    
    const promises = batch.map(async (filePath) => {
      try {
        const wasFixed = await transformFile(filePath);
        processedCount++;
        if (wasFixed) {
          fixedCount++;
        }
        return { filePath, success: true, fixed: wasFixed };
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return { filePath, success: false, error: error.message };
      }
    });
    
    await Promise.all(promises);
    
    // Show progress
    console.log(`   Progress: ${processedCount}/${files.length} files processed`);
  }
  
  console.log('\n📊 AST Union Fix Results:');
  console.log(`   📄 Files processed: ${processedCount}`);
  console.log(`   ✅ Files fixed: ${fixedCount}`);
  console.log(`   ❌ Files with errors: ${errorCount}`);
  console.log(`   📈 Success rate: ${((processedCount - errorCount) / processedCount * 100).toFixed(1)}%`);
  
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
        if (code === 0) {
          console.log('🎉 TypeScript compilation successful! All union types fixed!');
        } else {
          console.log('📊 TypeScript compilation status:');
          const output = stdout + stderr;
          
          // Count remaining errors
          const errorLines = output.split('\n').filter(line => 
            line.includes('error TS') || line.includes('Found ') && line.includes('error')
          );
          
          const errorCount = errorLines.length;
          if (errorCount > 0) {
            console.log(`   ⚠️  ${errorCount} TypeScript errors remain`);
            
            // Show union-related errors specifically
            const unionErrors = errorLines.filter(line => 
              line.includes('union') || line.includes('Union') || line.includes('|')
            ).slice(0, 5);
            
            if (unionErrors.length > 0) {
              console.log('\n🔍 Remaining union-related errors (sample):');
              unionErrors.forEach(error => console.log(`   ${error}`));
            }
          }
        }
        
        console.log('\n✨ AST transformation complete!');
        resolve();
      });
    });
  } else {
    console.log('\n💡 No files needed fixing. Union types may already be correct.');
    return Promise.resolve();
  }
}

// Run the transformation
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { main };