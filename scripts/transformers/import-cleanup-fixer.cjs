/**
 * jscodeshift transformer for removing unused imports
 * Targets TS6133/TS6192 unused import errors
 * Handles named imports, default imports, and namespace imports
 */

const path = require('path');

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const source = j(file.source);

  let hasChanges = false;

  // Collect all identifiers used in the file (excluding import declarations)
  const usedIdentifiers = new Set();

  // Find all identifiers that are actually used in the code
  source.find(j.Identifier).forEach((path) => {
    // Skip import declarations and their specifiers
    if (isInImportDeclaration(path)) {
      return;
    }

    // Skip type annotations in TypeScript
    if (isInTypeAnnotation(path)) {
      return;
    }

    // Skip property keys in object literals (unless computed)
    if (isObjectPropertyKey(path)) {
      return;
    }

    // Skip JSX attribute names
    if (isJSXAttributeName(path)) {
      return;
    }

    usedIdentifiers.add(path.value.name);
  });

  // Find all JSX element names (these count as usage)
  source.find(j.JSXElement).forEach((path) => {
    const elementName = getJSXElementName(path.value.openingElement.name);
    if (elementName) {
      usedIdentifiers.add(elementName);
    }
  });

  // Find JSX fragments and other JSX usage
  source.find(j.JSXFragment).forEach((path) => {
    // JSX fragments use React implicitly
    usedIdentifiers.add('React');
  });

  // Process import declarations
  source.find(j.ImportDeclaration).forEach((path) => {
    const importDeclaration = path.value;
    const specifiers = importDeclaration.specifiers || [];

    if (specifiers.length === 0) {
      // Side-effect imports (e.g., import 'reflect-metadata')
      // Keep these as they may be needed for their side effects
      return;
    }

    const unusedSpecifiers = [];
    const usedSpecifiers = [];

    specifiers.forEach((specifier) => {
      const localName = specifier.local.name;

      if (specifier.type === 'ImportDefaultSpecifier') {
        // Default import: import Foo from 'foo'
        if (!usedIdentifiers.has(localName)) {
          unusedSpecifiers.push(specifier);
        } else {
          usedSpecifiers.push(specifier);
        }
      } else if (specifier.type === 'ImportSpecifier') {
        // Named import: import { foo, bar } from 'module'
        if (!usedIdentifiers.has(localName)) {
          unusedSpecifiers.push(specifier);
        } else {
          usedSpecifiers.push(specifier);
        }
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        // Namespace import: import * as foo from 'module'
        if (!usedIdentifiers.has(localName)) {
          unusedSpecifiers.push(specifier);
        } else {
          usedSpecifiers.push(specifier);
        }
      }
    });

    // If all specifiers are unused, remove the entire import
    if (unusedSpecifiers.length === specifiers.length) {
      j(path).remove();
      hasChanges = true;
    } else if (unusedSpecifiers.length > 0) {
      // Remove only unused specifiers, keep the used ones
      importDeclaration.specifiers = usedSpecifiers;
      hasChanges = true;
    }
  });

  // Handle special cases for React JSX
  const hasJSX = source.find(j.JSXElement).length > 0 || source.find(j.JSXFragment).length > 0;
  if (hasJSX) {
    // Check if React is imported but not explicitly used
    // In modern React with JSX Transform, React might not be needed
    const reactImports = source.find(j.ImportDeclaration).filter((path) => {
      return path.value.source.value === 'react';
    });

    reactImports.forEach((path) => {
      const specifiers = path.value.specifiers || [];
      const defaultImport = specifiers.find((s) => s.type === 'ImportDefaultSpecifier');

      if (defaultImport && defaultImport.local.name === 'React') {
        // Check if React is explicitly used beyond JSX
        const explicitReactUsage =
          source.find(j.MemberExpression).filter((memberPath) => {
            return (
              memberPath.value.object.type === 'Identifier' &&
              memberPath.value.object.name === 'React'
            );
          }).length > 0;

        // If React is only used for JSX and we have JSX transform, it might be unused
        // But this is complex to determine, so we'll be conservative and keep it
        // unless there's absolutely no JSX or React usage
        if (!explicitReactUsage && !usedIdentifiers.has('React')) {
          // Remove React default import if not explicitly used
          path.value.specifiers = specifiers.filter((s) => s !== defaultImport);
          if (path.value.specifiers.length === 0) {
            j(path).remove();
          }
          hasChanges = true;
        }
      }
    });
  }

  // Clean up any remaining empty import declarations
  source.find(j.ImportDeclaration).forEach((path) => {
    const specifiers = path.value.specifiers || [];
    if (specifiers.length === 0 && !isSideEffectImport(path.value.source.value)) {
      j(path).remove();
      hasChanges = true;
    }
  });

  return hasChanges ? source.toSource() : null;
};

// Helper functions

function isInImportDeclaration(path) {
  let current = path;
  while (current.parent) {
    current = current.parent;
    if (current.value.type === 'ImportDeclaration') {
      return true;
    }
  }
  return false;
}

function isInTypeAnnotation(path) {
  // CRITICAL FIX: Much more conservative type annotation detection
  // Only consider it "in type annotation" if it's ACTUALLY in a type-only context
  let current = path;
  while (current.parent) {
    current = current.parent;
    const parentType = current.value.type;

    // These are ACTUAL type-only contexts where identifiers should be ignored:
    if (
      parentType === 'TSTypeAnnotation' || // function param types
      parentType === 'TSInterfaceDeclaration' || // interface definitions
      parentType === 'TSTypeAliasDeclaration'
    ) {
      // type alias definitions
      return true;
    }

    // REMOVED PROBLEMATIC CHECKS:
    // - TSTypeReference: Can be legitimate runtime usage (e.g., instanceof checks)
    // - TSTypeLiteral: Can contain runtime-relevant types

    // Stop at expression level to avoid over-traversal
    if (
      parentType === 'VariableDeclarator' ||
      parentType === 'AssignmentExpression' ||
      parentType === 'CallExpression' ||
      parentType === 'ReturnStatement'
    ) {
      break;
    }
  }
  return false;
}

function isObjectPropertyKey(path) {
  const parent = path.parent;
  if (!parent) return false;

  const parentValue = parent.value;
  return parentValue.type === 'Property' && parentValue.key === path.value && !parentValue.computed;
}

function isJSXAttributeName(path) {
  const parent = path.parent;
  if (!parent) return false;

  return parent.value.type === 'JSXAttribute' && parent.value.name === path.value;
}

function getJSXElementName(nameNode) {
  if (nameNode.type === 'JSXIdentifier') {
    return nameNode.name;
  } else if (nameNode.type === 'JSXMemberExpression') {
    // For things like Component.SubComponent
    return getJSXElementName(nameNode.object);
  }
  return null;
}

function isSideEffectImport(source) {
  // Common side-effect imports that should be preserved
  const sideEffectPatterns = [
    /^reflect-metadata$/,
    /\.css$/,
    /\.scss$/,
    /\.sass$/,
    /\.less$/,
    /\.styl$/,
    /^@.*polyfill/,
    /polyfill/,
    /^core-js/,
    /^zone\.js/,
  ];

  return sideEffectPatterns.some((pattern) => pattern.test(source));
}

/**
 * Transform configuration
 */
module.exports.parser = 'tsx';

/**
 * Parser configuration to handle optional chaining assignment syntax
 */
module.exports.parserOptions = {
  plugins: [
    'jsx',
    'typescript',
    'optionalChaining',
    'optionalChainingAssign',
    'nullishCoalescingOperator',
    'decorators',
    'classProperties',
    'privateIn',
    'topLevelAwait',
  ],
};
