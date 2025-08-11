/**
 * Web Interface Exports - Refactored for Google Standards.
 *
 * Exports focused, single-responsibility modules following Google code standards.
 * Each module has a clear, descriptive name indicating its actual purpose.
 */
/**
 * @file Web module exports.
 */
export { type ApiConfig, ApiRouteHandler, type SystemStatus } from './api-route-handler.ts';
export { type DaemonConfig, DaemonProcessManager, type ProcessInfo, } from './daemon-process-manager.ts';
export { UnifiedPerformanceDashboard as SystemMetricsDashboard } from './system-metrics-dashboard.ts';
export { type WebConfig, WebInterfaceServer } from './web-interface-server.ts';
export { type WebSession, type WebSocketConfig, WebSocketCoordinator, } from './web-socket-coordinator.ts';
import type { WebConfig } from './web-interface-server.ts';
import { WebInterfaceServer } from './web-interface-server.ts';
export declare const createWebServer: (config?: WebConfig) => WebInterfaceServer;
export declare const startWebServer: (config?: WebConfig) => Promise<WebInterfaceServer>;
export declare const WEB_INTERFACE_VERSION = "2.0.0-alpha.73";
export declare const DEFAULT_WEB_PORT = 3000;
export declare const DEFAULT_API_PREFIX = "/api";
export declare const DEFAULT_WEB_ENDPOINT = "/web";
export declare const DEFAULT_MCP_ENDPOINT = "/mcp";
export default WebInterfaceServer;
//# sourceMappingURL=index.d.ts.map