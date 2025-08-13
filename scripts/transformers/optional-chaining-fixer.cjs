/**
 * jscodeshift transformer for optional chaining safety
 * Converts property access on potentially undefined objects to use optional chaining
 *
 * Target: TS2532 "Object is possibly 'undefined'" errors
 *
 * Examples:
 *   obj.prop → obj?.prop (when obj might be undefined)
 *   obj.method() → obj?.method() (when obj might be undefined)
 *   obj.nested.deep → obj?.nested?.deep (when intermediate properties might be undefined)
 *   array[0].prop → array[0]?.prop (when array element might be undefined)
 */

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const source = j(file.source);

  let hasChanges = false;
  const { verbose = false, dryRun = false } = options;

  /**
   * Patterns that commonly indicate potentially undefined objects
   */
  const potentiallyUndefinedPatterns = [
    // Function parameters without default values
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
    // Object destructuring results
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
    // Array access results
    /\.find\(|\.pop\(|\.shift\(|\.get\(/,
    // Optional properties
    /\?\./,
    // Variables that might be null/undefined
    /config|options|params|props|data|result|response|item|element|node|match/,
  ];

  /**
   * Common method names that might return undefined
   */
  const undefinedReturningMethods = [
    'find',
    'getElementById',
    'querySelector',
    'get',
    'pop',
    'shift',
    'match',
    'exec',
  ];

  /**
   * Check if a variable name suggests it might be undefined
   */
  function mightBeUndefined(name) {
    if (typeof name !== 'string') return false;

    // Check for common patterns
    const commonPatterns = [
      /config/i,
      /options/i,
      /params/i,
      /props/i,
      /data/i,
      /result/i,
      /response/i,
      /item/i,
      /element/i,
      /node/i,
      /match/i,
      /found/i,
      /selected/i,
      /current/i,
      /target/i,
      /parent/i,
      /child/i,
    ];

    return commonPatterns.some((pattern) => pattern.test(name));
  }

  /**
   * Check if a member expression should use optional chaining
   */
  function shouldUseOptionalChaining(path) {
    const { object, property } = path.value;

    // Skip if already using optional chaining
    if (path.value.optional) {
      return false;
    }

    // CRITICAL FIX: Skip if this member expression is on the left side of an assignment
    // You cannot use optional chaining on the left-hand side of assignment expressions
    if (path.parent && path.parent.value) {
      const parent = path.parent.value;

      // Check if this is the left side of an assignment expression
      if (
        parent.type === 'AssignmentExpression' &&
        parent.left === path.value
      ) {
        return false;
      }

      // Check if this is the argument of an update expression (++/--)
      if (
        parent.type === 'UpdateExpression' &&
        parent.argument === path.value
      ) {
        return false;
      }

      // Check if this is part of a destructuring assignment target
      if (
        parent.type === 'Property' &&
        path.parent.parent?.value?.type === 'ObjectPattern'
      ) {
        return false;
      }
    }

    // Skip if accessing safe properties like 'length' on arrays
    if (property && ['length', 'size', 'byteLength'].includes(property.name)) {
      return false;
    }

    // Skip if the object is 'this'
    if (object.type === 'ThisExpression') {
      return false;
    }

    // Skip if accessing prototype methods
    if (
      property &&
      ['constructor', 'toString', 'valueOf', 'hasOwnProperty'].includes(
        property.name
      )
    ) {
      return false;
    }

    // Skip static class properties/methods (Class.property or Class.method)
    if (
      object.type === 'Identifier' &&
      object.name &&
      object.name[0] === object.name[0].toUpperCase() && // Starts with uppercase (likely a class)
      property &&
      (property.name === 'instance' ||
        property.name === 'getInstance' ||
        property.name === 'create')
    ) {
      return false;
    }

    // Skip common global objects
    if (
      object.type === 'Identifier' &&
      [
        'console',
        'window',
        'document',
        'process',
        'global',
        'Buffer',
        'JSON',
      ].includes(object.name)
    ) {
      return false;
    }

    // Skip imports and modules
    if (
      object.type === 'Identifier' &&
      property &&
      (property.name === 'default' || property.name === 'exports')
    ) {
      return false;
    }

    // Check if object is a simple identifier that might be undefined
    if (object.type === 'Identifier') {
      return mightBeUndefined(object.name);
    }

    // Check if object is result of potentially undefined-returning method call
    if (
      object.type === 'CallExpression' &&
      object.callee.type === 'MemberExpression' &&
      object.callee.property.name
    ) {
      const methodName = object.callee.property.name;
      return undefinedReturningMethods.includes(methodName);
    }

    // Check if object is array access (might be undefined)
    if (object.type === 'MemberExpression' && object.computed) {
      return true;
    }

    // Check if object is optional chaining result (chain the optionality)
    if (object.type === 'MemberExpression' && object.optional) {
      return true;
    }

    return false;
  }

  /**
   * Log transformation if verbose mode
   */
  function logTransformation(before, after, line) {
    if (verbose) {
      console.log(`Line ${line}: ${before} → ${after}`);
    }
  }

  // Transform member expressions to use optional chaining (but skip if on left side of assignment)
  source.find(j.MemberExpression).forEach((path) => {
    if (shouldUseOptionalChaining(path)) {
      const before = j(path).toSource();

      if (!dryRun) {
        path.value.optional = true;
        hasChanges = true;
      }

      const after = j(path).toSource();
      const line = path.value.loc?.start?.line || 'unknown';

      logTransformation(before, after, line);

      if (dryRun) {
        console.log(
          `[DRY RUN] Would transform: ${before} → ${after} (line ${line})`
        );
      }
    }
  });

  // REMOVE existing optional chaining on left side of assignments
  source.find(j.AssignmentExpression).forEach((path) => {
    const { left } = path.value;

    if (left.type === 'MemberExpression' && left.optional) {
      const before = j(path).toSource();

      if (!dryRun) {
        left.optional = false;
        hasChanges = true;
      }

      const after = j(path).toSource();
      const line = path.value.loc?.start?.line || 'unknown';

      logTransformation(before, after, line);

      if (dryRun) {
        console.log(
          `[DRY RUN] Would fix assignment: ${before} → ${after} (line ${line})`
        );
      }
    }
  });

  // Transform call expressions to use optional chaining
  source.find(j.CallExpression).forEach((path) => {
    const { callee } = path.value;

    // Only handle member expression calls
    if (callee.type !== 'MemberExpression') {
      return;
    }

    // Skip if already using optional chaining
    if (callee.optional) {
      return;
    }

    if (shouldUseOptionalChaining({ value: callee })) {
      const before = j(path).toSource();

      if (!dryRun) {
        callee.optional = true;
        hasChanges = true;
      }

      const after = j(path).toSource();
      const line = path.value.loc?.start?.line || 'unknown';

      logTransformation(before, after, line);

      if (dryRun) {
        console.log(
          `[DRY RUN] Would transform: ${before} → ${after} (line ${line})`
        );
      }
    }
  });

  // Handle deeply nested property access
  source.find(j.MemberExpression).forEach((path) => {
    let current = path;
    const chainParts = [];

    // Collect the chain of property accesses
    while (current && current.value.type === 'MemberExpression') {
      chainParts.unshift(current);
      current = current.get('object');
    }

    // Apply optional chaining to the chain where needed
    chainParts.forEach((part, index) => {
      if (index > 0 && shouldUseOptionalChaining(part)) {
        const before = j(part).toSource();

        if (!dryRun) {
          part.value.optional = true;
          hasChanges = true;
        }

        const after = j(part).toSource();
        const line = part.value.loc?.start?.line || 'unknown';

        logTransformation(before, after, line);

        if (dryRun) {
          console.log(
            `[DRY RUN] Would transform chain: ${before} → ${after} (line ${line})`
          );
        }
      }
    });
  });

  // Handle common TypeScript patterns that need optional chaining

  // Pattern: array.find(...).property → array.find(...)?.property
  source.find(j.MemberExpression).forEach((path) => {
    const { object } = path.value;

    if (
      object.type === 'CallExpression' &&
      object.callee.type === 'MemberExpression' &&
      object.callee.property.name === 'find' &&
      !path.value.optional
    ) {
      const before = j(path).toSource();

      if (!dryRun) {
        path.value.optional = true;
        hasChanges = true;
      }

      const after = j(path).toSource();
      const line = path.value.loc?.start?.line || 'unknown';

      logTransformation(before, after, line);

      if (dryRun) {
        console.log(
          `[DRY RUN] Would transform find result: ${before} → ${after} (line ${line})`
        );
      }
    }
  });

  // Pattern: params.config.value → params?.config?.value
  source.find(j.MemberExpression).forEach((path) => {
    if (path.value.object.type === 'MemberExpression') {
      const rootObject = path.value.object.object;

      if (
        rootObject.type === 'Identifier' &&
        (rootObject.name === 'params' ||
          rootObject.name === 'options' ||
          rootObject.name === 'config' ||
          rootObject.name === 'props')
      ) {
        // Make the root access optional
        const rootAccess = path.value.object;
        if (!rootAccess.optional) {
          const before = j(path.parent).toSource();

          if (!dryRun) {
            rootAccess.optional = true;
            path.value.optional = true;
            hasChanges = true;
          }

          const after = j(path.parent).toSource();
          const line = path.value.loc?.start?.line || 'unknown';

          logTransformation(before, after, line);

          if (dryRun) {
            console.log(
              `[DRY RUN] Would transform parameter access: ${before} → ${after} (line ${line})`
            );
          }
        }
      }
    }
  });

  if (dryRun) {
    console.log(`\n[DRY RUN] File: ${file.path}`);
    console.log(
      `[DRY RUN] Would make ${hasChanges ? 'changes' : 'no changes'}`
    );
    return null; // Don't modify in dry run mode
  }

  return hasChanges ? source.toSource() : null;
};

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

/**
 * CLI options configuration
 */
module.exports.options = {
  verbose: {
    type: 'boolean',
    description: 'Enable verbose logging of transformations',
  },
  dryRun: {
    type: 'boolean',
    description: 'Preview changes without modifying files',
  },
};
