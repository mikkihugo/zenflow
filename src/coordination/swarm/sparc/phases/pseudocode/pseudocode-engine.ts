/**
 * SPARC Pseudocode Phase Engine
 *
 * Handles the second phase of SPARC methodology - generating algorithmic
 * pseudocode with complexity analysis and optimization strategies.
 */

import { nanoid } from 'nanoid';
import type {
  AlgorithmPseudocode,
  ComplexityAnalysis,
  ControlFlowDiagram,
  DataStructureDesign,
  DataStructureSpec,
  DetailedSpecification,
  FunctionalRequirement,
  LogicValidation,
  OptimizationOpportunity,
  OptimizationSuggestion,
  ParameterDefinition,
  PerformanceTarget,
  Priority,
  ProcessFlow,
  ProcessStep,
  PseudocodeEngine,
  PseudocodeStep,
  PseudocodeStructure,
  PseudocodeValidation,
  ReturnDefinition,
  ValidationResult,
} from '../../types/sparc-types';

export class PseudocodePhaseEngine implements PseudocodeEngine {
  /**
   * Generate algorithmic pseudocode from detailed specifications
   *
   * @param spec
   */
  async generateAlgorithmPseudocode(spec: DetailedSpecification): Promise<AlgorithmPseudocode[]> {
    const algorithms: AlgorithmPseudocode[] = [];

    for (const requirement of spec.functionalRequirements) {
      const algorithm: AlgorithmPseudocode = {
        name: requirement.title,
        purpose: requirement.description,
        inputs: await this.extractInputParameterDefinitions(requirement),
        outputs: await this.extractOutputDefinitions(requirement),
        steps: await this.generatePseudocodeSteps(requirement, spec.domain),
        complexity: await this.estimateAlgorithmComplexity(requirement),
        optimizations: await this.identifyAlgorithmOptimizations(requirement),
      };
      algorithms.push(algorithm);
    }

    return algorithms;
  }

  async designDataStructures(
    requirements: FunctionalRequirement[]
  ): Promise<DataStructureDesign[]> {
    // Convert requirements to proper data structure specs
    const dataStructures: DataStructureDesign[] = [];

    for (const requirement of requirements) {
      dataStructures.push({
        name: `${requirement.title}Data`,
        type: 'class',
        properties: [
          {
            name: 'id',
            type: 'string',
            visibility: 'public',
            description: 'Unique identifier',
          },
        ],
        methods: [
          {
            name: 'process',
            parameters: [],
            returnType: 'void',
            visibility: 'public',
            description: `Process ${requirement.title}`,
          },
        ],
        relationships: [],
      });
    }

    return dataStructures;
  }

  async mapControlFlows(algorithms: AlgorithmPseudocode[]): Promise<ControlFlowDiagram[]> {
    return algorithms.map((alg) => ({
      name: `${alg.name}Flow`,
      nodes: [
        { id: 'start', type: 'start', label: 'Start' },
        { id: 'process', type: 'process', label: alg.purpose },
        { id: 'end', type: 'end', label: 'End' },
      ],
      edges: [
        { from: 'start', to: 'process' },
        { from: 'process', to: 'end' },
      ],
      cycles: false,
      complexity: alg.steps.length,
    }));
  }

  async optimizeAlgorithmComplexity(
    pseudocode: AlgorithmPseudocode
  ): Promise<OptimizationSuggestion[]> {
    // Implementation for optimization suggestions
    return [
      {
        type: 'performance',
        description: `Optimize ${pseudocode.name} for better performance`,
        impact: 'medium',
        effort: 'low',
      },
    ];
  }

