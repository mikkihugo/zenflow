/**
 * @file Coordination system: remote.
 */
interface RemoteWrapperOptions {
    workingDir?: string;
    packageName?: string;
    [key: string]: any;
}
declare class RemoteWrapperGenerator {
    private workingDir;
    private packageName;
    constructor(options?: RemoteWrapperOptions);
    /**
     * Generate bash wrapper script for Unix-like systems.
     */
    generateBashWrapper(): string;
    /**
     * Generate Windows batch wrapper script.
     */
    generateBatchWrapper(): string;
    /**
     * Generate PowerShell wrapper script.
     */
    generatePowerShellWrapper(): string;
    /**
     * Generate Claude helper scripts.
     */
    generateClaudeHelpers(): any;
    /**
     * Create all wrapper scripts.
     */
    createWrappers(): Promise<{
        success: boolean;
        files: string[];
    }>;
    /**
     * Create Claude helper scripts.
     */
    createClaudeHelpers(): Promise<{
        success: boolean;
        files: string[];
    }>;
    /**
     * Create all remote scripts.
     */
    createAll(): Promise<any>;
}
export { RemoteWrapperGenerator };
//# sourceMappingURL=remote.d.ts.map