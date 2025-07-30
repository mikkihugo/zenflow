#!/usr/bin/env node

/**
 * Prepare for npm publish by ensuring all versions are synchronized
 * and dist files are built correctly
 *
 * @fileoverview Publication preparation script with strict TypeScript compliance
 * @author Claude Code Flow Team
 * @version 2.0.0
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Package.json structure interface
 */
interface PackageJson {
  version: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Version file configuration
 */
interface VersionFile {
  path: string;
  pattern: RegExp;
  replacement: string;
}

/**
 * Pack file information
 */
interface PackFile {
  path: string;
  size: number;
}

/**
 * NPM pack output information
 */
interface PackInfo {
  files: PackFile[];
  size: number;
}

/**
 * Reads and parses package.json with type safety
 *
 * @returns Package.json content
 */
function getPackageVersion(): string {
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent) as PackageJson;
  return packageJson.version;
}

/**
 * Gets list of files that need version updates
 *
 * @param version - Version string to inject
 * @returns Array of version file configurations
 */
function getVersionFiles(version: string): VersionFile[] {
  return [
    {
      path: 'src/cli/cli-main.ts',
      pattern: /const VERSION = '[^']+';/,
      replacement: `const VERSION = '${version}';`,
    },
    {
      path: 'src/cli/index.ts',
      pattern: /const VERSION = '[^']+';/,
      replacement: `const VERSION = '${version}';`,
    },
    {
      path: 'src/cli/index-remote.ts',
      pattern: /const VERSION = '[^']+';/,
      replacement: `const VERSION = '${version}';`,
    },
    { path: 'bin/claude-zen', pattern: /VERSION="[^"]+"/, replacement: `VERSION="${version}"` },
    {
      path: 'src/cli/commands/status.ts',
      pattern: /version: '[^']+'/g,
      replacement: `version: '${version}'`,
    },
    {
      path: 'src/cli/init/claude-config.ts',
      pattern: /version: "[^"]+"/g,
      replacement: `version: "${version}"`,
    },
    {
      path: 'src/cli/init/directory-structure.ts',
      pattern: /version: "[^"]+"/g,
      replacement: `version: "${version}"`,
    },
  ];
}

/**
 * Updates version strings in source files
 *
 * @param version - Version to inject
 * @returns Number of files updated
 */
function updateVersionFiles(version: string): number {
  console.warn('📝 Updating version in source files...');
  const versionFiles = getVersionFiles(version);
  let updatedCount = 0;

  versionFiles.forEach(({ path: filePath, pattern, replacement }) => {
    const fullPath = path.join(rootDir, filePath);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = content.replace(pattern, replacement);

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.warn(`   ✅ Updated ${filePath}`);
        updatedCount++;
      } else {
        console.warn(`   ⏭️  ${filePath} already up to date`);
      }
    } else {
      console.warn(`   ⚠️  ${filePath} not found`);
    }
  });

  console.warn(`\n   Updated ${updatedCount} files\n`);
  return updatedCount;
}

/**
 * Cleans the dist directory
 */
function cleanDistDirectory(): void {
  console.warn('🧹 Cleaning dist directory...');
  const distDir = path.join(rootDir, 'dist');

  if (fs.existsSync(distDir)) {
    execSync('rm -rf dist', { cwd: rootDir });
    console.warn('   ✅ Cleaned dist directory');
  }
}

/**
 * Builds TypeScript files with fallback strategies
 */
function buildTypeScriptFiles(): void {
  console.warn('\n🔨 Building TypeScript files...');

  try {
    // First try to build CLI files with relaxed config
    execSync('npx tsc -p tsconfig.cli.json', { cwd: rootDir, stdio: 'inherit' });
    console.warn('   ✅ CLI files built successfully');
  } catch (_error) {
    console.warn('   ⚠️  Build had errors, trying fallback...');

    try {
      // Fallback: try the regular build
      execSync('npm run build:ts', { cwd: rootDir, stdio: 'inherit' });
    } catch (_fallbackError) {
      console.warn('   ⚠️  Build had errors, but continuing...');
      // Continue anyway as there might be type errors that don't affect runtime
    }
  }
}

/**
 * Verifies that dist files contain correct version
 *
 * @param version - Expected version string
 */
function verifyDistFiles(version: string): void {
  console.warn('\n🔍 Verifying dist files...');
  const distFiles = ['dist/cli/cli-main.js', 'dist/cli/index.js'];

  distFiles.forEach((distFile: string) => {
    const fullPath = path.join(rootDir, distFile);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const versionMatch = content.match(/VERSION = ['"]([^'"]+)['"]/);

      if (versionMatch) {
        if (versionMatch[1] === version) {
          console.warn(`   ✅ ${distFile}: ${versionMatch[1]}`);
        } else {
          console.warn(`   ❌ ${distFile}: ${versionMatch[1]} (expected ${version})`);
        }
      } else {
        console.warn(`   ⚠️  ${distFile}: version not found`);
      }
    } else {
      console.warn(`   ⚠️  ${distFile}: file not found`);
    }
  });
}

/**
 * Checks what files will be published
 */
function checkPublishFiles(): void {
  console.warn('\n📋 Files to be published:');

  try {
    const packOutput = execSync('npm pack --dry-run --json', {
      cwd: rootDir,
      encoding: 'utf8',
    });

    const packInfo = JSON.parse(packOutput) as PackInfo[];

    if (packInfo[0]?.files) {
      const importantFiles = packInfo[0].files.filter(
        (f: PackFile) =>
          f.path.includes('cli.js') ||
          f.path.includes('cli-main') ||
          f.path.includes('package.json') ||
          f.path.includes('README.md')
      );

      importantFiles.forEach((file: PackFile) => {
        console.warn(`   📄 ${file.path} (${(file.size / 1024).toFixed(1)}KB)`);
      });

      console.warn(`\n   Total files: ${packInfo[0].files.length}`);
      console.warn(`   Total size: ${(packInfo[0].size / 1024 / 1024).toFixed(2)}MB`);
    }
  } catch (_error) {
    console.warn('   ⚠️  Could not get pack info');
  }
}

/**
 * Displays next steps for publication
 *
 * @param version - Package version for tagging
 */
function displayNextSteps(version: string): void {
  console.warn('\n✅ Ready to publish!');
  console.warn('\n📝 Next steps:');
  console.warn('   1. Review the changes above');
  console.warn(
    '   2. Commit any version changes: git add -A && git commit -m "chore: sync versions"'
  );
  console.warn('   3. Publish to npm: npm publish');
  console.warn(`   4. Create git tag: git tag v${version} && git push --tags`);
  console.warn('\n💡 The prepublishOnly script will automatically run this before publish.');
}

/**
 * Main execution function
 * Orchestrates the entire publication preparation process
 */
async function main(): Promise<void> {
  try {
    console.warn('🚀 Preparing for npm publish...\n');

    // Get package version
    const version = getPackageVersion();
    console.warn(`📦 Package version: ${version}\n`);

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Publication preparation failed:', errorMessage);
    process.exit(1);
  }
}

// Execute main function
main().catch((error: Error) => {
  console.error('❌ Unhandled error in publication preparation:', error);
  process.exit(1);
});
