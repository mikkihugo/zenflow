/**
 * @file WebSocket store for real-time communication
 * 
 * Provides reactive WebSocket connection management for the web dashboard
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface WebSocketState {
  connected: boolean;
  socket: WebSocket | null;
  error: string | null;
}

const initialState: WebSocketState = {
  connected: false,
  socket: null,
  error: null
};

function createWebSocketStore() {
  const { subscribe, set, update } = writable<WebSocketState>(initialState);

  let reconnectTimer: NodeJS.Timeout | null = null;
  const RECONNECT_DELAY = 3000;

  function connect(url?: string) {
    if (!browser) return;

    const wsUrl = url || `ws://localhost:3000/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        update(state => ({
          ...state,
          connected: true,
          socket,
          error: null
        }));
        
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      socket.onclose = () => {
        update(state => ({
          ...state,
          connected: false,
          socket: null
        }));
        
        // Auto-reconnect
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            connect(url);
          }, RECONNECT_DELAY);
        }
      };

      socket.onerror = (error) => {
        update(state => ({
          ...state,
          error: `WebSocket error: ${error}`,
          connected: false
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle incoming messages
          console.log('WebSocket message:', data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

    } catch (error) {
      update(state => ({
        ...state,
        error: `Failed to connect: ${error}`,
        connected: false
      }));
    }
  }

  function disconnect() {
    update(state => {
      if (state.socket) {
        state.socket.close();
      }
      return {
        ...state,
        connected: false,
        socket: null
      };
    });
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function send(data: any) {
    update(state => {
      if (state.socket && state.connected) {
        state.socket.send(JSON.stringify(data));
      }
      return state;
    });
  }

  return {
    subscribe,
    connect,
    disconnect,
    send
  };
}

export const websocketStore = createWebSocketStore();