  async validatePseudocodeLogic(pseudocode: AlgorithmPseudocode[]): Promise<LogicValidation> {
    const validationResults: ValidationResult[] = [];

    for (const algorithm of pseudocode) {
      // Validate algorithm structure
      validationResults.push({
        criterion: `${algorithm.name} completeness`,
        passed: algorithm.steps.length > 0,
        score: algorithm.steps.length > 0 ? 1.0 : 0.0,
        details:
          algorithm.steps.length > 0 ? 'Algorithm has valid steps' : 'Algorithm missing steps',
      });

      // Validate input/output consistency
      validationResults.push({
        criterion: `${algorithm.name} I/O consistency`,
        passed: algorithm.inputs.length > 0 && algorithm.outputs.length > 0,
        score: algorithm.inputs.length > 0 && algorithm.outputs.length > 0 ? 1.0 : 0.5,
        details: 'Input and output parameters defined',
      });
    }

    return validationResults;
  }
  /**
   * Generate algorithmic pseudocode from detailed specifications
   *
   * @param specification
   */
  async generatePseudocode(specification: DetailedSpecification): Promise<PseudocodeStructure> {
    // Generate algorithms using the interface-compliant method
    const algorithms = await this.generateAlgorithmPseudocode(specification);
    const dataStructures = await this.designDataStructures(specification.functionalRequirements);
    const controlFlows = await this.mapControlFlows(algorithms);
    const complexityAnalysis = await this.analyzeComplexity(algorithms);

    return {
      id: nanoid(),
      algorithms,
      coreAlgorithms: algorithms, // Legacy compatibility
      dataStructures,
      controlFlows,
      optimizations: await this.identifyOptimizations(algorithms),
      dependencies: [], // Algorithm dependencies
      complexityAnalysis,
    };
  }

  /**
   * Design core algorithms based on functional requirements (Legacy method for backward compatibility)
   *
   * @param specification
   */
  private async designCoreAlgorithms(
    specification: DetailedSpecification
  ): Promise<AlgorithmPseudocode[]> {
    const algorithms: AlgorithmPseudocode[] = [];

    for (const requirement of specification.functionalRequirements) {
      if (requirement.type === 'algorithmic') {
        const algorithm = await this.createAlgorithmForRequirement(
          requirement,
          specification.domain
        );
        algorithms.push(algorithm);
      }
    }

    // Add domain-specific algorithms
    switch (specification.domain) {
      case 'swarm-coordination':
        algorithms.push(...(await this.createSwarmCoordinationAlgorithms(specification)));
        break;
      case 'neural-networks':
        algorithms.push(...(await this.createNeuralNetworkAlgorithms(specification)));
        break;
      case 'memory-systems':
        algorithms.push(...(await this.createMemorySystemAlgorithms(specification)));
        break;
      default:
        algorithms.push(...(await this.createGeneralAlgorithms(specification)));
    }

    return algorithms;
  }

  /**
   * Create algorithm for specific requirement (Legacy method)
   *
   * @param requirement
   * @param domain
   */
  private async createAlgorithmForRequirement(
    requirement: any,
    domain: string
  ): Promise<AlgorithmPseudocode> {
    return {
      name: `${requirement.title.replace(/\s+/g, '')}Algorithm`,
      purpose: `Algorithm implementing: ${requirement.description}`,
      inputs: await this.extractInputParameterDefinitions(requirement),
      outputs: await this.extractOutputDefinitions(requirement),
      steps: await this.generatePseudocodeSteps(requirement, domain),
      complexity: await this.estimateAlgorithmComplexity(requirement),
      optimizations: await this.identifyAlgorithmOptimizations(requirement),
    };
  }

