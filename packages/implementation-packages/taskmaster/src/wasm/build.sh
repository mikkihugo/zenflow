#!/bin/bash

# TaskMaster WASM Build Script - Production Optimized
# Builds the Rust WASM module with maximum optimization

set -e  # Exit on any error

echo "🦀 Building TaskMaster WASM module..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo -e "${RED}❌ wasm-pack not found. Installing...${NC}"
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Cargo not found. Please install Rust: https://rustup.rs/${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing/updating Rust targets...${NC}"
rustup target add wasm32-unknown-unknown

echo -e "${BLUE}🔧 Building WASM module with optimizations...${NC}"

# Build with wasm-pack for web target
wasm-pack build \
    --target web \
    --out-dir pkg \
    --release \
    --scope taskmaster

echo -e "${GREEN}✅ WASM build completed!${NC}"

# Check if wasm-opt is available for further optimization
if command -v wasm-opt &> /dev/null; then
    echo -e "${BLUE}🚀 Optimizing WASM binary with wasm-opt...${NC}"
    wasm-opt -Oz --enable-mutable-globals pkg/taskmaster_wasm_bg.wasm -o pkg/taskmaster_wasm_bg.wasm
    echo -e "${GREEN}✅ WASM optimization completed!${NC}"
else
    echo -e "${YELLOW}⚠️  wasm-opt not found. Install binaryen for additional optimizations.${NC}"
fi

# Generate TypeScript bindings
echo -e "${BLUE}📝 Generating TypeScript bindings...${NC}"

# Create TypeScript interface file
cat > pkg/index.d.ts << 'EOF'
/**
 * TaskMaster WASM Performance Module - TypeScript Bindings
 * 
 * Generated TypeScript interfaces for the Rust WASM module
 */

export interface TaskMetadata {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  state: string;
  complexity: "trivial" | "simple" | "moderate" | "complex" | "epic";
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export interface FlowMetrics {
  timestamp: string;
  throughput: number;
  avg_cycle_time: number;
  avg_lead_time: number;
  wip_efficiency: number;
  flow_efficiency: number;
  blocked_time_percentage: number;
  predictability: number;
  quality_index: number;
  resource_utilization: number;
}

export interface BottleneckInfo {
  state: string;
  severity: number;
  affected_task_count: number;
  estimated_delay_hours: number;
  bottleneck_type: "capacity" | "skill" | "dependency" | "process" | "resource";
  factors: string[];
  trend: "improving" | "stable" | "degrading";
}

export interface BottleneckDetectionResult {
  timestamp: string;
  bottlenecks: BottleneckInfo[];
  system_health: number;
  confidence: number;
}

export interface WIPLimitsConfig {
  global_limit: number;
  enable_intelligent_adaptation: boolean;
  adaptation_sensitivity: number;
}

export interface PredictionInput {
  tasks: TaskMetadata[];
  historical_metrics: FlowMetrics[];
  wip_limits: WIPLimitsConfig;
  prediction_horizon_days: number;
}

export interface PredictionResult {
  timestamp: string;
  predicted_throughput: number;
  predicted_cycle_time: number;
  predicted_bottlenecks: BottleneckInfo[];
  confidence: number;
  model_version: string;
  computation_time_ms: number;
}

export interface TimeRange {
  start: string;
  end: string;
}

/**
 * Main WASM TaskFlow Predictor class
 */
export class WASMTaskFlowPredictor {
  constructor();
  
  /**
   * Initialize the predictor with configuration
   */
  initialize(config_json: string): Promise<void>;
  
  /**
   * Train the ML models on historical data
   */
  train(tasks_json: string, metrics_json: string): void;
  
  /**
   * Predict future performance metrics
   */
  predict_performance(input_json: string): string;
  
  /**
   * Detect bottlenecks using ML algorithms
   */
  detect_bottlenecks(tasks_json: string, metrics_json: string): string;
  
  /**
   * Optimize WIP limits using ML
   */
  optimize_wip_limits(current_limits_json: string, metrics_json: string): string;
  
  /**
   * Calculate flow metrics efficiently
   */
  calculate_metrics(tasks_json: string, time_range_json: string): string;
  
  /**
   * Get performance benchmarks
   */
  get_performance_benchmark(): string;
  
  /**
   * Free WASM memory resources
   */
  destroy(): void;
}

/**
 * Utility functions
 */
export function log_performance(message: string): void;
export function get_wasm_info(): string;
export function optimize_memory(): void;

/**
 * Initialize the WASM module
 */
export default function init(input?: string | URL | Request): Promise<void>;
EOF

echo -e "${GREEN}✅ TypeScript bindings generated!${NC}"

# Display build information
echo -e "${BLUE}📊 Build Information:${NC}"
echo "Target: wasm32-unknown-unknown"
echo "Profile: release"
echo "Output: pkg/"
echo "Optimizations: -Oz with wasm-opt"

# Display file sizes
echo -e "${BLUE}📁 Generated Files:${NC}"
ls -lah pkg/ | grep -E '\.(wasm|js|ts)$'

echo -e "${GREEN}🎉 TaskMaster WASM module build completed successfully!${NC}"

# Verify the build
if [ -f "pkg/taskmaster_wasm_bg.wasm" ]; then
    WASM_SIZE=$(stat -f%z pkg/taskmaster_wasm_bg.wasm 2>/dev/null || stat -c%s pkg/taskmaster_wasm_bg.wasm)
    echo -e "${GREEN}✅ WASM binary size: ${WASM_SIZE} bytes${NC}"
    
    # Check if size is reasonable (should be under 1MB for optimized build)
    if [ $WASM_SIZE -lt 1048576 ]; then
        echo -e "${GREEN}✅ WASM binary size is optimized!${NC}"
    else
        echo -e "${YELLOW}⚠️  WASM binary is large (>1MB). Consider additional optimizations.${NC}"
    fi
else
    echo -e "${RED}❌ WASM binary not found. Build may have failed.${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Ready for integration with TypeScript/JavaScript!${NC}"