/**
 * @file Enhanced Base Agent with Universal FACT Access
 * Extends base agent with shared FACT system capabilities.
 *
 * ALL AGENTS now have universal access to the same CollectiveFACTSystem.
 * This ensures knowledge consistency across the entire hierarchy.
 */

import {
  withFactCapabilities,
} from '../universal-fact-mixin';
import { getLogger } from '@claude-zen/foundation'
import type { AgentConfig } from '../types';
import { BaseAgent } from './agent';

const logger = getLogger('Enhanced-Base-Agent');

// Create an adapter to bridge id -> agentId for the mixin
class BaseAgentAdapter extends BaseAgent {
  get agentId(): string {
    return this.id;
  }
}

// Create a FactCapable version of BaseAgent
const FactCapableBaseAgent = withFactCapabilities(BaseAgentAdapter);

/**
 * Enhanced Base Agent with Universal FACT capabilities.
 *
 * This agent automatically has access to the shared FACT system
 * and can perform knowledge operations like any other hierarchy level.
 */
export class EnhancedBaseAgent extends FactCapableBaseAgent
{
  protected hierarchyLevel: 'Agent' = 'Agent';
  private _sharedFactSystem: any = null;

  constructor(config: AgentConfig) {
    super(config);
    logger.debug(
      `Enhanced Agent ${this.id} initialized with universal FACT access`
    );
  }

  /** Get shared FACT system access */
  async getSharedFACTSystem(): Promise<any> {
    if (!this._sharedFactSystem) {
      const { coordinationFactAccess } = await import('../shared-fact-access');
      this._sharedFactSystem = coordinationFactAccess;
    }
    return this._sharedFactSystem;
  }

  /** Search facts using shared system */
  async searchSharedFacts(query: unknown): Promise<unknown[]> {
    const factSystem = await this.getSharedFACTSystem();
    return factSystem?.searchFacts(query) || [];
  }

  /** Store fact in shared system */
  async storeSharedFact(fact: any): Promise<void> {
    const factSystem = await this.getSharedFACTSystem();
    await factSystem?.storeFact(fact);
  }

  /** Get NPM package facts */
  async getSharedNPMFacts(packageName: string, version?: string): Promise<unknown> {
    const factSystem = await this.getSharedFACTSystem();
    return factSystem?.getNPMFacts(packageName, version);
  }

  /** Get GitHub repository facts */
  async getSharedGitHubFacts(owner: string, repo: string): Promise<unknown> {
    const factSystem = await this.getSharedFACTSystem();
    return factSystem?.getGitHubFacts(owner, repo);
  }

  /** Get API documentation facts */
  async getSharedAPIFacts(api: string, endpoint?: string): Promise<unknown> {
    const factSystem = await this.getSharedFACTSystem();
    return factSystem?.getAPIFacts(api, endpoint);
  }

  /** Get security advisory facts */
  async getSharedSecurityFacts(cve: string): Promise<unknown> {
    const factSystem = await this.getSharedFACTSystem();
    return factSystem?.getSecurityFacts(cve);
  }

