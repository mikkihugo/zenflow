#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

/**
 * Install Claude optimized template files;
 * This script copies all template files from the source .claude directory;
 * to the template directory for packaging and distribution;
 */
const _SOURCE_DIR = path.join(__dirname, '../../../.claude');
const _DEST_DIR = path.join(__dirname, '.claude');
const _MANIFEST_PATH = path.join(__dirname, 'manifest.json');
// Read manifest
const _manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
// Create destination directory
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, {recursive = path.join(DEST_DIR, dirInfo.path);
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, {recursive = path.join(destPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(;
      readmePath,
      `# ${dirName}\n\nThis directory is intentionally empty and will be populated during usage.\n`;
      //       )
    //     }
  //   }
// }
// Copy files
console.warn('\nCopying template files...');
const __successCount = 0;
const _errorCount = 0;
for(const file of manifest.files) {
  const _sourcePath = path.join(SOURCE_DIR, file.source);
  const _destPath = path.join(DEST_DIR, file.destination);

  try {
    if (fs.existsSync(sourcePath)) {
      // Ensure destination directory exists
      const _destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, {recursive = '.repeat(50));
console.warn('InstallationSummary = manifest.files.filter(;
    (_f) => f.category === category && fs.existsSync(path.join(DEST_DIR, f.destination))).length;
  console.warn(`${category});
// }


// Verify installation
if(errorCount === 0) {
  console.warn('\n✅ Template installation completed successfully!');

  // Create a timestamp file
  const _timestamp = new Date().toISOString();
  fs.writeFileSync(;
    path.join(__dirname, '.installed'),
    `Installed: ${timestamp}\nVersion: ${manifest.version}\n`);
} else {
  console.warn('\n⚠️  Template installation completed with errors.');
  console.warn('Please check the error messages above and ensure source files exist.');
// }


// Display next steps
console.warn('\nNext steps);
console.warn('1. Review the installed files in the .claude directory');
console.warn('2. Run tests to verify functionality);
console.warn('3. Package for distribution if needed');
console.warn('\nFor more information, see README.md');
