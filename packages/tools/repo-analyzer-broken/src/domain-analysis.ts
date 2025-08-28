/**
 * Domain Analyzer - Analyzes code domains and architectural boundaries
 * Moved from main app to repo-analyzer package for better organization
 *
 * This module provides sophisticated domain analysis capabilities for identifying
 * architectural boundaries, domain relationships, and code organization patterns.
 * 
 * Enhanced with DeepCode patterns for better repository intelligence.
 */

import { existsSync, readdirSync, statSync} from 'node:fs';
import { basename, dirname, join} from 'node:path';

import { getLogger, TypedEventBase} from '@claude-zen/foundation';

const logger = getLogger('DomainAnalyzer');')
export interface DomainBoundary {
  /** Unique identifier for the domain boundary */
  id:string;
  /** Domain name */
  name:string;
  /** Domain description */
  description:string;
  /** Root path of the domain */
  rootPath:string;
  /** Files belonging to this domain */
  files:string[];
  /** Subdirectories within the domain */
  subdirectories:string[];
  /** Domain type classification */
  type: 'core | support | infrastructure | application | presentation;
'  /** Confidence score for domain identification (0-1) */
  confidence:number;
}

export interface DomainRelationship {
  /** Source domain ID */
  sourceId:string;
  /** Target domain ID */
  targetId:string;
  /** Relationship type */
  type: 'depends-on | uses | extends | implements | aggregates | composes;
'  /** Relationship strength (0-1) */
  strength:number;
  /** Evidence for the relationship */
  evidence:string[];
  /** Number of connections */
  connectionCount:number;
}

export interface DomainMetrics {
  /** Cyclomatic complexity */
  cyclomaticComplexity:number;
  /** Lines of code */
  linesOfCode:number;
  /** Number of files */
  fileCount:number;
  /** Number of dependencies */
  dependencyCount:number;
  /** Cohesion score (0-1) */
  cohesion:number;
  /** Coupling score (0-1, lower is better) */
  coupling:number;
  /** Maintainability index */
  maintainabilityIndex:number;
}

export interface DomainAnalysis {
  /** Identified domain boundaries */
  domains:DomainBoundary[];
  /** Relationships between domains */
  relationships:DomainRelationship[];
  /** Domain categories for classification */
  categories:string[];
  /** Domain complexity metrics */
  complexity:number;
  /** Domain coupling metrics */
  coupling:number;
  /** Tightly coupled groups of domains */
  tightlyCoupledGroups:DomainBoundary[][];
  /** Overall analysis metrics */
  metrics:{
    totalDomains:number;
    averageCohesion:number;
    averageCoupling:number;
    architecturalQuality:number;
};
  /** Analysis timestamp */
  timestamp:Date;
  /** Analysis configuration used */
  config:DomainAnalysisConfig;
}

export interface DomainAnalysisConfig {
  /** Root directory to analyze */
  rootPath:string;
  /** File patterns to include */
  includePatterns:string[];
  /** File patterns to exclude */
  excludePatterns:string[];
  /** Minimum files required for a domain */
  minFilesPerDomain:number;
  /** Maximum depth to analyze */
  maxDepth:number;
  /** Enable dependency analysis */
  analyzeDependencies:boolean;
  /** Enable semantic analysis */
  enableSemanticAnalysis:boolean;
}

export interface CodeFile {
  /** File path */
  path:string;
  /** File content */
  content:string;
  /** Extracted imports */
  imports:string[];
  /** Extracted exports */
  exports:string[];
  /** Identified concepts */
  concepts:string[];
  /** File metrics */
  metrics:{
    linesOfCode:number;
    complexity:number;
    maintainability:number;
};
}

export class DomainAnalysisEngine extends TypedEventBase {
  private configuration:DomainAnalysisConfig;
  private discoveredDomains:Map<string, DomainBoundary> = new Map();
  private analyzedFiles:Map<string, CodeFile> = new Map();
  private relationships:DomainRelationship[] = [];

