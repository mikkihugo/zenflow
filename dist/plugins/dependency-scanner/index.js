/**
 * Dependency Scanner Plugin
 * Scans for dependency conflicts across package.json files and generates ADRs for standardization
 */

import { glob } from 'glob';
import { readPackageUp } from 'read-pkg-up';
import { readFile } from 'fs/promises';
import path from 'path';

export class DependencyScannerPlugin {
  constructor(config = {}) {
    this.config = {
      packageManagerTypes: ['npm', 'yarn', 'pnpm'],
      ignorePatterns: ['node_modules/**', '.git/**', 'dist/**'],
      includeDevDependencies: true,
      conflictThreshold: 1,
      generateADRs: true,
      aiProvider: null, // Will be injected
      ...config
    };
    
    this.dependencyMap = new Map();
    this.conflictStrategies = new Map();
  }

  async initialize() {
    console.log('📦 Dependency Scanner Plugin initialized');
    
    this.setupConflictStrategies();
    
    if (!this.config.aiProvider && this.config.generateADRs) {
      console.warn('⚠️ No AI provider configured, ADR generation disabled');
      this.config.generateADRs = false;
    }
  }

  setupConflictStrategies() {
    this.conflictStrategies.set('major_version', {
      severity: 'high',
      description: 'Major version differences may cause breaking changes',
      action: 'Standardize on latest stable major version'
    });
    
    this.conflictStrategies.set('minor_version', {
      severity: 'medium', 
      description: 'Minor version differences may cause feature incompatibilities',
      action: 'Align on consistent minor version'
    });
    
    this.conflictStrategies.set('patch_version', {
      severity: 'low',
      description: 'Patch version differences usually safe but inconsistent',
      action: 'Update to latest patch version'
    });
  }

  /**
   * Scan for dependency conflicts across the codebase
   */
  async scanForConflicts(options = {}) {
    const { includeTypes = ['dependencies', 'devDependencies', 'peerDependencies'] } = options;
    
    console.log('🔍 Scanning for package.json files...');
    const packageJsonFiles = await glob('**/package.json', { 
      ignore: this.config.ignorePatterns 
    });

    console.log(`📊 Found ${packageJsonFiles.length} package.json files`);
    
    const dependencyAnalysis = await this.analyzeDependencies(packageJsonFiles, includeTypes);
    const conflicts = await this.detectConflicts(dependencyAnalysis);
    
    return {
      totalPackages: packageJsonFiles.length,
      totalDependencies: Object.keys(dependencyAnalysis).length,
      conflicts: conflicts.length,
      suggestions: conflicts,
      summary: this.generateSummary(conflicts)
    };
  }

