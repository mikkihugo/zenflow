// Storybook story for Chart.svelte

import Chart from './Chart.svelte';

export default {
  title: 'Dashboard/Chart',
  component: Chart,
  argTypes: {
    title: { control: 'text' },
    color: { control: 'color' },
    ariaLabel: { control: 'text' }
  },
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } }
  }
};

const sampleData = [
  { timestamp: Date.now() - 40000, value: 10 },
  { timestamp: Date.now() - 30000, value: 15 },
  { timestamp: Date.now() - 20000, value: 12 },
  { timestamp: Date.now() - 10000, value: 18 },
  { timestamp: Date.now(), value: 14 }
];

export const Default = {
  render: (args) => ({
    Component: Chart,
    props: {
      ...args,
      title: 'Sample Chart',
      data: sampleData,
      color: 'blue',
      ariaLabel: 'Sample chart for accessibility'
    }
  }),
  args: {}
};