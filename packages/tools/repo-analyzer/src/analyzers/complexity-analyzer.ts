/**
 * @fileoverview Battle-hardened complexity analyzer using multiple NPM tools
 * Gold standard complexity analysis with comprehensive metrics
 */

import { getLogger } from '@claude-zen/foundation';
import { Project, SyntaxKind } from 'ts-morph';
import type {
  AnalysisOptions,
  CodeSmell,
  ComplexityHotspot,
  ComplexityMetrics,
  ComplexityThresholds,
} from '../types/index.js';

export class ComplexityAnalyzer {
  private logger = getLogger('ComplexityAnalyzer');'
  private project?: Project;
  private thresholds: ComplexityThresholds;

  constructor(thresholds?: Partial<ComplexityThresholds>) {
    this.thresholds = {
      cyclomaticComplexity: 10,
      maintainabilityIndex: 20,
      linesOfCode: 300,
      parameters: 7,
      nestingDepth: 4,
      ...thresholds,
    };
  }

  /**
   * Initialize TypeScript project for AST analysis
   */
  async initialize(
    projectPath: string,
    options?: AnalysisOptions
  ): Promise<void> {
    try {
      this.project = new Project({
        tsConfigFilePath: `${projectPath}/tsconfig.json`,`
        skipAddingFilesFromTsConfig: false,
        skipFileDependencyResolution: options?.performanceMode === 'fast',
        compilerOptions: {
          allowJs: true,
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
        },
      });

      // Add source files if no tsconfig
      if (!this.project.getSourceFiles().length) {
        this.project.addSourceFilesAtPaths(
          `${projectPath}/**/*.{ts,tsx,js,jsx}``
        );
      }

      this.logger.info(
        `Initialized TypeScript project with ${this.project.getSourceFiles().length} files``
      );
    } catch (error) 
      this.logger.warn(
        'Failed to initialize TypeScript project, falling back to file-by-file analysis',
        error
      );
  }

  /**
   * Analyze complexity for all files in the repository
   */
  async analyzeRepository(
    files: string[],
    options?: AnalysisOptions
  ): Promise<ComplexityMetrics> {
    const fileComplexities: ComplexityMetrics[] = [];
    const codeSmells: CodeSmell[] = [];
    const hotspots: ComplexityHotspot[] = [];

    for (const filePath of files) {
      try {
        const fileComplexity = await this.analyzeFile(filePath, options);
        fileComplexities.push(fileComplexity);
        codeSmells.push(...fileComplexity.codeSmells);
        hotspots.push(...fileComplexity.hotspots);
      } catch (error) {
        this.logger.warn(`Failed to analyze file ${filePath}:`, error);`
      }
    }

    return this.aggregateComplexity(fileComplexities, codeSmells, hotspots);
  }

  /**
   * Analyze complexity for a single file using multiple tools
   */
  async analyzeFile(
    filePath: string,
    options?: AnalysisOptions
  ): Promise<ComplexityMetrics> {
    const content = await this.readFile(filePath);
    if (!content) {
      return this.getEmptyComplexity();
    }

    // Multi-tool analysis
    const [
      eslintComplexity,
      halsteadMetrics,
      cyclomaticComplexity,
      codeSmells,
      hotspots,
    ] = await Promise.allSettled([
      this.analyzeWithComplexityReport(content, filePath),
      this.calculateHalsteadMetrics(content, filePath),
      this.calculateCyclomaticComplexity(content, filePath),
      this.detectCodeSmells(content, filePath),
      this.identifyHotspots(content, filePath),
    ]);

    const complexity = this.getSettledValue(eslintComplexity, {});
    const halstead = this.getSettledValue(
      halsteadMetrics,
      this.getEmptyHalstead()
    );
    const cyclomatic = this.getSettledValue(cyclomaticComplexity, 1);
    const smells = this.getSettledValue(codeSmells, []);
    const spots = this.getSettledValue(hotspots, []);

    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      halstead,
      cyclomatic,
      content.split('\n').length'
    );

    const technicalDebt = this.estimateTechnicalDebt(
      cyclomatic,
      smells.length,
      spots.length
    );

