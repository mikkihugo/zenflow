/**
 * @fileoverview System utilities - Consolidated system detection and environment utilities
 * @module utilities/system
 *
 * Provides comprehensive system utilities including platform detection, process information,
 * monorepo detection, system capabilities, and environment validation.
 */
import * as os from "node:os";
import * as process from "node:process";
import { displaySystemStatus, getCapabilityScores, getSystemCapabilityData, startSystemMonitoring, } from "./system/capability.provider.js";
import { WorkspaceDetector, } from "./system/monorepo.detector.js";
// Re-export available functions from capability provider
export { createHealthDataProviders, displaySystemStatus, getCapabilityScores, getInstallationSuggestions, getSystemCapabilityData, startSystemMonitoring, } from "./system/capability.provider.js";
// Re-export system modules for convenience
export { WorkspaceDetector } from "./system/monorepo.detector.js";
/**
 * Get current platform with normalization
 *
 * @returns Normalized platform name
 *
 * @example
 * ```typescript
 * const platform = getPlatform();
 * console.log(platform); // 'darwin', 'linux', 'win32', etc.
 * ```
 */
export function getPlatform() {
    const { platform } = process;
    // Handle known platforms
    if (["win32", "darwin", "linux", "freebsd", "openbsd", "aix", "sunos"].includes(platform)) {
        return platform;
    }
    // Check for Android (common in Node.js environments)
    const { env } = process;
    if (platform === "linux" && env['ANDROID_ROOT']) {
        return "android";
    }
    return "unknown";
}
/**
 * Get system architecture with normalization
 *
 * @returns Normalized architecture name
 *
 * @example
 * ```typescript
 * const arch = getArchitecture();
 * console.log(arch); // 'x64', 'arm64', etc.
 * ```
 */
export function getArchitecture() {
    const { arch } = process;
    // Handle known architectures
    if (["x64", "arm64", "ia32", "arm", "ppc64", "s390x", "mips"].includes(arch)) {
        return arch;
    }
    return "unknown";
}
/**
 * Check if running on Windows
 *
 * @returns True if running on Windows
 *
 * @example
 * ```typescript
 * if (isWindows()) {
 *   // Windows-specific logic
 * }
 * ```
 */
export function isWindows() {
    return getPlatform() === "win32";
}
/**
 * Check if running on macOS
 *
 * @returns True if running on macOS
 *
 * @example
 * ```typescript
 * if (isMacOS()) {
 *   // macOS-specific logic
 * }
 * ```
 */
export function isMacOS() {
    return getPlatform() === "darwin";
}
/**
 * Check if running on Linux
 *
 * @returns True if running on Linux
 *
 * @example
 * ```typescript
 * if (isLinux()) {
 *   // Linux-specific logic
 * }
 * ```
 */
export function isLinux() {
    return getPlatform() === "linux";
}
/**
 * Check if running in CI environment
 *
 * @returns True if running in CI
 *
 * @example
 * ```typescript
 * if (isCI()) {
 *   console.log('Running in CI environment');
 * }
 * ```
 */
export function isCI() {
    return !!(process.env['CI'] ||
        process.env['CONTINUOUS_INTEGRATION'] ||
        process.env['BUILD_NUMBER'] ||
        process.env['GITHUB_ACTIONS'] ||
        process.env['TRAVIS'] ||
        process.env['CIRCLECI'] ||
        process.env['JENKINS_URL'] ||
        process.env['GITLAB_CI'] ||
        process.env['BUILDKITE'] ||
        process.env['DRONE']);
}
/**
 * Check if running in Docker container
 *
 * @returns True if running in Docker
 *
 * @example
 * ```typescript
 * if (isDocker()) {
 *   console.log('Running in Docker container');
 * }
 * ```
 */
