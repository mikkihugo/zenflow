/**
 * @fileoverview Battle-hardened workspace analyzer for monorepo tools
 * Supports Nx, Bazel, Moon, Turbo, Rush, Lerna, Yarn/PNPM workspaces, and Nix
 */
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
    packageManager: 'npm|yarn|pnpm|bun;;
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
    type: 'depends|parallel;;
}
export type WorkspaceTool = '';
export type ProjectType = '';
export declare class WorkspaceAnalyzer {
    private logger;
    '': any;
    /**
     * Detect and analyze workspace configuration
     */
    analyzeWorkspace(rootPath: string, options?: AnalysisOptions): Promise<WorkspaceInfo>;
}
//# sourceMappingURL=workspace-analyzer.d.ts.map