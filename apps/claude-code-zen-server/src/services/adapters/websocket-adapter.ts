// WebSocket Adapter - delegates to canonical WebSocketManager

import type { Server as SocketIOServer } from 'socket.io';
import {
  WebSocketManager,
  type WebConfig,
  type WebDataService,
} from '../../infrastructure/websocket/socket.manager';

export type WebSocketAdapter = WebSocketManager;

export async function createWebSocketAdapter(
  io: SocketIOServer,
  config: WebConfig,
  dataService: WebDataService
): Promise<WebSocketAdapter> {
  const manager = new WebSocketManager(io, config, dataService);
  manager.setupWebSocket();
  return manager;
}