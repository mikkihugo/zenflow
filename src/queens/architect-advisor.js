/**
 * Architect Advisor Queen
 * Uses neural networks to provide intelligent architectural recommendations
 */

import { BaseQueen } from './base-queen.js';
import { NeuralEngine } from '../neural/neural-engine.js';
import { performance } from 'perf_hooks';

export class ArchitectAdvisor extends BaseQueen {
    constructor() {
        super('ArchitectAdvisor', 'architecture-analysis');
        this.confidence = 0.85;
        this.neuralEngine = new NeuralEngine();
        this.architecturePatterns = new Map();
        this.decisionHistory = new Map();
        this.initializePatterns();
        this.initialize();
    }

    /**
     * Initialize neural engine and models
     */
    async initialize() {
        try {
            await this.neuralEngine.initialize();
            
            // Load architecture-specific model if available
            const models = this.neuralEngine.getModels();
            const archModel = models.find(m => m.type === 'architecture' || m.name.includes('architect'));
            if (archModel) {
                await this.neuralEngine.loadModel(archModel.name);
            }
            
            this.logger.info('ArchitectAdvisor initialized with neural engine');
        } catch (error) {
            this.logger.warn('Neural engine initialization failed, using fallback mode:', error.message);
        }
    }

    /**
     * Initialize architecture patterns database
     */
    initializePatterns() {
        // Microservices patterns
        this.architecturePatterns.set('microservices', {
            description: 'Distributed services architecture',
            useCases: ['scalability', 'team independence', 'technology diversity'],
            pros: ['Independent deployment', 'Fault isolation', 'Technology flexibility'],
            cons: ['Complexity', 'Network latency', 'Data consistency challenges'],
            neuralWeight: 0.8
        });

        // Monolithic patterns
        this.architecturePatterns.set('monolith', {
            description: 'Single deployable unit architecture',
            useCases: ['simple applications', 'small teams', 'rapid prototyping'],
            pros: ['Simplicity', 'Easy debugging', 'No network overhead'],
            cons: ['Scalability limits', 'Technology lock-in', 'Deployment risks'],
            neuralWeight: 0.6
        });

        // Serverless patterns
        this.architecturePatterns.set('serverless', {
            description: 'Function-as-a-Service architecture',
            useCases: ['event-driven', 'variable load', 'cost optimization'],
            pros: ['No infrastructure management', 'Auto-scaling', 'Pay-per-use'],
            cons: ['Vendor lock-in', 'Cold starts', 'Limited execution time'],
            neuralWeight: 0.75
        });

        // Event-driven patterns
        this.architecturePatterns.set('event-driven', {
            description: 'Asynchronous event-based architecture',
            useCases: ['real-time processing', 'loose coupling', 'complex workflows'],
            pros: ['Scalability', 'Flexibility', 'Resilience'],
            cons: ['Complexity', 'Debugging difficulty', 'Event ordering'],
            neuralWeight: 0.85
        });

        // Layered architecture
        this.architecturePatterns.set('layered', {
            description: 'Traditional n-tier architecture',
            useCases: ['enterprise applications', 'clear separation', 'traditional teams'],
            pros: ['Clear structure', 'Separation of concerns', 'Testability'],
            cons: ['Performance overhead', 'Rigid structure', 'Change propagation'],
            neuralWeight: 0.65
        });
    }

    /**
     * Process architecture analysis task
     */
    async process(task) {
        const startTime = performance.now();
        this.trackTaskStart(task.id);

        try {
            this.logger.info(`Processing architecture analysis: ${task.prompt.substring(0, 50)}...`);

            // Extract requirements from task
            const requirements = await this.analyzeRequirements(task);
            
            // Use neural network for pattern matching
            const neuralRecommendations = await this.getNeuralRecommendations(task, requirements);
            
            // Combine neural and rule-based analysis
            const finalRecommendation = await this.synthesizeRecommendation(
                requirements,
                neuralRecommendations,
                task
            );

            // Store decision for future learning
            this.storeDecision(task.id, finalRecommendation);

            const processingTime = performance.now() - startTime;
            const result = {
                taskId: task.id,
                queenName: this.name,
                recommendation: finalRecommendation,
                confidence: this.calculateConfidence(neuralRecommendations, requirements),
                reasoning: this.generateReasoning(finalRecommendation, requirements),
                processingTime,
                alternatives: await this.generateAlternatives(requirements, finalRecommendation),
                metadata: {
                    neuralContribution: neuralRecommendations.confidence || 0,
                    patternMatches: finalRecommendation.patterns || [],
                    requirementsCoverage: this.calculateRequirementsCoverage(requirements, finalRecommendation)
                }
            };

            this.trackTaskComplete(task.id, result);
            return result;

        } catch (error) {
            this.logger.error(`Architecture analysis failed for task ${task.id}:`, error);
            const result = {
                taskId: task.id,
                queenName: this.name,
                recommendation: this.getFallbackRecommendation(task),
                confidence: 0.3,
                reasoning: `Analysis failed: ${error.message}. Providing basic recommendation.`,
                processingTime: performance.now() - startTime
            };
            this.trackTaskComplete(task.id, result);
            return result;
        }
    }

