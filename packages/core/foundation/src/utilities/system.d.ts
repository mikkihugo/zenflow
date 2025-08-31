/**
 * @fileoverview System utilities - Consolidated system detection and environment utilities
 * @module utilities/system
 *
 * Provides comprehensive system utilities including platform detection, process information,
 * monorepo detection, system capabilities, and environment validation.
 */
import { type SystemCapabilityData } from './system/capability.provider.js';
import { type DetectedWorkspace, WorkspaceDetector } from './system/monorepo.detector.js';
export { createHealthDataProviders, displaySystemStatus, getCapabilityScores, getInstallationSuggestions, getSystemCapabilityData, startSystemMonitoring, } from './system/capability.provider.js';
export type { DetectedWorkspace } from './system/monorepo.detector.js';
export { WorkspaceDetector } from './system/monorepo.detector.js';
/**
 * Platform types
 */
export type Platform = 'win32' | 'darwin' | 'linux' | 'freebsd' | 'openbsd' | 'android' | 'aix' | 'sunos' | 'unknown';
/**
 * Architecture types
 */
export type Architecture = 'x64' | 'arm64' | 'ia32' | 'arm' | 'ppc64' | 's390x' | 'mips' | 'unknown';
/**
 * System information interface
 */
export interface SystemInfo {
    platform: Platform;
    arch: Architecture;
    nodeVersion: string;
    osVersion: string;
    cpuCount: number;
    totalMemoryGB: number;
    availableMemoryGB: number;
    hostname: string;
    username: string;
    homeDir: string;
    tempDir: string;
    isCI: boolean;
    isDocker: boolean;
    isWSL: boolean;
}
/**
 * Process information interface
 */
export interface ProcessInfo {
    pid: number;
    ppid: number;
    title: string;
    argv: string[];
    execPath: string;
    cwd: string;
    env: Record<string, string | undefined>;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
}
/**
 * Environment type
 */
export type EnvironmentType = 'development' | 'production' | 'test' | 'staging' | 'preview' | 'unknown';
/**
 * Get current platform with normalization
 *
 * @returns Normalized platform name
 *
 * @example
 * '''typescript'
 * const platform = getPlatform();
 * logger.info(platform); // 'darwin',    'linux',    'win32', etc.
 * '
 */
export declare function getPlatform(): Platform;
/**
 * Get system architecture with normalization
 *
 * @returns Normalized architecture name
 *
 * @example
 * '''typescript'
 * const arch = getArchitecture();
 * logger.info(arch); // 'x64',    'arm64', etc.
 * '
 */
export declare function getArchitecture(): Architecture;
/**
 * Check if running on Windows
 *
 * @returns True if running on Windows
 *
 * @example
 * '''typescript'
 * if (isWindows()) {
 *   // Windows-specific logic
 *}
 * '
 */
export declare function isWindows(): boolean;
/**
 * Check if running on macOS
 *
 * @returns True if running on macOS
 *
 * @example
 * '''typescript'
 * if (isMacOS()) {
 *   // macOS-specific logic
 *}
 * '
 */
export declare function isMacOS(): boolean;
/**
 * Check if running on Linux
 *
 * @returns True if running on Linux
 *
 * @example
 * '''typescript'
 * if (isLinux()) {
 *   // Linux-specific logic
 *}
 * '
 */
export declare function isLinux(): boolean;
/**
 * Check if running in CI environment
 *
 * @returns True if running in CI
 *
 * @example
 * '''typescript'
 * if (isCI()) {
 *   logger.info('Running in CI environment');
 *}
 * '
 */
export declare function isCI(): boolean;
/**
 * Check if running in Docker container
 *
 * @returns True if running in Docker
 *
 * @example
 * '''typescript'
 * if (isDocker()) {
 *   logger.info('Running in Docker container');
 *}
 * '
 */
export declare function isDocker(): boolean;
/**
 * Check if running in WSL (Windows Subsystem for Linux)
 *
 * @returns True if running in WSL
 *
 * @example
 * '''typescript'
 * if (isWSL()) {
 *   logger.info('Running in WSL');
 *}
 * '
 */
export declare function isWSL(): boolean;
/**
 * Get environment type from NODE_ENV and other indicators
 *
 * @returns Environment type
 *
 * @example
 * '''typescript'
 * const env = getEnvironment();
 * if (env === 'production') {
 *   // Production-specific configuration
 *}
 * '
 */
export declare function getEnvironment(): EnvironmentType;
/**
 * Check if running in development environment
 *
 * @returns True if in development mode
 *
 * @example
 * '''typescript'
 * if (isDevelopment()) {
 *   // Development-only features
 *}
 * '
 */
