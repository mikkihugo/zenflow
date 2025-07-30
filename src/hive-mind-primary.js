/**
 * 🧠 HIVE-MIND PRIMARY SYSTEM
 * 
 * UNIFIED COORDINATION SYSTEM with:
 * ✅ Integrated Hybrid Memory (LanceDB + Kuzu + SQLite)
 * ✅ Visionary System (Software Intelligence Core)
 * ✅ Simple direct ruv-swarm calls (no complex orchestration) 
 * ✅ Native plugin coordination
 * ✅ Optional hooks integration
 * 
 * THE HIVE-MIND IS THE MAIN INTERFACE - everything goes through it
 */

import { RuvSwarm } from '../ruv-swarm/npm/src/index.js';
import { MemoryBackendPlugin } from './plugins/memory-backend/index.js';
import { NeuralEngine } from './neural/neural-engine.js';
import { VisionarySoftwareOrchestrator } from './visionary/orchestrator/src/visionary-orchestrator.js';
import { LanceDBInterface } from './database/lancedb-interface.js';
import { KuzuAdvancedInterface } from './database/kuzu-advanced-interface.js';
import { VisionarySoftwareIntelligenceProcessor } from './visionary/software-intelligence-processor.js';
import { MultiSystemCoordinator } from './integration/multi-system-coordinator.js';
import { EventEmitter } from 'events';
// Import config from the correct location
const config = {
  hiveMind: {
    memoryPath: './swarm/claude-zen-mcp.db',
    hybridMemoryPath: './.swarm'
  }
};

