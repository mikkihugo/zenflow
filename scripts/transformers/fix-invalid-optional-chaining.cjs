/**
 * Fix invalid optional chaining assignments
 * Transforms: obj?.prop = value → obj.prop = value
 */

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let transformCount = 0;

  // Find assignment expressions with optional member expressions on the left
  root
    .find(j.AssignmentExpression)
    .filter((path) => {
      // Check if left side is an optional member expression
      return (
        path.value.left.type === 'OptionalMemberExpression' ||
        (path.value.left.type === 'MemberExpression' &&
          path.value.left.optional === true)
      );
    })
    .forEach((path) => {
      const left = path.value.left;

      // Convert optional member expression to regular member expression
      if (left.type === 'OptionalMemberExpression') {
        const regularMemberExpr = j.memberExpression(
          left.object,
          left.property,
          left.computed
        );
        path.value.left = regularMemberExpr;
        transformCount++;
      } else if (left.type === 'MemberExpression' && left.optional === true) {
        // Remove the optional flag
        left.optional = false;
        transformCount++;
      }
    });

  // Also handle optional call expressions that are assignments
  root
    .find(j.AssignmentExpression)
    .filter((path) => {
      return path.value.left.type === 'OptionalCallExpression';
    })
    .forEach((path) => {
      const left = path.value.left;
      // Convert to regular call expression
      const regularCallExpr = j.callExpression(left.callee, left.arguments);
      path.value.left = regularCallExpr;
      transformCount++;
    });

  if (transformCount > 0) {
    console.log(
      `✅ Fixed ${transformCount} invalid optional chaining assignments in ${fileInfo.path}`
    );
  }

  return transformCount > 0 ? root.toSource({ quote: 'single' }) : null;
};
