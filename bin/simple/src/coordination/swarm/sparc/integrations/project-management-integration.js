import { getLogger } from '../../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-sparc-integrations-project-management-integration');
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { DocumentDrivenSystem } from '../../../../core/document-driven-system.ts';
import { MemorySystem } from '../../../../core/memory-system.ts';
import { CoordinationAPI } from '../../../api.ts';
const TaskAPI = CoordinationAPI.tasks;
import { TaskCoordinator } from '../../../task-coordinator.ts';
export class ProjectManagementIntegration {
    projectRoot;
    tasksFile;
    adrDir;
    prdDir;
    featuresFile;
    epicsFile;
    roadmapFile;
    taskTool;
    taskDistributor;
    logger;
    documentDrivenSystem;
    workflowEngine;
    memorySystem;
    constructor(projectRoot = process.cwd(), workflowEngine, memorySystem, logger) {
        this.logger = logger;
        this.projectRoot = projectRoot;
        this.tasksFile = path.join(projectRoot, 'tasks.json');
        this.adrDir = path.join(projectRoot, 'docs', 'adrs');
        this.prdDir = path.join(projectRoot, 'docs', 'prds');
        this.featuresFile = path.join(projectRoot, 'docs', 'features.json');
        this.epicsFile = path.join(projectRoot, 'docs', 'epics.json');
        this.roadmapFile = path.join(projectRoot, 'docs', 'roadmap.json');
        this.taskTool = TaskCoordinator.getInstance();
        this.taskDistributor = null;
        this.memorySystem =
            memorySystem ||
                new MemorySystem({
                    backend: 'json',
                    path: path.join(projectRoot, '.memory'),
                });
        this.documentDrivenSystem = new DocumentDrivenSystem();
        this.workflowEngine = workflowEngine;
    }
    async initialize() {
        await this.memorySystem.initialize();
        await this.documentDrivenSystem.initialize();
        if (this.workflowEngine) {
            await this.workflowEngine.initialize();
        }
    }
    async createAllProjectManagementArtifacts(project, artifactTypes = ['all']) {
        await this.initialize();
        const workspaceId = await this.documentDrivenSystem.loadWorkspace(this.projectRoot);
        const visionDocument = await this.createVisionDocumentFromSPARC(project, workspaceId);
        await this.documentDrivenSystem.processVisionaryDocument(workspaceId, visionDocument.path);
        const workflowResults = await this.executeDocumentWorkflows(workspaceId, visionDocument);
        const results = {
            tasks: [],
            adrs: [],
            prd: {},
            epics: [],
            features: [],
            workspaceId,
            workflowResults,
        };
        if (artifactTypes.includes('all') || artifactTypes.includes('tasks')) {
            results.tasks = await this.generateTasksFromSPARC(project);
            await this.updateTasksWithSPARC(project);
            await this.distributeTasksWithCoordination(project);
        }
        if (artifactTypes.includes('all') || artifactTypes.includes('adrs')) {
            results.adrs = await this.generateADRFromSPARC(project);
            await this.createADRFiles(project);
        }
        if (artifactTypes.includes('all') || artifactTypes.includes('prd')) {
            results.prd = await this.generatePRDFromSPARC(project);
            await this.createPRDFile(project);
        }
        if (artifactTypes.includes('all') || artifactTypes.includes('epics')) {
            results.epics = await this.createEpicsFromSPARC(project);
            await this.saveEpicsToWorkspace(results?.epics, workspaceId);
        }
        if (artifactTypes.includes('all') || artifactTypes.includes('features')) {
            results.features = await this.createFeaturesFromSPARC(project);
            await this.saveFeaturesFromWorkspace(results?.features, workspaceId);
        }
        return results;
    }
    async createVisionDocumentFromSPARC(project, _workspaceId) {
        const visionContent = `# Vision: ${project.name}

## Overview
${project.specification.successMetrics?.[0]?.description || `Vision for ${project.name} in the ${project.domain} domain.`}

## Domain
${project.domain}

## Objectives
${project.specification.functionalRequirements.map((req) => `- ${req.description}`).join('\n')}

## Success Metrics
${project.specification.acceptanceCriteria
            .map((criteria) => criteria.criteria.map((c) => `- ${c}`).join('\n'))
            .join('\n')}

## Constraints
${project.specification.constraints.map((constraint) => `- ${constraint.description}`).join('\n')}

## Dependencies
${project.specification.dependencies.map((dep) => `- ${dep.name} (${dep.type}): ${dep.version || 'latest'}${dep.critical ? ' [CRITICAL]' : ''}`).join('\n')}

---
Author: SPARC Engine
Created: ${new Date().toISOString()}
Status: draft
Related: SPARC-${project.id}
`;
        const visionDir = path.join(this.projectRoot, 'docs/01-vision');
        const visionPath = path.join(visionDir, `${project.id}-vision.md`);
        await fs.mkdir(visionDir, { recursive: true });
        await fs.writeFile(visionPath, visionContent);
        return { path: visionPath, content: visionContent };
    }
    async executeDocumentWorkflows(workspaceId, visionDocument) {
        const workflows = [
            'vision-to-prds',
            'prd-to-epics',
            'epic-to-features',
            'feature-to-tasks',
        ];
        const results = {};
        for (const workflowName of workflows) {
            try {
                const result = this.workflowEngine
                    ? await this.workflowEngine.startWorkflow(workflowName, {
                        currentDocument: {
                            id: `vision-${workspaceId}-${Date.now()}`,
                            type: 'vision',
                            title: 'Vision Document',
                            content: visionDocument.content,
                            metadata: {
                                author: 'SPARC Engine',
                                tags: [workspaceId],
                                status: 'draft',
                                priority: 'medium',
                                dependencies: [],
                                relatedDocuments: [],
                            },
                            created: new Date(),
                            updated: new Date(),
                            version: '1.0.0',
                        },
                        workspaceId: this.projectRoot,
                    })
                    : { success: false, error: 'WorkflowEngine not available' };
                if (result?.success && result?.workflowId) {
                    results[workflowName] = result?.workflowId;
                }
            }
            catch (error) {
                logger.warn(`Failed to execute workflow ${workflowName}:`, error);
                results[workflowName] = { error: error.message };
            }
        }
        return results;
    }
    async generateTasksFromSPARC(project) {
        const tasks = [];
        let taskCounter = 1;
        const phases = [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
        ];
        for (const phase of phases) {
            const taskId = `SPARC-${project.id.toUpperCase()}-${taskCounter.toString().padStart(3, '0')}`;
            const enhancedTaskConfig = {
                description: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase - ${project.name}`,
                prompt: this.generatePhasePrompt(phase, project),
                subagent_type: this.getOptimalAgentForPhase(phase),
                use_claude_subagent: true,
                domain_context: `SPARC ${project.domain} project: ${project.name}`,
                expected_output: this.getPhaseExpectedOutput(phase),
                tools_required: this.getPhaseTools(phase),
                priority: this.getPhasePriority(phase),
                dependencies: taskCounter > 1
                    ? [
                        `SPARC-${project.id.toUpperCase()}-${(taskCounter - 1).toString().padStart(3, '0')}`,
                    ]
                    : [],
                timeout_minutes: this.getPhaseTimeout(phase),
            };
            try {
                await this.taskTool.executeTask(enhancedTaskConfig);
            }
            catch (error) {
                logger.warn(`Task validation failed for ${phase}:`, error);
            }
            const task = {
                id: taskId,
                title: enhancedTaskConfig?.description,
                component: `sparc-${phase}`,
                description: this.getPhaseDescription(phase),
                status: project.currentPhase === phase
                    ? 'in_progress'
                    : phases.indexOf(phase) < phases.indexOf(project.currentPhase)
                        ? 'completed'
                        : 'todo',
                priority: this.convertPriorityToNumber(enhancedTaskConfig?.priority || 'medium'),
                estimated_hours: this.getPhaseEstimatedHours(phase),
                actual_hours: null,
                dependencies: enhancedTaskConfig?.dependencies || [],
                acceptance_criteria: this.getPhaseAcceptanceCriteria(phase, project),
                notes: `Generated from SPARC project: ${project.name}. Agent: ${enhancedTaskConfig?.subagent_type}`,
                assigned_to: 'sparc-engine',
                created_date: new Date().toISOString(),
                completed_date: null,
                sparc_project_id: project.id,
            };
            tasks.push(task);
            taskCounter++;
        }
        return tasks;
    }
    async updateTasksWithSPARC(project) {
        try {
            const tasksData = await fs.readFile(this.tasksFile, 'utf-8');
            const existingTasks = JSON.parse(tasksData);
            const sparcTasks = await this.generateTasksFromSPARC(project);
            for (const task of sparcTasks) {
                try {
                    const deadline = task.completed_date
                        ? new Date(task.completed_date)
                        : undefined;
                    await TaskAPI.createTask({
                        type: task.component,
                        description: task.description,
                        priority: task.priority * 20,
                        ...(deadline && { deadline }),
                    });
                }
                catch (error) {
                    logger.warn(`Task validation failed for ${task.id}:`, error);
                }
            }
            existingTasks.push(...sparcTasks);
            await fs.writeFile(this.tasksFile, JSON.stringify(existingTasks, null, 2));
        }
        catch (error) {
            logger.warn('Could not update tasks file:', error);
        }
    }
    async distributeTasksWithCoordination(project) {
        try {
            const sparcTasks = await this.generateTasksFromSPARC(project);
            for (const task of sparcTasks) {
                const enhancedTaskConfig = {
                    description: task.description,
                    prompt: this.generatePhasePrompt(task.component.replace('sparc-', ''), project),
                    subagent_type: this.getOptimalAgentForPhase(task.component.replace('sparc-', '')),
                    use_claude_subagent: true,
                    domain_context: `SPARC ${project.domain} project`,
                    expected_output: this.getPhaseExpectedOutput(task.component.replace('sparc-', '')),
                    priority: this.convertNumberToPriority(task.priority),
                    dependencies: task.dependencies,
                    timeout_minutes: task.estimated_hours * 60,
                };
                this.logger?.debug('Enhanced SPARC task configuration created', {
                    taskId: task.id,
                    component: task.component,
                    priority: enhancedTaskConfig?.priority,
                    agentType: enhancedTaskConfig?.subagent_type,
                    estimatedHours: task.estimated_hours,
                });
                try {
                    const deadline = task.completed_date
                        ? new Date(task.completed_date)
                        : undefined;
                    await TaskAPI.createTask({
                        type: task.component,
                        description: task.description,
                        priority: task.priority * 20,
                        ...(deadline && { deadline }),
                    });
                }
                catch (error) {
                    logger.warn(`Task creation failed for ${task.id}:`, error);
                }
            }
        }
        catch (error) {
            logger.warn('Could not distribute SPARC tasks:', error);
        }
    }
    async generateADRFromSPARC(project) {
        const adrs = [];
        if (project.architecture) {
            const architectureADR = {
                id: `ADR-${project.id}-001`,
                title: `Architecture Decision for ${project.name}`,
                status: 'accepted',
                context: `Architecture decisions for SPARC project: ${project.name}\n\nDomain: ${project.domain}\nComplexity: moderate`,
                decision: this.formatArchitectureDecision(project),
                consequences: this.extractArchitectureConsequences(project),
                date: new Date().toISOString(),
                sparc_project_id: project.id,
                phase: 'architecture',
            };
            adrs.push(architectureADR);
            if (project.architecture?.systemArchitecture?.components) {
                project.architecture.systemArchitecture.components.forEach((component, index) => {
                    if (component.qualityAttributes &&
                        component.qualityAttributes['importance'] === 'high') {
                        const componentADR = {
                            id: `ADR-${project.id}-${(index + 2).toString().padStart(3, '0')}`,
                            title: `${component.name} Component Design`,
                            status: 'accepted',
                            context: `Design decisions for ${component.name} component in ${project.name}`,
                            decision: `Implement ${component.name} with:\n- Type: ${component.type}\n- Responsibilities: ${component.responsibilities.join(', ')}\n- Interfaces: ${component.interfaces.join(', ')}`,
                            consequences: [
                                `Enables ${component.responsibilities.join(' and ')}`,
                                'Requires integration with other components',
                            ],
                            date: new Date().toISOString(),
                            sparc_project_id: project.id,
                            phase: 'architecture',
                        };
                        adrs.push(componentADR);
                    }
                });
            }
        }
        return adrs;
    }
    async generatePRDFromSPARC(project) {
        const prd = {
            id: `PRD-${project.id}`,
            title: `Product Requirements - ${project.name}`,
            version: '1.0.0',
            overview: project.specification.successMetrics?.[0]?.description ||
                `Product requirements for ${project.name} in the ${project.domain} domain.`,
            objectives: project.specification.functionalRequirements.map((req) => req.description),
            success_metrics: project.specification.acceptanceCriteria.map((criteria) => criteria.criteria.join(', ')),
            user_stories: this.generateUserStoriesFromRequirements(project.specification),
            functional_requirements: project.specification.functionalRequirements.map((req) => req.description),
            non_functional_requirements: project.specification.nonFunctionalRequirements.map((req) => req.description),
            constraints: project.specification.constraints.map((constraint) => constraint.description),
            dependencies: project.specification.dependencies.map((dep) => dep.name),
            timeline: `Estimated ${this.calculateProjectTimeline(project)} weeks`,
            stakeholders: ['Product Manager', 'Engineering Team', 'QA Team'],
            sparc_project_id: project.id,
        };
        return prd;
    }
    generatePhasePrompt(phase, project) {
        const prompts = {
            specification: `Analyze and document comprehensive requirements for ${project.name} in the ${project.domain} domain. Focus on functional requirements, constraints, and success metrics.`,
            pseudocode: `Design algorithms and pseudocode for ${project.name}. Include complexity analysis and optimization strategies.`,
            architecture: `Design system architecture for ${project.name}. Include component relationships, data flow, and deployment strategies.`,
            refinement: `Optimize and refine the implementation of ${project.name}. Focus on performance, security, and scalability improvements.`,
            completion: `Generate production-ready implementation for ${project.name}. Include comprehensive tests, documentation, and deployment artifacts.`,
        };
        return prompts[phase] || `Execute ${phase} phase for ${project.name}`;
    }
    getOptimalAgentForPhase(phase) {
        const agentMapping = {
            specification: 'system-analyst',
            pseudocode: 'algorithm-designer',
            architecture: 'system-architect',
            refinement: 'performance-optimizer',
            completion: 'full-stack-developer',
        };
        return agentMapping[phase] || 'generalist';
    }
    getPhaseExpectedOutput(phase) {
        const outputs = {
            specification: 'Detailed requirements document with acceptance criteria',
            pseudocode: 'Algorithm designs with complexity analysis',
            architecture: 'System architecture diagrams and component specifications',
            refinement: 'Performance optimization report and recommendations',
            completion: 'Production-ready code with tests and documentation',
        };
        return outputs[phase] || 'Phase deliverables completed';
    }
    getPhaseTools(phase) {
        const tools = {
            specification: [
                'requirements-analysis',
                'stakeholder-interview',
                'constraint-modeling',
            ],
            pseudocode: [
                'algorithm-design',
                'complexity-analysis',
                'optimization-modeling',
            ],
            architecture: [
                'system-design',
                'component-modeling',
                'deployment-planning',
            ],
            refinement: [
                'performance-profiling',
                'security-analysis',
                'scalability-testing',
            ],
            completion: [
                'code-generation',
                'test-automation',
                'documentation-generation',
            ],
        };
        return tools[phase] || ['general-development'];
    }
    getPhasePriority(phase) {
        const priorities = {
            specification: 'high',
            pseudocode: 'medium',
            architecture: 'high',
            refinement: 'medium',
            completion: 'critical',
        };
        return priorities[phase] || 'medium';
    }
    getPhaseTimeout(phase) {
        const timeouts = {
            specification: 120,
            pseudocode: 180,
            architecture: 240,
            refinement: 120,
            completion: 360,
        };
        return timeouts[phase] || 120;
    }
    convertPriorityToNumber(priority) {
        const mapping = { low: 1, medium: 3, high: 4, critical: 5 };
        return mapping[priority] || 3;
    }
    convertNumberToPriority(num) {
        if (num <= 1)
            return 'low';
        if (num <= 3)
            return 'medium';
        if (num <= 4)
            return 'high';
        return 'critical';
    }
    generateEpicDescription(project) {
        return `Epic for ${project.name} development in the ${project.domain} domain using SPARC methodology.

**Scope:** Comprehensive implementation of ${project.name} with full SPARC methodology

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
        return endDate.toISOString().split('T')[0] ?? '';
    }
    generateFeaturesFromPhases(project) {
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
                user_stories: [
                    `US-${project.id}-${phaseFeature.phase.toUpperCase()}-001`,
                ],
                status: this.getFeatureStatusFromProject(project, phaseFeature.phase),
                sparc_project_id: project.id,
            };
            features.push(feature);
        });
        return features;
    }
    generateFeaturesFromRequirements(project) {
        const features = [];
        if (project.specification?.functionalRequirements) {
            project.specification.functionalRequirements.forEach((req, index) => {
                const feature = {
                    id: `FEAT-${project.id}-REQ-${index + 1}`,
                    title: req.description,
                    description: `Implementation of functional requirement: ${req.description}`,
                    epic_id: `EPIC-${project.id}`,
                    user_stories: [`US-${project.id}-REQ-${index + 1}`],
                    status: 'backlog',
                    sparc_project_id: project.id,
                };
                features.push(feature);
            });
        }
        return features;
    }
    getFeatureStatusFromProject(project, phase) {
        if (project.progress?.completedPhases?.includes(phase)) {
            return 'completed';
        }
        if (project.currentPhase === phase) {
            return 'in_progress';
        }
        return 'planned';
    }
    async createADRFiles(project) {
        try {
            await fs.mkdir(this.adrDir, { recursive: true });
            const adrs = await this.generateADRFromSPARC(project);
            for (const adr of adrs) {
                const adrContent = this.formatADRContent(adr);
                const adrFile = path.join(this.adrDir, `${adr.id.toLowerCase()}.md`);
                await fs.writeFile(adrFile, adrContent);
            }
        }
        catch (error) {
            logger.warn('Could not create ADR files:', error);
        }
    }
    async createPRDFile(project) {
        try {
            await fs.mkdir(this.prdDir, { recursive: true });
            const prd = await this.generatePRDFromSPARC(project);
            const prdContent = this.formatPRDContent(prd);
            const prdFile = path.join(this.prdDir, `${prd.id.toLowerCase()}.md`);
            await fs.writeFile(prdFile, prdContent);
        }
        catch (error) {
            logger.warn('Could not create PRD file:', error);
        }
    }
    async createEpicsFromSPARC(project) {
        try {
            await fs.mkdir(path.dirname(this.epicsFile), { recursive: true });
            let epics = [];
            try {
                const epicsData = await fs.readFile(this.epicsFile, 'utf-8');
                epics = JSON.parse(epicsData);
            }
            catch {
            }
            const projectEpic = {
                id: `EPIC-${project.id}`,
                title: `${project.name} Development Epic`,
                description: this.generateEpicDescription(project),
                features: [],
                business_value: this.calculateBusinessValue(project),
                timeline: {
                    start_date: new Date().toISOString().split('T')[0] ?? '',
                    end_date: this.calculateEpicEndDate(project),
                },
                status: 'approved',
                sparc_project_id: project.id,
            };
            const existingEpicIndex = epics.findIndex((e) => e.sparc_project_id === project.id);
            if (existingEpicIndex >= 0) {
                epics[existingEpicIndex] = projectEpic;
            }
            else {
                epics.push(projectEpic);
            }
            await fs.writeFile(this.epicsFile, JSON.stringify(epics, null, 2));
            return epics;
        }
        catch (error) {
            logger.warn('Could not create epics file:', error);
            return [];
        }
    }
    async createFeaturesFromSPARC(project) {
        try {
            await fs.mkdir(path.dirname(this.featuresFile), { recursive: true });
            let features = [];
            try {
                const featuresData = await fs.readFile(this.featuresFile, 'utf-8');
                features = JSON.parse(featuresData);
            }
            catch {
            }
            const phaseFeatures = this.generateFeaturesFromPhases(project);
            const requirementFeatures = this.generateFeaturesFromRequirements(project);
            const allProjectFeatures = [...phaseFeatures, ...requirementFeatures];
            features = features.filter((f) => f.sparc_project_id !== project.id);
            features.push(...allProjectFeatures);
            await fs.writeFile(this.featuresFile, JSON.stringify(features, null, 2));
            return allProjectFeatures;
        }
        catch (error) {
            logger.warn('Could not create features file:', error);
            return [];
        }
    }
    getPhaseDescription(phase) {
        const descriptions = {
            specification: 'Gather and analyze detailed requirements, constraints, and acceptance criteria',
            pseudocode: 'Design algorithms and data structures with complexity analysis',
            architecture: 'Design system architecture and component relationships',
            refinement: 'Optimize and refine based on performance feedback',
            completion: 'Generate production-ready implementation and documentation',
        };
        return descriptions[phase] || 'SPARC methodology phase execution';
    }
    getPhaseEstimatedHours(phase) {
        const estimates = {
            specification: 4,
            pseudocode: 6,
            architecture: 8,
            refinement: 4,
            completion: 12,
        };
        return estimates[phase] || 4;
    }
    getPhaseAcceptanceCriteria(phase, _project) {
        const baseCriteria = {
            specification: [
                'All functional requirements identified and documented',
                'Non-functional requirements defined with measurable criteria',
                'Constraints and dependencies identified',
                'Acceptance criteria defined for each requirement',
            ],
            pseudocode: [
                'Core algorithms designed with pseudocode',
                'Time and space complexity analyzed',
                'Data structures specified',
                'Algorithm correctness validated',
            ],
            architecture: [
                'System architecture designed and documented',
                'Component relationships defined',
                'Interface specifications completed',
                'Deployment architecture planned',
            ],
            refinement: [
                'Performance optimization strategies identified',
                'Security considerations addressed',
                'Scalability improvements documented',
                'Quality metrics achieved',
            ],
            completion: [
                'Production-ready code generated',
                'Comprehensive test suite created',
                'Documentation completed',
                'Deployment artifacts ready',
            ],
        };
        return baseCriteria[phase] || ['Phase objectives completed'];
    }
    formatArchitectureDecision(project) {
        if (!project.architecture)
            return 'Architecture not yet defined';
        return `Architecture Decision for ${project.name}:

## Components
${project.architecture?.systemArchitecture?.components?.map((comp) => `- ${comp.name}: ${comp.type}`).join('\n') || 'Components not defined'}

## Patterns
${project.architecture?.systemArchitecture?.architecturalPatterns?.map((p) => p.name).join('\n- ') || 'Patterns not defined'}

## Technology Stack
${project.architecture?.systemArchitecture?.technologyStack?.map((t) => t.technology).join('\n- ') || 'Technology stack not defined'}`;
    }
    extractArchitectureConsequences(project) {
        const consequences = [
            'Establishes clear component boundaries and responsibilities',
            'Enables modular development and testing',
            'Provides foundation for scalable implementation',
        ];
        if (project.architecture?.systemArchitecture?.architecturalPatterns) {
            consequences.push(`Leverages proven architectural patterns: ${project.architecture.systemArchitecture.architecturalPatterns.map((p) => p.name).join(', ')}`);
        }
        return consequences;
    }
    generateUserStoriesFromRequirements(spec) {
        return spec.functionalRequirements.map((req, index) => ({
            id: `US-${index + 1}`,
            title: req.description,
            description: `As a system user, I want ${req.description.toLowerCase()} so that I can achieve the system objectives.`,
            acceptance_criteria: [
                `System implements ${req.description}`,
                'Implementation meets performance requirements',
            ],
            priority: req.priority?.toLowerCase() || 'medium',
            effort_estimate: 5,
        }));
    }
    calculateProjectTimeline(_project) {
        const complexityWeeks = {
            simple: 2,
            moderate: 4,
            high: 8,
            complex: 12,
            enterprise: 16,
        };
        return complexityWeeks.moderate || 4;
    }
    formatADRContent(adr) {
        return `# ${adr.title}

## Status
${adr.status}

## Context
${adr.context}

## Decision
${adr.decision}

## Consequences
${adr.consequences.map((c) => `- ${c}`).join('\n')}

---
*Generated from SPARC project: ${adr.sparc_project_id}*
*Date: ${adr.date}*
*Phase: ${adr.phase}*
`;
    }
    formatPRDContent(prd) {
        return `# ${prd.title}

**Version:** ${prd.version}
**Generated from SPARC Project:** ${prd.sparc_project_id}

## Overview
${prd.overview}

## Objectives
${prd.objectives.map((obj) => `- ${obj}`).join('\n')}

## Success Metrics
${prd.success_metrics.map((metric) => `- ${metric}`).join('\n')}

## User Stories
${prd.user_stories.map((story) => `### ${story.title}\n${story.description}\n\n**Acceptance Criteria:**\n${story.acceptance_criteria.map((ac) => `- ${ac}`).join('\n')}`).join('\n\n')}

## Functional Requirements
${prd.functional_requirements.map((req) => `- ${req}`).join('\n')}

## Non-Functional Requirements
${prd.non_functional_requirements.map((req) => `- ${req}`).join('\n')}

## Constraints
${prd.constraints.map((constraint) => `- ${constraint}`).join('\n')}

## Dependencies
${prd.dependencies.map((dep) => `- ${dep}`).join('\n')}

## Timeline
${prd.timeline}

## Stakeholders
${prd.stakeholders.map((stakeholder) => `- ${stakeholder}`).join('\n')}
`;
    }
    async createADRFilesWithWorkspace(adrs, workspaceId) {
        const createdFiles = [];
        await fs.mkdir(this.adrDir, { recursive: true });
        const templatePath = path.join(this.projectRoot, 'docs/adrs/adr-template.md');
        let template = '';
        try {
            template = await fs.readFile(templatePath, 'utf-8');
        }
        catch {
            template = `# ADR-{NUMBER}: {TITLE}

## Status
{STATUS}

## Context
{CONTEXT}

## Decision
{DECISION}

## Consequences
{CONSEQUENCES}

## Date
{DATE}

## Related
- SPARC Project: {SPARC_PROJECT_ID}
- Phase: {PHASE}
`;
        }
        for (const adr of adrs) {
            const number = adr.id.replace(/.*ADR-/, '').replace(/-.*/, '');
            const filename = `${adr.id.toLowerCase()}-${adr.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
            const filePath = path.join(this.adrDir, filename);
            const content = template
                .replace(/{NUMBER}/g, number)
                .replace(/{TITLE}/g, adr.title)
                .replace(/{STATUS}/g, adr.status)
                .replace(/{CONTEXT}/g, adr.context)
                .replace(/{DECISION}/g, adr.decision)
                .replace(/{CONSEQUENCES}/g, Array.isArray(adr.consequences)
                ? adr.consequences.map((c) => `- ${c}`).join('\n')
                : adr.consequences)
                .replace(/{DATE}/g, adr.date)
                .replace(/{SPARC_PROJECT_ID}/g, adr.sparc_project_id || 'N/A')
                .replace(/{PHASE}/g, adr.phase || 'N/A');
            await fs.writeFile(filePath, content);
            createdFiles.push(filePath);
            if (this.memorySystem) {
                await this.memorySystem.storeDocument('adr', adr.id, {
                    id: adr.id,
                    title: adr.title,
                    content,
                    metadata: {
                        status: adr.status,
                        phase: adr.phase,
                        sparcProjectId: adr.sparc_project_id,
                        filePath,
                    },
                });
            }
            if (this.documentDrivenSystem && workspaceId) {
                await this.documentDrivenSystem.processVisionaryDocument(workspaceId, filePath);
            }
        }
        return createdFiles;
    }
    async saveEpicsToWorkspace(epics, workspaceId) {
        const epicsDir = path.join(this.projectRoot, 'docs/04-epics');
        await fs.mkdir(epicsDir, { recursive: true });
        for (const epic of epics) {
            const filename = `${epic.id.toLowerCase()}-${epic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
            const filePath = path.join(epicsDir, filename);
            const content = `# Epic: ${epic.title}

## Description
${epic.description}

## Business Value
${epic.business_value}

## Timeline
- Start: ${epic.timeline.start_date}
- End: ${epic.timeline.end_date}

## Status
${epic.status}

## Features
${epic.features.map((f) => `- ${f}`).join('\n')}

## Related SPARC Project
${epic.sparc_project_id || 'N/A'}

---
Created: ${new Date().toISOString()}
Type: Epic
`;
            await fs.writeFile(filePath, content);
            if (this.documentDrivenSystem && workspaceId) {
                await this.documentDrivenSystem.processVisionaryDocument(workspaceId, filePath);
            }
        }
        try {
            await fs.writeFile(this.epicsFile, JSON.stringify(epics, null, 2));
        }
        catch (error) {
            logger.warn('Could not save epics.json:', error);
        }
    }
    async saveFeaturesFromWorkspace(features, workspaceId) {
        const featuresDir = path.join(this.projectRoot, 'docs/05-features');
        await fs.mkdir(featuresDir, { recursive: true });
        for (const feature of features) {
            const filename = `${feature.id.toLowerCase()}-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
            const filePath = path.join(featuresDir, filename);
            const content = `# Feature: ${feature.title}

## Description
${feature.description}

## Epic
${feature.epic_id || 'N/A'}

## Status
${feature.status}

## User Stories
${feature.user_stories.map((us) => `- ${us}`).join('\n')}

## Related SPARC Project
${feature.sparc_project_id || 'N/A'}

---
Created: ${new Date().toISOString()}
Type: Feature
`;
            await fs.writeFile(filePath, content);
            if (this.documentDrivenSystem && workspaceId) {
                await this.documentDrivenSystem.processVisionaryDocument(workspaceId, filePath);
            }
        }
        try {
            await fs.writeFile(this.featuresFile, JSON.stringify(features, null, 2));
        }
        catch (error) {
            logger.warn('Could not save features.json:', error);
        }
    }
}
//# sourceMappingURL=project-management-integration.js.map