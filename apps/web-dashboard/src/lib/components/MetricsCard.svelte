<script lang="ts">
  export let title: string;
  export let value: number | string;
  export let description: string;
  export let icon: 'users' | 'database' | 'chip' | 'bolt';
  export let trend: 'up' | 'down' | 'stable';
  export let ariaLabel: string;
</script>

<div class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col items-start justify-between h-full"
     aria-label={ariaLabel} tabindex="0">
  <div class="flex items-center mb-2">
    {#if icon === 'users'}
      <svg class="w-6 h-6 text-blue-500 mr-2" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>
    {:else if icon === 'database'}
      <svg class="w-6 h-6 text-green-500 mr-2" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="9" ry="4" fill="currentColor"/><rect x="3" y="7" width="18" height="10" fill="currentColor"/></svg>
    {:else if icon === 'chip'}
      <svg class="w-6 h-6 text-purple-500 mr-2" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor"/></svg>
    {:else if icon === 'bolt'}
      <svg class="w-6 h-6 text-yellow-500 mr-2" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor"/></svg>
    {/if}
    <span class="text-lg font-semibold">{title}</span>
  </div>
  <div class="flex items-center mb-1">
    <span class="text-3xl font-bold mr-2">{value}</span>
    {#if trend === 'up'}
      <span class="text-green-600" aria-label="Trending up" title="Trending up">▲</span>
    {:else if trend === 'down'}
      <span class="text-red-600" aria-label="Trending down" title="Trending down">▼</span>
    {:else}
      <span class="text-gray-400" aria-label="Stable" title="Stable">●</span>
    {/if}
  </div>
  <span class="text-sm text-gray-500 dark:text-gray-400">{description}</span>
</div>