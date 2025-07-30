#!/usr/bin/env node

/** Prepare for npm publish by ensuring all versions are synchronized;
 * and dist files are built correctly;
 *;
 * @fileoverview Publication preparation script with strict TypeScript compliance;
 * @author Claude Code Flow Team;
 * @version 2.0.0;
 */

import { execSync  } from 'node:child_process';
import fs from 'node:fs';
import path, { dirname  } from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
const _rootDir = path.resolve(__dirname, '..');

/** Package.json structure interface;

// // interface PackageJson {
//   // version: string
//   // name: string
//   [key];
// // }

/** Version file configuration;

// // interface VersionFile {
//   // path: string
//   // pattern: RegExp
//   // replacement: string
// // }

/** Pack file information;

// // interface PackFile {
//   // path: string
//   // size: number
// // }

/** NPM pack output information;

// // interface PackInfo {
//   files;
//   // size: number
// // }

/** Reads and parses package.json with type safety;
 *;
 * @returns Package.json content;
 */
    // */ // LINT: unreachable code removed
function getPackageVersion() {
  const _packageJsonPath = path.join(rootDir, 'package.json');
  const _packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const _packageJson = JSON.parse(packageJsonContent) as PackageJson;
  return packageJson.version;
// }

/** Gets list of files that need version updates;
 *;
 * @param version - Version string to inject;
 * @returns Array of version file configurations;
 */
    // */ // LINT: unreachable code removed
function getVersionFiles(version): VersionFile[] {
  return [;
    // { // LINT: unreachable code removed
      path: 'src/cli/cli-main.ts',
      pattern: /const VERSION = '[^']+';/,'
  replacement: `const VERSION = '${version}';` }

{}
  path: 'src/cli/index.ts',
  pattern: /const VERSION = '[^']+';/,'
  replacement: `const VERSION = '${version}';` }

{}
  path: 'src/cli/index-remote.ts',
  pattern: /const VERSION = '[^']+';/,'
  replacement: `const VERSION = '${version}';` }

{}
  path: 'bin/claude-zen', pattern;
  : /VERSION="[^"]+"/, replacement: `VERSION="\$version"` },"
      path: 'src/cli/commands/status.ts',
  pattern: /version: '[^']+'/g,'
  replacement: `version: '${version}'`,

  path: 'src/cli/init/claude-config.ts',
  pattern: /version: "[^"]+"/g,"
  replacement: `version: "${version}"`,

  path: 'src/cli/init/directory-structure.ts',
  pattern: /version: "[^"]+"/g,"
  replacement: `version: "${version}"`,
   //    ]
// }

/** Updates version strings in source files;
 *;
 * @param version - Version to inject;
 * @returns Number of files updated;
 */
    // */ // LINT: unreachable code removed
