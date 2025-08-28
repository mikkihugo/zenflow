/**
 * @fileoverview Monorepo Detection using Industry-Standard Tools
 *
 * Uses established npm packages for reliable monorepo and project detection:
 * - find-workspaces:Comprehensive workspace detection
 * - @manypkg/find-root:Multi-tool monorepo root detection
 *
 * Supports all major monorepo tools and build systems.
 */
export interface DetectedProject {
    name: string;
    path: string;
    type: "app" | "package" | "lib" | "service" | "tool" | "example" | "test" | "doc";
    framework?: string;
    language?: string;
    packageFile?: string;
}
export interface DetectedWorkspace {
    root: string;
    tool: "yarn" | "npm" | "pnpm" | "lerna" | "rush" | "bun" | "bazel" | "nx" | "unknown";
    configFile?: string;
    projects: DetectedProject[];
    totalProjects: number;
}
/**
 * Workspace detector using industry-standard libraries
 */
export declare class WorkspaceDetector {
    /**
     * Detect monorepo workspace using @manypkg/find-root
     */
    detectWorkspaceRoot(startPath?: string): Promise<DetectedWorkspace | null>;
    /**
     * Get workspace packages using find-workspaces
     */
    private getWorkspacePackages;
    /**
     * Detect workspace tool from directory structure
     */
    private detectWorkspaceTool;
    /**
     * Find workspace configuration file
     */
    private findWorkspaceConfigFile;
    /**
     * Detect project file for a directory
     */
    private detectProjectFile;
    /**
     * Detect framework from project directory
     */
    private detectFramework;
    private findFrameworkInDependencies;
    /**
     * Detect language from project directory
     */
    private detectLanguage;
    /**
     * Infer project type from path and name
     */
    private inferProjectType;
    private detectTypeFromPath;
    private detectTypeFromName;
    /**
     * Get project statistics
     */
    getProjectStats(workspace: DetectedWorkspace): {
        byType: Record<string, number>;
        byLanguage: Record<string, number>;
        byFramework: Record<string, number>;
    };
}
export declare function getWorkspaceDetector(): WorkspaceDetector;
export default WorkspaceDetector;
//# sourceMappingURL=monorepo.detector.d.ts.map