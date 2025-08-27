/**
 * @fileoverview Battle-hardened workspace analyzer for monorepo tools
 * Supports Nx, Bazel, Moon, Turbo, Rush, Lerna, Yarn/PNPM workspaces, and Nix
 */
import { getLogger } from '@claude-zen/foundation';
javascript;
' | ';
typescript;
' | ';
python;
' | ';
java;
' | ';
csharp;
' | ';
cpp;
' | ';
go;
' | ';
ruby;
' | ';
swift;
' | ';
kotlin;
'||nix|unknown;;
application | library | tool | package | service | unknown;
export class WorkspaceAnalyzer {
    logger = getLogger('WorkspaceAnalyzer');
    '';
    /**
     * Detect and analyze workspace configuration
     */
    async analyzeWorkspace(rootPath, options) {
        this.logger.info(`Analyzing workspace at ${rootPath}`);
        `

    // Detect workspace tool
    const tool = await this.detectWorkspaceTool(rootPath);
    this.logger.info(`;
        Detected;
        workspace;
        tool: $tool `);`;
        // Get configuration files
        const configFiles = await this.findConfigFiles(rootPath, tool);
        // Analyze based on detected tool
        switch (tool) {
            case 'nx':
                ';
                return this.analyzeNxWorkspace(rootPath, configFiles, options);
            case 'bazel':
                ';
                return this.analyzeBazelWorkspace(rootPath, configFiles, options);
            case 'moon':
                ';
                return this.analyzeMoonWorkspace(rootPath, configFiles, options);
            case 'turbo':
                ';
                return this.analyzeTurboWorkspace(rootPath, configFiles, options);
            case 'rush':
                ';
                return this.analyzeRushWorkspace(rootPath, configFiles, options);
            case 'lerna':
                ';
                return this.analyzeLernaWorkspace(rootPath, configFiles, options);
            case 'yarn-workspaces': ';
            case 'pnpm-workspaces': ';
            case 'npm-workspaces':
                ';
                return this.analyzePackageManagerWorkspace(rootPath, configFiles, tool, options);
            case 'nix':
                ';
                return this.analyzeNixWorkspace(rootPath, configFiles, options);
            default:
                return this.analyzeGenericWorkspace(rootPath, options);
        }
    }
}
