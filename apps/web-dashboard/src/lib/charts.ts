/**
 * Observable Plot utilities for dashboard data visualization
 * Replaces Chart.js with lightweight, SSR-friendly SVG charts.
 */
import * as Plot from '@observablehq/plot';

/**
 * Common chart theme and colors
 */
export const chartTheme = {
  colors: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    surface: '#64748b',
  },
  gradients: {
    primary: ['#0ea5e9', '#0284c7'],
    secondary: ['#8b5cf6', '#7c3aed'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    error: ['#ef4444', '#dc2626'],
  },
};

/**
 * Base chart options with dark theme support
 */
// Base chart sizing and margins
export const basePlotConfig = {
  width: 600,
  height: 300,
  marginLeft: 40,
  marginBottom: 30,
};

/**
 * Create system performance line chart configuration
 */
export function createPerformancePlot(
  el: HTMLElement,
  data: { timestamps: string[]; cpu: number[]; memory: number[] }
): () => void {
  const cpu = data.timestamps.map((t, i) => ({ t, v: data.cpu[i], k: 'CPU Usage (%)' }));
  const mem = data.timestamps.map((t, i) => ({ t, v: data.memory[i], k: 'Memory Usage (%)' }));

  const fig = Plot.plot({
    ...basePlotConfig,
    y: { domain: [0, 100], grid: true, label: 'Percent' },
    color: { legend: true },
    marks: [
      Plot.ruleY([0]),
      Plot.line(cpu, { x: 't', y: 'v', stroke: chartTheme.colors.primary, title: 'k' }),
      Plot.line(mem, { x: 't', y: 'v', stroke: chartTheme.colors.secondary, title: 'k' }),
    ],
  });
  el.appendChild(fig);
  return () => fig.remove();
}

/**
 * Create agent status distribution chart
 */
export function createAgentStatusPlot(
  el: HTMLElement,
  data: { active: number; idle: number; error: number }
): () => void {
  type Row = { status: string; count: number; color: string };
  const rows: Row[] = [
    { status: 'Active', count: data.active, color: chartTheme.colors.success },
    { status: 'Idle', count: data.idle, color: chartTheme.colors.warning },
    { status: 'Error', count: data.error, color: chartTheme.colors.error },
  ];
  const fig = Plot.plot({
    ...basePlotConfig,
    y: { grid: true, label: 'Agents' },
    marks: [
      Plot.barY(rows, { x: 'status', y: 'count', fill: 'color' }),
  Plot.text(rows, { x: 'status', y: 'count', text: (d: Row) => String(d.count), dy: -6 })
    ],
  });
  el.appendChild(fig);
  return () => fig.remove();
}

/**
 * Create task completion trend chart
 */
export function createTaskTrendPlot(
  el: HTMLElement,
  data: { timestamps: string[]; completed: number[]; pending: number[]; inProgress: number[] }
): () => void {
  const completed = data.timestamps.map((t, i) => ({ t, v: data.completed[i], k: 'Completed' }));
  const inProgress = data.timestamps.map((t, i) => ({ t, v: data.inProgress[i], k: 'In Progress' }));
  const pending = data.timestamps.map((t, i) => ({ t, v: data.pending[i], k: 'Pending' }));

  const fig = Plot.plot({
    ...basePlotConfig,
    y: { grid: true, label: 'Tasks' },
    color: { legend: true },
    marks: [
      Plot.line(completed, { x: 't', y: 'v', stroke: chartTheme.colors.success, title: 'k' }),
      Plot.line(inProgress, { x: 't', y: 'v', stroke: chartTheme.colors.info, title: 'k' }),
      Plot.line(pending, { x: 't', y: 'v', stroke: chartTheme.colors.warning, title: 'k' }),
    ],
  });
  el.appendChild(fig);
  return () => fig.remove();
}

/**
 * Create default real-time chart datasets
 */
// Real-time: simple rolling window renderer

/**
 * Create real-time chart options
 */
// (No global options needed for Plot)

/**
 * Create data point management functions for real-time chart
 */
function rolling<T>(arr: T[], max: number) {
  if (arr.length > max) arr.splice(0, arr.length - max);
}

/**
 * Create real-time metrics chart (updates automatically)
 */
export function createRealTimePlot(
  el: HTMLElement,
  maxDataPoints: number = 50
): {
  addDataPoint: (label: string, cpu: number, mem: number) => void;
  destroy: () => void;
} {
  const labels: string[] = [];
  const cpu: number[] = [];
  const mem: number[] = [];
  let fig: HTMLElement | null = null;

  function render() {
    if (fig) fig.remove();
    const cpuRows = labels.map((t, i) => ({ t, v: cpu[i], k: 'CPU Usage (%)' }));
    const memRows = labels.map((t, i) => ({ t, v: mem[i], k: 'Memory Usage (%)' }));
    fig = Plot.plot({
      ...basePlotConfig,
      y: { domain: [0, 100], grid: true },
      color: { legend: true },
      marks: [
        Plot.ruleY([0]),
        Plot.line(cpuRows, { x: 't', y: 'v', stroke: chartTheme.colors.primary, title: 'k' }),
        Plot.line(memRows, { x: 't', y: 'v', stroke: chartTheme.colors.secondary, title: 'k' }),
      ],
    });
    el.appendChild(fig);
  }

  return {
    addDataPoint(label: string, cpuVal: number, memVal: number) {
      labels.push(label);
      cpu.push(cpuVal);
      mem.push(memVal);
      rolling(labels, maxDataPoints);
      rolling(cpu, maxDataPoints);
      rolling(mem, maxDataPoints);
      render();
    },
    destroy() {
      if (fig) fig.remove();
      fig = null;
    },
  };
}

/**
 * Format timestamp for chart labels
 */
export function formatChartTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Generate chart colors for dynamic datasets
 */
export function generateChartColors(count: number): string[] {
  const colors = Object.values(chartTheme.colors);
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

/**
 * Chart configuration for responsive design
 */
// Plot adapts responsively via CSS/width; keep helper for future use if needed.
export function getResponsivePlotWidth(isMobile: boolean): number {
  return isMobile ? 320 : 600;
}
