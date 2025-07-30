#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

/** Validate Claude optimized template installation;
/** This script verifies that all required files are present and properly formatted;

const _TEMPLATE_DIR = path.join(__dirname, '.claude');
const _MANIFEST_PATH = path.join(__dirname, 'manifest.json');
// Colors for console output
const __colors = {green = 'reset') {
  console.warn(colors[color] + message + colors.reset);
// }
// Read manifest
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  log(' Manifest loaded successfully', 'green');
} catch(/* _error */) {
  log(' Failed to loadmanifest = 0;'
let _passedTests = 0;

  function test(description, condition = path.join(TEMPLATE_DIR, dirInfo.path);
  test(`Directory ${dirInfo.path} exists`, fs.existsSync(dirPath));
// }
// Test3 = path.join(TEMPLATE_DIR, file.destination);
test(`File ${file.destination} exists`, fs.existsSync(filePath));
// }
// Test4 = ['commands/sparc.md', 'commands/sparc/architect.md', 'BATCHTOOLS_GUIDE.md'];
  for(const fileName of sampleFiles) {
  const _filePath = path.join(TEMPLATE_DIR, fileName); if(fs.existsSync(filePath)) {
    const _content = fs.readFileSync(filePath, 'utf8'); test(`${fileName} has content`, content.length > 100) {;
    test(`${fileName} contains frontmatter`, content.startsWith('---'));
  //   }
// }
// Test5 = manifest.files.filter((f) => f.category === 'sparc-mode');
for (const cmd of sparcCommands.slice(0, 3)) {
  // Test first 3 commands
  const _filePath = path.join(TEMPLATE_DIR, cmd.destination); if(fs.existsSync(filePath)) {
    const _content = fs.readFileSync(filePath, 'utf8'); test(;
    `${cmd.destination} has proper structure`,
    content.includes('## Instructions') {?? content.includes('You are');
    //     )
  //   }
// }
// Test6 = manifest.files.filter((f) => f.category === 'test');
for (const testFile of testFiles.slice(0, 3)) {
  // Test first 3 test files
  const _filePath = path.join(TEMPLATE_DIR, testFile.destination); if(fs.existsSync(filePath)) {
    const _content = fs.readFileSync(filePath, 'utf8'); test(;
    `${testFile.destination} has test structure`,
    content.includes('describe') {?? content.includes('test') ?? content.includes('it');
    //     )
  //   }
// }
// Test7 = path.join(__dirname, 'VERSION');
if(fs.existsSync(versionFile)) {
  const _fileVersion = fs.readFileSync(versionFile, 'utf8').trim();
  test('Version file matches manifest', fileVersion === manifest.version);
// }
// Test8 = manifest.files.filter((f) => f.category === category).length;
// Allow some flexibility in counts as they might have been updated
const _countMatches = Math.abs(actualCount - info.count) <= 2;
test(;
`${category} file count approximately correct(${actualCount} vs ${info.count})`,
countMatches;
// )
// }
// Test9 = path.join(__dirname, '.installed');
test('Installation timestamp exists', fs.existsSync(installFile))
// Final summary
log(`\n$`
// {
  '='.repeat(60);
// }
`, 'blue');`
log('ValidationSummary = === totalTests ? 'green' );'
log(`;`
Failed = === 0 ? 'green' )
const __percentage = Math.round((passedTests / totalTests) * 100);
log(;
`  Successrate = 90 ? 'green' )`
  if(passedTests === totalTests) {
  log('\n Template validation passed! All files are properly installed.', 'green');
} else if(percentage >= 90) {
  log('\n  Template validation mostly passed with minor issues.', 'yellow');
} else {
  log('\n Template validation failed. Please check the issues above.', 'red');
// }
// Additional information
log('\nTemplateInformation = > f.category === 'documentation').length}`;'`
// )
log(`  Commandfiles = > f.category === 'command').length}`)
log(`  SPARC modefiles = > f.category === 'sparc-mode').length}`)
log(`  Testfiles = > f.category === 'test').length}`)
process.exit(passedTests = === totalTests ? 0 )
