/**
 * @file Unified Express Server for Claude-Zen
 * Consolidates all Express servers into one with organized routes.
 */
import express from 'express';
import type { Server as SocketIOServer } from 'socket.io';
export declare class UnifiedClaudeZenServer {
    private app;
    private server;
    private io?;
    private config;
    constructor();
    private buildServerConfig;
    initialize(): Promise<void>;
    private setupRoutes;
    private setupWebSocket;
    private getAllowedOrigins;
    start(): Promise<void>;
    stop(): Promise<void>;
    getApp(): express.Application;
    getServer(): any;
    getSocketIO(): SocketIOServer | undefined;
}
export declare const unifiedServer: UnifiedClaudeZenServer;
export { UnifiedClaudeZenServer as HTTPMCPServer };
export { UnifiedClaudeZenServer as WebInterfaceServer };
export { UnifiedClaudeZenServer as APIServer };
export { UnifiedClaudeZenServer as DashboardServer };
export default UnifiedClaudeZenServer;
//# sourceMappingURL=server.d.ts.map