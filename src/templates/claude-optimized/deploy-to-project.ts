#!/usr/bin/env node

/**
 * Deploy Claude optimized template to a target project
 */

import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: deploy-to-project.ts <target-project-path>');
  process.exit(1);
}

const TARGET_PROJECT = args[0];
const SOURCE_DIR = path.join(__dirname, '.claude');
const TARGET_DIR = path.join(TARGET_PROJECT, '.claude');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

console.log('Claude Optimized Template Deployment');
console.log('====================================');
console.log(`Source: ${SOURCE_DIR}`);
console.log(`Target: ${TARGET_DIR}`);

// Check if target is a valid project
const projectFiles = ['package.json', 'tsconfig.json', 'node.json', 'go.mod', 'Cargo.toml', 'setup.py'];
const hasProjectFile = projectFiles.some(file => fs.existsSync(path.join(TARGET_PROJECT, file)));

if (!hasProjectFile) {
  console.warn('Warning: Target directory does not appear to be a project root.');
}

// Load manifest
let manifest: any;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
} catch (error) {
  console.error('Error reading manifest:', error);
  process.exit(1);
}

// Create target .claude directory
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Create directory structure
for (const dirInfo of manifest.directories || []) {
  const targetPath = path.join(TARGET_DIR, dirInfo.path);
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
    
    // Create README if specified
    const readmePath = path.join(targetPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      const dirName = path.basename(dirInfo.path);
      fs.writeFileSync(readmePath, `# ${dirName}\n\nThis directory will be populated during usage.\n`);
    }
  }
}

// Copy files
console.log('\nDeploying template files...');
let successCount = 0;
let errorCount = 0;

for (const file of manifest.files || []) {
  const sourcePath = path.join(SOURCE_DIR, file.destination);
  const targetPath = path.join(TARGET_DIR, file.destination);
  
  try {
    if (fs.existsSync(sourcePath)) {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ Deployed: ${file.destination}`);
      successCount++;
    } else {
      console.warn(`⚠ Source not found: ${file.destination}`);
      errorCount++;
    }
  } catch (error) {
    console.error(`✗ Error deploying ${file.destination}:`, error);
    errorCount++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('Deployment Summary');
console.log('='.repeat(50));
console.log(`✓ Successful: ${successCount}`);
console.log(`✗ Errors: ${errorCount}`);

if (errorCount === 0) {
  console.log('\n✅ Template deployed successfully!');
  console.log('\nNext steps:');
  console.log('1. Open Claude Code in your project');
  console.log('2. Type / to see available commands');
  console.log('3. Use /sparc for SPARC methodology');
  console.log('4. Use /claude-zen-* for Claude Flow features');
  console.log('\nFor help, see the documentation files in .claude/');
} else {
  console.log('\n❌ Template deployed with errors. Please check the messages above.');
}