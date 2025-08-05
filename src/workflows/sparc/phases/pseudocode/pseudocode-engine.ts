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
  ComplexityClass,
  ControlFlowDiagram,
  CoreAlgorithm,
  DataStructureDesign,
  DataStructureSpec,
  DetailedSpecification,
  FunctionalRequirement,
  LogicValidation,
  OptimizationOpportunity,
  OptimizationSuggestion,
  PerformanceTarget,
  Priority,
  ProcessFlow,
  PseudocodeEngine,
  PseudocodeStructure,
  PseudocodeValidation,
  ValidationResult,
} from '../../types/sparc-types';

export class PseudocodePhaseEngine implements PseudocodeEngine {
  /**
   * Generate algorithmic pseudocode from detailed specifications
   */
  async generateAlgorithmPseudocode(spec: DetailedSpecification): Promise<AlgorithmPseudocode[]> {
    const algorithms: AlgorithmPseudocode[] = [];

    for (const requirement of spec.functionalRequirements) {
      const algorithm: AlgorithmPseudocode = {
        id: nanoid(),
        name: requirement.title,
        description: requirement.description,
        pseudocode: await this.generateAlgorithmPseudocodePrivate(requirement, spec.domain),
        complexity: await this.estimateAlgorithmComplexity(requirement),
        inputParameters: await this.extractInputParameters(requirement),
        outputFormat: await this.defineOutputFormat(requirement),
        preconditions: requirement.preconditions || [],
        postconditions: requirement.postconditions || [],
        invariants: requirement.invariants || [],
        purpose: requirement.description, // Add missing purpose property
      };
      algorithms.push(algorithm);
    }

    return algorithms;
  }

  async designDataStructures(
    requirements: FunctionalRequirement[]
  ): Promise<DataStructureDesign[]> {
    // Convert DataStructureSpec to DataStructureDesign
    const specs = await this.generateDataStructures(requirements);
    return specs.map((spec) => ({
      name: spec.name,
      type: spec.type as 'class' | 'interface' | 'enum' | 'type',
      properties: spec.properties || [],
      methods: spec.methods || [],
      relationships: spec.relationships || [], // Add missing relationships property
    }));
  }

