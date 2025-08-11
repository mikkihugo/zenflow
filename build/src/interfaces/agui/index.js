/**
 * AGUI (Agent-User Interaction) Module.
 *
 * Provides human interaction interfaces for Claude-Zen.
 * Based on the @ag-ui/core protocol but adapted for our specific needs.
 */
/**
 * @file Agui module exports.
 */
export * from './agui-adapter.ts';
export { createAGUI, MockAGUI, TerminalAGUI } from './agui-adapter.ts';
