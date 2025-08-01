/**
 * Dependency Scanner Plugin
 * Scans for dependency conflicts across package.json files and generates ADRs for standardization
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class DependencyScannerPlugin extends BasePlugin {
  private dependencyMap = new Map();
  private conflictStrategies = new Map();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Dependency Scanner Plugin initialized');
    this.setupConflictStrategies();
    
    if (!this.config.settings?.aiProvider && this.config.settings?.generateADRs) {
      this.context.logger.warn('No AI provider configured, ADR generation disabled');
    }
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Dependency Scanner Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Dependency Scanner Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    await this.cleanup();
  }

  private setupConflictStrategies(): void {
    this.conflictStrategies.set('major_version', {
      severity: 'critical',
      description: 'Major version conflicts can cause breaking changes',
      recommendation: 'Standardize on a single major version'
    });

    this.conflictStrategies.set('minor_version', {
      severity: 'high',
      description: 'Minor version conflicts may cause compatibility issues',
      recommendation: 'Consider upgrading to latest compatible version'
    });

    this.conflictStrategies.set('patch_version', {
      severity: 'medium',
      description: 'Patch version conflicts are usually safe but should be standardized',
      recommendation: 'Upgrade to latest patch version'
    });
  }

  /**
   * Scan for dependency conflicts
   */
  async scanForConflicts(options: any = {}): Promise<any> {
    const { includeTypes = ['dependencies', 'devDependencies', 'peerDependencies'] } = options;

    this.context.logger.info('Scanning for package.json files...');
    
    // In real implementation, would use glob to find package.json files
    const packageJsonFiles = await this.findPackageJsonFiles();
    
    const dependencyAnalysis = await this.analyzeDependencies(packageJsonFiles, includeTypes);
    const conflicts = await this.detectConflicts(dependencyAnalysis);

    return {
      totalPackages: packageJsonFiles.length,
      totalDependencies: Object.keys(dependencyAnalysis).length,
      conflicts,
      summary: this.generateSummary(conflicts)
    };
  }

  private async findPackageJsonFiles(): Promise<string[]> {
    // Mock implementation - would use actual file system scanning
    return ['./package.json', './packages/core/package.json', './packages/cli/package.json'];
  }

  private async analyzeDependencies(packageFiles: string[], includeTypes: string[]): Promise<any> {
    const analysis: any = {};

    for (const file of packageFiles) {
      try {
        const pkgContent = await this.readPackageJson(file);
        const pkg = JSON.parse(pkgContent);

        for (const depType of includeTypes) {
          const deps = pkg[depType] || {};

          for (const [depName, version] of Object.entries(deps)) {
            if (!analysis[depName]) {
              analysis[depName] = {
                versions: new Map(),
                projects: new Set(),
                types: new Set()
              };
            }

            if (!analysis[depName].versions.has(version)) {
              analysis[depName].versions.set(version, []);
            }

            analysis[depName].versions.get(version).push({
              file,
              project: this.getProjectName(file),
              type: depType
            });

            analysis[depName].projects.add(this.getProjectName(file));
            analysis[depName].types.add(depType);
          }
        }
      } catch (error) {
        this.context.logger.warn(`Could not analyze ${file}`, error);
      }
    }

    return analysis;
  }

  private async readPackageJson(file: string): Promise<string> {
    // Mock implementation - would read actual file
    return JSON.stringify({
      name: 'test-package',
      dependencies: {
        'lodash': '^4.17.21',
        'express': '^4.18.0'
      }
    });
  }

  private getProjectName(file: string): string {
    return file.split('/').slice(-2)[0] || 'root';
  }

  private async detectConflicts(analysis: any): Promise<any[]> {
    const conflicts: any[] = [];

    for (const [depName, data] of Object.entries(analysis)) {
      const versions = Array.from((data as any).versions.keys());
      
      if (versions.length > 1) {
        const conflict = await this.analyzeConflict(depName, data as any);
        conflicts.push(conflict);
      }
    }

    return conflicts.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  /**
   * Analyze individual dependency conflict
   */
  private async analyzeConflict(depName: string, data: any): Promise<any> {
    const versions = Array.from((data.versions as Map<string, any>).keys());
    const conflictType = this.classifyConflict(versions as string[]);
    const strategy = this.conflictStrategies.get(conflictType) || this.conflictStrategies.get('minor_version');

    const conflict: any = {
      id: this.generateId(),
      dependency: depName,
      conflictType,
      severity: strategy.severity,
      versions: this.formatVersions(data.versions),
      projects: Array.from(data.projects),
      recommendation: strategy.recommendation,
      description: strategy.description
    };

    if (this.config.settings?.generateADRs) {
      try {
        conflict.adr = await this.generateConflictADR(depName, data, strategy);
      } catch (error) {
        this.context.logger.warn(`Failed to generate ADR for ${depName}`, error);
      }
    }

    return conflict;
  }

  /**
   * Classify the type of version conflict
   */
  private classifyConflict(versions: string[]): string {
    const parsed = versions.map(v => this.parseVersion(v)).filter(Boolean);

    if (parsed.length < 2) return 'patch_version';

    const majorVersions = new Set(parsed.map(v => v!.major));
    const minorVersions = new Set(parsed.map(v => `${v!.major}.${v!.minor}`));

    if (majorVersions.size > 1) return 'major_version';
    if (minorVersions.size > 1) return 'minor_version';
    return 'patch_version';
  }

  /**
   * Parse semantic version string
   */
  private parseVersion(version: string): { major: number; minor: number; patch: number } | null {
    const cleanVersion = version.replace(/[\^~><= ]/g, '');
    const match = cleanVersion.match(/^(\d+)\.(\d+)\.(\d+)/);

    if (!match) return null;

    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }

  private formatVersions(versionsMap: Map<string, any[]>): any[] {
    const formatted: any[] = [];

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
  private async generateConflictADR(depName: string, data: any, strategy: any): Promise<string> {
    const versions = Array.from(data.versions.keys());
    
    return `# Architecture Decision Record: Standardize ${depName} Dependency

## Status
Proposed

## Context
Multiple versions of ${depName} are currently in use across the codebase:
${versions.map(v => `- ${v}`).join('\n')}

This creates potential compatibility issues and increases bundle size.

## Decision
${strategy.recommendation}

## Consequences
- Improved compatibility across projects
- Reduced bundle size
- Simplified dependency management
- May require code changes in some projects

## Implementation Plan
1. Audit all usages of ${depName}
2. Test compatibility with chosen version
3. Update all package.json files
4. Update any version-specific code
5. Verify all tests pass`;
  }

  private getSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  private generateSummary(conflicts: any[]): any {
    const severityBreakdown = conflicts.reduce((acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    }, {} as any);

    const conflictTypes = conflicts.reduce((acc, c) => {
      acc[c.conflictType] = (acc[c.conflictType] || 0) + 1;
      return acc;
    }, {} as any);

    return {
      totalConflicts: conflicts.length,
      severityBreakdown,
      conflictTypeBreakdown: conflictTypes,
      mostConflictedDependency: conflicts.length > 0 ? conflicts[0].dependency : null
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get scanning capabilities
   */
  getCapabilities(): any {
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

  async cleanup(): Promise<void> {
    this.dependencyMap.clear();
    this.context.logger.info('Dependency Scanner Plugin cleaned up');
  }
}

export default DependencyScannerPlugin;