/**
 * WebSocket Store for Real-time Dashboard Updates
 *
 * Connects to the existing WebSocket system and provides reactive updates
 * for all dashboard components. Handles reconnection and error management.
 */

import { writable, derived } from 'svelte/store';

import type {
  WebSocketMessage,
  WebSocketStore,
  SystemStatus,
  SwarmInfo,
  PerformanceMetrics,
} from './types/dashboard';

// import { browser } from '$app/environment'; // SvelteKit environment - handled by build system
const browser = typeof window !== 'undefined'); // Browser environment detection

// Create the main WebSocket store
function createWebSocketStore() {
  const { subscribe, set, update } = writable<WebSocketStore>({
    connected: false,
    socket: null,
    lastMessage: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
  });

  let socket: WebSocket'' | ''null = null;
  let reconnectTimer: NodeJS.Timeout'' | ''null = null;

  // Connect to the existing WebSocket server
  function connect(url ='ws://localhost:3000') {
    if (!browser) return;

    console.log('🔌 Connecting to WebSocket:', url);

    try {
      socket = new WebSocket(url);

      socket.onopen = () => {
        console.log('✅ WebSocket connected');
        update((state) => ({
          ...state,
          connected: true,
          socket,
          reconnectAttempts: 0,
        }));

        // Subscribe to channels that the existing system provides
        send({ type: 'subscribe, channel: system' });
        send({ type: 'subscribe, channel: swarms' });
        send({ type: 'subscribe, channel: performance' });
        send({ type: 'subscribe, channel: tasks' });
        send({ type: 'subscribe, channel: logs' });
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', message.type, message.data);

          update((state) => ({
            ...state,
            lastMessage: { ...message, timestamp: new Date() },
          }));

          // Route messages to appropriate stores
          routeMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        update((state) => ({
          ...state,
          connected: false,
          socket: null,
        }));

        // Attempt to reconnect
        scheduleReconnect();
      };

      socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        update((state) => ({
          ...state,
          connected: false,
        }));
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      scheduleReconnect();
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    socket?.close()
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
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message:', message);
    }
  }

  function scheduleReconnect() {
    update((state) => {
      if (state.reconnectAttempts < state.maxReconnectAttempts) {
        const delay = Math.min(
          1000 * Math.pow(2, state.reconnectAttempts),
          30000
        );
        console.log(
          `🔄 Scheduling reconnect in ${delay}ms (attempt ${state.reconnectAttempts + 1})`
        );

        reconnectTimer = setTimeout(() => {
          connect();
        }, delay);

        return { ...state, reconnectAttempts: state.reconnectAttempts + 1 };
      } else {
        console.error('❌ Max reconnect attempts reached');
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
  version: '2..0-alpha.44',
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
  switch (message.type) {
    case 'system:status':
      systemStore.update((current) => ({
        ...current,
        ...message.data,
        lastUpdated: new Date(),
      }));
      break;

    case 'swarm:update':
    case 'swarm:created':
    case 'swarm:stopped':
      if (Array.isArray(message.data)) {
        swarmsStore.set(message.data);
      } else {
        swarmsStore.update((swarms) => {
          const index = swarms.findIndex((s) => s.id === message.data.id);
          if (index >= 0) {
            swarms[index] = { ...swarms[index], ...message.data };
          } else {
            swarms.push(message.data);
          }
          return swarms;
        });
      }
      break;

    case 'performance:update':
      performanceStore.update((current) => ({
        ...current,
        ...message.data,
      }));
      break;

    case 'task:created':
    case 'task:updated':
    case 'task:completed':
      tasksStore.update((tasks) => {
        const index = tasks.findIndex((t) => t.id === message.data.id);
        if (index >= 0) {
          tasks[index] = { ...tasks[index], ...message.data };
        } else {
          tasks.unshift(message.data);
        }
        return tasks.slice(0, 10); // Keep only recent 10 tasks
      });
      break;

    case 'logs:new':
      logsStore.update((logs) => {
        logs.unshift({
          ...message.data,
          timestamp: new Date(),
        });
        return logs.slice(0, 100); // Keep only recent 100 logs
      });
      break;

    default:
      console.log('🤷 Unhandled WebSocket message type:', message.type);
  }
}

// Create and export the WebSocket store
export const websocketStore = createWebSocketStore();

// Derived stores for computed values
export const connectionStatus = derived(websocketStore, ($ws) =>
  $ws.connected ? 'connected' : 'disconnected'
);

export const lastUpdateTime = derived(
  [systemStore, performanceStore],
  ([$system, $performance]) => {
    return $system.lastUpdated || new Date();
  }
);

// Auto-connect when the store is first used
if (browser) {
  websocketStore?.connect()
}