    /**
     * Analyze requirements using neural network
     */
    async analyzeRequirements(task) {
        const requirements = {
            scalability: false,
            performance: false,
            reliability: false,
            security: false,
            flexibility: false,
            simplicity: false,
            costEfficiency: false,
            teamSize: 'unknown',
            timeline: 'unknown',
            traffic: 'unknown'
        };

        // Use neural network to extract requirements
        try {
            const neuralAnalysis = await this.neuralEngine.infer(
                `Extract architectural requirements from: ${task.prompt}`,
                { temperature: 0.3 }
            );

            // Parse neural output to update requirements
            const promptLower = task.prompt.toLowerCase();
            const neuralLower = neuralAnalysis.text.toLowerCase();
            
            requirements.scalability = promptLower.includes('scale') || neuralLower.includes('scalab');
            requirements.performance = promptLower.includes('performance') || promptLower.includes('fast') || neuralLower.includes('performance');
            requirements.reliability = promptLower.includes('reliable') || promptLower.includes('availability') || neuralLower.includes('reliab');
            requirements.security = promptLower.includes('secure') || promptLower.includes('security') || neuralLower.includes('secur');
            requirements.flexibility = promptLower.includes('flexible') || promptLower.includes('modular') || neuralLower.includes('flexib');
            requirements.simplicity = promptLower.includes('simple') || promptLower.includes('mvp') || neuralLower.includes('simpl');
            requirements.costEfficiency = promptLower.includes('cost') || promptLower.includes('budget') || neuralLower.includes('cost');
            
            // Extract team size
            const teamMatch = task.prompt.match(/(\d+)\s*(?:people|developers|engineers|team)/i);
            if (teamMatch) {
                const size = parseInt(teamMatch[1]);
                requirements.teamSize = size <= 5 ? 'small' : size <= 20 ? 'medium' : 'large';
            }
            
            // Extract timeline
            const timelineMatch = task.prompt.match(/(\d+)\s*(?:weeks?|months?)/i);
            if (timelineMatch) {
                requirements.timeline = timelineMatch[0];
            }
            
            // Extract traffic expectations
            const trafficMatch = task.prompt.match(/(\d+[kmb]?)\s*(?:users|requests|rps)/i);
            if (trafficMatch) {
                requirements.traffic = trafficMatch[0];
            }

        } catch (error) {
            this.logger.debug('Neural requirement analysis failed, using fallback:', error.message);
        }

        // Also check context for additional requirements
        if (task.context) {
            Object.assign(requirements, task.context.requirements || {});
        }

        return requirements;
    }

    /**
     * Get neural network recommendations
     */
    async getNeuralRecommendations(task, requirements) {
        try {
            // Create a comprehensive prompt for neural analysis
            const prompt = this.createNeuralPrompt(task, requirements);
            
            // Get neural inference
            const neuralResult = await this.neuralEngine.infer(prompt, {
                temperature: 0.5,
                model: 'architecture-advisor'
            });

            // Parse neural output
            const recommendation = this.parseNeuralOutput(neuralResult.text);
            
            return {
                architecture: recommendation.architecture || 'microservices',
                confidence: neuralResult.confidence,
                reasoning: recommendation.reasoning || neuralResult.text,
                components: recommendation.components || [],
                technologies: recommendation.technologies || []
            };

        } catch (error) {
            this.logger.warn('Neural recommendation failed:', error.message);
            return {
                architecture: null,
                confidence: 0,
                reasoning: 'Neural analysis unavailable',
                components: [],
                technologies: []
            };
        }
    }

