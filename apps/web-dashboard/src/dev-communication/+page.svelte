<!--
  @component Development Communication Hub
  Central hub for developer-system communication and coordination
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Communication state
  const messages = writable([]);
  const currentMessage = writable('');
  const systemStatus = writable('ready');
  const activeAgents = writable([]);

  // Communication types
  const communicationTypes = [
    { id: 'direct', name: '💬 Direct Command', desc: 'Direct system commands and queries' },
    { id: 'coordination', name: '🤝 Agent Coordination', desc: 'Multi-agent task coordination' },
    { id: 'analysis', name: '🔍 Code Analysis', desc: 'Deep code analysis requests' },
    { id: 'planning', name: '📋 Project Planning', desc: 'Strategic planning and roadmapping' },
    { id: 'debugging', name: '🐛 Debug Session', desc: 'Interactive debugging assistance' },
    { id: 'review', name: '👁️ Code Review', desc: 'Comprehensive code review requests' }
  ];

  let selectedType = 'direct';
  let messageHistory = [];
  let isProcessing = false;

  onMount(async () => {
    // Load message history
    await loadMessageHistory();
    // Connect to system status
    await connectSystemStatus();
  });

  async function loadMessageHistory() {
    try {
      const response = await fetch('/api/dev-communication/history');
      if (response.ok) {
        messageHistory = await response.json();
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
    }
  }

  async function connectSystemStatus() {
    // WebSocket connection for real-time status
    try {
      const response = await fetch('/api/system/status');
      if (response.ok) {
        const status = await response.json();
        systemStatus.set(status.status);
        activeAgents.set(status.activeAgents || []);
      }
    } catch (error) {
      console.error('Failed to connect to system status:', error);
    }
  }

  async function sendMessage() {
    if (!$currentMessage.trim() || isProcessing) return;
    
    isProcessing = true;
    const message = {
      id: Date.now(),
      type: selectedType,
      content: $currentMessage,
      timestamp: new Date().toISOString(),
      status: 'processing'
    };

    messageHistory = [...messageHistory, message];
    currentMessage.set('');

    try {
      const response = await fetch('/api/dev-communication/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          message: message.content,
          requestId: message.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        message.status = 'completed';
        message.response = result.response;
        message.agents = result.assignedAgents;
      } else {
        message.status = 'error';
        message.error = 'Communication failed';
      }
    } catch (error) {
      message.status = 'error';
      message.error = error.message;
    }

    messageHistory = [...messageHistory];
    isProcessing = false;
  }

  async function clearHistory() {
    messageHistory = [];
    try {
      await fetch('/api/dev-communication/clear', { method: 'POST' });
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'processing': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
  }
</script>

<svelte:head>
  <title>Dev Communication - Claude Code Zen</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Header -->
  <div class="bg-gray-800 border-b border-gray-700 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-blue-400 mb-2">💬 Development Communication Hub</h1>
      <p class="text-gray-300">Direct communication interface with the Claude Code Zen system</p>
      
      <!-- System Status -->
      <div class="mt-4 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full {$systemStatus === 'ready' ? 'bg-green-400' : 'bg-yellow-400'}"></div>
          <span class="text-sm">System: {$systemStatus}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm">Active Agents: {$activeAgents.length}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Communication Interface -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Message Input -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">📝 New Communication</h2>
        
        <!-- Communication Type Selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Communication Type</label>
          <select bind:value={selectedType} class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
            {#each communicationTypes as type}
              <option value={type.id}>{type.name}</option>
            {/each}
          </select>
          <p class="text-sm text-gray-400 mt-1">
            {communicationTypes.find(t => t.id === selectedType)?.desc || ''}
          </p>
        </div>

        <!-- Message Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Message</label>
          <textarea
            bind:value={$currentMessage}
            placeholder="Describe what you need help with, the task to coordinate, or the analysis to perform..."
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-32 resize-none"
            disabled={isProcessing}
          ></textarea>
        </div>

        <!-- Send Button -->
        <div class="flex justify-between items-center">
          <button
            on:click={sendMessage}
            disabled={!$currentMessage.trim() || isProcessing}
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isProcessing ? '⏳ Processing...' : '🚀 Send Communication'}
          </button>
          
          <button
            on:click={clearHistory}
            class="text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
            🗑️ Clear History
          </button>
        </div>
      </div>

      <!-- Message History -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">📜 Communication History</h2>
        
        <div class="space-y-4 max-h-96 overflow-y-auto">
          {#each messageHistory.slice().reverse() as message}
            <div class="bg-gray-700 rounded-lg p-4 border-l-4 {message.status === 'completed' ? 'border-green-400' : message.status === 'error' ? 'border-red-400' : 'border-yellow-400'}">
              <!-- Message Header -->
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">
                    {communicationTypes.find(t => t.id === message.type)?.name || message.type}
                  </span>
                  <span class="text-xs {getStatusColor(message.status)}">
                    {message.status}
                  </span>
                </div>
                <span class="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
              </div>

              <!-- Original Message -->
              <div class="mb-3">
                <p class="text-sm text-gray-300">{message.content}</p>
              </div>

              <!-- System Response -->
              {#if message.response}
                <div class="bg-gray-600 rounded p-3 mt-2">
                  <p class="text-sm text-green-300 font-medium mb-1">System Response:</p>
                  <p class="text-sm text-gray-200">{message.response}</p>
                  
                  {#if message.agents && message.agents.length > 0}
                    <div class="mt-2">
                      <p class="text-xs text-gray-400">Assigned Agents:</p>
                      <div class="flex flex-wrap gap-1 mt-1">
                        {#each message.agents as agent}
                          <span class="bg-blue-600 text-xs px-2 py-1 rounded">{agent}</span>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}

              <!-- Error Display -->
              {#if message.error}
                <div class="bg-red-900/30 rounded p-3 mt-2 border border-red-600">
                  <p class="text-sm text-red-300">Error: {message.error}</p>
                </div>
              {/if}
            </div>
          {/each}
          
          {#if messageHistory.length === 0}
            <div class="text-center py-8 text-gray-500">
              <p>No communications yet. Start a conversation with the system!</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Quick Actions -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
        <div class="space-y-2">
          <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
            🔍 System Health Check
          </button>
          <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
            🐝 Initialize New Swarm
          </button>
          <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
            📊 Performance Analysis
          </button>
          <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
            🔧 Debug Current Task
          </button>
          <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
            📋 Generate Status Report
          </button>
        </div>
      </div>

      <!-- Active Agents -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">🤖 Active Agents</h3>
        <div class="space-y-2">
          {#each $activeAgents as agent}
            <div class="flex items-center justify-between bg-gray-700 p-2 rounded">
              <span class="text-sm">{agent.name}</span>
              <span class="text-xs text-green-400">{agent.status}</span>
            </div>
          {/each}
          
          {#if $activeAgents.length === 0}
            <p class="text-sm text-gray-500">No active agents</p>
          {/if}
        </div>
      </div>

      <!-- Communication Tips -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">💡 Communication Tips</h3>
        <div class="space-y-3 text-sm text-gray-300">
          <div>
            <p class="font-medium text-blue-400">Be Specific:</p>
            <p>Provide clear context and expected outcomes</p>
          </div>
          <div>
            <p class="font-medium text-green-400">Use Examples:</p>
            <p>Include code snippets or file paths when relevant</p>
          </div>
          <div>
            <p class="font-medium text-yellow-400">Set Priorities:</p>
            <p>Indicate urgency and dependencies</p>
          </div>
          <div>
            <p class="font-medium text-purple-400">Feedback Loop:</p>
            <p>Ask for clarification if responses aren't clear</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #111827;
  }
</style>