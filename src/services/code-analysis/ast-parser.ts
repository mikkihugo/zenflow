/**
 * Unified AST Parser Interface
 * Provides consistent parsing for JavaScript/TypeScript and other languages
 */

import { readFile } from 'node:fs/promises';

// Try to import optional dependencies with fallbacks
let _parseTypeScript, _parseJavaScript, acorn;

try {
  const tsModule = await import('@typescript-eslint/parser');
  _parseTypeScript = tsModule.parse;
} catch (_e) {
  console.warn('TypeScript parser not available, using fallback');
  _parseTypeScript = null;
}

try {
  const jsModule = await import('esprima');
  _parseJavaScript = jsModule.parse;
} catch (_e) {
  console.warn('Esprima parser not available, using fallback');
  _parseJavaScript = null;
}

try {
  acorn = await import('acorn');
} catch (_e) {
  console.warn('Acorn parser not available, using fallback');
  acorn = null;
}

export class ASTParser {
  constructor(_config = {}): any {
    this.config = {parseOptions = null): any {
    if(!content) {
      content = await readFile(filePath, 'utf8');
    }

    const language = this.detectLanguage(filePath);
    const _hash = this.generateHash(content);
    
    let _ast;
    let _parseResult;

    try {
      switch(language) {
        case 'typescript':
        case 'tsx':
          _parseResult = this.parseTypeScript(content, filePath);
          break;
        case 'javascript':
        case 'jsx':
          _parseResult = this.parseJavaScript(content, filePath);
          break;default = parseTypeScript(content, {
      ...this.config.typeScriptOptions,
      filePath,project = parseJavaScript(content, {sourceType = acorn.parse(content, {
          ...this.config.parseOptions,locations = `file = {
      functions => {
      switch(node.type) {
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
          if(language === 'typescript') {
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
  extractFunctionInfo(node, fileId, filePath): any {
    const name = node.id?.name || 
                 node.key?.name || 
                 (node.type === 'ArrowFunctionExpression' ? '<anonymous>' : '<unnamed>');
    
    const start = node.loc?.start?.line || 0;
    const end = node.loc?.end?.line || 0;
    const params = node.params || [];
    
    return {id = node.id?.name || '<anonymous>';
    const start = node.loc?.start?.line || 0;
    const end = node.loc?.end?.line || 0;
    
    const methods = (node.body?.body || []).filter(n => 
      n.type === 'MethodDefinition' || n.type === 'PropertyDefinition'
    );
    
    return {id = > m.type === 'MethodDefinition').length,property_count = > m.type === 'PropertyDefinition').length,is_exported = > i.expression?.name || i.name) || []
    };
  }

  /**
   * Extract variable information
   */
  extractVariableInfo(node, parent, fileId, filePath): any {
    const name = node.id?.name || '<unnamed>';
    const line = node.loc?.start?.line || 0;

    return {id = node.source?.value || '<unknown>';
    const line = node.loc?.start?.line || 0;
    const importedNames = [];
    
    if(node.specifiers) {
      for(const spec of node.specifiers) {
        if(spec.type === 'ImportDefaultSpecifier') {
          importedNames.push('default');
        } else if(spec.type === 'ImportSpecifier') {
          importedNames.push(spec.imported?.name || spec.local?.name);
        } else if(spec.type === 'ImportNamespaceSpecifier') {
          importedNames.push('*');
        }
      }
    }
    
    return {id = node.loc?.start?.line || 0;
    const exportNames = [];
    let exportType = 'named';
    
    if(node.type === 'ExportDefaultDeclaration') {
      exportType = 'default';
      exportNames.push('default');
    } else if(node.type === 'ExportAllDeclaration') {
      exportType = 'all';
      exportNames.push('*');
    } else if(node.specifiers) {
      for(const spec of node.specifiers) {
        exportNames.push(spec.exported?.name || spec.local?.name);
      }
    }
    
    return {id = node.id?.name || '<unnamed>';
    const line = node.loc?.start?.line || 0;
    let kind = 'unknown';
    
    switch(node.type) {
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
    
    return {id = null): any {
    if (!node || typeof node !== 'object') return;
    
    callback(node, parent);
    
    for(const key in node) {
      if(key === 'parent' || key === 'leadingComments' || key === 'trailingComments') {
        continue;
      }
      
      const child = node[key];
      if (Array.isArray(child)) {
        for(const item of child) {
          this.walkAST(item, callback, node);
        }
      } else if(child && typeof child === 'object' && child.type) {
        this.walkAST(child, callback, node);
      }
    }
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(node): any {
    const complexity = 1; // Base complexity
    
    this.walkAST(node, (child) => {
      switch(child.type) {
        case 'IfStatement':
        case 'ConditionalExpression':
        case 'SwitchCase':
        case 'WhileStatement':
        case 'DoWhileStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
        case 'LogicalExpression':
          if(child.operator === '&&' || child.operator === '||') {
            complexity++;
          }
          if(child.type !== 'LogicalExpression') {
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
  calculateCognitiveComplexity(node): any {
    // This is a simplified version - real cognitive complexity is more nuanced
    return Math.floor(this.calculateCyclomaticComplexity(node) * 1.2);
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(filePath): any {
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
  generateFileId(filePath): any {
    return createHash('sha256').update(filePath).digest('hex').substring(0, 16);
  }

  /**
   * Generate content hash
   */
  generateHash(content): any {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Check if node is exported
   */
  isExported(node): any {
    if (!node) return false;
    
    // Check for export keyword in declaration
    if (node.type?.startsWith('Export')) return true;
    
    // Check parent for export
    let current = node.parent;
    while(current) {
      if (current.type?.startsWith('Export')) return true;
      current = current.parent;
    }
    
    return false;
  }

  /**
   * Extract return type information
   */
  extractReturnType(node): any {
    if(node.returnType?.typeAnnotation?.type) {
      return this.typeAnnotationToString(node.returnType.typeAnnotation);
    }
    return 'unknown';
  }

  /**
   * Extract variable type information
   */
  extractVariableType(node): any {
    if(node.id?.typeAnnotation?.typeAnnotation?.type) {
      return this.typeAnnotationToString(node.id.typeAnnotation.typeAnnotation);
    }
    if(node.init) {
      return this.inferTypeFromExpression(node.init);
    }
    return 'unknown';
  }

  /**
   * Convert type annotation to string
   */
  typeAnnotationToString(typeAnnotation): any {
    if (!typeAnnotation) return 'unknown';
    
    switch(typeAnnotation.type) {
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
        return typeAnnotation.typeName?.name || 'object';default = [];
    
    if(node.body?.body) {
      for(const member of node.body.body) {
        if(member.type === 'TSPropertySignature') {
          properties.push(member.key?.name || '<unnamed>');
        }
      }
    }
    
    return properties;
  }

  /**
   * Extract type methods
   */
  extractTypeMethods(node): any {
    const methods = [];
    
    if(node.body?.body) {
      for(const member of node.body.body) {
        if(member.type === 'TSMethodSignature') {
          methods.push(member.key?.name || '<unnamed>');
        }
      }
    }
    
    return methods;
  }

  /**
   * Create fallback analysis when parsers are not available
   */
  createFallbackAnalysis(content, filePath, language): any {
    const fileId = this.generateFileId(filePath);

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
      let lineNumber = content.substring(0, match.index).split('\n').length;
      functions.push({id = classPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      classes.push({id = importPattern.exec(content)) !== null) {
      imports.push({id = exportPattern.exec(content)) !== null) {
      exports.push({id = match.match(/(?:function\s+(\w+)|const\s+(\w+)|(\w+)\s*:)/);
    return nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : null;
  }
  
  /**
   * Count parameters in function signature
   */
  countParameters(funcString): any {
    const paramMatch = funcString.match(/\(([^)]*)\)/);
    if (!paramMatch || !paramMatch[1].trim()) return 0;
    return paramMatch[1].split(',').filter(p => p.trim()).length;
  }
}

export default ASTParser;
