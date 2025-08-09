#!/usr/bin/env node

/**
 * Automated Console-to-Logger Migration Script
 *
 * This script uses jscodeshift to automatically migrate console statements
 * to our centralized logging system across the entire codebase.
 *
 * Usage:
 *   node scripts/migrate-logging.cjs [--dry-run] [--pattern=src/file.ts]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const DEFAULT_PATTERN = 'src/**/*.ts';
const EXCLUDE_PATTERNS = [
  'src/__tests__/**/*', // Test files
  'src/**/examples/**/*', // Example files
  'scripts/**/*', // Build scripts
  '**/*.d.ts', // Type definitions
  '**/node_modules/**/*', // Dependencies
];

// Console method mappings
const CONSOLE_MAPPINGS = {
  log: 'info',
  info: 'info',
  warn: 'warn',
  error: 'error',
  debug: 'debug',
  trace: 'debug',
};

/**
 * jscodeshift transformer for console-to-logger migration
 */
const TRANSFORMER_CODE = `
const { getLogger } = require('./src/config/logging-config');

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const source = j(file.source);
  
  let hasConsoleUsage = false;
  let loggerImported = false;
  
  // Check if logger is already imported
  source.find(j.ImportDeclaration).forEach(path => {
    if (path.value.source.value.includes('logging-config') ||
        path.value.source.value.includes('logger')) {
      loggerImported = true;
    }
  });
  
  // Find console usage and track component name for logger
  const componentName = file.path
    .replace(/.*\\/src\\//, '')
    .replace(/\\.ts$/, '')
    .replace(/\\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '');
  
  // Transform console statements
  source.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'console' }
    }
  }).replaceWith(path => {
    hasConsoleUsage = true;
    
    const method = path.value.callee.property.name;
    const args = path.value.arguments;
    
    // Map console methods to logger methods
    const loggerMethod = ${JSON.stringify(CONSOLE_MAPPINGS)}[method] || 'info';
    
    // Transform arguments to structured logging
    let newArgs = [...args];
    
    // If first argument is a string and we have more arguments,
    // convert to structured logging format
    if (args.length > 1 && args[0].type === 'Literal' && typeof args[0].value === 'string') {
      const message = args[0];
      const data = args.slice(1);
      
      if (data.length === 1) {
        // Single additional argument - add as metadata
        newArgs = [message, data[0]];
      } else if (data.length > 1) {
        // Multiple arguments - create data object
        const dataObject = j.objectExpression(
          data.map((arg, index) => 
            j.property('init', j.identifier('arg' + index), arg)
          )
        );
        newArgs = [message, dataObject];
      }
    }
    
    return j.callExpression(
      j.memberExpression(j.identifier('logger'), j.identifier(loggerMethod)),
      newArgs
    );
  });
  
  // Add logger import if we found console usage and logger not already imported
  if (hasConsoleUsage && !loggerImported) {
    // Calculate relative path to logging-config
    const depth = (file.path.match(/\\/src\\//g) || []).length;
    const relativePath = depth > 0 ? '../'.repeat(depth - 1) + 'config/logging-config' : './config/logging-config';
    
    const importStatement = j.importDeclaration(
      [j.importSpecifier(j.identifier('getLogger'))],
      j.literal(relativePath)
    );
    
    const loggerDeclaration = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier('logger'),
        j.callExpression(j.identifier('getLogger'), [j.literal(componentName)])
      )
    ]);
    
    // Add imports at the top
    const body = source.find(j.Program).get('body');
    body.unshift(loggerDeclaration);
    body.unshift(importStatement);
  }
  
  return hasConsoleUsage ? source.toSource() : null;
};
`;

/**
 * Get transformer file path
 */
function getTransformerPath() {
  return path.join(__dirname, 'console-to-logger-transform.cjs');
}

/**
 * Get files to transform
 */
function getFilesToTransform(pattern) {
  const files = glob.sync(pattern, {
    ignore: EXCLUDE_PATTERNS,
    absolute: true,
  });

  // Filter to only files that actually contain console statements
  return files.filter((file) => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      // Exclude commented console statements by looking for uncommented ones
      const lines = content.split('\n');
      return lines.some((line) => {
        const trimmed = line.trim();
        // Skip commented lines
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return false;
        }
        // Skip .catch(console.error) patterns - these are valid error handling
        if (/\.catch\(console\.(error|warn|log)\)/.test(line)) {
          return false;
        }
        // Skip console statements in HTML/JavaScript template strings (client-side code)
        if (
          line.includes('<script>') ||
          line.includes('socket.on(') ||
          line.includes('</script>')
        ) {
          return false;
        }
        // Skip object property assignments with console methods (fallback loggers)
        if (
          /\s*(debug|info|warn|error|log|trace):\s*console\.(debug|info|warn|error|log|trace)/.test(
            line
          )
        ) {
          return false;
        }
        return /console\.(log|info|warn|error|debug|trace)/.test(line);
      });
    } catch (error) {
      return false;
    }
  });
}

