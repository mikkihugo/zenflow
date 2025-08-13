/**
 * jscodeshift transformer for naming convention fixes
 * Removes generic prefixes and enforces descriptive naming
 */

const path = require('path');
const fs = require('fs');

// Generic prefixes to remove/replace
const GENERIC_PREFIXES = {
  'comprehensive-': '',
  'unified-': '',
  'simple-': '',
  'enhanced-': '',
  'complete-': '',
  'basic-': '',
  'advanced-': '',
  'generic-': '',
  'general-': '',
  'common-': '',
  'standard-': '',
  'default-': '',
  'main-': '',
  'core-': '', // Only remove if followed by domain name
};

// Specific replacements for better naming
const NAMING_REPLACEMENTS = {
  'comprehensive-sparc-test': 'sparc-integration-test',
  'unified-memory-system': 'memory-manager',
  'enhanced-terminal-router': 'terminal-router',
  'complete-integration-example': 'integration-example',
  'simple-claude-lint': 'claude-linter',
  'enhanced-websocket-client': 'websocket-client',
  'dspy-enhanced-operations': 'dspy-operations',
  'dspy-enhanced-tools': 'dspy-tools',
  'knowledge-enhanced-discovery': 'knowledge-discovery',
  'complete-system-integration': 'system-integration',
  'complete-workflow-automation': 'workflow-automation',
  'unified-di-integration': 'di-integration',
  'neural-presets-complete': 'neural-presets',
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const source = j(file.source);

  let hasChanges = false;
  const fileName = path.basename(file.path, path.extname(file.path));

  // Check if file needs renaming
  const newFileName = getImprovedFileName(fileName);
  if (newFileName !== fileName) {
    // Log renaming suggestion (actual file renaming handled separately)
    console.log(`📝 RENAME SUGGESTION: ${fileName} → ${newFileName}`);
    hasChanges = true;
  }

  // Fix class names with generic prefixes
  source.find(j.ClassDeclaration).forEach((path) => {
    const className = path.value.id?.name;
    if (className && hasGenericPrefix(className)) {
      const newClassName = removeGenericPrefix(className);
      if (newClassName !== className) {
        console.log(`🏷️  CLASS RENAME: ${className} → ${newClassName}`);
        path.value.id.name = newClassName;
        hasChanges = true;
      }
    }
  });

  // Fix interface names with generic prefixes
  source.find(j.TSInterfaceDeclaration).forEach((path) => {
    const interfaceName = path.value.id?.name;
    if (interfaceName && hasGenericPrefix(interfaceName)) {
      const newInterfaceName = removeGenericPrefix(interfaceName);
      if (newInterfaceName !== interfaceName) {
        console.log(
          `🔌 INTERFACE RENAME: ${interfaceName} → ${newInterfaceName}`
        );
        path.value.id.name = newInterfaceName;
        hasChanges = true;
      }
    }
  });

  // Fix function names with generic prefixes
  source.find(j.FunctionDeclaration).forEach((path) => {
    const functionName = path.value.id?.name;
    if (functionName && hasGenericPrefix(functionName)) {
      const newFunctionName = removeGenericPrefix(functionName);
      if (newFunctionName !== functionName) {
        console.log(`⚙️  FUNCTION RENAME: ${functionName} → ${newFunctionName}`);
        path.value.id.name = newFunctionName;
        hasChanges = true;
      }
    }
  });

  // Fix variable names with generic prefixes (only exported/important ones)
  source.find(j.VariableDeclarator).forEach((path) => {
    if (path.value.id?.type === 'Identifier') {
      const varName = path.value.id.name;
      if (varName && hasGenericPrefix(varName) && isImportantVariable(path)) {
        const newVarName = removeGenericPrefix(varName);
        if (newVarName !== varName) {
          console.log(`📦 VARIABLE RENAME: ${varName} → ${newVarName}`);
          path.value.id.name = newVarName;
          hasChanges = true;
        }
      }
    }
  });

  // Fix underscore prefixing issues
  source.find(j.Identifier).forEach((path) => {
    const name = path.value.name;
    if (name && name.startsWith('_') && !isPrivateMember(path)) {
      const newName = name.substring(1);
      if (newName && !isReservedWord(newName)) {
        console.log(
          `🔧 UNDERSCORE REMOVAL: ${name} → ${newName} (not private)`
        );
        path.value.name = newName;
        hasChanges = true;
      }
    }
  });

  return hasChanges ? source.toSource() : null;
};

