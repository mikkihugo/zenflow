/**
 * WASM Memory Optimizer
 *
 * Advanced memory management and allocation optimization for WASM modules
 * with progressive loading, memory pooling, and garbage collection strategies.
 */

/**
 * Memory allocation information
 */
export interface MemoryAllocation {
  id: number;
  moduleId: string;
  offset: number;
  size: number;
  timestamp: number;
}

/**
 * Memory pool for a specific WASM module
 */
export interface MemoryPool {
  memory: WebAssembly.Memory;
  allocated: number;
  maxSize: number;
  freeBlocks: MemoryBlock[];
  allocations: Map<number, MemoryAllocation>;
}

/**
 * Free memory block
 */
export interface MemoryBlock {
  offset: number;
  size: number;
}

/**
 * Memory allocation result
 */
export interface AllocationResult {
  id: number;
  offset: number;
  ptr: ArrayBuffer;
}

/**
 * WASM module configuration
 */
export interface WasmModuleConfig {
  id: string;
  url: string;
  size: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  features: string[];
  preload: boolean;
}

/**
 * WASM module information
 */
export interface WasmModule {
  id: string;
  url: string;
  size: number;
  priority: string;
  dependencies: string[];
  features: string[];
  preload: boolean;
  loaded: boolean;
  loading: boolean;
  instance: WasmModuleInstance | null;
  memoryAllocations: Set<number>;
}

/**
 * WASM module instance
 */
export interface WasmModuleInstance {
  module: WebAssembly.Module;
  instance: WebAssembly.Instance;
  exports: WebAssembly.Exports;
  memory: AllocationResult;
  loadTime: number;
}

/**
 * Loader statistics
 */
export interface LoaderStats {
  totalModules: number;
  loadedModules: number;
  loadingModules: number;
  memoryStats: MemoryStats;
  loadTimes: Array<{ id: string; loadTime: number }>;
  averageLoadTime: number;
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  totalAllocated: number;
  maxMemory: number;
  globalUtilization: number;
  pools: Record<string, PoolStats>;
  allocationCount: number;
}

/**
 * Pool statistics
 */
export interface PoolStats {
  allocated: number;
  bufferSize: number;
  freeBlocks: number;
  activeAllocations: number;
  utilization: number;
}

/**
 * Browser WASM capabilities
 */
export interface WasmCapabilities {
  webassembly: boolean;
  simd: boolean;
  threads: boolean;
  exceptions: boolean;
  memory64: boolean;
  streaming: boolean;
}

/**
 * WASM Memory Pool - High-performance memory management for WASM modules
 */
export class WasmMemoryPool {
  private pools = new Map<string, MemoryPool>();
  private allocations = new Map<number, MemoryAllocation>();
  private totalAllocated = 0;
  private readonly maxMemory: number;
  private readonly initialSize: number;
  private allocationCounter = 0;
  private readonly gcThreshold: number;
  private readonly compressionEnabled: boolean;

  constructor(initialSize: number = 16 * 1024 * 1024) { // 16MB initial
    this.initialSize = initialSize;
    this.maxMemory = 512 * 1024 * 1024; // 512MB max
    this.gcThreshold = 0.8; // GC when 80% full
    this.compressionEnabled = true;
  }

  /**
   * Get or create memory pool for specific module
   */
  getPool(moduleId: string, requiredSize: number = this.initialSize): MemoryPool {
    if (!this.pools.has(moduleId)) {
      const poolSize = Math.max(requiredSize, this.initialSize);
      const memory = new WebAssembly.Memory({
        initial: Math.ceil(poolSize / (64 * 1024)), // Pages are 64KB
        maximum: Math.ceil(this.maxMemory / (64 * 1024)),
        shared: false,
      });

      this.pools.set(moduleId, {
        memory,
        allocated: 0,
        maxSize: poolSize,
        freeBlocks: [],
        allocations: new Map(),
      });

      console.log(`🧠 Created memory pool for ${moduleId}: ${poolSize / 1024 / 1024}MB`);
    }

    return this.pools.get(moduleId)!;
  }

