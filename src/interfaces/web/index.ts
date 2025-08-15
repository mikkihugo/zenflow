/**
 * Web Interface Exports - Refactored for Google Standards.
 *
 * Exports focused, single-responsibility modules following Google code standards.
 * Each module has a clear, descriptive name indicating its actual purpose.
 */
/**
 * @file Web module exports.
 */

export {
  type ApiConfig,
  ApiRouteHandler,
  type SystemStatus,
} from './api-route-handler';
export {
  type DaemonConfig,
  DaemonProcessManager,
  type ProcessInfo,
} from './daemon-process-manager';
// Performance dashboard (renamed from unified-performance-dashboard.ts)
export { UnifiedPerformanceDashboard as SystemMetricsDashboard } from './system-metrics-dashboard';
// Main web server (using working web-interface.ts)
export { type WebConfig, WebInterface } from './web-interface';
// Focused modules (newly created)
export {
  type WebSession,
  type WebSocketConfig,
  WebSocketCoordinator,
} from './web-socket-coordinator';

// Import the types for internal use
import type { WebConfig } from './web-interface';
import { WebInterface } from './web-interface';

// Re-export convenience functions
export const createWebServer = (config?: WebConfig) => {
  return new WebInterface(config);
};

export const startWebServer = async (config?: WebConfig) => {
  const server = new WebInterface(config);
  await server.run();
  return server;
};

// Version and constants
import { getVersion } from '../../config/version';
export const WEB_INTERFACE_VERSION = getVersion();
export const DEFAULT_WEB_PORT = 3000; // Changed from 3456 to 3000
export const DEFAULT_API_PREFIX = '/api';
export const DEFAULT_WEB_ENDPOINT = '/web';
export const DEFAULT_MCP_ENDPOINT = '/mcp';

// Default web interface for backwards compatibility
export default WebInterface;
