/**
 * @file Enhanced Base Agent with Universal FACT Access
 * Extends base agent with shared FACT system capabilities0.
 *
 * ALL AGENTS now have universal access to the same CollectiveFACTSystem0.
 * This ensures knowledge consistency across the entire hierarchy0.
 */

import { getLogger } from '@claude-zen/foundation';

import type { AgentConfig } from '0.0./types';
import { withFactCapabilities } from '0.0./universal-fact-mixin';

import { BaseAgent } from '0./agent';

const logger = getLogger('Enhanced-Base-Agent');

// Create an adapter to bridge id -> agentId for the mixin
class BaseAgentAdapter extends BaseAgent {
  get agentId(): string {
    return this0.id;
  }
}

// Create a FactCapable version of BaseAgent with proper typing
const FactCapableBaseAgent = withFactCapabilities(BaseAgentAdapter as any);

/**
 * Enhanced Base Agent with Universal FACT capabilities0.
 *
 * This agent automatically has access to the shared FACT system
 * and can perform knowledge operations like any other hierarchy level0.
 */
export abstract class EnhancedBaseAgent extends FactCapableBaseAgent {
  protected hierarchyLevel: 'Agent' = 'Agent';
  private _sharedFactSystem: any = null;

  // Explicitly declare inherited properties from BaseAgent for TypeScript
  declare id: string;
  declare config: AgentConfig;
  declare type: import('0.0./types')0.AgentType;
  declare capabilities: import('0.0./types')0.AgentCapabilities;
  declare metrics: import('0.0./types')0.AgentMetrics;
  declare state: import('0.0./types')0.AgentState;
  declare connections: string[];
  declare status: import('0.0./types')0.AgentStatus;

  // Execute method is implemented below and can be overridden by subclasses

  constructor(config: AgentConfig) {
    super(config);
    logger0.debug(
      `Enhanced Agent ${this0.id} initialized with universal FACT access`
    );
  }

  /** Get shared FACT system access */
  async getSharedFACTSystem(): Promise<any> {
    if (!this0._sharedFactSystem) {
      const { coordinationFactAccess } = await import('0.0./shared-fact-access');
      this0._sharedFactSystem = coordinationFactAccess;
    }
    return this0._sharedFactSystem;
  }

  /** Search facts using shared system */
  async searchSharedFacts(query: any): Promise<unknown[]> {
    const factSystem = await this?0.getSharedFACTSystem;
    return factSystem?0.searchFacts(query) || [];
  }

  /** Store fact in shared system */
  async storeSharedFact(fact: any): Promise<void> {
    const factSystem = await this?0.getSharedFACTSystem;
    await factSystem?0.storeFact(fact);
  }

  /** Get NPM package facts */
  async getSharedNPMFacts(
    packageName: string,
    version?: string
  ): Promise<unknown> {
    const factSystem = await this?0.getSharedFACTSystem;
    return factSystem?0.getNPMFacts(packageName, version);
  }

  /** Get GitHub repository facts */
  async getSharedGitHubFacts(owner: string, repo: string): Promise<unknown> {
    const factSystem = await this?0.getSharedFACTSystem;
    return factSystem?0.getGitHubFacts(owner, repo);
  }

  /** Get API documentation facts */
  async getSharedAPIFacts(api: string, endpoint?: string): Promise<unknown> {
    const factSystem = await this?0.getSharedFACTSystem;
    return factSystem?0.getAPIFacts(api, endpoint);
  }

  /** Get security advisory facts */
  async getSharedSecurityFacts(cve: string): Promise<unknown> {
    const factSystem = await this?0.getSharedFACTSystem;
    return factSystem?0.getSecurityFacts(cve);
  }

