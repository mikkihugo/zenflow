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
} from './api-route-handler.ts';
export {
  type DaemonConfig,
  DaemonProcessManager,
  type ProcessInfo,
} from './daemon-process-manager.ts';
// Performance dashboard (renamed from unified-performance-dashboard.ts)
export { UnifiedPerformanceDashboard as SystemMetricsDashboard } from './system-metrics-dashboard.ts';
// Main web server (renamed from web-interface.ts)
export { type WebConfig, WebInterfaceServer } from './web-interface-server.ts';
// Focused modules (newly created)
export {
  type WebSession,
  type WebSocketConfig,
  WebSocketCoordinator,
} from './web-socket-coordinator.ts';

// Import the types for internal use
import type { WebConfig } from './web-interface-server.ts';
import { WebInterfaceServer } from './web-interface-server.ts';

// Re-export convenience functions
export const createWebServer = (config?: WebConfig) => {
  return new WebInterfaceServer(config);
};

export const startWebServer = async (config?: WebConfig) => {
  const server = new WebInterfaceServer(config);
  await server.start();
  return server;
};

// Version and constants
export const WEB_INTERFACE_VERSION = '2.0.0-alpha.73';
export const DEFAULT_WEB_PORT = 3000; // Changed from 3456 to 3000
export const DEFAULT_API_PREFIX = '/api';
export const DEFAULT_WEB_ENDPOINT = '/web';
export const DEFAULT_MCP_ENDPOINT = '/mcp';

// Default web interface for backwards compatibility
export default WebInterfaceServer;
