/**
 * @fileoverview Codebase Analyzer
 *
 * Analyzes codebase structure and relationships for file-aware AI
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
// import { glob} from 'fast-glob'; // Temporarily disabled for compilation')import ignore from 'ignore';

// Fallback glob function for compilation
async function glob(pattern:string, options:any): Promise<string[]> {
  // Simple fallback - in production this would use fast-glob
  logger.info('Using fallback glob for pattern:', pattern); // Use pattern parameter')  try {
    const fs = require('node:fs');')    const path = require('node:path');')
    function walkDir(dir:string, fileList:string[] = []): string[] {
      // Validate that dir is actually a string
      if (typeof dir !== 'string') {
    ')        logger.warn('Invalid directory path type:', typeof dir, dir);')        return fileList;
}

      try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const fullPath = path.join(dir, file);

          try {
            const stat = fs.statSync(fullPath);

            if (
              stat.isDirectory() &&
              !file.startsWith('.') &&')              file !== 'node_modules') ')              walkDir(fullPath, fileList);else if (stat.isFile() && options.onlyFiles) {
              const relativePath = path.relative(
                options.cwd||process.cwd(),
                fullPath
              );
              fileList.push(relativePath);
}
} catch (statError) {
            // Skip files that can't be stat' d (e.g., broken symlinks)')            logger.warn(
              'Cannot stat file: ','              fullPath,
              statError instanceof Error ? statError.message:String(statError)
            );
}
}
} catch (readDirError) {
        logger.warn(
          'Cannot read directory: ','          dir,
          readDirError instanceof Error
            ? readDirError.message
            :String(readDirError)
        );
}

      return fileList;
}

    const baseDir = options.cwd||process.cwd();

    // Validate baseDir is a string
    if (typeof baseDir !=='string') {
    ')      logger.warn('Invalid baseDir type:', typeof baseDir, baseDir);')      return [];
}

    return walkDir(baseDir).slice(0, 100); // Limit for safety
} catch (error) {
    logger.warn('Fallback glob failed:', error);')    return [];
}
}

import type {
  AnalyzedContext,
  FileDependency,
  SymbolReference,
} from '../types/index';

export class CodebaseAnalyzer {
  private rootPath:string;
  private excludePatterns:string[];
  private gitignore:ReturnType<typeof ignore>;

  constructor(rootPath:string, excludePatterns:string[] = []) {
    this.rootPath = rootPath;
    this.excludePatterns = [
      'node_modules/**',      '.git/**',      'dist/**',      'build/**',      '*.log',      '.env*',      ...excludePatterns,
];
    this.gitignore = ignore().add(this.excludePatterns);
}

  /**
   * Check if file should be ignored according to patterns
   */
  private shouldIgnoreFile(filePath:string): boolean {
    return this.gitignore.ignores(filePath);
}

  /**
   * Analyze codebase and return context for AI processing
   */
  async analyzeContext(
    targetFiles:string[] = [],
    maxFiles:number = 50
  ):Promise<AnalyzedContext> {
    const relevantFiles = await this.findRelevantFiles(targetFiles, maxFiles);
    const dependencies = await this.analyzeDependencies(relevantFiles);
    const symbols = await this.extractSymbols(relevantFiles);
    const summary = this.generateSummary(relevantFiles, dependencies, symbols);
    const complexity = this.assessComplexity(
      relevantFiles,
      dependencies,
      symbols
    );

    return {
      relevantFiles,
      dependencies,
      symbols,
      summary,
      complexity,
};
}

  /**
   * Find files relevant to the analysis
   */
  private async findRelevantFiles(
    targetFiles:string[],
    maxFiles:number
  ):Promise<string[]> {
    const allFiles = new Set<string>();

    // Add target files
    for (const file of targetFiles) {
      if (await this.fileExists(file)) {
        allFiles.add(file);
}
}

    // Find related files in the same directories
    for (const file of targetFiles) {
      const dir = path.dirname(file);
      const relatedFiles = await this.findFilesInDirectory(dir, 10);
      relatedFiles.forEach((f) => allFiles.add(f));
}

    // If we need more files, scan the project structure
    if (allFiles.size < maxFiles) {
      const projectFiles = await this.scanProject(maxFiles - allFiles.size);
      projectFiles.forEach((f) => allFiles.add(f));
}

    return Array.from(allFiles).slice(0, maxFiles);
}

  /**
   * Analyze dependencies between files
   */
  private async analyzeDependencies(
    files:string[]
  ):Promise<FileDependency[]> {
    const dependencies:FileDependency[] = [];

    for (const file of files) {
      const content = await this.readFile(file);
      if (!content) continue;

      // Extract import statements
      const imports = this.extractImports(content, file);
      dependencies.push(...imports);
}

    return dependencies;
}

  /**
   * Extract symbols from files
   */
  private async extractSymbols(files:string[]): Promise<SymbolReference[]> {
    const symbols:SymbolReference[] = [];

    for (const file of files) {
      const content = await this.readFile(file);
      if (!content) continue;

      const fileSymbols = this.extractSymbolsFromContent(content, file);
      symbols.push(...fileSymbols);
}

    return symbols;
}

  /**
   * Extract import statements from file content
   */
  private extractImports(content:string, filePath:string): FileDependency[] {
    const dependencies:FileDependency[] = [];
    const importRegex = /(?:import|require|from)\s+['"](.*?)['"];?/g;')    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (
        importPath &&
        !importPath.startsWith('.') &&')        !importPath.includes('node_modules')')      ) 
        dependencies.push({
          from:filePath,
          to:importPath,
          type: 'import',});
}

    return dependencies;
}

  /**
   * Extract symbols from content
   */
  private extractSymbolsFromContent(
    content:string,
    filePath:string
  ):SymbolReference[] {
    const symbols:SymbolReference[] = [];
    const __lines = content.split('\n');')
    lines.forEach((line, lineIndex) => {
      // Extract function declarations
      const functionMatch = line.match(
        /(?:function|const|let|var)\s+(\w+)\s*[=:]?\s*(?:function|\()/
      );
      if (functionMatch?.[1]) {
        symbols.push({
          name:functionMatch[1],
          type: 'function',          file:filePath,
          line:lineIndex + 1,
          column:line.indexOf(functionMatch[1]),
});
}

      // Extract class declarations
      const classMatch = line.match(/(?:class|interface)\s+(\w+)/);
      if (classMatch?.[1] && classMatch[0]) {
        symbols.push({
          name:classMatch[1],
          type:classMatch[0].includes('class') ? ' class' : ' interface',          file:filePath,
          line:lineIndex + 1,
          column:line.indexOf(classMatch[1]),
});
}
});

    return symbols;
}

  /**
   * Generate summary of codebase
   */
  private generateSummary(
    files:string[],
    dependencies:FileDependency[],
    symbols:SymbolReference[]
  ):string {
    const fileTypes = this.categorizeFiles(files);
    const mainLanguages = Object.keys(fileTypes).slice(0, 3);

    return (
      `Codebase analysis:${files.length} files, ${symbols.length} symbols, ${dependencies.length} dependencies. `
      `Primary languages:$mainLanguages.join(',    '). ` +`
      `Structure includes $fileTypes.ts||0TypeScript, $fileTypes.js||0JavaScript, $fileTypes.json||0config files.``
    );
}

  /**
   * Assess complexity of the codebase
   */
  private assessComplexity(
    files:string[],
    dependencies:FileDependency[],
    symbols:SymbolReference[]
  ):'low|medium|high' {
    ')    const fileCount = files.length;
    const dependencyCount = dependencies.length;
    const symbolCount = symbols.length;

    if (fileCount < 10 && dependencyCount < 20 && symbolCount < 50) {
      return 'low;
} else if (fileCount < 50 && dependencyCount < 100 && symbolCount < 200) {
      return 'medium;
} else {
      return 'high;
}
}

  /**
   * Categorize files by extension
   */
  private categorizeFiles(files:string[]): Record<string, number> {
    const categories:Record<string, number> = {};

    files.forEach((file) => {
      const ext = path.extname(file).slice(1)||'unknown;
      categories[ext] = (categories[ext]||0) + 1;
});

    return categories;
}

  /**
   * Find files in a specific directory
   */
  private async findFilesInDirectory(
    dir:string,
    limit:number
  ):Promise<string[]> {
    try {
      const pattern = path.join(dir,'**/*').replace(/\\/g, '/');')      const files = await glob(pattern, {
        cwd:this.rootPath,
        ignore:this.excludePatterns,
        onlyFiles:true,
        absolute:false,
});

      // Apply additional gitignore filtering
      const filteredFiles = files.filter(
        (file:string) => !this.shouldIgnoreFile(file)
      );
      return filteredFiles.slice(0, limit);
} catch (error) {
      logger.warn(`Error scanning directory ${dir}:`, error);`
      return [];
}
}

  /**
   * Scan entire project for files
   */
  private async scanProject(limit:number): Promise<string[]> {
    try {
      const files = await glob('**/*', {
    ')        cwd:this.rootPath,
        ignore:this.excludePatterns,
        onlyFiles:true,
        absolute:false,
});

      // Prioritize source files
      const prioritized = files.sort((a:string, b:string) => {
        const aPriority = this.getFilePriority(a);
        const bPriority = this.getFilePriority(b);
        return bPriority - aPriority;
});

      return prioritized.slice(0, limit);
} catch (error) {
      logger.warn('Error scanning project:', error);')      return [];
}
}

  /**
   * Get file priority for sorting
   */
  private getFilePriority(file:string): number {
    const ext = path.extname(file);
    const priorities:Record<string, number> = {
      '.ts':10,
      '.js':9,
      '.tsx':8,
      '.jsx':7,
      '.json':5,
      '.md':3,
      '.txt':1,
};

    return priorities[ext]||0;
}

  /**
   * Check if file exists
   */
  private async fileExists(filePath:string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
} catch {
      return false;
}
}

  /**
   * Read file content
   */
  private async readFile(filePath:string): Promise<string|null> {
    try {
      // Validate that filePath is actually a string
      if (typeof filePath !=='string') {
    ')        logger.warn(`Invalid filePath type:$typeof filePath`, filePath);`
        return null;
}

      const fullPath = path.isAbsolute(filePath)
        ? filePath
        :path.join(this.rootPath, filePath);
      const content = await fs.promises.readFile(fullPath, 'utf-8');')      return content;
} catch (error) {
      logger.warn(`Error reading file ${filePath}:`, error);`
      return null;
}
}
}
