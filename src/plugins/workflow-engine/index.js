/**
 * Workflow Engine Plugin
 * Default sequential workflow processing engine
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir, readdir, unlink } from 'fs/promises';
import path from 'path';

export class WorkflowEnginePlugin extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxConcurrentWorkflows: 10,
      persistWorkflows: true,
      retryFailedSteps: true,
      workflowTimeout: 3600000, // 1 hour
      stepTimeout: 300000, // 5 minutes
      retryDelay: 1000,
      maxRetries: 3,
      persistencePath: path.join(process.cwd(), '.hive-mind', 'workflows'),
      enableMetrics: true,
      enableVisualization: true,
      ...config
    };
    
    this.engine = null;
    this.activeWorkflows = new Map();
    this.workflowMetrics = new Map();
    this.workflowDefinitions = new Map();
    this.stepHandlers = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('⚙️ Workflow Engine Plugin initializing');
    
    // Create persistence directory
    if (this.config.persistWorkflows) {
      await mkdir(this.config.persistencePath, { recursive: true });
    }
    
    // Register built-in step handlers
    this.registerBuiltInHandlers();
    
    // Initialize the default engine
    this.engine = new DefaultWorkflowEngine(this.config, this);
    await this.engine.initialize();
    
    // Load persisted workflows
    if (this.config.persistWorkflows) {
      await this.loadPersistedWorkflows();
    }
    
    this.initialized = true;
    this.emit('initialized');
    console.log('✅ Workflow Engine Plugin initialized');
  }

  registerBuiltInHandlers() {
    // Delay step
    this.registerStepHandler('delay', async (context, params) => {
      const duration = params.duration || 1000;
      await new Promise(resolve => setTimeout(resolve, duration));
      return { delayed: duration };
    });
    
    // HTTP request step
    this.registerStepHandler('http', async (context, params) => {
      const response = await fetch(params.url, {
        method: params.method || 'GET',
        headers: params.headers || {},
        body: params.body ? JSON.stringify(params.body) : undefined
      });
      
      return {
        status: response.status,
        data: await response.json()
      };
    });
    
    // Conditional step
    this.registerStepHandler('condition', async (context, params) => {
      const result = await this.evaluateCondition(context, params.expression);
      return { result, branch: result ? 'true' : 'false' };
    });
    
    // Transform step
    this.registerStepHandler('transform', async (context, params) => {
      const data = this.getContextValue(context, params.input);
      const transformed = await this.applyTransformation(data, params.transformation);
      return { output: transformed };
    });
    
    // Parallel execution step
    this.registerStepHandler('parallel', async (context, params) => {
      const results = await Promise.all(
        params.tasks.map(task => this.executeStep(task, context))
      );
      return { results };
    });
    
    // Loop step
    this.registerStepHandler('loop', async (context, params) => {
      const items = this.getContextValue(context, params.items);
      const results = [];
      
      for (const item of items) {
        const loopContext = { ...context, loopItem: item };
        const result = await this.executeStep(params.step, loopContext);
        results.push(result);
      }
      
      return { results };
    });
  }

  registerStepHandler(type, handler) {
    this.stepHandlers.set(type, handler);
    console.log(`📌 Registered step handler: ${type}`);
  }

  async executeStep(step, context) {
    const handler = this.stepHandlers.get(step.type);
    if (!handler) {
      throw new Error(`No handler registered for step type: ${step.type}`);
    }
    
    return await handler(context, step.params || {});
  }

  evaluateCondition(context, expression) {
    // Simple expression evaluation (in production, use a proper expression parser)
    try {
      const contextVars = Object.keys(context).map(key => `const ${key} = context.${key};`).join('\n');
      const func = new Function('context', `${contextVars}\n return ${expression};`);
      return func(context);
    } catch (error) {
      throw new Error(`Failed to evaluate condition: ${error.message}`);
    }
  }

  getContextValue(context, path) {
    const parts = path.split('.');
    let value = context;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  async applyTransformation(data, transformation) {
    if (typeof transformation === 'function') {
      return transformation(data);
    }
    
    // Simple object transformation
    if (typeof transformation === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(transformation)) {
        if (typeof value === 'string' && value.startsWith('$.')) {
          result[key] = this.getContextValue({ data }, value.substring(2));
        } else {
          result[key] = value;
        }
      }
      return result;
    }
    
    return data;
  }

  async loadPersistedWorkflows() {
    try {
      const files = await readdir(this.config.persistencePath);
      const workflowFiles = files.filter(f => f.endsWith('.workflow.json'));
      
      for (const file of workflowFiles) {
        const filePath = path.join(this.config.persistencePath, file);
        const data = JSON.parse(await readFile(filePath, 'utf8'));
        
        if (data.status === 'running' || data.status === 'paused') {
          this.activeWorkflows.set(data.id, data);
          console.log(`📂 Loaded persisted workflow: ${data.id}`);
        }
      }
    } catch (error) {
      // No persisted workflows
    }
  }

  async saveWorkflow(workflow) {
    if (!this.config.persistWorkflows) return;
    
    const filePath = path.join(this.config.persistencePath, `${workflow.id}.workflow.json`);
    await writeFile(filePath, JSON.stringify(workflow, null, 2));
  }

  async deleteWorkflow(workflowId) {
    if (!this.config.persistWorkflows) return;
    
    try {
      const filePath = path.join(this.config.persistencePath, `${workflowId}.workflow.json`);
      await unlink(filePath);
    } catch (error) {
      // File might not exist
    }
  }

  async registerWorkflowDefinition(name, definition) {
    this.workflowDefinitions.set(name, definition);
    console.log(`📝 Registered workflow definition: ${name}`);
  }

  async startWorkflow(workflowDefinitionOrName, context = {}) {
    let definition;
    
    if (typeof workflowDefinitionOrName === 'string') {
      definition = this.workflowDefinitions.get(workflowDefinitionOrName);
      if (!definition) {
        throw new Error(`Workflow definition '${workflowDefinitionOrName}' not found`);
      }
    } else {
      definition = workflowDefinitionOrName;
    }
    
    // Check concurrent workflow limit
    const activeCount = Array.from(this.activeWorkflows.values())
      .filter(w => w.status === 'running').length;
    
    if (activeCount >= this.config.maxConcurrentWorkflows) {
      throw new Error(`Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`);
    }
    
    const result = await this.engine.startWorkflow(definition, context);
    
    this.emit('workflow:started', result);
    
    return result;
  }

  async getWorkflowStatus(workflowId) {
    return this.engine.getWorkflowStatus(workflowId);
  }

  async pauseWorkflow(workflowId) {
    const result = await this.engine.pauseWorkflow(workflowId);
    if (result.success) {
      this.emit('workflow:paused', { workflowId });
    }
    return result;
  }

  async resumeWorkflow(workflowId) {
    const result = await this.engine.resumeWorkflow(workflowId);
    if (result.success) {
      this.emit('workflow:resumed', { workflowId });
    }
    return result;
  }

  async cancelWorkflow(workflowId) {
    const result = await this.engine.cancelWorkflow(workflowId);
    if (result.success) {
      this.emit('workflow:cancelled', { workflowId });
      await this.deleteWorkflow(workflowId);
    }
    return result;
  }

  async listActiveWorkflows() {
    return this.engine.listActiveWorkflows();
  }

  async getWorkflowHistory(limit = 100) {
    const history = [];
    
    try {
      const files = await readdir(this.config.persistencePath);
      const workflowFiles = files.filter(f => f.endsWith('.workflow.json'));
      
      for (const file of workflowFiles.slice(-limit)) {
        const filePath = path.join(this.config.persistencePath, file);
        const data = JSON.parse(await readFile(filePath, 'utf8'));
        
        history.push({
          id: data.id,
          name: data.definition?.name,
          status: data.status,
          startTime: data.startTime,
          endTime: data.endTime,
          duration: data.endTime ? new Date(data.endTime) - new Date(data.startTime) : null
        });
      }
    } catch (error) {
      // No history
    }
    
    return history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }

  async getWorkflowMetrics() {
    const metrics = {
      total: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      averageDuration: 0,
      successRate: 0
    };
    
    const workflows = Array.from(this.activeWorkflows.values());
    metrics.total = workflows.length;
    
    workflows.forEach(w => {
      metrics[w.status] = (metrics[w.status] || 0) + 1;
    });
    
    const completed = workflows.filter(w => w.status === 'completed');
    if (completed.length > 0) {
      const totalDuration = completed.reduce((sum, w) => {
        return sum + (new Date(w.endTime) - new Date(w.startTime));
      }, 0);
      metrics.averageDuration = totalDuration / completed.length;
    }
    
    if (metrics.total > 0) {
      metrics.successRate = metrics.completed / metrics.total;
    }
    
    return metrics;
  }

  generateWorkflowVisualization(workflow) {
    if (!this.config.enableVisualization) return null;
    
    // Generate a simple Mermaid diagram
    const lines = ['graph TD'];
    
    workflow.steps.forEach((step, index) => {
      const nodeId = `step${index}`;
      const label = step.name || step.type;
      const status = index < workflow.currentStep ? 'completed' : 
                     index === workflow.currentStep ? 'current' : 'pending';
      
      lines.push(`    ${nodeId}[${label}]`);
      
      if (status === 'completed') {
        lines.push(`    style ${nodeId} fill:#4CAF50,stroke:#333,stroke-width:2px`);
      } else if (status === 'current') {
        lines.push(`    style ${nodeId} fill:#2196F3,stroke:#333,stroke-width:2px`);
      }
      
      if (index > 0) {
        lines.push(`    step${index - 1} --> ${nodeId}`);
      }
    });
    
    return lines.join('\n');
  }

  async cleanup() {
    // Save all active workflows
    if (this.config.persistWorkflows) {
      for (const workflow of this.activeWorkflows.values()) {
        await this.saveWorkflow(workflow);
      }
    }
    
    if (this.engine?.cleanup) {
      await this.engine.cleanup();
    }
    
    this.activeWorkflows.clear();
    this.workflowDefinitions.clear();
    this.stepHandlers.clear();
    this.removeAllListeners();
    
    console.log('⚙️ Workflow Engine Plugin cleaned up');
  }
}

/**
 * Default Sequential Workflow Engine
 */
