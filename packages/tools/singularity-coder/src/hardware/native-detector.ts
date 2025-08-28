import * as os from 'node:os';
import '../types/hardware-types;

// Optional native dependencies for enhanced hardware detection
let osUtils:typeof import('os-utils')|null = null;')let _si:typeof import('systeminformation')|null = null;')
try {
  osUtils = require('os-utils');')} catch (_e) {
  logger.info('os-utils not available, using fallback detection');')}

try {
  _si = require('systeminformation');')} catch (_e) {
  logger.info('systeminformation not available, using fallback detection');')}

export interface HardwareInfo {
  cpu_cores:number;
  cpu_arch:string;
  memory_total_mb:number;
  memory_available_mb:number;
  memory_free_mb:number;
  has_gpu:boolean;
  gpu_memory_mb?:number;
  gpu_vendor?:string;
  platform:string;
  optimization_level:'Low' | ' Medium' | ' High';
  cpu_model:string;
  cpu_speed_ghz:number;
  load_average:number[];
}

export interface OptimizationStrategy {
  parallel_tasks:number;
  memory_buffer_size:number;
  use_simd:boolean;
  use_gpu_acceleration:boolean;
  cache_size_mb:number;
  batch_size:number;
  thread_pool_size:number;
  max_concurrent_operations:number;
}

export class NativeHardwareDetector {
  private cachedInfo:HardwareInfo|null = null;
  private cacheTimestamp:number = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds cache

  async detectHardware():Promise<HardwareInfo> {
    // Use cached result if still valid
    const now = Date.now();
    if (this.cachedInfo && now - this.cacheTimestamp < this.CACHE_TTL) {
      return this.cachedInfo;
}

    logger.info('Native hardware detection starting...');')
    // Basic Node.js detection
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const platform = os.platform();
    const arch = os.arch();
    const loadAvg = os.loadavg();

    const _hardwareInfo:HardwareInfo = {
      cpu_cores:cpus.length,
      cpu_arch:arch,
      memory_total_mb:Math.round(totalMemory / (1024 * 1024)),
      memory_available_mb:Math.round(freeMemory / (1024 * 1024)),
      memory_free_mb:Math.round(freeMemory / (1024 * 1024)),
      has_gpu:false,
      platform:platform,
      optimization_level: 'Medium',      cpu_model:cpus[0]?.model||'Unknown',      cpu_speed_ghz:(cpus[0]?.speed||1000) / 1000,
      load_average:loadAvg,
};

    logger.info(
      `Basic detection:${cpus.length} cores, ${Math.round(totalMemory / (1024 * 1024))}MB RAM``
    );

    // Enhanced detection with systeminformation
    if (si) {
      try {
        logger.info('Using systeminformation for enhanced detection...');')
        // Get detailed CPU info
        const cpuInfo = await si.cpu();
        if (cpuInfo) {
          hardwareInfo.cpu_cores = cpuInfo.cores||cpus.length;
          hardwareInfo.cpu_model = cpuInfo.brand||hardwareInfo.cpu_model;
          hardwareInfo.cpu_speed_ghz =
            cpuInfo.speed||hardwareInfo.cpu_speed_ghz;
}

        // Get memory info
        const memInfo = await si.mem();
        if (memInfo) {
          hardwareInfo.memory_total_mb = Math.round(
            memInfo.total / (1024 * 1024)
          );
          hardwareInfo.memory_available_mb = Math.round(
            memInfo.available / (1024 * 1024)
          );
          hardwareInfo.memory_free_mb = Math.round(
            memInfo.free / (1024 * 1024)
          );
}

        // Get GPU info
        const gpuInfo = await si.graphics();
        if (gpuInfo && gpuInfo.controllers && gpuInfo.controllers.length > 0) {
          const gpu = gpuInfo.controllers[0];
          if (gpu) {
            hardwareInfo.has_gpu = true;
            if (gpu.vram) {
              hardwareInfo.gpu_memory_mb = gpu.vram;
}
            hardwareInfo.gpu_vendor = gpu.vendor||'Unknown;
            logger.info(
              `GPU detected:${gpu.vendor||'Unknown'} with ${gpu.vram||0}MB VRAM``
            );
}
}
} catch (error) {
        logger.info('systeminformation detection failed, using fallback: ','          error instanceof Error ? error.message:String(error)
        );
}
}

    // Enhanced detection with os-utils
    if (osUtils) {
      try {
        logger.info('Using os-utils for CPU utilization...');')        // Get current CPU usage (this is async in os-utils)
        const cpuUsage = await new Promise<number>((resolve) => {
          osUtils.cpuUsage((v:number) => resolve(v));
});
        logger.info(`CPU usage:${(cpuUsage * 100).toFixed(1)}%`);`
} catch (error) {
        logger.info(
          'os-utils detection failed: ','          error instanceof Error ? error.message:String(error)
        );
}
}

    // Determine optimization level based on hardware capabilities
    hardwareInfo.optimization_level =
      this.determineOptimizationLevel(hardwareInfo);

    logger.info(
      `Final detection:$hardwareInfo.cpu_corescores, $hardwareInfo.memory_total_mbMB RAM, GPU:$hardwareInfo.has_gpu, Level:$hardwareInfo.optimization_level``
    );

    // Cache the result
    this.cachedInfo = hardwareInfo;
    this.cacheTimestamp = now;

    return hardwareInfo;
}

  private determineOptimizationLevel(
    info:HardwareInfo
  ):'Low|Medium|High' {
    ')    let score = 0;

    // CPU cores scoring
    if (info.cpu_cores >= 8) score += 3;
    else if (info.cpu_cores >= 4) score += 2;
    else if (info.cpu_cores >= 2) score += 1;

    // Memory scoring
    if (info.memory_total_mb >= 16384)
      score += 3; // 16GB+
    else if (info.memory_total_mb >= 8192)
      score += 2; // 8GB+
    else if (info.memory_total_mb >= 4096) score += 1; // 4GB+

    // GPU scoring
    if (info.has_gpu) score += 2;

    // CPU speed scoring
    if (info.cpu_speed_ghz >= 3.0) score += 2;
    else if (info.cpu_speed_ghz >= 2.0) score += 1;

    // Determine level based on total score
    if (score >= 8) return 'High;
    else if (score >= 4) return 'Medium;
    else return 'Low;
}

  generateOptimizationStrategy(
    hardwareInfo:HardwareInfo
  ):OptimizationStrategy {
    const coreCount = hardwareInfo.cpu_cores;
    const memoryMB = hardwareInfo.memory_total_mb;
    const hasGPU = hardwareInfo.has_gpu;
    const level = hardwareInfo.optimization_level;

    // Base strategy on hardware capabilities
    const strategy:OptimizationStrategy = {
      parallel_tasks:Math.max(1, coreCount - 1), // Leave one core for system
      memory_buffer_size:1024 * 1024, // 1MB base
      use_simd:coreCount >= 2,
      use_gpu_acceleration:hasGPU,
      cache_size_mb:Math.max(1, Math.floor(memoryMB * 0.1)), // 10% of RAM
      batch_size:1,
      thread_pool_size:coreCount,
      max_concurrent_operations:coreCount * 2,
};

    // Adjust based on optimization level
    switch (level) {
      case 'High': ')'        strategy.parallel_tasks = Math.max(4, coreCount - 1);
        strategy.memory_buffer_size = 16 * 1024 * 1024; // 16MB
        strategy.cache_size_mb = Math.max(64, Math.floor(memoryMB * 0.15));
        strategy.batch_size = Math.max(8, coreCount);
        strategy.max_concurrent_operations = coreCount * 4;
        break;
      case 'Medium': ')'        strategy.parallel_tasks = Math.max(2, Math.floor(coreCount * 0.75));
        strategy.memory_buffer_size = 4 * 1024 * 1024; // 4MB
        strategy.cache_size_mb = Math.max(16, Math.floor(memoryMB * 0.08));
        strategy.batch_size = Math.max(4, Math.floor(coreCount / 2));
        strategy.max_concurrent_operations = coreCount * 2;
        break;
      case 'Low': ')'        strategy.parallel_tasks = Math.max(1, Math.floor(coreCount / 2));
        strategy.memory_buffer_size = 1024 * 1024; // 1MB
        strategy.cache_size_mb = Math.max(4, Math.floor(memoryMB * 0.05));
        strategy.batch_size = 1;
        strategy.max_concurrent_operations = Math.max(2, coreCount);
        break;
}

    // Safety checks
    strategy.parallel_tasks = Math.min(strategy.parallel_tasks, 32); // Max 32 parallel tasks
    strategy.cache_size_mb = Math.min(
      strategy.cache_size_mb,
      Math.floor(memoryMB * 0.5)
    ); // Max 50% of RAM
    strategy.memory_buffer_size = Math.min(
      strategy.memory_buffer_size,
      128 * 1024 * 1024
    ); // Max 128MB

    logger.info(
      `Generated optimization strategy for ${level} level:${strategy.parallel_tasks} tasks, ${strategy.cache_size_mb}MB cache``
    );

    return strategy;
}

  async getOptimizationStrategy():Promise<OptimizationStrategy> {
    const hardwareInfo = await this.detectHardware();
    return this.generateOptimizationStrategy(hardwareInfo);
}

  clearCache():void {
    this.cachedInfo = null;
    this.cacheTimestamp = 0;
}
}

// Export singleton instance
export const nativeHardwareDetector = new NativeHardwareDetector();
