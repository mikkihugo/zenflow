// Storybook story for MetricsCard.svelte

import MetricsCard from './MetricsCard.svelte';

export default {
  title: 'Dashboard/MetricsCard',
  component: MetricsCard,
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    description: { control: 'text' },
    icon: { control: { type: 'select', options: ['users', 'database', 'chip', 'bolt'] } },
    trend: { control: { type: 'select', options: ['up', 'down', 'stable'] } },
    ariaLabel: { control: 'text' }
  },
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } }
  }
};

export const Default = {
  render: (args) => ({
    Component: MetricsCard,
    props: {
      ...args,
      title: 'Agent Coordination',
      value: 99.2,
      description: 'Multi-agent collaboration efficiency',
      icon: 'users',
      trend: 'up',
      ariaLabel: 'Agent coordination metric'
    }
  }),
  args: {}
};

export const DatabaseLatency = {
  render: (args) => ({
    Component: MetricsCard,
    props: {
      ...args,
      title: 'Database Performance',
      value: 12.5,
      description: 'Avg. DB latency (ms)',
      icon: 'database',
      trend: 'stable',
      ariaLabel: 'Database latency metric'
    }
  }),
  args: {}
};