  /**
   * Enhanced task execution with FACT system integration.
   * Agents can now automatically access shared knowledge.
   */
  public override async execute(task: any): Promise<any> {
    const startTime = Date.now();

    try {
      logger.debug(
        `Agent ${this.id} executing task with FACT integration: ${task?.id}`
      );

      // Check if task requires FACT system knowledge
      if (task?.requiresFacts || task?.knowledge || task?.research) {
        await this.gatherTaskKnowledge(task);
      }

      // Execute the base task
      const result = await super.execute(task);

      // Store any generated insights back to FACT system
      if (task?.storeInsights && result?.success) {
        await this.storeTaskInsights(task, result);
      }

      logger.debug(
        `✅ Agent ${this.id} completed task with FACT integration: ${task?.id}`
      );
      return result;
    } catch (error) {
      logger.error(
        `❌ Agent ${this.id} task execution with FACT failed:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gather knowledge for task execution using shared FACT system.
   */
  private async gatherTaskKnowledge(task: any): Promise<void> {
    try {
      logger.debug(
        `Agent ${this.id} gathering FACT knowledge for task: ${task?.id}`
      );

      const knowledgeQueries: string[] = [];

      // Extract knowledge requirements from task
      if (task?.packages?.length > 0) {
        knowledgeQueries.push(
          ...task.packages.map((pkg: string) => `npm-package:${pkg}`)
        );
      }

      if (task?.repositories?.length > 0) {
        knowledgeQueries.push(
          ...task.repositories.map((repo: string) => `github-repo:${repo}`)
        );
      }

      if (task?.apis?.length > 0) {
        knowledgeQueries.push(
          ...task.apis.map((api: string) => `api-docs:${api}`)
        );
      }

      if (task?.security?.length > 0) {
        knowledgeQueries.push(
          ...task.security.map((cve: string) => `security-advisory:${cve}`)
        );
      }

      // Gather knowledge from shared FACT system
      const knowledgeResults: Array<{ query: string; result: any }> = [];
      for (const query of knowledgeQueries) {
        try {
          const [type, subject] = query.split(':', 2);
          let factResult;

          switch (type) {
            case 'npm-package':
              factResult = await this.getSharedNPMFacts(subject);
              break;
            case 'github-repo': {
              const [owner, repo] = subject.split('/');
              factResult = await this.getSharedGitHubFacts(owner, repo);
              break;
            }
            case 'api-docs':
              factResult = await this.getSharedAPIFacts(subject);
              break;
            case 'security-advisory':
              factResult = await this.getSharedSecurityFacts(subject);
              break;
            default:
              factResult = await this.searchSharedFacts({
                query: subject,
                limit: 5,
              });
          }

          if (factResult) {
            knowledgeResults.push({ query, result: factResult });
          }
        } catch (error) {
          logger.warn(`Failed to gather knowledge for query: ${query}`, error);
        }
      }

      // Store gathered knowledge in agent's working memory
      if (
        this.config?.memory &&
        typeof this.config.memory === 'object' &&
        'shortTerm' in this.config.memory
      ) {
        const memory = this.config.memory as {
          shortTerm: Map<string, unknown>;
        };
        memory.shortTerm.set(`task_knowledge_${task?.id}`, knowledgeResults);
      }

      logger.debug(
        `✅ Agent ${this.id} gathered ${knowledgeResults.length} knowledge items`
      );
    } catch (error) {
      logger.error(`Failed to gather task knowledge:`, error);
      // Continue with task execution even if knowledge gathering fails
    }
  }

  /**
   * Store task insights back to shared FACT system.
   */
  private async storeTaskInsights(
    task: any,
    result: any
  ): Promise<void> {
    try {
      if (!result?.data || !result?.success) return;

      logger.debug(
        `Agent ${this.id} storing task insights to shared FACT system`
      );

      // Extract insights from task result
      const insights = this.extractTaskInsights(task, result);

      for (const insight of insights) {
        await this.storeSharedFact({
          type: 'general',
          subject: insight.subject,
          content: insight.content,
          source: `agent-${this.id}`,
          confidence: insight.confidence || 0.7,
        });
      }

      logger.debug(
        `✅ Agent ${this.id} stored ${insights.length} insights to shared FACT system`
      );
    } catch (error) {
      logger.error(`Failed to store task insights:`, error);
      // Don't fail the task if insight storage fails
    }
  }

  /**
   * Extract insights from task results.
   */
  private extractTaskInsights(
    task: any,
    result: any
  ): Array<{
    subject: string;
    content: unknown;
    confidence?: number;
  }> {
    const insights: Array<{
      subject: string;
      content: unknown;
      confidence?: number;
    }> = [];

    try {
      // Extract insights based on task type
      if (task?.type === 'research' && result?.data) {
        insights.push({
          subject: `research-${task?.id}`,
          content: {
            findings: result.data.findings,
            recommendations: result.data.recommendations,
            agent: this.id,
            timestamp: Date.now(),
          },
          confidence: 0.8,
        });
      }

      if (task?.type === 'analysis' && result?.data?.insights) {
        insights.push({
          subject: `analysis-${task?.description || task?.id}`,
          content: {
            insights: result.data.insights,
            metrics: result.data.metrics,
            agent: this.id,
            timestamp: Date.now(),
          },
          confidence: 0.9,
        });
      }

      if (task?.type === 'implementation' && result?.data?.artifacts) {
        insights.push({
          subject: `implementation-pattern-${task?.id}`,
          content: {
            artifacts: result.data.artifacts,
            metrics: result.data.metrics,
            approach: task?.approach,
            agent: this.id,
            timestamp: Date.now(),
          },
          confidence: 0.85,
        });
      }
    } catch (error) {
      logger.warn(`Failed to extract insights from task result:`, error);
    }

    return insights;
  }

  /**
   * Enhanced initialization with FACT system verification.
   */
  public override async initialize(): Promise<void> {
    await super.initialize();

    try {
      // Verify FACT system access
      await this.getSharedFACTSystem();
      logger.debug(`✅ Agent ${this.id} verified universal FACT access`);
    } catch (error) {
      logger.warn(`Agent ${this.id} FACT access verification failed:`, error);
    }
  }

  /**
   * Enhanced shutdown with FACT system cleanup.
   */
  public override async shutdown(): Promise<void> {
    try {
      // Store any final insights before shutdown
      if (
        this.config?.memory &&
        typeof this.config.memory === 'object' &&
        'shortTerm' in this.config.memory
      ) {
        const memory = this.config.memory as {
          shortTerm: Map<string, unknown>;
        };

        // Store accumulated knowledge as insights
        const accumulatedKnowledge = Array.from(memory.shortTerm.entries())
          .filter(
            ([key]) =>
              key.startsWith('knowledge_') || key.startsWith('task_knowledge_')
          )
          .map(([key, value]) => ({ key, value }));

        if (accumulatedKnowledge.length > 0) {
          await this.storeSharedFact({
            type: 'general',
            subject: `agent-${this.id}-session-knowledge`,
            content: {
              knowledge: accumulatedKnowledge,
              sessionEnd: Date.now(),
              agent: this.id,
            },
            source: `agent-${this.id}-session`,
            confidence: 0.6,
          });

          logger.debug(
            `✅ Agent ${this.id} stored session knowledge before shutdown`
          );
        }
      }
    } catch (error) {
      logger.warn(`Agent ${this.id} failed to store session knowledge:`, error);
    }

    await super.shutdown();
  }
}

/**
 * Enhanced Researcher Agent with FACT integration.
 */
export class EnhancedResearcherAgent extends EnhancedBaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'researcher' });
  }

  protected override async executeTaskByType(task: any): Promise<any> {
    // Automatically gather research knowledge from FACT system
    if (!task?.requiresFacts && task) {
        task.requiresFacts = true;
        task.research = true;
      }

    return await super.executeTaskByType(task);
  }
}

/**
 * Enhanced Coder Agent with FACT integration.
 */
export class EnhancedCoderAgent extends EnhancedBaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'coder' });
  }

  protected override async executeTaskByType(task: any): Promise<any> {
    // Automatically gather package and API knowledge
    if (!task?.requiresFacts && task) {
        task.requiresFacts = true;
        task.storeInsights = true;
      }

    return await super.executeTaskByType(task);
  }
}

/**
 * Enhanced Analyst Agent with FACT integration.
 */
export class EnhancedAnalystAgent extends EnhancedBaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'analyst' });
  }

  protected override async executeTaskByType(task: any): Promise<any> {
    // Automatically store analysis insights
    if (!task?.storeInsights && task) {
        task.storeInsights = true;
      }

    return await super.executeTaskByType(task);
  }
}

/**
 * Factory function for creating enhanced agents with FACT integration.
 */
export function createEnhancedAgent(config: AgentConfig): EnhancedBaseAgent {
  switch (config?.type) {
    case 'researcher':
      return new EnhancedResearcherAgent(config as Omit<AgentConfig, 'type'>);
    case 'coder':
      return new EnhancedCoderAgent(config as Omit<AgentConfig, 'type'>);
    case 'analyst':
      return new EnhancedAnalystAgent(config as Omit<AgentConfig, 'type'>);
    default:
      return new EnhancedBaseAgent(config);
  }
}

export default EnhancedBaseAgent;
