<script lang="ts">
  export let title: string;
  export let data: Array<{ timestamp: number; value?: number; sqlite?: number; lancedb?: number; kuzu?: number }>;
  export let color: string;
  export let ariaLabel: string;

  // Prepare chart points for single-value or multi-db series
  let points: string = '';
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let chartWidth = 320;
  let chartHeight = 80;

  $: {
    if (!data || data.length === 0) {
      points = '';
      minY = 0;
      maxY = 1;
    } else {
      // For multi-db, plot sqlite only for simplicity
      const values = data.map(d => d.value ?? d.sqlite ?? 0);
      minY = Math.min(...values);
      maxY = Math.max(...values);
      const range = maxY - minY || 1;
      points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * chartWidth;
        const y = chartHeight - ((v - minY) / range) * chartHeight;
        return `${x},${y}`;
      }).join(' ');
    }
  }
</script>

<div class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-2 w-full" aria-label={ariaLabel} tabindex="0">
  <h3 class="text-md font-semibold mb-2">{title}</h3>
  {#if points}
    <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-hidden="true" focusable="false">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        cx={chartWidth}
        cy={chartHeight - ((data[data.length-1].value ?? data[data.length-1].sqlite ?? 0 - minY) / (maxY - minY || 1)) * chartHeight}
        r="4"
        fill={color}
        aria-label="Latest value"
      />
    </svg>
    <div class="flex justify-between text-xs text-gray-400 mt-1">
      <span>Min: {minY}</span>
      <span>Max: {maxY}</span>
    </div>
  {:else}
    <div class="text-gray-400 text-xs">No data available</div>
  {/if}
</div>