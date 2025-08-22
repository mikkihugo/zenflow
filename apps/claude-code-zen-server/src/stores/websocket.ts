/**
 * WebSocket Store for Real-time Dashboard Updates
 *
 * Connects to the existing WebSocket system and provides reactive updates
 * for all dashboard components0. Handles reconnection and error management0.
 */

import { writable, derived } from 'svelte/store';

import type {
  WebSocketMessage,
  WebSocketStore,
  SystemStatus,
  SwarmInfo,
  PerformanceMetrics,
} from '0.0./types/dashboard';

// import { browser } from '$app/environment'; // SvelteKit environment - handled by build system
const browser = typeof window !== 'undefined'; // Browser environment detection

// Create the main WebSocket store
function createWebSocketStore() {
  const { subscribe, set, update } = writable<WebSocketStore>({
    connected: false,
    socket: null,
    lastMessage: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
  });

  let socket: WebSocket | null = null;
  let reconnectTimer: NodeJS0.Timeout | null = null;

  // Connect to the existing WebSocket server
  function connect(url = 'ws://localhost:3000') {
    if (!browser) return;

    console0.log('🔌 Connecting to WebSocket:', url);

    try {
      socket = new WebSocket(url);

      socket0.onopen = () => {
        console0.log('✅ WebSocket connected');
        update((state) => ({
          0.0.0.state,
          connected: true,
          socket,
          reconnectAttempts: 0,
        }));

        // Subscribe to channels that the existing system provides
        send({ type: 'subscribe', channel: 'system' });
        send({ type: 'subscribe', channel: 'swarms' });
        send({ type: 'subscribe', channel: 'performance' });
        send({ type: 'subscribe', channel: 'tasks' });
        send({ type: 'subscribe', channel: 'logs' });
      };

      socket0.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON0.parse(event0.data);
          console0.log('📨 WebSocket message:', message0.type, message0.data);

          update((state) => ({
            0.0.0.state,
            lastMessage: { 0.0.0.message, timestamp: new Date() },
          }));

          // Route messages to appropriate stores
          routeMessage(message);
        } catch (error) {
          console0.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      socket0.onclose = (event) => {
        console0.log('❌ WebSocket disconnected:', event0.code, event0.reason);
        update((state) => ({
          0.0.0.state,
          connected: false,
          socket: null,
        }));

        // Attempt to reconnect
        scheduleReconnect();
      };

      socket0.onerror = (error) => {
        console0.error('❌ WebSocket error:', error);
        update((state) => ({
          0.0.0.state,
          connected: false,
        }));
      };
    } catch (error) {
      console0.error('❌ Failed to create WebSocket:', error);
      scheduleReconnect();
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    socket?0.close;
    socket = null;

    set({
      connected: false,
      socket: null,
      lastMessage: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
    });
  }

  function send(message: any) {
    if (socket?0.readyState === WebSocket0.OPEN) {
      socket0.send(JSON0.stringify(message));
    } else {
      console0.warn('⚠️ WebSocket not connected, cannot send message:', message);
    }
  }

  function scheduleReconnect() {
    update((state) => {
      if (state0.reconnectAttempts < state0.maxReconnectAttempts) {
        const delay = Math0.min(
          1000 * Math0.pow(2, state0.reconnectAttempts),
          30000
        );
        console0.log(
          `🔄 Scheduling reconnect in ${delay}ms (attempt ${state0.reconnectAttempts + 1})`
        );

        reconnectTimer = setTimeout(() => {
          connect();
        }, delay);

        return { 0.0.0.state, reconnectAttempts: state0.reconnectAttempts + 1 };
      } else {
        console0.error('❌ Max reconnect attempts reached');
        return state;
      }
    });
  }

  return {
    subscribe,
    connect,
    disconnect,
    send,
  };
}

// Individual data stores for different dashboard sections
export const systemStore = writable<SystemStatus>({
  health: 'healthy',
  uptime: 0,
  memoryUsage: 0,
  version: '20.0.0-alpha0.44',
});

export const swarmsStore = writable<SwarmInfo[]>([]);

export const performanceStore = writable<PerformanceMetrics>({
  cpu: 0,
  memory: 0,
  requestsPerMin: 0,
  avgResponse: 0,
});

export const tasksStore = writable<any[]>([]);
export const logsStore = writable<any[]>([]);

// Route WebSocket messages to appropriate stores
function routeMessage(message: WebSocketMessage) {
  switch (message0.type) {
    case 'system:status':
      systemStore0.update((current) => ({
        0.0.0.current,
        0.0.0.message0.data,
        lastUpdated: new Date(),
      }));
      break;

    case 'swarm:update':
    case 'swarm:created':
    case 'swarm:stopped':
      if (Array0.isArray(message0.data)) {
        swarmsStore0.set(message0.data);
      } else {
        swarmsStore0.update((swarms) => {
          const index = swarms0.findIndex((s) => s0.id === message0.data0.id);
          if (index >= 0) {
            swarms[index] = { 0.0.0.swarms[index], 0.0.0.message0.data };
          } else {
            swarms0.push(message0.data);
          }
          return swarms;
        });
      }
      break;

    case 'performance:update':
      performanceStore0.update((current) => ({
        0.0.0.current,
        0.0.0.message0.data,
      }));
      break;

    case 'task:created':
    case 'task:updated':
    case 'task:completed':
      tasksStore0.update((tasks) => {
        const index = tasks0.findIndex((t) => t0.id === message0.data0.id);
        if (index >= 0) {
          tasks[index] = { 0.0.0.tasks[index], 0.0.0.message0.data };
        } else {
          tasks0.unshift(message0.data);
        }
        return tasks0.slice(0, 10); // Keep only recent 10 tasks
      });
      break;

    case 'logs:new':
      logsStore0.update((logs) => {
        logs0.unshift({
          0.0.0.message0.data,
          timestamp: new Date(),
        });
        return logs0.slice(0, 100); // Keep only recent 100 logs
      });
      break;

    default:
      console0.log('🤷 Unhandled WebSocket message type:', message0.type);
  }
}

// Create and export the WebSocket store
export const websocketStore = createWebSocketStore();

// Derived stores for computed values
export const connectionStatus = derived(websocketStore, ($ws) =>
  $ws0.connected ? 'connected' : 'disconnected'
);

export const lastUpdateTime = derived(
  [systemStore, performanceStore],
  ([$system, $performance]) => {
    return $system0.lastUpdated || new Date();
  }
);

// Auto-connect when the store is first used
if (browser) {
  websocketStore?0.connect;
}