class DefaultWorkflowEngine extends EventEmitter {
  constructor(config, plugin) {
    super();
    this.config = config;
    this.plugin = plugin;
    this.workflows = new Map();
  }

  async initialize() {
    console.log('📋 Default workflow engine ready');
  }

  async startWorkflow(definition, context) {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const workflow = {
      id: workflowId,
      definition,
      context: { ...context },
      status: 'running',
      currentStep: 0,
      steps: definition.steps || [],
      startTime: new Date().toISOString(),
      completedSteps: [],
      stepResults: {},
      retryCount: {},
      error: null,
      endTime: null
    };

    this.workflows.set(workflowId, workflow);
    this.plugin.activeWorkflows.set(workflowId, workflow);
    
    // Start execution asynchronously
    this.executeWorkflow(workflow).catch(error => {
      console.error(`Workflow ${workflowId} failed:`, error);
    });
    
    return { 
      workflowId, 
      status: 'started',
      totalSteps: workflow.steps.length
    };
  }

  async executeWorkflow(workflow) {
    try {
      this.emit('workflow:start', { workflowId: workflow.id });
      
      for (let i = workflow.currentStep; i < workflow.steps.length; i++) {
        if (workflow.status !== 'running') {
          break; // Workflow was paused or cancelled
        }
        
        const step = workflow.steps[i];
        workflow.currentStep = i;
        
        await this.executeWorkflowStep(workflow, step, i);
      }
      
      if (workflow.status === 'running') {
        workflow.status = 'completed';
        workflow.endTime = new Date().toISOString();
        this.emit('workflow:complete', { 
          workflowId: workflow.id,
          results: workflow.stepResults
        });
      }
      
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.endTime = new Date().toISOString();
      this.emit('workflow:error', { 
        workflowId: workflow.id, 
        error: error.message 
      });
    } finally {
      await this.plugin.saveWorkflow(workflow);
    }
  }

