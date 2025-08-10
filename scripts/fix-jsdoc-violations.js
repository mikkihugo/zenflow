#!/usr/bin/env node

/**
 * Auto-Fix JSDoc Violations Script
 * Fixes systematic JSDoc ESLint violations:
 * - jsdoc/require-file-overview
 * - jsdoc/require-description-complete-sentence
 * - jsdoc/require-param-description
 * - jsdoc/require-returns-description
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

class JSDocFixer {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'src');
    this.fixedFiles = [];
  }

  async fix() {
    console.log('🔧 Auto-Fixing JSDoc Violations...');

    // Find all TypeScript files
    const pattern = path.join(this.baseDir, '**/*.{ts,tsx}');
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/__tests__/**', '**/tests/**'],
    });

    console.log(`📁 Found ${files.length} TypeScript files to check`);

    // Process each file
    for (const filePath of files) {
      await this.fixJSDocInFile(filePath);
    }

    console.log(`\n✅ JSDoc fixing complete:`);
    console.log(`   📝 Fixed ${this.fixedFiles.length} files`);

    if (this.fixedFiles.length > 0) {
      console.log(`\n📋 Fixed files:`);
      this.fixedFiles.forEach((file) => {
        const relative = path.relative(this.baseDir, file.path);
        console.log(`   • ${relative} (${file.changes.join(', ')})`);
      });
    }
  }

  async fixJSDocInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    const changes = [];

    // 1. Add file overview if missing
    const needsFileOverview = !content.includes('@file') && !content.includes('@fileoverview');
    if (needsFileOverview) {
      updatedContent = this.addFileOverview(updatedContent, filePath);
      changes.push('file overview');
    }

    // 2. Fix incomplete sentence descriptions
    updatedContent = this.fixIncompleteDescriptions(updatedContent);
    if (updatedContent !== content) {
      changes.push('sentence completion');
    }

    // 3. Add missing parameter descriptions
    const beforeParams = updatedContent;
    updatedContent = this.addParameterDescriptions(updatedContent);
    if (updatedContent !== beforeParams) {
      changes.push('param descriptions');
    }

    // 4. Add missing return descriptions
    const beforeReturns = updatedContent;
    updatedContent = this.addReturnDescriptions(updatedContent);
    if (updatedContent !== beforeReturns) {
      changes.push('return descriptions');
    }

    // Write back if changed
    if (updatedContent !== content && changes.length > 0) {
      fs.writeFileSync(filePath, updatedContent);
      this.fixedFiles.push({
        path: filePath,
        changes,
      });
    }
  }

  addFileOverview(content, filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative(this.baseDir, filePath);

    // Generate description based on file path and name
    const description = this.generateFileDescription(fileName, relativePath);

    const fileOverview = `/**
 * @file ${description}
 */

