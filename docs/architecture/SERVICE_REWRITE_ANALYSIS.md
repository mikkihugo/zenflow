# Service Rewrite & Wrapper Analysis

## Architecture Decision Matrix

### Core Principle: Leverage Erlang/OTP + Rust for Maximum Performance & Reliability

| Service | Current | Recommendation | Rationale |
|---------|---------|----------------|-----------|
| **bastion-rs** | Rust Actors | ✅ **Keep Pure Rust** | Already optimal - Rust actors are perfect for this |
| **bpmn-engine** | Elixir/Erlang | ✅ **Keep Elixir/Erlang** | BEAM VM excels at workflow orchestration |
| **federated-mcp** | Node.js | 🔄 **Rewrite in Rust** | Performance critical, needs zero-cost abstractions |
| **fact-execution** | Python | 🎯 **Hybrid: Erlang wrapper + Rust core** | Keep Python for AI/ML, wrap in Erlang for supervision |

## Detailed Rewrite Strategy

### 1. **federated-mcp** → **mcp-federation-service** (Complete Rust Rewrite)

**Why Rust:**
- Protocol federation requires high-performance message routing
- Zero-cost abstractions for provider switching
- Memory safety for long-running federation processes
- Better integration with bastion-rs actors
- Superior concurrency for handling multiple AI providers

**Architecture:**
```rust
// New Rust MCP Federation Service
use bastion::prelude::*;
use tokio::net::{TcpListener, TcpStream};
use serde::{Deserialize, Serialize};

pub struct McpFederationService {
    providers: HashMap<ProviderId, ProviderConfig>,
    load_balancer: LoadBalancer,
    circuit_breakers: HashMap<ProviderId, CircuitBreaker>,
    message_router: MessageRouter,
}

#[derive(Debug, Clone)]
pub struct ProviderConfig {
    pub endpoint: String,
    pub auth: AuthConfig,
    pub capabilities: ProviderCapabilities,
    pub performance_metrics: ProviderMetrics,
}

impl McpFederationService {
    pub async fn route_message(&self, msg: McpMessage) -> Result<McpResponse> {
        // Intelligent provider selection based on:
        // 1. Provider capabilities
        // 2. Current load
        // 3. Circuit breaker status
        // 4. Message type optimization
        
        let optimal_provider = self.load_balancer
            .select_provider(&msg, &self.providers)
            .await?;
            
        self.execute_with_fallback(msg, optimal_provider).await
    }
    
    async fn execute_with_fallback(&self, msg: McpMessage, primary: ProviderId) -> Result<McpResponse> {
        match self.circuit_breakers[&primary].call(|| {
            self.send_to_provider(msg.clone(), primary)
        }).await {
            Ok(response) => Ok(response),
            Err(_) => {
                // Automatic fallback to secondary provider
                let fallback = self.load_balancer.select_fallback(&primary)?;
                self.send_to_provider(msg, fallback).await
            }
        }
    }
}
```

### 2. **fact-execution** → **fact-execution-service** (Erlang Wrapper + Rust Core)

**Why Hybrid Approach:**
- Keep Python for rich AI/ML ecosystem (NumPy, PyTorch, etc.)
- Wrap in Erlang for supervision and fault tolerance
- Add Rust core for performance-critical path operations
- Enable hot code swapping and monitoring

**Architecture:**
```erlang
%% Erlang Supervisor for FACT Service
-module(fact_execution_supervisor).
-behaviour(supervisor).

-export([start_link/0, init/1]).

start_link() ->
    supervisor:start_link({local, ?MODULE}, ?MODULE, []).

init([]) ->
    %% Python worker pool for AI/ML operations
    PythonWorkers = #{
        id => python_worker_pool,
        start => {python_worker_pool, start_link, []},
        restart => permanent,
        shutdown => 5000,
        type => worker,
        modules => [python_worker_pool]
    },
    
    %% Rust performance core for critical operations
    RustCore = #{
        id => rust_performance_core,
        start => {rust_performance_core, start_link, []},
        shutdown => 5000,
        type => worker
    },
    
    %% Coordination manager
    CoordinationManager = #{
        id => fact_coordination_manager,
        start => {fact_coordination_manager, start_link, []},
        restart => permanent,
        shutdown => 5000,
        type => worker
    },
    
    Children = [PythonWorkers, RustCore, CoordinationManager],
    RestartStrategy = #{
        strategy => one_for_one,
        intensity => 10,
        period => 60
    },
    
    {ok, {RestartStrategy, Children}}.
```