    /**
     * Create neural network prompt
     */
    createNeuralPrompt(task, requirements) {
        const reqList = Object.entries(requirements)
            .filter(([_, value]) => value === true || (typeof value === 'string' && value !== 'unknown'))
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        return `Analyze architecture for: ${task.prompt}
Requirements: ${reqList}
Recommend: architecture pattern, key components, and technology stack
Consider: scalability, maintainability, team capabilities, and timeline`;
    }

    /**
     * Parse neural network output
     */
    parseNeuralOutput(neuralText) {
        const recommendation = {
            architecture: null,
            reasoning: '',
            components: [],
            technologies: []
        };

        // Look for architecture patterns in neural output
        const patterns = ['microservices', 'monolith', 'serverless', 'event-driven', 'layered'];
        for (const pattern of patterns) {
            if (neuralText.toLowerCase().includes(pattern)) {
                recommendation.architecture = pattern;
                break;
            }
        }

        // Extract components (simple pattern matching)
        const componentMatch = neuralText.match(/components?:([^.]+)/i);
        if (componentMatch) {
            recommendation.components = componentMatch[1]
                .split(/[,;]/)
                .map(c => c.trim())
                .filter(c => c.length > 0);
        }

        // Extract technologies
        const techKeywords = ['node', 'python', 'java', 'go', 'react', 'vue', 'angular', 
                            'postgres', 'mongodb', 'redis', 'kafka', 'rabbitmq', 
                            'docker', 'kubernetes', 'aws', 'azure', 'gcp'];
        recommendation.technologies = techKeywords.filter(tech => 
            neuralText.toLowerCase().includes(tech)
        );

        recommendation.reasoning = neuralText.substring(0, 500);

        return recommendation;
    }

    /**
     * Synthesize final recommendation
     */
    async synthesizeRecommendation(requirements, neuralRecommendations, task) {
        // Start with neural recommendations if available
        let selectedArchitecture = neuralRecommendations.architecture;
        let confidence = neuralRecommendations.confidence;

        // Apply rule-based logic to validate or override
        if (!selectedArchitecture || confidence < 0.5) {
            selectedArchitecture = this.selectArchitectureByRules(requirements);
        }

        // Get pattern details
        const pattern = this.architecturePatterns.get(selectedArchitecture) || 
                       this.architecturePatterns.get('microservices');

        // Build comprehensive recommendation
        const recommendation = {
            architecture: selectedArchitecture,
            pattern: pattern,
            implementation: this.generateImplementationPlan(selectedArchitecture, requirements),
            components: this.recommendComponents(selectedArchitecture, requirements, neuralRecommendations),
            technologies: this.recommendTechnologies(selectedArchitecture, requirements, neuralRecommendations),
            deployment: this.recommendDeployment(selectedArchitecture, requirements),
            monitoring: this.recommendMonitoring(selectedArchitecture),
            security: this.recommendSecurity(requirements),
            neuralInsights: neuralRecommendations.reasoning
        };

        return recommendation;
    }

    /**
     * Select architecture based on rules
     */
    selectArchitectureByRules(requirements) {
        let scores = new Map();

        // Score each architecture pattern
        for (const [name, pattern] of this.architecturePatterns) {
            let score = pattern.neuralWeight;

            // Microservices scoring
            if (name === 'microservices') {
                if (requirements.scalability) score += 0.3;
                if (requirements.flexibility) score += 0.2;
                if (requirements.teamSize === 'large') score += 0.2;
                if (requirements.simplicity) score -= 0.3;
                if (requirements.teamSize === 'small') score -= 0.2;
            }

            // Monolith scoring
            if (name === 'monolith') {
                if (requirements.simplicity) score += 0.3;
                if (requirements.teamSize === 'small') score += 0.2;
                if (requirements.timeline && requirements.timeline.includes('week')) score += 0.2;
                if (requirements.scalability) score -= 0.3;
                if (requirements.flexibility) score -= 0.2;
            }

            // Serverless scoring
            if (name === 'serverless') {
                if (requirements.costEfficiency) score += 0.3;
                if (requirements.scalability) score += 0.2;
                if (requirements.traffic === 'variable') score += 0.2;
                if (requirements.performance) score -= 0.1;
            }

            // Event-driven scoring
            if (name === 'event-driven') {
                if (requirements.scalability) score += 0.2;
                if (requirements.flexibility) score += 0.3;
                if (requirements.reliability) score += 0.1;
                if (requirements.simplicity) score -= 0.2;
            }

            scores.set(name, score);
        }

        // Select highest scoring architecture
        let bestArchitecture = 'microservices';
        let bestScore = 0;
        for (const [arch, score] of scores) {
            if (score > bestScore) {
                bestScore = score;
                bestArchitecture = arch;
            }
        }

        return bestArchitecture;
    }