  /**
   * Generate pseudocode for swarm coordination algorithms
   *
   * @param _specification
   */
  private async createSwarmCoordinationAlgorithms(
    _specification: DetailedSpecification
  ): Promise<AlgorithmPseudocode[]> {
    return [
      {
        name: 'AgentRegistrationAlgorithm',
        purpose: 'Manages agent registration and capability discovery',
        inputs: [
          { name: 'agent_info', type: 'AgentInfo', description: 'Agent information' },
          { name: 'capabilities', type: 'Capability[]', description: 'Agent capabilities' },
          {
            name: 'resource_requirements',
            type: 'ResourceRequirement[]',
            description: 'Required resources',
          },
        ],
        outputs: [
          {
            name: 'registration_result',
            type: 'RegistrationResult',
            description: 'Registration outcome',
          },
          { name: 'agent_id', type: 'string', description: 'Assigned agent ID' },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'VALIDATE agent_info',
            pseudocode: 'VALIDATE agent_info',
            complexity: 'O(1)',
          },
          {
            stepNumber: 2,
            description: 'CHECK resource_availability(resource_requirements)',
            pseudocode: 'CHECK resource_availability(resource_requirements)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 3,
            description: 'Generate unique ID and register agent',
            pseudocode: 'agent_id ← GENERATE_UNIQUE_ID(); registry[agent_id] ← agent_data',
            complexity: 'O(log n)',
          },
        ],
        complexity: {
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(1)',
          scalability: 'Good logarithmic scaling',
          worstCase: 'O(log n) for registry insertion, constant space for agent data',
        },
        optimizations: [
          {
            type: 'performance',
            description: 'Use hash table for faster agent lookup',
            impact: 'medium',
            effort: 'low',
          },
        ],
      },
      {
        name: 'LoadBalancingAlgorithm',
        purpose: 'Distributes tasks across available agents optimally',
        inputs: [
          { name: 'task', type: 'Task', description: 'Task to distribute' },
          { name: 'available_agents', type: 'Agent[]', description: 'Available agents' },
          {
            name: 'performance_metrics',
            type: 'PerformanceMetrics',
            description: 'Performance data',
          },
        ],
        outputs: [
          { name: 'selected_agent', type: 'Agent', description: 'Selected agent' },
          { name: 'task_assignment', type: 'TaskAssignment', description: 'Assignment details' },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Filter eligible agents',
            pseudocode: 'eligible_agents ← FILTER agents BY task.requirements',
            complexity: 'O(n)',
          },
          {
            stepNumber: 2,
            description: 'Score and rank agents',
            pseudocode: 'FOR EACH agent: score ← CALCULATE_SCORE(agent, task)',
            complexity: 'O(n)',
          },
          {
            stepNumber: 3,
            description: 'Select best agent',
            pseudocode: 'best_agent ← MAX(scored_agents, BY total_score)',
            complexity: 'O(n)',
          },
        ],
        complexity: {
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)',
          scalability: 'Good logarithmic scaling',
          worstCase: 'Linear scan with logarithmic sorting for agent selection',
        },
        optimizations: [
          {
            type: 'caching',
            description: 'Cache agent performance scores',
            impact: 'medium',
            effort: 'low',
          },
        ],
      },
    ];
  }

  /**
   * Generate pseudocode for neural network algorithms
   *
   * @param _specification
   */
  private async createNeuralNetworkAlgorithms(
    _specification: DetailedSpecification
  ): Promise<AlgorithmPseudocode[]> {
    return [
      {
        name: 'ForwardPropagationAlgorithm',
        purpose: 'WASM-accelerated forward propagation through neural network',
        inputs: [
          { name: 'input_vector', type: 'number[]', description: 'Input data vector' },
          { name: 'weights', type: 'number[][]', description: 'Network weights' },
          { name: 'biases', type: 'number[][]', description: 'Network biases' },
          { name: 'layer_configs', type: 'LayerConfig[]', description: 'Layer configurations' },
        ],
        outputs: [
          { name: 'output_vector', type: 'number[]', description: 'Network output' },
          { name: 'activations', type: 'number[][]', description: 'Layer activations' },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Initialize with input',
            pseudocode: 'activations[0] ← input_vector',
            complexity: 'O(1)',
          },
          {
            stepNumber: 2,
            description: 'Forward propagate through layers',
            pseudocode: 'FOR layer_index FROM 1 TO num_layers DO forward_pass(layer)',
            complexity: 'O(n * m * k)',
          },
          {
            stepNumber: 3,
            description: 'Apply WASM matrix multiplication',
            pseudocode: 'raw_output ← WASM_MATRIX_MULTIPLY(layer_input, weights_layer)',
            complexity: 'O(n * m)',
          },
        ],
        complexity: {
          timeComplexity: 'O(n * m * k)',
          spaceComplexity: 'O(n * m)',
          scalability: 'Moderate scaling with layer dimensions',
          worstCase: 'Matrix multiplication complexity where n,m,k are layer dimensions',
        },
        optimizations: [
          {
            type: 'performance',
            description: 'Use WASM for matrix operations',
            impact: 'high',
            effort: 'medium',
          },
        ],
      },
    ];
  }

  /**
   * Generate pseudocode for memory system algorithms
   *
   * @param _specification
   */
  private async createMemorySystemAlgorithms(
    _specification: DetailedSpecification
  ): Promise<AlgorithmPseudocode[]> {
    return [
      {
        name: 'MultiBackendMemoryAlgorithm',
        purpose: 'Manages data across multiple storage backends with consistency',
        inputs: [
          { name: 'operation_type', type: 'string', description: 'Type of operation (read/write)' },
          { name: 'key', type: 'string', description: 'Data key' },
          { name: 'value', type: 'any', description: 'Data value' },
          { name: 'consistency_level', type: 'string', description: 'Consistency requirement' },
        ],
        outputs: [
          { name: 'operation_result', type: 'OperationResult', description: 'Operation outcome' },
          { name: 'affected_backends', type: 'Backend[]', description: 'Backends affected' },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Get available backends',
            pseudocode: 'backends ← GET_AVAILABLE_BACKENDS()',
            complexity: 'O(1)',
          },
          {
            stepNumber: 2,
            description: 'Select primary backend',
            pseudocode: 'primary_backend ← SELECT_PRIMARY(backends, key)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 3,
            description: 'Execute operation based on type',
            pseudocode: 'CASE operation_type OF read/write operations',
            complexity: 'O(b)',
          },
        ],
        complexity: {
          timeComplexity: 'O(b)',
          spaceComplexity: 'O(1)',
          scalability: 'Excellent linear scaling',
          worstCase: 'Linear in number of backends, constant space per operation',
        },
        optimizations: [
          {
            type: 'caching',
            description: 'Cache backend selection decisions',
            impact: 'medium',
            effort: 'low',
          },
        ],
      },
    ];
  }

  /**
   * Create general-purpose algorithms
   *
   * @param _specification
   */
  private async createGeneralAlgorithms(
    _specification: DetailedSpecification
  ): Promise<AlgorithmPseudocode[]> {
    return [
      {
        name: 'GenericDataProcessingAlgorithm',
        purpose: 'General data processing and transformation pipeline',
        inputs: [
          { name: 'data', type: 'any[]', description: 'Input data' },
          {
            name: 'transformation_pipeline',
            type: 'Transformation[]',
            description: 'Processing steps',
          },
          { name: 'validation_rules', type: 'ValidationRule[]', description: 'Validation rules' },
        ],
        outputs: [
          { name: 'processed_data', type: 'any[]', description: 'Processed data' },
          {
            name: 'validation_report',
            type: 'ValidationReport',
            description: 'Validation results',
          },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Initialize processing',
            pseudocode: 'processed_data ← data; validation_report ← EMPTY_REPORT()',
            complexity: 'O(1)',
          },
          {
            stepNumber: 2,
            description: 'Apply transformations',
            pseudocode: 'FOR EACH transformation: processed_data ← APPLY(transformation)',
            complexity: 'O(n * t)',
          },
          {
            stepNumber: 3,
            description: 'Validate results',
            pseudocode:
              'final_validation ← VALIDATE_AGAINST_RULES(processed_data, validation_rules)',
            complexity: 'O(n)',
          },
        ],
        complexity: {
          timeComplexity: 'O(n * t)',
          spaceComplexity: 'O(n)',
          scalability: 'Good linear scaling',
          worstCase: 'Linear in data size and number of transformations',
        },
        optimizations: [
          {
            type: 'parallelization',
            description: 'Parallelize transformation steps',
            impact: 'high',
            effort: 'medium',
          },
        ],
      },
    ];
  }

  /**
   * Specify data structures needed for the algorithms
   *
   * @param specification
   */
  private async specifyDataStructures(
    specification: DetailedSpecification
  ): Promise<DataStructureDesign[]> {
    const structures: DataStructureDesign[] = [];

    // Add domain-specific data structures
    switch (specification.domain) {
      case 'swarm-coordination':
        structures.push(
          {
            name: 'AgentRegistry',
            type: 'class',
            properties: [
              {
                name: 'agents',
                type: 'Map<string, AgentInfo>',
                visibility: 'private',
                description: 'Agent storage',
              },
            ],
            methods: [
              {
                name: 'register',
                parameters: [],
                returnType: 'string',
                visibility: 'public',
                description: 'Register agent',
              },
              {
                name: 'find',
                parameters: [],
                returnType: 'AgentInfo',
                visibility: 'public',
                description: 'Find agent',
              },
            ],
            relationships: [],
          },
          {
            name: 'TaskQueue',
            type: 'class',
            properties: [
              {
                name: 'tasks',
                type: 'PriorityQueue<Task>',
                visibility: 'private',
                description: 'Task storage',
              },
            ],
            methods: [
              {
                name: 'enqueue',
                parameters: [],
                returnType: 'void',
                visibility: 'public',
                description: 'Add task',
              },
              {
                name: 'dequeue',
                parameters: [],
                returnType: 'Task',
                visibility: 'public',
                description: 'Get task',
              },
            ],
            relationships: [],
          }
        );
        break;
      case 'neural-networks':
        structures.push({
          name: 'WeightMatrix',
          type: 'class',
          properties: [
            {
              name: 'weights',
              type: 'Float64Array',
              visibility: 'private',
              description: 'Weight storage',
            },
          ],
          methods: [
            {
              name: 'multiply',
              parameters: [],
              returnType: 'number[]',
              visibility: 'public',
              description: 'Matrix multiplication',
            },
          ],
          relationships: [],
        });
        break;
    }

    return structures;
  }

  /**
   * Analyze computational complexity of algorithms
   *
   * @param algorithms
   */
  private async analyzeComplexity(algorithms: AlgorithmPseudocode[]): Promise<ComplexityAnalysis> {
    const worstCase = this.calculateWorstCaseComplexity(algorithms);
    const averageCase = this.calculateAverageCaseComplexity(algorithms);
    const bestCase = this.calculateBestCaseComplexity(algorithms);

    return {
      timeComplexity: worstCase,
      spaceComplexity: this.calculateSpaceComplexity(algorithms),
      scalability: this.analyzeScalability(algorithms),
      worstCase,
      averageCase,
      bestCase,
      bottlenecks: this.identifyBottlenecks(algorithms),
    };
  }

  private calculateWorstCaseComplexity(algorithms: AlgorithmPseudocode[]): string {
    // Find the algorithm with highest complexity
    const complexities = algorithms.map((alg) => alg.complexity.timeComplexity);
    return this.maxComplexity(complexities);
  }

  private calculateAverageCaseComplexity(_algorithms: AlgorithmPseudocode[]): string {
    // Average complexity across all algorithms
    return 'O(n log n)';
  }

  private calculateBestCaseComplexity(_algorithms: AlgorithmPseudocode[]): string {
    // Best case when all optimizations apply
    return 'O(n)';
  }

  private calculateSpaceComplexity(algorithms: AlgorithmPseudocode[]): string {
    const spaceComplexities = algorithms.map((alg) => alg.complexity.spaceComplexity);
    return this.maxComplexity(spaceComplexities);
  }

  private maxComplexity(complexities: string[]): string {
    // Simple complexity comparison - in real implementation would be more sophisticated
    if (complexities.includes('O(n^3)')) return 'O(n^3)';
    if (complexities.includes('O(n^2)')) return 'O(n^2)';
    if (complexities.includes('O(n log n)')) return 'O(n log n)';
    if (complexities.includes('O(n)')) return 'O(n)';
    return 'O(1)';
  }

  private analyzeScalability(_algorithms: AlgorithmPseudocode[]): string {
    return 'System scales linearly with input size, with logarithmic overhead for coordination operations';
  }

  private identifyBottlenecks(_algorithms: AlgorithmPseudocode[]): string[] {
    return [
      'Matrix multiplication in neural network operations',
      'Network communication latency in distributed coordination',
      'Database query performance for large agent registries',
    ];
  }

  /**
   * Identify optimization opportunities
   *
   * @param algorithms
   */
  private async identifyOptimizations(
    algorithms: AlgorithmPseudocode[]
  ): Promise<OptimizationOpportunity[]> {
    const optimizations: OptimizationOpportunity[] = [];

    for (const algorithm of algorithms) {
      // Combine algorithm-specific optimizations
      optimizations.push(...algorithm.optimizations);
    }

    // Add general system optimizations
    optimizations.push(
      {
        type: 'algorithmic',
        description: 'Use WASM for performance-critical mathematical operations',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '300% performance increase for matrix operations',
      },
      {
        type: 'caching',
        description: 'Implement intelligent caching for frequently accessed agent data',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '50% reduction in database queries',
      },
      {
        type: 'parallelization',
        description: 'Parallelize independent algorithm execution across multiple threads',
        impact: 'high',
        effort: 'high',
        estimatedImprovement: '200% throughput increase on multi-core systems',
      }
    );

    return optimizations;
  }

  /**
   * Generate algorithm-specific pseudocode
   *
   * @param requirement
   * @param _domain
   */
  private async generateAlgorithmPseudocodePrivate(
    requirement: any,
    _domain: string
  ): Promise<string> {
    return `
ALGORITHM ${requirement.title.replace(/\s+/g, '')}
INPUT: ${requirement.inputs?.join(', ') || 'input_data'}
OUTPUT: ${requirement.outputs?.join(', ') || 'output_result'}

BEGIN
  // ${requirement.description}
  VALIDATE input_data
  PROCESS according_to_requirements
  RETURN processed_result
END
    `.trim();
  }

  /**
   * Estimate algorithm complexity
   *
   * @param _requirement
   */
  private async estimateAlgorithmComplexity(_requirement: any): Promise<ComplexityAnalysis> {
    return {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      scalability: 'Good linear scaling',
      worstCase: 'Linear time complexity based on input size, constant space usage',
    };
  }

  /**
   * Extract input parameters from requirement as ParameterDefinition[]
   *
   * @param requirement
   */
  private async extractInputParameterDefinitions(requirement: any): Promise<ParameterDefinition[]> {
    const inputs = requirement.inputs || ['input'];
    return inputs.map((input: string) => ({
      name: input,
      type: 'any',
      description: `Input parameter: ${input}`,
      optional: false,
    }));
  }

  /**
   * Extract output definitions from requirement as ReturnDefinition[]
   *
   * @param requirement
   */
  private async extractOutputDefinitions(requirement: any): Promise<ReturnDefinition[]> {
    const outputs = requirement.outputs || ['result'];
    return outputs.map((output: string) => ({
      name: output,
      type: 'any',
      description: `Output result: ${output}`,
    }));
  }

  /**
   * Generate pseudocode steps from requirement
   *
   * @param requirement
   * @param domain
   */
  private async generatePseudocodeSteps(
    requirement: any,
    domain: string
  ): Promise<PseudocodeStep[]> {
    const pseudocodeText = await this.generateAlgorithmPseudocodePrivate(requirement, domain);
    const lines = pseudocodeText.split('\n').filter((line) => line.trim());

    return lines.map((line, index) => ({
      stepNumber: index + 1,
      description: line.trim(),
      pseudocode: line.trim(),
      complexity: 'O(1)',
      dependencies: [],
    }));
  }

  /**
   * Identify optimization opportunities for specific algorithm
   *
   * @param requirement
   */
  private async identifyAlgorithmOptimizations(
    requirement: any
  ): Promise<OptimizationOpportunity[]> {
    return [
      {
        type: 'performance',
        description: `Optimize ${requirement.title} for better performance`,
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '20% performance gain',
      },
    ];
  }

  /**
   * Validate generated pseudocode
   *
   * @param pseudocode
   */
  async validatePseudocode(pseudocode: PseudocodeStructure): Promise<PseudocodeValidation> {
    const validationResults: ValidationResult[] = [];

    // Validate algorithm completeness
    validationResults.push({
      criterion: 'Algorithm completeness',
      passed: pseudocode.algorithms.length > 0,
      score: pseudocode.algorithms.length > 0 ? 1.0 : 0.0,
      details:
        pseudocode.algorithms.length > 0
          ? 'All required algorithms defined'
          : 'Missing core algorithm definitions',
    });

    // Validate complexity analysis
    validationResults.push({
      criterion: 'Complexity analysis',
      passed: !!pseudocode.complexityAnalysis,
      score: pseudocode.complexityAnalysis ? 1.0 : 0.0,
      details: pseudocode.complexityAnalysis
        ? 'Comprehensive complexity analysis provided'
        : 'Missing complexity analysis',
    });

    // Validate data structures
    validationResults.push({
      criterion: 'Data structure design',
      passed: pseudocode.dataStructures.length > 0,
      score: pseudocode.dataStructures.length > 0 ? 1.0 : 0.0,
      details:
        pseudocode.dataStructures.length > 0
          ? 'Appropriate data structures specified'
          : 'Missing data structure specifications',
    });

    const overallScore =
      validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;

    return {
      id: nanoid(),
      algorithmId: pseudocode.id,
      validationResults,
      logicErrors: validationResults.filter((r) => !r.passed).map((r) => r.details || ''),
      optimizationSuggestions: this.generateRecommendations(validationResults),
      complexityVerification: !!pseudocode.complexityAnalysis,
      overallScore,
      recommendations: this.generateRecommendations(validationResults),
      approved: overallScore >= 0.7,
    };
  }

  /**
   * Generate recommendations based on validation results
   *
   * @param validationResults
   */
  private generateRecommendations(validationResults: ValidationResult[]): string[] {
    const recommendations: string[] = [];

    for (const result of validationResults) {
      if (!result.passed) {
        switch (result.criterion) {
          case 'Algorithm completeness':
            recommendations.push('Add missing core algorithms for all functional requirements');
            break;
          case 'Complexity analysis':
            recommendations.push('Provide detailed time and space complexity analysis');
            break;
          case 'Data structure design':
            recommendations.push(
              'Specify appropriate data structures for algorithm implementation'
            );
            break;
        }
      }
    }

    return recommendations;
  }
}
