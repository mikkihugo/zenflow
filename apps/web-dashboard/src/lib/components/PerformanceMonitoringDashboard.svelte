<script lang="ts">
  import { onMount } from 'svelte';
  import { EventBus, Result, ok, err } from '@claude-zen/foundation';
  import { getPerformanceMetrics, type PerformanceMetrics, type MetricError } from '../services/performanceMetrics';
  import MetricsCard from './MetricsCard.svelte';
  import Chart from './Chart.svelte';

  let metrics: PerformanceMetrics | null = null;
  let error: MetricError | null = null;
  let loading = true;

  // Polling interval for real-time updates (ms)
  const POLL_INTERVAL = 3000;
  let poller: NodeJS.Timeout | null = null;

  function fetchMetrics() {
    loading = true;
    getPerformanceMetrics(EventBus)
      .then((result: Result<PerformanceMetrics, MetricError>) => {
        if (result.ok) {
          metrics = result.value;
          error = null;
        } else {
          metrics = null;
          error = result.error;
        }
      })
      .catch((e) => {
        metrics = null;
        error = { message: e.message || 'Unknown error', code: 'FETCH_ERROR' };
      })
      .finally(() => {
        loading = false;
      });
  }

  onMount(() => {
    fetchMetrics();
    poller = setInterval(fetchMetrics, POLL_INTERVAL);
    return () => {
      if (poller) clearInterval(poller);
    };
  });
</script>

<section aria-label="Performance Monitoring Dashboard" class="w-full max-w-7xl mx-auto px-4 py-6">
  <h2 class="text-2xl font-bold mb-4">Enterprise Performance Monitoring</h2>
  {#if loading}
    <div role="status" aria-live="polite" class="animate-pulse text-gray-500">Loading metrics...</div>
  {:else if error}
    <div role="alert" class="bg-red-100 text-red-700 p-4 rounded mb-4">
      <span class="font-semibold">Error:</span> {error.message}
    </div>
  {:else if metrics}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricsCard
        title="Agent Coordination"
        value={metrics.agentCoordination.efficiency}
        description="Multi-agent collaboration efficiency"
        icon="users"
        trend={metrics.agentCoordination.trend}
        ariaLabel="Agent coordination efficiency"
      />
      <MetricsCard
        title="Database Performance"
        value={metrics.database.avgLatency}
        description="Avg. DB latency (ms)"
        icon="database"
        trend={metrics.database.trend}
        ariaLabel="Database performance"
      />
      <MetricsCard
        title="WASM Acceleration"
        value={metrics.wasm.acceleration}
        description="Neural compute speedup"
        icon="chip"
        trend={metrics.wasm.trend}
        ariaLabel="WASM neural processing"
      />
      <MetricsCard
        title="Web Responsiveness"
        value={metrics.web.responsiveness}
        description="UI response time (ms)"
        icon="bolt"
        trend={metrics.web.trend}
        ariaLabel="Web interface responsiveness"
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Chart
        title="Agent Coordination Over Time"
        data={metrics.agentCoordination.history}
        color="blue"
        ariaLabel="Agent coordination chart"
      />
      <Chart
        title="Database Latency (SQLite/LanceDB/Kuzu)"
        data={metrics.database.history}
        color="green"
        ariaLabel="Database latency chart"
      />
      <Chart
        title="WASM Neural Processing"
        data={metrics.wasm.history}
        color="purple"
        ariaLabel="WASM processing chart"
      />
      <Chart
        title="Web UI Responsiveness"
        data={metrics.web.history}
        color="yellow"
        ariaLabel="Web responsiveness chart"
      />
    </div>
  {/if}
</section>

<style>
  section {
    min-height: 60vh;
  }
</style>