    /**
     * Generate implementation plan
     */
    generateImplementationPlan(architecture, requirements) {
        const plans = {
            microservices: [
                'Define service boundaries based on business domains',
                'Set up API gateway for service communication',
                'Implement service discovery and load balancing',
                'Create shared libraries for common functionality',
                'Set up distributed logging and tracing',
                'Implement circuit breakers for fault tolerance',
                'Design data management strategy (database per service)',
                'Set up CI/CD pipelines for each service'
            ],
            monolith: [
                'Design modular architecture with clear boundaries',
                'Implement layered architecture (presentation, business, data)',
                'Set up dependency injection container',
                'Create comprehensive test suite',
                'Implement feature flags for gradual rollouts',
                'Design for future decomposition if needed',
                'Set up single CI/CD pipeline',
                'Implement comprehensive logging'
            ],
            serverless: [
                'Identify functions and their triggers',
                'Design state management strategy',
                'Implement API Gateway for HTTP endpoints',
                'Set up event sources (queues, streams, storage)',
                'Design cold start mitigation strategies',
                'Implement distributed tracing',
                'Create infrastructure as code templates',
                'Set up monitoring and alerting'
            ],
            'event-driven': [
                'Design event schema and versioning strategy',
                'Choose message broker (Kafka, RabbitMQ, etc.)',
                'Implement event sourcing if applicable',
                'Design event handlers and processors',
                'Implement saga pattern for distributed transactions',
                'Set up dead letter queues',
                'Create event monitoring dashboard',
                'Design replay and recovery mechanisms'
            ],
            layered: [
                'Define layer responsibilities and boundaries',
                'Implement dependency inversion principle',
                'Create interfaces between layers',
                'Design data transfer objects (DTOs)',
                'Implement repository pattern for data access',
                'Create service layer for business logic',
                'Design presentation layer patterns',
                'Set up cross-cutting concerns (logging, security)'
            ]
        };

        return plans[architecture] || plans.microservices;
    }

    /**
     * Recommend components based on architecture
     */
    recommendComponents(architecture, requirements, neuralRecommendations) {
        const baseComponents = {
            microservices: [
                'API Gateway',
                'Service Registry',
                'Configuration Server',
                'Circuit Breaker',
                'Load Balancer',
                'Message Queue',
                'Distributed Cache',
                'Monitoring Service'
            ],
            monolith: [
                'Web Server',
                'Application Server',
                'Database',
                'Cache Layer',
                'Job Queue',
                'Session Store'
            ],
            serverless: [
                'API Gateway',
                'Lambda Functions',
                'Event Bus',
                'State Store',
                'Queue Service',
                'Notification Service'
            ],
            'event-driven': [
                'Message Broker',
                'Event Store',
                'Event Processors',
                'API Gateway',
                'State Store',
                'Workflow Engine'
            ],
            layered: [
                'Presentation Layer',
                'Business Logic Layer',
                'Data Access Layer',
                'Database',
                'Cache',
                'External Service Adapters'
            ]
        };

        let components = baseComponents[architecture] || [];

        // Add neural recommendations if available
        if (neuralRecommendations.components && neuralRecommendations.components.length > 0) {
            components = [...new Set([...components, ...neuralRecommendations.components])];
        }

        // Add requirement-specific components
        if (requirements.security) {
            components.push('Authentication Service', 'Authorization Service', 'Secrets Manager');
        }
        if (requirements.reliability) {
            components.push('Health Check Service', 'Backup Service', 'Disaster Recovery');
        }

        return components;
    }

    /**
     * Recommend technologies
     */
    recommendTechnologies(architecture, requirements, neuralRecommendations) {
        const baseTech = {
            microservices: {
                languages: ['Node.js', 'Go', 'Java Spring'],
                databases: ['PostgreSQL', 'MongoDB', 'Redis'],
                messaging: ['RabbitMQ', 'Kafka', 'NATS'],
                deployment: ['Kubernetes', 'Docker', 'Helm']
            },
            monolith: {
                languages: ['Node.js', 'Python Django', 'Ruby on Rails'],
                databases: ['PostgreSQL', 'MySQL'],
                caching: ['Redis', 'Memcached'],
                deployment: ['Docker', 'PM2', 'Systemd']
            },
            serverless: {
                languages: ['Node.js', 'Python', 'Go'],
                services: ['AWS Lambda', 'API Gateway', 'DynamoDB'],
                messaging: ['SQS', 'SNS', 'EventBridge'],
                deployment: ['Serverless Framework', 'SAM', 'CDK']
            }
        };

        let tech = baseTech[architecture] || baseTech.microservices;

        // Merge with neural recommendations
        if (neuralRecommendations.technologies && neuralRecommendations.technologies.length > 0) {
            tech.suggested = neuralRecommendations.technologies;
        }

        return tech;
    }

