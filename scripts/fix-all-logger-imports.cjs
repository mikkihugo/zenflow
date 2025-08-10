#!/usr/bin/env node

/**
 * Fix ALL core logger import issues across the entire codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Logger import patterns to fix
const loggerFixes = [
  { from: "from '../core/logger'", to: "from '../../core/logger'" },
  { from: "from '../core/logger';", to: "from '../../core/logger';" },
  { from: 'from "../core/logger"', to: 'from "../../core/logger"' },
  { from: 'from "../core/logger";', to: 'from "../../core/logger";' },
  { from: "import '../core/logger'", to: "import '../../core/logger'" },
  { from: "import '../core/logger';", to: "import '../../core/logger';" },
  { from: 'import "../core/logger"', to: 'import "../../core/logger"' },
  { from: 'import "../core/logger";', to: 'import "../../core/logger";' },

  // Fix other common depth issues
  { from: "from '../../../core/logger'", to: "from '../../core/logger'" },
  { from: "from '../../../../core/logger'", to: "from '../../core/logger'" },
  { from: "from './core/logger'", to: "from '../core/logger'" },
];

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

function fixLoggerImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    let fixCount = 0;

    for (const fix of loggerFixes) {
      if (content.includes(fix.from)) {
        const beforeCount = content.split(fix.from).length - 1;
        content = content.replaceAll(fix.from, fix.to);
        fixCount += beforeCount;
        fixed = true;
      }
    }

    if (fixed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.relative('.', filePath)}: ${fixCount} logger import fixes`);
      return fixCount;
    }

    return 0;
  } catch (error) {
    console.log(`❌ ${path.relative('.', filePath)}: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔧 BULK LOGGER IMPORT FIXER');
  console.log('⚡ Fixing ALL core logger import paths...\n');

  const allFiles = getAllTSFiles();
  console.log(`📊 Scanning ${allFiles.length} TypeScript files for logger imports\n`);

  let totalFiles = 0;
  let totalFixes = 0;

  for (const file of allFiles) {
    const fixes = fixLoggerImports(file);
    if (fixes > 0) {
      totalFiles++;
      totalFixes += fixes;
    }
  }

  console.log(`\n🎉 BULK LOGGER FIXES COMPLETE:`);
  console.log(`   📁 Files fixed: ${totalFiles}`);
  console.log(`   🔧 Total fixes: ${totalFixes}`);
  console.log(`   ⚡ Running in parallel with Stream A complex fixes!`);
}

main();
