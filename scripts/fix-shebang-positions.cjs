#!/usr/bin/env node

/**
 * Fix shebang position issues in CLI files
 * Addresses TS18026: '#!' can only be used at the start of a file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing shebang position issues...\n');

// Get files with shebang position errors
const buildOutput = execSync('npm run build 2>&1 || true', { encoding: 'utf8' });
const shebangErrors = buildOutput
  .split('\n')
  .filter(line => line.includes("TS18026: '#!' can only be used at the start of a file"))
  .map(line => {
    const match = line.match(/^([^(]+)\(/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

const uniqueFiles = [...new Set(shebangErrors)];

console.log(`Found ${uniqueFiles.length} files with shebang position issues:`);
uniqueFiles.forEach(file => console.log(`  - ${file}`));

let fixedCount = 0;

uniqueFiles.forEach(filePath => {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    // Find the shebang line
    let shebangIndex = -1;
    let shebangLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#!')) {
        shebangIndex = i;
        shebangLine = lines[i];
        break;
      }
    }
    
    if (shebangIndex === -1) {
      console.log(`⚠️ No shebang found in: ${filePath}`);
      return;
    }
    
    if (shebangIndex === 0) {
      console.log(`✅ Shebang already at start: ${filePath}`);
      return;
    }
    
    // Remove shebang from current position
    lines.splice(shebangIndex, 1);
    
    // Add shebang at the beginning
    lines.unshift(shebangLine);
    
    // Remove any empty lines at the start after the shebang
    while (lines.length > 1 && lines[1].trim() === '') {
      lines.splice(1, 1);
    }
    
    const fixedContent = lines.join('\n');
    fs.writeFileSync(fullPath, fixedContent);
    
    console.log(`✅ Fixed shebang position: ${filePath}`);
    fixedCount++;
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed shebang positions in ${fixedCount} files`);

// Verify improvements
try {
  const newBuildOutput = execSync('npm run build 2>&1 || true', { encoding: 'utf8' });
  const remainingShebangErrors = newBuildOutput
    .split('\n')
    .filter(line => line.includes("TS18026: '#!' can only be used at the start of a file"))
    .length;
    
  console.log(`\n📊 Remaining shebang errors: ${remainingShebangErrors}`);
} catch (error) {
  console.log('⚠️ Could not verify improvements');
}