// Storybook story for PerformanceMonitoringDashboard.svelte

import PerformanceMonitoringDashboard from './PerformanceMonitoringDashboard.svelte';

export default {
  title: 'Dashboard/PerformanceMonitoringDashboard',
  component: PerformanceMonitoringDashboard,
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } }
  }
};

// Mock metrics data for demonstration
const mockMetrics = {
  agentCoordination: {
    efficiency: 98.7,
    trend: 'up',
    history: [
      { timestamp: Date.now() - 40000, value: 95 },
      { timestamp: Date.now() - 30000, value: 96 },
      { timestamp: Date.now() - 20000, value: 97 },
      { timestamp: Date.now() - 10000, value: 98 },
      { timestamp: Date.now(), value: 98.7 }
    ]
  },
  database: {
    avgLatency: 13.2,
    trend: 'stable',
    history: [
      { timestamp: Date.now() - 40000, sqlite: 14, lancedb: 13, kuzu: 12 },
      { timestamp: Date.now() - 30000, sqlite: 13, lancedb: 13, kuzu: 13 },
      { timestamp: Date.now() - 20000, sqlite: 13, lancedb: 12, kuzu: 13 },
      { timestamp: Date.now() - 10000, sqlite: 12, lancedb: 13, kuzu: 12 },
      { timestamp: Date.now(), sqlite: 13.2, lancedb: 13, kuzu: 12 }
    ]
  },
  wasm: {
    acceleration: 2.4,
    trend: 'up',
    history: [
      { timestamp: Date.now() - 40000, value: 2.0 },
      { timestamp: Date.now() - 30000, value: 2.1 },
      { timestamp: Date.now() - 20000, value: 2.2 },
      { timestamp: Date.now() - 10000, value: 2.3 },
      { timestamp: Date.now(), value: 2.4 }
    ]
  },
  web: {
    responsiveness: 42,
    trend: 'down',
    history: [
      { timestamp: Date.now() - 40000, value: 38 },
      { timestamp: Date.now() - 30000, value: 40 },
      { timestamp: Date.now() - 20000, value: 41 },
      { timestamp: Date.now() - 10000, value: 43 },
      { timestamp: Date.now(), value: 42 }
    ]
  }
};

export const Default = {
  render: (args) => ({
    Component: PerformanceMonitoringDashboard,
    props: {
      ...args,
      metrics: mockMetrics,
      error: null,
      loading: false
    }
  }),
  args: {}
};

export const Loading = {
  render: (args) => ({
    Component: PerformanceMonitoringDashboard,
    props: {
      ...args,
      loading: true
    }
  }),
  args: {}
};

export const ErrorState = {
  render: (args) => ({
    Component: PerformanceMonitoringDashboard,
    props: {
      ...args,
      error: { message: 'Failed to fetch metrics', code: 'FETCH_ERROR' },
      loading: false
    }
  }),
  args: {}
};