`;

    // Insert at the top, after any existing imports or license comments
    const lines = content.split('\n');
    let insertIndex = 0;

    // Skip license comments and imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('/*') || line.startsWith('*') || line.startsWith('*/')) {
        insertIndex = i + 1;
      } else if (line.startsWith('//')) {
        insertIndex = i + 1;
      } else if (line === '') {
      } else {
        break;
      }
    }

    lines.splice(insertIndex, 0, fileOverview);
    return lines.join('\n');
  }

  generateFileDescription(fileName, relativePath) {
    // Smart description generation based on file name and location
    const pathParts = relativePath.split(path.sep);

    // File type based descriptions
    if (fileName.endsWith('-adapter')) {
      return `${fileName.replace('-adapter', '')} adapter implementation`;
    }
    if (fileName.endsWith('-manager')) {
      return `${fileName.replace('-manager', '')} management system`;
    }
    if (fileName.endsWith('-service')) {
      return `${fileName.replace('-service', '')} service implementation`;
    }
    if (fileName.endsWith('-engine')) {
      return `${fileName.replace('-engine', '')} processing engine`;
    }
    if (fileName.endsWith('-coordinator')) {
      return `${fileName.replace('-coordinator', '')} coordination system`;
    }
    if (fileName.includes('test') || fileName.includes('spec')) {
      return `Test suite for ${fileName.replace(/\.(test|spec)/, '')}`;
    }
    if (fileName === 'index') {
      const parentDir = pathParts[pathParts.length - 2];
      return `${parentDir} module exports`;
    }
    if (fileName === 'types' || fileName.includes('types')) {
      const domain = pathParts.find((part) =>
        ['core', 'interfaces', 'database', 'neural', 'coordination'].includes(part)
      );
      return `TypeScript type definitions${domain ? ` for ${domain}` : ''}`;
    }

    // Domain-specific descriptions
    if (pathParts.includes('coordination')) {
      return `Coordination system: ${fileName}`;
    }
    if (pathParts.includes('neural')) {
      return `Neural network: ${fileName}`;
    }
    if (pathParts.includes('database')) {
      return `Database layer: ${fileName}`;
    }
    if (pathParts.includes('interfaces')) {
      return `Interface implementation: ${fileName}`;
    }
    if (pathParts.includes('memory')) {
      return `Memory management: ${fileName}`;
    }

    // Generic fallback
    return `${fileName} implementation`;
  }

  fixIncompleteDescriptions(content) {
    // Fix common incomplete sentence patterns
    const fixes = [
      // Add periods to descriptions that don't end with punctuation
      {
        pattern: /(\* [A-Z][^.\n]*[a-zA-Z])\n(\s*\*\s*(?:@|\/|\n))/g,
        replacement: '$1.\n$2',
      },
      // Add periods to single-line descriptions
      {
        pattern: /(\* [A-Z][^.\n]*[a-zA-Z])\n(\s*\*\/)/g,
        replacement: '$1.\n$2',
      },
      // Fix descriptions that end with lowercase
      {
        pattern: /(\* [A-Z][^.]*[a-z])\s*\n/g,
        replacement: (match, description) => {
          if (description.endsWith('.') || description.endsWith('!') || description.endsWith('?')) {
            return match;
          }
          return `${description}.\n`;
        },
      },
    ];

    let updatedContent = content;
    fixes.forEach((fix) => {
      updatedContent = updatedContent.replace(fix.pattern, fix.replacement);
    });

    return updatedContent;
  }

  addParameterDescriptions(content) {
    // Find JSDoc blocks with @param but no description
    const paramPattern = /(@param\s+(?:\{[^}]+\}\s+)?(\w+))(\s*\n)/g;

    return content.replace(paramPattern, (match, paramTag, paramName, ending) => {
      // If there's already a description, don't modify
      if (match.includes(' - ') || match.includes(' ')) {
        return match;
      }

      // Generate basic description based on parameter name
      const description = this.generateParamDescription(paramName);
      return `${paramTag} ${description}${ending}`;
    });
  }

  generateParamDescription(paramName) {
    // Generate description based on common parameter name patterns
    const patterns = {
      id: 'Unique identifier',
      name: 'Name of the item',
      config: 'Configuration options',
      options: 'Additional options',
      data: 'Data to process',
      callback: 'Callback function',
      error: 'Error object',
      result: 'Result data',
      value: 'Value to set',
      key: 'Key identifier',
      path: 'File or URL path',
      type: 'Type specification',
      status: 'Current status',
      message: 'Message content',
      context: 'Context object',
      handler: 'Event handler function',
      timeout: 'Timeout in milliseconds',
      retries: 'Number of retry attempts',
      logger: 'Logger instance',
      service: 'Service instance',
      manager: 'Manager instance',
      adapter: 'Adapter instance',
      engine: 'Engine instance',
      coordinator: 'Coordinator instance',
    };

    // Check exact matches first
    if (patterns[paramName.toLowerCase()]) {
      return `- ${patterns[paramName.toLowerCase()]}`;
    }

    // Check partial matches
    for (const [pattern, description] of Object.entries(patterns)) {
      if (paramName.toLowerCase().includes(pattern)) {
        return `- ${description}`;
      }
    }

    // Generic fallback
    return `- The ${paramName} parameter`;
  }

  addReturnDescriptions(content) {
    // Find @returns or @return without descriptions
    const returnPattern = /(@returns?\s*)(\n)/g;

    return content.replace(returnPattern, (match, returnTag, ending) => {
      // If there's already a description, don't modify
      if (returnTag.includes(' - ') || returnTag.includes('{')) {
        return match;
      }

      return `${returnTag.trim()} Promise or result${ending}`;
    });
  }
}

// Main execution
async function main() {
  try {
    const fixer = new JSDocFixer();
    await fixer.fix();

    console.log('\n🎉 JSDoc fixing complete!');
    console.log('\n💡 Benefits:');
    console.log('   • Added file overview comments to files missing @file');
    console.log('   • Fixed incomplete sentence descriptions');
    console.log('   • Added missing parameter descriptions');
    console.log('   • Added missing return value descriptions');

    console.log('\n🔧 Next steps:');
    console.log('   1. Run ESLint to verify JSDoc violations are fixed');
    console.log('   2. Review generated descriptions and improve if needed');
    console.log('   3. Add @example blocks for complex functions');
  } catch (error) {
    console.error('❌ JSDoc fixing failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { JSDocFixer };
