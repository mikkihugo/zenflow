/**
 * Version Configuration - Dynamic version reading from package.json
 *
 * Provides a centralized way to get the application version at runtime.
 * Falls back to a hardcoded version if package.json reading fails.
 */
/**
 * Get the application version from package.json
 */
export declare function getVersion(): string;
/**
 * Export version as constant for backward compatibility
 */
export declare const VERSION: string;
/**
 * Export default
 */
declare const _default: {
    getVersion: typeof getVersion;
    VERSION: string;
    FALLBACK_VERSION: string;
};
export default _default;
//# sourceMappingURL=version.d.ts.map