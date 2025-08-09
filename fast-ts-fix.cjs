#!/usr/bin/env node

/**
 * Fast TypeScript Error Fixer
 * Systematically fixes missing imports based on error patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Known type mappings from error analysis
const TYPE_MAPPINGS = {
  // Config module types
  SystemConfiguration: './types',
  ValidationResult: './types',
  ConfigValidationResult: './types',
  ConfigHealthReport: './types',

  // Common interface patterns
  WasmNeuralBinding: '../core/interfaces/base-interfaces',
  NeuralConfig: '../core/interfaces/base-interfaces',
  NeuralNetworkInterface: '../core/interfaces/base-interfaces',

  // Add more as we discover patterns
};

// Directory-specific import mappings
const DIRECTORY_MAPPINGS = {
  'src/config': {
    SystemConfiguration: './types',
    ValidationResult: './types',
    ConfigValidationResult: './types',
    ConfigHealthReport: './types',
  },
  'src/bindings': {
    WasmNeuralBinding: '../core/interfaces/base-interfaces',
    NeuralConfig: '../core/interfaces/base-interfaces',
    NeuralNetworkInterface: '../core/interfaces/base-interfaces',
  },
};

function getTypeScriptErrors() {
  console.log('🔍 Getting TypeScript compilation errors...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout?.toString() || '';
    return parseErrors(output);
  }
}

function parseErrors(output) {
  const errors = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Match TS2304 "Cannot find name" errors
    const match = line.match(/^(.+\.ts)\((\d+),(\d+)\): error TS2304: Cannot find name '([^']+)'/);
    if (match) {
      const [, filePath, lineNum, col, typeName] = match;
      errors.push({
        file: filePath,
        line: parseInt(lineNum),
        column: parseInt(col),
        type: 'TS2304',
        typeName,
        message: line,
      });
    }
  }

  return errors;
}

function getImportPathForType(filePath, typeName) {
  // Check directory-specific mappings first
  const dir = path.dirname(filePath);
  if (DIRECTORY_MAPPINGS[dir] && DIRECTORY_MAPPINGS[dir][typeName]) {
    return DIRECTORY_MAPPINGS[dir][typeName];
  }

  // Check global mappings
  if (TYPE_MAPPINGS[typeName]) {
    return TYPE_MAPPINGS[typeName];
  }

  return null;
}

function addMissingImport(filePath, typeName, importPath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check if import already exists
  const importRegex = new RegExp(
    `import.*{[^}]*\\b${typeName}\\b[^}]*}.*from.*['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`
  );
  if (importRegex.test(content)) {
    return false; // Already imported
  }

  // Find existing imports from the same path
  const existingImportIndex = lines.findIndex(
    (line) => line.includes(`from '${importPath}'`) || line.includes(`from "${importPath}"`)
  );

  if (existingImportIndex !== -1) {
    // Add to existing import
    const existingLine = lines[existingImportIndex];
    const match = existingLine.match(/import\s*(?:type\s*)?\{\s*([^}]+)\s*\}/);
    if (match) {
      const imports = match[1]
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
      if (!imports.includes(typeName)) {
        imports.push(typeName);
        const newImportLine = existingLine.replace(/\{[^}]+\}/, `{ ${imports.join(', ')} }`);
        lines[existingImportIndex] = newImportLine;
        fs.writeFileSync(filePath, lines.join('\n'));
        return true;
      }
    }
  } else {
    // Add new import after existing imports
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && i > 0 && lines[i - 1].trim().startsWith('import ')) {
        insertIndex = i;
        break;
      }
    }

    const newImport = `import type { ${typeName} } from '${importPath}';`;
    lines.splice(insertIndex, 0, newImport);
    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  }

  return false;
}

function main() {
  console.log('🚀 Fast TypeScript Error Fixer');
  console.log('================================');

  const errors = getTypeScriptErrors();
  console.log(`📊 Found ${errors.length} TS2304 "Cannot find name" errors`);

  if (errors.length === 0) {
    console.log('✅ No TypeScript errors found!');
    return;
  }

  // Group by file for efficiency
  const errorsByFile = {};
  for (const error of errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }

  let fixedCount = 0;
  let skippedCount = 0;

  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    console.log(`\n🔧 Fixing ${filePath} (${fileErrors.length} errors)`);

    // Get unique type names for this file
    const uniqueTypes = [...new Set(fileErrors.map((e) => e.typeName))];

    for (const typeName of uniqueTypes) {
      const importPath = getImportPathForType(filePath, typeName);
      if (importPath) {
        const added = addMissingImport(filePath, typeName, importPath);
        if (added) {
          console.log(`   ✅ Added import: ${typeName} from '${importPath}'`);
          fixedCount++;
        } else {
          console.log(`   ⚪ Already imported: ${typeName}`);
        }
      } else {
        console.log(`   ❌ Unknown type: ${typeName} (skipped)`);
        skippedCount++;
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Fixed: ${fixedCount} imports`);
  console.log(`   ❌ Skipped: ${skippedCount} unknown types`);

  // Check if errors are resolved
  console.log('\n🔍 Verifying fixes...');
  const remainingErrors = getTypeScriptErrors();
  const remainingTS2304 = remainingErrors.filter((e) => e.type === 'TS2304');

  console.log(
    `📈 Progress: ${errors.length - remainingTS2304.length}/${errors.length} TS2304 errors fixed`
  );

  if (remainingTS2304.length > 0) {
    console.log('\n🔍 Remaining TS2304 errors:');
    const remainingTypes = [...new Set(remainingTS2304.map((e) => e.typeName))];
    for (const typeName of remainingTypes) {
      console.log(`   - ${typeName}`);
    }
  } else {
    console.log('\n🎉 All TS2304 errors fixed!');
  }
}

if (require.main === module) {
  main();
}
