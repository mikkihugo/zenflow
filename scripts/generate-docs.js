#!/usr/bin/env node;

/** Documentation Generation Script;
/** Generates comprehensive API documentation from JSDoc comments and schema;

import fs from 'node:fs';
import path from 'node:path';
import { glob  } from 'glob';

class DocumentationGenerator {
  constructor() {
    this.sourceDir = 'src';
    this.docsDir = 'docs
    this.outputFile = 'docs/api/generated-api.md';
  //   }
  async generate() { 
    console.warn(' Generating API documentation...');
    try 
      // Ensure docs directory exists
  // // await fs.mkdir(this.docsDir, { recursive });
      // Find all JavaScript files with JSDoc comments
// const _jsFiles = awaitglob('src/\*\*/*.js');
      console.warn(` Found ${jsFiles.length} JavaScript files`);
      // Extract JSDoc comments
// const _apiDocs = awaitthis.extractJSDocFromFiles(jsFiles);
      // Generate markdown documentation
// const _markdown = awaitthis.generateMarkdown(apiDocs);
      // Write to file
  // // await fs.writeFile(this.outputFile, markdown);
      console.warn(` Documentation generated);`
      // return this.outputFile;
    //   // LINT: unreachable code removed} catch(error) {
      console.error(' Documentation generation failed);'
      throw error;
    //     }
  //   }
  async extractJSDocFromFiles(files) { 
    const _apiDocs = [];
    for (const file of files) 
      try {
// const _content = awaitfs.readFile(file, 'utf-8'); 
        const _docs = this.extractJSDocFromContent(content, file); if(docs.length > 0) {
          apiDocs.push({ file,)
            docs   });
        //         }
    //     }
    catch(error)
        console.warn(` Could not process file \$`
      file)
    :`, error.message)`
  //   }
  return;
  apiDocs;
  //   // LINT: unreachable code removed}
  extractJSDocFromContent(content, filename) {
    const _docs = [];
    const _jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    const _matches = content.match(jsdocRegex);
    if(!matches) return docs;
    // ; // LINT: unreachable code removed
    matches.forEach((match, index) => {
      const _parsed = this.parseJSDocComment(match);
  if(parsed) {
        // Try to find the function/class that follows this comment
        const _afterComment = content.substring(content.indexOf(match) + match.length);
        const _functionMatch = afterComment.match(;)
// (?)?(?)\s+(\w+)/
        );
        docs.push({ ...parsed,
          name: functionMatch ? functionMatch[1] : `Item ${index + 1 }`,)
          filename: path.basename(filename),
          filepath });
      //       }
  })
  return
  docs;
  //   // LINT: unreachable code removed}
  parseJSDocComment(comment) {
    const _lines = comment.split('\n').map((line) => line.replace(/^\s*\*\s?/, '').trim());
    const _doc = {
      description: '',
    params: [],
    returns,
    // example: '', // LINT: unreachable code removed
    tags: []
// }
  let;
  _currentSection = 'description';
  let;
  _currentParam = null;
  for(const line _of _lines) {
      if(line.startsWith('/**')  ?? line.startsWith('*/')  ?? line === '') {
        continue; //       }
      if(line.startsWith('@param')) {
        currentSection = 'param'; const _paramMatch = line.match(/@param\s+\{([^}]+) {\}\s+(\w+)\s*-?\s*(.*)/);
  if(paramMatch) {
          currentParam = {
            type: paramMatch[1],
            name: paramMatch[2],
            description: paramMatch[3] };
          doc.params.push(currentParam);
        //         }
      //       }
  else;
  if(_line._startsWith('@returns')
  ??
  line;

  startsWith('@return')
  ) {
  currentSection = 'returns';
  // const _returnMatch = line.match(/@returns?\s+\{([^ // LINT]+)\}\s*(.*)/);
  if(returnMatch) {
    doc.returns = {
            type: returnMatch[1],
    // description: returnMatch[2], // LINT: unreachable code removed
  //   }
// }
} else
if(line.startsWith('@example')) {
  currentSection = 'example';
} else if(line.startsWith('@')) {
  const _tagMatch = line.match(/@(\w+)\s*(.*)/);
  if(tagMatch) {
    doc.tags.push({ name: tagMatch[1],
    value: tagMatch[2])
  })
// }
} else
// {
  // Continue previous section
  if(currentSection === 'description') {
    doc.description += (doc.description ? ' ' ) + line;
  } else if(currentSection === 'example') {
    doc.example += (doc.example ? '\n' ) + line;
  } else if(currentSection === 'param' && currentParam) {
    currentParam.description += (currentParam.description ? ' ' ) + line;
  } else if(currentSection === 'returns' && doc.returns) {
    doc.returns.description += (doc.returns.description ? ' ' ) + line;
    //   // LINT: unreachable code removed}
  //   }
// }
// return doc.description ? doc ;
//   // LINT: unreachable code removed}
async;
generateMarkdown(apiDocs);
// {
    const _markdown = `# Generated API Documentation`
This documentation is automatically generated from JSDoc comments in the source code.
*Generated on: ${new Date().toISOString()}*
## Table of Contents
`;`
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
  if(doc.description) {
          markdown += `${doc.description}\n\n`;
        //         }
  if(doc.params.length > 0) {
          markdown += '**Parameters:**\n\n';
          doc.params.forEach((param) => {
            markdown += `- \`${param.name}\` (\`${param.type}\`): ${param.description}\n`;
          });
          markdown += '\n';
        //         }
  if(doc.returns) {
          markdown += `**Returns:** \`${doc.returns.type}\` - ${doc.returns.description}\n\n`;
    //   // LINT: unreachable code removed}
  if(doc.example) {
          markdown += '**Example:**\n\n```javascript\n';`
          markdown += doc.example;
          markdown += '\n```\n\n';`
        //         }
  if(doc.tags.length > 0) {
          markdown += '**Tags:**\n\n';
          doc.tags.forEach((tag) => {
            markdown += `- **${tag.name}**: ${tag.value}\n`;
          });
          markdown += '\n';
        //         }
        markdown += `**Source:** \`${doc.filepath}\`\n\n`;
        markdown += '---\n\n';
      });
    });
    // return markdown;
    //   // LINT: unreachable code removed}
  slugify(text)
    // return text;
    // .toLowerCase(); // LINT: unreachable code removed
replace(/[^a-z0-9]+/g, '-');
replace(/^-+|-+$/g, '');
// }
// CLI runner
async function main() {
  const _generator = new DocumentationGenerator();
  // await generator.generate();
// }
// Run if called directly
  if(import.meta.url === `file) {`
  main().catch(console.error);
// }
// export { DocumentationGenerator };
