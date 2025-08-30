/**
 * @fileoverview System Utilities Module Exports
 *
 * System detection and capability utilities.
 */

export * from './capability.provider.js';
export {
  checkSystemRequirements,
  createSystemSummary,
  getArchitecture,
  getEnvironment,
  getPlatform,
  getProcessInfo,
  getSystemInfo,
  getWorkspaceDetector,
  isCI,
  isDevelopment,
  isDocker,
  isLinux,
  isMacOS,
  isProduction,
  isTest,
  isWindows,
  isWSL,
  startMonitoring,
} from './environment';
export type {
  DetectedProject,
  DetectedWorkspace,
} from './monorepo.detector.js';
// Specific exports to avoid conflicts
export {
  getWorkspaceDetector as getWorkspaceDetectorFromMonorepo,
  WorkspaceDetector,
} from './monorepo.detector';
