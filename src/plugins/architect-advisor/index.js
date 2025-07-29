/**
 * Architect Advisor Plugin
 * Comprehensive architectural analysis, design pattern recommendations, and ADR generation
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, readdir, mkdir, stat } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class ArchitectAdvisorPlugin extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      confidence_threshold: 0.75,
      analysis_types: ['performance', 'scalability', 'security', 'architecture', 'maintainability', 'testability'],
      approval_required: true,
      adr_path: path.join(process.cwd(), '.hive-mind', 'adrs'),
      recommendations_path: path.join(process.cwd(), '.hive-mind', 'recommendations'),
      patterns_db_path: path.join(process.cwd(), '.hive-mind', 'patterns'),
      scan_directories: ['src', 'lib', 'app', 'components'],
      exclude_patterns: [
        'node_modules',
        '.git',
        'dist',
        'build',
        '*.min.js',
        '*.bundle.js'
      ],
      file_extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.go', '.rs'],
      max_file_size: 1048576, // 1MB
      enable_ai_analysis: true,
      enable_pattern_detection: true,
      enable_smell_detection: true,
      enable_metric_analysis: true,
      ...config
    };
    
    this.suggestions = new Map();
    this.analysis_history = [];
    this.pattern_library = new Map();
    this.code_smells = new Map();
    this.metrics_cache = new Map();
    this.isAnalyzing = false;
    
    // Design Patterns Database
    this.designPatterns = this.initializeDesignPatterns();
    
    // Anti-patterns and Code Smells
    this.antiPatterns = this.initializeAntiPatterns();
    
    // Architecture principles
    this.principles = this.initializePrinciples();
  }

  async initialize() {
    try {
      console.log('🏗️ Architect Advisor Plugin initializing...');
      
      // Create directories
      await mkdir(this.config.adr_path, { recursive: true });
      await mkdir(this.config.recommendations_path, { recursive: true });
      await mkdir(this.config.patterns_db_path, { recursive: true });
      
      // Load existing patterns and analysis
      await this.loadPatternLibrary();
      await this.loadAnalysisHistory();
      
      // Initialize AI provider if available
      if (this.config.enable_ai_analysis) {
        await this.initializeAIProvider();
      }
      
      console.log('✅ Architect Advisor Plugin initialized');
      this.emit('initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Architect Advisor Plugin:', error);
      throw error;
    }
  }

  async initializeAIProvider() {
    try {
      // Try to use AI Provider Plugin if available
      const aiProvider = global.hiveMind?.plugins?.get('ai-provider');
      if (aiProvider) {
        this.aiProvider = aiProvider;
        console.log('🤖 AI Provider connected for architectural analysis');
      }
    } catch (error) {
      console.warn('⚠️ AI Provider not available, using rule-based analysis only');
    }
  }

  /**
   * Comprehensive system analysis
   */
  async analyzeSystem(analysisType = 'all', options = {}) {
    if (this.isAnalyzing) {
      throw new Error('Analysis already in progress');
    }
    
    try {
      this.isAnalyzing = true;
      this.emit('analysis_start', { type: analysisType });
      
      const analysis = {
        id: crypto.randomBytes(8).toString('hex'),
        type: analysisType,
        timestamp: new Date(),
        findings: [],
        metrics: {},
        patterns: [],
        smells: [],
        recommendations: []
      };
      
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

  async scanCodebase() {
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

  async scanDirectory(dirPath) {
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
                content: content,
                modified: stats.mtime
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
    }
    
    return files;
  }

  isExcluded(name) {
    return this.config.exclude_patterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(name);
      }
      return name === pattern || name.includes(pattern);
    });
  }

  calculateCodebaseStats(codebase) {
    const stats = {
      total_files: codebase.length,
      total_lines: codebase.reduce((sum, file) => sum + file.lines, 0),
      total_size: codebase.reduce((sum, file) => sum + file.size, 0),
      languages: {},
      directories: new Set(),
      avg_file_size: 0,
      avg_lines_per_file: 0,
      largest_file: null,
      oldest_file: null,
      newest_file: null
    };
    
    // Language breakdown
    for (const file of codebase) {
      const lang = this.getLanguageFromExtension(file.extension);
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
      stats.directories.add(path.dirname(file.relativePath));
    }
    
    stats.directories = stats.directories.size;
    stats.avg_file_size = stats.total_size / stats.total_files;
    stats.avg_lines_per_file = stats.total_lines / stats.total_files;
    
    // Find extremes
    stats.largest_file = codebase.reduce((max, file) => 
      file.size > (max?.size || 0) ? file : max, null);
    
    stats.oldest_file = codebase.reduce((oldest, file) => 
      file.modified < (oldest?.modified || new Date()) ? file : oldest, null);
    
    stats.newest_file = codebase.reduce((newest, file) => 
      file.modified > (newest?.modified || new Date(0)) ? file : newest, null);
    
    return stats;
  }

  getLanguageFromExtension(ext) {
    const langMap = {
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
  async analyzeArchitecture(codebase) {
    const findings = [];
    
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

  analyzeDependencies(codebase) {
    const dependencies = new Map();
    const importRegex = /(?:import|require)\s*(?:\{[^}]*\}|\*|\w+)?\s*(?:from\s+)?['"`]([^'"`]+)['"`]/g;
    
    for (const file of codebase) {
      const fileDeps = [];
      let match;
      
      while ((match = importRegex.exec(file.content)) !== null) {
        const dep = match[1];
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          // External dependency
          fileDeps.push({ type: 'external', name: dep });
        } else {
          // Internal dependency
          fileDeps.push({ type: 'internal', name: dep, resolved: this.resolvePath(file.path, dep) });
        }
      }
      
      dependencies.set(file.relativePath, fileDeps);
    }
    
    return dependencies;
  }

  checkDependencyIssues(dependencies) {
    const findings = [];
    
    // Check for circular dependencies
    const cycles = this.detectCircularDependencies(dependencies);
    for (const cycle of cycles) {
      findings.push({
        category: 'architecture',
        type: 'circular_dependency',
        issue: `Circular dependency detected: ${cycle.join(' -> ')}`,
        severity: 'high',
        confidence: 0.95,
        impact: 'high',
        files: cycle,
        recommendation: 'Break circular dependency by introducing interfaces or reorganizing modules'
      });
    }
    
    // Check for excessive dependencies
    for (const [file, deps] of dependencies) {
      if (deps.length > 20) {
        findings.push({
          category: 'architecture',
          type: 'excessive_dependencies',
          issue: `File has too many dependencies (${deps.length})`,
          severity: 'medium',
          confidence: 0.8,
          impact: 'medium',
          files: [file],
          recommendation: 'Consider breaking this file into smaller, more focused modules'
        });
      }
    }
    
    return findings;
  }

  detectCircularDependencies(dependencies) {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (node, path) => {
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

  identifyLayers(codebase) {
    const layers = {
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

  classifyLayer(file) {
    const path = file.relativePath.toLowerCase();
    const content = file.content.toLowerCase();
    
    // Presentation layer indicators
    if (path.includes('component') || path.includes('view') || path.includes('ui') ||
        path.includes('page') || path.includes('screen') || 
        content.includes('render') || content.includes('jsx') || content.includes('template')) {
      return 'presentation';
    }
    
    // Business layer indicators
    if (path.includes('service') || path.includes('business') || path.includes('logic') ||
        path.includes('domain') || path.includes('use-case') || path.includes('usecase')) {
      return 'business';
    }
    
    // Data layer indicators
    if (path.includes('repository') || path.includes('dao') || path.includes('data') ||
        path.includes('model') || path.includes('entity') || 
        content.includes('database') || content.includes('query')) {
      return 'data';
    }
    
    // Infrastructure layer indicators
    if (path.includes('config') || path.includes('util') || path.includes('helper') ||
        path.includes('middleware') || path.includes('adapter') || path.includes('gateway')) {
      return 'infrastructure';
    }
    
    return 'unknown';
  }

  checkLayerViolations(layers) {
    const findings = [];
    
    // Check for upward dependencies (violating layered architecture)
    const layerOrder = ['infrastructure', 'data', 'business', 'presentation'];
    
    // This would require more sophisticated dependency analysis
    // For now, check for obvious violations
    
    for (const presentationFile of layers.presentation) {
      if (this.hasDirectDatabaseAccess(presentationFile)) {
        findings.push({
          category: 'architecture',
          type: 'layer_violation',
          issue: 'Presentation layer directly accessing data layer',
          severity: 'high',
          confidence: 0.9,
          impact: 'high',
          files: [presentationFile.relativePath],
          recommendation: 'Use business services to access data instead of direct database calls'
        });
      }
    }
    
    return findings;
  }

  hasDirectDatabaseAccess(file) {
    const dbPatterns = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE',
      'connection.query', 'db.query', 'execute(',
      'mongoose.', 'sequelize.', 'prisma.'
    ];
    
    return dbPatterns.some(pattern => 
      file.content.toLowerCase().includes(pattern.toLowerCase()));
  }

  analyzeCoupling(codebase) {
    const coupling = new Map();
    
    for (const file of codebase) {
      const imports = this.extractImports(file);
      const exports = this.extractExports(file);
      
      coupling.set(file.relativePath, {
        afferent: 0, // Incoming dependencies
        efferent: imports.length, // Outgoing dependencies
        instability: 0, // I = Ce / (Ca + Ce)
        abstractness: this.calculateAbstractness(file),
        imports,
        exports
      });
    }
    
    // Calculate afferent coupling
    for (const [filePath, data] of coupling) {
      data.afferent = this.countIncomingDependencies(filePath, coupling);
      data.instability = data.efferent / (data.afferent + data.efferent) || 0;
    }
    
    return coupling;
  }

  extractImports(file) {
    const imports = [];
    const importRegex = /(?:import|require)\s*(?:\{([^}]*)\}|\*\s+as\s+(\w+)|(\w+))?\s*(?:from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(file.content)) !== null) {
      imports.push({
        module: match[4],
        named: match[1] ? match[1].split(',').map(s => s.trim()) : [],
        default: match[3],
        namespace: match[2]
      });
    }
    
    return imports;
  }

  extractExports(file) {
    const exports = [];
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

  calculateAbstractness(file) {
    // Simple heuristic: ratio of abstract elements (interfaces, abstract classes) to total elements
    const abstractCount = (file.content.match(/(?:interface |abstract class |abstract )/g) || []).length;
    const totalCount = (file.content.match(/(?:class |function |interface |abstract )/g) || []).length;
    
    return totalCount > 0 ? abstractCount / totalCount : 0;
  }

  countIncomingDependencies(targetFile, coupling) {
    let count = 0;
    
    for (const [filePath, data] of coupling) {
      if (filePath !== targetFile) {
        const hasImport = data.imports.some(imp => 
          this.resolvePath(filePath, imp.module) === targetFile);
        if (hasImport) count++;
      }
    }
    
    return count;
  }

  checkCouplingIssues(coupling) {
    const findings = [];
    
    for (const [filePath, data] of coupling) {
      // High instability in stable packages
      if (data.instability > 0.8 && data.afferent > 5) {
        findings.push({
          category: 'architecture',
          type: 'unstable_dependency',
          issue: `Highly unstable module with many dependents (I=${data.instability.toFixed(2)})`,
          severity: 'medium',
          confidence: 0.8,
          impact: 'medium',
          files: [filePath],
          recommendation: 'Consider stabilizing this module or reducing its responsibilities'
        });
      }
      
      // Violation of dependency inversion principle
      const distance = Math.abs(data.abstractness + data.instability - 1);
      if (distance > 0.7) {
        findings.push({
          category: 'architecture',
          type: 'distance_from_main_sequence',
          issue: `Module deviates from ideal abstraction/stability balance (D=${distance.toFixed(2)})`,
          severity: 'low',
          confidence: 0.7,
          impact: 'medium',
          files: [filePath],
          recommendation: 'Adjust abstraction level or stability to follow dependency inversion principle'
        });
      }
    }
    
    return findings;
  }

  checkSOLIDPrinciples(codebase) {
    const findings = [];
    
    for (const file of codebase) {
      // Single Responsibility Principle
      const classCount = (file.content.match(/class\s+\w+/g) || []).length;
      const methodCount = (file.content.match(/\w+\s*\([^)]*\)\s*\{/g) || []).length;
      
      if (classCount > 0 && methodCount / classCount > 15) {
        findings.push({
          category: 'architecture',
          type: 'srp_violation',
          issue: `Class with too many methods (${methodCount / classCount} avg per class)`,
          severity: 'medium',
          confidence: 0.7,
          impact: 'medium',
          files: [file.relativePath],
          recommendation: 'Consider breaking large classes into smaller, more focused classes'
        });
      }
      
      // Open/Closed Principle violations (hardcoded conditionals)
      const switchStatements = (file.content.match(/switch\s*\(/g) || []).length;
      const longIfChains = (file.content.match(/if\s*\([^)]*\)\s*\{[^}]*\}\s*else\s*if/g) || []).length;
      
      if (switchStatements > 3 || longIfChains > 3) {
        findings.push({
          category: 'architecture',
          type: 'ocp_violation',
          issue: 'Excessive conditional logic may violate Open/Closed Principle',
          severity: 'low',
          confidence: 0.6,
          impact: 'medium',
          files: [file.relativePath],
          recommendation: 'Consider using polymorphism or strategy pattern instead of conditional logic'
        });
      }
    }
    
    return findings;
  }

  detectArchitecturalSmells(codebase) {
    const findings = [];
    
    // God Class detection
    for (const file of codebase) {
      if (file.lines > 1000) {
        findings.push({
          category: 'architecture',
          type: 'god_class',
          issue: `Extremely large file (${file.lines} lines)`,
          severity: 'high',
          confidence: 0.9,
          impact: 'high',
          files: [file.relativePath],
          recommendation: 'Break this large file into smaller, more focused modules'
        });
      }
    }
    
    // Feature Envy detection
    const dependencies = this.analyzeDependencies(codebase);
    for (const [filePath, deps] of dependencies) {
      const externalDeps = deps.filter(d => d.type === 'external').length;
      const internalDeps = deps.filter(d => d.type === 'internal').length;
      
      if (externalDeps > internalDeps * 2 && externalDeps > 10) {
        findings.push({
          category: 'architecture',
          type: 'feature_envy',
          issue: `File heavily depends on external modules (${externalDeps} external vs ${internalDeps} internal)`,
          severity: 'medium',
          confidence: 0.7,
          impact: 'medium',
          files: [filePath],
          recommendation: 'Consider moving functionality closer to the data it operates on'
        });
      }
    }
    
    return findings;
  }

  /**
   * Performance Analysis
   */
  async analyzePerformance(codebase) {
    const findings = [];
    
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
            issue: `Potentially blocking operation: ${pattern}`,
            severity: 'medium',
            confidence: 0.8,
            impact: 'medium',
            files: [file.relativePath],
            recommendation: `Consider using async alternative for ${pattern}`
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
          issue: `${nestedLoops.length} nested loop(s) detected`,
          severity: 'medium',
          confidence: 0.9,
          impact: 'high',
          files: [file.relativePath],
          recommendation: 'Consider optimizing nested loops or using more efficient algorithms'
        });
      }
      
      // Detect inefficient array operations
      const inefficientOps = ['indexOf', 'includes'].filter(op => 
        file.content.includes(`.${op}(`));
      
      if (inefficientOps.length > 5) {
        findings.push({
          category: 'performance',
          type: 'inefficient_array_ops',
          issue: `Multiple potentially inefficient array operations: ${inefficientOps.join(', ')}`,
          severity: 'low',
          confidence: 0.7,
          impact: 'medium',
          files: [file.relativePath],
          recommendation: 'Consider using Sets or Maps for better lookup performance'
        });
      }
    }
    
    return findings;
  }

  /**
   * Security Analysis
   */
  async analyzeSecurity(codebase) {
    const findings = [];
    
    for (const file of codebase) {
      // Check for hardcoded secrets
      const secretPatterns = [
        /password\s*[:=]\s*['"`][^'"`]{8,}/i,
        /api[_-]?key\s*[:=]\s*['"`][^'"`]{20,}/i,
        /secret\s*[:=]\s*['"`][^'"`]{16,}/i,
        /token\s*[:=]\s*['"`][^'"`]{32,}/i
      ];
      
      for (const pattern of secretPatterns) {
        if (pattern.test(file.content)) {
          findings.push({
            category: 'security',
            type: 'hardcoded_secret',
            issue: 'Potential hardcoded secret detected',
            severity: 'critical',
            confidence: 0.8,
            impact: 'critical',
            files: [file.relativePath],
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
            type: 'sql_injection',
            issue: 'Potential SQL injection vulnerability',
            severity: 'critical',
            confidence: 0.9,
            impact: 'critical',
            files: [file.relativePath],
            recommendation: 'Use parameterized queries or prepared statements'
          });
        }
      }
      
      // Check for XSS vulnerabilities
      if (file.content.includes('innerHTML') && file.content.includes('req.')) {
        findings.push({
          category: 'security',
          type: 'xss_vulnerability',
          issue: 'Potential XSS vulnerability with innerHTML',
          severity: 'high',
          confidence: 0.7,
          impact: 'high',
          files: [file.relativePath],
          recommendation: 'Sanitize user input before inserting into DOM'
        });
      }
    }
    
    return findings;
  }

  /**
   * Scalability Analysis
   */
  async analyzeScalability(codebase) {
    const findings = [];
    
    // Check for singleton patterns (potential bottlenecks)
    for (const file of codebase) {
      if (file.content.includes('singleton') || 
          (file.content.includes('instance') && file.content.includes('static'))) {
        findings.push({
          category: 'scalability',
          type: 'singleton_bottleneck',
          issue: 'Singleton pattern may create scalability bottleneck',
          severity: 'medium',
          confidence: 0.6,
          impact: 'high',
          files: [file.relativePath],
          recommendation: 'Consider dependency injection or other patterns for better scalability'
        });
      }
      
      // Check for global state
      const globalPatterns = ['window.', 'global.', 'process.env'];
      const globalUsage = globalPatterns.filter(pattern => 
        file.content.includes(pattern)).length;
      
      if (globalUsage > 10) {
        findings.push({
          category: 'scalability',
          type: 'excessive_global_state',
          issue: `Heavy reliance on global state (${globalUsage} references)`,
          severity: 'medium',
          confidence: 0.8,
          impact: 'high',
          files: [file.relativePath],
          recommendation: 'Reduce global state usage for better testability and scalability'
        });
      }
    }
    
    return findings;
  }

  /**
   * Maintainability Analysis
   */
  async analyzeMaintainability(codebase) {
    const findings = [];
    
    for (const file of codebase) {
      // Check comment ratio
      const totalLines = file.lines;
      const commentLines = (file.content.match(/\/\/|\/\*|\*\/|#/g) || []).length;
      const commentRatio = commentLines / totalLines;
      
      if (commentRatio < 0.1 && totalLines > 100) {
        findings.push({
          category: 'maintainability',
          type: 'insufficient_comments',
          issue: `Low comment ratio (${(commentRatio * 100).toFixed(1)}%)`,
          severity: 'low',
          confidence: 0.8,
          impact: 'medium',
          files: [file.relativePath],
          recommendation: 'Add more comments to improve code maintainability'
        });
      }
      
      // Check for magic numbers
      const magicNumbers = file.content.match(/\b(?<![\w.])\d{2,}\b(?![\w.])/g);
      if (magicNumbers && magicNumbers.length > 5) {
        findings.push({
          category: 'maintainability',
          type: 'magic_numbers',
          issue: `${magicNumbers.length} potential magic numbers found`,
          severity: 'low',
          confidence: 0.7,
          impact: 'low',
          files: [file.relativePath],
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
            issue: `Function with ${lines} lines detected`,
            severity: 'medium',
            confidence: 0.9,
            impact: 'medium',
            files: [file.relativePath],
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
  async analyzeTestability(codebase) {
    const findings = [];
    
    // Find test files
    const testFiles = codebase.filter(file => 
      file.name.includes('.test.') || 
      file.name.includes('.spec.') ||
      file.path.includes('/test/') ||
      file.path.includes('/__tests__/')
    );
    
    const sourceFiles = codebase.filter(file => !testFiles.includes(file));
    const testCoverage = testFiles.length / sourceFiles.length;
    
    if (testCoverage < 0.5) {
      findings.push({
        category: 'testability',
        type: 'low_test_coverage',
        issue: `Low test file ratio: ${testFiles.length}/${sourceFiles.length} (${(testCoverage * 100).toFixed(1)}%)`,
        severity: 'medium',
        confidence: 0.9,
        impact: 'high',
        files: [],
        recommendation: 'Increase test coverage by adding more test files'
      });
    }
    
    // Check for hard-to-test patterns
    for (const file of sourceFiles) {
      // Static method calls
      const staticCalls = (file.content.match(/\w+\.\w+\(/g) || []).length;
      if (staticCalls > 20) {
        findings.push({
          category: 'testability',
          type: 'excessive_static_calls',
          issue: `High number of static method calls (${staticCalls})`,
          severity: 'low',
          confidence: 0.7,
          impact: 'medium',
          files: [file.relativePath],
          recommendation: 'Consider dependency injection to improve testability'
        });
      }
      
      // New operator usage
      const newOperators = (file.content.match(/new\s+\w+\(/g) || []).length;
      if (newOperators > 10) {
        findings.push({
          category: 'testability',
          type: 'hard_dependencies',
          issue: `Multiple hard dependencies via 'new' operator (${newOperators})`,
          severity: 'low',
          confidence: 0.7,
          impact: 'medium',
          files: [file.relativePath],
          recommendation: 'Use dependency injection or factories for better testability'
        });
      }
    }
    
    return findings;
  }

  /**
   * Pattern Detection
   */
  async detectPatterns(codebase) {
    const patterns = [];
    
    for (const file of codebase) {
      // Detect design patterns
      patterns.push(...this.detectDesignPatterns(file));
    }
    
    return patterns;
  }

  detectDesignPatterns(file) {
    const patterns = [];
    
    // Singleton pattern
    if (file.content.includes('getInstance') && file.content.includes('private constructor')) {
      patterns.push({
        type: 'singleton',
        confidence: 0.9,
        file: file.relativePath,
        description: 'Singleton pattern implementation detected'
      });
    }
    
    // Factory pattern
    if (file.content.includes('create') && file.content.includes('switch') || 
        file.content.includes('Factory')) {
      patterns.push({
        type: 'factory',
        confidence: 0.8,
        file: file.relativePath,
        description: 'Factory pattern implementation detected'
      });
    }
    
    // Observer pattern
    if (file.content.includes('addEventListener') || 
        file.content.includes('subscribe') || 
        file.content.includes('notify')) {
      patterns.push({
        type: 'observer',
        confidence: 0.8,
        file: file.relativePath,
        description: 'Observer pattern implementation detected'
      });
    }
    
    // Strategy pattern
    if (file.content.includes('strategy') || 
        (file.content.includes('interface') && file.content.includes('algorithm'))) {
      patterns.push({
        type: 'strategy',
        confidence: 0.7,
        file: file.relativePath,
        description: 'Strategy pattern implementation detected'
      });
    }
    
    return patterns;
  }

  /**
   * Code Smell Detection
   */
  async detectCodeSmells(codebase) {
    const smells = [];
    
    for (const file of codebase) {
      // Long Parameter List
      const longParamRegex = /\w+\s*\([^)]{100,}\)/g;
      const longParams = file.content.match(longParamRegex);
      if (longParams) {
        smells.push({
          type: 'long_parameter_list',
          severity: 'medium',
          file: file.relativePath,
          count: longParams.length,
          description: 'Functions with long parameter lists detected'
        });
      }
      
      // Duplicate Code
      const lines = file.content.split('\n');
      const duplicates = this.findDuplicateLines(lines);
      if (duplicates > 10) {
        smells.push({
          type: 'duplicate_code',
          severity: 'medium',
          file: file.relativePath,
          count: duplicates,
          description: 'Duplicate code lines detected'
        });
      }
      
      // Dead Code (unused variables)
      const unusedVars = this.findUnusedVariables(file.content);
      if (unusedVars.length > 0) {
        smells.push({
          type: 'dead_code',
          severity: 'low',
          file: file.relativePath,
          items: unusedVars,
          description: 'Unused variables detected'
        });
      }
    }
    
    return smells;
  }

  findDuplicateLines(lines) {
    const lineCount = new Map();
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

  findUnusedVariables(content) {
    const varDeclarations = content.match(/(?:var|let|const)\s+(\w+)/g) || [];
    const unusedVars = [];
    
    for (const declaration of varDeclarations) {
      const varName = declaration.split(/\s+/).pop();
      const usage = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = content.match(usage) || [];
      
      // If variable is declared but only used once (in declaration)
      if (matches.length <= 1) {
        unusedVars.push(varName);
      }
    }
    
    return unusedVars;
  }

  /**
   * Metrics Calculation
   */
  async calculateMetrics(codebase, analysis) {
    const metrics = {
      complexity: this.calculateComplexity(codebase),
      maintainability: this.calculateMaintainabilityIndex(codebase),
      technical_debt: this.calculateTechnicalDebt(analysis.findings),
      quality_score: 0,
      test_coverage_estimate: this.estimateTestCoverage(codebase),
      documentation_ratio: this.calculateDocumentationRatio(codebase)
    };
    
    // Calculate overall quality score
    metrics.quality_score = this.calculateQualityScore(metrics, analysis);
    
    return metrics;
  }

  calculateComplexity(codebase) {
    let totalComplexity = 0;
    
    for (const file of codebase) {
      // Cyclomatic complexity estimation
      const conditions = (file.content.match(/if|while|for|case|catch|\?\?|\|\||&&/g) || []).length;
      const functions = (file.content.match(/function|=>/g) || []).length;
      const complexity = conditions + functions + 1;
      totalComplexity += complexity;
    }
    
    return {
      total: totalComplexity,
      average: totalComplexity / codebase.length,
      files: codebase.length
    };
  }

  calculateMaintainabilityIndex(codebase) {
    // Simplified maintainability index calculation
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
      average: totalIndex / codebase.length,
      rating: totalIndex / codebase.length > 70 ? 'good' : 
              totalIndex / codebase.length > 50 ? 'moderate' : 'poor'
    };
  }

  calculateTechnicalDebt(findings) {
    const severityWeights = {
      critical: 8,
      high: 5,
      medium: 3,
      low: 1
    };
    
    let totalDebt = 0;
    const breakdown = {};
    
    for (const finding of findings) {
      const weight = severityWeights[finding.severity] || 1;
      totalDebt += weight;
      breakdown[finding.category] = (breakdown[finding.category] || 0) + weight;
    }
    
    return {
      total: totalDebt,
      level: totalDebt > 50 ? 'high' : totalDebt > 20 ? 'medium' : 'low',
      breakdown
    };
  }

  estimateTestCoverage(codebase) {
    const testFiles = codebase.filter(file => 
      file.name.includes('.test.') || file.name.includes('.spec.')).length;
    const sourceFiles = codebase.length - testFiles;
    
    return {
      test_files: testFiles,
      source_files: sourceFiles,
      ratio: sourceFiles > 0 ? testFiles / sourceFiles : 0,
      estimated_coverage: Math.min(100, (testFiles / sourceFiles) * 60) // Rough estimate
    };
  }

  calculateDocumentationRatio(codebase) {
    let totalComments = 0;
    let totalLines = 0;
    
    for (const file of codebase) {
      const comments = (file.content.match(/\/\/|\/\*|\*\/|#/g) || []).length;
      totalComments += comments;
      totalLines += file.lines;
    }
    
    return {
      comment_ratio: totalLines > 0 ? totalComments / totalLines : 0,
      rating: totalComments / totalLines > 0.15 ? 'good' : 
              totalComments / totalLines > 0.08 ? 'moderate' : 'poor'
    };
  }

  calculateQualityScore(metrics, analysis) {
    // Weighted quality score calculation
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
  async generateRecommendations(analysis) {
    const recommendations = [];
    
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
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0) ||
             (b.confidence || 0) - (a.confidence || 0);
    });
    
    return recommendations;
  }

  groupFindingsByCategory(findings) {
    const grouped = {};
    
    for (const finding of findings) {
      if (!grouped[finding.category]) {
        grouped[finding.category] = [];
      }
      grouped[finding.category].push(finding);
    }
    
    return grouped;
  }

  async generateCategoryRecommendations(category, findings) {
    const recommendations = [];
    
    if (findings.length === 0) return recommendations;
    
    const highSeverityCount = findings.filter(f => f.severity === 'high' || f.severity === 'critical').length;
    const totalCount = findings.length;
    
    if (category === 'architecture' && highSeverityCount > 0) {
      recommendations.push({
        type: 'architectural_refactoring',
        priority: 'high',
        confidence: 0.9,
        title: 'Address Critical Architectural Issues',
        description: `${highSeverityCount} critical architectural issues detected`,
        actions: [
          'Review circular dependencies and break them',
          'Implement proper layer separation',
          'Reduce coupling between modules',
          'Apply SOLID principles consistently'
        ],
        estimated_effort: 'high',
        impact: 'high'
      });
    }
    
    if (category === 'performance' && totalCount > 5) {
      recommendations.push({
        type: 'performance_optimization',
        priority: 'medium',
        confidence: 0.8,
        title: 'Optimize Performance Critical Areas',
        description: `${totalCount} performance issues identified`,
        actions: [
          'Replace blocking operations with async alternatives',
          'Optimize nested loops and algorithms',
          'Implement caching where appropriate',
          'Use more efficient data structures'
        ],
        estimated_effort: 'medium',
        impact: 'high'
      });
    }
    
    if (category === 'security' && findings.some(f => f.severity === 'critical')) {
      recommendations.push({
        type: 'security_hardening',
        priority: 'high',
        confidence: 0.95,
        title: 'Address Critical Security Vulnerabilities',
        description: 'Critical security issues require immediate attention',
        actions: [
          'Remove hardcoded secrets and use environment variables',
          'Implement parameterized queries to prevent SQL injection',
          'Add input validation and sanitization',
          'Enable security headers and HTTPS'
        ],
        estimated_effort: 'medium',
        impact: 'critical'
      });
    }
    
    return recommendations;
  }

  async generatePatternRecommendations(patterns) {
    const recommendations = [];
    
    const patternCounts = {};
    for (const pattern of patterns) {
      patternCounts[pattern.type] = (patternCounts[pattern.type] || 0) + 1;
    }
    
    // Recommend design patterns based on current usage
    if (patternCounts.singleton > 3) {
      recommendations.push({
        type: 'pattern_recommendation',
        priority: 'medium',
        confidence: 0.7,
        title: 'Consider Dependency Injection Pattern',
        description: 'Multiple singleton patterns detected - consider DI for better testability',
        actions: [
          'Implement dependency injection container',
          'Replace singleton instances with injected dependencies',
          'Add interfaces for better abstraction'
        ],
        estimated_effort: 'high',
        impact: 'medium'
      });
    }
    
    if (!patternCounts.observer && patterns.length > 0) {
      recommendations.push({
        type: 'pattern_recommendation',
        priority: 'low',
        confidence: 0.6,
        title: 'Consider Observer Pattern for Event Handling',
        description: 'Event-driven communication could benefit from observer pattern',
        actions: [
          'Implement event emitter/listener system',
          'Decouple components using events',
          'Add event-driven architecture documentation'
        ],
        estimated_effort: 'medium',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  async generateMetricRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.quality_score < 60) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'high',
        confidence: 0.9,
        title: 'Improve Overall Code Quality',
        description: `Quality score is ${metrics.quality_score}/100 - needs improvement`,
        actions: [
          'Increase test coverage to at least 70%',
          'Add comprehensive documentation',
          'Reduce technical debt by addressing high-priority issues',
          'Implement code review process'
        ],
        estimated_effort: 'high',
        impact: 'high'
      });
    }
    
    if (metrics.test_coverage_estimate.estimated_coverage < 50) {
      recommendations.push({
        type: 'testing_improvement',
        priority: 'high',
        confidence: 0.95,
        title: 'Increase Test Coverage',
        description: `Test coverage is only ${metrics.test_coverage_estimate.estimated_coverage.toFixed(1)}%`,
        actions: [
          'Add unit tests for core business logic',
          'Implement integration tests for critical paths',
          'Set up continuous integration with coverage reporting',
          'Aim for at least 70% code coverage'
        ],
        estimated_effort: 'high',
        impact: 'high'
      });
    }
    
    if (metrics.technical_debt.level === 'high') {
      recommendations.push({
        type: 'debt_reduction',
        priority: 'medium',
        confidence: 0.8,
        title: 'Reduce Technical Debt',
        description: `High technical debt level detected (${metrics.technical_debt.total} points)`,
        actions: [
          'Prioritize fixing critical and high-severity issues',
          'Allocate 20% of development time to debt reduction',
          'Set up automated code quality checks',
          'Create debt reduction roadmap'
        ],
        estimated_effort: 'high',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * ADR Generation
   */
  async generateADRProposals(analysisType = 'all', options = {}) {
    const analysis = await this.analyzeSystem(analysisType, options);
    const proposals = await this.createADRProposals(analysis, options);
    
    return proposals.filter(p => p.confidence >= this.config.confidence_threshold);
  }

  async createADRProposals(analysis, options = {}) {
    const proposals = [];
    
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

  async generateADRFromFinding(finding, options) {
    const adrId = `adr-${Date.now()}-${finding.category}-${finding.type}`;
    
    const adr = {
      id: adrId,
      title: this.generateADRTitle(finding),
      status: 'proposed',
      context: await this.generateADRContext(finding),
      decision: await this.generateADRDecision(finding),
      consequences: await this.generateADRConsequences(finding),
      alternatives: options.includeAlternatives ? await this.generateADRAlternatives(finding) : [],
      confidence: finding.confidence,
      impact: finding.impact,
      category: finding.category,
      type: finding.type,
      created: new Date(),
      requires_approval: this.config.approval_required,
      files_affected: finding.files || [],
      estimated_effort: this.estimateEffort(finding),
      tags: this.generateADRTags(finding)
    };
    
    return adr;
  }

  async generateADRFromRecommendation(recommendation, options) {
    const adrId = `adr-${Date.now()}-rec-${recommendation.type}`;
    
    const adr = {
      id: adrId,
      title: recommendation.title,
      status: 'proposed',
      context: `Analysis recommendation: ${recommendation.description}`,
      decision: `Implement the following changes: ${recommendation.actions.join(', ')}`,
      consequences: {
        positive: ['Improved code quality', 'Better maintainability', 'Reduced technical debt'],
        negative: ['Development time investment', 'Potential short-term disruption'],
        risks: ['Implementation complexity', 'Testing requirements']
      },
      alternatives: options.includeAlternatives ? [
        'Do nothing - accept current state',
        'Partial implementation - address most critical issues only',
        'Alternative approach - different implementation strategy'
      ] : [],
      confidence: recommendation.confidence,
      impact: recommendation.impact,
      category: 'architecture',
      type: recommendation.type,
      created: new Date(),
      requires_approval: this.config.approval_required,
      estimated_effort: recommendation.estimated_effort,
      actions: recommendation.actions,
      tags: ['recommendation', recommendation.type, recommendation.priority]
    };
    
    return adr;
  }

  generateADRTitle(finding) {
    const titleTemplates = {
      circular_dependency: 'Resolve Circular Dependencies',
      god_class: 'Break Down Large Classes',
      sql_injection: 'Implement Secure Database Queries',
      hardcoded_secret: 'Externalize Configuration Secrets',
      performance_bottleneck: 'Optimize Performance Critical Paths',
      layer_violation: 'Enforce Architectural Layer Boundaries',
      srp_violation: 'Apply Single Responsibility Principle',
      ocp_violation: 'Implement Open/Closed Principle'
    };
    
    return titleTemplates[finding.type] || `Address ${finding.type.replace(/_/g, ' ')}`;
  }

  async generateADRContext(finding) {
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
          `Provide additional architectural context for this issue: ${finding.issue}. 
           Category: ${finding.category}, Type: ${finding.type}. 
           Explain why this is important and what architectural principles are at stake.`,
          { maxTokens: 200 }
        );
        context += `**Architectural Implications**:\n${aiContext.text}\n\n`;
      } catch (error) {
        // AI analysis failed, continue with basic context
      }
    }
    
    return context;
  }

  async generateADRDecision(finding) {
    let decision = `## Decision\n\n`;
    
    const decisionTemplates = {
      circular_dependency: 'We will break circular dependencies by introducing interfaces and reorganizing module structure.',
      god_class: 'We will refactor large classes into smaller, more focused classes following the Single Responsibility Principle.',
      sql_injection: 'We will implement parameterized queries and input validation to prevent SQL injection attacks.',
      hardcoded_secret: 'We will externalize all secrets to environment variables and secure configuration management.',
      performance_bottleneck: 'We will optimize identified performance bottlenecks through algorithm improvements and async operations.',
      layer_violation: 'We will enforce proper layer separation and dependency direction in the architecture.'
    };
    
    decision += decisionTemplates[finding.type] || 
               `We will address the ${finding.type.replace(/_/g, ' ')} by implementing ${finding.recommendation}`;
    
    decision += `\n\n**Rationale**: ${finding.recommendation || 'This change will improve system quality and maintainability.'}`;
    
    // Use AI provider for enhanced decision if available
    if (this.aiProvider && this.config.enable_ai_analysis) {
      try {
        const aiDecision = await this.aiProvider.generateText(
          `Provide a detailed architectural decision for addressing this issue: ${finding.issue}.
           Include specific implementation steps and architectural patterns to use.`,
          { maxTokens: 300 }
        );
        decision += `\n\n**Implementation Strategy**:\n${aiDecision.text}`;
      } catch (error) {
        // AI analysis failed, continue with basic decision
      }
    }
    
    return decision;
  }

  async generateADRConsequences(finding) {
    const consequences = {
      positive: [],
      negative: [],
      risks: []
    };
    
    // Generate consequences based on finding type
    const consequenceTemplates = {
      circular_dependency: {
        positive: ['Improved module independence', 'Better testability', 'Reduced coupling'],
        negative: ['Refactoring effort required', 'Potential interface overhead'],
        risks: ['Breaking existing functionality', 'Complex migration path']
      },
      god_class: {
        positive: ['Better code organization', 'Improved maintainability', 'Easier testing'],
        negative: ['Increased number of files', 'More complex object relationships'],
        risks: ['Incorrect responsibility distribution', 'Loss of cohesion']
      },
      sql_injection: {
        positive: ['Enhanced security', 'Regulatory compliance', 'User trust'],
        negative: ['Additional development time', 'Performance overhead'],
        risks: ['Implementation errors', 'Compatibility issues']
      },
      hardcoded_secret: {
        positive: ['Improved security posture', 'Better configuration management', 'Deployment flexibility'],
        negative: ['Additional configuration complexity', 'Environment setup overhead'],
        risks: ['Configuration errors', 'Secret exposure during migration']
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

  async generateADRAlternatives(finding) {
    const alternatives = [];
    
    // Generate alternatives based on finding type
    switch (finding.type) {
      case 'circular_dependency':
        alternatives.push(
          'Alternative 1: Use dependency injection container to manage dependencies',
          'Alternative 2: Merge related modules to eliminate circular references', 
          'Alternative 3: Introduce mediator pattern for communication'
        );
        break;
        
      case 'god_class':
        alternatives.push(
          'Alternative 1: Extract services and use composition',
          'Alternative 2: Apply facade pattern to hide complexity',
          'Alternative 3: Use inheritance hierarchy to split responsibilities'
        );
        break;
        
      case 'sql_injection':
        alternatives.push(
          'Alternative 1: Use ORM with built-in protection',
          'Alternative 2: Implement stored procedures only',
          'Alternative 3: Add database firewall and monitoring'
        );
        break;
        
      default:
        alternatives.push(
          'Alternative 1: Gradual implementation with incremental improvements',
          'Alternative 2: Complete rewrite of affected components',
          'Alternative 3: Do nothing and accept current limitations'
        );
    }
    
    return alternatives;
  }

  estimateEffort(finding) {
    const effortMap = {
      critical: 'high',
      high: 'high',
      medium: 'medium',
      low: 'low'
    };
    
    const baseEffort = effortMap[finding.severity] || 'medium';
    
    // Adjust based on number of affected files
    if (finding.files && finding.files.length > 10) {
      return 'high';
    } else if (finding.files && finding.files.length > 5) {
      return baseEffort === 'low' ? 'medium' : baseEffort;
    }
    
    return baseEffort;
  }

  generateADRTags(finding) {
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
  resolvePath(fromPath, toPath) {
    if (toPath.startsWith('.')) {
      return path.resolve(path.dirname(fromPath), toPath);
    }
    return toPath;
  }

  initializeDesignPatterns() {
    return new Map([
      ['singleton', {
        description: 'Ensures a class has only one instance',
        indicators: ['getInstance', 'private constructor', 'static instance'],
        benefits: ['Global access point', 'Controlled instantiation'],
        drawbacks: ['Global state', 'Testing difficulties']
      }],
      ['factory', {
        description: 'Creates objects without specifying exact classes',
        indicators: ['create', 'Factory', 'switch statement'],
        benefits: ['Flexible object creation', 'Loose coupling'],
        drawbacks: ['Additional complexity', 'Indirect instantiation']
      }],
      ['observer', {
        description: 'Defines subscription mechanism for notifications',
        indicators: ['subscribe', 'notify', 'addEventListener'],
        benefits: ['Loose coupling', 'Dynamic relationships'],
        drawbacks: ['Memory leaks', 'Performance overhead']
      }]
    ]);
  }

  initializeAntiPatterns() {
    return new Map([
      ['god_object', {
        description: 'Object that knows too much or does too much',
        indicators: ['excessive methods', 'large file size', 'many dependencies'],
        problems: ['Poor maintainability', 'Tight coupling', 'Testing difficulties']
      }],
      ['spaghetti_code', {
        description: 'Unstructured and difficult-to-maintain code',
        indicators: ['deep nesting', 'goto statements', 'complex control flow'],
        problems: ['Poor readability', 'Hard to debug', 'Difficult to modify']
      }]
    ]);
  }

  initializePrinciples() {
    return new Map([
      ['SOLID', {
        'S': 'Single Responsibility Principle',
        'O': 'Open/Closed Principle',
        'L': 'Liskov Substitution Principle',
        'I': 'Interface Segregation Principle',
        'D': 'Dependency Inversion Principle'
      }],
      ['DRY', 'Don\'t Repeat Yourself'],
      ['KISS', 'Keep It Simple, Stupid'],
      ['YAGNI', 'You Aren\'t Gonna Need It']
    ]);
  }

  async loadPatternLibrary() {
    try {
      const patternsPath = path.join(this.config.patterns_db_path, 'patterns.json');
      const data = await readFile(patternsPath, 'utf8');
      const patterns = JSON.parse(data);
      
      for (const [key, value] of Object.entries(patterns)) {
        this.pattern_library.set(key, value);
      }
      
      console.log(`📚 Loaded ${this.pattern_library.size} patterns from library`);
    } catch (error) {
      // No existing patterns, start fresh
    }
  }

  async loadAnalysisHistory() {
    try {
      const historyPath = path.join(this.config.recommendations_path, 'history.json');
      const data = await readFile(historyPath, 'utf8');
      this.analysis_history = JSON.parse(data);
      
      console.log(`📈 Loaded ${this.analysis_history.length} previous analyses`);
    } catch (error) {
      // No existing history, start fresh
    }
  }

  async persistAnalysis(analysis) {
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

  async getAnalysisHistory(limit = 10) {
    return this.analysis_history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async getSystemHealth() {
    const latestAnalysis = this.analysis_history[this.analysis_history.length - 1];
    
    if (!latestAnalysis) {
      return {
        status: 'unknown',
        message: 'No analysis data available',
        last_analysis: null
      };
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
      last_analysis: latestAnalysis.timestamp,
      recommendations_count: latestAnalysis.recommendations?.length || 0
    };
  }

  async cleanup() {
    try {
      // Save final state
      await this.persistAnalysis({
        id: 'final-state',
        timestamp: new Date(),
        type: 'cleanup',
        findings: [],
        recommendations: [],
        metrics: {}
      });
      
      // Clear caches
      this.suggestions.clear();
      this.pattern_library.clear();
      this.code_smells.clear();
      this.metrics_cache.clear();
      
      this.isAnalyzing = false;
      
      console.log('🏗️ Architect Advisor Plugin cleaned up');
    } catch (error) {
      console.error('Error during Architect Advisor cleanup:', error);
    }
  }
}

export default ArchitectAdvisorPlugin;