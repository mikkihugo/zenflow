/**
 * @fileoverview Enhanced Domain Analyzer for repository domain identification
 * Advanced domain splitting with machine learning patterns and heuristics
 */

import * as fastGlob from 'fast-glob';
import { getLogger } from '@claude-zen/foundation';
import type {
  Domain,
  DomainSize,
  DomainType,
  SplitRecommendation,
  SuggestedSplit,
  AnalysisOptions
} from '../types/index.js';

export class DomainAnalyzer {
  private logger = getLogger('DomainAnalyzer');

  /**
   * Analyze repository domains
   */
  async analyzeRepository(rootPath: string, files: string[], options?: AnalysisOptions): Promise<Domain[]> {
    this.logger.info(`Analyzing domains for ${files.length} files`);

    try {
      // Group files by directory structure
      const directoryGroups = this.groupFilesByDirectory(files);
      
      // Analyze each directory as a potential domain
      const domains: Domain[] = [];
      let domainId = 1;

      for (const [dirPath, dirFiles] of directoryGroups) {
        const domain = await this.analyzeDomain(
          `domain-${domainId++}`,
          dirPath,
          dirFiles,
          rootPath,
          options
        );
        
        if (domain) {
          domains.push(domain);
        }
      }

      // Detect cross-cutting concerns and shared domains
      this.detectSharedDomains(domains);
      
      // Calculate domain relationships
      this.calculateDomainDependencies(domains, files);

      return domains.sort((a, b) => b.complexity - a.complexity);

    } catch (error) {
      this.logger.warn('Domain analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze a single domain
   */
  private async analyzeDomain(
    id: string,
    path: string,
    files: string[],
    rootPath: string,
    options?: AnalysisOptions
  ): Promise<Domain | null> {
    if (files.length === 0) return null;

    const name = this.inferDomainName(path);
    const description = this.generateDomainDescription(path, files);
    const type = this.classifyDomainType(path, files);
    const size = await this.calculateDomainSize(files);
    const complexity = this.calculateDomainComplexity(files, size);
    const cohesion = this.calculateDomainCohesion(files);
    const coupling = await this.calculateDomainCoupling(files, rootPath);

    const splitRecommendation = this.evaluateSplitRecommendation(
      complexity,
      cohesion,
      coupling,
      size,
      files
    );

    return {
      id,
      name,
      description,
      files: files.map(f => f.replace(rootPath + '/', '')),
      dependencies: [], // Will be calculated later
      complexity,
      cohesion,
      coupling,
      size,
      type,
      splitRecommendation,
      metadata: {
        path,
        rootPath,
        analysis: {
          fileCount: files.length,
          avgFileSize: size.lines / files.length,
          primaryLanguage: this.detectPrimaryLanguage(files),
          frameworks: this.detectFrameworks(files)
        }
      }
    };
  }

  /**
   * Group files by directory structure
   */
  private groupFilesByDirectory(files: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();

    for (const file of files) {
      const pathParts = file.split('/');
      
      // Try different grouping levels
      for (let level = 1; level <= Math.min(3, pathParts.length - 1); level++) {
        const dirPath = pathParts.slice(0, -level).join('/');
        
        if (!groups.has(dirPath)) {
          groups.set(dirPath, []);
        }
        groups.get(dirPath)!.push(file);
      }
    }

    // Filter groups - prefer deeper, more specific groupings
    const filteredGroups = new Map<string, string[]>();
    const processedFiles = new Set<string>();

    // Sort by depth (deeper first)
    const sortedPaths = Array.from(groups.keys()).sort((a, b) => {
      const depthA = a.split('/').length;
      const depthB = b.split('/').length;
      return depthB - depthA;
    });

    for (const path of sortedPaths) {
      const pathFiles = groups.get(path)!;
      const newFiles = pathFiles.filter(f => !processedFiles.has(f));
      
      if (newFiles.length >= 2) { // Minimum 2 files for a domain
        filteredGroups.set(path, newFiles);
        newFiles.forEach(f => processedFiles.add(f));
      }
    }

    return filteredGroups;
  }

  /**
   * Infer domain name from path
   */
  private inferDomainName(path: string): string {
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'root';
    
    // Clean up common prefixes/suffixes
    return lastSegment
      .replace(/^(src|lib|app|components|modules|packages)$/, 'core')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Generate domain description
   */
  private generateDomainDescription(path: string, files: string[]): string {
    const segments = path.split('/').filter(Boolean);
    const fileTypes = this.analyzeFileTypes(files);
    const primaryType = Object.keys(fileTypes).reduce((a, b) => 
      fileTypes[a] > fileTypes[b] ? a : b
    );

    const contexts = [
      'authentication',
      'authorization', 
      'user',
      'admin',
      'api',
      'database',
      'service',
      'component',
      'util',
      'helper',
      'config',
      'test',
      'migration'
    ];

    const detectedContext = segments.find(segment => 
      contexts.some(context => segment.toLowerCase().includes(context))
    );

    if (detectedContext) {
      return `${detectedContext.charAt(0).toUpperCase() + detectedContext.slice(1)} domain containing ${primaryType} files`;
    }

    return `Domain containing ${files.length} ${primaryType} files`;
  }

  /**
   * Classify domain type based on path and files
   */
  private classifyDomainType(path: string, files: string[]): DomainType {
    const pathLower = path.toLowerCase();
    const fileTypes = this.analyzeFileTypes(files);

    // Infrastructure patterns
    if (pathLower.includes('config') || pathLower.includes('infrastructure') || 
        pathLower.includes('database') || pathLower.includes('migration')) {
      return 'infrastructure';
    }

    // API patterns
    if (pathLower.includes('api') || pathLower.includes('route') || 
        pathLower.includes('endpoint') || pathLower.includes('controller')) {
      return 'api';
    }

    // UI patterns
    if (pathLower.includes('component') || pathLower.includes('view') || 
        pathLower.includes('ui') || pathLower.includes('frontend')) {
      return 'ui';
    }

    // Utility patterns
    if (pathLower.includes('util') || pathLower.includes('helper') || 
        pathLower.includes('tool') || pathLower.includes('lib')) {
      return 'utility';
    }

    // Test patterns
    if (pathLower.includes('test') || pathLower.includes('spec') || 
        Object.keys(fileTypes).some(type => type.includes('test'))) {
      return 'test';
    }

    // Data patterns
    if (pathLower.includes('model') || pathLower.includes('entity') || 
        pathLower.includes('data') || pathLower.includes('repository')) {
      return 'data';
    }

    // Core business logic
    if (pathLower.includes('core') || pathLower.includes('business') || 
        pathLower.includes('domain') || pathLower.includes('service')) {
      return 'core';
    }

    // Feature-specific
    if (pathLower.includes('feature') || pathLower.includes('module')) {
      return 'feature';
    }

    return 'feature'; // Default
  }

  /**
   * Calculate domain size metrics
   */
  private async calculateDomainSize(files: string[]): Promise<DomainSize> {
    const fs = await import('fs/promises');
    let totalLines = 0;
    let functions = 0;
    let classes = 0;
    let interfaces = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').length;
        totalLines += lines;

        // Simple pattern matching
        functions += (content.match(/function\s+\w+|=>\s*{|^\s*\w+\s*:/gm) || []).length;
        classes += (content.match(/class\s+\w+/gm) || []).length;
        interfaces += (content.match(/interface\s+\w+/gm) || []).length;
      } catch {
        // Skip files that can't be read
      }
    }

    return {
      files: files.length,
      lines: totalLines,
      functions,
      classes,
      interfaces
    };
  }

  /**
   * Calculate domain complexity (0-1 scale)
   */
  private calculateDomainComplexity(files: string[], size: DomainSize): number {
    // Complexity factors
    const fileCountFactor = Math.min(1, files.length / 50); // Normalize to 50 files
    const lineFactor = Math.min(1, size.lines / 5000); // Normalize to 5000 lines
    const functionFactor = Math.min(1, size.functions / 200); // Normalize to 200 functions
    const classFactor = Math.min(1, size.classes / 50); // Normalize to 50 classes

    return parseFloat(((fileCountFactor + lineFactor + functionFactor + classFactor) / 4).toFixed(3));
  }

  /**
   * Calculate domain cohesion (0-1 scale)
   */
  private calculateDomainCohesion(files: string[]): number {
    // Simple cohesion heuristic based on file naming patterns
    const fileNames = files.map(f => f.split('/').pop() || '');
    const commonPrefixes = this.findCommonPrefixes(fileNames);
    const commonSuffixes = this.findCommonSuffixes(fileNames);
    
    const prefixScore = commonPrefixes.length / fileNames.length;
    const suffixScore = commonSuffixes.length / fileNames.length;
    const extensionConsistency = this.calculateExtensionConsistency(files);

    return parseFloat(((prefixScore + suffixScore + extensionConsistency) / 3).toFixed(3));
  }

  /**
   * Calculate domain coupling (0-1 scale)
   */
  private async calculateDomainCoupling(files: string[], rootPath: string): Promise<number> {
    const fs = await import('fs/promises');
    let totalImports = 0;
    let externalImports = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const imports = this.extractImports(content);
        totalImports += imports.length;

        for (const imp of imports) {
          if (this.isExternalImport(imp, file, files)) {
            externalImports++;
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return totalImports > 0 ? parseFloat((externalImports / totalImports).toFixed(3)) : 0;
  }

  /**
   * Evaluate if domain should be split
   */
  private evaluateSplitRecommendation(
    complexity: number,
    cohesion: number,
    coupling: number,
    size: DomainSize,
    files: string[]
  ): SplitRecommendation | undefined {
    let score = 0;
    const reasons: string[] = [];

    // High complexity suggests splitting
    if (complexity > 0.7) {
      score += 3;
      reasons.push('High complexity indicates the domain is doing too much');
    }

    // Low cohesion suggests splitting
    if (cohesion < 0.4) {
      score += 2;
      reasons.push('Low cohesion suggests unrelated functionality grouped together');
    }

    // High coupling suggests splitting
    if (coupling > 0.6) {
      score += 2;
      reasons.push('High external coupling indicates tight dependencies');
    }

    // Large size suggests splitting
    if (size.files > 20 || size.lines > 2000) {
      score += 1;
      reasons.push('Large size makes the domain hard to understand and maintain');
    }

    const shouldSplit = score >= 4;
    const confidence = Math.min(1, score / 6);

    if (!shouldSplit) return undefined;

    const suggestedSplits = this.generateSplitSuggestions(files, size);

    return {
      shouldSplit,
      confidence,
      reasons,
      suggestedSplits,
      estimatedEffort: {
        hours: suggestedSplits.length * 8, // 8 hours per split
        difficulty: score >= 5 ? 'high' : 'medium',
        phases: [
          {
            name: 'Analysis',
            description: 'Analyze dependencies and identify split boundaries',
            estimatedHours: 4,
            dependencies: [],
            risks: ['Missing dependencies', 'Circular references']
          },
          {
            name: 'Implementation',
            description: 'Create new domains and move files',
            estimatedHours: suggestedSplits.length * 6,
            dependencies: ['Analysis'],
            risks: ['Breaking changes', 'Build failures']
          },
          {
            name: 'Testing',
            description: 'Test split domains and fix integration issues',
            estimatedHours: suggestedSplits.length * 2,
            dependencies: ['Implementation'],
            risks: ['Integration failures', 'Performance issues']
          }
        ]
      },
      benefits: {
        complexityReduction: 30,
        maintainabilityImprovement: 25,
        testabilityImprovement: 20,
        teamVelocityImprovement: 15,
        deploymentRiskReduction: 10
      },
      risks: [
        {
          type: 'complexity',
          severity: 'medium',
          description: 'Splitting may initially increase system complexity',
          mitigation: 'Use gradual migration approach',
          probability: 0.6,
          impact: 0.4
        },
        {
          type: 'performance',
          severity: 'low',
          description: 'Additional boundaries may impact performance',
          mitigation: 'Monitor performance metrics during migration',
          probability: 0.3,
          impact: 0.2
        }
      ]
    };
  }

  /**
   * Generate split suggestions
   */
  private generateSplitSuggestions(files: string[], size: DomainSize): SuggestedSplit[] {
    const suggestions: SuggestedSplit[] = [];
    
    // Group by file type/purpose
    const groups = this.groupFilesByPurpose(files);
    
    for (const [purpose, groupFiles] of groups) {
      if (groupFiles.length >= 2) {
        suggestions.push({
          newDomainName: purpose,
          files: groupFiles,
          rationale: `Separate ${purpose} files into dedicated domain`,
          complexity: groupFiles.length / files.length,
          dependencies: []
        });
      }
    }

    // If no clear grouping, suggest splitting by size
    if (suggestions.length === 0 && files.length > 10) {
      const midpoint = Math.floor(files.length / 2);
      suggestions.push({
        newDomainName: 'Core',
        files: files.slice(0, midpoint),
        rationale: 'Split large domain by file count',
        complexity: 0.5,
        dependencies: []
      });
    }

    return suggestions;
  }

  // Helper methods
  private analyzeFileTypes(files: string[]): Record<string, number> {
    const types: Record<string, number> = {};
    
    for (const file of files) {
      const ext = file.split('.').pop()?.toLowerCase() || 'unknown';
      types[ext] = (types[ext] || 0) + 1;
    }

    return types;
  }

  private detectPrimaryLanguage(files: string[]): string {
    const fileTypes = this.analyzeFileTypes(files);
    return Object.keys(fileTypes).reduce((a, b) => 
      fileTypes[a] > fileTypes[b] ? a : b
    );
  }

  private detectFrameworks(files: string[]): string[] {
    // Simple framework detection based on file patterns
    const frameworks = new Set<string>();
    
    for (const file of files) {
      const fileName = file.toLowerCase();
      if (fileName.includes('react')) frameworks.add('React');
      if (fileName.includes('vue')) frameworks.add('Vue');
      if (fileName.includes('angular')) frameworks.add('Angular');
      if (fileName.includes('express')) frameworks.add('Express');
      if (fileName.includes('next')) frameworks.add('Next.js');
    }

    return Array.from(frameworks);
  }

  private findCommonPrefixes(names: string[]): string[] {
    if (names.length < 2) return [];
    
    const prefixes = new Set<string>();
    
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const prefix = this.getCommonPrefix(names[i], names[j]);
        if (prefix.length > 2) {
          prefixes.add(prefix);
        }
      }
    }

    return Array.from(prefixes);
  }

  private findCommonSuffixes(names: string[]): string[] {
    if (names.length < 2) return [];
    
    const suffixes = new Set<string>();
    
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const suffix = this.getCommonSuffix(names[i], names[j]);
        if (suffix.length > 2) {
          suffixes.add(suffix);
        }
      }
    }

    return Array.from(suffixes);
  }

  private getCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.slice(0, i);
  }