  /**
   * Analyze dependencies across all package.json files
   */
  async analyzeDependencies(packageFiles, includeTypes) {
    const analysis = {};
    
    for (const file of packageFiles) {
      try {
        const pkgContent = await readFile(file, 'utf8');
        const pkg = JSON.parse(pkgContent);
        const projectName = pkg.name || path.basename(path.dirname(file));
        
        for (const depType of includeTypes) {
          const deps = pkg[depType] || {};
          
          for (const [depName, version] of Object.entries(deps)) {
            if (!analysis[depName]) {
              analysis[depName] = {
                versions: new Map(),
                dependencyType: depType,
                totalUsages: 0
              };
            }
            
            if (!analysis[depName].versions.has(version)) {
              analysis[depName].versions.set(version, []);
            }
            
            analysis[depName].versions.get(version).push({
              project: projectName,
              file: file,
              type: depType
            });
            
            analysis[depName].totalUsages++;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not parse ${file}: ${error.message}`);
      }
    }
    
    return analysis;
  }

  /**
   * Detect conflicts in dependency versions
   */
  async detectConflicts(analysis) {
    const conflicts = [];
    
    for (const [depName, data] of Object.entries(analysis)) {
      const versions = Array.from(data.versions.keys());
      
      if (versions.length > this.config.conflictThreshold) {
        const conflict = await this.analyzeConflict(depName, data);
        conflicts.push(conflict);
      }
    }
    
    return conflicts.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  /**
   * Analyze individual dependency conflict
   */
  async analyzeConflict(depName, data) {
    const versions = Array.from(data.versions.keys());
    const conflictType = this.classifyConflict(versions);
    const strategy = this.conflictStrategies.get(conflictType) || this.conflictStrategies.get('minor_version');
    
    const conflict = {
      id: `dependency-conflict-${depName}`,
      type: 'dependency_conflict',
      dependency: depName,
      severity: strategy.severity,
      conflictType,
      versions: this.formatVersionData(data.versions),
      totalUsages: data.totalUsages,
      description: `Multiple versions of '${depName}' found: ${versions.join(', ')}`,
      recommendation: strategy.action,
      strategy: strategy.description
    };

    // Generate ADR if enabled
    if (this.config.generateADRs && this.config.aiProvider) {
      try {
        conflict.adr = await this.generateConflictADR(depName, data, strategy);
      } catch (error) {
        console.warn(`Failed to generate ADR for ${depName}: ${error.message}`);
      }
    }

    return conflict;
  }

  /**
   * Classify the type of version conflict
   */
  classifyConflict(versions) {
    const parsed = versions.map(v => this.parseVersion(v)).filter(Boolean);
    
    if (parsed.length < 2) return 'patch_version';
    
    const majorVersions = new Set(parsed.map(v => v.major));
    const minorVersions = new Set(parsed.map(v => `${v.major}.${v.minor}`));
    
    if (majorVersions.size > 1) return 'major_version';
    if (minorVersions.size > 1) return 'minor_version';
    return 'patch_version';
  }

  /**
   * Parse semantic version string
   */
  parseVersion(version) {
    const cleanVersion = version.replace(/[\^~><=]/, '');
    const match = cleanVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
    
    if (!match) return null;
    
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
      raw: version
    };
  }

  /**
   * Format version data for display
   */
  formatVersionData(versionsMap) {
    const formatted = [];
    
    for (const [version, usages] of versionsMap) {
      formatted.push({
        version,
        projects: usages.map(u => u.project),
        files: usages.map(u => u.file),
        count: usages.length
      });
    }
    
    return formatted.sort((a, b) => b.count - a.count);
  }

  /**
   * Generate ADR for dependency conflict resolution
   */
  async generateConflictADR(depName, data, strategy) {
    const versions = Array.from(data.versions.keys());
    const prompt = this.buildADRPrompt(depName, versions, data, strategy);
    
    const response = await this.config.aiProvider.generateStructured(prompt, {
      type: 'object',
      properties: {
        title: { type: 'string' },
        context: { type: 'string' },
        decision: { type: 'string' },
        consequences: {
          type: 'object',
          properties: {
            positive: { type: 'array', items: { type: 'string' } },
            negative: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } }
          }
        },
        alternatives: { type: 'array', items: { type: 'string' } },
        implementation: { type: 'string' }
      }
    });

    return response;
  }

  buildADRPrompt(depName, versions, data, strategy) {
    const versionDetails = Array.from(data.versions.entries())
      .map(([version, usages]) => `- ${version}: used by ${usages.length} projects`)
      .join('\n');

    return `Generate an Architecture Decision Record (ADR) for standardizing the dependency '${depName}'.

Current situation:
- Multiple versions found: ${versions.join(', ')}
- Total usage across ${data.totalUsages} projects
- Conflict severity: ${strategy.severity}

Version breakdown:
${versionDetails}

Strategy: ${strategy.description}
Recommended action: ${strategy.action}

Create a comprehensive ADR that includes practical implementation steps and considers migration complexity.`;
  }

  /**
   * Get numeric weight for severity sorting
   */
  getSeverityWeight(severity) {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity] || 1;
  }

  /**
   * Generate summary of conflict analysis
   */
  generateSummary(conflicts) {
    const severityCounts = conflicts.reduce((acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    }, {});

    const conflictTypes = conflicts.reduce((acc, c) => {
      acc[c.conflictType] = (acc[c.conflictType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalConflicts: conflicts.length,
      severityBreakdown: severityCounts,
      conflictTypeBreakdown: conflictTypes,
      mostConflictedDependency: conflicts.length > 0 ? conflicts[0].dependency : null
    };
  }

  /**
   * Get scanning capabilities
   */
  getCapabilities() {
    return {
      fileTypes: ['package.json'],
      dependencyTypes: ['dependencies', 'devDependencies', 'peerDependencies'],
      conflictTypes: ['major_version', 'minor_version', 'patch_version'],
      features: [
        'version-conflict-detection',
        'severity-classification',
        'adr-generation',
        'resolution-strategies'
      ]
    };
  }

  async cleanup() {
    this.dependencyMap.clear();
    console.log('📦 Dependency Scanner Plugin cleaned up');
  }
}

export default DependencyScannerPlugin;