    /**
     * Recommend deployment strategy
     */
    recommendDeployment(architecture, requirements) {
        const strategies = {
            microservices: {
                platform: 'Kubernetes',
                strategy: 'Rolling updates with canary deployments',
                tools: ['ArgoCD', 'Flux', 'Jenkins X'],
                practices: ['GitOps', 'Infrastructure as Code', 'Automated testing']
            },
            monolith: {
                platform: 'Cloud VMs or Containers',
                strategy: 'Blue-green deployment',
                tools: ['Jenkins', 'GitLab CI', 'GitHub Actions'],
                practices: ['Feature flags', 'Database migrations', 'Rollback procedures']
            },
            serverless: {
                platform: 'Cloud Provider (AWS/Azure/GCP)',
                strategy: 'Automatic deployments with versioning',
                tools: ['Serverless Framework', 'AWS SAM', 'Terraform'],
                practices: ['Environment stages', 'Function versioning', 'Alias management']
            }
        };

        return strategies[architecture] || strategies.microservices;
    }

    /**
     * Recommend monitoring approach
     */
    recommendMonitoring(architecture) {
        const monitoring = {
            microservices: {
                tools: ['Prometheus + Grafana', 'ELK Stack', 'Jaeger'],
                metrics: ['Service health', 'Request latency', 'Error rates', 'Trace analysis'],
                practices: ['Distributed tracing', 'Centralized logging', 'Service mesh observability']
            },
            monolith: {
                tools: ['New Relic', 'DataDog', 'AppDynamics'],
                metrics: ['Application performance', 'Database queries', 'Memory usage', 'Error tracking'],
                practices: ['APM integration', 'Custom metrics', 'Log aggregation']
            },
            serverless: {
                tools: ['CloudWatch', 'X-Ray', 'Lumigo'],
                metrics: ['Function duration', 'Cold starts', 'Error rates', 'Cost analysis'],
                practices: ['Distributed tracing', 'Custom metrics', 'Alarm configuration']
            }
        };

        return monitoring[architecture] || monitoring.microservices;
    }

    /**
     * Recommend security measures
     */
    recommendSecurity(requirements) {
        const security = {
            authentication: 'OAuth 2.0 / JWT tokens',
            authorization: 'Role-based access control (RBAC)',
            encryption: 'TLS 1.3 for transit, AES-256 for rest',
            secrets: 'Vault or cloud provider secret manager',
            scanning: 'SAST/DAST tools, dependency scanning',
            compliance: []
        };

        if (requirements.security) {
            security.compliance.push('SOC2', 'GDPR', 'HIPAA');
            security.additional = [
                'Web Application Firewall (WAF)',
                'DDoS protection',
                'Regular security audits',
                'Incident response plan'
            ];
        }

        return security;
    }

    /**
     * Calculate confidence score
     */
    calculateConfidence(neuralRecommendations, requirements) {
        let confidence = 0.5; // Base confidence

        // Neural contribution
        if (neuralRecommendations.confidence > 0) {
            confidence = (confidence + neuralRecommendations.confidence) / 2;
        }

        // Boost confidence based on requirement clarity
        const definedRequirements = Object.values(requirements)
            .filter(v => v !== false && v !== 'unknown').length;
        confidence += definedRequirements * 0.05;

        // Cap at 0.95
        return Math.min(confidence, 0.95);
    }

    /**
     * Generate reasoning explanation
     */
    generateReasoning(recommendation, requirements) {
        const reasons = [`Selected ${recommendation.architecture} architecture based on:`];

        if (requirements.scalability) {
            reasons.push('- High scalability requirements');
        }
        if (requirements.simplicity) {
            reasons.push('- Need for simplicity and rapid development');
        }
        if (requirements.teamSize) {
            reasons.push(`- ${requirements.teamSize} team size considerations`);
        }
        if (recommendation.neuralInsights) {
            reasons.push(`- Neural analysis: ${recommendation.neuralInsights.substring(0, 100)}...`);
        }

        reasons.push(`\nKey benefits: ${recommendation.pattern.pros.join(', ')}`);
        reasons.push(`Considerations: ${recommendation.pattern.cons.join(', ')}`);

        return reasons.join('\n');
    }

