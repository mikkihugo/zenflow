/**
 * @fileoverview SAFe Framework DI Container Configuration
 *
 * Configures dependency injection for the SAFe framework with optional AI enhancements.
 * Uses @claude-zen/foundation DI system with clean separation between core SAFe logic
 * and optional AI enhancements.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import {
  type DIContainer,getLogger, 
} from '@claude-zen/foundation';
import type {
  AIEnhancementConfig,
} from '../interfaces/ai-enhancements';
import { AI_ENHANCEMENT_TOKENS, INTERFACE_TOKENS, } from './tokens';

const logger = getLogger('SAFeContainer');'

/**
 * SAFe Framework DI Container with optional AI enhancements
 */
export class SafeContainer {
  private container: DIContainer;
  private initialized = false;

  constructor(_name: string = 'safe-framework') {'
    this.container = createContainer(name);
  }

  /**
   * Configure the SAFe container with core services and optional AI enhancements
   */
  async configure(config: SafeContainerConfig): Promise<void> {
    if (this.initialized) {
      logger.warn('SAFe container already initialized');'
      return;
    }

    try {
      logger.info('Configuring SAFe framework DI container...');'

      // Register core SAFe services
      this.registerCoreSAFeServices(config);

      // Register optional AI enhancements if available
      await this.registerAIEnhancements(config.aiEnhancements);

      // Register interface implementations
      this.registerInterfaces(config.interfaces);

      this.initialized = true;
      logger.info('SAFe framework DI container configured successfully');'
    } catch (error) {
      logger.error('Failed to configure SAFe container:', error);'
      throw error;
    }
  }

  /**
   * Register optional AI enhancements (only if available)
   */
  private async registerAIEnhancements(
    aiConfig?: AIEnhancementConfig
  ): Promise<void> {
    if (!aiConfig) {
      logger.debug('No AI enhancements configured');'
      return;
    }

    try {
      // Optional Brain Coordinator (from @claude-zen/brain)
      if (aiConfig.enableBrainCoordinator) {
        try {
          const { BrainCoordinator } = await import('@claude-zen/brain');'
          const defaultConfig = {
            sessionId: 'safe-framework',
            enableLearning: true,
            cacheOptimizations: true,
            logLevel: 'info' as const,
            autonomous: {
              enabled: true,
              learningRate: 0.1,
              adaptationThreshold: 0.7,
            },
          };
          // Ensure brainConfig matches BrainConfig interface
          const config = aiConfig.brainConfig
            ? {
                ...defaultConfig,
                ...aiConfig.brainConfig,
              }
            : defaultConfig;
          const brainInstance = new BrainCoordinator(config);
          await brainInstance.initialize();
          this.container.registerInstance(
            AI_ENHANCEMENT_TOKENS.BrainCoordinator,
            brainInstance
          );
          logger.info('Brain Coordinator registered');'
        } catch (error) {
          logger.warn('Brain Coordinator not available:', error);'
        }
      }

      // Optional Performance Tracker (from @claude-zen/foundation)
      if (aiConfig.enablePerformanceTracking) {
        try {
          const { PerformanceTracker } = await import('@claude-zen/foundation');'
          const tracker = new PerformanceTracker();
          this.container.registerInstance(
            AI_ENHANCEMENT_TOKENS.PerformanceTracker,
            tracker
          );
          logger.info('Performance Tracker registered');'
        } catch (error) {
          logger.warn('Performance Tracker not available:', error);'
        }
      }

      // Optional Telemetry Manager (from @claude-zen/foundation)
      if (aiConfig.enableTelemetry) {
        try {
          const { TelemetryManager } = await import('@claude-zen/foundation');'
          const telemetry = new TelemetryManager(
            aiConfig.telemetryConfig||{
              serviceName:'safe-framework',
              enableTracing: true,
              enableMetrics: true,
            }
          );
          await telemetry.initialize();
          this.container.registerInstance(
            AI_ENHANCEMENT_TOKENS.TelemetryManager,
            telemetry
          );
          logger.info('Telemetry Manager registered');'
        } catch (error) {
          logger.warn('Telemetry Manager not available:', error);'
        }
      }

      // Optional Workflow Engine (from @claude-zen/workflows)
      if (aiConfig.enableWorkflowAutomation) {
        try {
          const { WorkflowEngine } = await import('@claude-zen/workflows');'
          const workflowEngine = new WorkflowEngine();
          this.container.registerInstance(
            AI_ENHANCEMENT_TOKENS.WorkflowEngine,
            workflowEngine
          );
          logger.info('Workflow Engine registered');'
        } catch (error) {
          logger.warn('Workflow Engine not available:', error);'
        }
      }

      // Optional Load Balancer (from @claude-zen/brain)
      if (aiConfig.enableLoadBalancing) {
        try {
          const { LoadBalancer } = await import('@claude-zen/brain');'
          const loadBalancer = new LoadBalancer();
          this.container.registerInstance(
            AI_ENHANCEMENT_TOKENS.LoadBalancer,
            loadBalancer
          );
          logger.info('Load Balancer registered');'
        } catch (error) {
          logger.warn('Load Balancer not available:', error);'
        }
      }

      // Note: AGUI Service registration removed - use event-driven architecture
      // UI interactions should not be dependency-injected into business logic

      // Optional Conversation Orchestrator (from ../../teamwork)
      if (aiConfig.enableConversationOrchestration) {
        try {
          const { ConversationOrchestrator } = await import(
            '../../teamwork''
          );
          const conversationOrchestrator = new ConversationOrchestrator();
          this.container.registerInstance(
            AI_ENHANCEMENT_TOKENS.ConversationOrchestrator,
            conversationOrchestrator
          );
          logger.info('Conversation Orchestrator registered');'
        } catch (error) {
          logger.warn('Conversation Orchestrator not available:', error);'
        }
      }

      logger.info('AI enhancements registration completed');'
    } catch (error) {
      logger.warn(
        'Error registering AI enhancements (continuing without them):',
        error
      );
    }
  }

