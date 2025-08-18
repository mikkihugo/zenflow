/**
 * @fileoverview AGUI System Factory - Complete AGUI system creation
 *
 * Factory function for creating a complete AGUI system with task approval capabilities
 */
/**
 * Create a complete AGUI system with task approval capabilities
 */
export declare function createAGUISystem(config?: {
    aguiType?: 'terminal' | 'mock';
    taskApprovalConfig?: Partial<import('./task-approval-system').TaskApprovalConfig>;
}): Promise<{
    agui: import('./interfaces').AGUIInterface;
    taskApproval: import('./task-approval-system').TaskApprovalSystem;
}>;
//# sourceMappingURL=create-agui-system.d.ts.map