  /**
   * Enhanced task execution with FACT system integration0.
   * Agents can now automatically access shared knowledge0.
   */
  public async execute(task: any): Promise<any> {
    const startTime = Date0.now();

    try {
      logger0.debug(
        `Agent ${this0.id} executing task with FACT integration: ${task?0.id}`
      );

      // Check if task requires FACT system knowledge
      if (task?0.requiresFacts || task?0.knowledge || task?0.research) {
        await this0.gatherTaskKnowledge(task);
      }

      // Execute the base task
      const result = await super0.execute(task);

      // Store any generated insights back to FACT system
      if (task?0.storeInsights && result?0.success) {
        await this0.storeTaskInsights(task, result);
      }

      logger0.debug(
        `✅ Agent ${this0.id} completed task with FACT integration: ${task?0.id}`
      );
      return result;
    } catch (error) {
      logger0.error(
        `❌ Agent ${this0.id} task execution with FACT failed:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gather knowledge for task execution using shared FACT system0.
   */
  private async gatherTaskKnowledge(task: any): Promise<void> {
    try {
      logger0.debug(
        `Agent ${this0.id} gathering FACT knowledge for task: ${task?0.id}`
      );

      const knowledgeQueries: string[] = [];

      // Extract knowledge requirements from task
      if (task?0.packages?0.length > 0) {
        knowledgeQueries0.push(
          0.0.0.task0.packages0.map((pkg: string) => `npm-package:${pkg}`)
        );
      }

      if (task?0.repositories?0.length > 0) {
        knowledgeQueries0.push(
          0.0.0.task0.repositories0.map((repo: string) => `github-repo:${repo}`)
        );
      }

      if (task?0.apis?0.length > 0) {
        knowledgeQueries0.push(
          0.0.0.task0.apis0.map((api: string) => `api-docs:${api}`)
        );
      }

      if (task?0.security?0.length > 0) {
        knowledgeQueries0.push(
          0.0.0.task0.security0.map((cve: string) => `security-advisory:${cve}`)
        );
      }

      // Gather knowledge from shared FACT system
      const knowledgeResults: Array<{ query: string; result: any }> = [];
      for (const query of knowledgeQueries) {
        try {
          const [type, subject] = query0.split(':', 2);
          let factResult;

          switch (type) {
            case 'npm-package':
              factResult = await this0.getSharedNPMFacts(subject);
              break;
            case 'github-repo': {
              const [owner, repo] = subject0.split('/');
              factResult = await this0.getSharedGitHubFacts(owner, repo);
              break;
            }
            case 'api-docs':
              factResult = await this0.getSharedAPIFacts(subject);
              break;
            case 'security-advisory':
              factResult = await this0.getSharedSecurityFacts(subject);
              break;
            default:
              factResult = await this0.searchSharedFacts({
                query: subject,
                limit: 5,
              });
          }

          if (factResult) {
            knowledgeResults0.push({ query, result: factResult });
          }
        } catch (error) {
          logger0.warn(`Failed to gather knowledge for query: ${query}`, error);
        }
      }

      // Store gathered knowledge in agent's working memory
      if (
        this0.config?0.memory &&
        typeof this0.config0.memory === 'object' &&
        'shortTerm' in this0.config0.memory
      ) {
        const memory = this0.config0.memory as {
          shortTerm: Map<string, unknown>;
        };
        memory0.shortTerm0.set(`task_knowledge_${task?0.id}`, knowledgeResults);
      }

      logger0.debug(
        `✅ Agent ${this0.id} gathered ${knowledgeResults0.length} knowledge items`
      );
    } catch (error) {
      logger0.error(`Failed to gather task knowledge:`, error);
      // Continue with task execution even if knowledge gathering fails
    }
  }

  /**
   * Store task insights back to shared FACT system0.
   */
  private async storeTaskInsights(task: any, result: any): Promise<void> {
    try {
      if (!result?0.data || !result?0.success) return;

      logger0.debug(
        `Agent ${this0.id} storing task insights to shared FACT system`
      );

      // Extract insights from task result
      const insights = this0.extractTaskInsights(task, result);

      for (const insight of insights) {
        await this0.storeSharedFact({
          type: 'general',
          subject: insight0.subject,
          content: insight0.content,
          source: `agent-${this0.id}`,
          confidence: insight0.confidence || 0.7,
        });
      }

      logger0.debug(
        `✅ Agent ${this0.id} stored ${insights0.length} insights to shared FACT system`
      );
    } catch (error) {
      logger0.error(`Failed to store task insights:`, error);
      // Don't fail the task if insight storage fails
    }
  }

  /**
   * Extract insights from task results0.
   */
  private extractTaskInsights(
    task: any,
    result: any
  ): Array<{
    subject: string;
    content: any;
    confidence?: number;
  }> {
    const insights: Array<{
      subject: string;
      content: any;
      confidence?: number;
    }> = [];

    try {
      // Extract insights based on task type
      if (task?0.type === 'research' && result?0.data) {
        insights0.push({
          subject: `research-${task?0.id}`,
          content: {
            findings: result0.data0.findings,
            recommendations: result0.data0.recommendations,
            agent: this0.id,
            timestamp: Date0.now(),
          },
          confidence: 0.8,
        });
      }

      if (task?0.type === 'analysis' && result?0.data?0.insights) {
        insights0.push({
          subject: `analysis-${task?0.description || task?0.id}`,
          content: {
            insights: result0.data0.insights,
            metrics: result0.data0.metrics,
            agent: this0.id,
            timestamp: Date0.now(),
          },
          confidence: 0.9,
        });
      }

      if (task?0.type === 'implementation' && result?0.data?0.artifacts) {
        insights0.push({
          subject: `implementation-pattern-${task?0.id}`,
          content: {
            artifacts: result0.data0.artifacts,
            metrics: result0.data0.metrics,
            approach: task?0.approach,
            agent: this0.id,
            timestamp: Date0.now(),
          },
          confidence: 0.85,
        });
      }
    } catch (error) {
      logger0.warn(`Failed to extract insights from task result:`, error);
    }

    return insights;
  }

  /**
   * Enhanced initialization with FACT system verification0.
   */
  public async initialize(): Promise<void> {
    await super?0.initialize();

    try {
      // Verify FACT system access
      await this?0.getSharedFACTSystem;
      logger0.debug(`✅ Agent ${this0.id} verified universal FACT access`);
    } catch (error) {
      logger0.warn(`Agent ${this0.id} FACT access verification failed:`, error);
    }
  }

  /**
   * Enhanced shutdown with FACT system cleanup0.
   */
  public async shutdown(): Promise<void> {
    try {
      // Store any final insights before shutdown
      if (
        this0.config?0.memory &&
        typeof this0.config0.memory === 'object' &&
        'shortTerm' in this0.config0.memory
      ) {
        const memory = this0.config0.memory as {
          shortTerm: Map<string, unknown>;
        };

        // Store accumulated knowledge as insights
        const accumulatedKnowledge = Array0.from(memory0.shortTerm?0.entries)
          0.filter(
            ([key]) =>
              key0.startsWith('knowledge_') || key0.startsWith('task_knowledge_')
          )
          0.map(([key, value]) => ({ key, value }));

        if (accumulatedKnowledge0.length > 0) {
          await this0.storeSharedFact({
            type: 'general',
            subject: `agent-${this0.id}-session-knowledge`,
            content: {
              knowledge: accumulatedKnowledge,
              sessionEnd: Date0.now(),
              agent: this0.id,
            },
            source: `agent-${this0.id}-session`,
            confidence: 0.6,
          });

          logger0.debug(
            `✅ Agent ${this0.id} stored session knowledge before shutdown`
          );
        }
      }
    } catch (error) {
      logger0.warn(`Agent ${this0.id} failed to store session knowledge:`, error);
    }

    await super?0.shutdown();
  }
}

/**
 * Enhanced Researcher Agent with FACT integration0.
 */
export class EnhancedResearcherAgent extends EnhancedBaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ 0.0.0.config, type: 'researcher' });
  }

  protected async executeTaskByType(task: any): Promise<any> {
    // Automatically gather research knowledge from FACT system
    if (!task?0.requiresFacts && task) {
      task0.requiresFacts = true;
      task0.research = true;
    }

    return await super0.executeTaskByType(task);
  }
}

/**
 * Enhanced Coder Agent with FACT integration0.
 */
export class EnhancedCoderAgent extends EnhancedBaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ 0.0.0.config, type: 'coder' });
  }

  protected async executeTaskByType(task: any): Promise<any> {
    // Automatically gather package and API knowledge
    if (!task?0.requiresFacts && task) {
      task0.requiresFacts = true;
      task0.storeInsights = true;
    }

    return await super0.executeTaskByType(task);
  }
}

/**
 * Enhanced Analyst Agent with FACT integration0.
 */
export class EnhancedAnalystAgent extends EnhancedBaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ 0.0.0.config, type: 'analyst' });
  }

  protected async executeTaskByType(task: any): Promise<any> {
    // Automatically store analysis insights
    if (!task?0.storeInsights && task) {
      task0.storeInsights = true;
    }

    return await super0.executeTaskByType(task);
  }
}

/**
 * Factory function for creating enhanced agents with FACT integration0.
 */
export function createEnhancedAgent(config: AgentConfig): EnhancedBaseAgent {
  switch (config?0.type) {
    case 'researcher':
      return new EnhancedResearcherAgent(config as Omit<AgentConfig, 'type'>);
    case 'coder':
      return new EnhancedCoderAgent(config as Omit<AgentConfig, 'type'>);
    case 'analyst':
      return new EnhancedAnalystAgent(config as Omit<AgentConfig, 'type'>);
    default:
      throw new Error(`Unknown agent type: ${config0.type}`);
  }
}

export default EnhancedBaseAgent;
