#!/usr/bin/env node

/**
 * Fix final TypeScript syntax errors systematically
 * Targets: stray periods, JSX issues, identifier problems
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing final TypeScript syntax errors...\n');

// Get remaining errors
const buildOutput = execSync('npm run build 2>&1 || true', { encoding: 'utf8' });
const errorLines = buildOutput
  .split('\n')
  .filter((line) => line.includes(') error TS'))
  .slice(0, 50); // Limit to first 50 errors

console.log(`Found ${errorLines.length} TypeScript errors to fix:`);

// Parse errors by file
const errorsByFile = new Map();
errorLines.forEach((line) => {
  const match = line.match(/^([^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (match) {
    const [, file, lineNum, col, errorCode, message] = match;
    if (!errorsByFile.has(file)) {
      errorsByFile.set(file, []);
    }
    errorsByFile.get(file).push({
      line: parseInt(lineNum),
      column: parseInt(col),
      code: errorCode,
      message: message.trim(),
    });
  }
});

console.log(`Grouped into ${errorsByFile.size} files with errors\n`);

let fixedCount = 0;

// Fix each file
for (const [filePath, errors] of errorsByFile) {
  console.log(`📁 Fixing ${filePath} (${errors.length} errors):`);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    // Sort errors by line number (descending) to avoid line number shifts
    errors.sort((a, b) => b.line - a.line);

    for (const error of errors) {
      const lineIndex = error.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) continue;

      const line = lines[lineIndex];
      let fixedLine = line;

      // Fix specific error patterns
      switch (error.code) {
        case 'TS1003': // Identifier expected
          // Fix stray periods in type annotations
          if (error.message.includes('Identifier expected') && line.includes('.')) {
            // Pattern: SomeType. -> SomeType
            fixedLine = line.replace(/([A-Za-z_][A-Za-z0-9_]*)\.\s*$/, '$1');
            // Pattern: options?. -> options?
            fixedLine = fixedLine.replace(/([A-Za-z_][A-Za-z0-9_]*)\?\.\s*$/, '$1?');
            // Pattern: VectorSearchOptions. -> VectorSearchOptions
            fixedLine = fixedLine.replace(/([A-Za-z_][A-Za-z0-9_]*)\.\s*\)/, '$1)');
          }
          break;

        case 'TS1382': // Unexpected token JSX
          // Fix JSX syntax issues
          if (error.message.includes("Did you mean `{'>'}`")) {
            fixedLine = line.replace(/>\s*$/, "{'>'}");
          }
          if (error.message.includes("Did you mean `{'}'}`")) {
            fixedLine = line.replace(/}\s*$/, "{'}'}");
          }
          break;

        case 'TS1005': // Expected semicolon or other punctuation
          // Add missing parentheses/semicolons
          if (error.message.includes("')' expected")) {
            // Find missing closing parenthesis
            const openCount = (line.match(/\(/g) || []).length;
            const closeCount = (line.match(/\)/g) || []).length;
            if (openCount > closeCount) {
              fixedLine = line + ')';
            }
          }
          break;

        case 'TS1381': // Unexpected token
          if (error.message.includes('rbrace')) {
            fixedLine = line.replace(/}\s*$/, '}');
          }
          break;

        case 'TS1128': // Declaration or statement expected
          // Remove orphaned lines that shouldn't be there
          if (line.trim() === '>' || line.trim() === '}') {
            fixedLine = '';
          }
          break;

        case 'TS1109': // Expression expected
          // Remove invalid expression lines
          if (line.trim().match(/^[>}]\s*$/)) {
            fixedLine = '';
          }
          break;

        case 'TS1002': // Unterminated string literal
          // Fix unterminated strings
          if (!line.match(/['"][^'"]*$/)) {
            const lastQuote = line.lastIndexOf('"') > line.lastIndexOf("'") ? '"' : "'";
            if (line.endsWith(lastQuote) === false) {
              fixedLine = line + lastQuote;
            }
          }
          break;

        case 'TS1434': // Unexpected keyword
          // Fix malformed shebang continuations
          if (line.includes('#!/usr/bin/env node') && error.column > 20) {
            const shebangPart = line.substring(0, error.column - 1);
            const restPart = line.substring(error.column - 1);
            fixedLine = shebangPart; // Keep only the valid shebang part
          }
          break;
      }

      if (fixedLine !== line) {
        lines[lineIndex] = fixedLine;
        console.log(
          `  ✅ Fixed ${error.code} at line ${error.line}: "${line.trim()}" → "${fixedLine.trim()}"`
        );
        modified = true;
        fixedCount++;
      } else {
        console.log(`  ⚠️ Could not auto-fix ${error.code} at line ${error.line}: ${error.message}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`  📝 Updated ${filePath}`);
    } else {
      console.log(`  ℹ️ No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }

  console.log('');
}

console.log(`🎉 Fixed ${fixedCount} syntax errors\n`);

// Verify improvements
try {
  const newBuildOutput = execSync('npm run build 2>&1 || true', { encoding: 'utf8' });
  const remainingErrors = newBuildOutput
    .split('\n')
    .filter((line) => line.includes(') error TS')).length;

  console.log(`📊 TypeScript errors: Before: ${errorLines.length}, After: ${remainingErrors}`);
  if (remainingErrors < errorLines.length) {
    console.log(
      `🚀 Reduced errors by ${errorLines.length - remainingErrors} (${Math.round(((errorLines.length - remainingErrors) / errorLines.length) * 100)}% improvement)`
    );
  }
} catch (error) {
  console.log('⚠️ Could not verify improvements due to build error');
}
