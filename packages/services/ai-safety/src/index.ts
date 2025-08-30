// =============================================================================
// PRIMARY EVENT-DRIVEN EXPORTS - Foundation powered with brain coordination
// =============================================================================

export {
  createEventDrivenAISafety,
  EventDrivenAISafety,
  EventDrivenAISafety as default,
} from './ai-safety-event-driven.js';

// =============================================================================
// LEGACY EXPORTS - Backward compatibility (DEPRECATED)
// =============================================================================

/**
 * @deprecated Use EventDrivenAISafety instead for event-based brain coordination
 */
export * from './main';
