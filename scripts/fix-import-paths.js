#!/usr/bin/env node

/**
 * Auto-Fix Import Path Resolution Script
 * Fixes systematic TS2307 "Cannot find module" errors
 * Maps missing imports to correct locations in the codebase
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Known import mappings (from error analysis)
const IMPORT_MAPPINGS = {
  // Document entities (moved to product-entities)
  '../database/entities/feature-document': '../database/entities/product-entities',
  '../database/entities/task-document': '../database/entities/product-entities',
  '../database/entities/adr-document': '../database/entities/product-entities',
  '../database/entities/epic-document': '../database/entities/product-entities',
  '../database/entities/prd-document': '../database/entities/product-entities',
  '../database/entities/base-document': '../database/entities/product-entities',
  '../database/entities/project': '../database/entities/product-entities',

  // Core modules
  '../core/document-manager': '../core/workflow-engine',
  '../types/task-types': '../types/shared-types',

  // Config modules
  '../config/logging-config': '../core/logger',

  // Missing modules that should be created
  '../database/entities/document-entities': '../database/entities/product-entities',
};

// File extensions to search
const FILE_EXTENSIONS = ['ts', 'tsx'];

class ImportPathFixer {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'src');
    this.fixedFiles = [];
    this.createdFiles = [];
  }

  async fix() {
    console.log('🔧 Auto-Fixing Import Path Resolution...');

    // Find all TypeScript files
    const pattern = path.join(this.baseDir, '**/*.{ts,tsx}');
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/__tests__/**', '**/tests/**'],
    });

    console.log(`📁 Found ${files.length} TypeScript files to check`);

    // Process each file
    for (const filePath of files) {
      await this.fixImportsInFile(filePath);
    }

    // Create missing entity exports
    await this.createMissingEntityExports();

    console.log(`\n✅ Import path fixing complete:`);
    console.log(`   📝 Fixed imports in ${this.fixedFiles.length} files`);
    console.log(`   📦 Created ${this.createdFiles.length} missing exports`);

    if (this.fixedFiles.length > 0) {
      console.log(`\n📋 Fixed files:`);
      this.fixedFiles.forEach((file) => {
        const relative = path.relative(this.baseDir, file.path);
        console.log(`   • ${relative} (${file.changes} changes)`);
      });
    }
  }

  async fixImportsInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changeCount = 0;

    // Fix each known import mapping
    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      const oldPattern = new RegExp(`from ['"]${this.escapeRegex(oldImport)}['"]`, 'g');
      const newReplacement = `from '${newImport}'`;

      if (oldPattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(oldPattern, newReplacement);
        changeCount++;
      }

      // Also fix require() statements
      const oldRequirePattern = new RegExp(
        `require\\(['"]${this.escapeRegex(oldImport)}['"]\\)`,
        'g'
      );
      const newRequireReplacement = `require('${newImport}')`;

      if (oldRequirePattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(oldRequirePattern, newRequireReplacement);
        changeCount++;
      }
    }

    // Fix relative path issues
    updatedContent = this.fixRelativePaths(updatedContent, filePath);

    // Write back if changed
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      this.fixedFiles.push({
        path: filePath,
        changes: changeCount,
      });
    }
  }

  fixRelativePaths(content, currentFilePath) {
    // Fix common relative path patterns
    const fixes = [
      // Fix double relative paths
      { from: /from ['"]\.\.\/(\.\.\/)+/g, to: "from '../" },

      // Fix incorrect entity paths
      {
        from: /from ['"]\.\.\/database\/entities\/([^'"]+)['"]/g,
        to: (match, entityName) => {
          if (entityName.includes('document')) {
            return "from '../database/entities/product-entities'";
          }
          return match;
        },
      },
    ];

    let updatedContent = content;

    fixes.forEach((fix) => {
      if (typeof fix.to === 'function') {
        updatedContent = updatedContent.replace(fix.from, fix.to);
      } else {
        updatedContent = updatedContent.replace(fix.from, fix.to);
      }
    });

    return updatedContent;
  }

  async createMissingEntityExports() {
    // Create missing entity re-exports
    const entityMappings = [
      {
        missingPath: 'src/database/entities/document-entities.ts',
        existingPath: 'src/database/entities/product-entities.ts',
        exports: ['FeatureDocumentEntity', 'TaskDocumentEntity', 'BaseDocumentEntity'],
      },
      {
        missingPath: 'src/types/task-types.ts',
        existingPath: 'src/types/shared-types.ts',
        exports: ['Task', 'TaskStatus', 'TaskType'],
      },
    ];

    for (const mapping of entityMappings) {
      const fullMissingPath = path.join(process.cwd(), mapping.missingPath);
      const fullExistingPath = path.join(process.cwd(), mapping.existingPath);

      // Skip if file already exists
      if (fs.existsSync(fullMissingPath)) {
        continue;
      }

      // Skip if source doesn't exist
      if (!fs.existsSync(fullExistingPath)) {
        console.warn(`⚠️  Source file doesn't exist: ${mapping.existingPath}`);
        continue;
      }

      // Create re-export file
      const relativePath = path.relative(
        path.dirname(fullMissingPath),
        fullExistingPath.replace('.ts', '')
      );

      const content = `/**
 * @file Re-export of entities from ${mapping.existingPath}
 * Generated by fix-import-paths.js - safe to edit
 */

// Re-export common entities
export {
${mapping.exports.map((exp) => `  ${exp},`).join('\n')}
} from '${relativePath}';

// Export everything else as well
export * from '${relativePath}';
`;

      // Ensure directory exists
      const dir = path.dirname(fullMissingPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullMissingPath, content);
      this.createdFiles.push(mapping.missingPath);
      console.log(`   ✅ Created ${mapping.missingPath}`);
    }
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Utility to find actual file locations
class FileLocationFinder {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'src');
  }

  async findActualLocation(searchName) {
    const pattern = path.join(this.baseDir, '**/*.{ts,tsx}');
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
    });

    const matches = files.filter((file) => {
      const basename = path.basename(file, path.extname(file));
      return basename.toLowerCase().includes(searchName.toLowerCase());
    });

    return matches;
  }
}

// Interactive mode for unknown imports
async function findMissingImports() {
  console.log('🔍 Scanning for missing imports...');

  // Run TypeScript compiler to get import errors
  const { spawn } = await import('child_process');

  return new Promise((resolve) => {
    const tsc = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck'], {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    let output = '';
    tsc.stderr.on('data', (data) => {
      output += data.toString();
    });

    tsc.on('close', () => {
      const importErrors = output
        .split('\n')
        .filter((line) => line.includes('TS2307'))
        .map((line) => {
          const match = line.match(/Cannot find module ['"]([^'"]+)['"]/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      const uniqueErrors = [...new Set(importErrors)];
      resolve(uniqueErrors);
    });
  });
}

// Main execution
async function main() {
  try {
    const fixer = new ImportPathFixer();
    await fixer.fix();

    console.log('\n🎉 Import path fixing complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run TypeScript compilation to verify fixes');
    console.log('   2. Check for any remaining TS2307 errors');
    console.log('   3. Update imports in remaining files manually if needed');
  } catch (error) {
    console.error('❌ Import path fixing failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ImportPathFixer, FileLocationFinder };