  /**
   * Allocate memory with alignment and tracking
   */
  allocate(moduleId: string, size: number, alignment: number = 16): AllocationResult {
    const pool = this.getPool(moduleId, size * 2);
    const alignedSize = Math.ceil(size / alignment) * alignment;

    // Try to reuse free blocks first
    const freeBlock = this.findFreeBlock(pool, alignedSize);
    if (freeBlock) {
      this.allocationCounter++;
      const allocation: MemoryAllocation = {
        id: this.allocationCounter,
        moduleId,
        offset: freeBlock.offset,
        size: alignedSize,
        timestamp: Date.now(),
      };

      pool.allocations.set(allocation.id, allocation);
      this.allocations.set(allocation.id, allocation);

      return {
        id: allocation.id,
        offset: freeBlock.offset,
        ptr: pool.memory.buffer.slice(freeBlock.offset, freeBlock.offset + alignedSize),
      };
    }

    // Allocate new memory
    const currentSize = pool.memory.buffer.byteLength;
    const newOffset = pool.allocated;

    if (newOffset + alignedSize > currentSize) {
      // Need to grow memory
      const requiredPages = Math.ceil((newOffset + alignedSize - currentSize) / (64 * 1024));
      try {
        pool.memory.grow(requiredPages);
        console.log(`📈 Grew memory for ${moduleId} by ${requiredPages} pages`);
      } catch (error) {
        console.error(`❌ Failed to grow memory for ${moduleId}:`, error);
        // Try garbage collection
        this.garbageCollect(moduleId);
        return this.allocate(moduleId, size, alignment); // Retry after GC
      }
    }

    this.allocationCounter++;
    const allocation: MemoryAllocation = {
      id: this.allocationCounter,
      moduleId,
      offset: newOffset,
      size: alignedSize,
      timestamp: Date.now(),
    };

    pool.allocated = newOffset + alignedSize;
    pool.allocations.set(allocation.id, allocation);
    this.allocations.set(allocation.id, allocation);
    this.totalAllocated += alignedSize;

    // Check if GC is needed
    if (this.getMemoryUtilization() > this.gcThreshold) {
      setTimeout(() => this.garbageCollectAll(), 100);
    }

    return {
      id: allocation.id,
      offset: newOffset,
      ptr: pool.memory.buffer.slice(newOffset, newOffset + alignedSize),
    };
  }

  /**
   * Find suitable free block
   */
  private findFreeBlock(pool: MemoryPool, size: number): MemoryBlock | null {
    for (let i = 0; i < pool.freeBlocks.length; i++) {
      const block = pool.freeBlocks[i];
      if (block.size >= size) {
        // Remove from free blocks or split if larger
        if (block.size > size + 64) {
          // Worth splitting
          const remaining: MemoryBlock = {
            offset: block.offset + size,
            size: block.size - size,
          };
          pool.freeBlocks[i] = remaining;
        } else {
          pool.freeBlocks.splice(i, 1);
        }

        return {
          offset: block.offset,
          size: block.size,
        };
      }
    }
    return null;
  }

  /**
   * Deallocate memory and add to free blocks
   */
  deallocate(allocationId: number): boolean {
    const allocation = this.allocations.get(allocationId);
    if (!allocation) {
      console.warn(`⚠️ Allocation ${allocationId} not found`);
      return false;
    }

    const pool = this.pools.get(allocation.moduleId);
    if (!pool) {
      console.warn(`⚠️ Pool for ${allocation.moduleId} not found`);
      return false;
    }

    // Add to free blocks
    pool.freeBlocks.push({
      offset: allocation.offset,
      size: allocation.size,
    });

    // Merge adjacent free blocks
    this.mergeFreeBlocks(pool);

    // Remove from allocations
    pool.allocations.delete(allocationId);
    this.allocations.delete(allocationId);
    this.totalAllocated -= allocation.size;

    console.log(`🗑️ Deallocated ${allocation.size} bytes for ${allocation.moduleId}`);
    return true;
  }

  /**
   * Merge adjacent free blocks to reduce fragmentation
   */
  private mergeFreeBlocks(pool: MemoryPool): void {
    pool.freeBlocks.sort((a, b) => a.offset - b.offset);

    for (let i = 0; i < pool.freeBlocks.length - 1; i++) {
      const current = pool.freeBlocks[i];
      const next = pool.freeBlocks[i + 1];

      if (current.offset + current.size === next.offset) {
        // Merge blocks
        current.size += next.size;
        pool.freeBlocks.splice(i + 1, 1);
        i--; // Check again with merged block
      }
    }
  }

