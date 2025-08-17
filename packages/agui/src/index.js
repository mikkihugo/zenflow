/**
 * @file AGUI Library - Autonomous Graphical User Interface
 *
 * A comprehensive library for human-in-the-loop interactions in autonomous systems.
 * Provides rich terminal, web, and custom adapters for various interaction patterns.
 *
 * This library includes:
 * - Core AGUI interfaces and adapters
 * - Task approval system integration
 * - Workflow gates and decision logging
 * - Rich terminal interactions
 * - Event-driven architecture support
 */
export { TerminalAGUI, MockAGUI, createAGUI } from './interfaces';
export { AGUIType, AGUIError, AGUITimeoutError, AGUIValidationError } from './types';
export { TaskApprovalSystem, createTaskApprovalSystem } from './task-approval-system';
// Library version and metadata
export const AGUI_VERSION = '1.0.0';
export const AGUI_DESCRIPTION = 'Autonomous Graphical User Interface Library for Claude-Zen';
/**
 * Create a complete AGUI system with task approval capabilities
 */
export async function createAGUISystem(config) {
    // Import locally to avoid bundling issues
    const { createAGUI } = await import('./interfaces');
    const { createTaskApprovalSystem } = await import('./task-approval-system');
    // Create appropriate AGUI adapter
    let agui;
    switch (config?.aguiType) {
        case 'mock':
            agui = createAGUI('mock');
            break;
        default:
            agui = createAGUI('terminal');
    }
    // Create task approval system
    const taskApproval = createTaskApprovalSystem(agui, config?.taskApprovalConfig);
    return {
        agui,
        taskApproval
    };
}