export function isDocker() {
    try {
        // Check for .dockerenv file
        const fs = require("node:fs");
        if (fs.existsSync("/.dockerenv")) {
            return true;
        }
        // Check for Docker-specific cgroup entries
        if (fs.existsSync("/proc/1/cgroup")) {
            const cgroup = fs.readFileSync("/proc/1/cgroup", "utf8");
            return cgroup.includes("docker") || cgroup.includes("containerd");
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Check if running in WSL (Windows Subsystem for Linux)
 *
 * @returns True if running in WSL
 *
 * @example
 * ```typescript
 * if (isWSL()) {
 *   console.log('Running in WSL');
 * }
 * ```
 */
export function isWSL() {
    if (!isLinux()) {
        return false;
    }
    try {
        const fs = require("node:fs");
        // Check for WSL-specific files
        if (fs.existsSync("/proc/version")) {
            const version = fs.readFileSync("/proc/version", "utf8").toLowerCase();
            return version.includes("microsoft") || version.includes("wsl");
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Get environment type from NODE_ENV and other indicators
 *
 * @returns Environment type
 *
 * @example
 * ```typescript
 * const env = getEnvironment();
 * if (env === 'production') {
 *   // Production-specific configuration
 * }
 * ```
 */
export function getEnvironment() {
    const nodeEnv = process.env['NODE_ENV']?.toLowerCase();
    // Direct NODE_ENV mapping
    if (nodeEnv === "production")
        return "production";
    if (nodeEnv === "development" || nodeEnv === "dev")
        return "development";
    if (nodeEnv === "test")
        return "test";
    if (nodeEnv === "staging")
        return "staging";
    if (nodeEnv === "preview")
        return "preview";
    // Infer from other environment variables
    if (process.env['VERCEL_ENV'] === "production" ||
        (process.env['NETLIFY'] && process.env['CONTEXT'] === "production")) {
        return "production";
    }
    if (process.env['VERCEL_ENV'] === "preview" ||
        (process.env['NETLIFY'] && process.env['CONTEXT'] === "deploy-preview")) {
        return "preview";
    }
    if (process.env['VERCEL_ENV'] === "development" ||
        (process.env['NETLIFY'] && process.env['CONTEXT'] === "dev")) {
        return "development";
    }
    // CI environments usually indicate production-like environments
    if (isCI()) {
        return "production";
    }
    // Default to development if no clear indicators
    return nodeEnv ? "unknown" : "development";
}
/**
 * Check if running in development environment
 *
 * @returns True if in development mode
 *
 * @example
 * ```typescript
 * if (isDevelopment()) {
 *   // Development-only features
 * }
 * ```
 */
export function isDevelopment() {
    return getEnvironment() === "development";
}
/**
 * Check if running in production environment
 *
 * @returns True if in production mode
 *
 * @example
 * ```typescript
 * if (isProduction()) {
 *   // Production optimizations
 * }
 * ```
 */
export function isProduction() {
    return getEnvironment() === "production";
}
/**
 * Check if running in test environment
 *
 * @returns True if in test mode
 *
 * @example
 * ```typescript
 * if (isTest()) {
 *   // Test-specific setup
 * }
 * ```
 */
export function isTest() {
    return getEnvironment() === "test";
}
/**
 * Get comprehensive system information
 *
 * @returns System information object
 *
 * @example
 * ```typescript
 * const sysInfo = getSystemInfo();
 * console.log(`Running on ${sysInfo.platform} ${sysInfo.arch} with ${sysInfo.cpuCount} CPUs`);
 * ```
 */
export function getSystemInfo() {
    const platform = getPlatform();
    const arch = getArchitecture();
    // Calculate memory in GB
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const totalMemoryGB = Math.round((totalMemory / 1024 ** 3) * 100) / 100;
    const availableMemoryGB = Math.round((freeMemory / 1024 ** 3) * 100) / 100;
    return {
        platform,
        arch,
        nodeVersion: process.version,
        osVersion: os.release(),
        cpuCount: os.cpus().length,
        totalMemoryGB,
        availableMemoryGB,
        hostname: os.hostname(),
        username: os.userInfo().username,
        homeDir: os.homedir(),
        tempDir: os.tmpdir(),
        isCI: isCI(),
        isDocker: isDocker(),
        isWSL: isWSL(),
    };
}
/**
 * Get current process information
 *
 * @returns Process information object
 *
 * @example
 * ```typescript
 * const procInfo = getProcessInfo();
 * console.log(`Process ${procInfo.pid} running for ${procInfo.uptime}s`);
 * ```
 */
export function getProcessInfo() {
    return {
        pid: process.pid,
        ppid: process.ppid || 0,
        title: process.title,
        argv: process.argv,
        execPath: process.execPath,
        cwd: process.cwd(),
        env: process.env,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
    };
}
/**
 * Get workspace detection instance
 *
 * @returns WorkspaceDetector instance
 *
 * @example
 * ```typescript
 * const detector = getWorkspaceDetector();
 * const workspace = await detector.detectWorkspaceRoot();
 * if (workspace) {
 *   console.log(`Found ${workspace.tool} workspace with ${workspace.totalProjects} projects`);
 * }
 * ```
 */
export function getWorkspaceDetector() {
    return new WorkspaceDetector();
}
/**
 * Detect monorepo workspace in current directory
 *
 * @param startPath - Starting directory path (defaults to current working directory)
 * @returns Detected workspace information or null
 *
 * @example
 * ```typescript
 * const workspace = await detectWorkspace();
 * if (workspace) {
 *   console.log(`Detected ${workspace.tool} monorepo with ${workspace.totalProjects} projects`);
 * } else {
 *   console.log('No monorepo detected');
 * }
 * ```
 */
export function detectWorkspace(startPath) {
    const detector = getWorkspaceDetector();
    return detector.detectWorkspaceRoot(startPath);
}
/**
 * Get system capabilities and health information
 *
 * @returns System capability data
 *
 * @example
 * ```typescript
 * const capabilities = await getSystemCapabilities();
 * console.log(`System health: ${capabilities.systemHealthScore}%`);
 * console.log(`Available packages: ${capabilities.availablePackages}/${capabilities.totalPackages}`);
 * ```
 */
export function getSystemCapabilities() {
    return Promise.resolve(getSystemCapabilityData());
}
/**
 * Display system status information to console
 *
 * @example
 * ```typescript
 * await showSystemStatus();
 * // Outputs detailed system status with colors and emojis
 * ```
 */
export function showSystemStatus() {
    return displaySystemStatus();
}
/**
 * Start system monitoring for status changes
 *
 * @example
 * ```typescript
 * startMonitoring();
 * // Begins logging system events and status changes
 * ```
 */
export function startMonitoring() {
    startSystemMonitoring();
}
/**
 * Get capability scores for different system areas
 *
 * @returns Record of capability area names to scores
 *
 * @example
 * ```typescript
 * const scores = await getCapabilityScoreMap();
 * console.log('Intelligence capability:', scores.intelligence);
 * console.log('Infrastructure capability:', scores.infrastructure);
 * ```
 */
export function getCapabilityScoreMap() {
    return getCapabilityScores();
}
/**
 * Create a formatted system summary for logging or display
 *
 * @returns Formatted system summary string
 *
 * @example
 * ```typescript
 * const summary = createSystemSummary();
 * console.log(summary);
 * // Outputs: "Linux x64 (Node.js v18.17.0) - 8 CPUs, 16.0GB RAM - Development"
 * ```
 */
export function createSystemSummary() {
    const info = getSystemInfo();
    const env = getEnvironment();
    let summary = `${info.platform} ${info.arch} (Node.js ${info.nodeVersion}) - ${info.cpuCount} CPUs, ${info.totalMemoryGB}GB RAM - ${env}`;
    const indicators = [];
    if (info.isCI)
        indicators.push("CI");
    if (info.isDocker)
        indicators.push("Docker");
    if (info.isWSL)
        indicators.push("WSL");
    if (indicators.length > 0) {
        summary += ` (${indicators.join(", ")})`;
    }
    return summary;
}
/**
 * Check if current system meets minimum requirements
 *
 * @param requirements - Minimum system requirements
 * @returns True if requirements are met
 *
 * @example
 * ```typescript
 * const meetsRequirements = checkSystemRequirements({
 *   nodeVersion: '18.0.0',
 *   totalMemoryGB: 8,
 *   cpuCount: 4
 * });
 *
 * if (!meetsRequirements) {
 *   console.warn('System does not meet minimum requirements');
 * }
 * ```
 */
export function checkSystemRequirements(requirements) {
    const info = getSystemInfo();
    // Check Node.js version
    if (requirements.nodeVersion) {
        const currentVersion = process.version.replace("v", "");
        const requiredVersion = requirements.nodeVersion.replace("v", "");
        // Simple version comparison (assumes semantic versioning)
        const currentParts = currentVersion.split(".").map(Number);
        const requiredParts = requiredVersion.split(".").map(Number);
        const currentMajor = currentParts[0] ?? 0;
        const currentMinor = currentParts[1] ?? 0;
        const requiredMajor = requiredParts[0] ?? 0;
        const requiredMinor = requiredParts[1] ?? 0;
        if (currentMajor < requiredMajor ||
            (currentMajor === requiredMajor && currentMinor < requiredMinor)) {
            return false;
        }
    }
    // Check memory
    if (requirements.totalMemoryGB &&
        info.totalMemoryGB < requirements.totalMemoryGB) {
        return false;
    }
    // Check CPU count
    if (requirements.cpuCount && info.cpuCount < requirements.cpuCount) {
        return false;
    }
    // Check platform support
    if (requirements.supportedPlatforms &&
        !requirements.supportedPlatforms.includes(info.platform)) {
        return false;
    }
    return true;
}