  /**
   * Garbage collect unused allocations
   */
  garbageCollect(moduleId: string): void {
    const pool = this.pools.get(moduleId);
    if (!pool) {
      return;
    }

    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    const freedAllocations: number[] = [];

    for (const [id, allocation] of pool.allocations) {
      if (now - allocation.timestamp > maxAge) {
        freedAllocations.push(id);
      }
    }

    for (const id of freedAllocations) {
      this.deallocate(id);
    }

    console.log(`🧹 GC for ${moduleId}: freed ${freedAllocations.length} allocations`);
  }

  /**
   * Garbage collect all pools
   */
  garbageCollectAll(): void {
    for (const moduleId of this.pools.keys()) {
      this.garbageCollect(moduleId);
    }
  }

  /**
   * Get memory utilization ratio
   */
  getMemoryUtilization(): number {
    return this.totalAllocated / this.maxMemory;
  }

  /**
   * Get detailed memory statistics
   */
  getMemoryStats(): MemoryStats {
    const poolStats: Record<string, PoolStats> = {};

    for (const [moduleId, pool] of this.pools) {
      poolStats[moduleId] = {
        allocated: pool.allocated,
        bufferSize: pool.memory.buffer.byteLength,
        freeBlocks: pool.freeBlocks.length,
        activeAllocations: pool.allocations.size,
        utilization: pool.allocated / pool.memory.buffer.byteLength,
      };
    }

    return {
      totalAllocated: this.totalAllocated,
      maxMemory: this.maxMemory,
      globalUtilization: this.getMemoryUtilization(),
      pools: poolStats,
      allocationCount: this.allocationCounter,
    };
  }

  /**
   * Optimize memory layout by compacting allocations
   */
  compactMemory(moduleId: string): void {
    const pool = this.pools.get(moduleId);
    if (!pool) {
      return;
    }

    // Sort allocations by offset
    const allocations = Array.from(pool.allocations.values()).sort((a, b) => a.offset - b.offset);

    let newOffset = 0;
    const moves: Array<{ from: number; to: number; size: number }> = [];

    for (const allocation of allocations) {
      if (allocation.offset !== newOffset) {
        moves.push({
          from: allocation.offset,
          to: newOffset,
          size: allocation.size,
        });
        allocation.offset = newOffset;
      }
      newOffset += allocation.size;
    }

    // Perform memory moves
    const buffer = new Uint8Array(pool.memory.buffer);
    for (const move of moves) {
      const src = buffer.subarray(move.from, move.from + move.size);
      buffer.set(src, move.to);
    }

    // Update pool state
    pool.allocated = newOffset;
    pool.freeBlocks =
      newOffset < pool.memory.buffer.byteLength
        ? [{ offset: newOffset, size: pool.memory.buffer.byteLength - newOffset }]
        : [];

    console.log(
      `🗜️ Compacted ${moduleId}: ${moves.length} moves, freed ${pool.memory.buffer.byteLength - newOffset} bytes`
    );
  }
}

/**
 * Progressive WASM Module Loader with Memory Optimization
 */
export class ProgressiveWasmLoader {
  private memoryPool: WasmMemoryPool;
  private loadedModules = new Map<string, WasmModule>();
  private loadingQueues = new Map<string, string[]>();
  private readonly priorityLevels = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  constructor() {
    this.memoryPool = new WasmMemoryPool();
  }

  /**
   * Register module for progressive loading
   */
  registerModule(config: WasmModuleConfig): void {
    const module: WasmModule = {
      ...config,
      loaded: false,
      loading: false,
      instance: null,
      memoryAllocations: new Set(),
    };

    this.loadedModules.set(config.id, module);

    if (config.preload) {
      this.queueLoad(config.id, 'critical');
    }

    console.log(`📋 Registered WASM module: ${config.id} (${config.size / 1024}KB, ${config.priority} priority)`);
  }

  /**
   * Queue module for loading with priority
   */
  queueLoad(moduleId: string, priority: string = 'medium'): void {
    if (!this.loadingQueues.has(priority)) {
      this.loadingQueues.set(priority, []);
    }

    const queue = this.loadingQueues.get(priority)!;
    if (!queue.includes(moduleId)) {
      queue.push(moduleId);
      this.processLoadingQueue();
    }
  }

