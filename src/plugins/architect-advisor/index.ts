/**
 * Architect Advisor Plugin
 * Comprehensive architectural analysis, design pattern recommendations, and ADR generation
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';
import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import { BasePlugin } from '../base-plugin';

export interface ArchitectAdvisorConfig {
  confidence_threshold: number;
  max_file_size: number;
  scan_directories: string[];
  file_extensions: string[];
  adr_path: string;
  patterns_db_path: string;
  recommendations_path: string;
  enable_ai_analysis: boolean;
  exclude_patterns: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: Date;
  type: string;
  findings: Finding[];
  patterns: Pattern[];
  smells: CodeSmell[];
  metrics: Metrics;
  recommendations: Recommendation[];
  codebase_stats: CodebaseStats;
}

export interface Finding {
  category: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue: string;
  files?: string[];
  confidence: number;
  recommendation?: string;
  line?: number;
}

export interface Pattern {
  type: string;
  confidence: number;
  files: string[];
  description: string;
}

export interface CodeSmell {
  type: string;
  file: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  line?: number;
}

export interface Metrics {
  complexity: ComplexityMetrics;
  maintainability: MaintainabilityMetrics;
  technical_debt: TechnicalDebtMetrics;
  test_coverage_estimate: TestCoverageMetrics;
  documentation_ratio: DocumentationMetrics;
  quality_score: number;
}

export interface ComplexityMetrics {
  total: number;
  average: number;
  highest: number;
}

export interface MaintainabilityMetrics {
  total: number;
  average: number;
}

export interface TechnicalDebtMetrics {
  total: number;
  breakdown: Record<string, number>;
}

export interface TestCoverageMetrics {
  test_files: number;
  source_files: number;
  estimated_coverage: number;
}

export interface DocumentationMetrics {
  total_comments: number;
  total_lines: number;
  comment_ratio: number;
}

export interface CodebaseStats {
  total_files: number;
  total_lines: number;
  total_size: number;
  languages: Record<string, number>;
  directories: number;
  avg_file_size: number;
  avg_lines_per_file: number;
  largest_file: any;
  oldest_file: any;
  newest_file: any;
}

export interface Recommendation {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  implementation_steps: string[];
  category: string;
}

export class ArchitectAdvisorPlugin extends BasePlugin {
  private config: ArchitectAdvisorConfig;
  private analysis_history: AnalysisResult[] = [];
  private pattern_library = new Map();
  private code_smells = new Map();
  private metrics_cache = new Map();
  private isAnalyzing = false;
  private designPatterns: Map<string, any>;
  private antiPatterns: Map<string, any>;
  private principles: Map<string, any>;
  private aiProvider?: any;

  constructor(config: Partial<ArchitectAdvisorConfig> = {}) {
    super('architect-advisor', '1.0.0');
    
    this.config = {
      confidence_threshold: 0.7,
      max_file_size: 1024 * 1024, // 1MB
      scan_directories: ['src', 'lib', 'app'],
      file_extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.cs', '.php', '.rb'],
      adr_path: './docs/architecture/decisions',
      patterns_db_path: './config/patterns',
      recommendations_path: './reports/architecture',
      enable_ai_analysis: true,
      exclude_patterns: ['node_modules', '.git', 'dist', 'build', '.next', '.nuxt'],
      ...config
    };

    // Design Patterns Database
    this.designPatterns = this.initializeDesignPatterns();
    
    // Anti-patterns and Code Smells
    this.antiPatterns = this.initializeAntiPatterns();
    
    // Architecture principles
    this.principles = this.initializePrinciples();
  }

  async initialize(): Promise<void> {
    try {
      console.log('🏗️ Architect Advisor Plugin initializing...');
      
      // Create directories
      await mkdir(this.config.adr_path, { recursive: true });
      await mkdir(this.config.recommendations_path, { recursive: true });
      
      // Load pattern library
      await this.loadPatternLibrary();
      
      // Load analysis history
      await this.loadAnalysisHistory();
      
      // Connect to AI provider if available
      const aiProvider = (global as any).hiveMind?.plugins?.get('ai-provider');
      if (aiProvider) {
        this.aiProvider = aiProvider;
        console.log('🤖 AI Provider connected for architectural analysis');
      }
      
      console.log('✅ Architect Advisor Plugin initialized');
    } catch (error) {
      console.warn('⚠️ AI Provider not available, using rule-based analysis only');
    }
  }

  /**
   * Comprehensive system analysis
   */
  async analyzeSystem(analysisType = 'all', options: any = {}): Promise<AnalysisResult> {
    if (this.isAnalyzing) {
      throw new Error('Analysis already in progress');
    }

    try {
      this.isAnalyzing = true;
      const analysis: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        timestamp: new Date(),
        type: analysisType,
        findings: [],
        patterns: [],
        smells: [],
        metrics: {} as Metrics,
        recommendations: [],
        codebase_stats: {} as CodebaseStats
      };

      this.emit('analysis_start', { type: analysisType, id: analysis.id });

      // Scan codebase
      const codebase = await this.scanCodebase();
      analysis.codebase_stats = this.calculateCodebaseStats(codebase);

      // Run different types of analysis
      if (analysisType === 'all' || analysisType === 'architecture') {
        analysis.findings.push(...await this.analyzeArchitecture(codebase));
        analysis.patterns.push(...await this.detectPatterns(codebase));
      }
      
      if (analysisType === 'all' || analysisType === 'performance') {
        analysis.findings.push(...await this.analyzePerformance(codebase));
      }
      
      if (analysisType === 'all' || analysisType === 'security') {
        analysis.findings.push(...await this.analyzeSecurity(codebase));
      }
      
      if (analysisType === 'all' || analysisType === 'scalability') {
        analysis.findings.push(...await this.analyzeScalability(codebase));
      }
      
      if (analysisType === 'all' || analysisType === 'maintainability') {
        analysis.findings.push(...await this.analyzeMaintainability(codebase));
        analysis.smells.push(...await this.detectCodeSmells(codebase));
      }
      
      if (analysisType === 'all' || analysisType === 'testability') {
        analysis.findings.push(...await this.analyzeTestability(codebase));
      }

      // Calculate metrics
      analysis.metrics = await this.calculateMetrics(codebase, analysis);

      // Generate recommendations
      analysis.recommendations = await this.generateRecommendations(analysis);

      // Store analysis
      this.analysis_history.push(analysis);
      await this.persistAnalysis(analysis);
      
      this.emit('analysis_complete', analysis);
      return analysis;
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async scanCodebase(): Promise<any[]> {
    const files = [];
    
    for (const dir of this.config.scan_directories) {
      try {
        const dirPath = path.join(process.cwd(), dir);
        const dirFiles = await this.scanDirectory(dirPath);
        files.push(...dirFiles);
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
    
    return files;
  }

  private async scanDirectory(dirPath: string): Promise<any[]> {
    const files = [];
    
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // Skip excluded patterns
        if (this.isExcluded(entry.name)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.config.file_extensions.includes(ext)) {
            const stats = await stat(fullPath);
            if (stats.size <= this.config.max_file_size) {
              const content = await readFile(fullPath, 'utf8');
              files.push({
                path: fullPath,
                relativePath: path.relative(process.cwd(), fullPath),
                name: entry.name,
                extension: ext,
                size: stats.size,
                lines: content.split('\n').length,
                content,
                modified: stats.mtime
              });
            }
          }
        }
      }
    } catch (error) {
      // Directory access error, skip
    }
    
    return files;
  }

  private isExcluded(name: string): boolean {
    return this.config.exclude_patterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(name);
      }
      return name === pattern || name.includes(pattern);
    });
  }

  private calculateCodebaseStats(codebase: any[]): CodebaseStats {
    const stats: CodebaseStats = {
      total_files: codebase.length,
      total_lines: codebase.reduce((sum, file) => sum + file.lines, 0),
      total_size: codebase.reduce((sum, file) => sum + file.size, 0),
      languages: {},
      directories: 0,
      avg_file_size: 0,
      avg_lines_per_file: 0,
      largest_file: null,
      oldest_file: null,
      newest_file: null
    };

    const directories = new Set<string>();
    
    for (const file of codebase) {
      const lang = this.getLanguageFromExtension(file.extension);
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
      directories.add(path.dirname(file.relativePath));
    }

    stats.directories = directories.size;
    stats.avg_file_size = stats.total_size / stats.total_files;
    stats.avg_lines_per_file = stats.total_lines / stats.total_files;

    // Find extremes
    stats.largest_file = codebase.reduce((max, file) => 
      file.size > (max?.size || 0) ? file : max, codebase[0]);
    
    stats.oldest_file = codebase.reduce((oldest, file) => 
      file.modified < (oldest?.modified || new Date()) ? file : oldest, codebase[0]);
    
    stats.newest_file = codebase.reduce((newest, file) => 
      file.modified > (newest?.modified || new Date(0)) ? file : newest, codebase[0]);

    return stats;
  }

  private getLanguageFromExtension(ext: string): string {
    const langMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React',
      '.tsx': 'React TypeScript',
      '.vue': 'Vue',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby'
    };

    return langMap[ext] || 'Unknown';
  }

  /**
   * Architecture Analysis
   */
  private async analyzeArchitecture(codebase: any[]): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Analyze module dependencies
    const dependencies = this.analyzeDependencies(codebase);
    findings.push(...this.checkDependencyIssues(dependencies));

    // Analyze layer separation
    const layers = this.identifyLayers(codebase);
    findings.push(...this.checkLayerViolations(layers));

    // Analyze coupling and cohesion
    const coupling = this.analyzeCoupling(codebase);
    findings.push(...this.checkCouplingIssues(coupling));

    // Check SOLID principles
    findings.push(...this.checkSOLIDPrinciples(codebase));

    // Check for architectural smells
    findings.push(...this.detectArchitecturalSmells(codebase));

    return findings;
  }

  private analyzeDependencies(codebase: any[]): Map<string, any[]> {
    const dependencies = new Map();
    const importRegex = /(?:import|require)\s*(?:\{([^}]*)\}|\*\s+as\s+(\w+)|(\w+))?\s*(?:from\s+)?['"`]([^'"`]+)['"`]/g;
    
    for (const file of codebase) {
      const fileDeps: any[] = [];
      let match;
      
      while ((match = importRegex.exec(file.content)) !== null) {
        const dep = match[4];
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          // External dependency
          fileDeps.push({
            type: 'external',
            module: dep,
            imported: match[1] || match[2] || match[3] || 'default'
          });
        } else {
          // Internal dependency
          fileDeps.push({
            type: 'internal',
            module: dep,
            resolved: this.resolvePath(file.path, dep),
            imported: match[1] || match[2] || match[3] || 'default'
          });
        }
      }
      
      dependencies.set(file.relativePath, fileDeps);
    }
    
    return dependencies;
  }

  private checkDependencyIssues(dependencies: Map<string, any[]>): Finding[] {
    const findings: Finding[] = [];

    // Check for circular dependencies
    const cycles = this.detectCircularDependencies(dependencies);
    for (const cycle of cycles) {
      findings.push({
        category: 'architecture',
        type: 'circular_dependency',
        severity: 'high',
        issue: `Circular dependency detected: ${cycle.join(' -> ')}`,
        files: cycle,
        confidence: 0.95
      });
    }

    return findings;
  }

  private detectCircularDependencies(dependencies: Map<string, any[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found cycle
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const deps = dependencies.get(node) || [];
      for (const dep of deps) {
        if (dep.type === 'internal' && dep.resolved) {
          dfs(dep.resolved, [...path]);
        }
      }

      recursionStack.delete(node);
    };

    for (const node of dependencies.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  private identifyLayers(codebase: any[]): Record<string, any[]> {
    const layers: Record<string, any[]> = {
      presentation: [],
      business: [],
      data: [],
      infrastructure: [],
      unknown: []
    };

    for (const file of codebase) {
      const layer = this.classifyLayer(file);
      layers[layer].push(file);
    }

    return layers;
  }

  private classifyLayer(file: any): string {
    const path = file.relativePath.toLowerCase();
    const content = file.content.toLowerCase();

    // Presentation layer indicators
    if (path.includes('component') || path.includes('view') || path.includes('ui') || 
        path.includes('page') || path.includes('screen') || content.includes('render') || 
        content.includes('jsx') || content.includes('template')) {
      return 'presentation';
    }

    // Business layer indicators
    if (path.includes('service') || path.includes('business') || path.includes('logic') || 
        path.includes('domain') || path.includes('use-case') || path.includes('usecase')) {
      return 'business';
    }

    // Data layer indicators
    if (path.includes('repository') || path.includes('dao') || path.includes('data') || 
        path.includes('model') || path.includes('entity') || content.includes('database') || 
        content.includes('query')) {
      return 'data';
    }

    // Infrastructure layer indicators
    if (path.includes('config') || path.includes('util') || path.includes('helper') || 
        path.includes('middleware') || path.includes('adapter') || path.includes('gateway')) {
      return 'infrastructure';
    }

    return 'unknown';
  }

  private checkLayerViolations(layers: Record<string, any[]>): Finding[] {
    const findings: Finding[] = [];

    // Check for upward dependencies (violating layered architecture)
    for (const presentationFile of layers.presentation) {
      if (this.hasDirectDatabaseAccess(presentationFile)) {
        findings.push({
          category: 'architecture',
          type: 'layer_violation',
          severity: 'medium',
          issue: 'Presentation layer has direct database access',
          files: [presentationFile.relativePath],
          confidence: 0.8,
          recommendation: 'Use a service layer to separate concerns'
        });
      }
    }

    return findings;
  }

  private hasDirectDatabaseAccess(file: any): boolean {
    const dbPatterns = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE',
      'connection.query', 'db.query', 'execute(',
      'mongoose.', 'sequelize.', 'prisma.'
    ];
    
    return dbPatterns.some(pattern => 
      file.content.toLowerCase().includes(pattern.toLowerCase()));
  }

  private analyzeCoupling(codebase: any[]): Map<string, any> {
    const coupling = new Map();
    
    for (const file of codebase) {
      const imports = this.extractImports(file);
      const exports = this.extractExports(file);
      
      coupling.set(file.relativePath, {
        imports,
        exports,
        afferent: 0, // Incoming dependencies
        efferent: imports.length, // Outgoing dependencies
        instability: 0,
        abstractness: this.calculateAbstractness(file)
      });
    }

    // Calculate afferent coupling and instability
    for (const [filePath, data] of coupling) {
      data.afferent = this.countIncomingDependencies(filePath, coupling);
      // I = Ce / (Ca + Ce)
      data.instability = data.efferent / (data.afferent + data.efferent) || 0;
    }

    return coupling;
  }

  private extractImports(file: any): any[] {
    const imports: any[] = [];
    const importRegex = /(?:import|require)\s*(?:\{([^}]*)\}|\*\s+as\s+(\w+)|(\w+))?\s*(?:from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(file.content)) !== null) {
      imports.push({
        module: match[4],
        named: match[1] ? match[1].split(',').map(s => s.trim()) : [],
        default: match[2] || match[3] || null
      });
    }

    return imports;
  }

  private extractExports(file: any): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|export\s*\{([^}]*)\}/g;
    let match;

    while ((match = exportRegex.exec(file.content)) !== null) {
      if (match[1]) {
        exports.push(match[1]);
      } else if (match[2]) {
        exports.push(...match[2].split(',').map(s => s.trim()));
      }
    }

    return exports;
  }

  private calculateAbstractness(file: any): number {
    // Simple heuristic: abstract classes and interfaces vs concrete classes
    const abstractCount = (file.content.match(/(?:abstract\s+class|interface\s+\w+)/g) || []).length;
    const totalCount = (file.content.match(/(?:class|interface)\s+\w+/g) || []).length;

    return totalCount > 0 ? abstractCount / totalCount : 0;
  }

  private countIncomingDependencies(targetFile: string, coupling: Map<string, any>): number {
    let count = 0;
    
    for (const [filePath, data] of coupling) {
      if (filePath !== targetFile) {
        const hasImport = data.imports.some((imp: any) =>
          this.resolvePath(filePath, imp.module) === targetFile);
        if (hasImport) count++;
      }
    }

    return count;
  }

  private checkCouplingIssues(coupling: Map<string, any>): Finding[] {
    const findings: Finding[] = [];
    
    for (const [filePath, data] of coupling) {
      // High instability in stable packages
      if (data.instability > 0.8 && data.afferent > 5) {
        findings.push({
          category: 'architecture',
          type: 'high_instability',
          severity: 'medium',
          issue: `High instability (${data.instability.toFixed(2)}) in stable component`,
          files: [filePath],
          confidence: 0.7
        });
      }

      // Distance from main sequence (D = |A + I - 1|)
      const distance = Math.abs(data.abstractness + data.instability - 1);
      if (distance > 0.7) {
        findings.push({
          category: 'architecture',
          type: 'main_sequence_violation',
          severity: 'low',
          issue: `Component is far from main sequence (distance: ${distance.toFixed(2)})`,
          files: [filePath],
          confidence: 0.6
        });
      }
    }

    return findings;
  }

  private checkSOLIDPrinciples(codebase: any[]): Finding[] {
    const findings: Finding[] = [];
    
    for (const file of codebase) {
      // Single Responsibility Principle
      const classCount = (file.content.match(/class\s+\w+/g) || []).length;
      const methodCount = (file.content.match(/\w+\s*\([^)]*\)\s*\{/g) || []).length;
      
      if (classCount > 0 && methodCount / classCount > 15) {
        findings.push({
          category: 'architecture',
          type: 'srp_violation',
          severity: 'medium',
          issue: 'Class may have too many responsibilities',
          files: [file.relativePath],
          confidence: 0.6,
          recommendation: 'Consider breaking this class into smaller, more focused classes'
        });
      }

      // Open/Closed Principle - look for many switch statements
      const switchStatements = (file.content.match(/switch\s*\(/g) || []).length;
      const longIfChains = (file.content.match(/if\s*\([^)]*\)\s*\{[^}]*\}\s*else\s*if/g) || []).length;
      
      if (switchStatements > 3 || longIfChains > 3) {
        findings.push({
          category: 'architecture',
          type: 'ocp_violation',
          severity: 'low',
          issue: 'Potential Open/Closed Principle violation',
          files: [file.relativePath],
          confidence: 0.5,
          recommendation: 'Consider using polymorphism instead of conditional logic'
        });
      }
    }

    return findings;
  }

  private detectArchitecturalSmells(codebase: any[]): Finding[] {
    const findings: Finding[] = [];

    // God Class detection
    for (const file of codebase) {
      if (file.lines > 1000) {
        findings.push({
          category: 'architecture',
          type: 'god_class',
          severity: 'high',
          issue: 'Potential God Class detected - file is too large',
          files: [file.relativePath],
          confidence: 0.8,
          recommendation: 'Break this large class into smaller, more cohesive classes'
        });
      }
    }

    // Feature Envy
    const dependencies = this.analyzeDependencies(codebase);
    for (const [filePath, deps] of dependencies) {
      const externalDeps = deps.filter((d: any) => d.type === 'external').length;
      const internalDeps = deps.filter((d: any) => d.type === 'internal').length;
      
      if (externalDeps > internalDeps * 2 && externalDeps > 10) {
        findings.push({
          category: 'architecture',
          type: 'feature_envy',
          severity: 'medium',
          issue: 'Potential feature envy - too many external dependencies',
          files: [filePath],
          confidence: 0.6,
          recommendation: 'Consider if this functionality belongs in a different module'
        });
      }
    }

    return findings;
  }

  /**
   * Performance Analysis
   */
  private async analyzePerformance(codebase: any[]): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const file of codebase) {
      // Detect synchronous operations that could block
      const syncPatterns = [
        'fs.readFileSync',
        'fs.writeFileSync',
        'JSON.parse',
        'while(true)',
        'for(;;)'
      ];
      
      for (const pattern of syncPatterns) {
        if (file.content.includes(pattern)) {
          findings.push({
            category: 'performance',
            type: 'blocking_operation',
            severity: 'medium',
            issue: `Potentially blocking operation: ${pattern}`,
            files: [file.relativePath],
            confidence: 0.7,
            recommendation: 'Consider using asynchronous alternatives'
          });
        }
      }

      // Detect nested loops
      const nestedLoopRegex = /for\s*\([^)]*\)\s*\{[^{}]*for\s*\([^)]*\)/g;
      const nestedLoops = file.content.match(nestedLoopRegex);
      
      if (nestedLoops && nestedLoops.length > 0) {
        findings.push({
          category: 'performance',
          type: 'nested_loops',
          severity: 'low',
          issue: 'Nested loops detected - potential performance impact',
          files: [file.relativePath],
          confidence: 0.6,
          recommendation: 'Consider optimizing algorithm complexity'
        });
      }

      // Detect inefficient operations
      const inefficientOps = ['indexOf', 'includes'].filter(op =>
        file.content.includes(`.${op}(`));
      
      if (inefficientOps.length > 5) {
        findings.push({
          category: 'performance',
          type: 'inefficient_search',
          severity: 'low',
          issue: 'Multiple inefficient search operations',
          files: [file.relativePath],
          confidence: 0.5,
          recommendation: 'Consider using Set or Map for better performance'
        });
      }
    }

    return findings;
  }

  /**
   * Security Analysis
   */
  private async analyzeSecurity(codebase: any[]): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const file of codebase) {
      // Check for hardcoded secrets
      const secretPatterns = [
        /password\s*[=:]\s*['"`][^'"`]{8,}/i,
        /api[_-]?key\s*[=:]\s*['"`][^'"`]{20,}/i,
        /secret\s*[=:]\s*['"`][^'"`]{16,}/i,
        /token\s*[=:]\s*['"`][^'"`]{32,}/i
      ];
      
      for (const pattern of secretPatterns) {
        if (pattern.test(file.content)) {
          findings.push({
            category: 'security',
            type: 'hardcoded_secret',
            severity: 'critical',
            issue: 'Potential hardcoded secret detected',
            files: [file.relativePath],
            confidence: 0.8,
            recommendation: 'Move secrets to environment variables or secure configuration'
          });
        }
      }

      // Check for SQL injection vulnerabilities
      const sqlInjectionPatterns = [
        /query\s*\(\s*['"`][^'"`]*\$\{/,
        /execute\s*\(\s*['"`][^'"`]*\+/,
        /sql\s*=\s*['"`][^'"`]*\+/
      ];
      
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(file.content)) {
          findings.push({
            category: 'security',
            type: 'sql_injection_risk',
            severity: 'critical',
            issue: 'Potential SQL injection vulnerability',
            files: [file.relativePath],
            confidence: 0.9,
            recommendation: 'Use parameterized queries or prepared statements'
          });
        }
      }
    }

    return findings;
  }

  /**
   * Scalability Analysis
   */
  private async analyzeScalability(codebase: any[]): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Check for singleton patterns (potential bottlenecks)
    for (const file of codebase) {
      if (file.content.includes('singleton') || 
          (file.content.includes('instance') && file.content.includes('static'))) {
        findings.push({
          category: 'scalability',
          type: 'singleton_bottleneck',
          severity: 'medium',
          issue: 'Singleton pattern may limit scalability',
          files: [file.relativePath],
          confidence: 0.6,
          recommendation: 'Consider dependency injection or stateless alternatives'
        });
      }

      // Check for global state usage
      const globalPatterns = ['window.', 'global.', 'process.env'];
      const globalUsage = globalPatterns.filter(pattern =>
        file.content.includes(pattern)).length;
      
      if (globalUsage > 10) {
        findings.push({
          category: 'scalability',
          type: 'global_state_overuse',
          severity: 'medium',
          issue: 'Heavy reliance on global state',
          files: [file.relativePath],
          confidence: 0.7,
          recommendation: 'Consider using dependency injection or state management patterns'
        });
      }
    }

    return findings;
  }

  /**
   * Maintainability Analysis
   */
  private async analyzeMaintainability(codebase: any[]): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const file of codebase) {
      // Check comment ratio
      const totalLines = file.lines;
      const commentLines = (file.content.match(/\/\/|\/\*|\*\/|#/g) || []).length;
      const commentRatio = commentLines / totalLines;
      
      if (commentRatio < 0.1 && totalLines > 100) {
        findings.push({
          category: 'maintainability',
          type: 'low_documentation',
          severity: 'low',
          issue: 'Low comment ratio - code may be hard to understand',
          files: [file.relativePath],
          confidence: 0.6,
          recommendation: 'Add more comments and documentation'
        });
      }

      // Check for magic numbers
      const magicNumbers = file.content.match(/\b(?<![\w.])\d{2,}\b(?![\w.])/g);
      if (magicNumbers && magicNumbers.length > 5) {
        findings.push({
          category: 'maintainability',
          type: 'magic_numbers',
          severity: 'low',
          issue: 'Multiple magic numbers detected',
          files: [file.relativePath],
          confidence: 0.7,
          recommendation: 'Replace magic numbers with named constants'
        });
      }

      // Check function length
      const functionRegex = /function\s+\w+\s*\([^)]*\)\s*\{([^{}]|\{[^{}]*\})*\}/g;
      const functions = file.content.match(functionRegex) || [];
      
      for (const func of functions) {
        const lines = func.split('\n').length;
        if (lines > 50) {
          findings.push({
            category: 'maintainability',
            type: 'long_function',
            severity: 'medium',
            issue: 'Function is too long',
            files: [file.relativePath],
            confidence: 0.8,
            recommendation: 'Break long functions into smaller, more focused functions'
          });
        }
      }
    }

    return findings;
  }

  /**
   * Testability Analysis
   */
  private async analyzeTestability(codebase: any[]): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Find test files
    const testFiles = codebase.filter(file =>
      file.name.includes('.test.') || file.name.includes('.spec.') ||
      file.path.includes('/test/') || file.path.includes('/__tests__/')
    );

    const sourceFiles = codebase.filter(file => !testFiles.includes(file));
    const testCoverage = testFiles.length / sourceFiles.length;
    
    if (testCoverage < 0.5) {
      findings.push({
        category: 'testability',
        type: 'low_test_coverage',
        severity: 'medium',
        issue: 'Low test coverage estimated',
        confidence: 0.7,
        recommendation: 'Add more unit and integration tests'
      });
    }

    // Check for tight coupling that makes testing difficult
    for (const file of sourceFiles) {
      const staticCalls = (file.content.match(/\w+\.\w+\(/g) || []).length;
      if (staticCalls > 20) {
        findings.push({
          category: 'testability',
          type: 'tight_coupling',
          severity: 'low',
          issue: 'High number of static calls may make testing difficult',
          files: [file.relativePath],
          confidence: 0.5,
          recommendation: 'Consider using dependency injection for better testability'
        });
      }

      // Check for direct instantiation
      const newOperators = (file.content.match(/new\s+\w+\(/g) || []).length;
      if (newOperators > 10) {
        findings.push({
          category: 'testability',
          type: 'direct_instantiation',
          severity: 'low',
          issue: 'Many direct instantiations may make testing difficult',
          files: [file.relativePath],
          confidence: 0.5,
          recommendation: 'Consider using factories or dependency injection'
        });
      }
    }

    return findings;
  }

  /**
   * Pattern Detection
   */
  private async detectPatterns(codebase: any[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    for (const file of codebase) {
      // Detect design patterns
      patterns.push(...this.detectDesignPatterns(file));
    }

    return patterns;
  }

  private detectDesignPatterns(file: any): Pattern[] {
    const patterns: Pattern[] = [];

    // Singleton pattern
    if (file.content.includes('getInstance') && file.content.includes('private constructor')) {
      patterns.push({
        type: 'singleton',
        confidence: 0.8,
        files: [file.relativePath],
        description: 'Singleton pattern detected'
      });
    }

    // Factory pattern
    if (file.content.includes('create') && file.content.includes('new ')) {
      patterns.push({
        type: 'factory',
        confidence: 0.6,
        files: [file.relativePath],
        description: 'Factory pattern detected'
      });
    }

    // Observer pattern
    if (file.content.includes('addEventListener') || file.content.includes('subscribe')) {
      patterns.push({
        type: 'observer',
        confidence: 0.7,
        files: [file.relativePath],
        description: 'Observer pattern detected'
      });
    }

    return patterns;
  }

  /**
   * Code Smell Detection
   */
  private async detectCodeSmells(codebase: any[]): Promise<CodeSmell[]> {
    const smells: CodeSmell[] = [];

    for (const file of codebase) {
      // Long Parameter List
      const longParamRegex = /\w+\s*\([^)]{100,}\)/g;
      const longParams = file.content.match(longParamRegex);
      
      if (longParams) {
        smells.push({
          type: 'long_parameter_list',
          file: file.relativePath,
          severity: 'medium',
          description: 'Function has too many parameters'
        });
      }

      // Duplicate Code
      const lines = file.content.split('\n');
      const duplicates = this.findDuplicateLines(lines);
      
      if (duplicates > 10) {
        smells.push({
          type: 'duplicate_code',
          file: file.relativePath,
          severity: 'medium',
          description: 'File contains duplicate code blocks'
        });
      }

      // Dead Code
      const unusedVars = this.findUnusedVariables(file.content);
      if (unusedVars.length > 0) {
        smells.push({
          type: 'dead_code',
          file: file.relativePath,
          severity: 'low',
          description: `Unused variables: ${unusedVars.join(', ')}`
        });
      }
    }

    return smells;
  }

  private findDuplicateLines(lines: string[]): number {
    const lineCount = new Map<string, number>();
    let duplicates = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        const count = lineCount.get(trimmed) || 0;
        lineCount.set(trimmed, count + 1);
        if (count === 1) duplicates++;
      }
    }

    return duplicates;
  }

  private findUnusedVariables(content: string): string[] {
    const varDeclarations = content.match(/(?:var|let|const)\s+(\w+)/g) || [];
    const unusedVars: string[] = [];
    
    for (const declaration of varDeclarations) {
      const varName = declaration.split(/\s+/).pop();
      if (varName) {
        const usage = new RegExp(`\\b${varName}\\b`, 'g');
        const matches = content.match(usage) || [];

        // If variable is declared but only used once (in declaration)
        if (matches.length <= 1) {
          unusedVars.push(varName);
        }
      }
    }

    return unusedVars;
  }

  /**
   * Metrics Calculation
   */
  private async calculateMetrics(codebase: any[], analysis: AnalysisResult): Promise<Metrics> {
    const metrics: Metrics = {
      complexity: this.calculateComplexity(codebase),
      maintainability: this.calculateMaintainability(codebase),
      technical_debt: this.calculateTechnicalDebt(analysis.findings),
      test_coverage_estimate: this.estimateTestCoverage(codebase),
      documentation_ratio: this.calculateDocumentationRatio(codebase),
      quality_score: 0
    };

    metrics.quality_score = this.calculateQualityScore(metrics, analysis);

    return metrics;
  }

  private calculateComplexity(codebase: any[]): ComplexityMetrics {
    let totalComplexity = 0;
    let highestComplexity = 0;
    
    for (const file of codebase) {
      // Cyclomatic complexity estimation
      const conditions = (file.content.match(/if|while|for|case|catch|\?\?|\|\||&&/g) || []).length;
      const functions = (file.content.match(/function|=>/g) || []).length;
      const complexity = conditions + functions + 1;
      
      totalComplexity += complexity;
      if (complexity > highestComplexity) {
        highestComplexity = complexity;
      }
    }

    return {
      total: totalComplexity,
      average: totalComplexity / codebase.length,
      highest: highestComplexity
    };
  }

  private calculateMaintainability(codebase: any[]): MaintainabilityMetrics {
    let totalIndex = 0;
    
    for (const file of codebase) {
      const halsteadVolume = file.content.length * Math.log2(file.content.length || 1);
      const cyclomaticComplexity = (file.content.match(/if|while|for|case/g) || []).length + 1;
      const linesOfCode = file.lines;

      // MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
      const mi = Math.max(0, 171 - 5.2 * Math.log(halsteadVolume || 1) -
                         0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode || 1));
      totalIndex += mi;
    }

    return {
      total: totalIndex,
      average: totalIndex / codebase.length
    };
  }

  private calculateTechnicalDebt(findings: Finding[]): TechnicalDebtMetrics {
    const severityWeights = { low: 1, medium: 3, high: 9, critical: 27 };
    let totalDebt = 0;
    const breakdown: Record<string, number> = {};
    
    for (const finding of findings) {
      const weight = severityWeights[finding.severity] || 1;
      totalDebt += weight;
      breakdown[finding.category] = (breakdown[finding.category] || 0) + weight;
    }

    return {
      total: totalDebt,
      breakdown
    };
  }

  private estimateTestCoverage(codebase: any[]): TestCoverageMetrics {
    const testFiles = codebase.filter(file =>
      file.name.includes('.test.') || file.name.includes('.spec.')).length;
    const sourceFiles = codebase.length - testFiles;

    return {
      test_files: testFiles,
      source_files: sourceFiles,
      estimated_coverage: sourceFiles > 0 ? (testFiles / sourceFiles) * 100 : 0
    };
  }

  private calculateDocumentationRatio(codebase: any[]): DocumentationMetrics {
    let totalComments = 0;
    let totalLines = 0;
    
    for (const file of codebase) {
      const comments = (file.content.match(/\/\/|\/\*|\*\/|#/g) || []).length;
      totalComments += comments;
      totalLines += file.lines;
    }

    return {
      total_comments: totalComments,
      total_lines: totalLines,
      comment_ratio: totalLines > 0 ? totalComments / totalLines : 0
    };
  }

  private calculateQualityScore(metrics: Metrics, analysis: AnalysisResult): number {
    const weights = {
      maintainability: 0.3,
      test_coverage: 0.25,
      technical_debt: 0.25,
      documentation: 0.2
    };

    const maintainabilityScore = Math.min(100, metrics.maintainability.average);
    const testCoverageScore = metrics.test_coverage_estimate.estimated_coverage;
    const technicalDebtScore = Math.max(0, 100 - metrics.technical_debt.total);
    const documentationScore = Math.min(100, metrics.documentation_ratio.comment_ratio * 500);

    const qualityScore =
      maintainabilityScore * weights.maintainability +
      testCoverageScore * weights.test_coverage +
      technicalDebtScore * weights.technical_debt +
      documentationScore * weights.documentation;

    return Math.round(qualityScore);
  }

  /**
   * Recommendation Generation
   */
  private async generateRecommendations(analysis: AnalysisResult): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Generate recommendations based on findings
    const findingsByCategory = this.groupFindingsByCategory(analysis.findings);

    for (const [category, findings] of Object.entries(findingsByCategory)) {
      const categoryRecommendations = await this.generateCategoryRecommendations(category, findings);
      recommendations.push(...categoryRecommendations);
    }

    // Generate pattern-based recommendations
    const patternRecommendations = await this.generatePatternRecommendations(analysis.patterns);
    recommendations.push(...patternRecommendations);

    // Generate metric-based recommendations
    const metricRecommendations = await this.generateMetricRecommendations(analysis.metrics);
    recommendations.push(...metricRecommendations);

    // Sort by priority and confidence
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] - priorityOrder[a.priority]) || (b.confidence - a.confidence);
    });

    return recommendations;
  }

  private groupFindingsByCategory(findings: Finding[]): Record<string, Finding[]> {
    const grouped: Record<string, Finding[]> = {};
    
    for (const finding of findings) {
      if (!grouped[finding.category]) {
        grouped[finding.category] = [];
      }
      grouped[finding.category].push(finding);
    }

    return grouped;
  }

  private async generateCategoryRecommendations(category: string, findings: Finding[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    if (findings.length === 0) return recommendations;

    const highSeverityCount = findings.filter(f => f.severity === 'high' || f.severity === 'critical').length;
    const totalCount = findings.length;

    if (category === 'architecture' && highSeverityCount > 0) {
      recommendations.push({
        type: 'architectural_refactoring',
        priority: 'high',
        confidence: 0.8,
        title: 'Address architectural issues',
        description: `${highSeverityCount} critical architectural issues need attention`,
        effort: 'high',
        implementation_steps: [
          'Review circular dependencies',
          'Implement proper layer separation',
          'Apply SOLID principles',
          'Refactor tightly coupled components'
        ],
        category: 'architecture'
      });
    }

    if (category === 'performance' && totalCount > 5) {
      recommendations.push({
        type: 'performance_optimization',
        priority: 'medium',
        confidence: 0.7,
        title: 'Optimize performance bottlenecks',
        description: `${totalCount} performance issues identified`,
        effort: 'medium',
        implementation_steps: [
          'Replace synchronous operations with async alternatives',
          'Optimize algorithm complexity',
          'Implement caching strategies',
          'Profile and benchmark critical paths'
        ],
        category: 'performance'
      });
    }

    if (category === 'security' && findings.some(f => f.severity === 'critical')) {
      recommendations.push({
        type: 'security_hardening',
        priority: 'critical',
        confidence: 0.9,
        title: 'Address critical security vulnerabilities',
        description: 'Critical security issues require immediate attention',
        effort: 'high',
        implementation_steps: [
          'Remove hardcoded secrets',
          'Implement parameterized queries',
          'Add input validation',
          'Conduct security audit'
        ],
        category: 'security'
      });
    }

    return recommendations;
  }

  private async generatePatternRecommendations(patterns: Pattern[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const patternCounts: Record<string, number> = {};
    for (const pattern of patterns) {
      patternCounts[pattern.type] = (patternCounts[pattern.type] || 0) + 1;
    }

    // Recommend design patterns based on current usage
    if (patternCounts.singleton > 3) {
      recommendations.push({
        type: 'pattern_recommendation',
        priority: 'medium',
        confidence: 0.6,
        title: 'Consider dependency injection',
        description: 'Multiple singletons detected - consider DI container',
        effort: 'medium',
        implementation_steps: [
          'Identify singleton dependencies',
          'Implement DI container',
          'Refactor singletons to services',
          'Update test strategies'
        ],
        category: 'architecture'
      });
    }

    return recommendations;
  }

  private async generateMetricRecommendations(metrics: Metrics): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    if (metrics.quality_score < 60) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'high',
        confidence: 0.8,
        title: 'Improve overall code quality',
        description: `Quality score is ${metrics.quality_score}/100`,
        effort: 'high',
        implementation_steps: [
          'Address technical debt',
          'Increase test coverage',
          'Improve documentation',
          'Refactor complex code'
        ],
        category: 'quality'
      });
    }

    if (metrics.technical_debt.total > 50) {
      recommendations.push({
        type: 'debt_reduction',
        priority: metrics.technical_debt.total > 100 ? 'high' : 'medium',
        confidence: 0.7,
        title: 'Reduce technical debt',
        description: `Technical debt score: ${metrics.technical_debt.total}`,
        effort: 'medium',
        implementation_steps: [
          'Prioritize debt by impact',
          'Create refactoring backlog',
          'Implement coding standards',
          'Add automated quality checks'
        ],
        category: 'maintenance'
      });
    }

    return recommendations;
  }

  /**
   * ADR Generation
   */
  async generateArchitectureDecisionRecords(analysisType = 'all', options: any = {}): Promise<any[]> {
    const analysis = await this.analyzeSystem(analysisType, options);
    const proposals = await this.createADRProposals(analysis, options);

    return proposals.filter(p => p.confidence >= this.config.confidence_threshold);
  }

  private async createADRProposals(analysis: AnalysisResult, options: any = {}): Promise<any[]> {
    const proposals: any[] = [];

    // Generate ADRs from high-priority findings
    const highPriorityFindings = analysis.findings.filter(f =>
      f.severity === 'critical' || f.severity === 'high');

    for (const finding of highPriorityFindings) {
      if (finding.confidence >= this.config.confidence_threshold) {
        const proposal = await this.generateADRFromFinding(finding, options);
        proposals.push(proposal);
      }
    }

    // Generate ADRs from recommendations
    const architecturalRecommendations = analysis.recommendations.filter(r =>
      r.type === 'architectural_refactoring' || r.type === 'pattern_recommendation');

    for (const recommendation of architecturalRecommendations) {
      const adr = await this.generateADRFromRecommendation(recommendation, options);
      proposals.push(adr);
    }

    return proposals;
  }

  private async generateADRFromFinding(finding: Finding, options: any): Promise<any> {
    const adr = {
      id: `adr-${Date.now()}-${finding.type}`,
      title: `Address ${finding.type.replace(/_/g, ' ')}`,
      status: 'proposed',
      date: new Date().toISOString().split('T')[0],
      context: await this.generateADRContext(finding),
      decision: await this.generateADRDecision(finding),
      consequences: await this.generateADRConsequences(finding),
      alternatives: await this.generateADRAlternatives(finding),
      effort: this.estimateImplementationEffort(finding),
      tags: this.generateADRTags(finding),
      confidence: finding.confidence,
      metadata: {
        category: finding.category,
        severity: finding.severity,
        files_affected: finding.files?.length || 0,
        generated_by: 'architect-advisor-plugin'
      }
    };

    return adr;
  }

  private async generateADRFromRecommendation(recommendation: Recommendation, options: any): Promise<any> {
    const adr = {
      id: `adr-${Date.now()}-rec-${recommendation.type}`,
      title: recommendation.title,
      status: 'proposed',
      date: new Date().toISOString().split('T')[0],
      context: `## Context\n\n${recommendation.description}\n\n**Priority**: ${recommendation.priority}\n**Effort**: ${recommendation.effort}`,
      decision: `## Decision\n\n${recommendation.description}\n\n**Implementation Steps**:\n${recommendation.implementation_steps.map(step => `- ${step}`).join('\n')}`,
      consequences: await this.generateADRConsequences({ type: recommendation.type } as Finding),
      alternatives: await this.generateADRAlternatives({ type: recommendation.type } as Finding),
      effort: recommendation.effort,
      tags: [recommendation.category, recommendation.type, recommendation.priority],
      confidence: recommendation.confidence,
      metadata: {
        category: recommendation.category,
        priority: recommendation.priority,
        generated_by: 'architect-advisor-plugin'
      }
    };

    return adr;
  }

  private async generateADRContext(finding: Finding): Promise<string> {
    let context = `## Context\n\n`;
    context += `System analysis identified a ${finding.severity} severity issue in the ${finding.category} domain.\n\n`;
    context += `**Issue**: ${finding.issue}\n\n`;
    context += `**Confidence**: ${(finding.confidence * 100).toFixed(1)}%\n\n`;
    
    if (finding.files && finding.files.length > 0) {
      context += `**Affected Files**:\n`;
      for (const file of finding.files.slice(0, 5)) { // Limit to 5 files
        context += `- ${file}\n`;
      }
      if (finding.files.length > 5) {
        context += `- ... and ${finding.files.length - 5} more files\n`;
      }
      context += `\n`;
    }

    // Use AI provider for enhanced context if available
    if (this.aiProvider && this.config.enable_ai_analysis) {
      try {
        const aiContext = await this.aiProvider.generateText(
          `Provide additional architectural context for this issue: ${finding.issue}`);
        context += `**Architectural Implications**:\n${aiContext.text}\n\n`;
      } catch (error) {
        // AI analysis failed, continue with basic context
      }
    }

    return context;
  }

  private async generateADRDecision(finding: Finding): Promise<string> {
    let decision = `## Decision\n\n`;

    const decisionTemplates: Record<string, string> = {
      circular_dependency: 'We will break the circular dependency by introducing abstractions and reorganizing the module structure.',
      god_class: 'We will refactor the large class into smaller, more cohesive classes following the Single Responsibility Principle.',
      tight_coupling: 'We will reduce coupling by introducing interfaces and dependency injection.',
      security_vulnerability: 'We will immediately address the security vulnerability by implementing secure coding practices.'
    };

    decision += decisionTemplates[finding.type] || 
      `We will address the ${finding.type.replace(/_/g, ' ')} by implementing ${finding.recommendation}`;

    decision += `\n\n**Rationale**: ${finding.recommendation || 'This change will improve system quality and maintainability.'}`;

    // Use AI provider for enhanced decision if available
    if (this.aiProvider && this.config.enable_ai_analysis) {
      try {
        const aiDecision = await this.aiProvider.generateText(
          `Provide a detailed architectural decision for addressing this issue: ${finding.issue}`);
        decision += `\n\n**Implementation Strategy**:\n${aiDecision.text}`;
      } catch (error) {
        // AI analysis failed, continue with basic decision
      }
    }

    return decision;
  }

  private async generateADRConsequences(finding: Finding): Promise<any> {
    const consequences = {
      positive: [] as string[],
      negative: [] as string[],
      risks: [] as string[]
    };

    const consequenceTemplates: Record<string, any> = {
      circular_dependency: {
        positive: ['Improved modularity', 'Better testability', 'Reduced complexity'],
        negative: ['Refactoring effort', 'Potential breaking changes'],
        risks: ['Incomplete dependency resolution', 'Performance impact during transition']
      },
      god_class: {
        positive: ['Better maintainability', 'Improved testability', 'Clearer responsibilities'],
        negative: ['Significant refactoring effort', 'Multiple file changes'],
        risks: ['Breaking existing functionality', 'Complex migration']
      }
    };

    const template = consequenceTemplates[finding.type];
    if (template) {
      consequences.positive = [...template.positive];
      consequences.negative = [...template.negative];
      consequences.risks = [...template.risks];
    } else {
      // Generic consequences
      consequences.positive = ['Improved code quality', 'Better maintainability'];
      consequences.negative = ['Implementation effort', 'Potential disruption'];
      consequences.risks = ['Implementation complexity', 'Testing requirements'];
    }

    return consequences;
  }

  private async generateADRAlternatives(finding: Finding): Promise<string[]> {
    const alternatives: string[] = [];

    // Generate alternatives based on finding type
    switch (finding.type) {
      case 'circular_dependency':
        alternatives.push(
          'Alternative 1: Merge the circularly dependent modules',
          'Alternative 2: Extract common functionality to a shared module',
          'Alternative 3: Use dependency inversion to break the cycle'
        );
        break;
      case 'god_class':
        alternatives.push(
          'Alternative 1: Extract method objects for complex operations',
          'Alternative 2: Use composition to delegate responsibilities',
          'Alternative 3: Apply the Facade pattern to simplify interface'
        );
        break;
      default:
        alternatives.push(
          'Alternative 1: Accept the current state and monitor',
          'Alternative 2: Gradual refactoring over multiple iterations',
          'Alternative 3: Complete rewrite of affected components'
        );
    }

    return alternatives;
  }

  private estimateImplementationEffort(finding: Finding): string {
    const effortMap: Record<string, string> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'high'
    };

    let baseEffort = effortMap[finding.severity] || 'medium';

    // Adjust based on number of affected files
    if (finding.files && finding.files.length > 10) {
      return 'high';
    } else if (finding.files && finding.files.length > 5) {
      return baseEffort === 'low' ? 'medium' : baseEffort;
    }

    return baseEffort;
  }

  private generateADRTags(finding: Finding): string[] {
    const tags = [finding.category, finding.type, finding.severity];

    // Add additional tags based on finding type
    if (finding.type.includes('security')) {
      tags.push('security', 'compliance');
    }

    if (finding.type.includes('performance')) {
      tags.push('performance', 'optimization');
    }

    if (finding.type.includes('architecture')) {
      tags.push('architecture', 'design');
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Helper methods
   */
  private resolvePath(fromPath: string, toPath: string): string {
    if (toPath.startsWith('.')) {
      return path.resolve(path.dirname(fromPath), toPath);
    }
    return toPath;
  }

  private initializeDesignPatterns(): Map<string, any> {
    return new Map([
      ['singleton', { description: 'Ensures a class has only one instance' }],
      ['factory', { description: 'Creates objects without specifying exact classes' }],
      ['observer', { description: 'Defines dependency between objects' }],
      ['strategy', { description: 'Defines family of algorithms' }],
      ['decorator', { description: 'Adds behavior to objects dynamically' }]
    ]);
  }

  private initializeAntiPatterns(): Map<string, any> {
    return new Map([
      ['god_class', { description: 'Class that does too much' }],
      ['spaghetti_code', { description: 'Code with complex control flow' }],
      ['copy_paste', { description: 'Duplicated code blocks' }]
    ]);
  }

  private initializePrinciples(): Map<string, any> {
    return new Map([
      ['solid', { description: 'Single Responsibility, Open/Closed, etc.' }],
      ['dry', { description: 'Don\'t Repeat Yourself' }],
      ['kiss', { description: 'Keep It Simple, Stupid' }],
      ['yagni', { description: 'You Aren\'t Gonna Need It' }]
    ]);
  }

  private async loadPatternLibrary(): Promise<void> {
    try {
      const patternsPath = path.join(this.config.patterns_db_path, 'patterns.json');
      const data = await readFile(patternsPath, 'utf8');
      const patterns = JSON.parse(data);

      for (const [key, value] of Object.entries(patterns)) {
        this.pattern_library.set(key, value);
      }
      
      console.log(`📚 Loaded ${this.pattern_library.size} patterns from library`);
    } catch (error) {
      console.log('📚 Using default pattern library');
    }
  }

  private async loadAnalysisHistory(): Promise<void> {
    try {
      const historyPath = path.join(this.config.recommendations_path, 'history.json');
      const data = await readFile(historyPath, 'utf8');
      this.analysis_history = JSON.parse(data);

      console.log(`📊 Loaded ${this.analysis_history.length} previous analyses`);
    } catch (error) {
      // No existing history, start fresh
    }
  }

  private async persistAnalysis(analysis: AnalysisResult): Promise<void> {
    try {
      // Save individual analysis
      const analysisPath = path.join(this.config.recommendations_path, `analysis-${analysis.id}.json`);
      await writeFile(analysisPath, JSON.stringify(analysis, null, 2));
      
      // Update history
      const historyPath = path.join(this.config.recommendations_path, 'history.json');
      await writeFile(historyPath, JSON.stringify(this.analysis_history, null, 2));
      
      console.log(`💾 Analysis ${analysis.id} persisted`);
    } catch (error) {
      console.error('Failed to persist analysis:', error);
    }
  }

  async getAnalysisHistory(limit = 10): Promise<AnalysisResult[]> {
    return this.analysis_history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getSystemHealth(): Promise<any> {
    const latestAnalysis = this.analysis_history[this.analysis_history.length - 1];

    if (!latestAnalysis) {
      return { status: 'unknown', message: 'No analysis data available' };
    }

    const qualityScore = latestAnalysis.metrics?.quality_score || 0;
    const criticalIssues = latestAnalysis.findings?.filter(f => f.severity === 'critical').length || 0;

    let status = 'healthy';
    let message = 'System is in good health';
    
    if (criticalIssues > 0) {
      status = 'critical';
      message = `${criticalIssues} critical issues require immediate attention`;
    } else if (qualityScore < 60) {
      status = 'warning';
      message = `Quality score is ${qualityScore}/100 - improvement needed`;
    } else if (qualityScore < 80) {
      status = 'moderate';
      message = `Quality score is ${qualityScore}/100 - consider improvements`;
    }

    return {
      status,
      message,
      quality_score: qualityScore,
      critical_issues: criticalIssues,
      last_analysis: latestAnalysis.timestamp
    };
  }

  async cleanup(): Promise<void> {
    try {
      this.isAnalyzing = false;
      console.log('🧹 Architect Advisor Plugin cleaned up');
    } catch (error) {
      console.error('Error during Architect Advisor cleanup:', error);
    }
  }
}

export default ArchitectAdvisorPlugin;