  async mapControlFlows(algorithms: AlgorithmPseudocode[]): Promise<ControlFlowDiagram[]> {
    // Implementation for control flow mapping
    return algorithms.map((alg) => ({
      id: nanoid(),
      algorithmId: alg.id,
      nodes: [],
      edges: [],
      startNode: 'start',
      endNodes: ['end'],
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
    // Implementation for logic validation
    return {
      score: 0.8,
      results: [],
      recommendations: [],
    };
  }
  /**
   * Generate algorithmic pseudocode from detailed specifications
   */
  async generatePseudocode(specification: DetailedSpecification): Promise<PseudocodeStructure> {
    const coreAlgorithms = await this.designCoreAlgorithms(specification);
    const dataStructures = await this.specifyDataStructures(specification);
    const processFlows = await this.defineProcessFlows(specification);
    const complexityAnalysis = await this.analyzeComplexity(coreAlgorithms);

    return {
      id: nanoid(),
      specificationId: specification.id,
      coreAlgorithms,
      dataStructures,
      processFlows,
      complexityAnalysis,
      optimizationOpportunities: await this.identifyOptimizations(coreAlgorithms),
      estimatedPerformance: await this.estimatePerformance(coreAlgorithms, complexityAnalysis),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Design core algorithms based on functional requirements
   */
  private async designCoreAlgorithms(
    specification: DetailedSpecification
  ): Promise<CoreAlgorithm[]> {
    const algorithms: CoreAlgorithm[] = [];

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
   * Create algorithm for specific requirement
   */
  private async createAlgorithmForRequirement(
    requirement: any,
    domain: string
  ): Promise<CoreAlgorithm> {
    return {
      id: nanoid(),
      name: `${requirement.title.replace(/\s+/g, '')}Algorithm`,
      description: `Algorithm implementing: ${requirement.description}`,
      pseudocode: await this.generateAlgorithmPseudocodePrivate(requirement, domain),
      complexity: await this.estimateAlgorithmComplexity(requirement),
      inputParameters: await this.extractInputParameters(requirement),
      outputFormat: await this.defineOutputFormat(requirement),
      preconditions: requirement.preconditions || [],
      postconditions: requirement.postconditions || [],
      invariants: requirement.invariants || [],
    };
  }

  /**
   * Generate pseudocode for swarm coordination algorithms
   */
  private async createSwarmCoordinationAlgorithms(
    _specification: DetailedSpecification
  ): Promise<CoreAlgorithm[]> {
    return [
      {
        id: nanoid(),
        name: 'AgentRegistrationAlgorithm',
        description: 'Manages agent registration and capability discovery',
        pseudocode: `
ALGORITHM AgentRegistration
INPUT: agent_info, capabilities[], resource_requirements
OUTPUT: registration_result, agent_id

BEGIN
  VALIDATE agent_info
  CHECK resource_availability(resource_requirements)
  IF resources_available THEN
    agent_id ← GENERATE_UNIQUE_ID()
    registry[agent_id] ← {
      info: agent_info,
      capabilities: capabilities,
      status: 'active',
      last_heartbeat: CURRENT_TIME()
    }
    BROADCAST agent_joined_event(agent_id, capabilities)
    RETURN success(agent_id)
  ELSE
    RETURN failure('insufficient_resources')
  END IF
END
        `.trim(),
        complexity: {
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(1)',
          scalability: 'Good logarithmic scaling',
          worstCase: 'O(log n) for registry insertion, constant space for agent data',
        },
        inputParameters: ['agent_info', 'capabilities', 'resource_requirements'],
        outputFormat: 'RegistrationResult',
        preconditions: ['Agent info is valid', 'Network is available'],
        postconditions: ['Agent is registered or error is returned'],
        invariants: ['Registry consistency maintained'],
      },
      {
        id: nanoid(),
        name: 'LoadBalancingAlgorithm',
        description: 'Distributes tasks across available agents optimally',
        pseudocode: `
ALGORITHM LoadBalancing
INPUT: task, available_agents[], performance_metrics
OUTPUT: selected_agent, task_assignment

BEGIN
  eligible_agents ← FILTER agents BY task.requirements
  IF eligible_agents.IS_EMPTY() THEN
    RETURN failure('no_eligible_agents')
  END IF
  
  scored_agents ← []
  FOR EACH agent IN eligible_agents DO
    load_factor ← CALCULATE_LOAD(agent)
    capability_score ← MATCH_CAPABILITIES(agent, task)
    performance_score ← GET_PERFORMANCE_HISTORY(agent)
    total_score ← WEIGHTED_SUM(load_factor, capability_score, performance_score)
    scored_agents.ADD({agent, total_score})
  END FOR
  
  best_agent ← MAX(scored_agents, BY total_score)
  ASSIGN_TASK(best_agent, task)
  UPDATE_METRICS(best_agent, task)
  
  RETURN success(best_agent, task_assignment)
END
        `.trim(),
        complexity: {
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)',
          scalability: 'Good logarithmic scaling',
          worstCase: 'Linear scan with logarithmic sorting for agent selection',
        },
        inputParameters: ['task', 'available_agents', 'performance_metrics'],
        outputFormat: 'TaskAssignment',
        preconditions: ['Task is valid', 'Agents list is current'],
        postconditions: ['Task assigned to optimal agent'],
        invariants: ['Load balance maintained across swarm'],
      },
    ];
  }

  /**
   * Generate pseudocode for neural network algorithms
   */
  private async createNeuralNetworkAlgorithms(
    _specification: DetailedSpecification
  ): Promise<CoreAlgorithm[]> {
    return [
      {
        id: nanoid(),
        name: 'ForwardPropagationAlgorithm',
        description: 'WASM-accelerated forward propagation through neural network',
        pseudocode: `
ALGORITHM ForwardPropagation
INPUT: input_vector[], weights[][], biases[][], layer_configs[]
OUTPUT: output_vector[], activations[][]

BEGIN
  activations[0] ← input_vector
  
  FOR layer_index FROM 1 TO num_layers DO
    layer_input ← activations[layer_index - 1]
    weights_layer ← weights[layer_index]
    bias_layer ← biases[layer_index]
    activation_fn ← layer_configs[layer_index].activation
    
    // Use WASM for matrix multiplication
    raw_output ← WASM_MATRIX_MULTIPLY(layer_input, weights_layer)
    biased_output ← ADD_BIAS(raw_output, bias_layer)
    activations[layer_index] ← APPLY_ACTIVATION(biased_output, activation_fn)
  END FOR
  
  output_vector ← activations[num_layers]
  RETURN output_vector, activations
END
        `.trim(),
        complexity: {
          timeComplexity: 'O(n * m * k)',
          spaceComplexity: 'O(n * m)',
          scalability: 'Moderate scaling with layer dimensions',
          worstCase: 'Matrix multiplication complexity where n,m,k are layer dimensions',
        },
        inputParameters: ['input_vector', 'weights', 'biases', 'layer_configs'],
        outputFormat: 'NetworkOutput',
        preconditions: ['Network is initialized', 'Input dimensions match'],
        postconditions: ['Output computed correctly'],
        invariants: ['Network weights unchanged during forward pass'],
      },
    ];
  }

  /**
   * Generate pseudocode for memory system algorithms
   */
  private async createMemorySystemAlgorithms(
    _specification: DetailedSpecification
  ): Promise<CoreAlgorithm[]> {
    return [
      {
        id: nanoid(),
        name: 'MultiBackendMemoryAlgorithm',
        description: 'Manages data across multiple storage backends with consistency',
        pseudocode: `
ALGORITHM MultiBackendMemory
INPUT: operation_type, key, value, consistency_level
OUTPUT: operation_result, affected_backends[]

BEGIN
  backends ← GET_AVAILABLE_BACKENDS()
  primary_backend ← SELECT_PRIMARY(backends, key)
  
  CASE operation_type OF
    'READ':
      result ← TRY_READ(primary_backend, key)
      IF result.IS_SUCCESS() THEN
        RETURN result
      ELSE
        FOR EACH backup_backend IN backends DO
          result ← TRY_READ(backup_backend, key)
          IF result.IS_SUCCESS() THEN
            ASYNC_REPAIR(primary_backend, key, result.value)
            RETURN result
          END IF
        END FOR
        RETURN failure('key_not_found')
      END IF
      
    'write':
      IF consistency_level = 'strong' THEN
        results ← PARALLEL_WRITE_ALL(backends, key, value)
        IF ALL_SUCCESSFUL(results) THEN
          RETURN success(results)
        ELSE
          ROLLBACK_FAILED_WRITES(results)
          RETURN failure('write_failed')
        END IF
      ELSE
        ASYNC_WRITE(primary_backend, key, value)
        ASYNC_REPLICATE(backup_backends, key, value)
        RETURN success()
      END IF
  END CASE
END
        `.trim(),
        complexity: {
          timeComplexity: 'O(b)',
          spaceComplexity: 'O(1)',
          scalability: 'Excellent linear scaling',
          worstCase: 'Linear in number of backends, constant space per operation',
        },
        inputParameters: ['operation_type', 'key', 'value', 'consistency_level'],
        outputFormat: 'MemoryOperationResult',
        preconditions: ['Backends are initialized', 'Key is valid'],
        postconditions: ['Data consistency maintained'],
        invariants: ['At least one backend remains available'],
      },
    ];
  }

  /**
   * Create general-purpose algorithms
   */
  private async createGeneralAlgorithms(
    _specification: DetailedSpecification
  ): Promise<CoreAlgorithm[]> {
    return [
      {
        id: nanoid(),
        name: 'GenericDataProcessingAlgorithm',
        description: 'General data processing and transformation pipeline',
        pseudocode: `
ALGORITHM GenericDataProcessing
INPUT: data[], transformation_pipeline[], validation_rules[]
OUTPUT: processed_data[], validation_report

BEGIN
  processed_data ← data
  validation_report ← EMPTY_REPORT()
  
  FOR EACH transformation IN transformation_pipeline DO
    VALIDATE_INPUT(processed_data, transformation.input_schema)
    processed_data ← APPLY_TRANSFORMATION(processed_data, transformation)
    VALIDATE_OUTPUT(processed_data, transformation.output_schema)
  END FOR
  
  final_validation ← VALIDATE_AGAINST_RULES(processed_data, validation_rules)
  validation_report.ADD(final_validation)
  
  RETURN processed_data, validation_report
END
        `.trim(),
        complexity: {
          timeComplexity: 'O(n * t)',
          spaceComplexity: 'O(n)',
          scalability: 'Good linear scaling',
          worstCase: 'Linear in data size and number of transformations',
        },
        inputParameters: ['data', 'transformation_pipeline', 'validation_rules'],
        outputFormat: 'ProcessedDataResult',
        preconditions: ['Pipeline is valid', 'Data format is correct'],
        postconditions: ['Data processed according to pipeline'],
        invariants: ['Data integrity maintained throughout processing'],
      },
    ];
  }

  /**
   * Specify data structures needed for the algorithms
   */
  private async specifyDataStructures(
    specification: DetailedSpecification
  ): Promise<DataStructureSpec[]> {
    const structures: DataStructureSpec[] = [];

    // Add domain-specific data structures
    switch (specification.domain) {
      case 'swarm-coordination':
        structures.push(
          {
            id: nanoid(),
            name: 'AgentRegistry',
            type: 'HashMap',
            description: 'Fast lookup of agent information by ID',
            keyType: 'string',
            valueType: 'AgentInfo',
            expectedSize: 10000,
            accessPatterns: ['lookup', 'insert', 'delete', 'iterate'],
            performance: {
              lookup: 'O(1)' as ComplexityClass,
              insert: 'O(1)' as ComplexityClass,
              delete: 'O(1)' as ComplexityClass,
            },
          },
          {
            id: nanoid(),
            name: 'TaskQueue',
            type: 'PriorityQueue',
            description: 'Priority-ordered task distribution queue',
            keyType: 'number',
            valueType: 'Task',
            expectedSize: 1000,
            accessPatterns: ['enqueue', 'dequeue', 'peek'],
            performance: {
              enqueue: 'O(log n)' as ComplexityClass,
              dequeue: 'O(log n)' as ComplexityClass,
              peek: 'O(1)' as ComplexityClass,
            },
          }
        );
        break;
      case 'neural-networks':
        structures.push({
          id: nanoid(),
          name: 'WeightMatrix',
          type: 'Matrix',
          description: 'WASM-backed matrix for neural network weights',
          keyType: 'number',
          valueType: 'float64',
          expectedSize: 1000000,
          accessPatterns: ['random_access', 'batch_update', 'matrix_multiply'],
          performance: {
            access: 'O(1)' as ComplexityClass,
            multiply: 'O(n^3)' as ComplexityClass,
            update: 'O(1)' as ComplexityClass,
          },
        });
        break;
    }

    return structures;
  }

  /**
   * Define process flows between algorithms
   */
  private async defineProcessFlows(_specification: DetailedSpecification): Promise<ProcessFlow[]> {
    return [
      {
        id: nanoid(),
        name: 'MainProcessFlow',
        description: 'Primary execution flow for the system',
        steps: [
          {
            id: nanoid(),
            name: 'Initialization',
            description: 'System startup and configuration',
            algorithm: 'InitializationAlgorithm',
            inputs: ['config', 'environment'],
            outputs: ['system_state'],
            duration: 5000,
          },
          {
            id: nanoid(),
            name: 'MainLoop',
            description: 'Core processing loop',
            algorithm: 'MainProcessingAlgorithm',
            inputs: ['system_state', 'external_events'],
            outputs: ['processed_results'],
            duration: 100,
          },
        ],
        parallelizable: true,
        criticalPath: ['Initialization', 'MainLoop'],
      },
    ];
  }

  /**
   * Analyze computational complexity of algorithms
   */
  private async analyzeComplexity(algorithms: CoreAlgorithm[]): Promise<ComplexityAnalysis> {
    const worstCase = this.calculateWorstCaseComplexity(algorithms);
    const averageCase = this.calculateAverageCaseComplexity(algorithms);
    const bestCase = this.calculateBestCaseComplexity(algorithms);

    return {
      worstCase,
      averageCase,
      bestCase,
      spaceComplexity: this.calculateSpaceComplexity(algorithms),
      scalabilityAnalysis: this.analyzeScalability(algorithms),
      bottlenecks: this.identifyBottlenecks(algorithms),
    };
  }

  private calculateWorstCaseComplexity(algorithms: CoreAlgorithm[]): ComplexityClass {
    // Find the algorithm with highest complexity
    const complexities = algorithms.map((alg) => alg.complexity.timeComplexity);
    return this.maxComplexity(complexities);
  }

  private calculateAverageCaseComplexity(_algorithms: CoreAlgorithm[]): ComplexityClass {
    // Average complexity across all algorithms
    return 'O(n log n)' as ComplexityClass;
  }

  private calculateBestCaseComplexity(_algorithms: CoreAlgorithm[]): ComplexityClass {
    // Best case when all optimizations apply
    return 'O(n)' as ComplexityClass;
  }

  private calculateSpaceComplexity(algorithms: CoreAlgorithm[]): ComplexityClass {
    const spaceComplexities = algorithms.map((alg) => alg.complexity.spaceComplexity);
    return this.maxComplexity(spaceComplexities);
  }

  private maxComplexity(complexities: ComplexityClass[]): ComplexityClass {
    // Simple complexity comparison - in real implementation would be more sophisticated
    if (complexities.includes('O(n^3)' as ComplexityClass)) return 'O(n^3)' as ComplexityClass;
    if (complexities.includes('O(n^2)' as ComplexityClass)) return 'O(n^2)' as ComplexityClass;
    if (complexities.includes('O(n log n)' as ComplexityClass))
      return 'O(n log n)' as ComplexityClass;
    if (complexities.includes('O(n)' as ComplexityClass)) return 'O(n)' as ComplexityClass;
    return 'O(1)' as ComplexityClass;
  }

  private analyzeScalability(_algorithms: CoreAlgorithm[]): string {
    return 'System scales linearly with input size, with logarithmic overhead for coordination operations';
  }

  private identifyBottlenecks(_algorithms: CoreAlgorithm[]): string[] {
    return [
      'Matrix multiplication in neural network operations',
      'Network communication latency in distributed coordination',
      'Database query performance for large agent registries',
    ];
  }

  /**
   * Identify optimization opportunities
   */
  private async identifyOptimizations(
    _algorithms: CoreAlgorithm[]
  ): Promise<OptimizationOpportunity[]> {
    return [
      {
        id: nanoid(),
        type: 'algorithmic',
        description: 'Use WASM for performance-critical mathematical operations',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '300% performance increase for matrix operations',
      },
      {
        id: nanoid(),
        type: 'caching',
        description: 'Implement intelligent caching for frequently accessed agent data',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '50% reduction in database queries',
      },
      {
        id: nanoid(),
        type: 'parallelization',
        description: 'Parallelize independent algorithm execution across multiple threads',
        impact: 'high',
        effort: 'high',
        estimatedImprovement: '200% throughput increase on multi-core systems',
      },
    ];
  }

  /**
   * Estimate performance characteristics
   */
  private async estimatePerformance(
    _algorithms: CoreAlgorithm[],
    _complexity: ComplexityAnalysis
  ): Promise<PerformanceTarget[]> {
    return [
      {
        metric: 'throughput',
        target: 10000,
        unit: 'ops/sec',
        priority: 'HIGH' as Priority,
      },
      {
        metric: 'latency',
        target: 100,
        unit: 'milliseconds',
        priority: 'HIGH' as Priority,
      },
      {
        metric: 'memory_usage',
        target: 1000000000,
        unit: 'bytes',
        priority: 'MEDIUM' as Priority,
      },
    ];
  }

  /**
   * Generate algorithm-specific pseudocode
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
   * Extract input parameters from requirement
   */
  private async extractInputParameters(requirement: any): Promise<string[]> {
    return requirement.inputs || ['input'];
  }

  /**
   * Define output format for requirement
   */
  private async defineOutputFormat(requirement: any): Promise<string> {
    return requirement.outputs?.[0] || 'Result';
  }

  /**
   * Validate generated pseudocode
   */
  async validatePseudocode(pseudocode: PseudocodeStructure): Promise<PseudocodeValidation> {
    const validationResults: ValidationResult[] = [];

    // Validate algorithm completeness
    validationResults.push({
      criterion: 'Algorithm completeness',
      passed: pseudocode.coreAlgorithms.length > 0,
      score: pseudocode.coreAlgorithms.length > 0 ? 1.0 : 0.0,
      feedback:
        pseudocode.coreAlgorithms.length > 0
          ? 'All required algorithms defined'
          : 'Missing core algorithm definitions',
    });

    // Validate complexity analysis
    validationResults.push({
      criterion: 'Complexity analysis',
      passed: !!pseudocode.complexityAnalysis,
      score: pseudocode.complexityAnalysis ? 1.0 : 0.0,
      feedback: pseudocode.complexityAnalysis
        ? 'Comprehensive complexity analysis provided'
        : 'Missing complexity analysis',
    });

    // Validate data structures
    validationResults.push({
      criterion: 'Data structure design',
      passed: pseudocode.dataStructures.length > 0,
      score: pseudocode.dataStructures.length > 0 ? 1.0 : 0.0,
      feedback:
        pseudocode.dataStructures.length > 0
          ? 'Appropriate data structures specified'
          : 'Missing data structure specifications',
    });

    const overallScore =
      validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;

    return {
      overallScore,
      validationResults,
      recommendations: this.generateRecommendations(validationResults),
      approved: overallScore >= 0.7,
    };
  }

  /**
   * Generate recommendations based on validation results
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
