/**
 * Unified AST Parser Interface
 * Provides consistent parsing for JavaScript/TypeScript and other languages
 */

import { readFile } from 'fs/promises';
import { createHash } from 'crypto';

// Try to import optional dependencies with fallbacks
let parseTypeScript, parseJavaScript, acorn;

try {
  const tsModule = await import('@typescript-eslint/parser');
  parseTypeScript = tsModule.parse;
} catch (e) {
  console.warn('TypeScript parser not available, using fallback');
  parseTypeScript = null;
}

try {
  const jsModule = await import('esprima');
  parseJavaScript = jsModule.parse;
} catch (e) {
  console.warn('Esprima parser not available, using fallback');
  parseJavaScript = null;
}

try {
  acorn = await import('acorn');
} catch (e) {
  console.warn('Acorn parser not available, using fallback');
  acorn = null;
}

export class ASTParser {
  constructor(config = {}) {
    this.config = {
      parseOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          globalReturn: false
        }
      },
      typeScriptOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      ...config
    };
  }

  /**
   * Parse source file and extract AST information
   */
  async parseFile(filePath, content = null) {
    if (!content) {
      content = await readFile(filePath, 'utf8');
    }

    const language = this.detectLanguage(filePath);
    const hash = this.generateHash(content);
    
    let ast;
    let parseResult;

    try {
      switch (language) {
        case 'typescript':
        case 'tsx':
          parseResult = this.parseTypeScript(content, filePath);
          break;
        case 'javascript':
        case 'jsx':
          parseResult = this.parseJavaScript(content, filePath);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      return {
        file: {
          id: `file:${this.generateFileId(filePath)}`,
          path: filePath,
          language,
          size_bytes: Buffer.byteLength(content, 'utf8'),
          line_count: content.split('\n').length,
          hash,
          last_analyzed: new Date().toISOString()
        },
        ...parseResult
      };

    } catch (error) {
      throw new Error(`Failed to parse ${filePath}: ${error.message}`);
    }
  }

  /**
   * Parse TypeScript/TSX content
   */
  parseTypeScript(content, filePath) {
    if (!parseTypeScript) {
      // Fallback to basic analysis
      return this.createFallbackAnalysis(content, filePath, 'typescript');
    }

    const ast = parseTypeScript(content, {
      ...this.config.typeScriptOptions,
      filePath,
      project: undefined // Avoid requiring tsconfig
    });

    return this.extractASTData(ast, filePath, 'typescript');
  }

  /**
   * Parse JavaScript/JSX content
   */
  parseJavaScript(content, filePath) {
    if (!parseJavaScript && !acorn) {
      // Fallback to basic analysis
      return this.createFallbackAnalysis(content, filePath, 'javascript');
    }

    try {
      if (parseJavaScript) {
        // Try with esprima first (more complete)
        const ast = parseJavaScript(content, {
          sourceType: this.config.parseOptions.sourceType,
          ecmaVersion: 2022,
          jsx: true,
          attachComments: true,
          range: true,
          loc: true
        });
        return this.extractASTData(ast, filePath, 'javascript');
      }
    } catch (error) {
      console.warn(`Esprima failed for ${filePath}, trying fallback`);
    }

    try {
      if (acorn) {
        // Fallback to acorn
        const ast = acorn.parse(content, {
          ...this.config.parseOptions,
          locations: true,
          ranges: true
        });
        return this.extractASTData(ast, filePath, 'javascript');
      }
    } catch (error) {
      console.warn(`Acorn failed for ${filePath}, using basic analysis`);
    }

    // Final fallback
    return this.createFallbackAnalysis(content, filePath, 'javascript');
  }

  /**
   * Extract structured data from AST
   */
  extractASTData(ast, filePath, language) {
    const fileId = `file:${this.generateFileId(filePath)}`;
    const result = {
      functions: [],
      classes: [],
      variables: [],
      imports: [],
      exports: [],
      types: []
    };

    this.walkAST(ast, (node, parent) => {
      switch (node.type) {
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'MethodDefinition':
          result.functions.push(this.extractFunctionInfo(node, fileId, filePath));
          break;

        case 'ClassDeclaration':
        case 'ClassExpression':
          result.classes.push(this.extractClassInfo(node, fileId, filePath));
          break;

        case 'VariableDeclarator':
          result.variables.push(this.extractVariableInfo(node, parent, fileId, filePath));
          break;

        case 'ImportDeclaration':
          result.imports.push(this.extractImportInfo(node, fileId, filePath));
          break;

        case 'ExportNamedDeclaration':
        case 'ExportDefaultDeclaration':
        case 'ExportAllDeclaration':
          result.exports.push(this.extractExportInfo(node, fileId, filePath));
          break;

        case 'TSInterfaceDeclaration':
        case 'TSTypeAliasDeclaration':
        case 'TSEnumDeclaration':
          if (language === 'typescript') {
            result.types.push(this.extractTypeInfo(node, fileId, filePath));
          }
          break;
      }
    });

    return result;
  }

  /**
   * Extract function information
   */
  extractFunctionInfo(node, fileId, filePath) {
    const name = node.id?.name || 
                 node.key?.name || 
                 (node.type === 'ArrowFunctionExpression' ? '<anonymous>' : '<unnamed>');
    
    const start = node.loc?.start?.line || 0;
    const end = node.loc?.end?.line || 0;
    const params = node.params || [];
    
    return {
      id: `func:${this.generateFileId(filePath)}:${name}:${start}`,
      name,
      file_id: fileId,
      start_line: start,
      end_line: end,
      parameter_count: params.length,
      is_async: node.async || false,
      is_exported: this.isExported(node),
      return_type: this.extractReturnType(node),
      cyclomatic_complexity: this.calculateCyclomaticComplexity(node),
      cognitive_complexity: this.calculateCognitiveComplexity(node)
    };
  }

  /**
   * Extract class information
   */
  extractClassInfo(node, fileId, filePath) {
    const name = node.id?.name || '<anonymous>';
    const start = node.loc?.start?.line || 0;
    const end = node.loc?.end?.line || 0;
    
    const methods = (node.body?.body || []).filter(n => 
      n.type === 'MethodDefinition' || n.type === 'PropertyDefinition'
    );
    
    return {
      id: `class:${this.generateFileId(filePath)}:${name}:${start}`,
      name,
      file_id: fileId,
      start_line: start,
      end_line: end,
      method_count: methods.filter(m => m.type === 'MethodDefinition').length,
      property_count: methods.filter(m => m.type === 'PropertyDefinition').length,
      is_exported: this.isExported(node),
      extends_class: node.superClass?.name || null,
      implements_interfaces: node.implements?.map(i => i.expression?.name || i.name) || []
    };
  }

  /**
   * Extract variable information
   */
  extractVariableInfo(node, parent, fileId, filePath) {
    const name = node.id?.name || '<unnamed>';
    const line = node.loc?.start?.line || 0;
    const isConstant = parent?.kind === 'const';
    
    return {
      id: `var:${this.generateFileId(filePath)}:${name}:${line}`,
      name,
      file_id: fileId,
      scope: this.determineScope(node, parent),
      type: this.extractVariableType(node),
      is_constant: isConstant,
      is_exported: this.isExported(parent),
      line_number: line
    };
  }

  /**
   * Extract import information
   */
  extractImportInfo(node, fileId, filePath) {
    const moduleName = node.source?.value || '<unknown>';
    const line = node.loc?.start?.line || 0;
    const importedNames = [];
    
    if (node.specifiers) {
      for (const spec of node.specifiers) {
        if (spec.type === 'ImportDefaultSpecifier') {
          importedNames.push('default');
        } else if (spec.type === 'ImportSpecifier') {
          importedNames.push(spec.imported?.name || spec.local?.name);
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          importedNames.push('*');
        }
      }
    }
    
    return {
      id: `import:${this.generateFileId(filePath)}:${line}`,
      file_id: fileId,
      module_name: moduleName,
      imported_names: importedNames,
      import_type: this.determineImportType(node),
      line_number: line
    };
  }

  /**
   * Extract export information
   */
  extractExportInfo(node, fileId, filePath) {
    const line = node.loc?.start?.line || 0;
    const exportNames = [];
    let exportType = 'named';
    
    if (node.type === 'ExportDefaultDeclaration') {
      exportType = 'default';
      exportNames.push('default');
    } else if (node.type === 'ExportAllDeclaration') {
      exportType = 'all';
      exportNames.push('*');
    } else if (node.specifiers) {
      for (const spec of node.specifiers) {
        exportNames.push(spec.exported?.name || spec.local?.name);
      }
    }
    
    return {
      id: `export:${this.generateFileId(filePath)}:${line}`,
      file_id: fileId,
      exported_names: exportNames,
      export_type: exportType,
      line_number: line
    };
  }

  /**
   * Extract TypeScript type information
   */
  extractTypeInfo(node, fileId, filePath) {
    const name = node.id?.name || '<unnamed>';
    const line = node.loc?.start?.line || 0;
    let kind = 'unknown';
    
    switch (node.type) {
      case 'TSInterfaceDeclaration':
        kind = 'interface';
        break;
      case 'TSTypeAliasDeclaration':
        kind = 'type';
        break;
      case 'TSEnumDeclaration':
        kind = 'enum';
        break;
    }
    
    return {
      id: `type:${this.generateFileId(filePath)}:${name}:${line}`,
      name,
      file_id: fileId,
      kind,
      properties: this.extractTypeProperties(node),
      methods: this.extractTypeMethods(node),
      is_exported: this.isExported(node)
    };
  }

  /**
   * Walk AST nodes recursively
   */
  walkAST(node, callback, parent = null) {
    if (!node || typeof node !== 'object') return;
    
    callback(node, parent);
    
    for (const key in node) {
      if (key === 'parent' || key === 'leadingComments' || key === 'trailingComments') {
        continue;
      }
      
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.walkAST(item, callback, node);
        }
      } else if (child && typeof child === 'object' && child.type) {
        this.walkAST(child, callback, node);
      }
    }
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(node) {
    let complexity = 1; // Base complexity
    
    this.walkAST(node, (child) => {
      switch (child.type) {
        case 'IfStatement':
        case 'ConditionalExpression':
        case 'SwitchCase':
        case 'WhileStatement':
        case 'DoWhileStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
        case 'LogicalExpression':
          if (child.operator === '&&' || child.operator === '||') {
            complexity++;
          }
          if (child.type !== 'LogicalExpression') {
            complexity++;
          }
          break;
        case 'CatchClause':
          complexity++;
          break;
      }
    });
    
    return complexity;
  }

  /**
   * Calculate cognitive complexity (simplified)
   */
  calculateCognitiveComplexity(node) {
    // This is a simplified version - real cognitive complexity is more nuanced
    return Math.floor(this.calculateCyclomaticComplexity(node) * 1.2);
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const languageMap = {
      'ts': 'typescript',
      'tsx': 'tsx',
      'js': 'javascript',
      'jsx': 'jsx',
      'mjs': 'javascript',
      'cjs': 'javascript'
    };
    
    return languageMap[ext] || 'unknown';
  }

  /**
   * Generate consistent file ID
   */
  generateFileId(filePath) {
    return createHash('sha256').update(filePath).digest('hex').substring(0, 16);
  }

  /**
   * Generate content hash
   */
  generateHash(content) {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Check if node is exported
   */
  isExported(node) {
    if (!node) return false;
    
    // Check for export keyword in declaration
    if (node.type?.startsWith('Export')) return true;
    
    // Check parent for export
    let current = node.parent;
    while (current) {
      if (current.type?.startsWith('Export')) return true;
      current = current.parent;
    }
    
    return false;
  }

  /**
   * Extract return type information
   */
  extractReturnType(node) {
    if (node.returnType?.typeAnnotation?.type) {
      return this.typeAnnotationToString(node.returnType.typeAnnotation);
    }
    return 'unknown';
  }

  /**
   * Extract variable type information
   */
  extractVariableType(node) {
    if (node.id?.typeAnnotation?.typeAnnotation?.type) {
      return this.typeAnnotationToString(node.id.typeAnnotation.typeAnnotation);
    }
    if (node.init) {
      return this.inferTypeFromExpression(node.init);
    }
    return 'unknown';
  }

  /**
   * Convert type annotation to string
   */
  typeAnnotationToString(typeAnnotation) {
    if (!typeAnnotation) return 'unknown';
    
    switch (typeAnnotation.type) {
      case 'TSStringKeyword':
        return 'string';
      case 'TSNumberKeyword':
        return 'number';
      case 'TSBooleanKeyword':
        return 'boolean';
      case 'TSVoidKeyword':
        return 'void';
      case 'TSAnyKeyword':
        return 'any';
      case 'TSTypeReference':
        return typeAnnotation.typeName?.name || 'object';
      default:
        return typeAnnotation.type || 'unknown';
    }
  }

  /**
   * Infer type from expression
   */
  inferTypeFromExpression(expression) {
    if (!expression) return 'unknown';
    
    switch (expression.type) {
      case 'Literal':
        return typeof expression.value;
      case 'ArrayExpression':
        return 'array';
      case 'ObjectExpression':
        return 'object';
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        return 'function';
      case 'NewExpression':
        return expression.callee?.name || 'object';
      default:
        return 'unknown';
    }
  }

  /**
   * Determine variable scope
   */
  determineScope(node, parent) {
    if (!parent) return 'global';
    
    switch (parent.kind) {
      case 'const':
      case 'let':
        return 'block';
      case 'var':
        return 'function';
      default:
        return 'unknown';
    }
  }

  /**
   * Determine import type
   */
  determineImportType(node) {
    if (node.source?.value?.startsWith('.')) {
      return 'relative';
    } else if (node.source?.value?.startsWith('/')) {
      return 'absolute';
    } else {
      return 'module';
    }
  }

  /**
   * Extract type properties
   */
  extractTypeProperties(node) {
    const properties = [];
    
    if (node.body?.body) {
      for (const member of node.body.body) {
        if (member.type === 'TSPropertySignature') {
          properties.push(member.key?.name || '<unnamed>');
        }
      }
    }
    
    return properties;
  }

  /**
   * Extract type methods
   */
  extractTypeMethods(node) {
    const methods = [];
    
    if (node.body?.body) {
      for (const member of node.body.body) {
        if (member.type === 'TSMethodSignature') {
          methods.push(member.key?.name || '<unnamed>');
        }
      }
    }
    
    return methods;
  }

  /**
   * Create fallback analysis when parsers are not available
   */
  createFallbackAnalysis(content, filePath, language) {
    const fileId = this.generateFileId(filePath);
    const lines = content.split('\n');
    
    // Basic regex-based analysis
    const functionPattern = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|\bfunction\b)|\w+\s*:\s*(?:\([^)]*\)\s*=>|function))/g;
    const classPattern = /class\s+(\w+)/g;
    const importPattern = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    const exportPattern = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    
    const functions = [];
    const classes = [];
    const imports = [];
    const exports = [];
    
    // Extract functions
    let match;
    while ((match = functionPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      functions.push({
        id: `func:${fileId}:${functions.length}`,
        name: this.extractNameFromMatch(match[0]) || `<anonymous_${functions.length}>`,
        line_start: lineNumber,
        line_end: lineNumber + 5, // Estimate
        complexity_cyclomatic: 1, // Basic fallback
        complexity_cognitive: 1, // Basic fallback
        parameter_count: this.countParameters(match[0]),
        file_id: fileId,
        file_path: filePath
      });
    }
    
    // Extract classes
    while ((match = classPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      classes.push({
        id: `class:${fileId}:${classes.length}`,
        name: match[1],
        line_start: lineNumber,
        line_end: lineNumber + 10, // Estimate
        method_count: 0, // Basic fallback
        property_count: 0, // Basic fallback
        file_id: fileId,
        file_path: filePath
      });
    }
    
    // Extract imports
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({
        id: `import:${fileId}:${imports.length}`,
        source: match[1],
        type: match[1].startsWith('.') ? 'relative' : 'external',
        file_id: fileId,
        file_path: filePath
      });
    }
    
    // Extract exports
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push({
        id: `export:${fileId}:${exports.length}`,
        name: match[1],
        type: 'named',
        file_id: fileId,
        file_path: filePath
      });
    }
    
    return {
      functions,
      classes,
      variables: [], // Not easily detectable with basic regex
      imports,
      exports,
      types: [] // TypeScript-specific, skip in fallback
    };
  }
  
  /**
   * Extract name from function match
   */
  extractNameFromMatch(match) {
    const nameMatch = match.match(/(?:function\s+(\w+)|const\s+(\w+)|(\w+)\s*:)/);
    return nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : null;
  }
  
  /**
   * Count parameters in function signature
   */
  countParameters(funcString) {
    const paramMatch = funcString.match(/\(([^)]*)\)/);
    if (!paramMatch || !paramMatch[1].trim()) return 0;
    return paramMatch[1].split(',').filter(p => p.trim()).length;
  }
}

export default ASTParser;