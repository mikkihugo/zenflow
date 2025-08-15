/**
 * @file Coordination system: roadmap-integration.
 */

import { getLogger } from '../../../../config/logging-config';
import {
  Priority,
  type ProjectDomain,
  type SPARCProject,
} from '../types/sparc-types';

const logger = getLogger(
  'coordination-swarm-sparc-integrations-roadmap-integration'
);

// Roadmap-specific type definitions
export interface Epic {
  id: string;
  title: string;
  description: string;
  features: string[];
  business_value: string;
  timeline: {
    start_date: string;
    end_date: string;
  };
  status: 'approved' | 'planned' | 'in_progress' | 'completed';
  sparc_project_id: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  epic_id: string;
  user_stories: string[];
  status: 'backlog' | 'planned' | 'in_progress' | 'completed';
  sparc_project_id: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  timeframe: {
    start_quarter: string;
    end_quarter: string;
  };
  items: RoadmapItem[];
  last_updated: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: 'epic' | 'feature' | 'initiative';
  quarter: string;
  effort_estimate: number;
  business_value: 'high' | 'medium' | 'low';
  dependencies: string[];
  status: 'planned' | 'in_progress' | 'completed';
  sparc_project_id?: string;
}

/**
 * SPARC Roadmap and Epic Management Integration.
 *
 * Provides strategic planning integration between SPARC projects and.
 * Enterprise roadmap planning systems.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export interface SPARCRoadmapPlanning {
  generateEpicFromSPARCProject(project: SPARCProject): Promise<Epic>;
  generateFeaturesFromProject(project: SPARCProject): Promise<Feature[]>;
  addProjectToRoadmap(
    project: SPARCProject,
    targetQuarter: string
  ): Promise<void>;
  generateDomainRoadmap(
    domain: ProjectDomain,
    timeframe: { start: string; end: string }
  ): Promise<Roadmap>;
}

export class SPARCRoadmapManager implements SPARCRoadmapPlanning {
  private readonly projectRoot: string;
  private readonly roadmapFile: string;
  private readonly epicsFile: string;
  private readonly featuresFile: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.roadmapFile = path.join(projectRoot, 'docs', 'roadmap.json');
    this.epicsFile = path.join(projectRoot, 'docs', 'epics.json');
    this.featuresFile = path.join(projectRoot, 'docs', 'features.json');
  }

  /**
   * Generate an epic from a SPARC project.
   *
   * @param project
   */
  async generateEpicFromSPARCProject(project: SPARCProject): Promise<Epic> {
    const epic: Epic = {
      id: `EPIC-${project.id}`,
      title: `${project.name} Development Epic`,
      description: this.generateEpicDescription(project),
      features: [], // Will be populated when features are generated
      business_value: this.calculateBusinessValue(project),
      timeline: {
        start_date:
          new Date().toISOString().split('T')[0] || new Date().toISOString(),
        end_date: this.calculateEpicEndDate(project),
      },
      status: 'approved',
      sparc_project_id: project.id,
    };

    // Generate features for this epic
    const features = await this.generateFeaturesFromProject(project);
    epic.features = features.map((f) => f.id);

    return epic;
  }

  /**
   * Generate features from SPARC project phases.
   *
   * @param project
   */
  async generateFeaturesFromProject(project: SPARCProject): Promise<Feature[]> {
    const features: Feature[] = [];

    // Create features for each major deliverable
    const phaseFeatures = [
      {
        phase: 'specification',
        title: `${project.name} Requirements Analysis`,
        description: 'Complete requirements gathering and constraint analysis',
      },
      {
        phase: 'architecture',
        title: `${project.name} System Architecture`,
        description: 'Design and document system architecture and components',
      },
      {
        phase: 'completion',
        title: `${project.name} Implementation`,
        description: 'Production-ready implementation with full test coverage',
      },
    ];

    phaseFeatures.forEach((phaseFeature, index) => {
      const feature: Feature = {
        id: `FEAT-${project.id}-${index + 1}`,
        title: phaseFeature.title,
        description: phaseFeature.description,
        epic_id: `EPIC-${project.id}`,
        user_stories: this.generateUserStoryIds(project, phaseFeature.phase),
        status: this.getFeatureStatus(project, phaseFeature.phase as any),
        sparc_project_id: project.id,
      };

      features.push(feature);
    });

    // Add domain-specific features
    if (project.specification?.functionalRequirements) {
      project.specification.functionalRequirements.forEach((req, index) => {
        const feature: Feature = {
          id: `FEAT-${project.id}-REQ-${index + 1}`,
          title: req.description,
          description: `Implementation of functional requirement: ${req.description}`,
          epic_id: `EPIC-${project.id}`,
          user_stories: [`US-${project.id}-${index + 1}`],
          status: 'backlog',
          sparc_project_id: project.id,
        };

        features.push(feature);
      });
    }

    return features;
  }

  /**
   * Add SPARC project to enterprise roadmap.
   *
   * @param project
   * @param targetQuarter
   */
  async addProjectToRoadmap(
    project: SPARCProject,
    targetQuarter: string
  ): Promise<void> {
    try {
      // Load existing roadmap or create new one
      let roadmap: Roadmap;
      try {
        const roadmapData = await fs.readFile(this.roadmapFile, 'utf-8');
        roadmap = JSON.parse(roadmapData);
      } catch {
        roadmap = {
          id: 'claude-zen-roadmap',
          title: 'Claude-Zen Development Roadmap',
          description: 'Strategic development roadmap for Claude-Zen platform',
          timeframe: {
            start_quarter: targetQuarter,
            end_quarter: this.calculateEndQuarter(targetQuarter, 4), // 4 quarters ahead
          },
          items: [],
          last_updated: new Date().toISOString(),
        };
      }

      // Create roadmap item for the project
      const roadmapItem: RoadmapItem = {
        id: `ROADMAP-${project.id}`,
        title: project.name,
        description: this.generateRoadmapDescription(project),
        type: this.determineRoadmapItemType(project),
        quarter: targetQuarter,
        effort_estimate: this.calculateEffortEstimate(project),
        business_value: this.mapBusinessValueToLevel(project),
        dependencies: this.extractProjectDependencies(project),
        status: 'planned',
        sparc_project_id: project.id,
      };

      // Add to roadmap
      roadmap.items.push(roadmapItem);
      roadmap['last_updated'] = new Date().toISOString();

      // Ensure docs directory exists
      await fs.mkdir(path.dirname(this.roadmapFile), { recursive: true });

      // Save updated roadmap
      await fs.writeFile(this.roadmapFile, JSON.stringify(roadmap, null, 2));
    } catch (error) {
      logger.warn('Could not update roadmap:', error);
    }
  }

  /**
   * Generate domain-specific roadmap.
   *
   * @param domain
   * @param timeframe
   * @param timeframe.start
   * @param timeframe.end
   */
  async generateDomainRoadmap(
    domain: ProjectDomain,
    timeframe: { start: string; end: string }
  ): Promise<Roadmap> {
    const roadmap: Roadmap = {
      id: `${domain}-roadmap`,
      title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Domain Roadmap`,
      description: `Strategic roadmap for ${domain} development in Claude-Zen`,
      timeframe: {
        start_quarter: timeframe.start,
        end_quarter: timeframe.end,
      },
      items: this.generateDomainRoadmapItems(domain, timeframe),
      last_updated: new Date().toISOString(),
    };

    return roadmap;
  }

  /**
   * Save epics and features to project files.
   *
   * @param project
   */
  async saveProjectArtifacts(project: SPARCProject): Promise<void> {
    try {
      // Generate epic and features
      const epic = await this.generateEpicFromSPARCProject(project);
      const features = await this.generateFeaturesFromProject(project);

      // Ensure docs directory exists
      await fs.mkdir(path.dirname(this.epicsFile), { recursive: true });

      // Load existing epics or create new array
      let epics: Epic[] = [];
      try {
        const epicsData = await fs.readFile(this.epicsFile, 'utf-8');
        epics = JSON.parse(epicsData);
      } catch {
        // File doesn't exist, start with empty array
      }

      // Load existing features or create new array
      let featuresData: Feature[] = [];
      try {
        const existingFeatures = await fs.readFile(this.featuresFile, 'utf-8');
        featuresData = JSON.parse(existingFeatures);
      } catch {
        // File doesn't exist, start with empty array
      }

      // Add new epic and features
      epics.push(epic);
      featuresData?.push(...features);

      // Save files
      await fs.writeFile(this.epicsFile, JSON.stringify(epics, null, 2));
      await fs.writeFile(
        this.featuresFile,
        JSON.stringify(featuresData, null, 2)
      );
    } catch (error) {
      logger.warn('Could not save project artifacts:', error);
    }
  }

  // Helper methods
  private generateEpicDescription(project: SPARCProject): string {
    return `Epic for ${project.name} development in the ${project.domain} domain.

**Scope:** ${project.specification?.successMetrics?.[0]?.description || 'Comprehensive system development'}

**Key Deliverables:**
- Complete specification and requirements analysis
- System architecture and component design  
- Production-ready implementation
- Comprehensive testing and documentation

**Business Impact:** ${this.calculateBusinessValue(project)}

**Technical Complexity:** moderate`;
  }

  private calculateBusinessValue(project: SPARCProject): string {
    const domainValues = {
      'swarm-coordination':
        'High - Core platform capability for agent coordination',
      'neural-networks':
        'High - AI/ML acceleration and intelligence enhancement',
      'memory-systems':
        'Medium - Infrastructure efficiency and data management',
      'rest-api':
        'Medium - External integration and user interface capabilities',
      interfaces: 'Medium - User experience and system accessibility',
      'wasm-integration':
        'High - Performance optimization and computational efficiency',
      general: 'Low to Medium - General platform improvements',
    };

    return domainValues[project.domain] || 'Medium - Platform enhancement';
  }

  private calculateEpicEndDate(_project: SPARCProject): string {
    const complexityWeeks = {
      simple: 4,
      moderate: 8,
      high: 12,
      complex: 16,
      enterprise: 20,
    };

    const weeks = complexityWeeks.moderate;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + weeks * 7);

    return endDate.toISOString().split('T')[0] || endDate.toISOString();
  }

  private generateUserStoryIds(project: SPARCProject, phase: string): string[] {
    // Generate user story IDs based on phase
    const baseId = `US-${project.id}-${phase.toUpperCase()}`;
    return [`${baseId}-001`, `${baseId}-002`];
  }

  private getFeatureStatus(
    project: SPARCProject,
    phase: string
  ): 'backlog' | 'planned' | 'in_progress' | 'completed' {
    if (project.progress?.completedPhases?.includes(phase as any)) {
      return 'completed';
    }
    if (project.currentPhase === phase) {
      return 'in_progress';
    }
    return 'planned';
  }

  private generateRoadmapDescription(project: SPARCProject): string {
    return `${project.name} - ${project.domain} domain implementation using SPARC methodology. Complexity: moderate.`;
  }

  private determineRoadmapItemType(
    project: SPARCProject
  ): 'epic' | 'feature' | 'initiative' {
    // For now, determine based on project domain and size
    const highComplexityDomains = ['neural-networks', 'swarm-coordination'];

    if (highComplexityDomains.includes(project.domain)) {
      return 'epic';
    }
    return 'feature';
  }

  private calculateEffortEstimate(_project: SPARCProject): number {
    const complexityPoints = {
      simple: 5,
      moderate: 13,
      high: 21,
      complex: 34,
      enterprise: 55,
    };

    return complexityPoints.moderate;
  }

  private mapBusinessValueToLevel(
    project: SPARCProject
  ): 'high' | 'medium' | 'low' {
    const highValueDomains = [
      'swarm-coordination',
      'neural-networks',
      'wasm-integration',
    ];

    if (highValueDomains.includes(project.domain)) {
      return 'high';
    }
    return 'medium';
  }

  private extractProjectDependencies(project: SPARCProject): string[] {
    return project.specification?.dependencies?.map((dep) => dep.name) || [];
  }

  private calculateEndQuarter(
    startQuarter: string,
    quartersAhead: number
  ): string {
    const parts = startQuarter.split('-Q');
    if (parts.length !== 2) {
      throw new Error(
        `Invalid quarter format: ${startQuarter}. Expected format: YYYY-QN`
      );
    }

    const [year, quarter] = parts;
    if (!(year && quarter)) {
      throw new Error(
        `Invalid quarter format: ${startQuarter}. Expected format: YYYY-QN`
      );
    }

    const startQuarterNum = Number.parseInt(quarter, 10);
    let endYear = Number.parseInt(year, 10);
    let endQuarter = startQuarterNum + quartersAhead;

    while (endQuarter > 4) {
      endQuarter -= 4;
      endYear += 1;
    }

    return `${endYear}-Q${endQuarter}`;
  }

  private generateDomainRoadmapItems(
    domain: ProjectDomain,
    timeframe: { start: string; end: string }
  ): RoadmapItem[] {
    // Generate domain-specific roadmap items based on strategic priorities
    const domainStrategies = {
      'swarm-coordination': [
        {
          title: 'Advanced Agent Coordination',
          description:
            'Enhanced swarm intelligence and coordination algorithms',
          effort_estimate: 34,
          business_value: 'high' as const,
        },
        {
          title: 'Fault-Tolerant Load Balancing',
          description: 'Resilient load balancing with automatic failover',
          effort_estimate: 21,
          business_value: 'high' as const,
        },
      ],
      'neural-networks': [
        {
          title: 'WASM Neural Acceleration',
          description: 'High-performance WASM-based neural network execution',
          effort_estimate: 55,
          business_value: 'high' as const,
        },
        {
          title: 'Distributed Training Framework',
          description: 'Multi-node neural network training coordination',
          effort_estimate: 34,
          business_value: 'medium' as const,
        },
      ],
      // Add more domains as needed
    };

    const strategies = domainStrategies[domain] || [];

    return strategies.map((strategy, index) => ({
      id: `${domain}-roadmap-${index + 1}`,
      title: strategy.title,
      description: strategy.description,
      type: 'epic' as const,
      quarter: timeframe.start,
      effort_estimate: strategy['effort_estimate'],
      business_value: strategy['business_value'],
      dependencies: [],
      status: 'planned' as const,
    }));
  }
}