```rust
// Rust Performance Core for FACT
use rustler::{Env, NifResult, Term};

#[rustler::nif]
fn optimize_tool_execution(tool_spec: String, parameters: String) -> NifResult<String> {
    // High-performance tool execution optimization
    let optimized_params = optimize_parameters(&parameters)?;
    let execution_plan = create_execution_plan(&tool_spec, &optimized_params)?;
    
    Ok(execution_plan.to_json())
}

#[rustler::nif] 
fn batch_process_results(results: Vec<String>) -> NifResult<String> {
    // Parallel processing of AI tool results
    let processed = results
        .par_iter()
        .map(|result| process_ai_result(result))
        .collect::<Result<Vec<_>, _>>()?;
        
    Ok(serde_json::to_string(&processed)?)
}

rustler::init!("rust_performance_core", [
    optimize_tool_execution,
    batch_process_results,
    // ... other performance-critical functions
]);
```

```python
# Python AI/ML Core (supervised by Erlang)
import asyncio
from typing import Dict, Any, List
import numpy as np
import torch

class FactAiCore:
    """AI/ML operations managed by Erlang supervisor"""
    
    def __init__(self):
        self.tools_registry = {}
        self.model_cache = {}
        
    async def execute_ai_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute AI tool with Erlang supervision"""
        try:
            # Get optimization hints from Rust core
            optimization_hints = await self.get_rust_optimization(tool_name, params)
            
            # Execute AI operation
            result = await self._execute_tool_with_optimization(
                tool_name, params, optimization_hints
            )
            
            # Report success to Erlang supervisor
            await self.report_success(tool_name, result)
            return result
            
        except Exception as e:
            # Report failure to Erlang supervisor for recovery
            await self.report_failure(tool_name, str(e))
            raise
            
    async def _execute_tool_with_optimization(self, tool_name: str, params: Dict, hints: Dict) -> Dict:
        """Core AI execution with Rust-provided optimization"""
        if tool_name == "research_agent":
            return await self.research_agent_execute(params, hints)
        elif tool_name == "code_analyzer":
            return await self.code_analyzer_execute(params, hints)
        # ... other AI tools
        
    async def research_agent_execute(self, params: Dict, hints: Dict) -> Dict:
        """Research agent with ML-powered analysis"""
        # Use ML models for intelligent research
        query_embedding = self.embed_query(params["query"])
        relevant_sources = await self.find_relevant_sources(query_embedding)
        
        # Parallel analysis of sources
        analyses = await asyncio.gather(*[
            self.analyze_source(source) for source in relevant_sources
        ])
        
        # Synthesize results
        synthesis = self.synthesize_research(analyses, params["requirements"])
        
        return {
            "research_results": synthesis,
            "sources_analyzed": len(relevant_sources),
            "confidence_score": self.calculate_confidence(synthesis),
            "execution_time": hints.get("execution_time", 0)
        }
```

## Implementation Plan

### Phase 1: MCP Federation Rewrite (Week 1-2)
```bash
# Create new Rust MCP federation service
cd /home/mhugo/code/singularity-engine/platform
mkdir mcp-federation-service-rust
cd mcp-federation-service-rust

# Initialize Rust project with Bastion integration
cargo init --name mcp-federation-service
cargo add bastion tokio serde serde_json anyhow tracing
cargo add reqwest tungstenite # For HTTP/WebSocket MCP transport
```

### Phase 2: FACT Hybrid Architecture (Week 3-4)
```bash
# Create Erlang wrapper project
cd /home/mhugo/code/singularity-engine/platform/fact-execution-service
mkdir erlang_supervisor
cd erlang_supervisor

# Initialize Erlang project
rebar3 new app fact_supervisor
cd fact_supervisor

# Add Rust NIFs
mkdir rust_core
cd rust_core
cargo init --name fact_rust_core
cargo add rustler serde rayon # For Erlang NIFs and parallel processing
```

### Phase 3: Integration & Testing (Week 5-6)
- Bastion-rs integration testing
- BPMN workflow integration
- Performance benchmarking
- Fault tolerance validation

## Performance Expectations

### MCP Federation (Rust Rewrite)
- **Latency**: Sub-millisecond provider routing
- **Throughput**: 10,000+ concurrent connections  
- **Memory**: 50% reduction vs Node.js version
- **CPU**: Zero-cost abstractions, optimal provider selection

### FACT Hybrid (Erlang + Rust + Python)
- **Fault Tolerance**: 99.99% uptime with automatic recovery
- **AI Performance**: Rust optimization of Python bottlenecks
- **Supervision**: Hot code reloading, zero-downtime updates
- **Scalability**: Horizontal scaling with worker pools

## Decision Summary

| Component | Language Choice | Integration Method |
|-----------|----------------|-------------------|
| **MCP Federation** | Pure Rust | Direct Bastion actor integration |
| **FACT Core** | Erlang supervisor | Supervises Python workers + Rust NIFs |
| **FACT AI/ML** | Python | Managed by Erlang, optimized by Rust |
| **FACT Performance** | Rust NIFs | Called from Erlang for critical paths |
| **Bastion Engine** | Pure Rust | Core coordination system |
| **BPMN Workflows** | Elixir/Erlang | Natural OTP integration |

This architecture provides the optimal balance of performance, reliability, and developer productivity while maintaining the rich ecosystems needed for AI/ML operations.