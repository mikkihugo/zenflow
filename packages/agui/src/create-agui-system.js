/**
 * @fileoverview AGUI System Factory - Complete AGUI system creation
 *
 * Factory function for creating a complete AGUI system with task approval capabilities
 */
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