  constructor(config:DomainAnalysisConfig) {
    super();
    this.configuration = {
      includePatterns:['**/*.ts',    '**/*.js',    '**/*.tsx',    '**/*.jsx'],
      excludePatterns:[
        '**/node_modules/**',        '**/dist/**',        '**/build/**',        '**/*.test.*',        '**/*.spec.*',],
      minFilesPerDomain:3,
      maxDepth:10,
      analyzeDependencies:true,
      enableSemanticAnalysis:true,
      ...config,
};
}

  /**
   * Perform comprehensive domain analysis
   */
  async analyzeDomains():Promise<DomainAnalysis> {
    logger.info('Starting domain analysis', {
    ')      rootPath:this.configuration.rootPath,
});

    try {
      // Step 1:Discover and analyze files
      await this.discoverFiles();

      // Step 2:Identify potential domains
      await this.identifyDomains();

      // Step 3:Analyze relationships
      if (this.configuration.analyzeDependencies) {
        await this.analyzeRelationships();
}

      // Step 4:Calculate metrics
      const metrics = await this.calculateOverallMetrics();

      const analysis:DomainAnalysis = {
        domains:Array.from(this.discoveredDomains.values()),
        relationships:this.relationships,
        categories:this.extractDomainCategories(),
        complexity:metrics.architecturalQuality,
        coupling:metrics.averageCoupling,
        tightlyCoupledGroups:this.identifyTightlyCoupledGroups(),
        metrics,
        timestamp:new Date(),
        config:this.configuration,
};

      logger.info('Domain analysis completed', {
    ')        domainCount:analysis.domains.length,
        relationshipCount:analysis.relationships.length,
        quality:metrics.architecturalQuality,
});

      this.emit('analysis-completed', analysis);
      return analysis;
} catch (error) {
      logger.error('Domain analysis failed', { error});')      this.emit('analysis-failed', error);
      throw error;
}
}

  /**
   * Analyze domain complexity metrics
   */
  async analyzeDomainComplexity(domainPath:string): Promise<number> {
    const domain = await this.analyzeDomain(domainPath);
    if (!domain) return 0;

    const metrics = await this.calculateDomainMetrics(domain);
    return metrics.cyclomaticComplexity / Math.max(1, metrics.fileCount);
}

  /**
   * Analyze a specific domain
   */
  async analyzeDomain(domainPath:string): Promise<DomainBoundary | null> {
    logger.debug('Analyzing specific domain', { domainPath});')
    if (!existsSync(domainPath)) {
      return null;
}

    const files = await this.discoverFilesInPath(domainPath);
    if (files.length < this.configuration.minFilesPerDomain) {
      return null;
}

    const domain = await this.createDomainFromFiles(domainPath, files);
    this.discoveredDomains.set(domain.id, domain);

    return domain;
}

  /**
   * Get domain metrics
   */
  async getDomainMetrics(domainId:string): Promise<DomainMetrics | null> {
    const domain = this.discoveredDomains.get(domainId);
    if (!domain) return null;

    return this.calculateDomainMetrics(domain);
}

  /**
   * Get suggested domain improvements
   */
  async getSuggestedImprovements(domainId:string): Promise<string[]> {
    const domain = this.discoveredDomains.get(domainId);
    if (!domain) return [];

    const metrics = await this.calculateDomainMetrics(domain);
    const suggestions:string[] = [];

    if (metrics.coupling > 0.7) {
      suggestions.push('Consider reducing coupling by extracting shared interfaces');')}

    if (metrics.cohesion < 0.5) {
      suggestions.push(
        'Consider splitting domain into smaller, more cohesive units')      );
}

    if (metrics.cyclomaticComplexity > 20) {
      suggestions.push(
        'Consider refactoring complex methods to reduce complexity')      );
}

