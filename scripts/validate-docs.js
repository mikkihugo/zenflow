#!/usr/bin/env node
/**
 * Documentation Validation Script
 * Validates documentation files for completeness and consistency
 */

import fs from 'fs/promises';
import path from 'path';

class DocumentationValidator {
  constructor() {
    this.docsDir = 'docs/api';
    this.examplesDir = 'examples';
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    console.log('🔍 Validating API documentation...');

    try {
      await this.validateDocumentationStructure();
      await this.validateMarkdownFiles();
      
      this.reportResults();
      
      return this.errors.length === 0;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      return false;
    }
  }

  async validateDocumentationStructure() {
    console.log('📁 Validating documentation structure...');
    
    const requiredFiles = [
      'docs/api/README.md',
      'docs/api/server-api.md',
      'docs/api/mcp-tools.md',
      'docs/api/swarm-coordination.md',
      'docs/api/memory-api.md',
      'docs/api/plugin-api.md',
      'docs/api/workflow-api.md',
      'docs/api/websocket-api.md',
      'docs/api/schema.md',
      'docs/api/errors.md'
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(file);
        console.log(`  ✅ ${file}`);
      } catch (error) {
        this.errors.push(`Missing required file: ${file}`);
        console.log(`  ❌ ${file} - Missing`);
      }
    }

    // Check examples directory
    try {
      const exampleStats = await fs.stat('examples');
      if (exampleStats.isDirectory()) {
        console.log('  ✅ examples directory exists');
      }
    } catch (error) {
      this.errors.push('Missing examples directory');
    }
  }

  async validateMarkdownFiles() {
    console.log('📝 Validating markdown files...');
    
    try {
      const files = await fs.readdir(this.docsDir);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      for (const file of markdownFiles) {
        const filepath = path.join(this.docsDir, file);
        try {
          const content = await fs.readFile(filepath, 'utf-8');
          this.validateMarkdownContent(file, content);
        } catch (error) {
          this.errors.push(`Cannot read file: ${file} - ${error.message}`);
        }
      }
    } catch (error) {
      this.errors.push(`Cannot read docs directory: ${error.message}`);
    }
  }

  validateMarkdownContent(filename, content) {
    // Check for title
    if (!content.startsWith('# ')) {
      this.warnings.push(`${filename}: Missing H1 title`);
    }

    // Check for basic content
    if (content.length < 500) {
      this.warnings.push(`${filename}: Very short content, may be incomplete`);
    }

    // Check for code blocks
    const codeBlocks = content.match(/```/g);
    if (codeBlocks && codeBlocks.length % 2 !== 0) {
      this.errors.push(`${filename}: Unclosed code block`);
    }

    console.log(`  ✅ ${filename} - Content validated`);
  }

  reportResults() {
    console.log('\n📊 Validation Results:');
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 All documentation is valid!');
    } else if (this.errors.length === 0) {
      console.log('\n✅ Documentation is valid with minor warnings');
    } else {
      console.log('\n❌ Documentation validation failed');
    }
  }
}

// CLI runner
async function main() {
  const validator = new DocumentationValidator();
  const isValid = await validator.validate();
  
  if (!isValid) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DocumentationValidator };