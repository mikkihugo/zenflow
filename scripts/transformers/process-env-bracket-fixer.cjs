/**
 * jscodeshift transformer for process.env property access standardization
 * Converts process.env dot notation to bracket notation for safer environment variable access
 *
 * Examples:
 *   process.env.NODE_ENV → process.env['NODE_ENV']
 *   process.env.API_KEY → process.env['API_KEY']
 *   process.env.PORT → process.env['PORT']
 */

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const source = j(file.source);

  let hasChanges = false;

  // Find member expressions where object is process.env
  source
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        object: { name: 'process' },
        property: { name: 'env' },
      },
      computed: false, // Only transform dot notation (not already bracket notation)
    })
    .forEach((path) => {
      const propertyName = path.value.property.name;

      // Only transform if the property is a valid identifier (not a computed property)
      if (propertyName && typeof propertyName === 'string') {
        // Convert dot notation to bracket notation
        path.value.computed = true;
        path.value.property = j.literal(propertyName);
        hasChanges = true;

        // Log the transformation if in verbose mode
        if (options.verbose) {
          console.log(
            `Transformed: process.env.${propertyName} → process.env['${propertyName}']`
          );
        }
      }
    });

  // Also handle optional chaining cases: process.env?.VARIABLE
  source
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        object: { name: 'process' },
        property: { name: 'env' },
      },
      computed: false,
      optional: true,
    })
    .forEach((path) => {
      const propertyName = path.value.property.name;

      if (propertyName && typeof propertyName === 'string') {
        // Convert optional chaining dot notation to bracket notation
        path.value.computed = true;
        path.value.property = j.literal(propertyName);
        hasChanges = true;

        if (options.verbose) {
          console.log(
            `Transformed: process.env?.${propertyName} → process.env?.['${propertyName}']`
          );
        }
      }
    });

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
