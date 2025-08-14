export { ApiRouteHandler, } from './api-route-handler.ts';
export { DaemonProcessManager, } from './daemon-process-manager.ts';
export { UnifiedPerformanceDashboard as SystemMetricsDashboard } from './system-metrics-dashboard.ts';
export { WebInterfaceServer } from './web-interface-server.ts';
export { WebSocketCoordinator, } from './web-socket-coordinator.ts';
import { WebInterfaceServer } from './web-interface-server.ts';
export const createWebServer = (config) => {
    return new WebInterfaceServer(config);
};
export const startWebServer = async (config) => {
    const server = new WebInterfaceServer(config);
    await server.start();
    return server;
};
export const WEB_INTERFACE_VERSION = '2.0.0-alpha.73';
export const DEFAULT_WEB_PORT = 3000;
export const DEFAULT_API_PREFIX = '/api';
export const DEFAULT_WEB_ENDPOINT = '/web';
export const DEFAULT_MCP_ENDPOINT = '/mcp';
export default WebInterfaceServer;
//# sourceMappingURL=index.js.map