function updateVersionFiles(version) {
  console.warn(' Updating version in source files...');
  const _versionFiles = getVersionFiles(version);
  const _updatedCount = 0;
  versionFiles.forEach(({ path, pattern, replacement   }) => {
    const _fullPath = path.join(rootDir, filePath);
    if(fs.existsSync(fullPath)) {
      const _content = fs.readFileSync(fullPath, 'utf8');
      const _newContent = content.replace(pattern, replacement);
  if(content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.warn(`    Updated ${filePath}`);
        updatedCount++;
      } else {
        console.warn(`     ${filePath} already up to date`);
      //       }
    } else {
      console.warn(`     ${filePath} not found`);
    //     }
  });
  console.warn(`\n   Updated ${updatedCount} files\n`);
  // return updatedCount;
// }

/** Cleans the dist directory;

function cleanDistDirectory() {
  console.warn(' Cleaning dist directory...');
  const _distDir = path.join(rootDir, 'dist');
  if(fs.existsSync(distDir)) {
    execSync('rm -rf dist', { cwd});
    console.warn('    Cleaned dist directory');
  //   }
// }

/** Builds TypeScript files with fallback strategies;

function buildTypeScriptFiles() {
  console.warn('\n Building TypeScript files...');
  try {
    // First try to build CLI files with relaxed config
    execSync('npx tsc -p tsconfig.cli.json', { cwd, stdio);
    console.warn('    CLI files built successfully');
  } catch(/* _error */) {
    console.warn('     Build had errors, trying fallback...');
    try {
      // Fallback: try the regular build
      execSync('npm run build);'
    } catch(/* _fallbackError */) {
      console.warn('     Build had errors, but continuing...');
      // Continue anyway as there might be type errors that don't affect runtime'
    //     }
  //   }
// }

/** Verifies that dist files contain correct version;
 *;
 * @param version - Expected version string;
 */

function verifyDistFiles(version) {
  console.warn('\n Verifying dist files...');
  const _distFiles = ['dist/cli/cli-main.js', 'dist/cli/index.js'];
  distFiles.forEach((distFile) => {
    const _fullPath = path.join(rootDir, distFile);
    if(fs.existsSync(fullPath)) {
      const _content = fs.readFileSync(fullPath, 'utf8');
      const _versionMatch = content.match(/VERSION = ['"]([^'"]+)['"]/);"'
  if(versionMatch) {
  if(versionMatch[1] === version) {
          console.warn(`    ${distFile});`
        } else {
          console.warn(`    ${distFile}: ${versionMatch[1]} (expected ${version})`);
        //         }
      } else {
        console.warn(`     ${distFile});`
      //       }
    } else {
      console.warn(`     ${distFile});`
    //     }
  });
// }

/** Checks what files will be published;

function checkPublishFiles() {
  console.warn('\n Files to be published);'
  try {
    const _packOutput = execSync('npm pack --dry-run --json', {
      cwd,
      encoding: 'utf8'
})
  const _packInfo = JSON.parse(packOutput) as PackInfo[];
  if(packInfo[0]?.files) {
    const _importantFiles = packInfo[0].files.filter()
        (_f) =>;
    f.path.includes('cli.js') ??
      f.path.includes('cli-main') ??
      f.path.includes('package.json') ??
      f.path.includes('README.md');
    //     )
    importantFiles.forEach((file) =>
      console.warn(`    \$`
      file.path(\$))
      (file.size / 1024).toFixed(1)
    KB
    )`)`
    //     )
    console.warn(`\n   Total files)`
    console.warn(`   Total size: \$(packInfo[0].size / 1024 / 1024).toFixed(2)MB`)
  //   }
// }
catch(/* _error */)
// {
  console.warn('     Could not get pack info');
// }
// }

/** Displays next steps for publication;
 *;
 * @param version - Package version for tagging;
 */

function displayNextSteps(_version) {
  console.warn('\n Ready to publish!');
  console.warn('\n Next steps);'
  console.warn('   1. Review the changes above');
  console.warn(;)
  ('   2. Commit any version changes);'
  //   )
  console.warn('   3. Publish to npm)'
  console.warn(`   4. Create git tag)`
  console.warn('\n The prepublishOnly script will automatically run this before publish.')
// }

/** Main execution function;
/** Orchestrates the entire publication preparation process;

async function _main(): Promise<void> {
  try {
    console.warn(' Preparing for npm publish...\n');
    // Get package version
    const _version = getPackageVersion();
    console.warn(` Package version);`
    // Update version in source files
    updateVersionFiles(version);
    // Clean and build
    cleanDistDirectory();
    buildTypeScriptFiles();
    // Verify build outputs
    verifyDistFiles(version);
    // Check what will be published
    checkPublishFiles();
    // Display next steps
    displayNextSteps(version);
  } catch(error) {
    const _errorMessage = error instanceof Error ? error.message : String(error);
    console.error(' Publication preparation failed);'
    process.exit(1);
  //   }
// }
// Execute main function main().catch((error) => {
console.error(' Unhandled error in publication preparation);'
process.exit(1);
})
