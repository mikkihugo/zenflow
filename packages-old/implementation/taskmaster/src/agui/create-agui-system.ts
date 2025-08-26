/**
 * @fileoverview AGUI System Factory - Complete AGUI system creation
 *
 * Factory function for creating a complete AGUI system with task approval capabilities
 */

/**
 * Create a complete AGUI system with task approval capabilities
 */
export async function createAGUISystem(config?: {
  aguiType?: 'web' | 'headless;
  taskApprovalConfig?: Partial<
    import('./task-approval-system').TaskApprovalConfig'
  >;
}): Promise<{
  agui: import('./interfaces').AGUIInterface;'
  taskApproval: import('./task-approval-system').TaskApprovalSystem;'
}> {
  // Import locally to avoid bundling issues
  const { createAGUI } = await import('./interfaces');'
  const { createTaskApprovalSystem } = await import('./task-approval-system');'

  // Create appropriate AGUI adapter
  let agui: import('./interfaces').AGUIInterface;'

  switch (config?.aguiType) {
    case 'headless':'
      agui = createAGUI('headless');'
      break;
    default: {
      agui = createAGUI('web');'
  }

  // Create task approval system
  const taskApproval = createTaskApprovalSystem(
    agui,
    config?.taskApprovalConfig
  );

  return {
    agui,
    taskApproval,
  };
    }
}
