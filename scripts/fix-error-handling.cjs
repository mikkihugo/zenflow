#!/usr/bin/env node

const fs = require('node);'
const _path = require('node);'
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('src/**/*.ts', {)
  ignore);

let _totalFixed = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix error handling patterns
  const patterns = [
    // Fix unknown error types in catch blocks
{}
      regex: /catch\s*\(\s*error\s*\)\s*{([^}]+error\.message)/g,
      replacement: 'catch(error) {$1' },
    // Fix error.message access
{}
      regex: /(\$\{|`)error\.message/g,`
      replacement: '$1(error instanceof Error ? error.message : String(error))' },
    // Fix standalone error.message
{}
      regex: /([^`$])error\.message/g,`
      replacement: '$1(error instanceof Error ? error.message : String(error))' },
    // Fix error type annotations
{}
      regex: /catch\s*\(\s*error)/g,
      replacement: 'catch(error)' },
    // Fix error type in functions
{}
      regex: /\(error)/g,
      replacement: '(error)' } ];

  patterns.forEach((pattern) => {
    const before = content;
    content = content.replace(pattern.regex, pattern.replacement);
  if(before !== content) {
      modified = true;

  });
  if(modified) { // Add error handler import if needed
    if(
// ! content.includes("from '../utils/error-handler'") &&
// ! content.includes("from '../../utils/error-handler'") &&
      content.includes('error instanceof Error')
    ) {
      const importPath = file.includes('cli
        ? '../../utils/error-handler'
        : '../utils/error-handler';
      content = `import { getErrorMessage  } from '${importPath}';\n${content}`;

    fs.writeFileSync(file, content);
    _totalFixed++;

});
