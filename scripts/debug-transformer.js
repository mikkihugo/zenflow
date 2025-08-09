/**
 * Debug transformer to convert console statements to structured logging
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const source = j(file.source);
  
  let hasConsoleUsage = false;
  let loggerImported = false;
  
  // Console method mappings
  const CONSOLE_MAPPINGS = {
    'log': 'info',
    'info': 'info', 
    'warn': 'warn',
    'error': 'error',
    'debug': 'debug',
    'trace': 'debug'
  };
  
  // Check if logger is already imported
  source.find(j.ImportDeclaration).forEach(path => {
    if (path.value.source.value.includes('logging-config') ||
        path.value.source.value.includes('logger')) {
      loggerImported = true;
    }
  });
  
  // Check for existing require statements
  source.find(j.CallExpression, {
    callee: { name: 'require' }
  }).forEach(path => {
    if (path.value.arguments[0] && 
        path.value.arguments[0].value && 
        path.value.arguments[0].value.includes('logging-config')) {
      loggerImported = true;
    }
  });
  
  // Find component name for logger
  const componentName = file.path
    .replace(/.*\/src\//, '')
    .replace(/\.ts$/, '')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '');
  
  // Transform console statements
  source.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'console' }
    }
  }).forEach(path => {
    hasConsoleUsage = true;
    
    const method = path.value.callee.property.name;
    const args = path.value.arguments;
    
    // Map console methods to logger methods
    const loggerMethod = CONSOLE_MAPPINGS[method] || 'info';
    
    // Create the new logger call
    const newCall = j.callExpression(
      j.memberExpression(j.identifier('logger'), j.identifier(loggerMethod)),
      args
    );
    
    // Replace the console call
    path.replace(newCall);
  });
  
  // Add logger import and initialization if console usage found
  if (hasConsoleUsage && !loggerImported) {
    // Add import statement for ES modules
    const importStatement = j.importDeclaration(
      [j.importSpecifier(j.identifier('getLogger'))],
      j.literal('../config/logging-config')
    );
    
    const loggerDeclaration = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier('logger'),
        j.callExpression(j.identifier('getLogger'), [j.literal(componentName)])
      )
    ]);
    
    // Add at the top of the file
    const body = source.find(j.Program).get('body');
    body.value.unshift(loggerDeclaration);
    body.value.unshift(importStatement);
  }
  
  return hasConsoleUsage ? source.toSource() : null;
};