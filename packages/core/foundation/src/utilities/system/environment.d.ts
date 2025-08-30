/**
 * @fileoverview Environment Detection Utilities
 *
 * Comprehensive environment and system detection utilities.
 */
import * as os from 'node:os';
/**
 * Environment detection utilities
 */
export declare function isDevelopment(): boolean;
export declare function isProduction(): boolean;
export declare function isTest(): boolean;
export declare function getEnvironment():
  | 'development'
  | 'production'
  | 'test'
  | 'unknown';
/**
 * System information utilities
 */
export declare function getSystemInfo(): {
  platform: NodeJS.Platform;
  arch: string;
  release: string;
  version: string;
  hostname: string;
  uptime: number;
  loadavg: number[];
  totalmem: number;
  freemem: number;
  cpus: os.CpuInfo[];
};
export declare function getProcessInfo(): {
  pid: number;
  ppid: number;
  version: string;
  versions: NodeJS.ProcessVersions;
  arch: NodeJS.Architecture;
  platform: NodeJS.Platform;
  uptime: number;
  cwd: string;
  argv: string[];
  execPath: string;
  memoryUsage: NodeJS.MemoryUsage;
};
export declare function getPlatform(): NodeJS.Platform;
export declare function getArchitecture(): string;
/**
 * Platform detection utilities
 */
export declare function isWindows(): boolean;
export declare function isMacOS(): boolean;
export declare function isLinux(): boolean;
/**
 * Environment context detection
 */
export declare function isCI(): boolean;
export declare function isDocker(): boolean;
export declare function isWSL(): boolean;
/**
 * Workspace detection
 */
export declare function getWorkspaceDetector(): {
  isMonorepo: () => any;
  hasPackageJson: () => any;
};
/**
 * System monitoring
 */
export declare function startMonitoring(): {
  start: () => void;
  stop: () => void;
};
/**
 * System summary
 */
export declare function createSystemSummary(): {
  environment: 'development' | 'production' | 'test' | 'unknown';
  system: {
    platform: NodeJS.Platform;
    arch: string;
    release: string;
    version: string;
    hostname: string;
    uptime: number;
    loadavg: number[];
    totalmem: number;
    freemem: number;
    cpus: os.CpuInfo[];
  };
  process: {
    pid: number;
    ppid: number;
    version: string;
    versions: NodeJS.ProcessVersions;
    arch: NodeJS.Architecture;
    platform: NodeJS.Platform;
    uptime: number;
    cwd: string;
    argv: string[];
    execPath: string;
    memoryUsage: NodeJS.MemoryUsage;
  };
  platform: {
    isWindows: boolean;
    isMacOS: boolean;
    isLinux: boolean;
    isCI: boolean;
    isDocker: boolean;
    isWSL: boolean;
  };
};
/**
 * System requirements check
 */
export declare function checkSystemRequirements(): {
  nodeVersion: {
    current: string;
    supported: boolean;
    minimum: string;
  };
  platform: {
    supported: boolean;
    current: NodeJS.Platform;
  };
  memory: {
    total: number;
    free: number;
    sufficient: boolean;
  };
};
//# sourceMappingURL=environment.d.ts.map
