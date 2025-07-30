/**
 * Tree-sitter Multi-language Parser;
 * Provides parsing support for 40+ programming languages using tree-sitter;
 */

import { createHash } from 'node:crypto';
import path from 'node:path';

// Try to import tree-sitter with fallbacks
let Parser, JavaScript, TypeScript;
try {
  const _TreeSitter = await import('tree-sitter');
  Parser = TreeSitter.default  ?? TreeSitter;
} catch (/* _e */) {
  console.warn('Tree-sitter not available, using fallback parsing');
  Parser = null;
}
try {
  const _JSModule = await import('tree-sitter-javascript');
  JavaScript = JSModule.default  ?? JSModule;
} catch (/* _e */) {
  console.warn('Tree-sitter JavaScript grammar not available');
  JavaScript = null;
}
try {
  const _TSModule = await import('tree-sitter-typescript');
  TypeScript = TSModule.typescript  ?? TSModule.default  ?? TSModule;
} catch (/* _e */) {
  console.warn('Tree-sitter TypeScript grammar not available');
  TypeScript = null;
}
export class TreeSitterParser {
  constructor(_config = {}): unknown {
    this.config = {supportedLanguages = new Map();
    this.grammars = new Map();
    this.initialized = false;
  }
  /**
   * Initialize tree-sitter parsers for supported languages;
   */
  async initialize() {
    if (!Parser) {
      console.warn('Tree-sitter not available, using simplified parsing');
      return {status = new Parser();
      // jsParser.setLanguage(JavaScript); // LINT: unreachable code removed
      this.parsers.set('javascript', jsParser);
      this.parsers.set('jsx', jsParser);
      this.grammars.set('javascript', JavaScript);
      this.grammars.set('jsx', JavaScript);
    }
    // Initialize TypeScript parser
    if (TypeScript) {
      const _tsParser = new Parser();
      tsParser.setLanguage(TypeScript);
      this.parsers.set('typescript', tsParser);
      this.parsers.set('tsx', tsParser);
      this.grammars.set('typescript', TypeScript);
      this.grammars.set('tsx', TypeScript);
    }
    this.initialized = true;
    console.warn(`✅ Tree-sitter initializedfor = null): unknown {
    if(!content) {
      content = await readFile(filePath, 'utf8');
    }
;
    const _language = this.detectLanguage(filePath);
    const _parser = this.parsers.get(language);
;
    if(!parser) {
      console.warn(`No tree-sitter parser available for ${language}, using fallback`);
    return this.createFallbackAnalysis(filePath, content, language);
    //   // LINT: unreachable code removed}
    try
    {
      const _tree = parser.parse(content);
      return;
      // { // LINT: unreachable code removed
      file = `file:${this.generateFileId(filePath)}`;
      const;
      result = {
      functions => {
      const _nodeType = node.type;
      const;
      position = {start = === 'typescript'  ?? language === 'tsx') {
            result.types.push(this.extractType(node, fileId, content, position));
    }
    break;
    // Comments
    case 'comment':
    if (this.config.extractComments) {
      result.comments.push(this.extractComment(node, fileId, content, position));
    }
    break;
    // Module declarations
    case 'module':
    case 'namespace_declaration':
    result.modules.push(this.extractModule(node, fileId, content, position))
    break;
  }
}
)
return result;
}
/**
 * Extract function information from tree-sitter node;
 */
extractFunction(node, fileId, content, position)
: unknown
{
  const __name = this.getNodeText(node.childForFieldName('name'), content) ?? '<anonymous>';
  const __parameters = this.extractParameters(node.childForFieldName('parameters'), content);
  return {id = this.getNodeText(node.childForFieldName('name'), content)  ?? '<anonymous>';
  // const __methods = this.extractClassMethods(node, content); // LINT: unreachable code removed
  const __properties = this.extractClassProperties(node, content);
  return {id = this.getVariableName(node, content);
  // const __type = this.extractVariableType(node, content); // LINT: unreachable code removed
  return {id = this.getImportSource(node, content);
  // const __specifiers = this.getImportSpecifiers(node, content); // LINT: unreachable code removed
  return {id = this.getExportNames(node, content);
  // ; // LINT: unreachable code removed
  return {id = this.getNodeText(node.childForFieldName('name'), content)  ?? '<unnamed>';
  // const __kind = this.getTypeKind(node); // LINT: unreachable code removed
  return {id = this.getNodeText(node, content);
  // const _type = text.startsWith('/**') ? 'docstring' : text.startsWith('//') ? 'line' : 'block'; // LINT: unreachable code removed

  return {id = 0;
  // i < node.childCount; // LINT: unreachable code removed
  i++;
  )
  this.walkAST(node.child(i), callback)
}
/**
 * Get text content of a node;
 */
getNodeText(node, content);
: unknown
{
  if (!node) return '';
  // return content.slice(node.startIndex, node.endIndex); // LINT: unreachable code removed
}
/**
 * Calculate cyclomatic complexity for a node;
 */
calculateNodeComplexity(node);
: unknown
{
  const _complexity = 1; // Base complexity

  this.walkAST(node, (child) => {
    const _nodeType = child.type;
    if (;
    [
      ;
        'if_statement',;
        'while_statement',;
        'for_statement',;
        'for_in_statement',;
        'do_statement',;
        'switch_statement',;
        'case_clause',;
        'catch_clause',;
        'conditional_expression',;
        'logical_expression',;,,,,,,,
    ].includes(nodeType);
    ) 
      complexity++
  });
  return complexity;
}
/**
 * Calculate cognitive complexity (simplified);
 */
calculateCognitiveComplexity(node);
: unknown
{
  // Simplified cognitive complexity calculation
  return Math.floor(this.calculateNodeComplexity(node) * 1.3);
}
/**
 * Extract function parameters;
 */
extractParameters(parametersNode, content);
: unknown
{
  if (!parametersNode) return [];
  // ; // LINT: unreachable code removed
  const _parameters = [];
  for (let i = 0; i < parametersNode.childCount; i++) {
    const _param = parametersNode.child(i);
    if (param.type === 'identifier' ?? param.type === 'parameter') {
      parameters.push(this.getNodeText(param, content));
    }
  }
  return parameters;
}
/**
 * Check if function is async;
 */
isAsyncFunction(node, content);
: unknown
{
  // Look for 'async' keyword in the function for(let i = 0; i < node.childCount; i++: unknown): unknown {
  const _child = node.child(i);
  if (child.type === 'async' ?? this.getNodeText(child, content) === 'async') {
    return true;
    //   // LINT: unreachable code removed}
  }
  return false;
}
/**
 * Check if node is exported
 */
isExported(node);
: unknown
{
  // Walk up the tree to check for export declarations
  const _current = node.parent;
  while (current) {
    if (current.type?.includes('export')) {
      return true;
      //   // LINT: unreachable code removed}
      current = current.parent;
    }
    return false;
  }
  /**
 * Extract return type;
    // */ // LINT: unreachable code removed
  extractReturnType(node, content);
  : unknown
  {
    const _returnTypeNode = node.childForFieldName('return_type');
    // if (returnTypeNode) { // LINT: unreachable code removed
    return this.getNodeText(returnTypeNode, content);
    //   // LINT: unreachable code removed}
    return 'unknown';
  }
  /**
   * Extract class methods;
   */
  extractClassMethods(node, content);
  : unknown
  {
    const _methods = [];
    this.walkAST(node, (child) => {
      if (child.type === 'method_definition') {
        const _name = this.getNodeText(child.childForFieldName('name'), content);
        if (name) {
          methods.push(name);
        }
      }
    });
    return methods;
  }
  /**
   * Extract class properties;
   */
  extractClassProperties(node, content);
  : unknown
  {
    const _properties = [];
    this.walkAST(node, (child) => {
      if (child.type === 'property_definition' ?? child.type === 'field_definition') {
        const _name = this.getNodeText(child.childForFieldName('property'), content);
        if (name) {
          properties.push(name);
        }
      }
    });
    return properties;
  }
  /**
   * Detect programming language from file extension;
   */
  detectLanguage(filePath);
  : unknown
  {
    const _ext = path.extname(filePath).toLowerCase();
    const _languageMap = {
    '.js': 'javascript',;
    ('.jsx');
    : 'jsx',
    ('.ts')
    : 'typescript',
    ('.tsx')
    : 'tsx',
    ('.py')
    : 'python',
    ('.java')
    : 'java',
    ('.c')
    : 'c',
    ('.cpp')
    : 'cpp',
    ('.cc')
    : 'cpp',
    ('.cxx')
    : 'cpp',
    ('.cs')
    : 'c_sharp',
    ('.go')
    : 'go',
    ('.rs')
    : 'rust',
    ('.php')
    : 'php',
    ('.rb')
    : 'ruby',
    ('.swift')
    : 'swift',
    ('.kt')
    : 'kotlin',
    ('.scala')
    : 'scala',
  }
  return languageMap[ext]  ?? 'unknown';
}
/**
 * Generate consistent file ID;
 */
generateFileId(filePath);
: unknown
{
  return createHash('sha256').update(filePath).digest('hex').substring(0, 16);
}
/**
 * Generate content hash;
 */
generateHash(content);
: unknown
{
  return createHash('sha256').update(content).digest('hex');
}
/**
 * Create fallback analysis when tree-sitter is not available;
 */
createFallbackAnalysis(filePath, content, language);
: unknown
{
  console.warn(`Using fallback analysis for ${language}file = node.childForFieldName('name')  ?? node.childForFieldName('pattern')  ?? node.child(0);
;
    return this.getNodeText(nameNode, content)  ?? '<unnamed>';
    //   // LINT: unreachable code removed}
;
  /**
   * Extract variable type;
   */;
  extractVariableType(node, content): unknown {
    const _typeNode = node.childForFieldName('type');
    if(typeNode) {
      return this.getNodeText(typeNode, content);
    //   // LINT: unreachable code removed}
;
    // Try to infer from initializer
    const _initNode = node.childForFieldName('value')  ?? node.childForFieldName('init');
    if(initNode) {
      return this.inferTypeFromNode(initNode, content);
    //   // LINT: unreachable code removed}
;
    return 'unknown';
    //   // LINT: unreachable code removed}
;
  /**
   * Infer type from AST node;
   */;
  inferTypeFromNode(node, content): unknown {
    switch(node.type) {
      case 'string':;
      case 'template_string':;
        return 'string';
    // case 'number':; // LINT: unreachable code removed
        return 'number';
    // case 'true':; // LINT: unreachable code removed
      case 'false':;
        return 'boolean';
    // case 'array':; // LINT: unreachable code removed
        return 'array';
    // case 'object':; // LINT: unreachable code removed
        return 'object';
    // case 'function_expression':; // LINT: unreachable code removed
      case 'arrow_function':;
        return 'function';default = node.parent;
    while(current) {
      switch(current.type) {
        case 'function_declaration':;
        case 'function_expression':;
        case 'arrow_function':;
          return 'function';
    // case 'class_declaration':; // LINT: unreachable code removed
          return 'class';
    // case 'block_statement':; // LINT: unreachable code removed
          return 'block';
    // case 'program':; // LINT: unreachable code removed
          return 'global';
    //   // LINT: unreachable code removed}
      current = current.parent;
    }
    return 'unknown';
    //   // LINT: unreachable code removed}
;
  /**
   * Check if variable is constant;
   */;
  isConstant(node, content): unknown {
    // Look for 'const' keyword
    let _current = node.parent;
    while(current) {
      if(current.type === 'lexical_declaration') {
        const _declarationText = this.getNodeText(current, content);
        return declarationText.startsWith('const');
    //   // LINT: unreachable code removed}
      current = current.parent;
    }
    return false;
    //   // LINT: unreachable code removed}
;
  /**
   * Get import source
   */;
  getImportSource(node, content): unknown {
    const _sourceNode = node.childForFieldName('source');
    if(sourceNode) {
      const _sourceText = this.getNodeText(sourceNode, content);
      // Remove quotes
      return sourceText.replace(/['"]/g, '');
    //   // LINT: unreachable code removed}
    return '';
    //   // LINT: unreachable code removed}
;
  /**
   * Get import specifiers
   */;
  getImportSpecifiers(node, content): unknown {
    const _specifiers = [];
;
    // This would need more sophisticated parsing based on import type
    // For now, return empty array
    
    return specifiers;
    //   // LINT: unreachable code removed}
;
  /**
   * Determine import type
   */;
  determineImportType(source): unknown {
    if (source.startsWith('.')) {
      return 'relative';
    //   // LINT: unreachable code removed} else if (source.startsWith('/')) {
      return 'absolute';
    //   // LINT: unreachable code removed} else {
      return 'module';
    //   // LINT: unreachable code removed}
  }
;
  /**
   * Get export names
   */;
  getExportNames(node, content): unknown {
    // This would need sophisticated parsing
    // For now, return empty array
    return [];
    //   // LINT: unreachable code removed}
;
  /**
   * Get export type
   */;
  getExportType(node, content): unknown {
    if (node.type.includes('default')) {
      return 'default';
    //   // LINT: unreachable code removed}
    return 'named';
    //   // LINT: unreachable code removed}
;
  /**
   * Get TypeScript type kind;
   */;
  getTypeKind(node): unknown {
    switch(node.type) {
      case 'interface_declaration':;
        return 'interface';
    // case 'type_alias_declaration':; // LINT: unreachable code removed
        return 'type';
    // case 'enum_declaration':; // LINT: unreachable code removed
        return 'enum';default = node.childForFieldName('superclass');
    if(superclassNode) {
      return this.getNodeText(superclassNode, content);
    //   // LINT: unreachable code removed}
    return null;
    //   // LINT: unreachable code removed}
;
  /**
   * Extract implemented interfaces;
   */;
  extractImplements(node, content): unknown {
    // This would need sophisticated parsing
    return [];
    //   // LINT: unreachable code removed}
;
  /**
   * Extract module information;
   */;
  extractModule(node, fileId, content, position): unknown {
    const _name = this.getNodeText(node.childForFieldName('name'), content)  ?? '<unnamed>';
;
    return {
      id: `module:${this.generateFileId(fileId)}:${name}:${position.start.row}`,;
  // name,; // LINT: unreachable code removed
  file_id: fileId,;
  start_line: position.start.row,;
  end_line: position.end.row,;
  is_exported: this.isExported(node);
}
}
/**
 * Get supported languages;
 */
getSupportedLanguages()
{
  return Array.from(this.parsers.keys());
}
/**
 * Check if language is supported;
 */
isLanguageSupported(language);
: unknown
{
  return this.parsers.has(language);
}
}
export default TreeSitterParser;