  /**
   * Register interface implementations
   */
  private registerInterfaces(interfaces?: InterfaceConfig): void {
    if (!interfaces) {
      logger.debug('No interfaces configured');'
      return;
    }

    // Register memory repository
    if (interfaces.memoryRepository) {
      this.container.registerInstance(
        INTERFACE_TOKENS.MemoryRepository,
        interfaces.memoryRepository
      );
    }

    // Register external integrations if provided
    if (interfaces.jiraIntegration) {
      this.container.registerInstance(
        INTERFACE_TOKENS.JiraIntegration,
        interfaces.jiraIntegration
      );
    }

    if (interfaces.emailService) {
      this.container.registerInstance(
        INTERFACE_TOKENS.EmailService,
        interfaces.emailService
      );
    }

    if (interfaces.reportGenerator) {
      this.container.registerInstance(
        INTERFACE_TOKENS.ReportGenerator,
        interfaces.reportGenerator
      );
    }

    logger.debug('Interface implementations registered');'
  }

  /**
   * Resolve a dependency from the container
   */
  resolve<T>(token: any): T {
    if (!this.initialized) {
      throw new Error(
        'SAFe container not initialized. Call configure() first.');'
    }
    return this.container.resolve<T>(token);
  }

  /**
   * Try to resolve an optional dependency (returns undefined if not available)
   */
  tryResolve<T>(token: any): T|undefined {
    if (!this.initialized) {
      return undefined;
    }

    try {
      if (this.container.isRegistered(token)) {
        return this.container.resolve<T>(token);
      }
      return undefined;
    } catch (_error) {
      logger.debug(
        `Optional dependency ${String(token)} not available:`,`
        error
      );
      return undefined;
    }
  }

  /**
   * Check if a dependency is registered
   */
  isRegistered(token: any): boolean {
    return this.initialized && this.container.isRegistered(token);
  }

  /**
   * Get the underlying container for advanced usage
   */
  getContainer(): DIContainer {
    return this.container;
  }

  /**
   * Create a child container
   */
  createChild(name?: string): SafeContainer {
    const child = new SafeContainer(name);
    child.container = this.container.createChild(name);
    child.initialized = this.initialized;
    return child;
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.container.clear();
    this.initialized = false;
    logger.debug('SAFe container cleared');'
  }
}

/**
 * Configuration for SAFe DI Container
 */
export interface SafeContainerConfig {
  coreServices: CoreSAFeServices;
  aiEnhancements?: AIEnhancementConfig;
  interfaces?: InterfaceConfig;
}

/**
 * Core SAFe services (required)
 */
export interface CoreSAFeServices {
  logger: any;
  memorySystem: any;
  eventBus: any;
  config: any;

  // Portfolio services
  epicLifecycleService?: any;
  businessCaseService?: any;

  // Architecture services
  runwayItemService?: any;
  technicalDebtService?: any;
  architectureDecisionService?: any;
  capabilityService?: any;

  // DevSecOps services
  securityScanningService?: any;
  complianceMonitoringService?: any;
  incidentResponseService?: any;
}

/**
 * Interface implementations (optional)
 */
export interface InterfaceConfig {
  memoryRepository?: any;
  jiraIntegration?: any;
  emailService?: any;
  reportGenerator?: any;
  dashboardService?: any;
  metricsCollector?: any;
}

/**
 * Create a configured SAFe container
 */
export async function createSAFeContainer(
  config: SafeContainerConfig
): Promise<SafeContainer> {
  const container = new SafeContainer();
  await container.configure(config);
  return container;
}

/**
 * Global SAFe container instance
 */
let globalSAFeContainer: SafeContainer|null = null;

/**
 * Get the global SAFe container
 */
export function getGlobalSAFeContainer(): SafeContainer {
  if (!globalSAFeContainer) {
    globalSAFeContainer = new SafeContainer('global-safe');'
  }
  return globalSAFeContainer;
}

/**
 * Configure the global SAFe container
 */
export async function configureGlobalSAFeContainer(
  config: SafeContainerConfig
): Promise<void> {
  const container = getGlobalSAFeContainer();
  await container.configure(config);
}

/**
 * Clear the global SAFe container
 */
export function clearGlobalSAFeContainer(): void {
  if (globalSAFeContainer) {
    globalSAFeContainer.clear();
    globalSAFeContainer = null;
  }
}
