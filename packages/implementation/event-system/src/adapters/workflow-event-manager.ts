/**
 * @file Workflow Event Manager - Implementation
 *
 * Simple workflow event manager implementation for the factory.
 */

import type { EventManager, EventManagerConfig } from '../core/interfaces';
import { BaseEventManager } from '../core/base-event-manager';

/**
 * Concrete workflow event manager implementation.
 */
export class WorkflowEventManager extends BaseEventManager {
  private workflows = new Map<string, any>();
  
  constructor(config: EventManagerConfig) {
    super(config, console as any);
  }
  
  // Add workflow-specific methods here as needed
  async startWorkflow(workflowId: string, workflow: any): Promise<void> {
    this.workflows.set(workflowId, { ...workflow, status: 'running', startTime: new Date() });
    
    const event = {
      id: `workflow_start_${Date.now()}`,
      timestamp: new Date(),
      source: this.name,
      type: 'workflow:start',
      payload: { workflowId, workflowType: workflow?.type || 'unknown' },
    };
    
    await this.emit(event);
  }
  
  async completeWorkflow(workflowId: string, result: any): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'completed';
      workflow.result = result;
      workflow.endTime = new Date();
    }
    
    const event = {
      id: `workflow_complete_${Date.now()}`,
      timestamp: new Date(),
      source: this.name,
      type: 'workflow:complete',
      payload: { workflowId, result },
    };
    
    await this.emit(event);
  }
  
  getWorkflow(workflowId: string): any {
    return this.workflows.get(workflowId);
  }
}

/**
 * Create a workflow event manager instance.
 */
export async function createWorkflowEventManager(
  config: EventManagerConfig
): Promise<EventManager> {
  return new WorkflowEventManager(config);
}
