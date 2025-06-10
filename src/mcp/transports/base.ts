/**
 * Base transport interface for MCP
 */

import { MCPRequest, MCPResponse, MCPNotification } from '../../utils/types.ts';

export type RequestHandler = (request: MCPRequest) => Promise<MCPResponse>;
export type NotificationHandler = (notification: MCPNotification) => Promise<void>;

export interface ITransport {
  start(): Promise<void>;
  stop(): Promise<void>;
  onRequest(handler: RequestHandler): void;
  onNotification?(handler: NotificationHandler): void;
  sendNotification?(notification: MCPNotification): Promise<void>;
  getHealthStatus(): Promise<{ 
    healthy: boolean; 
    error?: string; 
    metrics?: Record<string, number>;
  }>;
}