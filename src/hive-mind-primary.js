/**
 * 🧠 HIVE-MIND PRIMARY SYSTEM
 * 
 * UNIFIED COORDINATION SYSTEM with:
 * ✅ Integrated Hybrid Memory (LanceDB + Kuzu + SQLite)
 * ✅ Simple direct ruv-swarm calls (no complex orchestration) 
 * ✅ Native plugin coordination
 * ✅ Optional hooks integration
 * 
 * THE HIVE-MIND IS THE MAIN INTERFACE - everything goes through it
 */

import { RuvSwarm } from '../ruv-FANN/ruv-swarm/npm/src/index.js';
import { MemoryBackendPlugin } from './plugins/memory-backend/index.js';
import { NeuralEngine } from './neural/neural-engine.js';
import { EventEmitter } from 'events';

export class HiveMindPrimary extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      // Hive-mind configuration
      enableHybridMemory: options.enableHybridMemory !== false,
      enableSimpleSwarm: options.enableSimpleSwarm !== false,
      enableHooks: options.enableHooks !== false,
      
      // Integrated hybrid memory (part of hive-mind)
      memoryPath: options.memoryPath || './.hive-mind/memory',
      
      // Simple swarm settings (minimal, direct calls only)
      swarmMode: options.swarmMode || 'simple', // 'simple' | 'disabled'
      maxAgents: options.maxAgents || 4, // Keep it simple
      
      // Plugin integration
      enablePlugins: options.enablePlugins !== false,
      
      ...options
    };
    
    // INTEGRATED COMPONENTS (all part of hive-mind)
    this.hybridMemory = null;  // LanceDB + Kuzu + SQLite integrated
    this.simpleSwarm = null;   // Direct ruv-swarm calls only
    this.neuralEngine = null;  // Neural network engine
    this.plugins = new Map();  // Connected plugins
    this.hooks = new Map();    // Optional hooks system
    
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
      
      // 3. Setup simple ruv-swarm integration (direct calls only)
      await this.setupSimpleSwarmIntegration();
      
      // 4. Connect plugins (optional)
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
        collection: 'hive_mind_memory'
      },
      
      // Kuzu for graphs (relationships)
      kuzuConfig: {
        persistDirectory: `${this.options.memoryPath}/graphs`,
        enableRelationships: true
      },
      
      // SQLite for structured data (fast queries)
      sqliteConfig: {
        dbPath: `${this.options.memoryPath}/structured.db`,
        enableWAL: true
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
    
    // Dynamic import and connection
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
        hybridOperations: ['search_and_process']
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