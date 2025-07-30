/**
 * Workflow Engine Plugin
 * Default sequential workflow processing engine
 */

import { EventEmitter } from 'node:events';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class WorkflowEnginePlugin extends EventEmitter {
  constructor(config = {}): any {
    super();
    this.config = {maxConcurrentWorkflows = null;
    this.activeWorkflows = new Map();
    this.workflowMetrics = new Map();
    this.workflowDefinitions = new Map();
    this.stepHandlers = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.warn('⚙️ Workflow Engine Plugin initializing');
    
    // Create persistence directory
    if(this.config.persistWorkflows) {
      await mkdir(this.config.persistencePath, {recursive = new DefaultWorkflowEngine(this.config, this);
    await this.engine.initialize();
    
    // Load persisted workflows
    if(this.config.persistWorkflows) {
      await this.loadPersistedWorkflows();
    }
    
    this.initialized = true;
    this.emit('initialized');
    console.warn('✅ Workflow Engine Plugin initialized');
  }

  registerBuiltInHandlers() 
    // Delay step
    this.registerStepHandler('delay', async (context, params) => {
      const duration = params.duration || 1000;
      await new Promise(resolve => setTimeout(resolve, duration));
      return { delayed => {

      return { result, branch => {
      const data = this.getContextValue(context, params.input);

      return { output => {
      const results = await Promise.all(
        params.tasks.map(task => this.executeStep(task, context))
      );
      return { results };
    });
    
    // Loop step
    this.registerStepHandler('loop', async (context, params) => {
      const items = this.getContextValue(context, params.items);
      const results = [];
      
      for(const _item of items) {
        const loopContext = { ...context,loopItem = await this.executeStep(params.step, loopContext);
        results.push(result);
      }
      
      return { results };
    });

  registerStepHandler(type, handler): any {
    this.stepHandlers.set(type, handler);
    console.warn(`📌 Registered stephandler = this.stepHandlers.get(step.type);
    if(!handler) {
      throw new Error(`No handler registered for steptype = Object.keys(context).map(key => `const ${key} = context.${key};`).join('\n');
      const func = new Function('context', `${contextVars}\n return ${expression};`);
      return func(context);
    } catch(error) 
      throw new Error(`Failed to evaluatecondition = path.split('.');
    let value = context;
    
    for(const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  async applyTransformation(data, transformation): any {
    if(typeof transformation === 'function') {
      return transformation(data);
    }
    
    // Simple object transformation
    if(typeof transformation === 'object') {
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
      
      for(const file of workflowFiles) {
        const filePath = path.join(this.config.persistencePath, file);
        const data = JSON.parse(await readFile(filePath, 'utf8'));
        
        if(data.status === 'running' || data.status === 'paused') {
          this.activeWorkflows.set(data.id, data);
          console.warn(`📂 Loaded persistedworkflow = path.join(this.config.persistencePath, `${workflow.id}.workflow.json`);
    await writeFile(filePath, JSON.stringify(workflow, null, 2));

  async deleteWorkflow(workflowId): any 
    if (!this.config.persistWorkflows) return;
    
    try {
      const filePath = path.join(this.config.persistencePath, `${workflowId}.workflow.json`);
      await unlink(filePath);
    } catch(_error) {
      // File might not exist
    }

  async registerWorkflowDefinition(name, definition): any 
    this.workflowDefinitions.set(name, definition);
    console.warn(`📝 Registered workflow definition = {}): any {
    let definition;
    
    if(typeof workflowDefinitionOrName === 'string') {
      definition = this.workflowDefinitions.get(workflowDefinitionOrName);
      if(!definition) {
        throw new Error(`Workflow definition '${workflowDefinitionOrName}' not found`);
      }
    } else {
      definition = workflowDefinitionOrName;
    }
    
    // Check concurrent workflow limit
    const activeCount = Array.from(this.activeWorkflows.values())
      .filter(w => w.status === 'running').length;
    
    if(activeCount >= this.config.maxConcurrentWorkflows) {
      throw new Error(`Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`);
    }
    
    const result = await this.engine.startWorkflow(definition, context);
    
    this.emit('workflow = await this.engine.pauseWorkflow(workflowId);
    if(result.success) {
      this.emit('workflow = await this.engine.resumeWorkflow(workflowId);
    if(result.success) {
      this.emit('workflow = await this.engine.cancelWorkflow(workflowId);
    if(result.success) {
      this.emit('workflow = 100): any {
    const history = [];
    
    try {
      const files = await readdir(this.config.persistencePath);
      const workflowFiles = files.filter(f => f.endsWith('.workflow.json'));
      
      for (const file of workflowFiles.slice(-limit)) {
        const filePath = path.join(this.config.persistencePath, file);
        const data = JSON.parse(await readFile(filePath, 'utf8'));
        
        history.push({id = > new Date(b.startTime) - new Date(a.startTime));
  }

  async getWorkflowMetrics() {
    const metrics = {total = Array.from(this.activeWorkflows.values());
    metrics.total = workflows.length;
    
    workflows.forEach(w => {
      metrics[w.status] = (metrics[w.status] || 0) + 1;
    });
    
    const completed = workflows.filter(w => w.status === 'completed');
    if(completed.length > 0) {
      const totalDuration = completed.reduce((sum, w) => {
        return sum + (new Date(w.endTime) - new Date(w.startTime));
      }, 0);
      metrics.averageDuration = totalDuration / completed.length;
    }
    
    if(metrics.total > 0) {
      metrics.successRate = metrics.completed / metrics.total;
    }
    
    return metrics;
  }

  generateWorkflowVisualization(workflow): any {
    if (!this.config.enableVisualization) return null;
    
    // Generate a simple Mermaid diagram
    const lines = ['graph TD'];
    
    workflow.steps.forEach((step, index) => {
      const nodeId = `step${index}`;
      const label = step.name || step.type;
      const status = index < workflow.currentStep ? 'completed' : 
                     index === workflow.currentStep ? 'current' : 'pending';
      
      lines.push(`    ${nodeId}[${label}]`);
      
      if(status === 'completed') {
        lines.push(`    style ${nodeId}fill = == 'current') {
        lines.push(`    style ${nodeId}fill = config;
    this.plugin = plugin;
    this.workflows = new Map();
  }

  async initialize() 
    console.warn('📋 Default workflow engine ready');

  async startWorkflow(definition, context): any {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const workflow = {
      id => {
      console.error(`Workflow ${workflowId}failed = workflow.currentStep; i < workflow.steps.length; i++) {
        if(workflow.status !== 'running') {
          break; // Workflow was paused or cancelled
        }
        
        const step = workflow.steps[i];
        workflow.currentStep = i;
        
        await this.executeWorkflowStep(workflow, step, i);
      }
      
      if(workflow.status === 'running') {
        workflow.status = 'completed';
        workflow.endTime = new Date().toISOString();
        this.emit('workflow = 'failed';
      workflow.error = error.message;
      workflow.endTime = new Date().toISOString();
      this.emit('workflow = `step-${stepIndex}`;
    let retries = 0;
    const maxRetries = step.retries !== undefined ? step.retries = maxRetries) 
      try {
        this.emit('step = step.timeout || this.config.stepTimeout;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Step timeout')), timeout);
        });
        
        // Execute step
        const stepPromise = this.plugin.executeStep(step, workflow.context);
        const result = await Promise.race([stepPromise, timeoutPromise]);
        
        // Store result in context if specified
        if(step.output) {
          workflow.context[step.output] = result;
        }
        
        // Store in step results
        workflow.stepResults[stepId] = result;
        
        workflow.completedSteps.push({index = retries;
        
        console.warn(`⚠️ Step ${step.name} failed (attempt ${retries}/${maxRetries + 1}): ${error.message}`);
        
        if(retries > maxRetries) {
          this.emit('step = == 'continue') {
            workflow.stepResults[stepId] = {error = > setTimeout(resolve, this.config.retryDelay * retries));
      }
    }

  async getWorkflowStatus(workflowId): any {
    const workflow = this.workflows.get(workflowId);
    if(!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    const _duration = workflow.endTime ? 
      new Date(workflow.endTime) - new Date(workflow.startTime) :
      Date.now() - new Date(workflow.startTime);
    
    return {id = this.workflows.get(workflowId);
    if(workflow && workflow.status === 'running') {
      workflow.status = 'paused';
      workflow.pausedAt = new Date().toISOString();
      await this.plugin.saveWorkflow(workflow);
      return {success = this.workflows.get(workflowId);
    if(workflow && workflow.status === 'paused') {
      workflow.status = 'running';
      delete workflow.pausedAt;
      
      // Resume execution
      this.executeWorkflow(workflow).catch(_error => {
        console.error(`Workflow ${workflowId} failed afterresume = this.workflows.get(workflowId);
    if (workflow && ['running', 'paused'].includes(workflow.status)) {
      workflow.status = 'cancelled';
      workflow.endTime = new Date().toISOString();
      await this.plugin.saveWorkflow(workflow);
      return {success = Array.from(this.workflows.values())
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
