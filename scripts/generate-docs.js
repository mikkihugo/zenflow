#!/usr/bin/env node
/**
 * Documentation Generation Script
 * Generates comprehensive API documentation from JSDoc comments and schema
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

class DocumentationGenerator {
  constructor() {
    this.sourceDir = 'src';
    this.docsDir = 'docs/api';
    this.outputFile = 'docs/api/generated-api.md';
  }

  async generate() {
    console.warn('🚀 Generating API documentation...');

    try {
      // Ensure docs directory exists
      await fs.mkdir(this.docsDir, { recursive: true });

      // Find all JavaScript files with JSDoc comments
      const jsFiles = await glob('src/**/*.js');
      console.warn(`📁 Found ${jsFiles.length} JavaScript files`);

      // Extract JSDoc comments
      const apiDocs = await this.extractJSDocFromFiles(jsFiles);

      // Generate markdown documentation
      const markdown = await this.generateMarkdown(apiDocs);

      // Write to file
      await fs.writeFile(this.outputFile, markdown);
      console.warn(`✅ Documentation generated: ${this.outputFile}`);

      return this.outputFile;
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      throw error;
    }
  }

  async extractJSDocFromFiles(files) {
    const apiDocs = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const docs = this.extractJSDocFromContent(content, file);
        if (docs.length > 0) {
          apiDocs.push({
            file,
            docs,
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not process file ${file}:`, error.message);
      }
    }

    return apiDocs;
  }

  extractJSDocFromContent(content, filename) {
    const docs = [];
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = content.match(jsdocRegex);

    if (!matches) return docs;

    matches.forEach((match, index) => {
      const parsed = this.parseJSDocComment(match);
      if (parsed) {
        // Try to find the function/class that follows this comment
        const afterComment = content.substring(content.indexOf(match) + match.length);
        const functionMatch = afterComment.match(
          /(?:export\s+)?(?:class|function|const|let|var)\s+(\w+)/
        );

        docs.push({
          ...parsed,
          name: functionMatch ? functionMatch[1] : `Item ${index + 1}`,
          filename: path.basename(filename),
          filepath: filename,
        });
      }
    });

    return docs;
  }

  parseJSDocComment(comment) {
    const lines = comment.split('\n').map((line) => line.replace(/^\s*\*\s?/, '').trim());

    const doc = {
      description: '',
      params: [],
      returns: null,
      example: '',
      tags: [],
    };

    let currentSection = 'description';
    let currentParam = null;

    for (const line of lines) {
      if (line.startsWith('/**') || line.startsWith('*/') || line === '') {
        continue;
      }

      if (line.startsWith('@param')) {
        currentSection = 'param';
        const paramMatch = line.match(/@param\s+\{([^}]+)\}\s+(\w+)\s*-?\s*(.*)/);
        if (paramMatch) {
          currentParam = {
            type: paramMatch[1],
            name: paramMatch[2],
            description: paramMatch[3],
          };
          doc.params.push(currentParam);
        }
      } else if (line.startsWith('@returns') || line.startsWith('@return')) {
        currentSection = 'returns';
        const returnMatch = line.match(/@returns?\s+\{([^}]+)\}\s*(.*)/);
        if (returnMatch) {
          doc.returns = {
            type: returnMatch[1],
            description: returnMatch[2],
          };
        }
      } else if (line.startsWith('@example')) {
        currentSection = 'example';
      } else if (line.startsWith('@')) {
        const tagMatch = line.match(/@(\w+)\s*(.*)/);
        if (tagMatch) {
          doc.tags.push({
            name: tagMatch[1],
            value: tagMatch[2],
          });
        }
      } else {
        // Continue previous section
        if (currentSection === 'description') {
          doc.description += (doc.description ? ' ' : '') + line;
        } else if (currentSection === 'example') {
          doc.example += (doc.example ? '\n' : '') + line;
        } else if (currentSection === 'param' && currentParam) {
          currentParam.description += (currentParam.description ? ' ' : '') + line;
        } else if (currentSection === 'returns' && doc.returns) {
          doc.returns.description += (doc.returns.description ? ' ' : '') + line;
        }
      }
    }

    return doc.description ? doc : null;
  }

  async generateMarkdown(apiDocs) {
    let markdown = `# Generated API Documentation

This documentation is automatically generated from JSDoc comments in the source code.

*Generated on: ${new Date().toISOString()}*

## Table of Contents

`;

    // Generate table of contents
    apiDocs.forEach((fileDoc) => {
      markdown += `- [${fileDoc.file}](#${this.slugify(fileDoc.file)})\n`;
      fileDoc.docs.forEach((doc) => {
        markdown += `  - [${doc.name}](#${this.slugify(doc.name)})\n`;
      });
    });

    markdown += '\n---\n\n';

    // Generate detailed documentation
    apiDocs.forEach((fileDoc) => {
      markdown += `## ${fileDoc.file}\n\n`;

      fileDoc.docs.forEach((doc) => {
        markdown += `### ${doc.name}\n\n`;

        if (doc.description) {
          markdown += `${doc.description}\n\n`;
        }

        if (doc.params.length > 0) {
          markdown += '**Parameters:**\n\n';
          doc.params.forEach((param) => {
            markdown += `- \`${param.name}\` (\`${param.type}\`): ${param.description}\n`;
          });
          markdown += '\n';
        }

        if (doc.returns) {
          markdown += `**Returns:** \`${doc.returns.type}\` - ${doc.returns.description}\n\n`;
        }

        if (doc.example) {
          markdown += '**Example:**\n\n```javascript\n';
          markdown += doc.example;
          markdown += '\n```\n\n';
        }

        if (doc.tags.length > 0) {
          markdown += '**Tags:**\n\n';
          doc.tags.forEach((tag) => {
            markdown += `- **${tag.name}**: ${tag.value}\n`;
          });
          markdown += '\n';
        }

        markdown += `**Source:** \`${doc.filepath}\`\n\n`;
        markdown += '---\n\n';
      });
    });

    return markdown;
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// CLI runner
async function main() {
  const generator = new DocumentationGenerator();
  await generator.generate();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DocumentationGenerator };
