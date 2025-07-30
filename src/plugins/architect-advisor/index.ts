/**
 * Architect Advisor Plugin
 * Comprehensive architectural analysis, design pattern recommendations, and ADR generation
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';
import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';

export class ArchitectAdvisorPlugin extends EventEmitter {
  constructor(config = {}): any {
    super();
    this.config = {confidence_threshold = new Map();
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
      console.warn('🏗️ Architect Advisor Plugin initializing...');
      
      // Create directories
      await mkdir(this.config.adr_path, {recursive = global.hiveMind?.plugins?.get('ai-provider');
      if(aiProvider) {
        this.aiProvider = aiProvider;
        console.warn('🤖 AI Provider connected for architectural analysis');
      }
    } catch(error) {
      console.warn('⚠️ AI Provider not available, using rule-based analysis only');
    }
  }

  /**
   * Comprehensive system analysis
   */
  async analyzeSystem(analysisType = 'all', options = {}): any {
    if(this.isAnalyzing) {
      throw new Error('Analysis already in progress');
    }
    
    try {
      this.isAnalyzing = true;
      this.emit('analysis_start', { type = {id = await this.scanCodebase();
      analysis.codebase_stats = this.calculateCodebaseStats(codebase);
      
      // Run different types of analysis
      if(analysisType === 'all' || analysisType === 'architecture') {
        analysis.findings.push(...await this.analyzeArchitecture(codebase));
        analysis.patterns.push(...await this.detectPatterns(codebase));
      }
      
      if(analysisType === 'all' || analysisType === 'performance') {
        analysis.findings.push(...await this.analyzePerformance(codebase));
      }
      
      if(analysisType === 'all' || analysisType === 'security') {
        analysis.findings.push(...await this.analyzeSecurity(codebase));
      }
      
      if(analysisType === 'all' || analysisType === 'scalability') {
        analysis.findings.push(...await this.analyzeScalability(codebase));
      }
      
      if(analysisType === 'all' || analysisType === 'maintainability') {
        analysis.findings.push(...await this.analyzeMaintainability(codebase));
        analysis.smells.push(...await this.detectCodeSmells(codebase));
      }
      
      if(analysisType === 'all' || analysisType === 'testability') {
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
    
    for(const dir of this.config.scan_directories) {
      try {
        const dirPath = path.join(process.cwd(), dir);
        const dirFiles = await this.scanDirectory(dirPath);
        files.push(...dirFiles);
      } catch(error) {
        // Directory doesn't exist, skip
      }
    }
    
    return files;
  }

  async scanDirectory(dirPath): any {
    const files = [];
    
    try {
      const entries = await readdir(dirPath, {withFileTypes = path.join(dirPath, entry.name);
        
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
            if(stats.size <= this.config.max_file_size) {
              const content = await readFile(fullPath, 'utf8');
              files.push({
                path => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(name);
      }
      return name === pattern || name.includes(pattern);
    });
  }

  calculateCodebaseStats(codebase): any {
    const stats = {total_files = > sum + file.lines, 0),total_size = > sum + file.size, 0),languages = this.getLanguageFromExtension(file.extension);
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
      stats.directories.add(path.dirname(file.relativePath));
    }
    
    stats.directories = stats.directories.size;
    stats.avg_file_size = stats.total_size / stats.total_files;
    stats.avg_lines_per_file = stats.total_lines / stats.total_files;
    
    // Find extremes
    stats.largest_file = codebase.reduce((max, file) => 
      file.size > (max?.size || 0) ?file = codebase.reduce((oldest, file) => 
      file.modified < (oldest?.modified || new Date()) ?file = codebase.reduce((newest, file) => 
      file.modified > (newest?.modified || new Date(0)) ? file = {
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
  async analyzeArchitecture(codebase): any {
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

  analyzeDependencies(codebase): any {
    const dependencies = new Map();
    const importRegex = /(?:import|require)\s*(?:\{[^}]*\}|\*|\w+)?\s*(?:from\s+)?['"`]([^'"`]+)['"`]/g;
    
    for(const file of codebase) {
      const fileDeps = [];
      let match;
      
      while ((match = importRegex.exec(file.content)) !== null) {
        const dep = match[1];
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          // External dependency
          fileDeps.push({type = [];
    
    // Check for circular dependencies
    const cycles = this.detectCircularDependencies(dependencies);
    for(const cycle of cycles) {
      findings.push({category = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (node, path) => {
      if (recursionStack.has(node)) {
        // Found cycle
        const cycleStart = path.indexOf(node);
        if(cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return;
      }
      
      if (visited.has(node)) return;
      
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const deps = dependencies.get(node) || [];
      for(const dep of deps) {
        if(dep.type === 'internal' && dep.resolved) {
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

  identifyLayers(codebase): any {
    const layers = {presentation = this.classifyLayer(file);
      layers[layer].push(file);
    }
    
    return layers;
  }

  classifyLayer(file): any {
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

  checkLayerViolations(layers): any {
    const findings = [];
    
    // Check for upward dependencies (violating layered architecture)

    // This would require more sophisticated dependency analysis
    // For now, check for obvious violations
    
    for(const presentationFile of layers.presentation) {
      if (this.hasDirectDatabaseAccess(presentationFile)) {
        findings.push({category = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE',
      'connection.query', 'db.query', 'execute(',
      'mongoose.', 'sequelize.', 'prisma.'
    ];
    
    return dbPatterns.some(pattern => 
      file.content.toLowerCase().includes(pattern.toLowerCase()));
  }

  analyzeCoupling(codebase): any {
    const coupling = new Map();
    
    for(const file of codebase) {
      const imports = this.extractImports(file);
      const exports = this.extractExports(file);
      
      coupling.set(file.relativePath, {afferent = Ce / (Ca + Ce)abstractness = this.countIncomingDependencies(filePath, coupling);
      data.instability = data.efferent / (data.afferent + data.efferent) || 0;
    }
    
    return coupling;
  }

  extractImports(file): any {
    const imports = [];
    const importRegex = /(?:import|require)\s*(?:\{([^}]*)\}|\*\s+as\s+(\w+)|(\w+))?\s*(?:from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(file.content)) !== null) {
      imports.push({module = > s.trim()) : [],default = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|export\s*\{([^}]*)\}/g;
    let match;
    
    while ((match = exportRegex.exec(file.content)) !== null) {
      if(match[1]) {
        exports.push(match[1]);
      } else if(match[2]) {
        exports.push(...match[2].split(',').map(s => s.trim()));
      }
    }
    
    return exports;
  }

  calculateAbstractness(file): any {
    // Simpleheuristic = (file.content.match(/(?:interface |abstract class |abstract )/g) || []).length;
    const totalCount = (file.content.match(/(?:class |function |interface |abstract )/g) || []).length;
    
    return totalCount > 0 ? abstractCount /totalCount = 0;
    
    for(const [filePath, data] of coupling) {
      if(filePath !== targetFile) {
        const hasImport = data.imports.some(imp => 
          this.resolvePath(filePath, imp.module) === targetFile);
        if (hasImport) count++;
      }
    }
    
    return count;
  }

  checkCouplingIssues(coupling): any {
    const findings = [];
    
    for(const [filePath, data] of coupling) {
      // High instability in stable packages
      if(data.instability > 0.8 && data.afferent > 5) {
        findings.push({category = ${data.instability.toFixed(2)})`,severity = Math.abs(data.abstractness + data.instability - 1);
      if(distance > 0.7) {
        findings.push({category = ${distance.toFixed(2)})`,severity = [];
    
    for(const file of codebase) {
      // Single Responsibility Principle
      const classCount = (file.content.match(/class\s+\w+/g) || []).length;
      const methodCount = (file.content.match(/\w+\s*\([^)]*\)\s*\{/g) || []).length;
      
      if(classCount > 0 && methodCount / classCount > 15) {
        findings.push({category = (file.content.match(/switch\s*\(/g) || []).length;
      const longIfChains = (file.content.match(/if\s*\([^)]*\)\s*\{[^}]*\}\s*else\s*if/g) || []).length;
      
      if(switchStatements > 3 || longIfChains > 3) {
        findings.push({category = [];
    
    // God Class detection
    for(const file of codebase) {
      if(file.lines > 1000) {
        findings.push({category = this.analyzeDependencies(codebase);
    for(const [filePath, deps] of dependencies) {
      const externalDeps = deps.filter(d => d.type === 'external').length;
      const internalDeps = deps.filter(d => d.type === 'internal').length;
      
      if(externalDeps > internalDeps * 2 && externalDeps > 10) {
        findings.push({category = [];
    
    for(const file of codebase) {
      // Detect synchronous operations that could block
      const syncPatterns = [
        'fs.readFileSync',
        'fs.writeFileSync',
        'JSON.parse',
        'while(true)',
        'for(;;)'
      ];
      
      for(const pattern of syncPatterns) {
        if (file.content.includes(pattern)) {
          findings.push({category = /for\s*\([^)]*\)\s*\{[^{}]*for\s*\([^)]*\)/g;
      const nestedLoops = file.content.match(nestedLoopRegex);
      if(nestedLoops && nestedLoops.length > 0) {
        findings.push({category = ['indexOf', 'includes'].filter(op => 
        file.content.includes(`.${op}(`));
      
      if(inefficientOps.length > 5) {
        findings.push({category = [];
    
    for(const file of codebase) {
      // Check for hardcoded secrets
      const secretPatterns = [
        /password\s*[:=]\s*['"`][^'"`]{8,}/i,
        /api[_-]?key\s*[:=]\s*['"`][^'"`]{20,}/i,
        /secret\s*[:=]\s*['"`][^'"`]{16,}/i,
        /token\s*[:=]\s*['"`][^'"`]{32,}/i
      ];
      
      for(const pattern of secretPatterns) {
        if (pattern.test(file.content)) {
          findings.push({category = [
        /query\s*\(\s*['"`][^'"`]*\$\{/,
        /execute\s*\(\s*['"`][^'"`]*\+/,
        /sql\s*=\s*['"`][^'"`]*\+/
      ];
      
      for(const pattern of sqlInjectionPatterns) {
        if (pattern.test(file.content)) {
          findings.push({category = [];
    
    // Check for singleton patterns (potential bottlenecks)
    for(const file of codebase) {
      if (file.content.includes('singleton') || 
          (file.content.includes('instance') && file.content.includes('static'))) {
        findings.push({category = ['window.', 'global.', 'process.env'];
      const globalUsage = globalPatterns.filter(pattern => 
        file.content.includes(pattern)).length;
      
      if(globalUsage > 10) {
        findings.push({category = [];
    
    for(const file of codebase) {
      // Check comment ratio
      const totalLines = file.lines;
      const commentLines = (file.content.match(/\/\/|\/\*|\*\/|#/g) || []).length;
      const commentRatio = commentLines / totalLines;
      
      if(commentRatio < 0.1 && totalLines > 100) {
        findings.push({category = file.content.match(/\b(?<![\w.])\d{2,}\b(?![\w.])/g);
      if(magicNumbers && magicNumbers.length > 5) {
        findings.push({category = /function\s+\w+\s*\([^)]*\)\s*\{([^{}]|\{[^{}]*\})*\}/g;
      const functions = file.content.match(functionRegex) || [];
      
      for(const func of functions) {
        const lines = func.split('\n').length;
        if(lines > 50) {
          findings.push({category = [];
    
    // Find test files
    const testFiles = codebase.filter(file => 
      file.name.includes('.test.') || 
      file.name.includes('.spec.') ||
      file.path.includes('/test/') ||
      file.path.includes('/__tests__/')
    );
    
    const sourceFiles = codebase.filter(file => !testFiles.includes(file));
    const testCoverage = testFiles.length / sourceFiles.length;
    
    if(testCoverage < 0.5) {
      findings.push({category = (file.content.match(/\w+\.\w+\(/g) || []).length;
      if(staticCalls > 20) {
        findings.push({category = (file.content.match(/new\s+\w+\(/g) || []).length;
      if(newOperators > 10) {
        findings.push({category = [];
    
    for(const file of codebase) {
      // Detect design patterns
      patterns.push(...this.detectDesignPatterns(file));
    }
    
    return patterns;
  }

  detectDesignPatterns(file): any {
    const patterns = [];
    
    // Singleton pattern
    if (file.content.includes('getInstance') && file.content.includes('private constructor')) {
      patterns.push({type = [];
    
    for(const file of codebase) {
      // Long Parameter List
      const longParamRegex = /\w+\s*\([^)]{100,}\)/g;
      const longParams = file.content.match(longParamRegex);
      if(longParams) {
        smells.push({type = file.content.split('\n');
      const duplicates = this.findDuplicateLines(lines);
      if(duplicates > 10) {
        smells.push({type = this.findUnusedVariables(file.content);
      if(unusedVars.length > 0) {
        smells.push({type = new Map();
    let duplicates = 0;
    
    for(const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        const count = lineCount.get(trimmed) || 0;
        lineCount.set(trimmed, count + 1);
        if (count === 1) duplicates++;
      }
    }
    
    return duplicates;
  }

  findUnusedVariables(content): any {
    const varDeclarations = content.match(/(?:var|let|const)\s+(\w+)/g) || [];
    const unusedVars = [];
    
    for(const declaration of varDeclarations) {
      const varName = declaration.split(/\s+/).pop();
      const usage = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = content.match(usage) || [];
      
      // If variable is declared but only used once (in declaration)
      if(matches.length <= 1) {
        unusedVars.push(varName);
      }
    }
    
    return unusedVars;
  }

  /**
   * Metrics Calculation
   */
  async calculateMetrics(codebase, analysis): any {
    const metrics = {complexity = this.calculateQualityScore(metrics, analysis);
    
    return metrics;
  }

  calculateComplexity(codebase): any {
    const totalComplexity = 0;
    
    for(const file of codebase) {
      // Cyclomatic complexity estimation
      const conditions = (file.content.match(/if|while|for|case|catch|\?\?|\|\||&&/g) || []).length;
      const functions = (file.content.match(/function|=>/g) || []).length;
      const complexity = conditions + functions + 1;
      totalComplexity += complexity;
    }
    
    return {
      total,average = 0;
    
    for(const file of codebase) {
      const halsteadVolume = file.content.length * Math.log2(file.content.length || 1);
      const cyclomaticComplexity = (file.content.match(/if|while|for|case/g) || []).length + 1;
      const linesOfCode = file.lines;
      
      // MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
      const mi = Math.max(0, 171 - 5.2 * Math.log(halsteadVolume || 1) - 
                         0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode || 1));
      totalIndex += mi;
    }
    
    return {
      average = {critical = 0;
    const breakdown = {};
    
    for(const finding of findings) {
      const weight = severityWeights[finding.severity] || 1;
      totalDebt += weight;
      breakdown[finding.category] = (breakdown[finding.category] || 0) + weight;
    }
    
    return {total = codebase.filter(file => 
      file.name.includes('.test.') || file.name.includes('.spec.')).length;
    const sourceFiles = codebase.length - testFiles;
    
    return {
      test_files,source_files = 0;
    let totalLines = 0;
    
    for(const file of codebase) {
      const comments = (file.content.match(/\/\/|\/\*|\*\/|#/g) || []).length;
      totalComments += comments;
      totalLines += file.lines;
    }
    
    return {
      comment_ratio = {maintainability = Math.min(100, metrics.maintainability.average);
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
  async generateRecommendations(analysis): any {
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

    for(const finding of findings) {
      if(!grouped[finding.category]) {
        grouped[finding.category] = [];
      }
      grouped[finding.category].push(finding);
    }
    
    return grouped;
  }

  async generateCategoryRecommendations(category, findings): any {
    const recommendations = [];
    
    if (findings.length === 0) return recommendations;
    
    const highSeverityCount = findings.filter(f => f.severity === 'high' || f.severity === 'critical').length;
    const totalCount = findings.length;
    
    if(category === 'architecture' && highSeverityCount > 0) {
      recommendations.push({type = == 'performance' && totalCount > 5) {
      recommendations.push({type = == 'security' && findings.some(f => f.severity === 'critical')) {
      recommendations.push({type = [];
    
    const patternCounts = {};
    for(const pattern of patterns) {
      patternCounts[pattern.type] = (patternCounts[pattern.type] || 0) + 1;
    }
    
    // Recommend design patterns based on current usage
    if(patternCounts.singleton > 3) {
      recommendations.push({type = [];
    
    if(metrics.quality_score < 60) {
      recommendations.push({type = == 'high') {
      recommendations.push({type = 'all', options = {}): any {
    const analysis = await this.analyzeSystem(analysisType, options);
    const proposals = await this.createADRProposals(analysis, options);
    
    return proposals.filter(p => p.confidence >= this.config.confidence_threshold);
  }

  async createADRProposals(analysis, options = {}): any {
    const proposals = [];
    
    // Generate ADRs from high-priority findings
    const highPriorityFindings = analysis.findings.filter(f => 
      f.severity === 'critical' || f.severity === 'high');
    
    for(const finding of highPriorityFindings) {
      if(finding.confidence >= this.config.confidence_threshold) {
        const proposal = await this.generateADRFromFinding(finding, options);
        proposals.push(proposal);
      }
    }
    
    // Generate ADRs from recommendations
    const architecturalRecommendations = analysis.recommendations.filter(r => 
      r.type === 'architectural_refactoring' || r.type === 'pattern_recommendation');
    
    for(const recommendation of architecturalRecommendations) {
      const adr = await this.generateADRFromRecommendation(recommendation, options);
      proposals.push(adr);
    }
    
    return proposals;
  }

  async generateADRFromFinding(finding, options): any {

    const adr = {id = `adr-${Date.now()}-rec-${recommendation.type}`;
    
    const adr = {id = {circular_dependency = `## Context\n\n`;
    context += `System analysis identified a ${finding.severity} severity issue in the ${finding.category} domain.\n\n`;
    context += `**Issue**: ${finding.issue}\n\n`;
    context += `**Confidence**: ${(finding.confidence * 100).toFixed(1)}%\n\n`;
    
    if(finding.files && finding.files.length > 0) {
      context += `**Affected Files**:\n`;
      for (const file of finding.files.slice(0, 5)) { // Limit to 5 files
        context += `- ${file}\n`;
      }
      if(finding.files.length > 5) {
        context += `- ... and ${finding.files.length - 5} more files\n`;
      }
      context += `\n`;
    }
    
    // Use AI provider for enhanced context if available
    if(this.aiProvider && this.config.enable_ai_analysis) {
      try {
        const aiContext = await this.aiProvider.generateText(
          `Provide additional architectural context for thisissue = `**Architectural Implications**:\n${aiContext.text}\n\n`;
      } catch(error) {
        // AI analysis failed, continue with basic context
      }
    }
    
    return context;
  }

  async generateADRDecision(finding): any {
    const decision = `## Decision\n\n`;
    
    const decisionTemplates = {circular_dependency = decisionTemplates[finding.type] || 
               `We will address the ${finding.type.replace(/_/g, ' ')} by implementing ${finding.recommendation}`;
    
    decision += `\n\n**Rationale**: ${finding.recommendation || 'This change will improve system quality and maintainability.'}`;
    
    // Use AI provider for enhanced decision if available
    if(this.aiProvider && this.config.enable_ai_analysis) {
      try {
        const aiDecision = await this.aiProvider.generateText(
          `Provide a detailed architectural decision for addressing thisissue = `\n\n**Implementation Strategy**:\n${aiDecision.text}`;
      } catch(error) {
        // AI analysis failed, continue with basic decision
      }
    }
    
    return decision;
  }

  async generateADRConsequences(finding): any {
    const consequences = {
      positive = {circular_dependency = consequenceTemplates[finding.type];
    if(template) {
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

  async generateADRAlternatives(finding): any {
    const alternatives = [];
    
    // Generate alternatives based on finding type
    switch(finding.type) {
      case 'circular_dependency':
        alternatives.push(
          'Alternative 1 = {critical = effortMap[finding.severity] || 'medium';
    
    // Adjust based on number of affected files
    if(finding.files && finding.files.length > 10) {
      return 'high';
    } else if(finding.files && finding.files.length > 5) {
      return baseEffort === 'low' ? 'medium' : baseEffort;
    }
    
    return baseEffort;
  }

  generateADRTags(finding): any {
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
  resolvePath(fromPath, toPath): any 
    if (toPath.startsWith('.')) {
      return path.resolve(path.dirname(fromPath), toPath);
    }
    return toPath;

  initializeDesignPatterns() 
    return new Map([
      ['singleton', {description = path.join(this.config.patterns_db_path, 'patterns.json');
      const data = await readFile(patternsPath, 'utf8');
      const patterns = JSON.parse(data);
      
      for (const [key, value] of Object.entries(patterns)) 
        this.pattern_library.set(key, value);
      
      console.warn(`📚 Loaded ${this.pattern_library.size} patterns from library`);catch(error) 
  }

  async loadAnalysisHistory() 
    try {
      const historyPath = path.join(this.config.recommendations_path, 'history.json');
      const data = await readFile(historyPath, 'utf8');
      this.analysis_history = JSON.parse(data);
      
      console.warn(`📈 Loaded ${this.analysis_history.length} previous analyses`);
    } catch(error) {
      // No existing history, start fresh
    }

  async persistAnalysis(analysis): any 
    try {
      // Save individual analysis
      const analysisPath = path.join(this.config.recommendations_path, `analysis-${analysis.id}.json`);
      await writeFile(analysisPath, JSON.stringify(analysis, null, 2));
      
      // Update history
      const historyPath = path.join(this.config.recommendations_path, 'history.json');
      await writeFile(historyPath, JSON.stringify(this.analysis_history, null, 2));
      
      console.warn(`💾 Analysis ${analysis.id} persisted`);
    } catch(error) {
      console.error('Failed to persistanalysis = 10): any {
    return this.analysis_history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async getSystemHealth() {
    const latestAnalysis = this.analysis_history[this.analysis_history.length - 1];
    
    if(!latestAnalysis) {
      return {status = latestAnalysis.metrics?.quality_score || 0;
    const criticalIssues = latestAnalysis.findings?.filter(f => f.severity === 'critical').length || 0;
    
    let status = 'healthy';
    let message = 'System is in good health';
    
    if(criticalIssues > 0) {
      status = 'critical';
      message = `${criticalIssues} critical issues require immediate attention`;
    } else if(qualityScore < 60) {
      status = 'warning';
      message = `Quality score is ${qualityScore}/100 - improvement needed`;
    } else if(qualityScore < 80) {
      status = 'moderate';
      message = `Quality score is ${qualityScore}/100 - consider improvements`;
    }
    
    return {
      status,
      message,quality_score = false;
      
      console.warn('🏗️ Architect Advisor Plugin cleaned up');
    } catch(error) 
      console.error('Error during Architect Advisor cleanup:', error);
  }

export default ArchitectAdvisorPlugin;