  /**
   * Process loading queue by priority
   */
  private async processLoadingQueue(): Promise<void> {
    for (const priority of Object.keys(this.priorityLevels).sort(
      (a, b) => this.priorityLevels[a as keyof typeof this.priorityLevels] - this.priorityLevels[b as keyof typeof this.priorityLevels]
    )) {
      const queue = this.loadingQueues.get(priority);
      if (!queue || queue.length === 0) {
        continue;
      }

      const moduleId = queue.shift()!;
      await this.loadModule(moduleId);
    }
  }

  /**
   * Load individual module with memory optimization
   */
  async loadModule(moduleId: string): Promise<WasmModuleInstance> {
    const module = this.loadedModules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not registered`);
    }

    if (module.loaded && module.instance) {
      return module.instance;
    }

    if (module.loading) {
      // Wait for existing load
      while (module.loading) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      return module.instance!;
    }

    module.loading = true;

    try {
      console.log(`📦 Loading WASM module: ${moduleId}`);

      // Load dependencies first
      for (const depId of module.dependencies) {
        await this.loadModule(depId);
      }

      // Fetch WASM bytes
      const response = await fetch(module.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${module.url}: ${response.status}`);
      }

      const wasmBytes = await response.arrayBuffer();

      // Allocate memory for module
      const memoryAllocation = this.memoryPool.allocate(
        moduleId,
        module.size || wasmBytes.byteLength * 2
      );

      module.memoryAllocations.add(memoryAllocation.id);

      // Create imports with optimized memory
      const imports = this.createModuleImports(moduleId, memoryAllocation);

      // Compile and instantiate
      const startTime = performance.now();
      const wasmModule = await WebAssembly.compile(wasmBytes);
      const instance = await WebAssembly.instantiate(wasmModule, imports);
      const loadTime = performance.now() - startTime;

      module.instance = {
        module: wasmModule,
        instance,
        exports: instance.exports,
        memory: memoryAllocation,
        loadTime,
      };

      module.loaded = true;
      module.loading = false;

      console.log(`✅ Loaded ${moduleId} in ${loadTime.toFixed(2)}ms`);

      // Optimize memory after loading
      this.optimizeModuleMemory(moduleId);

      return module.instance;
    } catch (error) {
      module.loading = false;
      console.error(`❌ Failed to load ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Create optimized imports for module
   */
  private createModuleImports(moduleId: string, memoryAllocation: AllocationResult): any {
    const pool = this.memoryPool.getPool(moduleId);

    return {
      env: {
        memory: pool.memory,

        // Optimized memory allocation functions
        malloc: (size: number) => {
          const allocation = this.memoryPool.allocate(moduleId, size);
          return allocation.offset;
        },

        free: (ptr: number) => {
          // Find allocation by offset and free it
          for (const allocation of this.memoryPool['allocations'].values()) {
            if (allocation.moduleId === moduleId && allocation.offset === ptr) {
              this.memoryPool.deallocate(allocation.id);
              break;
            }
          }
        },

        // SIMD-optimized math functions
        simd_add_f32x4: (a: number, b: number, result: number) => {
          console.log('SIMD add called');
        },

        // Performance monitoring
        performance_mark: (name: string) => {
          performance.mark(`${moduleId}_${name}`);
        },
      },

      // WASI support for file operations
      wasi_snapshot_preview1: {
        proc_exit: (code: number) => {
          console.log(`Module ${moduleId} exited with code ${code}`);
        },
        fd_write: () => 0,
      },
    };
  }

  /**
   * Optimize module memory after loading
   */
  private optimizeModuleMemory(moduleId: string): void {
    setTimeout(() => {
      this.memoryPool.compactMemory(moduleId);
    }, 1000); // Delay to allow initial operations
  }

  /**
   * Get module by ID
   */
  getModule(moduleId: string): WasmModuleInstance | null {
    const module = this.loadedModules.get(moduleId);
    return module?.instance || null;
  }

  /**
   * Unload module and free memory
   */
  unloadModule(moduleId: string): boolean {
    const module = this.loadedModules.get(moduleId);
    if (!module || !module.loaded) {
      return false;
    }

    // Free all memory allocations
    for (const allocationId of module.memoryAllocations) {
      this.memoryPool.deallocate(allocationId);
    }

    module.memoryAllocations.clear();
    module.instance = null;
    module.loaded = false;

    console.log(`🗑️ Unloaded module: ${moduleId}`);
    return true;
  }

  /**
   * Get comprehensive loader statistics
   */
  getLoaderStats(): LoaderStats {
    const modules = Array.from(this.loadedModules.values());
    const loaded = modules.filter((m) => m.loaded);
    const loading = modules.filter((m) => m.loading);

    return {
      totalModules: modules.length,
      loadedModules: loaded.length,
      loadingModules: loading.length,
      memoryStats: this.memoryPool.getMemoryStats(),
      loadTimes: loaded.map((m) => ({
        id: m.id,
        loadTime: m.instance?.loadTime || 0,
      })),
      averageLoadTime:
        loaded.reduce((acc, m) => acc + (m.instance?.loadTime || 0), 0) / loaded.length,
    };
  }

  /**
   * Optimize all memory pools
   */
  optimizeMemory(): void {
    this.memoryPool.garbageCollectAll();

    for (const moduleId of this.loadedModules.keys()) {
      if (this.loadedModules.get(moduleId)!.loaded) {
        this.memoryPool.compactMemory(moduleId);
      }
    }

    console.log('🧹 Memory optimization completed');
  }
}

/**
 * WASM Browser Compatibility Manager
 */
export class WasmCompatibilityManager {
  private capabilities: WasmCapabilities | null = null;
  private fallbacks = new Map<string, () => any>();

  /**
   * Detect browser WASM capabilities
   */
  async detectCapabilities(): Promise<WasmCapabilities> {
    const capabilities: WasmCapabilities = {
      webassembly: typeof WebAssembly !== 'undefined',
      simd: false,
      threads: false,
      exceptions: false,
      memory64: false,
      streaming: false,
    };

    if (!capabilities.webassembly) {
      this.capabilities = capabilities;
      return capabilities;
    }

    // Test SIMD support
    try {
      const simdTest = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, // WASM magic
        0x01, 0x00, 0x00, 0x00, // version
        0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, // type section
        0x03, 0x02, 0x01, 0x00, // function section
        0x0a, 0x09, 0x01, 0x07, 0x00, 0xfd, 0x0c, 0x00, 0x0b, // code section with SIMD
      ]);

      await WebAssembly.compile(simdTest);
      capabilities.simd = true;
    } catch (e) {
      capabilities.simd = false;
    }

    // Test streaming compilation
    capabilities.streaming = typeof WebAssembly.compileStreaming === 'function';

    // Test SharedArrayBuffer for threads
    capabilities.threads = typeof SharedArrayBuffer !== 'undefined';

    this.capabilities = capabilities;
    console.log('🔍 WASM capabilities detected:', capabilities);

    return capabilities;
  }

  /**
   * Get capabilities (detect if not already done)
   */
  async getCapabilities(): Promise<WasmCapabilities> {
    if (!this.capabilities) {
      await this.detectCapabilities();
    }
    return this.capabilities!;
  }

  /**
   * Register fallback for feature
   */
  registerFallback(feature: string, fallbackFn: () => any): void {
    this.fallbacks.set(feature, fallbackFn);
  }

  /**
   * Check if feature is supported with fallback
   */
  async isSupported(feature: keyof WasmCapabilities): Promise<boolean | 'fallback'> {
    const capabilities = await this.getCapabilities();

    if (capabilities[feature]) {
      return true;
    }

    if (this.fallbacks.has(feature)) {
      console.log(`⚠️ Using fallback for ${feature}`);
      return 'fallback';
    }

    return false;
  }

  /**
   * Load module with compatibility checks
   */
  async loadCompatibleModule(url: string, features: string[] = []): Promise<WebAssembly.Module> {
    const capabilities = await this.getCapabilities();

    if (!capabilities.webassembly) {
      throw new Error('WebAssembly not supported in this browser');
    }

    // Check required features
    const unsupported: string[] = [];
    for (const feature of features) {
      const support = await this.isSupported(feature as keyof WasmCapabilities);
      if (!support) {
        unsupported.push(feature);
      }
    }

    if (unsupported.length > 0) {
      console.warn(`⚠️ Unsupported features: ${unsupported.join(', ')}`);
      // Could load alternative module or disable features
    }

    // Load with appropriate method
    if (capabilities.streaming) {
      return WebAssembly.compileStreaming(fetch(url));
    }
    const response = await fetch(url);
    const bytes = await response.arrayBuffer();
    return WebAssembly.compile(bytes);
  }
}

/**
 * Default exports
 */
export default {
  WasmMemoryPool,
  ProgressiveWasmLoader,
  WasmCompatibilityManager,
};