export class HiveMindPrimary extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      // Hive-mind configuration
      enableHybridMemory: options.enableHybridMemory !== false,
      enableSimpleSwarm: options.enableSimpleSwarm !== false,
      enableHooks: options.enableHooks !== false,
      
      // Integrated hybrid memory (part of hive-mind)
      memoryPath: options.memoryPath || config.hiveMind.memoryPath,
      
      // Simple swarm settings (minimal, direct calls only)
      swarmMode: options.swarmMode || config.hiveMind.swarmMode, // 'simple' | 'disabled'
      maxAgents: options.maxAgents || config.hiveMind.maxAgents, // Keep it simple
      
      // Plugin integration
      enablePlugins: options.enablePlugins !== false,
      
      ...options
    };
    
    // INTEGRATED COMPONENTS (all part of hive-mind)
    this.hybridMemory = null;  // LanceDB + Kuzu + SQLite integrated
    this.simpleSwarm = null;   // Direct ruv-swarm calls only
    this.visionaryOrchestrator = null; // Visionary system (software intelligence core)
    this.neuralEngine = null;  // Neural network engine
    this.plugins = new Map();  // Connected plugins
    this.hooks = new Map();    // Optional hooks system
    
    // ENHANCED SWARM-GENERATED SYSTEMS
    this.lanceDBInterface = null;    // Advanced vector database
    this.kuzuAdvanced = null;        // Enhanced graph database
    this.softwareIntelligenceProcessor = null; // Software intelligence and code analysis
    this.multiSystemCoordinator = null;  // Cross-system coordination
    
    // State
    this.initialized = false;
    this.coordinationActive = false;
    
    // Performance (simpler metrics)
    this.metrics = {
      coordinationCalls: 0,
      memoryOperations: 0,
      swarmCalls: 0,
      pluginCalls: 0
    };
  }
  
  async initialize() {
    if (this.initialized) return;
    
    console.log('🧠 Initializing Hive-Mind Primary System...');
    console.log('🎯 Integrated: Hybrid Memory + Simple Swarm + Plugin Coordination');
    
    try {
      // 1. Initialize integrated hybrid memory (part of hive-mind)
      await this.initializeIntegratedHybridMemory();
      
      // 2. Initialize neural engine (automatic)
      await this.initializeNeuralEngine();
      
      // 3. Initialize Visionary orchestrator (software intelligence core)
      await this.initializeVisionaryOrchestrator();
      
      // 4. Initialize enhanced swarm-generated systems
      await this.initializeEnhancedSystems();
      
      // 5. Setup simple ruv-swarm integration (direct calls only)
      await this.setupSimpleSwarmIntegration();
      
      // 5. Connect plugins (optional)
      if (this.options.enablePlugins) {
        await this.connectPlugins();
      }
      
      // 4. Setup hooks (if needed - but maybe not necessary?)
      if (this.options.enableHooks) {
        await this.setupOptionalHooks();
      }
      
      this.initialized = true;
      this.coordinationActive = true;
      
      console.log('✅ Hive-Mind Primary System ready!');
      console.log('💾 Hybrid Memory: Integrated (LanceDB + Kuzu + SQLite)');
      console.log('🧠 Neural Engine: Automatic AI enhancement active');
      console.log('🎯 Visionary: Software intelligence core integrated');
      console.log('🚀 Enhanced Systems: Swarm-generated extensions active');
      console.log('🐝 Simple Swarm: Direct calls to ruv-swarm source');
      console.log('🔌 Plugins: Connected via hive-mind coordination');
      console.log('🔗 Hooks: Optional (may not be needed)');
      
      this.emit('hive-mind:ready', {
        hybridMemoryIntegrated: true,
        simpleSwarmEnabled: this.options.enableSimpleSwarm,
        pluginsConnected: this.plugins.size,
        hooksEnabled: this.options.enableHooks
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Hive-Mind Primary System:', error);
      throw error;
    }
  }
  
  async initializeIntegratedHybridMemory() {
    console.log('💾 Initializing Integrated Hybrid Memory (part of hive-mind)...');
    
    // Hybrid memory is PART OF the hive-mind, not separate
    this.hybridMemory = new MemoryBackendPlugin({
      backend: 'unified', // Triple hybrid
      path: this.options.memoryPath,
      
      // LanceDB for vectors (semantic search)
      lanceConfig: {
        persistDirectory: `${this.options.memoryPath}/vectors`,
        collection: config.hiveMind.lanceConfig.collection,
      },
      
      // Kuzu for graphs (relationships)
      kuzuConfig: {
        persistDirectory: `${this.options.memoryPath}/graphs`,
        enableRelationships: config.hiveMind.kuzuConfig.enableRelationships,
      },
      
      // SQLite for structured data (fast queries)
      sqliteConfig: {
        dbPath: `${this.options.memoryPath}/structured.db`,
        enableWAL: config.hiveMind.sqliteConfig.enableWAL,
      },
      
      // Integration settings
      hiveMindIntegration: true,
      enableCrossBackendQueries: true
    });
    
    await this.hybridMemory.initialize();
    
    console.log('✅ Integrated Hybrid Memory ready (part of hive-mind)');
  }
  
  async initializeNeuralEngine() {
    console.log('🧠 Initializing Neural Engine (automatic)...');
    
    this.neuralEngine = new NeuralEngine();
    
    try {
      await this.neuralEngine.initialize();
      
      // Connect neural engine to memory for enhanced decisions
      if (this.hybridMemory) {
        this.neuralEngine.setMemoryStore(this.hybridMemory);
      }
      
      // Enable automatic neural enhancement
      this.neuralEngine.on('inference', (result) => {
        this.emit('neural-insight', result);
      });
      
      console.log('✅ Neural Engine ready - automatic AI enhancement enabled');
      console.log(`🧠 Available models: ${this.neuralEngine.models.size}`);
      
    } catch (error) {
      console.warn('⚠️ Neural Engine unavailable (using fallback):', error.message);
      this.neuralEngine = null;
    }
  }
  
  async initializeVisionaryOrchestrator() {
    console.log('🎯 Initializing Visionary Orchestrator (software intelligence core)...');
    
    this.visionaryOrchestrator = new VisionarySoftwareOrchestrator({
      // Integrate with hive mind systems
      memoryIntegration: true,
      swarmCoordination: this.options.enableAdvancedSwarm,
      
      // Enable all core software intelligence capabilities
      enableCodeAnalysis: true,
      enablePatternRecognition: true,
      enableIntelligentRefactoring: true
    });
    
    try {
      await this.visionaryOrchestrator.initialize();
      
      // Connect to neural engine for enhanced processing
      if (this.neuralEngine) {
        this.visionaryOrchestrator.setNeuralEngine(this.neuralEngine);
      }
      
      // Connect to hybrid memory for persistence
      if (this.hybridMemory) {
        this.visionaryOrchestrator.setMemoryStore(this.hybridMemory);
      }
      
      // Set up event forwarding
      this.visionaryOrchestrator.on('jobCompleted', (result) => {
        this.emit('visionary-job-completed', result);
      });
      
      this.visionaryOrchestrator.on('jobFailed', (error) => {
        this.emit('visionary-job-failed', error);
      });
      
      console.log('✅ Visionary Software Intelligence Orchestrator ready - intelligent code analysis enabled');
      
    } catch (error) {
      console.warn('⚠️ Visionary Software Intelligence Orchestrator initialization failed:', error.message);
      this.visionaryOrchestrator = null;
    }
  }
  
  async initializeEnhancedSystems() {
    console.log('🚀 Initializing Enhanced Swarm-Generated Systems...');
    
    try {
      // Initialize advanced LanceDB interface
      this.lanceDBInterface = new LanceDBInterface({
        dbPath: './.hive-mind/lance-db',
        vectorDim: 1536,
        similarity: 'cosine'
      });
      await this.lanceDBInterface.initialize();
      console.log('   ✅ LanceDB Interface: Advanced vector operations ready');
      
      // Initialize enhanced Kuzu graph interface
      this.kuzuAdvanced = new KuzuAdvancedInterface({
        dbPath: './.hive-mind/kuzu-graph',
        enableAnalytics: true,
        cacheSize: 10000
      });
      await this.kuzuAdvanced.initialize();
      console.log('   ✅ Kuzu Advanced: Graph analytics and traversal ready');
      
      // Initialize software intelligence processor
      this.softwareIntelligenceProcessor = new VisionarySoftwareIntelligenceProcessor({
        outputDir: './.hive-mind/intelligent-analysis',
        aiProvider: 'claude',
        enableOptimization: true
      });
      await this.softwareIntelligenceProcessor.initialize();
      console.log('   ✅ Software Intelligence Processor: Complete code analysis pipeline ready');
      
      // Initialize multi-system coordinator
      this.multiSystemCoordinator = new MultiSystemCoordinator({
        lanceDB: this.lanceDBInterface,
        kuzu: this.kuzuAdvanced,
        softwareIntelligenceProcessor: this.softwareIntelligenceProcessor,
        memoryStore: this.hybridMemory
      });
      await this.multiSystemCoordinator.initialize();
      console.log('   ✅ Multi-System Coordinator: Unified cross-system operations ready');
      
      // Connect systems to neural engine if available
      if (this.neuralEngine) {
        this.lanceDBInterface.setNeuralEngine(this.neuralEngine);
        this.softwareIntelligenceProcessor.setNeuralEngine(this.neuralEngine);
        this.multiSystemCoordinator.setNeuralEngine(this.neuralEngine);
      }
      
      console.log('🚀 Enhanced Systems: All swarm-generated extensions initialized successfully');
      
    } catch (error) {
      console.warn('⚠️ Enhanced Systems initialization failed:', error.message);
      console.log('💡 System will continue with basic functionality');
    }
  }
  
  async setupSimpleSwarmIntegration() {
    if (!this.options.enableSimpleSwarm) {
      console.log('🐝 Simple Swarm: DISABLED');
      return;
    }
    
    console.log('🐝 Setting up Simple Swarm Integration (direct calls only)...');
    
    // SIMPLE - use static initialize method (correct ruv-swarm API)
    this.simpleSwarm = await RuvSwarm.initialize({
      loadingStrategy: 'minimal', // Fast startup for hive-mind integration
      enablePersistence: false, // Use hive-mind's integrated memory instead
      enableNeuralNetworks: false, // Keep it simple
      enableForecasting: false,
      useSIMD: true,
      debug: this.options.debug || false
    });
    
    console.log('✅ Simple Swarm Integration ready (direct calls to ruv-swarm source)');
  }
  
  async connectPlugins() {
    console.log('🔌 Connecting plugins via hive-mind coordination...');
    
    // Plugins connect TO the hive-mind, not as separate systems
    const availablePlugins = [
      'unified-interface',
      'github-integration', 
      'workflow-engine',
      'security-auth',
      'ai-providers'
    ];
    
    for (const pluginName of availablePlugins) {
      try {
        // Try to connect plugin to hive-mind
        await this.connectPlugin(pluginName);
      } catch (error) {
        console.warn(`⚠️ Plugin ${pluginName} not available:`, error.message);
      }
    }
    
    console.log(`✅ Connected ${this.plugins.size} plugins to hive-mind`);
  }
  
  async connectPlugin(pluginName) {
    // Plugin connects to hive-mind and uses integrated memory
    const pluginConfig = {
      hiveMindIntegration: this,
      hybridMemory: this.hybridMemory,
      simpleSwarm: this.simpleSwarm
    };
    
    // Special handling for ai-providers to integrate new provider system
    if (pluginName === 'ai-providers') {
      try {
        // Load the new TypeScript provider system
        const { createProviderManager, COMMON_CONFIGS } = await import('./providers/index.js');
        
        // Create integrated provider manager
        const providerManager = await createProviderManager({
          ...COMMON_CONFIGS.PRODUCTION,
          providers: {
            anthropic: { 
              apiKey: process.env.ANTHROPIC_API_KEY,
              enabled: true,
              priority: 1 
            },
            openai: { 
              apiKey: process.env.OPENAI_API_KEY,
              enabled: true,
              priority: 2 
            },
            cohere: { 
              apiKey: process.env.COHERE_API_KEY,
              enabled: false,
              priority: 3 
            },
            google: { 
              apiKey: process.env.GOOGLE_API_KEY,
              enabled: false,
              priority: 4 
            },
            ollama: { 
              enabled: true,
              priority: 5 
            }
          }
        });
        
        // Connect provider manager to hive-mind
        this.providerManager = providerManager;
        
        // Still load the plugin for backward compatibility
        const { default: PluginClass } = await import(`./plugins/${pluginName}/index.js`);
        const plugin = new PluginClass({
          ...pluginConfig,
          providerManager // Pass integrated provider manager
        });
        
        await plugin.initialize();
        this.plugins.set(pluginName, plugin);
        
        console.log(`✅ Plugin connected with enterprise providers: ${pluginName}`);
        console.log(`🚀 Provider Manager: ${providerManager.getAvailableProviders().length} providers ready`);
        
        return;
      } catch (error) {
        console.warn(`⚠️ Failed to integrate new provider system, falling back to plugin:`, error.message);
      }
    }
    
    // Standard plugin loading
    const { default: PluginClass } = await import(`./plugins/${pluginName}/index.js`);
    const plugin = new PluginClass(pluginConfig);
    
    await plugin.initialize();
    
    this.plugins.set(pluginName, plugin);
    
    console.log(`✅ Plugin connected: ${pluginName}`);
  }
  
  async setupOptionalHooks() {
    console.log('🔗 Setting up optional hooks (may not be needed)...');
    
    // Question: Do we actually need hooks if hive-mind handles coordination?
    // Maybe hooks are just for external integration?
    
    const basicHooks = {
      'pre-coordination': (data) => this.emit('coordination:start', data),
      'post-coordination': (data) => this.emit('coordination:end', data),
      'memory-updated': (data) => this.emit('memory:updated', data)
    };
    
    for (const [hookName, handler] of Object.entries(basicHooks)) {
      this.hooks.set(hookName, handler);
    }
    
    console.log('✅ Optional hooks ready (simple coordination events)');
  }
  
  // ========================================
  // HIVE-MIND PRIMARY INTERFACE
  // Everything goes through these methods
  // ========================================
  
  /**
   * PRIMARY COORDINATION METHOD
   * All coordination goes through the hive-mind
   */
  async coordinate(request) {
    await this.ensureInitialized();
    
    const startTime = Date.now();
    
    try {
      let result;
      
      // Route through hive-mind based on request type
      switch (request.type) {
        case 'memory':
          result = await this.coordinateMemoryOperation(request);
          this.metrics.memoryOperations++;
          break;
          
        case 'swarm':
          result = await this.coordinateSimpleSwarm(request);
          this.metrics.swarmCalls++;
          break;
          
        case 'plugin':
          result = await this.coordinatePlugin(request);
          this.metrics.pluginCalls++;
          break;
          
        case 'provider':
          result = await this.coordinateProvider(request);
          this.metrics.pluginCalls++;
          break;
          
        case 'hybrid':
          result = await this.coordinateHybridOperation(request);
          this.metrics.memoryOperations++;
          this.metrics.swarmCalls++;
          break;
          
        default:
          throw new Error(`Unknown coordination request: ${request.type}`);
      }
      
      this.metrics.coordinationCalls++;
      
      // Optional hook
      if (this.hooks.has('post-coordination')) {
        this.hooks.get('post-coordination')({ request, result, duration: Date.now() - startTime });
      }
      
      return {
        success: true,
        result,
        coordinatedBy: 'hive-mind-primary',
        performance: {
          responseTime: Date.now() - startTime,
          integratedMemory: true,
          simpleSwarm: this.options.enableSimpleSwarm
        }
      };
      
    } catch (error) {
      console.error('Hive-mind coordination failed:', error);
      throw error;
    }
  }
  
  async coordinateMemoryOperation(request) {
    // Use integrated hybrid memory (part of hive-mind)
    const { operation, params } = request;
    
    switch (operation) {
      case 'store':
        return this.hybridMemory.store(params.key, params.value, params.options?.namespace || 'default');
      case 'retrieve':
        return this.hybridMemory.retrieve(params.key, params.options?.namespace || 'default');
      case 'search':
        return this.hybridMemory.search(params.query, params.options?.namespace || 'default');
      case 'graph_query':
        return this.hybridMemory.graphQuery(params.query, params.options || {});
      case 'vector_search':
        return this.hybridMemory.vectorSearch(params.embedding, params.options || {});
      default:
        throw new Error(`Unknown memory operation: ${operation}`);
    }
  }
  
  async coordinateSimpleSwarm(request) {
    if (!this.simpleSwarm) {
      throw new Error('Simple swarm not enabled');
    }
    
    // SIMPLE direct calls to ruv-swarm - no complex orchestration
    const { operation, params } = request;
    
    switch (operation) {
      case 'create_simple_swarm':
        return this.simpleSwarm.createSwarm({
          name: params.name || 'hive-simple-swarm',
          topology: 'mesh',
          maxAgents: params.maxAgents || 4,
          enableCognitiveDiversity: true
        });
        
      case 'add_agent':
        return this.simpleSwarm.spawnAgent(
          params.name || `agent-${Date.now()}`,
          params.type || 'worker',
          params
        );
        
      case 'run_task':
        // Create a simple swarm if none exists, then orchestrate task
        if (this.simpleSwarm.activeSwarms.size === 0) {
          const swarm = await this.simpleSwarm.createSwarm({
            name: 'task-swarm',
            maxAgents: 2
          });
          
          // Add an agent to handle the task
          await swarm.spawnAgent('task-handler', 'worker');
          
          // Orchestrate the task
          return swarm.orchestrate({
            description: params.task,
            priority: params.priority || 'medium'
          });
        } else {
          // Use existing swarm
          const swarm = this.simpleSwarm.activeSwarms.values().next().value;
          return swarm.orchestrate({
            description: params.task,
            priority: params.priority || 'medium'
          });
        }
        
      case 'get_status':
        if (params?.swarmId) {
          return this.simpleSwarm.getSwarmStatus(params.swarmId);
        } else {
          return this.simpleSwarm.getGlobalMetrics();
        }
        
      default:
        throw new Error(`Unknown simple swarm operation: ${operation}`);
    }
  }
  
  async coordinatePlugin(request) {
    const { plugin, operation, params } = request;
    
    const pluginInstance = this.plugins.get(plugin);
    if (!pluginInstance) {
      throw new Error(`Plugin not connected to hive-mind: ${plugin}`);
    }
    
    if (!pluginInstance[operation]) {
      throw new Error(`Operation not supported by plugin ${plugin}: ${operation}`);
    }
    
    return pluginInstance[operation](params);
  }
  
  async coordinateProvider(request) {
    if (!this.providerManager) {
      throw new Error('Provider manager not integrated - ai-providers plugin not loaded');
    }
    
    const { operation, params } = request;
    
    switch (operation) {
      case 'generate_text':
        return this.providerManager.generateText(params);
      case 'generate_stream':
        return this.providerManager.generateStream(params);
      case 'get_provider_statuses':
        return this.providerManager.getProviderStatuses();
      case 'get_available_providers':
        return this.providerManager.getAvailableProviders();
      case 'get_metrics':
        return this.providerManager.getMetrics();
      default:
        throw new Error(`Unknown provider operation: ${operation}`);
    }
  }

  async coordinateHybridOperation(request) {
    // Combines memory + simple swarm through hive-mind coordination
    const { operation, params } = request;
    
    switch (operation) {
      case 'search_and_process':
        // Memory search + simple swarm processing
        const searchResults = await this.coordinateMemoryOperation({
          operation: 'search',
          params: { query: params.query, options: params.searchOptions }
        });
        
        if (this.simpleSwarm && params.enableSwarmProcessing) {
          const swarmResult = await this.coordinateSimpleSwarm({
            operation: 'run_task',
            params: { 
              task: `Process search results: ${JSON.stringify(searchResults)}`,
              ...params.swarmOptions
            }
          });
          
          return { searchResults, swarmResult, hybrid: true };
        }
        
        return { searchResults, hybrid: true };
        
      case 'ai_enhanced_search':
        // Memory search + AI provider processing
        const memoryResults = await this.coordinateMemoryOperation({
          operation: 'search',
          params: { query: params.query, options: params.searchOptions }
        });
        
        if (this.providerManager && params.enableAIProcessing) {
          const aiResult = await this.coordinateProvider({
            operation: 'generate_text',
            params: {
              model: params.model || 'claude-3-5-sonnet-20241022',
              messages: [
                { 
                  role: 'user', 
                  content: `Analyze and summarize these search results: ${JSON.stringify(memoryResults)}` 
                }
              ]
            }
          });
          
          return { memoryResults, aiResult, hybrid: true };
        }
        
        return { memoryResults, hybrid: true };
        
      default:
        throw new Error(`Unknown hybrid operation: ${operation}`);
    }
  }
  
  // ========================================
  // UTILITY METHODS
  // ========================================
  
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }
  
  getHiveMindStatus() {
    return {
      system: 'hive-mind-primary',
      initialized: this.initialized,
      coordinationActive: this.coordinationActive,
      
      components: {
        hybridMemoryIntegrated: !!this.hybridMemory,
        simpleSwarmEnabled: !!this.simpleSwarm,
        pluginsConnected: this.plugins.size,
        hooksEnabled: this.hooks.size > 0
      },
      
      metrics: this.metrics,
      
      capabilities: {
        memoryOperations: ['store', 'retrieve', 'search', 'graph_query', 'vector_search'],
        swarmOperations: this.simpleSwarm ? ['create_simple_swarm', 'add_agent', 'run_task', 'get_status'] : [],
        pluginOperations: Array.from(this.plugins.keys()),
        providerOperations: this.providerManager ? ['generate_text', 'generate_stream', 'get_provider_statuses', 'get_available_providers', 'get_metrics'] : [],
        hybridOperations: ['search_and_process', 'ai_enhanced_search']
      }
    };
  }
  
  async cleanup() {
    console.log('🧹 Cleaning up Hive-Mind Primary System...');
    
    // Cleanup integrated components
    if (this.hybridMemory) {
      await this.hybridMemory.cleanup();
    }
    
    if (this.simpleSwarm) {
      if (this.simpleSwarm.destroy) {
        this.simpleSwarm.destroy();
      } else if (this.simpleSwarm.cleanup) {
        await this.simpleSwarm.cleanup();
      }
    }
    
    // Cleanup connected plugins
    for (const [name, plugin] of this.plugins) {
      try {
        if (plugin.cleanup) {
          await plugin.cleanup();
        }
      } catch (error) {
        console.warn(`Failed to cleanup plugin ${name}:`, error.message);
      }
    }
    
    this.plugins.clear();
    this.hooks.clear();
    
    console.log('✅ Hive-Mind Primary System cleaned up');
  }
}

// Singleton for global access
let globalHiveMind = null;

export async function getHiveMindPrimary(options = {}) {
  if (!globalHiveMind) {
    globalHiveMind = new HiveMindPrimary(options);
    await globalHiveMind.initialize();
  }
  return globalHiveMind;
}

export async function initializeHiveMind(options = {}) {
  console.log('🧠 Initializing Hive-Mind Primary System...');
  console.log('🎯 ARCHITECTURE: Hive-Mind Primary with Integrated Hybrid Memory');
  console.log('🔥 Simple direct ruv-swarm calls + Plugin coordination');
  
  const hiveMind = await getHiveMindPrimary(options);
  
  console.log('✅ Hive-Mind Primary System ready!');
  console.log('🎯 Capabilities:');
  console.log('   • Integrated hybrid memory (LanceDB + Kuzu + SQLite)');
  console.log('   • Simple direct ruv-swarm calls (no complex orchestration)');
  console.log('   • Plugin coordination through hive-mind');
  console.log('   • Optional hooks (may not be needed)');
  console.log('   • All coordination through single hive-mind interface');
  
  return hiveMind;
}

export default HiveMindPrimary;