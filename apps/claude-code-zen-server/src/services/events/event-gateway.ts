import { getLogger } from '@claude-zen/foundation';
import { getEventBus, type CorrelatedPayload } from './event-bus';
import { WebDataService } from '../web/data.handler';

const logger = getLogger('EventGateway');

interface IDataService {
  getSystemStatus: WebDataService['getSystemStatus'];
  getSwarmStatus: WebDataService['getSwarmStatus'];
  getTaskMetrics: WebDataService['getTaskMetrics'];
  getTasks?: () => Promise<unknown[]>;
  createTask?: (input: unknown) => Promise<unknown>;
  getDocuments: WebDataService['getDocuments'];
  executeCommand: WebDataService['executeCommand'];
  getSettings: WebDataService['getSettings'];
  updateSettings: WebDataService['updateSettings'];
  getLogs: WebDataService['getLogs'];
  // Brain intelligence methods
  analyzeBrainTask?: (request: { task: string; context?: Record<string, unknown> }) => Promise<{ taskId: string; taskType: string; complexity: number; suggestedTools?: string[] }>;
  optimizeBrainPrompt?: (request: { task: string; basePrompt: string; context?: Record<string, unknown>; priority?: string }) => Promise<{ strategy: string; prompt: string; confidence: number; reasoning: string }>;
  estimateBrainComplexity?: (request: { taskId: string; task: string; context?: Record<string, unknown> }) => Promise<{ taskId: string; estimate: any; timestamp: number }>;
  getBrainStatus?: () => Promise<{ initialized: boolean; sessionId?: string; metrics: any }>;
}

export class EventGateway {
  constructor(private readonly data: IDataService) {}

