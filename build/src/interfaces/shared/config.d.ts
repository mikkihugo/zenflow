/**
 * @file Shared Interface Configuration.
 *
 * Interface-specific configuration utilities that integrate with the unified config system.
 */
import { type InterfaceConfig } from '../../config';
/**
 * Get interface configuration with fallbacks.
 *
 * @example
 */
export declare function getInterfaceConfig(): InterfaceConfig;
/**
 * Common interface constants derived from configuration.
 */
export declare const INTERFACE_CONSTANTS: {
    readonly DEFAULT_TIMEOUT: any;
    readonly DEFAULT_RETRY_ATTEMPTS: number;
    readonly DEFAULT_RETRY_DELAY: number;
    readonly MAX_COMMAND_HISTORY: any;
    readonly DEFAULT_PAGE_SIZE: any;
    readonly MIN_REFRESH_INTERVAL: number;
    readonly MAX_REFRESH_INTERVAL: number;
};
/**
 * Color scheme definitions for interfaces.
 */
export declare const COLOR_SCHEMES: {
    readonly dark: {
        readonly primary: "#00D9FF";
        readonly secondary: "#FF6B35";
        readonly success: "#28A745";
        readonly warning: "#FFC107";
        readonly error: "#DC3545";
        readonly background: "#1A1A1A";
        readonly surface: "#2D2D2D";
        readonly text: "#FFFFFF";
        readonly textSecondary: "#CCCCCC";
    };
    readonly light: {
        readonly primary: "#007BFF";
        readonly secondary: "#6C757D";
        readonly success: "#28A745";
        readonly warning: "#FFC107";
        readonly error: "#DC3545";
        readonly background: "#FFFFFF";
        readonly surface: "#F8F9FA";
        readonly text: "#212529";
        readonly textSecondary: "#6C757D";
    };
};
/**
 * Common validation patterns.
 */
export declare const VALIDATION_PATTERNS: {
    readonly projectName: RegExp;
    readonly command: RegExp;
    readonly filePath: RegExp;
    readonly swarmId: RegExp;
};
/**
 * Common error messages.
 */
export declare const ERROR_MESSAGES: {
    readonly INVALID_PROJECT_NAME: "Project name must start with a letter and contain only letters, numbers, hyphens, and underscores";
    readonly INVALID_COMMAND: "Command must start with a letter and contain only letters, numbers, hyphens, underscores, and colons";
    readonly INVALID_FILE_PATH: "File path contains invalid characters";
    readonly INVALID_SWARM_ID: "Swarm ID must contain only letters, numbers, and hyphens";
    readonly COMMAND_NOT_FOUND: "Command not found";
    readonly OPERATION_TIMEOUT: "Operation timed out";
    readonly OPERATION_FAILED: "Operation failed";
    readonly INSUFFICIENT_PERMISSIONS: "Insufficient permissions";
};
/**
 * Configuration utilities integrated with unified config system.
 *
 * @example
 */
export declare class ConfigurationUtils {
    /**
     * Merge configuration with current interface config.
     *
     * @param overrides
     */
    static mergeWithDefaults<T extends Partial<InterfaceConfig>>(overrides: T): T & InterfaceConfig;
    /**
     * Validate interface configuration.
     *
     * @param configOverrides
     */
    static validateConfig(configOverrides: Partial<InterfaceConfig>): string[];
    /**
     * Get color scheme for theme from configuration.
     *
     * @param theme
     */
    static getColorScheme(theme?: 'dark' | 'light' | 'auto'): typeof COLOR_SCHEMES.dark;
    /**
     * Update interface configuration at runtime.
     *
     * @param updates
     */
    static updateInterfaceConfig(updates: Partial<InterfaceConfig>): boolean;
    /**
     * Get current interface configuration with live updates.
     */
    static getCurrentConfig(): InterfaceConfig;
    /**
     * Listen for interface configuration changes.
     *
     * @param callback
     */
    static onConfigChange(callback: (config: InterfaceConfig) => void): () => void;
}
/**
 * Default export for backward compatibility.
 */
export declare const defaultInterfaceConfig: InterfaceConfig;
//# sourceMappingURL=config.d.ts.map