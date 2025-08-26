# Adaptive Memory System - Never OOM

## 🛡️ Ultra-Conservative Memory Management

The Claude Code Zen adaptive memory system is designed with a **ZERO OOM TOLERANCE** policy. It starts conservatively with 8GB base configuration and only scales up when performance conditions are absolutely perfect.

## 🎯 Key Principles

### 1. **Start Small, Scale Carefully**

- **Base Configuration**: Always starts with 8GB conservative limits
- **Auto-Detection**: Detects system memory but doesn't immediately use it all
- **Gradual Scaling**: Increases capacity by tiny increments (1-2% max)

### 2. **Aggressive Scale-Down, Cautious Scale-Up**

```typescript
// Scale down conditions (IMMEDIATE)
if (memoryUtil > 60% || memorySpike > 65% || anyError > 0.1%) {
  scaleDown = 40%; // Aggressive reduction
}

// Scale up conditions (REQUIRES PERFECTION)
if (memoryUtil < 25% && memorySpike < 30% && cpu < 35% &&
   noErrors && highThroughput && stableFor30Cycles) {
  scaleUp = 1%; // Tiny increase only
}
```

### 3. **Memory Volatility Monitoring**

- **Tracks memory spikes** over time to prevent OOM surprises
- **Requires <3% volatility** before allowing any scale-up operations
- **Immediate scale-down** if memory becomes unstable

## 🚀 Auto-Scaling Behavior

### Conservative Startup (8GB Base)

```typescript
// Example: 16GB system detected
const startupConfig = {
  portfolio: 4, // NOT 8 (could handle 8, but starts with 4)
  program: 8, // NOT 32 (could handle 32, but starts with 8)
  swarm: 16, // NOT 80 (could handle 80, but starts with 16)
};
// Uses only ~2GB of 16GB available - ultra-safe
```

### Scale-Up Requirements

**ALL conditions must be met simultaneously:**

- Average memory utilization < 25%
- Maximum recent memory spike < 30%
- CPU utilization < 35%
- Zero errors for extended period
- High throughput (>25 items/sec)
- Memory volatility < 3%
- 30+ cycles of perfect performance history

### Scale-Down Triggers

**ANY condition triggers immediate scale-down:**

- Average memory > 60%
- Any memory spike > 65%
- Any error rate > 0.1%
- Memory volatility > 15%

## 📊 Memory Allocation Strategy

### Safe Memory Distribution

```typescript
const memoryAllocation = {
  systemReserve: 50%,      // Half for OS and safety buffer
  applicationUse: 30%,     // Conservative app usage
  adaptiveBuffer: 20%      // Emergency buffer for scaling
};
```

### Stream Memory Requirements

- **Portfolio streams**: 128MB each (strategic work)
- **Program streams**: 32MB each (collaborative work)
- **Swarm streams**: 8MB each (autonomous work)

## 🔧 Configuration Examples

### 8GB Machine (Base Case)

```typescript
{
  portfolio: 4 streams × 128MB = 512MB
  program: 8 streams × 32MB = 256MB
  swarm: 16 streams × 8MB = 128MB
  total: 896MB (~1GB of 8GB used)
  safety: 7GB remaining for system + scaling
}
```

### 32GB Machine (Auto-Detected)

```typescript
// Starts conservatively despite having 32GB
{
  portfolio: 4 streams × 128MB = 512MB
  program: 8 streams × 32MB = 256MB
  swarm: 16 streams × 8MB = 128MB
  total: 896MB (~1GB of 32GB used)

  // Can scale up to theoretical maximum:
  // portfolio: 64 × 128MB = 8GB
  // program: 256 × 32MB = 8GB
  // swarm: 1024 × 8MB = 8GB
  // But only if performance is PERFECT for extended periods
}
```

## 🚨 OOM Prevention Features

### Real-Time Monitoring

- **Memory spike detection**: Tracks maximum memory in rolling window
- **Volatility analysis**: Prevents scaling during unstable periods
- **Error correlation**: Links memory pressure to error rates

### Emergency Scale-Down

```typescript
if (memoryPressure || errorSpike || instability) {
  // Immediate 40-60% capacity reduction
  emergencyScaleDown();

  // Wait for stability before allowing any scale-up
  requireStabilityPeriod(minutes: 10);
}
```

### Validation Before Changes

```typescript
beforeScaleUp(newConfig) {
  const estimatedMemory = calculateMemoryUsage(newConfig);
  const safeLimit = totalSystemMemory * 0.6; // Never exceed 60%

  if (estimatedMemory > safeLimit) {
    console.log('SAFETY ABORT: Would exceed safe memory limit');
    return false;
  }

  return true;
}
```

## 📈 Performance Impact

### Benefits of Conservative Approach

- **Zero OOM risk**: System never runs out of memory
- **Stable performance**: Predictable resource usage
- **Graceful degradation**: Performance degrades gradually, never crashes

### Scaling Characteristics

- **Slow scale-up**: Takes 5-10 minutes of perfect performance to add single stream
- **Fast scale-down**: Immediate response to any memory pressure
- **Memory first**: Prioritizes memory safety over maximum throughput

## 🔄 Integration with Kanban Flow

The adaptive memory system integrates seamlessly with Advanced Kanban Flow:

```typescript
// Flow manager requests more capacity
const canScale = memoryOptimizer.canAllocateStream('swarm');

if (canScale) {
  // Only allocate if memory allows
  const streamId = flowManager.createNewStream();
  memoryOptimizer.allocateStream('swarm', streamId);
} else {
  // Queue work instead of scaling
  flowManager.queueWork(task);
}
```

## 🎛️ Configuration Options

### Enable/Disable Auto-Scaling

```typescript
const optimizer = createAdaptiveOptimizer();
optimizer.setAutoScale(true); // Enable adaptive scaling
optimizer.setAutoScale(false); // Manual scaling only
```

### Custom Safety Margins

```typescript
const customConfig = {
  portfolioStreamMB: 64, // Reduce memory per stream
  maxMemoryUtilization: 0.5, // Never exceed 50% memory
  scaleUpThreshold: 0.15, // Only scale up if <15% memory used
  volatilityThreshold: 0.02, // Require <2% memory volatility
};
```

## 🏆 Why This Approach?

**Traditional systems** often:

- Scale aggressively and hit OOM limits
- Use heuristics that don't account for memory spikes
- Assume memory usage is predictable
- Cause crashes during peak loads

**Our adaptive system**:

- ✅ **Never causes OOM** - ultra-conservative by design
- ✅ **Handles memory spikes** - monitors volatility continuously
- ✅ **Graceful under load** - scales down before problems occur
- ✅ **Self-healing** - automatically recovers from pressure

The result: **Rock-solid stability** with **adaptive performance** that scales based on actual system capabilities and real-time conditions.
