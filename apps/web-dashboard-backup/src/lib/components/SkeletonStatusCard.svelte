<script lang="ts">
  // import { ProgressRadial, Accordion, AccordionItem } from '@skeletonlabs/skeleton-svelte';
  
  export let title: string = 'System Status';
  export let status: 'healthy' | 'warning' | 'error' = 'healthy';
  export let progress: number = 85;
  export let details: Array<{label: string, value: string}> = [];
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';  
      case 'error': return 'error';
      default: return 'surface';
    }
  }
  
  function getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔘';
    }
  }
</script>

<div class="card variant-glass-surface">
  <header class="card-header">
    <div class="flex items-center justify-between">
      <h3 class="h4 text-primary-500">{title}</h3>
      <div class="flex items-center gap-2">
        <span class="text-lg">{getStatusIcon(status)}</span>
        <span class="badge variant-soft-{getStatusColor(status)} capitalize">{status}</span>
      </div>
    </div>
  </header>
  
  <section class="p-4">
    <div class="flex items-center justify-center mb-6">
      <div class="w-32 h-32 relative flex items-center justify-center">
        <!-- Simple circular progress with CSS -->
        <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" stroke="rgb(var(--color-surface-300))" stroke-width="8" fill="none" />
          <circle 
            cx="60" cy="60" r="50" 
            stroke="rgb(var(--color-{getStatusColor(status)}-500))" 
            stroke-width="8" 
            fill="none"
            stroke-linecap="round"
            stroke-dasharray={`${2 * Math.PI * 50}`}
            stroke-dashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
            class="transition-all duration-500"
          />
        </svg>
        <div class="absolute text-center">
          <div class="text-2xl font-bold text-{getStatusColor(status)}-500">{progress}%</div>
          <div class="text-sm text-surface-600-300-token">Overall</div>
        </div>
      </div>
    </div>
    
    {#if details.length > 0}
      <div class="border border-surface-300-600-token rounded-lg overflow-hidden">
        <button class="w-full p-3 bg-surface-100-800-token text-left hover:bg-surface-200-700-token transition-colors">
          <span class="flex items-center gap-2 font-medium">
            <span>📊</span>
            Detailed Metrics ({details.length} items)
          </span>
        </button>
        
        <div class="p-3 space-y-2">
          {#each details as detail}
            <div class="flex justify-between items-center p-2 bg-surface-100-800-token rounded">
              <span class="text-sm text-surface-600-300-token">{detail.label}</span>
              <span class="font-mono font-semibold text-surface-900-50-token">{detail.value}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </section>
  
  <footer class="card-footer">
    <button class="btn variant-ghost-surface w-full">
      <span>🔄</span>
      Refresh Status
    </button>
  </footer>
</div>