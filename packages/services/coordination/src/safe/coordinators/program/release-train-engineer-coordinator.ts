/**
 * @fileoverview Release Train Engineer (RTE) Coordinator - Program Execution Management
 * 
 * Manages Program Increment (PI) planning and execution:
 * - PI planning facilitation and coordination
 * - ART synchronization and dependency management
 * - Program predictability and flow metrics
 * - Integration with TaskMaster for approval workflows
 * 
 * @author Claude-Zen SAFe Team
 * @since 1.0.0
 */

import { EventBus, getLogger } from '@claude-zen/foundation';
import type { 
  ProgramIncrement,
  AgileReleaseTrain,
  PIObjective,
  Feature,
  Dependency,
  Risk
} from '../../types';
const logger = getLogger('safe-rte-coordinator'');

// TaskMaster integration for PI approval workflows
interface TaskMasterApprovalRequest {
  id: string;
  type:'pi_planning'|'scope_change'|'dependency_resolution';
  piId: string;
  title: string;
  description: string;
  requiredApprover: string;
  urgency:'low'|'medium'|'high';
  dueDate: Date;
  createdAt: Date;
}

export interface RTEEvents {
 'pi:planning_started: {
    pi: ProgramIncrement;
    art: AgileReleaseTrain;
    objectives: PIObjective[];
    timestamp: number;
  };
 'pi:planning_completed: {
    pi: ProgramIncrement;
    objectives: PIObjective[];
    confidence: number;
    risks: Risk[];
    dependencies: Dependency[];
    timestamp: number;
  };
 'pi:execution_started: {
    pi: ProgramIncrement;
    plannedFeatures: Feature[];
    teamCapacity: number;
    timestamp: number;
  };
 'pi:objective_committed: {
    pi: ProgramIncrement;
    objective: PIObjective;
    confidence: number;
    timestamp: number;
  };
 'pi:dependency_identified: {
    pi: ProgramIncrement;
    dependency: Dependency;
    severity: low'|'medium'|'high'|'critical';
    timestamp: number;
  };
 'pi:approval_requested: {
    pi: ProgramIncrement;
    approvalType:'pi_planning'|'scope_change'|'dependency_resolution';
    taskMasterRequest: TaskMasterApprovalRequest;
    timestamp: number;
  };
 'pi:metrics_updated: {
    pi: ProgramIncrement;
    velocity: number;
    predictability: number;
    qualityMetrics: Record<string, number>;
    timestamp: number;
  };
}

export class ReleaseTrainEngineerCoordinator extends EventBus<RTEEvents> {
  private programIncrements: Map<string, ProgramIncrement> = new Map();
  private piObjectives: Map<string, PIObjective[]> = new Map();
  private dependencies: Map<string, Dependency[]> = new Map();

  constructor() {
    super();
    logger.info('ReleaseTrainEngineerCoordinator initialized'');
  }

  /**
   * Start PI Planning session with stakeholder coordination
   */
  async startPIPlanning(
    piId: string,
    artId: string,
    duration: number = 8 // hours
  ): Promise<void> {
    const pi = this.programIncrements.get(piId);
    if (!pi) {
      throw new Error(`Program Increment not found: ${piId}`);
    }

    // Mock ART for now - would come from ART registry
    const art: AgileReleaseTrain = {
      id: artId,
      name: `ART-${artId}`,
      description:'Agile Release Train,
      teams: [],
      cadence:'quarterly
    };

    const objectives: PIObjective[] = [];

    await this.emitSafe('pi:planning_started,{
      pi,
      art,
      objectives,
      timestamp: Date.now()
    });

    logger.info(`PI Planning started for ${pi.id} with ART ${artId}`);
  }

  /**
   * Complete PI Planning with team commitments and confidence voting
   */
  async completePIPlanning(
    piId: string,
    objectives: PIObjective[],
    teamConfidence: number,
    risks: Risk[],
    dependencies: Dependency[]
  ): Promise<void> {
    const pi = this.programIncrements.get(piId);
    if (!pi) {
      throw new Error(`Program Increment not found: ${piId}`);
    }

    this.piObjectives.set(piId, objectives);
    this.dependencies.set(piId, dependencies);

    await this.emitSafe('pi:planning_completed,{
      pi,
      objectives,
      confidence: teamConfidence,
      risks,
      dependencies,
      timestamp: Date.now()
    });

