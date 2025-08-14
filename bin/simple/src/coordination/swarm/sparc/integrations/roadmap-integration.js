import { getLogger } from '../../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-sparc-integrations-roadmap-integration');
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
export class SPARCRoadmapManager {
    projectRoot;
    roadmapFile;
    epicsFile;
    featuresFile;
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.roadmapFile = path.join(projectRoot, 'docs', 'roadmap.json');
        this.epicsFile = path.join(projectRoot, 'docs', 'epics.json');
        this.featuresFile = path.join(projectRoot, 'docs', 'features.json');
    }
    async generateEpicFromSPARCProject(project) {
        const epic = {
            id: `EPIC-${project.id}`,
            title: `${project.name} Development Epic`,
            description: this.generateEpicDescription(project),
            features: [],
            business_value: this.calculateBusinessValue(project),
            timeline: {
                start_date: new Date().toISOString().split('T')[0] || new Date().toISOString(),
                end_date: this.calculateEpicEndDate(project),
            },
            status: 'approved',
            sparc_project_id: project.id,
        };
        const features = await this.generateFeaturesFromProject(project);
        epic.features = features.map((f) => f.id);
        return epic;
    }
    async generateFeaturesFromProject(project) {
        const features = [];
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
            const feature = {
                id: `FEAT-${project.id}-${index + 1}`,
                title: phaseFeature.title,
                description: phaseFeature.description,
                epic_id: `EPIC-${project.id}`,
                user_stories: this.generateUserStoryIds(project, phaseFeature.phase),
                status: this.getFeatureStatus(project, phaseFeature.phase),
                sparc_project_id: project.id,
            };
            features.push(feature);
        });
        if (project.specification?.functionalRequirements) {
            project.specification.functionalRequirements.forEach((req, index) => {
                const feature = {
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
    async addProjectToRoadmap(project, targetQuarter) {
        try {
            let roadmap;
            try {
                const roadmapData = await fs.readFile(this.roadmapFile, 'utf-8');
                roadmap = JSON.parse(roadmapData);
            }
            catch {
                roadmap = {
                    id: 'claude-zen-roadmap',
                    title: 'Claude-Zen Development Roadmap',
                    description: 'Strategic development roadmap for Claude-Zen platform',
                    timeframe: {
                        start_quarter: targetQuarter,
                        end_quarter: this.calculateEndQuarter(targetQuarter, 4),
                    },
                    items: [],
                    last_updated: new Date().toISOString(),
                };
            }
            const roadmapItem = {
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
            roadmap.items.push(roadmapItem);
            roadmap['last_updated'] = new Date().toISOString();
            await fs.mkdir(path.dirname(this.roadmapFile), { recursive: true });
            await fs.writeFile(this.roadmapFile, JSON.stringify(roadmap, null, 2));
        }
        catch (error) {
            logger.warn('Could not update roadmap:', error);
        }
    }
    async generateDomainRoadmap(domain, timeframe) {
        const roadmap = {
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
    async saveProjectArtifacts(project) {
        try {
            const epic = await this.generateEpicFromSPARCProject(project);
            const features = await this.generateFeaturesFromProject(project);
            await fs.mkdir(path.dirname(this.epicsFile), { recursive: true });
            let epics = [];
            try {
                const epicsData = await fs.readFile(this.epicsFile, 'utf-8');
                epics = JSON.parse(epicsData);
            }
            catch {
            }
            let featuresData = [];
            try {
                const existingFeatures = await fs.readFile(this.featuresFile, 'utf-8');
                featuresData = JSON.parse(existingFeatures);
            }
            catch {
            }
            epics.push(epic);
            featuresData?.push(...features);
            await fs.writeFile(this.epicsFile, JSON.stringify(epics, null, 2));
            await fs.writeFile(this.featuresFile, JSON.stringify(featuresData, null, 2));
        }
        catch (error) {
            logger.warn('Could not save project artifacts:', error);
        }
    }
    generateEpicDescription(project) {
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
    calculateBusinessValue(project) {
        const domainValues = {
            'swarm-coordination': 'High - Core platform capability for agent coordination',
            'neural-networks': 'High - AI/ML acceleration and intelligence enhancement',
            'memory-systems': 'Medium - Infrastructure efficiency and data management',
            'rest-api': 'Medium - External integration and user interface capabilities',
            interfaces: 'Medium - User experience and system accessibility',
            'wasm-integration': 'High - Performance optimization and computational efficiency',
            general: 'Low to Medium - General platform improvements',
        };
        return domainValues[project.domain] || 'Medium - Platform enhancement';
    }
    calculateEpicEndDate(_project) {
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
    generateUserStoryIds(project, phase) {
        const baseId = `US-${project.id}-${phase.toUpperCase()}`;
        return [`${baseId}-001`, `${baseId}-002`];
    }
    getFeatureStatus(project, phase) {
        if (project.progress?.completedPhases?.includes(phase)) {
            return 'completed';
        }
        if (project.currentPhase === phase) {
            return 'in_progress';
        }
        return 'planned';
    }
    generateRoadmapDescription(project) {
        return `${project.name} - ${project.domain} domain implementation using SPARC methodology. Complexity: moderate.`;
    }
    determineRoadmapItemType(project) {
        const highComplexityDomains = ['neural-networks', 'swarm-coordination'];
        if (highComplexityDomains.includes(project.domain)) {
            return 'epic';
        }
        return 'feature';
    }
    calculateEffortEstimate(_project) {
        const complexityPoints = {
            simple: 5,
            moderate: 13,
            high: 21,
            complex: 34,
            enterprise: 55,
        };
        return complexityPoints.moderate;
    }
    mapBusinessValueToLevel(project) {
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
    extractProjectDependencies(project) {
        return project.specification?.dependencies?.map((dep) => dep.name) || [];
    }
    calculateEndQuarter(startQuarter, quartersAhead) {
        const parts = startQuarter.split('-Q');
        if (parts.length !== 2) {
            throw new Error(`Invalid quarter format: ${startQuarter}. Expected format: YYYY-QN`);
        }
        const [year, quarter] = parts;
        if (!(year && quarter)) {
            throw new Error(`Invalid quarter format: ${startQuarter}. Expected format: YYYY-QN`);
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
    generateDomainRoadmapItems(domain, timeframe) {
        const domainStrategies = {
            'swarm-coordination': [
                {
                    title: 'Advanced Agent Coordination',
                    description: 'Enhanced swarm intelligence and coordination algorithms',
                    effort_estimate: 34,
                    business_value: 'high',
                },
                {
                    title: 'Fault-Tolerant Load Balancing',
                    description: 'Resilient load balancing with automatic failover',
                    effort_estimate: 21,
                    business_value: 'high',
                },
            ],
            'neural-networks': [
                {
                    title: 'WASM Neural Acceleration',
                    description: 'High-performance WASM-based neural network execution',
                    effort_estimate: 55,
                    business_value: 'high',
                },
                {
                    title: 'Distributed Training Framework',
                    description: 'Multi-node neural network training coordination',
                    effort_estimate: 34,
                    business_value: 'medium',
                },
            ],
        };
        const strategies = domainStrategies[domain] || [];
        return strategies.map((strategy, index) => ({
            id: `${domain}-roadmap-${index + 1}`,
            title: strategy.title,
            description: strategy.description,
            type: 'epic',
            quarter: timeframe.start,
            effort_estimate: strategy['effort_estimate'],
            business_value: strategy['business_value'],
            dependencies: [],
            status: 'planned',
        }));
    }
}
//# sourceMappingURL=roadmap-integration.js.map