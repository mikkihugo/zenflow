/**
 * @fileoverview System Utilities Module Exports
 *
 * System detection and capability utilities.
 */

// Specific exports to avoid conflicts
export { 
  WorkspaceDetector,
  getWorkspaceDetector as getWorkspaceDetectorFromMonorepo
} from './monorepo.detector';

export type {
  DetectedProject,
  DetectedWorkspace
} from './monorepo.detector';

export * from './capability.provider';

export {
  isDevelopment,
  isProduction,
  isTest,
  getEnvironment,
  getSystemInfo,
  getProcessInfo,
  getPlatform,
  getArchitecture,
  isWindows,
  isMacOS,
  isLinux,
  isCI,
  isDocker,
  isWSL,
  getWorkspaceDetector,
  startMonitoring,
  createSystemSummary,
  checkSystemRequirements
} from './environment';