#!/usr/bin/env node

/**
 * Simple bulk import path fixer for 1-error Module Resolution files
 * Runs in parallel with main complex fixer
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Common import path fixes
const commonFixes = [
  // Fix relative path issues
  { from: "from '../core/logger'", to: "from '../../core/logger'" },
  { from: "from '../config'", to: "from '../../config'" },
  { from: "from '../types'", to: "from '../../types'" },
  { from: "from '../utils'", to: "from '../../utils'" },
  { from: "import '../core/logger'", to: "import '../../core/logger'" },
  { from: "import '../config'", to: "import '../../config'" },
];

async function getOneErrorFiles() {
  return new Promise((resolve, reject) => {
    exec('npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS2307"', (error, stdout, stderr) => {
      if (error && !stdout) {
        reject(error);
        return;
      }

      const files = [];
      const lines = stdout.split('\n').filter((line) => line.includes('error TS2307'));

      for (const line of lines) {
        const match = line.match(/^src\/[^(]+/);
        if (match) {
          files.push(match[0]);
        }
      }

      // Count errors per file
      const fileCounts = {};
      files.forEach((file) => {
        fileCounts[file] = (fileCounts[file] || 0) + 1;
      });

      // Return only 1-error files
      const oneErrorFiles = Object.entries(fileCounts)
        .filter(([_, count]) => count === 1)
        .map(([file]) => file);

      resolve(oneErrorFiles);
    });
  });
}

async function fixSimpleImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    for (const fix of commonFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(fix.from, fix.to);
        fixed = true;
      }
    }

    if (fixed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.log(`❌ Failed: ${path.basename(filePath)} - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Bulk Import Fixer - Simple Module Resolution fixes');
  console.log('⚡ Running in parallel with complex fixer...\n');

  try {
    const oneErrorFiles = await getOneErrorFiles();
    console.log(`📊 Found ${oneErrorFiles.length} files with single errors`);

    let fixed = 0;
    for (const file of oneErrorFiles.slice(0, 20)) {
      // Limit to 20 files
      if (await fixSimpleImports(file)) {
        fixed++;
      }
    }

    console.log(
      `\n🎉 Bulk fixes complete: ${fixed}/${oneErrorFiles.slice(0, 20).length} files fixed`
    );
  } catch (error) {
    console.error('❌ Bulk fixer error:', error.message);
  }
}

main();
