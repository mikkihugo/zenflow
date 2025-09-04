// Storybook story for EventExplorer.svelte

import EventExplorer from './EventExplorer.svelte';

export default {
  title: 'Dashboard/EventExplorer',
  component: EventExplorer,
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } }
  }
};

const mockEventCatalog = [
  {
    name: 'sparc:phase-review-needed',
    type: 'SPARCPhaseReviewEvent',
    flows: 45,
    lastSeen: new Date(Date.now() - 30000),
    activeModules: ['SPARC Manager'],
    category: 'sparc'
  },
  {
    name: 'llm:inference-request',
    type: 'LLMInferenceRequestEvent',
    flows: 234,
    lastSeen: new Date(Date.now() - 500),
    activeModules: ['LLM Provider'],
    category: 'llm'
  }
];

export const Default = {
  render: (args) => ({
    Component: EventExplorer,
    props: {
      ...args,
      eventCatalog: mockEventCatalog,
      filteredEvents: mockEventCatalog,
      selectedEvent: null,
      selectedEventFlows: [],
      searchTerm: '',
      selectedCategory: 'all',
      selectedStatus: 'all',
      showPayload: false
    }
  }),
  args: {}
};