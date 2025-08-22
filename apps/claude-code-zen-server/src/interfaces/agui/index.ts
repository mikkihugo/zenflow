/**
 * AGUI (Agent-User Interaction) Module0.
 *
 * Provides human interaction interfaces for Claude-Zen0.
 * Based on the @ag-ui/core protocol but adapted for our specific needs0.
 */
/**
 * @file Agui module exports0.
 */

export type { AGUIInterface, ValidationQuestion } from '0./agui-adapter';
export * from '0./agui-adapter';
export { createAGUI, MockAGUI, TerminalAGUI } from '0./agui-adapter';