function getImprovedFileName(fileName) {
  // Check specific replacements first
  if (NAMING_REPLACEMENTS[fileName]) {
    return NAMING_REPLACEMENTS[fileName];
  }

  // Remove generic prefixes
  let improved = fileName;
  Object.entries(GENERIC_PREFIXES).forEach(([prefix, replacement]) => {
    if (improved.startsWith(prefix)) {
      improved = replacement + improved.slice(prefix.length);
    }
  });

  // Clean up any double dashes or leading dashes
  improved = improved.replace(/^-+/, '').replace(/-+/g, '-');

  return improved || fileName; // Fallback to original if empty
}

function hasGenericPrefix(name) {
  const lowerName = name.toLowerCase();
  return Object.keys(GENERIC_PREFIXES).some(
    (prefix) =>
      lowerName.startsWith(prefix.replace('-', '')) ||
      lowerName.startsWith(prefix)
  );
}

function removeGenericPrefix(name) {
  // Handle CamelCase names
  const camelCasePattern =
    /^(Comprehensive|Unified|Simple|Enhanced|Complete|Basic|Advanced|Generic|General|Common|Standard|Default|Main|Core)(.+)$/;
  const match = name.match(camelCasePattern);

  if (match) {
    const [, prefix, rest] = match;
    // Special cases where we want to keep some meaning
    if (prefix === 'Core' && rest.length < 6) {
      return name; // Keep short core names
    }
    return rest;
  }

  // Handle kebab-case names
  return getImprovedFileName(name);
}

function isImportantVariable(path) {
  // Check if variable is exported or is a constant
  const parent = path.parent;

  // Check if it's an export
  if (
    parent.value.type === 'ExportNamedDeclaration' ||
    parent.value.type === 'ExportDefaultDeclaration'
  ) {
    return true;
  }

  // Check if it's a const (likely configuration or important value)
  if (parent.value.kind === 'const') {
    return true;
  }

  // Check if it's in all caps (likely constant)
  const varName = path.value.id.name;
  if (varName && varName === varName.toUpperCase()) {
    return true;
  }

  return false;
}

function isPrivateMember(path) {
  // Check if this identifier is actually a private member
  const parent = path.parent;

  // Check if it's a class property/method
  if (
    parent.value.type === 'ClassProperty' ||
    parent.value.type === 'MethodDefinition' ||
    parent.value.type === 'PropertyDefinition'
  ) {
    return true;
  }

  // Check if it's inside a class body
  let currentPath = path;
  while (currentPath.parent) {
    currentPath = currentPath.parent;
    if (
      currentPath.value.type === 'ClassDeclaration' ||
      currentPath.value.type === 'ClassExpression'
    ) {
      return true;
    }
  }

  // Check if it follows private member patterns (TypeScript private modifier)
  const name = path.value.name;

  // If it's a method parameter or local variable, it's probably not private
  if (
    parent.value.type === 'FunctionDeclaration' ||
    parent.value.type === 'FunctionExpression' ||
    parent.value.type === 'ArrowFunctionExpression'
  ) {
    return false;
  }

  // Check if name suggests it should be private (internal, implementation details)
  const privatePatterns = [
    /^_instance/,
    /^_config/,
    /^_state/,
    /^_cache/,
    /^_internal/,
    /^_logger/,
    /^_client/,
    /^_connection/,
    /^_handler/,
  ];

  return privatePatterns.some((pattern) => pattern.test(name));
}

function isReservedWord(word) {
  const reserved = [
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'let',
    'static',
    'enum',
    'implements',
    'interface',
    'package',
    'private',
    'protected',
    'public',
  ];

  return reserved.includes(word.toLowerCase());
}

// File renaming function (to be called separately)
function generateFileRenamingScript() {
  const renamingPairs = Object.entries(NAMING_REPLACEMENTS)
    .map(
      ([old, new_]) =>
        `mv "src/**/*${old}*" "src/**/*${new_}*" 2>/dev/null || true`
    )
    .join('\n');

  return `#!/bin/bash
# Auto-generated file renaming script
set -e

echo "🏷️  Renaming files to follow proper conventions..."

${renamingPairs}

echo "✅ File renaming completed!"
`;
}

module.exports.NAMING_REPLACEMENTS = NAMING_REPLACEMENTS;
module.exports.generateFileRenamingScript = generateFileRenamingScript;
