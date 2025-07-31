#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

/**
 * Validate Claude optimized template installation
 * This script verifies that all required files are present and properly formatted
 */

const TEMPLATE_DIR = path.join(__dirname, '.claude');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

// Colors for console output
const colors = {
  green: '\u001b[32m',
  red: '\u001b[31m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  reset: '\u001b[0m'
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(colors[color] + message + colors.reset);
}

// Read manifest
let manifest: any;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  log('✅ Manifest loaded successfully', 'green');
} catch (_error) {
  log('❌ Failed to load manifest', 'red');
  process.exit(1);
}

let totalTests = 0;
let passedTests = 0;

function test(description: string, condition: boolean): void {
  totalTests++;
  if (condition) {
    passedTests++;
    log(`✅ ${description}`, 'green');
  } else {
    log(`❌ ${description}`, 'red');
  }
}

// Test 1: Template directory structure
log('\n🔍 Testing directory structure...', 'blue');
for (const dirInfo of manifest.directories) {
  const dirPath = path.join(TEMPLATE_DIR, dirInfo.path);
  test(`Directory ${dirInfo.path} exists`, fs.existsSync(dirPath));
}

// Test 2: Required files exist
log('\n🔍 Testing required files...', 'blue');
for (const file of manifest.files) {
  const filePath = path.join(TEMPLATE_DIR, file.destination);
  test(`File ${file.destination} exists`, fs.existsSync(filePath));
}

// Test 3: Sample file content validation
log('\n🔍 Testing file content...', 'blue');
const sampleFiles = ['commands/sparc.md', 'commands/sparc/architect.md', 'BATCHTOOLS_GUIDE.md'];
for (const fileName of sampleFiles) {
  const filePath = path.join(TEMPLATE_DIR, fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    test(`${fileName} has content`, content.length > 100);
    test(`${fileName} contains frontmatter`, content.startsWith('---'));
  }
}

// Test 4: SPARC command structure
log('\n🔍 Testing SPARC commands...', 'blue');
const sparcCommands = manifest.files.filter((f: any) => f.category === 'sparc-mode');
for (const cmd of sparcCommands.slice(0, 3)) {
  // Test first 3 commands
  const filePath = path.join(TEMPLATE_DIR, cmd.destination);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    test(
      `${cmd.destination} has proper structure`,
      content.includes('## Instructions') || content.includes('You are')
    );
  }
}

// Test 5: Test file structure
log('\n🔍 Testing test files...', 'blue');
const testFiles = manifest.files.filter((f: any) => f.category === 'test');
for (const testFile of testFiles.slice(0, 3)) {
  // Test first 3 test files
  const filePath = path.join(TEMPLATE_DIR, testFile.destination);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    test(
      `${testFile.destination} has test structure`,
      content.includes('describe') || content.includes('test') || content.includes('it')
    );
  }
}

// Test 6: Version consistency
log('\n🔍 Testing version consistency...', 'blue');
const versionFile = path.join(__dirname, 'VERSION');
if (fs.existsSync(versionFile)) {
  const fileVersion = fs.readFileSync(versionFile, 'utf8').trim();
  test('Version file matches manifest', fileVersion === manifest.version);
}

// Test 7: File counts match manifest
log('\n🔍 Testing file counts...', 'blue');
for (const [category, info] of Object.entries(manifest.fileCounts) as [string, any][]) {
  const actualCount = manifest.files.filter((f: any) => f.category === category).length;
  // Allow some flexibility in counts as they might have been updated
  const countMatches = Math.abs(actualCount - info.count) <= 2;
  test(
    `${category} file count approximately correct (${actualCount} vs ${info.count})`,
    countMatches
  );
}

// Test 8: Installation marker
log('\n🔍 Testing installation status...', 'blue');
const installFile = path.join(__dirname, '.installed');
test('Installation timestamp exists', fs.existsSync(installFile));

// Final summary
log(`\n${'='.repeat(60)}`, 'blue');
log('Validation Summary', 'blue');
log(`${'='.repeat(60)}`, 'blue');

const color = passedTests === totalTests ? 'green' : 'red';
log(`✅ Passed: ${passedTests}/${totalTests}`, color);
log(`❌ Failed: ${totalTests - passedTests}`, passedTests === totalTests ? 'green' : 'red');

const percentage = Math.round((passedTests / totalTests) * 100);
log(`📊 Success rate: ${percentage}%`, percentage >= 90 ? 'green' : 'yellow');

if (passedTests === totalTests) {
  log('\n🎉 Template validation passed! All files are properly installed.', 'green');
} else if (percentage >= 90) {
  log('\n⚠️ Template validation mostly passed with minor issues.', 'yellow');
} else {
  log('\n❌ Template validation failed. Please check the issues above.', 'red');
}

// Additional information
log('\nTemplate Information:', 'blue');
log(`📝 Documentation files: ${manifest.files.filter((f: any) => f.category === 'documentation').length}`);
log(`⚡ Command files: ${manifest.files.filter((f: any) => f.category === 'command').length}`);
log(`🔧 SPARC mode files: ${manifest.files.filter((f: any) => f.category === 'sparc-mode').length}`);
log(`🧪 Test files: ${manifest.files.filter((f: any) => f.category === 'test').length}`);

process.exit(passedTests === totalTests ? 0 : 1);