  initialize(): void {
    const bus = getEventBus();

    // TaskMaster system status events
    bus.on('taskmaster:system:status:request', async (payload: CorrelatedPayload) => {
      try {
        const result = await this.data.getSystemStatus();
        bus.emit('taskmaster:system:status:response', { ...result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('status handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'status', error: String(error), correlationId: payload?.correlationId });
      }
    });

  this.registerSwarms(bus);

    this.registerTaskMetrics(bus);
    this.registerTasks(bus);
    this.registerDocuments(bus);
    this.registerExecute(bus);
    this.registerSettings(bus);
    this.registerLogs(bus);
    this.registerBrain(bus);
  }

  private registerSwarms(bus: ReturnType<typeof getEventBus>): void {
    bus.on('taskmaster:swarms:list:request', async (payload: CorrelatedPayload) => {
      try {
        const result = await this.data.getSwarmStatus();
        bus.emit('taskmaster:swarms:list:response', { swarms: result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('swarms handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'swarms', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }

  private registerTaskMetrics(bus: ReturnType<typeof getEventBus>): void {
    bus.on('taskmaster:tasks:metrics:request', async (payload: CorrelatedPayload) => {
      try {
        const result = await this.data.getTaskMetrics();
        bus.emit('taskmaster:tasks:metrics:response', { metrics: result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('tasks handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'tasks', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }

  private registerTasks(bus: ReturnType<typeof getEventBus>): void {
    bus.on('taskmaster:tasks:list:request', async (payload: CorrelatedPayload) => {
      try {
        const tasks = await this.data.getTasks?.();
        bus.emit('taskmaster:tasks:list:response', { tasks: tasks ?? [], correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('tasks list handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'tasks:list', error: String(error), correlationId: payload?.correlationId });
      }
    });

    bus.on('taskmaster:tasks:create:request', async (payload: CorrelatedPayload<{ input: unknown }>) => {
      try {
        const input = (payload && 'input' in payload ? (payload as { input: unknown }).input : undefined);
        const task = await this.data.createTask?.(input);
        bus.emit('taskmaster:tasks:create:response', { task, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('task create handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'tasks:create', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }

  private registerDocuments(bus: ReturnType<typeof getEventBus>): void {
    bus.on('taskmaster:documents:list:request', async (payload: CorrelatedPayload) => {
      try {
        const documents = await this.data.getDocuments();
        bus.emit('taskmaster:documents:list:response', { documents, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('documents list handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'documents:list', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }

  private registerExecute(bus: ReturnType<typeof getEventBus>): void {
    bus.on('taskmaster:execute:request', async (payload: CorrelatedPayload<{ input: unknown }>) => {
      try {
        const input = (payload && 'input' in payload ? (payload as { input: unknown }).input : undefined);
        const result = await this.data.executeCommand(input);
        bus.emit('taskmaster:execute:response', { result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('execute handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'execute', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }

  private registerSettings(bus: ReturnType<typeof getEventBus>): void {
    bus.on('taskmaster:settings:get:request', async (payload: CorrelatedPayload) => {
      try {
        const settings = await this.data.getSettings();
        bus.emit('taskmaster:settings:get:response', { settings, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('settings get handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'settings:get', error: String(error), correlationId: payload?.correlationId });
      }
    });

    bus.on('taskmaster:settings:update:request', async (payload: CorrelatedPayload<{ input: unknown }>) => {
      try {
        const input = (payload && 'input' in payload ? (payload as { input: unknown }).input : undefined);
        const settings = await this.data.updateSettings(input);
        bus.emit('taskmaster:settings:update:response', { settings, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('settings update handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'settings:update', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }

  private registerLogs(bus: ReturnType<typeof getEventBus>): void {
    bus.on('taskmaster:logs:list:request', async (payload: CorrelatedPayload<{ limit?: number; offset?: number }>) => {
      try {
        const limit = Number(payload && 'limit' in payload ? (payload as { limit?: number }).limit ?? 100 : 100);
        const offset = Number(payload && 'offset' in payload ? (payload as { offset?: number }).offset ?? 0 : 0);
        const logs = await this.data.getLogs(limit, offset);
        bus.emit('taskmaster:logs:list:response', { logs, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('logs list handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'logs:list', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }

  private registerBrain(bus: ReturnType<typeof getEventBus>): void {
    // Brain task analysis
    bus.on('taskmaster:brain:analyze:request', async (payload: CorrelatedPayload<{ task: string; context?: Record<string, unknown> }>) => {
      try {
        if (!this.data.analyzeBrainTask) {
          throw new Error('Brain task analysis not available');
        }
        const input = payload && 'task' in payload ? { task: payload.task, context: payload.context } : { task: '' };
        const analysis = await this.data.analyzeBrainTask(input);
        bus.emit('taskmaster:brain:analyze:response', { analysis, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('brain analyze handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'brain:analyze', error: String(error), correlationId: payload?.correlationId });
      }
    });

    // Brain prompt optimization
    bus.on('taskmaster:brain:optimize:request', async (payload: CorrelatedPayload<{ task: string; basePrompt: string; context?: Record<string, unknown>; priority?: string }>) => {
      try {
        if (!this.data.optimizeBrainPrompt) {
          throw new Error('Brain prompt optimization not available');
        }
        const input = payload && 'input' in payload ? {
          task: payload.task,
          basePrompt: payload.basePrompt,
          context: payload.context,
          priority: payload.priority
        } : { task: '', basePrompt: '' };
        const optimization = await this.data.optimizeBrainPrompt(input);
        bus.emit('taskmaster:brain:optimize:response', { optimization, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('brain optimize handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'brain:optimize', error: String(error), correlationId: payload?.correlationId });
      }
    });

    // Brain complexity estimation
    bus.on('taskmaster:brain:complexity:request', async (payload: CorrelatedPayload<{ taskId: string; task: string; context?: Record<string, unknown>; priority?: string }>) => {
      try {
        if (!this.data.estimateBrainComplexity) {
          throw new Error('Brain complexity estimation not available');
        }
        const input = payload && 'taskId' in payload ? {
          taskId: payload.taskId,
          task: payload.task,
          context: payload.context
        } : { taskId: '', task: '' };
        const complexity = await this.data.estimateBrainComplexity(input);
        bus.emit('taskmaster:brain:complexity:response', { complexity, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('brain complexity handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'brain:complexity', error: String(error), correlationId: payload?.correlationId });
      }
    });

    // Brain status
    bus.on('taskmaster:brain:status:request', async (payload: CorrelatedPayload) => {
      try {
        if (!this.data.getBrainStatus) {
          throw new Error('Brain status not available');
        }
        const status = await this.data.getBrainStatus();
        bus.emit('taskmaster:brain:status:response', { status, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('brain status handler failed', { error });
        bus.emit('taskmaster:error', { scope: 'brain:status', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }
}
