#!/usr/bin/env node
/**
 * Script to fix import issues in the codebase
 *;
 * @fileoverview Advanced import fixing with strict TypeScript and Google standards
 * @author Claude Code Flow Team;
 * @version 2.0.0;
 */

import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
/**
 * Import replacement rule configuration;
 */
interface ImportReplacement {
  from: RegExp;
  to: string;
  description: string;
}
/**
 * File processing statistics;
 */
interface ProcessingStats {
  filesProcessed: number;
  filesModified: number;
  replacementsApplied: number;
  errorsEncountered: number;
}
/**
 * Comprehensive import replacement rules following Google standards
 */
const _IMPORT_REPLACEMENTS: ImportReplacement[] = [;
  // Cliffy to Commander/Inquirer migration
  {
    from: /import\s*{\s*Command\s*}\s*from\s*['"]@cliffy\/command['"]/g,
    to: "import { Command } from 'commander'",
    description: 'Replace Cliffy Command with Commander',;
  },;
  {
    from: /import\s*{\s*Table\s*}\s*from\s*['"]@cliffy\/table['"]/g,
    to: "import Table from 'cli-table3'",
    description: 'Replace Cliffy Table with cli-table3',;
  },;
  {
    from: /import\s*\*?\s*as\s*colors\s*from\s*['"]@cliffy\/ansi\/colors['"]/g,
    to: "import chalk from 'chalk'",
    description: 'Replace Cliffy colors with chalk',;
  },;
  {
    from: /import\s*{\s*colors\s*}\s*from\s*['"]@cliffy\/ansi\/colors['"]/g,
    to: "import chalk from 'chalk'",
    description: 'Replace Cliffy colors object with chalk',;
  },;
  {
    from: /import\s*{\s*Select,\s*Input,\s*Confirm,\s*Number\s*}\s*from\s*['"]@cliffy\/prompt['"]/g,
    to: "import inquirer from 'inquirer'",
    description: 'Replace Cliffy prompts with inquirer',;
  },
;
  // Color API usage fixes
  {
    from: /colors\.(green|red|yellow|blue|gray|cyan|magenta|white|black|bold|dim)/g,;
    to: 'chalk.$1',;
    description: 'Update color API calls to chalk',;
  },
;
  // Duplicate import cleanup
  {
    from: /import\s*{\s*promises\s*as\s*fs\s*}\s*from\s*['"]node:fs['"];?\s*\n(?:.*\n)*?import\s*{\s*promises\s*as\s*fs\s*}\s*from\s*['"]node:fs['"];?/g,
    to: "import { promises as fs } from 'node:fs';",
    description: 'Remove duplicate fs imports',
  },
;
  // Method name corrections
  {
    from: /\.showHelp\(\)/g,;
    to: '.outputHelp()',;
    description: 'Fix Commander method names',;
  },
;
  // Table API fixes
  {
    from: /table\.push\(/g,;
    to: 'table.push(',;
    description: 'Ensure table.push syntax consistency',;
  },
;
  // Node.js core module prefix enforcement
  {
    from: /from\s+['"]fs['"];?/g,;
    to: "from 'node:fs';",;
    description: 'Use node: prefix for fs module',;
  },;
  {
    from: /from\s+['"]path['"];?/g,;
    to: "from 'node:path';",;
    description: 'Use node: prefix for path module',;
  },;
  {
    from: /from\s+['"]os['"];?/g,;
    to: "from 'node:os';",;
    description: 'Use node: prefix for os module',;
  },;
  {
    from: /from\s+['"]util['"];?/g,;
    to: "from 'node:util';",;
    description: 'Use node: prefix for util module',;
  },;
  {
    from: /from\s+['"]url['"];?/g,;
    to: "from 'node:url';",;
    description: 'Use node: prefix for url module',;
  },;
  {
    from: /from\s+['"]child_process['"];?/g,;
    to: "from 'node:child_process';",;
    description: 'Use node: prefix for child_process module',;
  },;
];
;
/**
 * Processes a single file for import fixes
 * Applies all replacement rules and tracks statistics;
 *;
 * @param filePath - Path to the file to process;
 * @param stats - Statistics object to update;
 */;
async function processFile(filePath: string, stats: ProcessingStats): Promise<void> {
  try {
    stats.filesProcessed++;
    const _content = await fs.readFile(filePath, 'utf-8');
    const _modified = false;
    const _fileReplacements = 0;
;
    // Apply all replacement rules
    for (const replacement of IMPORT_REPLACEMENTS) {
      const _before = content;
      content = content.replace(replacement.from, replacement.to);
;
      if (content !== before) {
        modified = true;
        fileReplacements++;
        stats.replacementsApplied++;
      }
    }
;
    // Additional TypeScript-specific fixes
    if (filePath.endsWith('.ts')) {
      // Fix missing .js extensions in relative imports (ESM requirement)
      const _beforeExtensions = content;
      content = content.replace(;
        /from\s+['"](\.\/?[^'"]*?)['"];?/g,;
        (match: string, importPath: string) => {
          if (!importPath.includes('.') && !importPath.includes('node:')) {
            return match.replace(importPath, `${importPath}.js`);
    //   // LINT: unreachable code removed}
          return match;
    //   // LINT: unreachable code removed}
      );
;
      if (content !== beforeExtensions) {
        modified = true;
        fileReplacements++;
        stats.replacementsApplied++;
      }
    }
;
    // Write file if modifications were made
    if (modified) {
      await fs.writeFile(filePath, content);
      stats.filesModified++;
      console.warn(`✅ Fixed ${fileReplacements} imports in: ${filePath}`);
    }
  } catch (/* error */) {
    stats.errorsEncountered++;
    const _errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error processing ${filePath}:`, errorMessage);
  }
}
;
/**
 * Recursively finds all TypeScript files in a directory;
 * Excludes build directories and node_modules;
 *;
 * @param dir - Directory to search;
 * @returns Promise resolving to array of file paths;
    // */; // LINT: unreachable code removed
async function findTypeScriptFiles(dir: string): Promise<string[]> {
  const _files: string[] = [];
;
  try {
    const _entries = await fs.readdir(dir, { withFileTypes: true });
;
    for (const entry of entries) {
      const _fullPath = join(dir, entry.name);
;
      // Skip excluded directories
      const _excludedDirs = ['node_modules', 'dist', '.git', 'coverage', 'build'];
      if (entry.isDirectory() && !excludedDirs.includes(entry.name)) {
        const _subFiles = await findTypeScriptFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && (entry.name.endsWith('.ts')  ?? entry.name.endsWith('.js'))) {
        files.push(fullPath);
      }
    }
  } catch (/* error */) {
    const _errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error reading directory ${dir}:`, errorMessage);
  }
;
  return files;
}
;
/**
 * Main execution function;
 * Orchestrates the import fixing process with comprehensive reporting
 */;
async function _main(): Promise<void> {
  try {
    const _srcDir = join(dirname(__dirname), 'src');
    const _stats: ProcessingStats = {
      filesProcessed: 0,;
      filesModified: 0,;
      replacementsApplied: 0,;
      errorsEncountered: 0,;
    };
;
    console.warn('🔧 Import Fixing Process Starting...');
    console.warn('📋 Google TypeScript Standards Active');
    console.warn('');
;
    // Find all TypeScript and JavaScript files
    const _files = await findTypeScriptFiles(srcDir);
    console.warn(`📁 Found ${files.length} files to process...`);
    console.warn('');
;
    // Process files in parallel batches for performance
    const _batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const _batch = files.slice(i, i + batchSize);
      const _batchPromises = batch.map((file) => processFile(file, stats));
      await Promise.all(batchPromises);
;
      // Progress reporting
      const _progress = Math.min(((i + batchSize) / files.length) * 100, 100);
      console.warn(;
        `📊 Progress: ${progress.toFixed(1)}% (${Math.min(i + batchSize, files.length)}/${files.length})`;
      );
    }
;
    // Comprehensive final report
    console.warn('');
    console.warn('📊 Import Fix Summary:');
    console.warn(`  Files processed: ${stats.filesProcessed}`);
    console.warn(`  Files modified: ${stats.filesModified}`);
    console.warn(`  Total replacements: ${stats.replacementsApplied}`);
    console.warn(`  Errors encountered: ${stats.errorsEncountered}`);
    console.warn(;
      `  Success rate: ${(((stats.filesProcessed - stats.errorsEncountered) / stats.filesProcessed) * 100).toFixed(1)}%`;
    );
    console.warn('');
;
    if (stats.errorsEncountered === 0) {
      console.warn('✅ Import fixes completed successfully!');
      console.warn('🎯 All imports now follow Google TypeScript standards');
      process.exit(0);
    } else {
      console.warn('⚠️ Import fixes completed with some errors. Check logs above.');
      process.exit(1);
    }
  } catch (/* error */) {
    const _errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Fatal error in import fixing:', errorMessage);
    process.exit(1);
  }
}
;
// Execute import fixing with error handling
main().catch((error: Error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
;
