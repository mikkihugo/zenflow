/**
 * @fileoverview Environment Detection Utilities
 *
 * Comprehensive environment and system detection utilities.
 */

import * as os from 'node:os';
import * as process from 'node:process';

/**
 * Environment detection utilities
 */
export function isDevelopment(): boolean {
  return process.env['NODE_ENV'] === 'development';
}

export function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

export function isTest(): boolean {
  return process.env['NODE_ENV'] === 'test';
}

export function getEnvironment():
  | 'development'
  | 'production'
  | 'test'
  | 'unknown' {
  const env = process.env['NODE_ENV'];
  if (env === 'development' || env === 'production' || env === 'test') {
    return env;
  }
  return 'unknown';
}

/**
 * System information utilities
 */
export function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    version: os.version(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    cpus: os.cpus(),
  };
}

export function getProcessInfo() {
  return {
    pid: process.pid,
    ppid: process.ppid,
    version: process.version,
    versions: process.versions,
    arch: process.arch,
    platform: process.platform,
    uptime: process.uptime(),
    cwd: process.cwd(),
    argv: process.argv,
    execPath: process.execPath,
    memoryUsage: process.memoryUsage(),
  };
}

export function getPlatform(): NodeJS.Platform {
  return process.platform;
}

export function getArchitecture(): string {
  return process.arch;
}

/**
 * Platform detection utilities
 */
export function isWindows(): boolean {
  return os.platform() === 'win32';
}

export function isMacOS(): boolean {
  return os.platform() === 'darwin';
}

export function isLinux(): boolean {
  return os.platform() === 'linux';
}

/**
 * Environment context detection
 */
export function isCI(): boolean {
  return !!(
    process.env['CI'] ||
    process.env['CONTINUOUS_INTEGRATION'] ||
    process.env['BUILD_NUMBER'] ||
    process.env['RUN_ID']
  );
}

export function isDocker(): boolean {
  try {
    const fs = require('node:fs');
    return (
      fs.existsSync('/.dockerenv') ||
      fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker')
    );
  } catch {
    return false;
  }
}

export function isWSL(): boolean {
  try {
    const fs = require('node:fs');
    const release = fs.readFileSync('/proc/version', 'utf8');
    return release.toLowerCase().includes('microsoft');
  } catch {
    return false;
  }
}

/**
 * Workspace detection
 */
export function getWorkspaceDetector() {
  return {
    isMonorepo: () => {
      try {
        const fs = require('node:fs');
        const path = require('node:path');
        return (
          fs.existsSync(path.join(process.cwd(), 'pnpm-workspace.yaml')) ||
          fs.existsSync(path.join(process.cwd(), 'yarn.lock')) ||
          fs.existsSync(path.join(process.cwd(), 'lerna.json'))
        );
      } catch {
        return false;
      }
    },
    hasPackageJson: () => {
      try {
        const fs = require('node:fs');
        const path = require('node:path');
        return fs.existsSync(path.join(process.cwd(), 'package.json'));
      } catch {
        return false;
      }
    },
  };
}

/**
 * System monitoring
 */
export function startMonitoring() {
  const logger = require('../../core/logging').getLogger('system:monitoring');

  return {
    start: () => {
      // Basic system monitoring implementation
      logger.info('System monitoring started');
    },
    stop: () => {
      logger.info('System monitoring stopped');
    },
  };
}

/**
 * System summary
 */
export function createSystemSummary() {
  return {
    environment: getEnvironment(),
    system: getSystemInfo(),
    process: getProcessInfo(),
    platform: {
      isWindows: isWindows(),
      isMacOS: isMacOS(),
      isLinux: isLinux(),
      isCI: isCI(),
      isDocker: isDocker(),
      isWSL: isWSL(),
    },
  };
}

/**
 * System requirements check
 */
export function checkSystemRequirements() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0] || '0', 10);

  return {
    nodeVersion: {
      current: nodeVersion,
      supported: majorVersion >= 18,
      minimum: '18.0.0',
    },
    platform: {
      supported: ['win32', 'darwin', 'linux'].includes(process.platform),
      current: process.platform,
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      sufficient: os.totalmem() > 1024 * 1024 * 1024, // 1GB minimum
    },
  };
}