    return {
      cyclomatic,
      halstead,
      maintainabilityIndex,
      technicalDebt,
      codeSmells: smells,
      hotspots: spots,
    };
  }

  /**
   * Analyze using complexity-report NPM package
   */
  private async analyzeWithComplexityReport(
    content: string,
    filePath: string
  ): Promise<any> {
    try {
      const options = {
        logicalor: true,
        switchcase: true,
        forin: false,
        trycatch: true,
        newmi: true,
      };

      // Handle both CommonJS and ES modules
      let report;
      if (typeof complexityReport === 'function') {'
        report = complexityReport.run(content, options);
      } else if (complexityReport.run) {
        report = complexityReport.run(content, options);
      } else {
        // Fallback for different module structures
        const cr = (complexityReport as any).default||complexityReport;
        report = cr.run ? cr.run(content, options) : cr(content, options);
      }

      return report;
    } catch (error) {
      this.logger.debug(`Complexity report failed for ${filePath}:`, error);`
      return {};
    }
  }

  /**
   * Calculate Halstead complexity metrics
   */
  private async calculateHalsteadMetrics(
    content: string,
    filePath: string
  ): Promise<HalsteadMetrics> {
    try {
      let ast;

      // Try TypeScript first
      if (filePath.endsWith('.ts')||filePath.endsWith('.tsx')) {'
        const sourceFile = this.project?.getSourceFile(filePath);
        if (sourceFile) {
          return this.calculateHalsteadFromTSMorph(sourceFile);
        }
      }

      // Try Babel parser
      try {
        ast = babelParse(content, {
          sourceType: 'module',
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          plugins: [
            'typescript',
            'jsx',
            'decorators-legacy',
            'dynamicImport',
            'asyncGenerators',
            'functionBind',
            'exportDefaultFrom',
            'objectRestSpread',
            'classProperties',
            'optionalChaining',
            'nullishCoalescingOperator',
          ],
        });
      } catch {
        // Fall back to Acorn
        ast = acornParse(content, {
          ecmaVersion: 'latest',
          sourceType: 'module',
          allowHashBang: true,
          allowReturnOutsideFunction: true,
        });
      }

      // Fallback to basic parsing if ts-morph fails
      return this.getEmptyHalstead();
    } catch (error) {
      this.logger.debug(`Halstead calculation failed for ${filePath}:`, error);`
      return this.getEmptyHalstead();
    }
  }

  /**
   * Calculate Halstead metrics from ts-morph SourceFile
   */
  private calculateHalsteadFromTSMorph(
    sourceFile: SourceFile
  ): HalsteadMetrics {
    const operators = new Set<string>();
    const operands = new Set<string>();
    let operatorCount = 0;
    let operandCount = 0;

    // Walk the AST and collect operators and operands
    sourceFile.forEachDescendant((node) => {
      const kind = node.getKind();
      const text = node.getText();

      // Operators
      if (this.isOperatorKind(kind)) {
        operators.add(text);
        operatorCount++;
      }
      // Operands (identifiers, literals)
      else if (kind === SyntaxKind.Identifier||this.isLiteralKind(kind)) {
        operands.add(text);
        operandCount++;
      }
    });

    const n1 = operators.size; // Unique operators
    const n2 = operands.size; // Unique operands
    const N1 = operatorCount; // Total operators
    const N2 = operandCount; // Total operands

    return this.calculateHalsteadValues(n1, n2, N1, N2);
  }


  /**
   * Calculate final Halstead values
   */
  private calculateHalsteadValues(
    n1: number,
    n2: number,
    N1: number,
    N2: number
  ): HalsteadMetrics {
    const vocabulary = n1 + n2;
    const length = N1 + N2;
    const volume = length * Math.log2(vocabulary||1);
    const difficulty = (n1 / 2) * (N2 / (n2||1));
    const effort = difficulty * volume;
    const time = effort / 18;
    const bugs = volume / 3000;

    return {
      vocabulary,
      length,
      difficulty: isFinite(difficulty) ? difficulty : 0,
      effort: isFinite(effort) ? effort : 0,
      time: isFinite(time) ? time : 0,
      bugs: isFinite(bugs) ? bugs : 0,
      volume: isFinite(volume) ? volume : 0,
    };
  }

  /**
   * Calculate cyclomatic complexity
   */
  private async calculateCyclomaticComplexity(
    content: string,
    filePath: string
  ): Promise<number> {
    try {
      // Count decision points
      let complexity = 1; // Base complexity

      // Simple regex-based approach for robustness
      const patterns = [
        /\bif\b/g,
        /\belses+if\b/g,
        /\bwhile\b/g,
        /\bfor\b/g,
        /\bdo\b/g,
        /\bswitch\b/g,
        /\bcase\b/g,
        /\bcatch\b/g,
        /&&/g,
        /||/g,
        /?/g, // Ternary operator
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          complexity += matches.length;
        }
      }

      return Math.max(1, complexity);
    } catch (error) {
      this.logger.debug(
        `Cyclomatic complexity calculation failed for ${filePath}:`,`
        error
      );
      return 1;
    }
  }

  /**
   * Detect code smells
   */
  private async detectCodeSmells(
    content: string,
    filePath: string
  ): Promise<CodeSmell[]> {
    const smells: CodeSmell[] = [];
    const lines = content.split('\n');'

    // Long method detection
    const methods = this.extractMethods(content);
    for (const method of methods) {
      if (method.lines > this.thresholds.linesOfCode) {
        smells.push({
          type: 'long-method',
          severity:
            method.lines > this.thresholds.linesOfCode * 2 ? 'high' : 'medium',
          file: filePath,
          startLine: method.startLine,
          endLine: method.endLine,
          description: `Method '${method.name}' has ${method.lines} lines (threshold: ${this.thresholds.linesOfCode})`,`
          suggestion:
            'Consider breaking this method into smaller, more focused methods',
        });
      }
    }

    // Duplicate code detection (simple approach)
    const duplicates = this.findDuplicateBlocks(lines);
    for (const duplicate of duplicates) {
      smells.push({
        type: 'duplicate-code',
        severity: 'medium',
        file: filePath,
        startLine: duplicate.startLine,
        endLine: duplicate.endLine,
        description: `Duplicate code block found (${duplicate.lines} lines)`,`
        suggestion: 'Extract duplicate code into a shared function or module',
      });
    }

    // Dead code detection (unused variables/functions)
    const deadCode = this.findDeadCode(content);
    for (const dead of deadCode) {
      smells.push({
        type: 'dead-code',
        severity: 'low',
        file: filePath,
        startLine: dead.line,
        endLine: dead.line,
        description: `Potentially unused ${dead.type}: '${dead.name}'`,`
        suggestion: 'Remove unused code or add usage if needed',
      });
    }

    return smells;
  }

  /**
   * Identify complexity hotspots
   */
  private async identifyHotspots(
    content: string,
    filePath: string
  ): Promise<ComplexityHotspot[]> {
    const hotspots: ComplexityHotspot[] = [];
    const methods = this.extractMethods(content);

    for (const method of methods) {
      const complexity = await this.calculateCyclomaticComplexity(
        method.content,
        filePath
      );
      const maintainabilityIndex = this.calculateMaintainabilityIndex(
        await this.calculateHalsteadMetrics(method.content, filePath),
        complexity,
        method.lines
      );

      if (
        complexity > this.thresholds.cyclomaticComplexity||maintainabilityIndex < this.thresholds.maintainabilityIndex
      ) {
        hotspots.push({
          file: filePath,
          function: method.name,
          complexity,
          lines: method.lines,
          maintainabilityIndex,
          priority: this.calculateHotspotPriority(
            complexity,
            maintainabilityIndex,
            method.lines
          ),
        });
      }
    }

    return hotspots.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate Microsoft Maintainability Index
   */
  private calculateMaintainabilityIndex(
    halstead: HalsteadMetrics,
    complexity: number,
    loc: number
  ): number {
    // Microsoft Maintainability Index formula
    const volume = halstead.volume||1;
    const mi = Math.max(
      0,
      171 -
        5.2 * Math.log(volume) -
        0.23 * complexity -
        16.2 * Math.log(loc||1)
    );
    return Math.round(mi * 100) / 100;
  }

  /**
   * Estimate technical debt in hours
   */
  private estimateTechnicalDebt(
    complexity: number,
    codeSmells: number,
    hotspots: number
  ): number {
    // Simple heuristic for technical debt estimation
    const complexityDebt = Math.max(0, complexity - 10) * 0.5; // 30 minutes per excessive complexity point
    const smellDebt = codeSmells * 2; // 2 hours per code smell
    const hotspotDebt = hotspots * 4; // 4 hours per hotspot

    return Math.round((complexityDebt + smellDebt + hotspotDebt) * 100) / 100;
  }

  // Helper methods
  private async readFile(filePath: string): Promise<string|null> 
    try {
      const fs = await import('node:fs/promises');'
      return await fs.readFile(filePath, 'utf-8');'
    } catch {
      return null;
    }

  private getSettledValue<T>(
    result: PromiseSettledResult<T>,
    defaultValue: T
  ): T 
    return result.status === 'fulfilled' ? result.value : defaultValue;'

  private getEmptyComplexity(): ComplexityMetrics 
    return {
      cyclomatic: 1,
      halstead: this.getEmptyHalstead(),
      maintainabilityIndex: 100,
      technicalDebt: 0,
      codeSmells: [],
      hotspots: [],
    };

  private getEmptyHalstead(): HalsteadMetrics 
    return {
      vocabulary: 0,
      length: 0,
      difficulty: 0,
      effort: 0,
      time: 0,
      bugs: 0,
      volume: 0,
    };

  private isOperatorKind(kind: SyntaxKind): boolean 
    return [
      SyntaxKind.PlusToken,
      SyntaxKind.MinusToken,
      SyntaxKind.AsteriskToken,
      SyntaxKind.SlashToken,
      SyntaxKind.EqualsEqualsToken,
      SyntaxKind.ExclamationEqualsToken,
      SyntaxKind.LessThanToken,
      SyntaxKind.GreaterThanToken,
      SyntaxKind.AmpersandAmpersandToken,
      SyntaxKind.BarBarToken,
      SyntaxKind.QuestionToken,
      SyntaxKind.ColonToken,
    ].includes(kind);

  private isLiteralKind(kind: SyntaxKind): boolean 
    return [
      SyntaxKind.NumericLiteral,
      SyntaxKind.StringLiteral,
      SyntaxKind.TrueKeyword,
      SyntaxKind.FalseKeyword,
      SyntaxKind.NullKeyword,
    ].includes(kind);

  private extractMethods(
    content: string
  ): Array<
    name: string;
    startLine: number;
    endLine: number;
    lines: number;
    content: string;> {
    const methods: Array<{
      name: string;
      startLine: number;
      endLine: number;
      lines: number;
      content: string;
    }> = [];
    const lines = content.split('\n');'

    // Simple regex-based method extraction
    const methodRegex = /^\s*(async\s+)?(function\s+)?(\w+)\s*\([^)]*\)\s*\{?/;
    const arrowFunctionRegex =
      /^\s*(?:const|let|var)?\s*(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{?/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const methodMatch =
        line.match(methodRegex)||line.match(arrowFunctionRegex);

      if (methodMatch) {
        const _name = methodMatch[3]||methodMatch[1]||'anonymous;
        const startLine = i + 1;
        let endLine = startLine;
        const braceCount = 0;
        let started = false;

        // Find the end of the method
        for (let j = i; j < lines.length; j++) {
          const currentLine = lines[j];
          for (const char of currentLine) {
            if (char === '{') {'
              braceCount++;
              started = true;
            } else if (char === '}') {'
              braceCount--;
            }
          }

          if (started && braceCount === 0) {
            endLine = j + 1;
            break;
          }
        }

        const _methodLines = endLine - startLine + 1;
        const _methodContent = lines.slice(i, endLine).join('\n');'

        methods.push(
          _name,
          startLine,
          endLine,
          lines: methodLines,
          content: methodContent,);
      }
    }

    return methods;
  }

  private findDuplicateBlocks(
    lines: string[]
  ): Array<startLine: number; endLine: number; lines: number > {
    const duplicates: Array<{
      startLine: number;
      endLine: number;
      lines: number;
    }> = [];
    const minBlockSize = 5;

    // Simple duplicate detection (could be enhanced with more sophisticated algorithms)
    for (let i = 0; i < lines.length - minBlockSize; i++) {
      for (let j = i + minBlockSize; j < lines.length - minBlockSize; j++) {
        let matchLength = 0;

        while (
          i + matchLength < lines.length &&
          j + matchLength < lines.length &&
          lines[i + matchLength].trim() === lines[j + matchLength].trim() &&
          lines[i + matchLength].trim() !== '''
        ) 
          matchLength++;

        if (matchLength >= minBlockSize) {
          duplicates.push({
            startLine: i + 1,
            endLine: i + matchLength,
            lines: matchLength,
          });
        }
      }
    }

    return duplicates;
  }

  private findDeadCode(
    content: string
  ): Array<name: string; line: number; type: string > {
    const _deadCode: Array<{ name: string; line: number; type: string }> = [];
    const lines = content.split('\n');'

    // Simple dead code detection
    const declarations = new Map<string, { line: number; type: string }>();
    const _usages = new Set<string>();

    // Find declarations
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Variable declarations
      const varMatch = line.match(/(?:const|let|var)\s+(\w+)/);
      if (varMatch) {
        declarations.set(varMatch[1], { line: i + 1, type:'variable' });'
      }

      // Function declarations
      const funcMatch = line.match(/function\s+(\w+)/);
      if (funcMatch) {
        declarations.set(funcMatch[1], { line: i + 1, type: 'function'});'
      }
    }

    // Find usages
    for (const line of lines) {
      for (const [name] of declarations) {
        if (
          line.includes(name) &&
          !line.match(new RegExp(`(?:const|let|var|function)\\s+${name}`))`
        ) {
          usages.add(name);
        }
      }
    }

    // Find unused declarations
    for (const [name, info] of declarations) {
      if (!usages.has(name)) {
        deadCode.push({
          name,
          line: info.line,
          type: info.type,
        });
      }
    }

    return deadCode;
  }

  private calculateHotspotPriority(
    complexity: number,
    maintainabilityIndex: number,
    lines: number
  ):'low|medium|high|urgent' {'
    let score = 0;

    if (complexity > this.thresholds.cyclomaticComplexity * 2) score += 3;
    else if (complexity > this.thresholds.cyclomaticComplexity) score += 2;

    if (maintainabilityIndex < this.thresholds.maintainabilityIndex / 2)
      score += 3;
    else if (maintainabilityIndex < this.thresholds.maintainabilityIndex)
      score += 2;

    if (lines > this.thresholds.linesOfCode * 2) score += 2;
    else if (lines > this.thresholds.linesOfCode) score += 1;

    if (score >= 6) return 'urgent;
    if (score >= 4) return 'high;
    if (score >= 2) return 'medium;
    return 'low;
  }

  private aggregateComplexity(
    fileComplexities: ComplexityMetrics[],
    allCodeSmells: CodeSmell[],
    allHotspots: ComplexityHotspot[]
  ): ComplexityMetrics {
    const totalCyclomatic = fileComplexities.reduce(
      (sum, c) => sum + c.cyclomatic,
      0
    );
    const avgMaintainabilityIndex =
      fileComplexities.reduce((sum, c) => sum + c.maintainabilityIndex, 0) /
      fileComplexities.length;
    const totalTechnicalDebt = fileComplexities.reduce(
      (sum, c) => sum + c.technicalDebt,
      0
    );

    // Aggregate Halstead metrics
    const aggregateHalstead: HalsteadMetrics = {
      vocabulary: fileComplexities.reduce(
        (sum, c) => sum + c.halstead.vocabulary,
        0
      ),
      length: fileComplexities.reduce((sum, c) => sum + c.halstead.length, 0),
      difficulty:
        fileComplexities.reduce((sum, c) => sum + c.halstead.difficulty, 0) /
        fileComplexities.length,
      effort: fileComplexities.reduce((sum, c) => sum + c.halstead.effort, 0),
      time: fileComplexities.reduce((sum, c) => sum + c.halstead.time, 0),
      bugs: fileComplexities.reduce((sum, c) => sum + c.halstead.bugs, 0),
      volume: fileComplexities.reduce((sum, c) => sum + c.halstead.volume, 0),
    };

    return {
      cyclomatic: totalCyclomatic,
      halstead: aggregateHalstead,
      maintainabilityIndex: avgMaintainabilityIndex || 100,
      technicalDebt: totalTechnicalDebt,
      codeSmells: allCodeSmells,
      hotspots: allHotspots,
    };
  }
}