  async executeWorkflowStep(workflow, step, stepIndex) {
    const stepId = `step-${stepIndex}`;
    let retries = 0;
    const maxRetries = step.retries !== undefined ? step.retries : this.config.maxRetries;
    
    while (retries <= maxRetries) {
      try {
        this.emit('step:start', { 
          workflowId: workflow.id, 
          stepIndex, 
          stepName: step.name 
        });
        
        console.log(`📍 Executing step ${stepIndex + 1}/${workflow.steps.length}: ${step.name || step.type}`);
        
        // Set up step timeout
        const timeout = step.timeout || this.config.stepTimeout;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Step timeout')), timeout);
        });
        
        // Execute step
        const stepPromise = this.plugin.executeStep(step, workflow.context);
        const result = await Promise.race([stepPromise, timeoutPromise]);
        
        // Store result in context if specified
        if (step.output) {
          workflow.context[step.output] = result;
        }
        
        // Store in step results
        workflow.stepResults[stepId] = result;
        
        workflow.completedSteps.push({
          index: stepIndex,
          name: step.name || step.type,
          completedAt: new Date().toISOString(),
          result: result
        });
        
        this.emit('step:complete', { 
          workflowId: workflow.id, 
          stepIndex, 
          result 
        });
        
        await this.plugin.saveWorkflow(workflow);
        
        break; // Success, exit retry loop
        
      } catch (error) {
        retries++;
        workflow.retryCount[stepId] = retries;
        
        console.warn(`⚠️ Step ${step.name} failed (attempt ${retries}/${maxRetries + 1}): ${error.message}`);
        
        if (retries > maxRetries) {
          this.emit('step:error', { 
            workflowId: workflow.id, 
            stepIndex, 
            error: error.message 
          });
          
          if (step.onError === 'continue') {
            workflow.stepResults[stepId] = { error: error.message };
            break; // Continue to next step
          } else {
            throw error; // Fail workflow
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * retries));
      }
    }
  }

  async getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    const duration = workflow.endTime ? 
      new Date(workflow.endTime) - new Date(workflow.startTime) :
      Date.now() - new Date(workflow.startTime);
    
    return {
      id: workflow.id,
      status: workflow.status,
      currentStep: workflow.currentStep,
      totalSteps: workflow.steps.length,
      progress: workflow.steps.length > 0 ? workflow.currentStep / workflow.steps.length : 0,
      startTime: workflow.startTime,
      endTime: workflow.endTime,
      duration: duration,
      completedSteps: workflow.completedSteps.length,
      error: workflow.error,
      context: workflow.context,
      stepResults: workflow.stepResults
    };
  }

  async pauseWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'paused';
      workflow.pausedAt = new Date().toISOString();
      await this.plugin.saveWorkflow(workflow);
      return { success: true };
    }
    return { success: false, reason: 'Workflow not found or not running' };
  }

  async resumeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      workflow.status = 'running';
      delete workflow.pausedAt;
      
      // Resume execution
      this.executeWorkflow(workflow).catch(error => {
        console.error(`Workflow ${workflowId} failed after resume:`, error);
      });
      
      return { success: true };
    }
    return { success: false, reason: 'Workflow not found or not paused' };
  }

  async cancelWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (workflow && ['running', 'paused'].includes(workflow.status)) {
      workflow.status = 'cancelled';
      workflow.endTime = new Date().toISOString();
      await this.plugin.saveWorkflow(workflow);
      return { success: true };
    }
    return { success: false, reason: 'Workflow not found or already completed' };
  }

  async listActiveWorkflows() {
    const active = Array.from(this.workflows.values())
      .filter(w => ['running', 'paused'].includes(w.status))
      .map(w => ({
        id: w.id,
        name: w.definition?.name,
        status: w.status,
        currentStep: w.currentStep,
        totalSteps: w.steps.length,
        progress: w.steps.length > 0 ? (w.currentStep / w.steps.length) * 100 : 0,
        startTime: w.startTime,
        pausedAt: w.pausedAt
      }));
    
    return active;
  }

  async cleanup() {
    this.workflows.clear();
    this.removeAllListeners();
  }
}

export default WorkflowEnginePlugin;