    if (metrics.maintainabilityIndex < 60) {
      suggestions.push(
        'Consider improving code maintainability through refactoring')      );
}

    return suggestions;
}

  private async discoverFiles():Promise<void> {
    const files = await this.discoverFilesInPath(this.configuration.rootPath);

    for (const filePath of files) {
      try {
        const codeFile = await this.analyzeFile(filePath);
        this.analyzedFiles.set(filePath, codeFile);
} catch (error) {
        logger.warn('Failed to analyze file', { filePath, error});')}
}

    logger.debug('File discovery completed', {
    ')      fileCount:this.analyzedFiles.size,
});
}

  private async discoverFilesInPath(
    rootPath:string,
    currentDepth = 0
  ):Promise<string[]> {
    if (currentDepth > this.configuration.maxDepth) return [];

    const files:string[] = [];

    try {
      const entries = readdirSync(rootPath);

      for (const entry of entries) {
        const fullPath = join(rootPath, entry);
        const __stats = statSync(fullPath);

        if (stats?.isDirectory()) {
          // Check if directory should be excluded
          const shouldExclude = this.configuration.excludePatterns.some(
            (pattern) =>
              fullPath.includes(pattern.replace('**/',    ').replace('/**',    '))')          );

          if (!shouldExclude) {
            const subFiles = await this.discoverFilesInPath(
              fullPath,
              currentDepth + 1
            );
            files.push(...subFiles);
}
} else if (stats?.isFile()) {
          // Check if file matches include patterns
          const __shouldInclude = this.configuration.includePatterns.some(
            (pattern) => {
              const ext = pattern.split('.').pop();')              return fullPath.endsWith(`.${ext}`);`
}
          );

          if (shouldInclude) {
            files.push(fullPath);
}
}
}
} catch (error) {
      logger.warn('Failed to read directory', { rootPath, error});')}

    return files;
}

  private async analyzeFile(filePath:string): Promise<CodeFile> {
    const content = readFileSync(filePath, 'utf8');')
    const codeFile:CodeFile = {
      path:filePath,
      content,
      imports:this.extractImports(content),
      exports:this.extractExports(content),
      concepts:this.extractConcepts(content),
      metrics:this.calculateFileMetrics(content),
};

    return codeFile;
}

  private extractImports(content:string): string[] {
    const imports:string[] = [];
    const importRegex = /imports+.*?froms+["'`]([^"'`]+)["'`]/g;`
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
}

    return imports;
}

  private extractExports(content:string): string[] {
    const exports:string[] = [];
    const exportRegex =
      /export\s+(?:class|function|const|let|var|interface|type)\s+(\w+)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
}

    return exports;
}

  private extractConcepts(content:string): string[] {
    const concepts:string[] = [];

    // Extract class names
    const classRegex = /class\s+(\w+)/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      concepts.push(match[1]);
}

    // Extract interface names
    const interfaceRegex = /interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      concepts.push(match[1]);
}

    // Extract function names
    const functionRegex = /function\s+(\w+)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      concepts.push(match[1]);
}

    return concepts;
}

  private calculateFileMetrics(content:string): 
    linesOfCode:number;
    complexity:number;
    maintainability:number;{
    const lines = content.split('\n');')    const linesOfCode = lines.filter(
      (line) => line.trim() && !line.trim().startsWith('//')')    ).length;

    // Simple complexity calculation
    const complexity =
      (content.match(/if|for|while|switch|catch/g) || []).length + 1;

    // Simple maintainability index
    const maintainability = Math.max(
      0,
      100 - complexity * 2 - linesOfCode / 10
    );

    return { linesOfCode, complexity, maintainability};
}

  private async identifyDomains():Promise<void> {
    const pathGroups = new Map<string, string[]>();

    // Group files by directory structure
    for (const filePath of this.analyzedFiles.keys()) {
      const dir = dirname(filePath);
      const segments = dir.split('/').filter((s) => s && s !== '.');')
      // Try different levels of grouping
      for (let level = 1; level <= Math.min(3, segments.length); level++) {
        const groupKey = segments.slice(0, level).join('/');')        if (!pathGroups.has(groupKey)) {
          pathGroups.set(groupKey, []);
}
        pathGroups.get(groupKey)?.push(filePath);
}
}

    // Create domains from groups with sufficient files
    for (const [path, files] of pathGroups.entries()) {
      if (files.length >= this.configuration.minFilesPerDomain) {
        const domain = await this.createDomainFromFiles(path, files);
        this.discoveredDomains.set(domain.id, domain);
}
}

    logger.debug('Domain identification completed', {
    ')      domainCount:this.discoveredDomains.size,
});
}

  private async createDomainFromFiles(
    path:string,
    files:string[]
  ):Promise<DomainBoundary> {
    const name = basename(path) || 'root;
    const concepts = new Set<string>();

    // Collect concepts from all files in domain
    for (const filePath of files) {
      const codeFile = this.analyzedFiles.get(filePath);
      if (codeFile) {
        codeFile.concepts.forEach((concept) => concepts.add(concept));
}
}

    const domain:DomainBoundary = {
      id:`domain_${path.replace(/[^\dA-Za-z]/g, '_')}`,`
      name,
      description:`Domain containing ${files.length} files with concepts:${Array.from(concepts).slice(0, 5).join(',    ')}`,`
      rootPath:path,
      files,
      subdirectories:this.getSubdirectories(path),
      type:this.classifyDomainType(name, Array.from(concepts)),
      confidence:this.calculateDomainConfidence(files, Array.from(concepts)),
};

    return domain;
}

  private getSubdirectories(path:string): string[] 
    try {
      if (!existsSync(path)) return [];

      return readdirSync(path)
        .map((entry) => join(path, entry))
        .filter((fullPath) => {
          try {
            return statSync(fullPath)?.isDirectory();
} catch {
            return false;
}
});
} catch {
      return [];
}

  private classifyDomainType(
    name:string,
    concepts:string[]
  ):DomainBoundary['type'] {
    ')    const nameUpper = name.toLowerCase();

    if (
      nameUpper.includes('core') || ')      nameUpper.includes('domain') || ')      nameUpper.includes('model')')    ) 
      return 'core;

    if (
      nameUpper.includes('infra') || ')      nameUpper.includes('database') || ')      nameUpper.includes('storage')')    ) 
      return 'infrastructure;

    if (
      nameUpper.includes('ui') || ')      nameUpper.includes('view') || ')      nameUpper.includes('component')')    ) 
      return 'presentation;

    if (
      nameUpper.includes('service') || ')      nameUpper.includes('util') || ')      nameUpper.includes('helper')')    ) 
      return 'support;

    return 'application;
}

  private calculateDomainConfidence(
    files:string[],
    concepts:string[]
  ):number {
    // Base confidence on file count and concept coherence
    const fileScore = Math.min(1, files.length / 10);
    const conceptScore = Math.min(1, concepts.length / 5);

    return (fileScore + conceptScore) / 2;
}

  private extractDomainCategories():string[] {
    const categories = new Set<string>();
    for (const domain of this.discoveredDomains.values()) {
      categories.add(domain.type);
}
    return Array.from(categories);
}

  private identifyTightlyCoupledGroups():DomainBoundary[][] {
    const groups:DomainBoundary[][] = [];
    const domains = Array.from(this.discoveredDomains.values());
    const visited = new Set<string>();

    for (const domain of domains) {
      if (visited.has(domain.id)) continue;

      const group:DomainBoundary[] = [domain];
      visited.add(domain.id);

      // Find tightly coupled domains (coupling > 0.7)
      for (const relationship of this.relationships) {
        if (
          relationship.sourceId === domain.id &&
          relationship.strength > 0.7
        ) {
          const target = domains.find((d) => d.id === relationship.targetId);
          if (target && !visited.has(target.id)) {
            group.push(target);
            visited.add(target.id);
}
}
}

      if (group.length > 1) {
        groups.push(group);
}
}

    return groups;
}

  private async analyzeRelationships():Promise<void> 
    this.relationships = [];

    for (const [sourceId, sourceDomain] of this.discoveredDomains.entries()) {
      for (const [targetId, targetDomain] of this.discoveredDomains.entries()) {
        if (sourceId === targetId) continue;

        const relationship = this.calculateDomainRelationship(
          sourceDomain,
          targetDomain
        );
        if (relationship && relationship.strength > 0.1) {
          this.relationships.push(relationship);
}
}
}

    logger.debug('Relationship analysis completed', {
    ')      relationshipCount:this.relationships.length,
});

  private calculateDomainRelationship(
    source:DomainBoundary,
    target:DomainBoundary
  ):DomainRelationship | null {
    let __connectionCount = 0;
    const evidence:string[] = [];

    // Analyze imports between domains
    for (const sourceFile of source.files) {
      const codeFile = this.analyzedFiles.get(sourceFile);
      if (!codeFile) continue;

      for (const importPath of codeFile.imports) {
        if (target.files.some((file) => file.includes(importPath))) {
          _connectionCount++;
          evidence.push(`${sourceFile} imports from ${importPath}`);`
}
}
}

    if (connectionCount === 0) return null;

    const strength = Math.min(
      1,
      connectionCount / (source.files.length + target.files.length)
    );

    return {
      sourceId:source.id,
      targetId:target.id,
      type: 'depends-on',      strength,
      evidence,
      connectionCount,
};
}

  private async calculateDomainMetrics(
    domain:DomainBoundary
  ):Promise<DomainMetrics> {
    let totalComplexity = 0;
    let totalLines = 0;
    const totalFiles = domain.files.length;
    let totalDependencies = 0;

    for (const filePath of domain.files) {
      const codeFile = this.analyzedFiles.get(filePath);
      if (codeFile) {
        totalComplexity += codeFile.metrics.complexity;
        totalLines += codeFile.metrics.linesOfCode;
        totalDependencies += codeFile.imports.length;
}
}

    const cohesion = this.calculateCohesion(domain);
    const coupling = this.calculateCoupling(domain);
    const maintainabilityIndex = Math.max(
      0,
      100 - totalComplexity / totalFiles - totalLines / totalFiles / 10
    );

    return {
      cyclomaticComplexity:totalComplexity,
      linesOfCode:totalLines,
      fileCount:totalFiles,
      dependencyCount:totalDependencies,
      cohesion,
      coupling,
      maintainabilityIndex,
};
}

  private calculateCohesion(domain:DomainBoundary): number {
    // Simple cohesion calculation based on shared concepts
    const allConcepts = new Set<string>();
    const conceptCounts = new Map<string, number>();

    for (const filePath of domain.files) {
      const codeFile = this.analyzedFiles.get(filePath);
      if (codeFile) {
        for (const concept of codeFile.concepts) {
          allConcepts.add(concept);
          conceptCounts.set(concept, (conceptCounts.get(concept) || 0) + 1);
}
}
}

    if (allConcepts.size === 0) return 0;

    const sharedConcepts = Array.from(conceptCounts.values()).filter(
      (count) => count > 1
    ).length;
    return sharedConcepts / allConcepts.size;
}

  private calculateCoupling(domain:DomainBoundary): number {
    // Calculate coupling based on external dependencies
    const externalDependencies = new Set<string>();

    for (const filePath of domain.files) {
      const codeFile = this.analyzedFiles.get(filePath);
      if (codeFile) {
        for (const importPath of codeFile.imports) {
          if (!domain.files.some((file) => file.includes(importPath))) {
            externalDependencies.add(importPath);
}
}
}
}

    return Math.min(1, externalDependencies.size / domain.files.length);
}

  private async calculateOverallMetrics():Promise<DomainAnalysis['metrics']> {
    ')    const domains = Array.from(this.discoveredDomains.values());
    let totalCohesion = 0;
    let totalCoupling = 0;

    for (const domain of domains) {
      const metrics = await this.calculateDomainMetrics(domain);
      totalCohesion += metrics.cohesion;
      totalCoupling += metrics.coupling;
}

    const averageCohesion =
      domains.length > 0 ? totalCohesion / domains.length:0;
    const averageCoupling =
      domains.length > 0 ? totalCoupling / domains.length:0;

    // Calculate architectural quality (higher cohesion, lower coupling is better)
    const architecturalQuality =
      domains.length > 0 ? (averageCohesion + (1 - averageCoupling)) / 2:0;

    return {
      totalDomains:domains.length,
      averageCohesion,
      averageCoupling,
      architecturalQuality,
};
}
}

/**
 * Factory function for creating Domain Analysis Engine
 */
export function createDomainAnalysisEngine(config:DomainAnalysisConfig): DomainAnalysisEngine {
  return new DomainAnalysisEngine(config);
}

export default DomainAnalysisEngine;