#!/usr/bin/env node

/**
 * Script to fix incorrect import paths in the codebase
 *
 * @fileoverview Automated import path correction with Google standards compliance
 * @author Claude Code Flow Team
 * @version 2.0.0
 */

import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Import fix configuration
 */
interface ImportFix {
  from: string;
  to: string;
}

/**
 * File processing statistics
 */
interface ProcessingStats {
  filesProcessed: number;
  filesModified: number;
  errorsEncountered: number;
}

/**
 * Fixes import paths in a single file
 * Applies both relative path corrections and type/value import fixes
 *
 * @param filePath - Absolute path to the file to process
 * @param stats - Statistics object to update
 */
async function fixImportPaths(filePath: string, stats: ProcessingStats): Promise<void> {
  try {
    stats.filesProcessed++;
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // Fix relative import path depth issues in CLI commands
    if (filePath.includes('/cli/commands/')) {
      const relativePaths = [
        {
          wrong: '../utils/error-handler.js',
          correct: '../../utils/error-handler.js',
        },
        {
          wrong: '../core/logger.js',
          correct: '../../core/logger.js',
        },
        {
          wrong: '../memory/memory-manager.js',
          correct: '../../memory/memory-manager.js',
        },
      ];

      for (const pathFix of relativePaths) {
        if (content.includes(pathFix.wrong)) {
          content = content.replace(new RegExp(pathFix.wrong, 'g'), pathFix.correct);
          modified = true;
        }
      }
    }

    // Fix type imports that should be value imports for Google standards
    const typeImportFixes: ImportFix[] = [
      // EventEmitter should be a value import
      {
        from: "import type { EventEmitter } from 'events';",
        to: "import { EventEmitter } from 'events';",
      },
      {
        from: "import type { EventEmitter } from 'node:events';",
        to: "import { EventEmitter } from 'node:events';",
      },
      // Command should be a value import for Cliffy
      {
        from: "import type { Command } from '@cliffy/command';",
        to: "import { Command } from '@cliffy/command';",
      },
      // Logger should be a value import
      {
        from: "import type { Logger } from '../../core/logger.js';",
        to: "import { Logger } from '../../core/logger.js';",
      },
      {
        from: "import type { AdvancedMemoryManager } from '../../memory/advanced-memory-manager.js';",
        to: "import { AdvancedMemoryManager } from '../../memory/advanced-memory-manager.js';",
      },
      // Database connections should be value imports
      {
        from: "import type { Database } from 'sqlite3';",
        to: "import { Database } from 'sqlite3';",
      },
      // Express types that are used as constructors
      {
        from: "import type { Express, Router } from 'express';",
        to: "import { Express, Router } from 'express';",
      },
    ];

    // Apply type import fixes
    for (const fix of typeImportFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
      }
    }

    // Fix missing .js extensions in relative imports (ESM requirement)
    const relativeImportPattern = /from\s+['"](\.\/?[^'"]*?)['"];?/g;
    content = content.replace(relativeImportPattern, (match: string, importPath: string) => {
      // Don't modify if already has extension or is JSON
      if (importPath.includes('.')) {
        return match;
      }

      // Add .js extension for TypeScript files
      const updatedMatch = match.replace(importPath, `${importPath}.js`);
      if (updatedMatch !== match) {
        modified = true;
      }
      return updatedMatch;
    });

    // Update file if modifications were made
    if (modified) {
      await fs.writeFile(filePath, content);
      stats.filesModified++;
      console.warn(`✅ Fixed import paths in: ${filePath}`);
    }
  } catch (error) {
    stats.errorsEncountered++;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error processing ${filePath}:`, errorMessage);
  }
}

/**
 * Recursively finds all TypeScript files in a directory
 * Excludes node_modules, dist, and other build directories
 *
 * @param dir - Directory to search
 * @returns Promise resolving to array of file paths
 */
async function findTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip excluded directories
      const excludedDirs = ['node_modules', 'dist', '.git', 'coverage', 'build'];
      if (entry.isDirectory() && !excludedDirs.includes(entry.name)) {
        const subFiles = await findTypeScriptFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
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
 * Orchestrates the import path fixing process with comprehensive reporting
 */
async function main(): Promise<void> {
  try {
    const srcDir = join(dirname(__dirname), 'src');
    const stats: ProcessingStats = {
      filesProcessed: 0,
      filesModified: 0,
      errorsEncountered: 0,
    };

    console.warn('🔍 Scanning for TypeScript files...');
    const files = await findTypeScriptFiles(srcDir);

    console.warn(`📁 Found ${files.length} TypeScript files to check for import path issues...`);

    // Process files in parallel batches for performance
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map((file) => fixImportPaths(file, stats));
      await Promise.all(batchPromises);

      // Progress reporting
      const progress = Math.min(((i + batchSize) / files.length) * 100, 100);
      console.warn(`📊 Progress: ${progress.toFixed(1)}% (${i + batchSize}/${files.length})`);
    }

    // Final comprehensive report
    console.warn('\n📊 Import Path Fix Summary:');
    console.warn(`  Files processed: ${stats.filesProcessed}`);
    console.warn(`  Files modified: ${stats.filesModified}`);
    console.warn(`  Errors encountered: ${stats.errorsEncountered}`);
    console.warn(
      `  Success rate: ${(((stats.filesProcessed - stats.errorsEncountered) / stats.filesProcessed) * 100).toFixed(1)}%`
    );

    if (stats.errorsEncountered === 0) {
      console.warn('\n✅ Import path fixes completed successfully!');
      process.exit(0);
    } else {
      console.warn('\n⚠️ Import path fixes completed with some errors. Check logs above.');
      process.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Fatal error in main process:', errorMessage);
    process.exit(1);
  }
}

// Execute main function with error handling
main().catch((error: Error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
