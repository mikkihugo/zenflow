#!/usr/bin/env node

/**
 * PROPERLY fix logger imports based on actual file depth
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function calculateCorrectLoggerPath(filePath) {
  // Get relative path from src root
  const relativePath = path.relative('src', filePath);
  const depth = relativePath.split('/').length - 1; // -1 because file itself doesn't count

  if (depth === 0) {
    return './core/logger'; // Same level as core
  } else if (depth === 1) {
    return '../core/logger'; // One level deep
  } else {
    return '../'.repeat(depth) + 'core/logger'; // Multiple levels deep
  }
}

function getAllTSFiles() {
  try {
    const result = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' });
    return result
      .trim()
      .split('\n')
      .filter((file) => file && !file.includes('node_modules'));
  } catch (error) {
    console.error('Error finding TypeScript files:', error.message);
    return [];
  }
}

function fixLoggerImport(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const correctPath = calculateCorrectLoggerPath(filePath);

    // All possible wrong logger import patterns
    const loggerPatterns = [
      /from ['"]\.\.\/\.\.\/core\/logger['"];?/g,
      /from ['"]\.\.\/core\/logger['"];?/g,
      /from ['"]\.\.\/\.\.\/\.\.\/core\/logger['"];?/g,
      /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/core\/logger['"];?/g,
      /from ['"]\.\/core\/logger['"];?/g,
      /import ['"]\.\.\/\.\.\/core\/logger['"];?/g,
      /import ['"]\.\.\/core\/logger['"];?/g,
      /import ['"]\.\.\/\.\.\/\.\.\/core\/logger['"];?/g,
    ];

    let fixed = false;
    let fixCount = 0;

    for (const pattern of loggerPatterns) {
      if (pattern.test(content)) {
        const matches = content.match(pattern);
        if (matches) {
          fixCount += matches.length;
          // Replace with correct path, preserving quote style and semicolon
          content = content.replace(pattern, (match) => {
            const hasQuotes = match.includes('"');
            const hasSemicolon = match.endsWith(';');
            const quote = hasQuotes ? '"' : "'";
            const semicolon = hasSemicolon ? ';' : '';
            return `from ${quote}${correctPath}${quote}${semicolon}`;
          });
          fixed = true;
        }
      }
    }

    if (fixed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.relative('.', filePath)}: ${fixCount} fixes → ${correctPath}`);
      return fixCount;
    }

    return 0;
  } catch (error) {
    console.log(`❌ ${path.relative('.', filePath)}: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔧 SMART LOGGER IMPORT FIXER');
  console.log('⚡ Calculating correct paths based on file depth...\n');

  const allFiles = getAllTSFiles();
  console.log(`📊 Scanning ${allFiles.length} TypeScript files\n`);

  let totalFiles = 0;
  let totalFixes = 0;

  for (const file of allFiles) {
    const fixes = fixLoggerImport(file);
    if (fixes > 0) {
      totalFiles++;
      totalFixes += fixes;
    }
  }

  console.log(`\n🎉 SMART LOGGER FIXES COMPLETE:`);
  console.log(`   📁 Files fixed: ${totalFiles}`);
  console.log(`   🔧 Total fixes: ${totalFixes}`);
}

main();
