#!/usr/bin/env node;
/**
 * Documentation Validation Script;
 * Validates documentation files for completeness and consistency;
 */

import fs from 'node:fs/promises';
import path from 'node:path';

class DocumentationValidator {
  constructor() {
    this.docsDir = 'docs/api';
    this.examplesDir = 'examples';
    this.errors = [];
    this.warnings = [];
  }
  async validate() {
    console.warn('🔍 Validating API documentation...');
    try {
  // await this.validateDocumentationStructure();
  // await this.validateMarkdownFiles();
      this.reportResults();
      return this.errors.length === 0;
    //   // LINT: unreachable code removed} catch (error) {
      console.error('❌ Validation failed:', error);
      return false;
    //   // LINT: unreachable code removed}
  }
    async;
    validateDocumentationStructure();
    {
      console.warn('📁 Validating documentation structure...');
      const _requiredFiles = [
        ;
      'docs/api/README.md',
      'docs/api/server-api.md',
      'docs/api/mcp-tools.md',
      'docs/api/swarm-coordination.md',
      'docs/api/memory-api.md',
      'docs/api/plugin-api.md',
      'docs/api/workflow-api.md',
      'docs/api/websocket-api.md',
      'docs/api/schema.md',
      'docs/api/errors.md',,,,,,,,
      ];
      for (const file of requiredFiles) {
        try {
  // await fs.access(file);
        console.warn(`  ✅ ${file}`);
      } catch (/* _error */) {
        this.errors.push(`Missing required file: ${file}`);
        console.warn(`  ❌ ${file} - Missing`);
      }
      }
      // Check examples directory
      try {
      const _exampleStats = await fs.stat('examples');
      if (exampleStats.isDirectory()) {
        console.warn('  ✅ examples directory exists');
      }
    } catch (/* _error */) {
      this.errors.push('Missing examples directory');
    }
    }
    async;
    validateMarkdownFiles();
    console.warn('📝 Validating markdown files...');
    try {
      const _files = await fs.readdir(this.docsDir);
      const _markdownFiles = files.filter((file) => file.endsWith('.md'));
      for (const file of markdownFiles) {
        const _filepath = path.join(this.docsDir, file);
        try {
          const _content = await fs.readFile(filepath, 'utf-8');
          this.validateMarkdownContent(file, content);
        } catch (error) {
          this.errors.push(`Cannot read file: ${file} - ${error.message}`);
        }
      }
    } catch (error) {
      this.errors.push(`Cannot read docs directory: ${error.message}`);
    }
    validateMarkdownContent(filename, content);
    {
      // Check for title
      if (!content.startsWith('# ')) {
        this.warnings.push(`${filename}: Missing H1 title`);
      }
      // Check for basic content
      if (content.length < 500) {
        this.warnings.push(`${filename}: Very short content, may be incomplete`);
      }
      // Check for code blocks
      const _codeBlocks = content.match(/```/g);
      if (codeBlocks && codeBlocks.length % 2 !== 0) {
        this.errors.push(`${filename}: Unclosed code block`);
      }
      console.warn(`  ✅ ${filename} - Content validated`);
    }
    reportResults();
    console.warn('\n📊 Validation Results:');
    console.warn(`✅ Errors: ${this.errors.length}`);
    console.warn(`⚠️  Warnings: ${this.warnings.length}`);
    if (this.errors.length > 0) {
      console.warn('\n❌ Errors:');
      this.errors.forEach((error) => console.warn(`  • ${error}`));
    }
    if (this.warnings.length > 0) {
      console.warn('\n⚠️  Warnings:');
      this.warnings.forEach((warning) => console.warn(`  • ${warning}`));
    }
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.warn('\n🎉 All documentation is valid!');
    } else if (this.errors.length === 0) {
      console.warn('\n✅ Documentation is valid with minor warnings');
    } else {
      console.warn('\n❌ Documentation validation failed');
    }
  }
  // CLI runner
  async function
  main() {
  const _validator = new DocumentationValidator();
  const _isValid = await validator.validate();
  if (!isValid) {
    process.exit(1);
  }
}
  // Run if called directly
  if (import._meta._url === `file://${process.argv[1]}`) {
  main()
  .catch(
  console;
  .
  error;
  )
}
export { DocumentationValidator };