export declare function isDevelopment(): boolean;
/**
 * Check if running in production environment
 *
 * @returns True if in production mode
 *
 * @example
 * '''typescript'
 * if (isProduction()) {
 *   // Production optimizations
 *}
 * '
 */
export declare function isProduction(): boolean;
/**
 * Check if running in test environment
 *
 * @returns True if in test mode
 *
 * @example
 * '''typescript'
 * if (isTest()) {
 *   // Test-specific setup
 *}
 * '
 */
export declare function isTest(): boolean;
/**
 * Get comprehensive system information
 *
 * @returns System information object
 *
 * @example
 * '''typescript'
 * const sysInfo = getSystemInfo();
 * logger.info('Running on ${sysInfo.platform} ${sysInfo.arch} with ' + sysInfo.cpuCount + ' CPUs');
 * '
 */
export declare function getSystemInfo(): SystemInfo;
/**
 * Get current process information
 *
 * @returns Process information object
 *
 * @example
 * '''typescript'
 * const procInfo = getProcessInfo();
 * logger.info('Process ' + procInfo.pid + ' running for ' + procInfo.uptime + 's');
 * '
 */
export declare function getProcessInfo(): ProcessInfo;
/**
 * Get workspace detection instance
 *
 * @returns WorkspaceDetector instance
 *
 * @example
 * '''typescript'
 * const detector = getWorkspaceDetector();
 * const workspace = await detector.detectWorkspaceRoot();
 * if (workspace) {
 *   logger.info('Found ${workspace.tool} workspace with ' + workspace.totalProjects + ' projects');
 *}
 * '
 */
export declare function getWorkspaceDetector(): WorkspaceDetector;
/**
 * Detect monorepo workspace in current directory
 *
 * @param startPath - Starting directory path (defaults to current working directory)
 * @returns Detected workspace information or null
 *
 * @example
 * '''typescript'
 * const workspace = await detectWorkspace();
 * if (workspace) {
 *   logger.info('Detected ' + workspace.tool + ' monorepo with ' + workspace.totalProjects + ' projects');
 *} else {
 *   logger.info('No monorepo detected');
 *}
 * '
 */
export declare function detectWorkspace(startPath?: string): Promise<DetectedWorkspace | null>;
/**
 * Get system capabilities and health information
 *
 * @returns System capability data
 *
 * @example
 * '''typescript'
 * const capabilities = await getSystemCapabilities();
 * logger.info('System health:' + capabilities.systemHealthScore + '%');
 * logger.info('Available packages:${capabilities.availablePackages}/' + capabilities.totalPackages);
 * '
 */
export declare function getSystemCapabilities(): Promise<SystemCapabilityData>;
/**
 * Display system status information to console
 *
 * @example
 * '''typescript'
 * await showSystemStatus();
 * // Outputs detailed system status with colors and emojis
 * '
 */
export declare function showSystemStatus(): Promise<void>;
/**
 * Start system monitoring for status changes
 *
 * @example
 * '''typescript'
 * startMonitoring();
 * // Begins logging system events and status changes
 * '
 */
export declare function startMonitoring(): void;
/**
 * Get capability scores for different system areas
 *
 * @returns Record of capability area names to scores
 *
 * @example
 * '''typescript'
 * const scores = await getCapabilityScoreMap();
 * logger.info('Intelligence capability: ', scores.intelligence);
' * logger.info('Infrastructure capability: ', scores.infrastructure);
' * '
 */
export declare function getCapabilityScoreMap(): Promise<Record<string, number>>;
/**
 * Create a formatted system summary for logging or display
 *
 * @returns Formatted system summary string
 *
 * @example
 * '''typescript'
 * const summary = createSystemSummary();
 * logger.info(summary);
 * // Outputs:"Linux x64 (Node.js v18.17.0) - 8 CPUs, 16.0GB RAM - Development"
 * '
 */
export declare function createSystemSummary(): string;
/**
 * Check if current system meets minimum requirements
 *
 * @param requirements - Minimum system requirements
 * @returns True if requirements are met
 *
 * @example
 * '''typescript'
 * const meetsRequirements = checkSystemRequirements({
 *   nodeVersion: '18.0.0', *   totalMemoryGB:8,
 *   cpuCount:4
 *});
 *
 * if (!meetsRequirements) {
 *   logger.warn('System does not meet minimum requirements');
 *}
 * '
 */
export declare function checkSystemRequirements(requirements: {
    nodeVersion?: string;
    totalMemoryGB?: number;
    cpuCount?: number;
    supportedPlatforms?: Platform[];
}): boolean;
//# sourceMappingURL=system.d.ts.map