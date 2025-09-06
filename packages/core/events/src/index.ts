/**
 * @fileoverview Unified Event Contracts - Foundation Event Registry Integration
 * 
 * Provides unified event contracts for brain-document-intelligence-coordination synchronization
 * Integrates with @claude-zen/foundation's comprehensive event registry system
 * 
 * @version 1.0.0
 */

// Re-export foundation event system for convenience
// Contracts are provided by foundation now; use '@claude-zen/foundation/events'.

// Export coordination helpers
export * from './coordination/index.js';

// Export saga management
export * from './saga/index.js';

// Export utilities and bridge functions
export * from './utilities/index.js';

// Export transport layer (WebSocket Hub, etc.)
export * from './transports/index.js';

// Export unified domain event modules
export * from './modules/index.js';

// Main event registry integration shim
// Re-export foundation's event system and contracts so consumers can import
// from '@claude-zen/events' or '@claude-zen/foundation/events'.
export * from '@claude-zen/foundation/events';