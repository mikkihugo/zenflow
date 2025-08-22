/**
 * Chart.js utilities for dashboard data visualization
 * Provides reusable chart configurations and components
 */

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  type ChartOptions,
  type ChartData
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  }
};

/**
 * Base chart options with dark theme support
 */
export const baseChartOptions: Partial<ChartOptions> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#e2e8f0',
        font: { family: 'Inter, system-ui, sans-serif' }
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      borderColor: '#475569',
      borderWidth: 1,
    }
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: '#334155' }
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: '#334155' }
    }
  }
};

/**
 * Create system performance line chart configuration
 */
export function createPerformanceChart(data: {
  timestamps: string[];
  cpu: number[];
  memory: number[];
}): { data: ChartData<'line'>; options: ChartOptions<'line'> } {
  return {
    data: {
      labels: data.timestamps,
      datasets: [
        {
          label: 'CPU Usage (%)',
          data: data.cpu,
          borderColor: chartTheme.colors.primary,
          backgroundColor: chartTheme.colors.primary + '20',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Memory Usage (%)',
          data: data.memory,
          borderColor: chartTheme.colors.secondary,
          backgroundColor: chartTheme.colors.secondary + '20',
          tension: 0.4,
          fill: false,
        }
      ]
    },
    options: {
      ...baseChartOptions,
      scales: {
        ...baseChartOptions.scales,
        y: {
          ...baseChartOptions.scales?.y,
          min: 0,
          max: 100,
          ticks: {
            ...baseChartOptions.scales?.y?.ticks,
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          display: true,
          text: 'System Performance',
          color: '#f8fafc',
          font: { size: 16, weight: 'bold' }
        }
      }
    } as ChartOptions<'line'>
  };
}

/**
 * Create agent status distribution chart
 */
export function createAgentStatusChart(data: {
  active: number;
  idle: number;
  error: number;
}): { data: ChartData<'bar'>; options: ChartOptions<'bar'> } {
  return {
    data: {
      labels: ['Active', 'Idle', 'Error'],
      datasets: [
        {
          label: 'Agent Count',
          data: [data.active, data.idle, data.error],
          backgroundColor: [
            chartTheme.colors.success,
            chartTheme.colors.warning,
            chartTheme.colors.error,
          ],
          borderColor: [
            chartTheme.colors.success,
            chartTheme.colors.warning,
            chartTheme.colors.error,
          ],
          borderWidth: 1,
        }
      ]
    },
    options: {
      ...baseChartOptions,
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          display: true,
          text: 'Agent Status Distribution',
          color: '#f8fafc',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: false
        }
      }
    } as ChartOptions<'bar'>
  };
}

/**
 * Create task completion trend chart
 */
export function createTaskTrendChart(data: {
  timestamps: string[];
  completed: number[];
  pending: number[];
  inProgress: number[];
}): { data: ChartData<'line'>; options: ChartOptions<'line'> } {
  return {
    data: {
      labels: data.timestamps,
      datasets: [
        {
          label: 'Completed',
          data: data.completed,
          borderColor: chartTheme.colors.success,
          backgroundColor: chartTheme.colors.success + '10',
          fill: 'origin',
          tension: 0.4,
        },
        {
          label: 'In Progress',
          data: data.inProgress,
          borderColor: chartTheme.colors.info,
          backgroundColor: chartTheme.colors.info + '10',
          fill: '-1',
          tension: 0.4,
        },
        {
          label: 'Pending',
          data: data.pending,
          borderColor: chartTheme.colors.warning,
          backgroundColor: chartTheme.colors.warning + '10',
          fill: '-1',
          tension: 0.4,
        }
      ]
    },
    options: {
      ...baseChartOptions,
      scales: {
        ...baseChartOptions.scales,
        y: {
          ...baseChartOptions.scales?.y,
          stacked: true,
          min: 0,
        }
      },
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          display: true,
          text: 'Task Completion Trends',
          color: '#f8fafc',
          font: { size: 16, weight: 'bold' }
        }
      }
    } as ChartOptions<'line'>
  };
}

/**
 * Create real-time metrics chart (updates automatically)
 */
export function createRealTimeChart(
  maxDataPoints: number = 50
): {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
  addDataPoint: (label: string, ...values: number[]) => void;
  updateDataset: (datasetIndex: number, data: number[]) => void;
} {
  const chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'CPU Usage',
        data: [],
        borderColor: chartTheme.colors.primary,
        backgroundColor: chartTheme.colors.primary + '10',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Memory Usage',
        data: [],
        borderColor: chartTheme.colors.secondary,
        backgroundColor: chartTheme.colors.secondary + '10',
        tension: 0.4,
        fill: false,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    ...baseChartOptions,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      ...baseChartOptions.scales,
      x: {
        ...baseChartOptions.scales?.x,
        type: 'category',
        display: true,
      },
      y: {
        ...baseChartOptions.scales?.y,
        min: 0,
        max: 100,
      }
    },
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Real-time System Metrics',
        color: '#f8fafc',
        font: { size: 16, weight: 'bold'}
      }
    },
    elements: {
      point: {
        radius: 0, // Hide points for cleaner real-time look
      }
    }
  };

  const addDataPoint = (label: string, ...values: number[]) => {
    // Add new label
    chartData.labels = chartData.labels'' | '''' | ''[];
    chartData.labels.push(label);

    // Add data points to each dataset
    values.forEach((value, index) => {
      if (chartData.datasets[index]) {
        chartData.datasets[index].data.push(value);
      }
    });

    // Remove old data points if we exceed max
    if (chartData.labels.length > maxDataPoints) {
      chartData.labels = chartData.labels.slice(-maxDataPoints);
      chartData.datasets.forEach(dataset => {
        dataset.data = dataset.data.slice(-maxDataPoints);
      });
    }
  };

  const updateDataset = (datasetIndex: number, data: number[]) => {
    if (chartData.datasets[datasetIndex]) {
      chartData.datasets[datasetIndex].data = data;
    }
  };

  return { data: chartData, options, addDataPoint, updateDataset };
}

/**
 * Format timestamp for chart labels
 */
export function formatChartTimestamp(timestamp: string'' | ''Date): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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
export function getResponsiveChartConfig(isMobile: boolean): Partial<ChartOptions> {
  return {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      legend: {
        ...baseChartOptions.plugins?.legend,
        position: isMobile ? 'bottom' : 'top',
        labels: {
          ...baseChartOptions.plugins?.legend?.labels,
          boxWidth: isMobile ? 12 : 15,
          padding: isMobile ? 10 : 15,
        }
      }
    },
    scales: {
      ...baseChartOptions.scales,
      x: {
        ...baseChartOptions.scales?.x,
        ticks: {
          ...baseChartOptions.scales?.x?.ticks,
          maxTicksLimit: isMobile ? 5 : 10,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      y: {
        ...baseChartOptions.scales?.y,
        ticks: {
          ...baseChartOptions.scales?.y?.ticks,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };
}