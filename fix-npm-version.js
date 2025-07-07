#!/usr/bin/env node

/**
 * Script to ensure npm package has correct version
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing NPM Version Issue\n');

// 1. Check current versions
console.log('1️⃣ Checking versions...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`   package.json version: ${packageJson.version}`);

// Check source file versions
const sourceFiles = [
  'src/cli/simple-cli.ts',
  'src/cli/simple-cli.js',
  'src/cli/index.ts',
  'src/cli/index-remote.ts',
  'bin/claude-flow'
];

console.log('\n2️⃣ Checking source file versions:');
sourceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const versionMatch = content.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (versionMatch) {
      console.log(`   ${file}: ${versionMatch[1]}`);
    }
  }
});

// 3. Clear npm cache
console.log('\n3️⃣ Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('   ✅ npm cache cleared');
} catch (e) {
  console.log('   ⚠️  Failed to clear npm cache');
}

// 4. Clear npx cache
console.log('\n4️⃣ Clearing npx cache...');
try {
  const home = process.env.HOME || process.env.USERPROFILE;
  const npxCache = path.join(home, '.npm', '_npx');
  if (fs.existsSync(npxCache)) {
    execSync(`rm -rf ${npxCache}`, { stdio: 'inherit' });
    console.log('   ✅ npx cache cleared');
  }
} catch (e) {
  console.log('   ⚠️  Failed to clear npx cache');
}

// 5. Build fresh
console.log('\n5️⃣ Building fresh dist files...');
console.log('   Note: There may be TypeScript errors, but the version should be updated');
try {
  execSync('npm run build:ts', { stdio: 'inherit' });
} catch (e) {
  console.log('   ⚠️  Build had errors, but continuing...');
}

// 6. Check dist version
console.log('\n6️⃣ Checking dist file version:');
if (fs.existsSync('dist/cli/simple-cli.js')) {
  const distContent = fs.readFileSync('dist/cli/simple-cli.js', 'utf8');
  const distVersionMatch = distContent.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (distVersionMatch) {
    console.log(`   dist/cli/simple-cli.js: ${distVersionMatch[1]}`);
  }
}

console.log('\n✅ Version check complete!');
console.log('\n📝 Next steps:');
console.log('   1. If versions are correct locally, publish with: npm publish');
console.log('   2. After publishing, users should clear their cache:');
console.log('      - npm cache clean --force');
console.log('      - rm -rf ~/.npm/_npx');
console.log('   3. Then use: npx claude-flow@latest --version');
console.log('\n💡 The issue is that npm/npx caches the old version.');
console.log('   Publishing a new patch version (1.0.71) might be the best solution.');