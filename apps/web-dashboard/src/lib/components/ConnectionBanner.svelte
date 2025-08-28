<script lang="ts">
import { onDestroy, onMount } from "svelte";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { webSocketManager } from "$lib/websocket";

// Accept connection status store as prop
export const connectionStatus: Writable<{
	connected: boolean;
	lastCheck: Date | null;
	retrying: boolean;
}> = writable({
	connected: true,
	lastCheck: null,
	retrying: false,
});

let retryTimeout: number;
let unsubscribeConnectionState: (() => void) | null = null;

// Use existing Socket.IO WebSocket connection - no polling needed!
function setupConnectionMonitoring() {
	// Subscribe to the existing WebSocket connection state
	unsubscribeConnectionState = webSocketManager.connectionState.subscribe(
		(state) => {
			console.log(
				state.connected
					? "✅ Socket.IO connected"
					: "❌ Socket.IO disconnected",
			);
			connectionStatus.update((currentState) => ({
				...currentState,
				connected: state.connected,
				lastCheck: new Date(),
				retrying: state.reconnecting,
			}));
		},
	);

	// Set initial state from existing WebSocket manager
	connectionStatus.update((state) => ({
		...state,
		connected: webSocketManager.isConnected(),
		lastCheck: new Date(),
		retrying: false,
	}));
}

async function _retryConnection() {
	connectionStatus.update((state) => ({ ...state, retrying: true }));

	// Show retry state briefly, then attempt reconnection using existing Socket.IO
	setTimeout(async () => {
		try {
			// Use the existing WebSocket manager's reconnection
			if (!webSocketManager.isConnected()) {
				await webSocketManager.connect();
			}
			// Send a ping to verify connection
			webSocketManager.ping();
		} catch (error) {
			console.warn("Retry connection failed:", error);
			// Connection status will be updated automatically via Socket.IO events
		}
	}, 2000);
}

onMount(() => {
	setupConnectionMonitoring();
});

onDestroy(() => {
	if (retryTimeout) clearTimeout(retryTimeout);
	if (unsubscribeConnectionState) unsubscribeConnectionState();
});

$: status = $connectionStatus;
</script>

{#if !status.connected}
  <div class="bg-orange-500 text-white px-4 py-3 shadow-sm border-b border-orange-600 fixed w-full z-50" 
       style="top: 4rem;">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">⚡ API Disconnected</span>
        </div>
        <div class="text-orange-100 text-sm">
          Backend server unavailable - showing limited data
          {#if status.lastCheck}
            <span class="ml-2 opacity-75">
              Last checked: {status.lastCheck.toLocaleTimeString()}
            </span>
          {/if}
        </div>
      </div>
      
      <button
        on:click={_retryConnection}
        disabled={status.retrying}
        class="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-700 disabled:opacity-50 
               text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
               flex items-center space-x-2 min-w-[100px] justify-center"
      >
        {#if status.retrying}
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Retrying...</span>
        {:else}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Retry</span>
        {/if}
      </button>
    </div>
  </div>
{/if}

<style>
  /* Additional custom animations can be added here if needed */
</style>