    logger.info(`PI Planning completed for ${pi.id} with ${teamConfidence}% confidence`);
  }

  /**
   * Start PI Execution with feature delivery tracking
   */
  async startPIExecution(piId: string, plannedFeatures: Feature[]): Promise<void> {
    const pi = this.programIncrements.get(piId);
    if (!pi) {
      throw new Error(`Program Increment not found: ${piId}`);
    }

    const teamCapacity = this.calculateTeamCapacity(plannedFeatures);

    await this.emitSafe('pi:execution_started,{
      pi,
      plannedFeatures,
      teamCapacity,
      timestamp: Date.now()
    });

    logger.info(`PI Execution started for ${pi.id} with ${plannedFeatures.length} features`);
  }

  /**
   * Commit to PI Objective with confidence assessment
   */
  async commitToPIObjective(
    piId: string,
    objective: PIObjective,
    confidence: number
  ): Promise<void> {
    const pi = this.programIncrements.get(piId);
    if (!pi) {
      throw new Error(`Program Increment not found: ${piId}`);
    }

    await this.emitSafe('pi:objective_committed,{
      pi,
      objective,
      confidence,
      timestamp: Date.now()
    });

    logger.info(`Committed to PI Objective: ${objective.title} with ${confidence}% confidence`);
  }

  /**
   * Identify and escalate dependencies with SPARC integration
   */
  async identifyDependency(
    piId: string,
    dependency: Dependency,
    severity: low'|'medium'|'high'|'critical
  ): Promise<void> {
    const pi = this.programIncrements.get(piId);
    if (!pi) {
      throw new Error(`Program Increment not found: ${piId}`);
    }

    // Add to dependencies map
    const piDependencies = this.dependencies.get(piId)|| [];
    piDependencies.push(dependency);
    this.dependencies.set(piId, piDependencies);

    await this.emitSafe('pi:dependency_identified,{
      pi,
      dependency,
      severity,
      timestamp: Date.now()
    });

    // If critical, request immediate TaskMaster approval for resolution
    if (severity ==='critical){
      await this.requestDependencyResolution(piId, dependency);
    }

    logger.info(`Dependency identified for ${pi.id}: ${dependency.description} - Severity: ${severity}`);
  }

  /**
   * Request approval for PI changes via TaskMaster
   */
  async requestApproval(
    piId: string,
    approvalType:'pi_planning'|'scope_change'|'dependency_resolution
  ): Promise<TaskMasterApprovalRequest> {
    const pi = this.programIncrements.get(piId);
    if (!pi) {
      throw new Error(`Program Increment not found: ${piId}`);
    }

    const approvalRequest: TaskMasterApprovalRequest = {
      id: `approval-${pi.id}-${approvalType}-${Date.now()}`,
      type: approvalType,
      piId: pi.id,
      title: `${{approvalType.replace('_,'')} Approval: ${pi.title}}`,
      description: `Requesting ${approvalType} approval for Program Increment: ${pi.title}`,
      requiredApprover: this.getRequiredApprover(approvalType),
      urgency: this.getUrgencyLevel(approvalType),
      dueDate: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days
      createdAt: new Date()
    };

    await this.emitSafe('pi:approval_requested,{
      pi,
      approvalType,
      taskMasterRequest: approvalRequest,
      timestamp: Date.now()
    });

    logger.info(`Approval requested for PI: ${pi.title} - Type: ${approvalType}`);
    return approvalRequest;
  }

  /**
   * Update PI metrics and predictability tracking
   */
  async updatePIMetrics(
    piId: string,
    velocity: number,
    predictability: number,
    qualityMetrics: Record<string, number>
  ): Promise<void> {
    const pi = this.programIncrements.get(piId);
    if (!pi) {
      throw new Error(`Program Increment not found: ${piId}`);
    }

    await this.emitSafe('pi:metrics_updated,{
      pi,
      velocity,
      predictability,
      qualityMetrics,
      timestamp: Date.now()
    });

    logger.info(`PI Metrics updated for ${pi.id}: Velocity: ${velocity}, Predictability: ${predictability}%`);
  }

  /**
   * Register a new Program Increment
   */
  registerPI(pi: ProgramIncrement): void {
    this.programIncrements.set(pi.id, pi);
    logger.info(`Program Increment registered: ${pi.title} (${pi.id})`);
  }

  /**
   * Get PI by ID
   */
  getPI(piId: string): ProgramIncrement| undefined {
    return this.programIncrements.get(piId);
  }

  /**
   * Get PI objectives
   */
  getPIObjectives(piId: string): PIObjective[] {
    return this.piObjectives.get(piId)|| [];
  }

  /**
   * Get PI dependencies
   */
  getPIDependencies(piId: string): Dependency[] {
    return this.dependencies.get(piId)|| [];
  }

  // Private helper methods

  private async requestDependencyResolution(piId: string, dependency: Dependency): Promise<void> {
    await this.requestApproval(piId,'dependency_resolution'');
  }

  private getRequiredApprover(approvalType: string): string {
    switch (approvalType) {
      case'pi_planning: return'product-manager';
      case'scope_change: return'release-train-engineer';
      case'dependency_resolution: return'solution-train-engineer';
      default: return'release-train-engineer';
    }
  }

  private getUrgencyLevel(approvalType: string):'low'|'medium'|'high '{
    switch (approvalType) {
      case'pi_planning: return'high';
      case'scope_change: return'medium';
      case'dependency_resolution: return'high';
      default: return'medium';
    }
  }

  private calculateTeamCapacity(features: Feature[]): number {
    // Simple capacity calculation - would be more sophisticated in real implementation
    return features.reduce((total, feature) => total + (feature.storyPoints|| 0), 0);
  }
}

export default ReleaseTrainEngineerCoordinator;