// Storybook story for ActiveModulesPanel.svelte

import ActiveModulesPanel from './ActiveModulesPanel.svelte';

export default {
  title: 'Dashboard/ActiveModulesPanel',
  component: ActiveModulesPanel,
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } }
  },
};

const mockModules = [
  {
    id: 'mod-1',
    name: 'SPARC Manager',
    type: 'sparc',
    status: 'active',
    lastSeen: new Date(),
    eventCount: 42,
    events: ['sparc:phase-review-needed', 'sparc:phase-complete'],
    metadata: { version: '2.1.0', description: 'SPARC orchestration', uptime: 86400000, memoryUsage: 23.5 }
  },
  {
    id: 'mod-2',
    name: 'Brain System',
    type: 'brain',
    status: 'idle',
    lastSeen: new Date(Date.now() - 60000),
    eventCount: 12,
    events: ['brain:predict-request', 'brain:prediction-complete'],
    metadata: { version: '1.4.3', description: 'Neural compute', uptime: 43200000, memoryUsage: 18.2 }
  }
];

export const Default = {
  render: (args) => ({
    Component: ActiveModulesPanel,
    props: {
      ...args,
      activeModules: mockModules
    }
  }),
  args: {}
};