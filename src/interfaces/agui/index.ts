/**
 * AGUI (Agent-User Interaction) Module.
 *
 * Provides human interaction interfaces for Claude-Zen.
 * Based on the @ag-ui/core protocol but adapted for our specific needs.
 */
/**
 * @file agui module exports
 */



export type { AGUIInterface, ValidationQuestion } from './agui-adapter';
export * from './agui-adapter';
export { createAGUI, MockAGUI, TerminalAGUI } from './agui-adapter';
