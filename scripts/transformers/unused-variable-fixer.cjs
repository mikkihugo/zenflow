/**
 * jscodeshift transformer for fixing unused variables by prefixing with underscore
 * Eliminates TS6133 "declared but never read" warnings
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const source = j(file.source);
  
  let hasChanges = false;
  
  // Keep track of all identifier usages (excluding declarations)
  const usedIdentifiers = new Set();
  const declaredIdentifiers = new Map(); // name -> {path, type}
  
  // Helper to check if identifier should be ignored
  function shouldIgnoreIdentifier(name) {
    if (name.startsWith('_')) return true;
    
    const ignorePatterns = [
      /^React$/, /^Component$/, /^Props$/, /^State$/, /^FC$/, /^JSX$/,
      /^require$/, /^module$/, /^exports$/, /^__dirname$/, /^__filename$/,
      /^process$/, /^global$/, /^window$/, /^document$/, /^console$/,
      /^JSON$/, /^Math$/, /^Date$/, /^Array$/, /^Object$/, /^String$/, /^Number$/,
      /^Promise$/, /^Error$/, /^Set$/, /^Map$/, /^Buffer$/, /^URL$/
    ];
    
    return ignorePatterns.some(pattern => pattern.test(name));
  }
  
  // Helper to check if a path is exported
  function isExported(path) {
    let current = path;
    while (current.parent) {
      const parentType = current.parent.value.type;
      if (parentType === 'ExportNamedDeclaration' || parentType === 'ExportDefaultDeclaration') {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
  
  // Step 1: Collect all identifier usages (not declarations)
  source.find(j.Identifier).forEach(path => {
    const name = path.value.name;
    const parent = path.parent.value;
    
    if (shouldIgnoreIdentifier(name)) return;
    
    // Skip if this is a declaration
    if (parent.type === 'VariableDeclarator' && parent.id === path.value) return;
    if (parent.type === 'FunctionDeclaration' && parent.id === path.value) return;
    if (parent.type === 'ClassDeclaration' && parent.id === path.value) return;
    if (parent.type === 'Property' && parent.key === path.value && !parent.computed) return;
    if (parent.type === 'MemberExpression' && parent.property === path.value && !parent.computed) return;
    if (parent.type === 'ImportSpecifier') return;
    if (parent.type === 'ImportDefaultSpecifier') return;
    if (parent.type === 'ImportNamespaceSpecifier') return;
    
    // Skip function parameter declarations
    let currentPath = path;
    let isParameterDeclaration = false;
    while (currentPath.parent) {
      const pType = currentPath.parent.value.type;
      if ((pType === 'FunctionDeclaration' || pType === 'FunctionExpression' || pType === 'ArrowFunctionExpression') &&
          currentPath.parent.value.params) {
        // Check if this identifier is in the params list
        for (const param of currentPath.parent.value.params) {
          if (isIdentifierInParam(path.value, param)) {
            isParameterDeclaration = true;
            break;
          }
        }
      }
      if (isParameterDeclaration) break;
      currentPath = currentPath.parent;
    }
    
    if (isParameterDeclaration) return;
    
    // This is a usage
    usedIdentifiers.add(name);
  });
  
  // Helper to check if an identifier is within a parameter
  function isIdentifierInParam(identifier, param) {
    if (param.type === 'Identifier') {
      return param === identifier;
    } else if (param.type === 'ObjectPattern') {
      return param.properties.some(prop => {
        if (prop.type === 'Property' && prop.value.type === 'Identifier') {
          return prop.value === identifier;
        }
        return false;
      });
    } else if (param.type === 'ArrayPattern') {
      return param.elements.some(elem => elem && elem.type === 'Identifier' && elem === identifier);
    } else if (param.type === 'RestElement') {
      return param.argument === identifier;
    } else if (param.type === 'AssignmentPattern') {
      return isIdentifierInParam(identifier, param.left);
    }
    return false;
  }
  
  // Step 2: Collect variable declarations
  source.find(j.VariableDeclarator).forEach(path => {
    if (isExported(path)) return;
    
    if (path.value.id.type === 'Identifier') {
      const name = path.value.id.name;
      if (!shouldIgnoreIdentifier(name)) {
        declaredIdentifiers.set(name, { path, type: 'variable' });
      }
    } else if (path.value.id.type === 'ObjectPattern') {
      path.value.id.properties.forEach(prop => {
        if (prop.type === 'Property' && prop.value.type === 'Identifier') {
          const name = prop.value.name;
          if (!shouldIgnoreIdentifier(name)) {
            declaredIdentifiers.set(name, { path, type: 'destructure', node: prop.value });
          }
        }
      });
    } else if (path.value.id.type === 'ArrayPattern') {
      path.value.id.elements.forEach(elem => {
        if (elem && elem.type === 'Identifier') {
          const name = elem.name;
          if (!shouldIgnoreIdentifier(name)) {
            declaredIdentifiers.set(name, { path, type: 'destructure', node: elem });
          }
        }
      });
    }
  });
  
  // Step 3: Collect function parameters
  source.find(j.Function).forEach(funcPath => {
    if (funcPath.value.params) {
      funcPath.value.params.forEach(param => {
        collectParamNames(param, funcPath);
      });
    }
  });
  
  function collectParamNames(param, funcPath) {
    if (param.type === 'Identifier') {
      const name = param.name;
      if (!shouldIgnoreIdentifier(name)) {
        declaredIdentifiers.set(name, { path: funcPath, type: 'parameter', node: param });
      }
    } else if (param.type === 'ObjectPattern') {
      param.properties.forEach(prop => {
        if (prop.type === 'Property' && prop.value.type === 'Identifier') {
          const name = prop.value.name;
          if (!shouldIgnoreIdentifier(name)) {
            declaredIdentifiers.set(name, { path: funcPath, type: 'parameter', node: prop.value });
          }
        }
      });
    } else if (param.type === 'ArrayPattern') {
      param.elements.forEach(elem => {
        if (elem && elem.type === 'Identifier') {
          const name = elem.name;
          if (!shouldIgnoreIdentifier(name)) {
            declaredIdentifiers.set(name, { path: funcPath, type: 'parameter', node: elem });
          }
        }
      });
    } else if (param.type === 'RestElement' && param.argument.type === 'Identifier') {
      const name = param.argument.name;
      if (!shouldIgnoreIdentifier(name)) {
        declaredIdentifiers.set(name, { path: funcPath, type: 'parameter', node: param.argument });
      }
    } else if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
      const name = param.left.name;
      if (!shouldIgnoreIdentifier(name)) {
        declaredIdentifiers.set(name, { path: funcPath, type: 'parameter', node: param.left });
      }
    }
  }
  
  // Step 4: Collect function and class declarations
  source.find(j.FunctionDeclaration).forEach(path => {
    if (path.value.id && path.value.id.name && !isExported(path)) {
      const name = path.value.id.name;
      if (!shouldIgnoreIdentifier(name)) {
        declaredIdentifiers.set(name, { path, type: 'function' });
      }
    }
  });
  
  source.find(j.ClassDeclaration).forEach(path => {
    if (path.value.id && path.value.id.name && !isExported(path)) {
      const name = path.value.id.name;
      if (!shouldIgnoreIdentifier(name)) {
        declaredIdentifiers.set(name, { path, type: 'class' });
      }
    }
  });
  
  // Step 5: Apply transformations for unused variables
  declaredIdentifiers.forEach((info, name) => {
    if (!usedIdentifiers.has(name)) {
      const newName = '_' + name;
      
      try {
        if (info.type === 'variable') {
          if (info.path.value.id && info.path.value.id.type === 'Identifier') {
            info.path.value.id.name = newName;
            hasChanges = true;
          }
        } else if (info.type === 'parameter' || info.type === 'destructure') {
          if (info.node) {
            info.node.name = newName;
            hasChanges = true;
          }
        } else if (info.type === 'function') {
          if (info.path.value.id) {
            info.path.value.id.name = newName;
            hasChanges = true;
          }
        } else if (info.type === 'class') {
          if (info.path.value.id) {
            info.path.value.id.name = newName;
            hasChanges = true;
          }
        }
      } catch (error) {
        console.warn(`Failed to transform variable ${name} in ${file.path}:`, error.message);
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
    'topLevelAwait'
  ]
};