/**
 * jscodeshift transformer for object property bracket notation
 * Converts dot notation to bracket notation for objects with index signatures
 * Targets TS4111 "must be accessed with bracket notation" errors
 *
 * Examples:
 *   obj.Authorization → obj['Authorization']
 *   headers.Content-Type → headers['Content-Type']
 *   wasmModule.someFunc → wasmModule['someFunc']
 *   config.API_KEY → config['API_KEY']
 */

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const source = j(file.source);

  let hasChanges = false;
  const transformedProperties = new Set();

  // Common object patterns that typically require bracket notation
  const BRACKET_NOTATION_PATTERNS = [
    // Headers objects (common with HTTP requests)
    /^headers?$/i,
    /^requestHeaders$/i,
    /^responseHeaders$/i,
    /^httpHeaders$/i,

    // Configuration objects
    /^config$/i,
    /^options$/i,
    /^settings$/i,
    /^env$/i,
    /^params$/i,

    // WASM and dynamic objects
    /^wasm/i,
    /^module$/i,
    /^exports$/i,
    /^instance$/i,

    // Event and message objects
    /^event$/i,
    /^message$/i,
    /^data$/i,
    /^payload$/i,

    // Generic dynamic objects
    /^obj$/i,
    /^object$/i,
    /^props$/i,
    /^attributes$/i,
    /^metadata$/i,
  ];

  // Property patterns that commonly need bracket notation
  const PROPERTY_PATTERNS = [
    // HTTP headers (case variations)
    /^Authorization$/,
    /^Content-Type$/,
    /^Content-Length$/,
    /^User-Agent$/,
    /^Accept$/,
    /^Cache-Control$/,
    /^X-.*$/, // Custom headers starting with X-

    // Environment variables (all caps with underscores)
    /^[A-Z_]+$/,

    // Properties with special characters or patterns
    /^.*-.*$/, // Properties with dashes
    /^[A-Z][a-z]+[A-Z].*$/, // Mixed case like 'Content-Type'
    /^\d+$/, // Numeric property names

    // WASM function names (common patterns)
    /^_.*$/, // Underscore-prefixed names
    /^[a-z]+_[a-z]+.*$/, // Snake_case names
  ];

  // Check if object name matches patterns that require bracket notation
  function shouldTransformObject(objectName) {
    if (!objectName || typeof objectName !== 'string') return false;

    // Exclude built-in objects and common global objects
    const builtinObjects = [
      'Object',
      'Array',
      'String',
      'Number',
      'Boolean',
      'Date',
      'RegExp',
      'Promise',
      'JSON',
      'Math',
      'console',
      'window',
      'document',
      'global',
      'process', // Node.js and browser globals
      'Buffer',
      'URL',
      'URLSearchParams',
      'fetch',
      'Request',
      'Response', // Web APIs
      'Error',
      'TypeError',
      'ReferenceError',
      'SyntaxError', // Error types
      'Set',
      'Map',
      'WeakSet',
      'WeakMap',
      'Symbol',
      'BigInt', // ES6+ types
      'Intl',
      'Proxy',
      'Reflect',
      'ArrayBuffer',
      'DataView', // Advanced types
    ];
    if (builtinObjects.includes(objectName)) {
      return false;
    }

    return BRACKET_NOTATION_PATTERNS.some((pattern) => pattern.test(objectName));
  }

  // Check if property name matches patterns that require bracket notation
  function shouldTransformProperty(propertyName) {
    if (!propertyName || typeof propertyName !== 'string') return false;
    return PROPERTY_PATTERNS.some((pattern) => pattern.test(propertyName));
  }

  // Get the object name from a member expression
  function getObjectName(memberExpression) {
    if (memberExpression.object?.type === 'Identifier') {
      return memberExpression.object.name;
    }
    if (memberExpression.object?.type === 'MemberExpression') {
      // For chained access like obj.nested.prop, get the root object name
      let current = memberExpression.object;
      while (current.object?.type === 'MemberExpression') {
        current = current.object;
      }
      return current.object?.name;
    }
    return null;
  }

  // Transform member expressions with dot notation to bracket notation
  source
    .find(j.MemberExpression, {
      computed: false, // Only transform dot notation (not already bracket notation)
    })
    .forEach((path) => {
      const memberExpr = path.value;
      const propertyName = memberExpr.property?.name;
      const objectName = getObjectName(memberExpr);

      // Skip if property is not a simple identifier
      if (!propertyName || typeof propertyName !== 'string') {
        return;
      }

      // Skip common safe properties that don't need bracket notation
      const safeProperties = [
        'length',
        'toString',
        'valueOf',
        'constructor',
        'prototype',
        'forEach',
        'map',
        'filter',
        'reduce',
        'find',
        'includes',
        'indexOf',
        'slice',
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'concat',
        'join',
        'entries',
        'keys',
        'values',
        'hasOwnProperty',
        'id',
        'name',
        'type',
        'className',
        'innerHTML',
        'innerText',
        'style',
        'default',
        'exports', // Common module properties
        'log',
        'warn',
        'error',
        'info',
        'debug', // Console methods
        'title',
        'description',
        'context', // Common config properties
      ];
      if (safeProperties.includes(propertyName)) {
        return;
      }

      // Determine if this member expression should be transformed
      let shouldTransform = false;
      let reason = '';

      // Check if object matches patterns that require bracket notation
      if (shouldTransformObject(objectName)) {
        shouldTransform = true;
        reason = `object pattern (${objectName})`;
      }

      // Check if property matches patterns that require bracket notation
      if (shouldTransformProperty(propertyName)) {
        shouldTransform = true;
        reason = reason ? `${reason} and property pattern` : `property pattern (${propertyName})`;
      }

      // Special case: if property contains characters that require bracket notation
      if (propertyName.includes('-') || /^[A-Z_]+$/.test(propertyName)) {
        shouldTransform = true;
        reason = reason ? `${reason} and special characters` : 'special characters';
      }

      if (shouldTransform) {
        // Convert dot notation to bracket notation
        memberExpr.computed = true;
        memberExpr.property = j.literal(propertyName);
        hasChanges = true;

        const transformKey = `${objectName || 'obj'}.${propertyName}`;
        transformedProperties.add(transformKey);

        // Log the transformation if in verbose mode
        if (options.verbose) {
          console.log(
            `Transformed: ${objectName || 'obj'}.${propertyName} → ${objectName || 'obj'}['${propertyName}'] (${reason})`
          );
        }
      }
    });

  // Also handle optional chaining cases: obj?.property
  source
    .find(j.MemberExpression, {
      computed: false,
      optional: true,
    })
    .forEach((path) => {
      const memberExpr = path.value;
      const propertyName = memberExpr.property?.name;
      const objectName = getObjectName(memberExpr);

      if (!propertyName || typeof propertyName !== 'string') {
        return;
      }

      // Apply same transformation logic for optional chaining
      const shouldTransform = false;

      if (
        shouldTransformObject(objectName) ||
        shouldTransformProperty(propertyName) ||
        propertyName.includes('-') ||
        /^[A-Z_]+$/.test(propertyName)
      ) {
        // Convert optional chaining dot notation to bracket notation
        memberExpr.computed = true;
        memberExpr.property = j.literal(propertyName);
        hasChanges = true;

        const transformKey = `${objectName || 'obj'}?.${propertyName}`;
        transformedProperties.add(transformKey);

        if (options.verbose) {
          console.log(
            `Transformed: ${objectName || 'obj'}?.${propertyName} → ${objectName || 'obj'}?.['${propertyName}']`
          );
        }
      }
    });

  // Log summary if verbose mode and transformations were made
  if (options.verbose && transformedProperties.size > 0) {
    console.log(`\nFile: ${file.path}`);
    console.log(`Total transformations: ${transformedProperties.size}`);
    console.log('Transformed properties:', Array.from(transformedProperties).join(', '));
  }

  return hasChanges ? source.toSource() : null;
};

/**
 * Transform configuration
 */
module.exports.parser = 'tsx';

/**
 * Export patterns for testing and configuration
 */
module.exports.BRACKET_NOTATION_PATTERNS = [
  /^headers?$/i,
  /^requestHeaders$/i,
  /^responseHeaders$/i,
  /^config$/i,
  /^options$/i,
  /^settings$/i,
  /^wasm/i,
  /^module$/i,
  /^exports$/i,
];

module.exports.PROPERTY_PATTERNS = [
  /^Authorization$/,
  /^Content-Type$/,
  /^Content-Length$/,
  /^User-Agent$/,
  /^[A-Z_]+$/,
  /^.*-.*$/,
  /^_.*$/,
];

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
