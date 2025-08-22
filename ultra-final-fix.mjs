/**
 * Ultra Final TypeScript Corruption Fix
 * Handles complex corruption patterns including conditional logic and malformed strings
 */

import fs from 'fs';
import { glob } from 'glob';

const advancedCorruptionPatterns = [
  {
    name: 'conditional_string_corruption',
    description: 'Fix process.env.DEBUG_AUTH\' | \' | \'process.env.NODE_ENV ===\'development\'',
    pattern: /process\.env\.[A-Z_]+'\s*\|\s*'\s*\|\s*'process\.env\.[A-Z_]+\s*===\s*'[a-z]+'/g,
    replacement: (match) => {
      // Extract the environment variables and comparison
      if (match.includes('DEBUG_AUTH') && match.includes('development')) {
        return "process.env.DEBUG_AUTH || process.env.NODE_ENV === 'development'";
      }
      return match;
    }
  },
  {
    name: 'malformed_union_in_conditional',
    description: 'Fix complex conditional with malformed union syntax',
    pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\'\s*\|\s*'\s*\|\s*'([a-zA-Z_][a-zA-Z0-9_\.]*)\s*(===|==|!=|!==)\s*'([a-zA-Z]+)'/g,
    replacement: '$1 || $2 $3 \'$4\''
  },
  {
    name: 'incomplete_union_types',
    description: 'Fix incomplete union types like \'high | critical)',
    pattern: /'([^']+)\s+\|\s+([^')|]+)\);?/g,
    replacement: "'$1' | '$2');"
  },
  {
    name: 'malformed_closing_union',
    description: 'Fix \'value | other);',
    pattern: /'([^']+)\s*\|\s*([^')|]+)\);?/g,
    replacement: "'$1' | '$2');"
  },
  {
    name: 'broken_union_boundary_complex',
    description: 'Fix complex broken boundaries in longer unions',
    pattern: /'([^']+)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)\s*\|\s*([^')|]+)\);?/g,
    replacement: "'$1' | '$2' | '$3' | '$4');"
  },
  {
    name: 'type_annotation_corruption',
    description: 'Fix type annotations with malformed quotes',
    pattern: /:\s*'([^']+)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)\s*\|\s*([^')|]+)\);?/g,
    replacement: ": '$1' | '$2' | '$3' | '$4');"
  }
];

// Original patterns from previous fix
const originalPatterns = [
  {
    name: 'double_quote_end_corruption',
    pattern: /'([^']+)''/g,
    replacement: "'$1'"
  },
  {
    name: 'double_quote_start_corruption', 
    pattern: /''([^']+)'/g,
    replacement: "'$1'"
  },
  {
    name: 'triple_quote_corruption',
    pattern: /'([^']+)'''/g,
    replacement: "'$1'"
  },
  {
    name: 'union_boundary_corruption',
    pattern: /'([^']+)''\s*\|\s*''([^']+)'/g,
    replacement: "'$1' | '$2'"
  }
];

const allPatterns = [...advancedCorruptionPatterns, ...originalPatterns];

async function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;
    let hasChanges = false;
    
    for (const pattern of allPatterns) {
      if (typeof pattern.replacement === 'function') {
        // Handle function-based replacements
        const matches = [...content.matchAll(pattern.pattern)];
        if (matches.length > 0) {
          for (const match of matches) {
            const newValue = pattern.replacement(match[0], ...match.slice(1));
            content = content.replace(match[0], newValue);
            totalChanges++;
          }
          hasChanges = true;
        }
      } else {
        // Handle string-based replacements
        const beforeContent = content;
        content = content.replace(pattern.pattern, pattern.replacement);
        if (content !== beforeContent) {
          const matches = beforeContent.match(pattern.pattern);
          if (matches) {
            totalChanges += matches.length;
            hasChanges = true;
          }
        }
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`📝 Fixed ${filePath} (${totalChanges} changes)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Ultra Final TypeScript Corruption Fix\n');
  
  const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
    cwd: '/home/mhugo/code/claude-code-zen',
    absolute: true
  });
  
  console.log(`📄 Found ${files.length} TypeScript files\n`);
  
  let processedCount = 0;
  let fixedCount = 0;
  
  // Focus on files with known complex corruption first
  const priorityFiles = files.filter(file => 
    file.includes('auth-minimal') || 
    file.includes('coordination/') ||
    file.includes('interfaces.ts') ||
    file.includes('types/')
  );
  
  const regularFiles = files.filter(file => !priorityFiles.includes(file));
  const allFiles = [...priorityFiles, ...regularFiles];
  
  for (const filePath of allFiles) {
    const wasFixed = await fixFile(filePath);
    processedCount++;
    if (wasFixed) {
      fixedCount++;
    }
    
    // Show progress for priority files
    if (priorityFiles.includes(filePath)) {
      console.log(`   🎯 Priority file processed: ${processedCount}/${allFiles.length}`);
    }
  }
  
  console.log('\n📊 Ultra Final Results:');
  console.log(`   📄 Files processed: ${processedCount}`);
  console.log(`   ✅ Files fixed: ${fixedCount}`);
  
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
          console.log('🎉 TypeScript compilation SUCCESSFUL! All corruption fixed!');
        } else {
          const errorMatches = output.match(/error TS\d+:/g);
          const errorCount = errorMatches ? errorMatches.length : 0;
          
          console.log(`📊 TypeScript status: ${errorCount} errors remaining`);
          
          // Show sample of different error types
          const lines = output.split('\n').filter(line => line.includes('error TS')).slice(0, 5);
          if (lines.length > 0) {
            console.log('\n🔍 Sample remaining errors:');
            lines.forEach(line => console.log(`   ${line.trim()}`));
          }
        }
        
        console.log('\n✨ Ultra final fix complete!');
        resolve();
      });
    });
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});