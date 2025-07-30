#!/usr/bin/env node

/**
 * Script to fix shebang lines that got moved incorrectly
 *
 * @fileoverview Shebang line correction utility with Google TypeScript standards
 * @author Claude Code Flow Team
 * @version 2.0.0
 */

import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * File processing statistics
 */
interface ProcessingStats {
  filesProcessed: number;
  filesFixed: number;
  errorsEncountered: number;
}

/**
 * Supported shebang patterns
 */
const SHEBANG_PATTERNS = ['#!/usr/bin/env node', '#!/usr/bin/node', '#!/bin/node'] as const;

/**
 * Fixes shebang line positioning in a single file
 * Ensures shebang appears at the very first line as required
 *
 * @param filePath - Path to the file to process
 * @param stats - Statistics object to update
 */
async function fixShebangLine(filePath: string, stats: ProcessingStats): Promise<void> {
  try {
    stats.filesProcessed++;
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // Check if shebang is misplaced but exists in the file
    const hasShebangAtStart = SHEBANG_PATTERNS.some((pattern) => content.startsWith(pattern));

    if (!hasShebangAtStart) {
      const lines = content.split('\n');
      let shebangLine: string | null = null;
      let shebangIndex = -1;

      // Find any shebang line in the file
      for (const pattern of SHEBANG_PATTERNS) {
        shebangIndex = lines.findIndex((line) => line.trim() === pattern);
        if (shebangIndex > 0) {
          // Only if not already at position 0
          shebangLine = lines[shebangIndex];
          break;
        }
      }

      // Fix shebang position if found
      if (shebangLine && shebangIndex > 0) {
        // Remove shebang from current position
        lines.splice(shebangIndex, 1);

        // Add shebang to the beginning
        lines.unshift(shebangLine);

        content = lines.join('\n');
        modified = true;
      }
    }

    // Handle files that should have shebang but don't
    if (!modified && isExecutableScript(filePath, content)) {
      const lines = content.split('\n');

      // Add shebang if it's missing from an executable script
      if (!lines[0].startsWith('#!')) {
        lines.unshift('#!/usr/bin/env node');
        content = lines.join('\n');
        modified = true;
      }
    }

    // Write file if modifications were made
    if (modified) {
      await fs.writeFile(filePath, content);
      stats.filesFixed++;
      console.warn(`✅ Fixed shebang in: ${filePath}`);
    }
  } catch (error) {
    stats.errorsEncountered++;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error processing ${filePath}:`, errorMessage);
  }
}

/**
 * Determines if a file should have a shebang line
 * Based on file location and content analysis
 *
 * @param filePath - Path to the file
 * @param content - File content
 * @returns True if file should have shebang
 */
function isExecutableScript(filePath: string, content: string): boolean {
  // Files in bin/ or scripts/ directories should be executable
  if (filePath.includes('/bin/') || filePath.includes('/scripts/')) {
    return true;
  }

  // Files with CLI-related imports should be executable
  const cliPatterns = ['commander', 'process.argv', '@cliffy/command', 'inquirer'];

  return cliPatterns.some((pattern) => content.includes(pattern));
}

/**
 * Recursively finds all TypeScript and JavaScript files
 * Focuses on files that might need shebang corrections
 *
 * @param dir - Directory to search
 * @returns Promise resolving to array of file paths
 */
async function findScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip excluded directories
      const excludedDirs = ['node_modules', 'dist', '.git', 'coverage', 'build'];
      if (entry.isDirectory() && !excludedDirs.includes(entry.name)) {
        const subFiles = await findScriptFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error reading directory ${dir}:`, errorMessage);
  }

  return files;
}

/**
 * Main execution function
 * Orchestrates shebang fixing with comprehensive reporting
 */
async function main(): Promise<void> {
  try {
    const rootDir = dirname(__dirname);
    const stats: ProcessingStats = {
      filesProcessed: 0,
      filesFixed: 0,
      errorsEncountered: 0,
    };

    console.warn('🔧 Shebang Line Fixing Process Starting...');
    console.warn('📋 Google TypeScript Standards Active');
    console.warn('');

    // Find all script files that might need shebang fixes
    const files = await findScriptFiles(rootDir);
    console.warn(`📁 Found ${files.length} files to check for shebang issues...`);
    console.warn('');

    // Process files in parallel batches for performance
    const batchSize = 15;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map((file) => fixShebangLine(file, stats));
      await Promise.all(batchPromises);

      // Progress reporting
      const progress = Math.min(((i + batchSize) / files.length) * 100, 100);
      console.warn(
        `📊 Progress: ${progress.toFixed(1)}% (${Math.min(i + batchSize, files.length)}/${files.length})`
      );
    }

    // Comprehensive final report
    console.warn('');
    console.warn('📊 Shebang Fix Summary:');
    console.warn(`  Files processed: ${stats.filesProcessed}`);
    console.warn(`  Files fixed: ${stats.filesFixed}`);
    console.warn(`  Errors encountered: ${stats.errorsEncountered}`);

    if (stats.filesFixed > 0) {
      console.warn(`  Fix rate: ${((stats.filesFixed / stats.filesProcessed) * 100).toFixed(1)}%`);
    }

    console.warn('');

    if (stats.errorsEncountered === 0) {
      console.warn('✅ Shebang fixes completed successfully!');
      console.warn('🎯 All executable files now have proper shebang lines');
      process.exit(0);
    } else {
      console.warn('⚠️ Shebang fixes completed with some errors. Check logs above.');
      process.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Fatal error in shebang fixing:', errorMessage);
    process.exit(1);
  }
}

// Execute shebang fixing with error handling
main().catch((error: Error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