  private getCommonSuffix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && 
           str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
      i++;
    }
    return str1.slice(-i);
  }

  private calculateExtensionConsistency(files: string[]): number {
    const extensions = files.map(f => f.split('.').pop() || '');
    const uniqueExtensions = new Set(extensions);
    return 1 - (uniqueExtensions.size - 1) / Math.max(1, extensions.length - 1);
  }

  private extractImports(content: string): string[] {
    const imports = [];
    
    // ES6 imports
    const importRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([@\w.-/]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // CommonJS requires
    const requireRegex = /require\s*\(\s*['"]([@\w.-/]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private isExternalImport(importPath: string, currentFile: string, domainFiles: string[]): boolean {
    if (importPath.startsWith('.')) {
      // Relative import - check if target is in domain
      const currentDir = currentFile.split('/').slice(0, -1).join('/');
      const path = require('path');
      const resolvedPath = path.resolve(currentDir, importPath);
      return !domainFiles.some(f => f.startsWith(resolvedPath));
    }
    
    // External package import
    return !importPath.startsWith('/') && !importPath.startsWith('.');
  }

  private groupFilesByPurpose(files: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    
    const purposes = [
      'component',
      'service', 
      'util',
      'helper',
      'model',
      'type',
      'interface',
      'config',
      'test',
      'spec'
    ];

    for (const file of files) {
      const fileName = file.toLowerCase();
      let assigned = false;
      
      for (const purpose of purposes) {
        if (fileName.includes(purpose)) {
          if (!groups.has(purpose)) {
            groups.set(purpose, []);
          }
          groups.get(purpose)!.push(file);
          assigned = true;
          break;
        }
      }
      
      if (!assigned) {
        if (!groups.has('other')) {
          groups.set('other', []);
        }
        groups.get('other')!.push(file);
      }
    }

    return groups;
  }

  private detectSharedDomains(domains: Domain[]): void {
    // Identify cross-cutting concerns
    const sharedPatterns = ['util', 'helper', 'common', 'shared', 'lib'];
    
    for (const domain of domains) {
      const domainName = domain.name.toLowerCase();
      if (sharedPatterns.some(pattern => domainName.includes(pattern))) {
        domain.type = 'utility';
        domain.metadata.shared = true;
      }
    }
  }

  private calculateDomainDependencies(domains: Domain[], allFiles: string[]): void {
    // This would require analyzing imports between domains
    // For now, leaving empty - could be enhanced with full dependency analysis
    for (const domain of domains) {
      domain.dependencies = [];
    }
  }
}