/**
 * Run jscodeshift transformation
 */
function runTransformation(files, transformerPath, dryRun = false) {
  if (files.length === 0) {
    console.log('✅ No files with console statements found!');
    return;
  }

  console.log(`🔄 Transforming ${files.length} files with console statements...`);

  const command = [
    'npx jscodeshift',
    `--transform=${transformerPath}`,
    '--parser=tsx',
    '--extensions=ts,tsx',
    dryRun ? '--dry' : '',
    '--print',
    '--verbose=2',
    files.join(' '),
  ]
    .filter(Boolean)
    .join(' ');

  try {
    console.log(`📝 Running: ${command}`);
    const output = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    console.log('✅ Transformation completed successfully!');
    console.log(output);

    return true;
  } catch (error) {
    console.error('❌ Transformation failed:');
    console.error(error.stdout);
    console.error(error.stderr);
    return false;
  }
}

/**
 * Validate results
 */
function validateResults(pattern) {
  console.log('🔍 Validating transformation results...');

  const remainingFiles = getFilesToTransform(pattern);
  const totalFiles = glob.sync(pattern, { ignore: EXCLUDE_PATTERNS }).length;

  console.log(`📊 Results:`);
  console.log(`   Total TypeScript files: ${totalFiles}`);
  console.log(`   Files with console statements: ${remainingFiles.length}`);
  console.log(
    `   Migration progress: ${Math.round((1 - remainingFiles.length / totalFiles) * 100)}%`
  );

  if (remainingFiles.length > 0) {
    console.log(`⚠️  Files still needing migration:`);
    remainingFiles.slice(0, 10).forEach((file) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`   - ${relativePath}`);
    });

    if (remainingFiles.length > 10) {
      console.log(`   ... and ${remainingFiles.length - 10} more files`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const patternArg = args.find((arg) => arg.startsWith('--pattern='));
  const pattern = patternArg ? patternArg.split('=')[1] : DEFAULT_PATTERN;

  console.log('🚀 Claude-Zen Automated Logging Migration');
  console.log(`📁 Pattern: ${pattern}`);
  console.log(`🔍 Dry run: ${dryRun ? 'Yes' : 'No'}`);
  console.log();

  // Check dependencies
  try {
    execSync('npx jscodeshift --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ jscodeshift not found. Installing...');
    try {
      execSync('npm install jscodeshift', { stdio: 'inherit' });
    } catch (installError) {
      console.error(
        '❌ Failed to install jscodeshift. Please install manually: npm install jscodeshift'
      );
      process.exit(1);
    }
  }

  // Get files to transform
  const files = getFilesToTransform(pattern);
  console.log(`📊 Found ${files.length} files with console statements`);

  if (files.length === 0) {
    console.log('✅ No console statements found! Migration already complete.');
    return;
  }

  // Show sample files
  console.log('📋 Sample files to transform:');
  files.slice(0, 5).forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`   - ${relativePath}`);
  });

  if (files.length > 5) {
    console.log(`   ... and ${files.length - 5} more files`);
  }
  console.log();

  // Get transformer and run
  const transformerPath = getTransformerPath();

  try {
    const success = runTransformation(files, transformerPath, dryRun);

    if (success && !dryRun) {
      validateResults(pattern);
      console.log();
      console.log('🎉 Automated logging migration completed!');
      console.log('💡 Next steps:');
      console.log('   1. Review transformed files for correctness');
      console.log('   2. Run tests: npm test');
      console.log('   3. Check builds: npm run build');
      console.log(
        '   4. Commit changes: git add . && git commit -m "Auto-migrate console to structured logging"'
      );
    }
  } finally {
    // Cleanup temporary transformer
    try {
      fs.unlinkSync(transformerPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Handle CLI usage
if (require.main === module) {
  main();
}

module.exports = {
  getFilesToTransform,
  runTransformation,
  validateResults,
  CONSOLE_MAPPINGS,
};
