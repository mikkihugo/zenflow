/**
 * @fileoverview Battle-hardened workspace analyzer for monorepo tools
 * Supports Nx, Bazel, Moon, Turbo, Rush, Lerna, Yarn/PNPM workspaces, and Nix
 */

import { getLogger } from '@claude-zen/foundation';

import type { AnalysisOptions } from '../types/index.js';

export interface WorkspaceInfo {
  tool: WorkspaceTool;
  rootPath: string;
  configFiles: string[];
  projects: WorkspaceProject[];
  dependencies: WorkspaceDependency[];
  buildTargets: BuildTarget[];
  metadata: WorkspaceMetadata;
}

export interface WorkspaceProject {
  name: string;
  path: string;
  type: ProjectType;
  language: string[];
  framework?: string;
  dependencies: string[];
  devDependencies: string[];
  targets: BuildTarget[];
  tags?: string[];
  metadata: Record<string, any>;
}

export interface WorkspaceDependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  workspace?: string;
  external: boolean;
}

export interface BuildTarget {
  name: string;
  executor?: string;
  command?: string;
  script?: string;
  dependsOn?: string[];
  inputs?: string[];
  outputs?: string[];
  cache?: boolean;
  metadata: Record<string, any>;
}

export interface WorkspaceMetadata {
  packageManager: 'npm|yarn|pnpm|bun;
  nodeVersion?: string;
  lockFile?: string;
  totalProjects: number;
  totalDependencies: number;
  buildGraph: ProjectGraph;
  taskGraph: TaskGraph;
}

export interface ProjectGraph {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
}

export interface ProjectNode {
  id: string;
  name: string;
  type: ProjectType;
  data: Record<string, any>;
}

export interface ProjectEdge {
  source: string;
  target: string;
  type: 'static' | 'dynamic' | 'implicit';
}

export interface TaskGraph {
  tasks: TaskNode[];
  dependencies: TaskDependency[];
}

export interface TaskNode {
  id: string;
  target: string;
  project: string;
  command: string;
}

export interface TaskDependency {
  source: string;
  target: string;
  type: 'depends|parallel;
}

export type WorkspaceTool =|''javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||nix|unknown;

export type ProjectType =|''application|library|tool|package|service|unknown;

export class WorkspaceAnalyzer {
  private logger = getLogger('WorkspaceAnalyzer');''

  /**
   * Detect and analyze workspace configuration
   */
  async analyzeWorkspace(
    rootPath: string,
    options?: AnalysisOptions
  ): Promise<WorkspaceInfo> {
    this.logger.info(`Analyzing workspace at ${rootPath}`);`

    // Detect workspace tool
    const tool = await this.detectWorkspaceTool(rootPath);
    this.logger.info(`Detected workspace tool: $tool`);`

    // Get configuration files
    const configFiles = await this.findConfigFiles(rootPath, tool);

    // Analyze based on detected tool
    switch (tool) {
      case 'nx':'
        return this.analyzeNxWorkspace(rootPath, configFiles, options);
      case 'bazel':'
        return this.analyzeBazelWorkspace(rootPath, configFiles, options);
      case 'moon':'
        return this.analyzeMoonWorkspace(rootPath, configFiles, options);
      case 'turbo':'
        return this.analyzeTurboWorkspace(rootPath, configFiles, options);
      case 'rush':'
        return this.analyzeRushWorkspace(rootPath, configFiles, options);
      case 'lerna':'
        return this.analyzeLernaWorkspace(rootPath, configFiles, options);
      case 'yarn-workspaces':'
      case 'pnpm-workspaces':'
      case 'npm-workspaces':'
        return this.analyzePackageManagerWorkspace(
          rootPath,
          configFiles,
          tool,
          options
        );
      case 'nix':'
        return this.analyzeNixWorkspace(rootPath, configFiles, options);
      default:
        return this.analyzeGenericWorkspace(rootPath, options);
    }
  }
