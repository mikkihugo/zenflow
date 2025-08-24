/**
 * @fileoverview Monorepo Detection using Industry-Standard Tools
 *
 * Uses established npm packages for reliable monorepo and project detection:
 * - find-workspaces: Comprehensive workspace detection
 * - @manypkg/find-root: Multi-tool monorepo root detection
 *
 * Supports all major monorepo tools and build systems.
 */

import * as fs from 'fs';
import * as path from 'path';

import { findRoot } from '@manypkg/find-root';
import { findWorkspaces } from 'find-workspaces';

import { getLogger } from '../../core/logging';

// Constants
const PACKAGE_JSON_FILE = 'package.json';

const logger = getLogger('monorepo-detector');

// Type for workspace information from find-workspaces package
interface WorkspaceInfo {
  location: string;
  name?: string;
  package?: {
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DetectedProject {
  name: string;
  path: string;
  type: 'app' | 'package' | 'lib' | 'service' | 'tool' | 'example' | 'test' | 'doc';
  framework?: string;
  language?: string;
  packageFile?: string;
}

export interface DetectedWorkspace {
  root: string;
  tool: 'yarn' | 'npm' | 'pnpm' | 'lerna' | 'rush' | 'bun' | 'bazel' | 'nx' | 'unknown';
  configFile?: string;
  projects: DetectedProject[];
  totalProjects: number;
}

/**
 * Workspace detector using industry-standard libraries
 */
export class WorkspaceDetector {
  /**
   * Detect monorepo workspace using @manypkg/find-root
   */
  async detectWorkspaceRoot(
    startPath: string = process.cwd(),
  ): Promise<DetectedWorkspace|null> {
    try {
      // Use @manypkg/find-root which supports Yarn, npm, Lerna, pnpm, Bun, Rush
      const result = await findRoot(startPath);

      if (!result) {
        logger.debug('No monorepo root found');
        return null;
      }

      const workspaceInfo: DetectedWorkspace = {
        root: result.rootDir,
        tool: this.detectWorkspaceTool(result.rootDir),
        configFile: this.findWorkspaceConfigFile(result.rootDir),
        projects: [],
        totalProjects: 0,
      };

      // Use find-workspaces to get all workspace packages
      const workspaces = await this.getWorkspacePackages(result.rootDir);
      workspaceInfo.projects = workspaces;
      workspaceInfo.totalProjects = workspaces.length;

      logger.info(
        `Detected ${workspaceInfo.tool} workspace with ${workspaceInfo.totalProjects} projects`,
      );
      return workspaceInfo;
    } catch (error) {
      logger.warn('Workspace detection failed:', error);
      return null;
    }
  }

  /**
   * Get workspace packages using find-workspaces
   */
  private async getWorkspacePackages(
    rootDir: string,
  ): Promise<DetectedProject[]> {
    try {
      // find-workspaces returns an array of workspace package info
      const workspaces = await findWorkspaces(rootDir);

      if (!workspaces||!Array.isArray(workspaces)) {
        return [];
      }

      return workspaces.map((workspace: WorkspaceInfo) => {
        const relativePath = path.relative(rootDir, workspace.location);
        const packageFile = this.detectProjectFile(workspace.location);
        const workspaceName =
          workspace.name||path.basename(workspace.location);
        const packageName = workspace.package?.name;

        return {
          name: packageName||workspaceName,
          path: relativePath,
          type: this.inferProjectType(relativePath, packageName),
          framework: this.detectFramework(workspace.location, packageFile),
          language: this.detectLanguage(workspace.location, packageFile),
          packageFile: packageFile,
        };
      });
    } catch (error) {
      logger.warn('Failed to get workspace packages:', error);
      return [];
    }
  }

  /**
   * Detect workspace tool from directory structure
   */
  private detectWorkspaceTool(rootDir: string): DetectedWorkspace['tool'] {
    const configFiles = [
      { file: 'pnpm-workspace.yaml', tool: 'pnpm' as const },
      { file: 'pnpm-workspace.yml', tool: 'pnpm' as const },
      { file: 'lerna.json', tool: 'lerna' as const },
      { file: 'rush.json', tool: 'rush' as const },
      { file: 'nx.json', tool: 'nx' as const },
      { file: 'workspace.json', tool: 'nx' as const },
      { file: 'bun.lockb', tool: 'bun' as const },
      { file: 'yarn.lock', tool: 'yarn' as const },
      { file: 'package-lock.json', tool: 'npm' as const },
      { file: 'WORKSPACE', tool: 'bazel' as const },
      { file: 'WORKSPACE.bazel', tool: 'bazel' as const },
    ];

    for (const { file, tool } of configFiles) {
      if (fs.existsSync(path.join(rootDir, file))) {
        return tool;
      }
    }

    // Check package.json for workspaces
    const packageJsonPath = path.join(rootDir, PACKAGE_JSON_FILE);
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8'),
        );
        if (packageJson.workspaces) {
          return 'npm'; // Default to npm if workspaces are defined but no specific tool detected
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    return 'unknown';
  }

  /**
   * Find workspace configuration file
   */
  private findWorkspaceConfigFile(rootDir: string): string|undefined {
    const configFiles = ['pnpm-workspace.yaml',
      'pnpm-workspace.yml',
      'lerna.json',
      'rush.json',
      'nx.json',
      'workspace.json',
      PACKAGE_JSON_FILE,
      'WORKSPACE',
      'WORKSPACE.bazel',
    ];

    for (const file of configFiles) {
      if (fs.existsSync(path.join(rootDir, file))) {
        return file;
      }
    }

    return undefined;
  }

  /**
   * Detect project file for a directory
   */
  private detectProjectFile(projectDir: string): string|undefined {
    const projectFiles = [
      PACKAGE_JSON_FILE, // Node.js/TypeScript/React Native'Cargo.toml', // Rust
      'go.mod', // Go
      'build.gradle', // Android
      'build.gradle.kts', // Android (Kotlin DSL)
      'app.json', // React Native/Expo
      'expo.json', // Expo
      'Podfile', // iOS (CocoaPods)
      'project.pbxproj', // iOS (Xcode)
    ];

    for (const file of projectFiles) {
      if (fs.existsSync(path.join(projectDir, file))) {
        return file;
      }
    }

    return undefined;
  }

  /**
   * Detect framework from project directory
   */
  private detectFramework(
    projectDir: string,
    packageFile?: string,
  ): string|undefined {
    if (!packageFile||packageFile !== PACKAGE_JSON_FILE) {
      return undefined;
    }

    try {
      const packageJsonPath = path.join(projectDir, PACKAGE_JSON_FILE);
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath,'utf8'));

      // Check dependencies for framework indicators
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (deps['next']) {
        return 'Next';
      }
      if (deps['react-native']) {
        return 'React Native';
      }
      if (deps['expo']) {
        return 'Expo';
      }
      if (deps['@angular/core']) {
        return 'Angular';
      }
      if (deps['vue']) {
        return 'Vue';
      }
      if (deps['svelte']) {
        return 'Svelte';
      }
      if (deps['nuxt']) {
        return 'Nuxt';
      }
      if (deps['gatsby']) {
        return 'Gatsby';
      }
      if (deps['react']) {
        return 'React';
      }
      if (deps['express']) {
        return 'Express';
      }
      if (deps['fastify']) {
        return 'Fastify';
      }
      if (deps['nest']) {
        return 'NestJS';
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Detect language from project directory
   */
  private detectLanguage(
    _projectDir: string,
    packageFile?: string,
  ): string|undefined {
    if (!packageFile) {
      return undefined;
    }

    const languageMap = {
      PACKAGE_JSON_FILE:'TypeScript', // Default for JS/TS projects
      'Cargo.toml': 'Rust',
      'go.mod': 'Go',
      'build.gradle': 'Kotlin',
      'build.gradle.kts': 'Kotlin',
    };

    return languageMap[packageFile as keyof typeof languageMap];
  }

  /**
   * Infer project type from path and name
   */
  private inferProjectType(
    relativePath: string,
    name?: string,
  ): DetectedProject['type'] {
    const pathLower = relativePath.toLowerCase();
    const nameLower = name?.toLowerCase()||'';

    // Path-based detection
    if (pathLower.includes('apps/')||pathLower.startsWith('apps/')) {
      return 'app';
    }
    if (pathLower.includes('packages/')||pathLower.startsWith('packages/')) {
      return 'package';
    }
    if (pathLower.includes('libs/')||pathLower.startsWith('libs/')) {
      return 'lib';
    }
    if (pathLower.includes('services/')||pathLower.startsWith('services/')) {
      return 'service';
    }
    if (pathLower.includes('tools/')||pathLower.startsWith('tools/')) {
      return 'tool';
    }
    if (pathLower.includes('examples/')||pathLower.startsWith('examples/')) {
      return 'example';
    }
    if (pathLower.includes('test')||pathLower.includes('spec')) {
      return 'test';
    }
    if (pathLower.includes('docs/')||pathLower.includes('documentation/')) {
      return 'doc';
    }

    // Name-based detection
    if (nameLower.includes('service')) {
      return 'service';
    }
    if (nameLower.includes('app')) {
      return 'app';
    }
    if (nameLower.includes('lib')) {
      return 'lib';
    }
    if (nameLower.includes('tool')) {
      return 'tool';
    }
    if (nameLower.includes('example')) {
      return 'example';
    }
    if (nameLower.includes('test')) {
      return 'test';
    }
    if (nameLower.includes('doc')) {
      return 'doc';
    }

    // Default fallback
    return 'package';
  }

  /**
   * Get project statistics
   */
  getProjectStats(workspace: DetectedWorkspace): {
    byType: Record<string, number>;
    byLanguage: Record<string, number>;
    byFramework: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};
    const byFramework: Record<string, number> = {};

    for (const project of workspace.projects) {
      byType[project.type] = (byType[project.type] || 0) + 1;

      if (project.language) {
        byLanguage[project.language] = (byLanguage[project.language] || 0) + 1;
      }

      if (project.framework) {
        byFramework[project.framework] =
          (byFramework[project.framework] || 0) + 1;
      }
    }

    return { byType, byLanguage, byFramework };
  }
}

// Singleton instance
let globalDetector: WorkspaceDetector | null = null;

export function getWorkspaceDetector(): WorkspaceDetector {
  if (!globalDetector) {
    globalDetector = new WorkspaceDetector();
  }
  return globalDetector;
}

export default WorkspaceDetector;