    /**
     * Generate alternative architectures
     */
    async generateAlternatives(requirements, primaryRecommendation) {
        const alternatives = [];
        const primary = primaryRecommendation.architecture;

        // Get all architectures except primary
        for (const [name, pattern] of this.architecturePatterns) {
            if (name !== primary) {
                alternatives.push({
                    architecture: name,
                    pattern: pattern,
                    suitability: this.calculateSuitabilityScore(name, requirements),
                    whenToUse: this.getWhenToUse(name, requirements)
                });
            }
        }

        // Sort by suitability
        alternatives.sort((a, b) => b.suitability - a.suitability);

        return alternatives.slice(0, 2); // Return top 2 alternatives
    }

    /**
     * Calculate suitability score for architecture
     */
    calculateSuitabilityScore(architecture, requirements) {
        // Reuse the scoring logic from selectArchitectureByRules
        let score = this.architecturePatterns.get(architecture).neuralWeight;

        // Apply requirement-based adjustments
        if (architecture === 'microservices' && requirements.scalability) score += 0.2;
        if (architecture === 'monolith' && requirements.simplicity) score += 0.2;
        if (architecture === 'serverless' && requirements.costEfficiency) score += 0.2;
        // ... etc

        return Math.min(score, 1.0);
    }

    /**
     * Get when to use specific architecture
     */
    getWhenToUse(architecture, requirements) {
        const conditions = {
            microservices: 'Use when you need independent scaling, have a large team, or require technology diversity',
            monolith: 'Use for simple applications, small teams, or when rapid prototyping is needed',
            serverless: 'Use for event-driven workloads, variable traffic, or when minimizing operations overhead',
            'event-driven': 'Use for real-time processing, complex workflows, or when loose coupling is critical',
            layered: 'Use for traditional enterprise applications with clear separation of concerns'
        };

        return conditions[architecture] || 'Consider based on specific requirements';
    }

    /**
     * Calculate requirements coverage
     */
    calculateRequirementsCoverage(requirements, recommendation) {
        const covered = [];
        const pattern = recommendation.pattern;

        if (requirements.scalability && pattern.useCases.includes('scalability')) {
            covered.push('scalability');
        }
        if (requirements.simplicity && pattern.description.includes('simple')) {
            covered.push('simplicity');
        }
        // ... check other requirements

        const total = Object.values(requirements).filter(v => v === true).length;
        return total > 0 ? covered.length / total : 1.0;
    }

    /**
     * Store decision for learning
     */
    storeDecision(taskId, recommendation) {
        this.decisionHistory.set(taskId, {
            timestamp: Date.now(),
            architecture: recommendation.architecture,
            confidence: recommendation.confidence,
            requirements: recommendation.requirements
        });

        // Keep only last 100 decisions
        if (this.decisionHistory.size > 100) {
            const firstKey = this.decisionHistory.keys().next().value;
            this.decisionHistory.delete(firstKey);
        }
    }

    /**
     * Get fallback recommendation
     */
    getFallbackRecommendation(task) {
        return {
            architecture: 'microservices',
            pattern: this.architecturePatterns.get('microservices'),
            implementation: ['Start with modular monolith', 'Identify service boundaries', 'Gradually decompose'],
            components: ['API Gateway', 'Service Registry', 'Database'],
            technologies: {
                languages: ['Node.js', 'Python'],
                databases: ['PostgreSQL'],
                deployment: ['Docker', 'Kubernetes']
            },
            reasoning: 'Providing default microservices recommendation due to analysis failure'
        };
    }

    /**
     * Calculate suitability for architecture tasks
     */
    async calculateSuitability(task) {
        let suitability = await super.calculateSuitability(task);

        // ArchitectAdvisor is highly suitable for architecture decisions
        if (task.type === 'architecture-analysis' || 
            task.prompt.toLowerCase().includes('architect') ||
            task.prompt.toLowerCase().includes('design') ||
            task.prompt.toLowerCase().includes('structure')) {
            suitability += 0.4;
        }

        // Boost if neural engine is available
        if (this.neuralEngine.getStats().hasBindings) {
            suitability += 0.1;
        }

        return Math.min(suitability, 1.0);
    }
}

export default ArchitectAdvisor;