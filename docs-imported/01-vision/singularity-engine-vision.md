# Singularity Platform

🚀 **AI-First Process Orchestration Platform**

A distributed platform that combines AI frameworks, business process orchestration (BPMN), and secure code execution sandboxing.

## 🎯 Key Features

- **AI Framework Agnostic**: Works with LangChain, CrewAI, AutoGen, and custom AI flows
- **Automatic Fact Checking**: Every AI response is verified against knowledge base
- **Dynamic Sandboxing**: Safe execution of generated code (E2B, Firecracker, Modal)
- **BPMN Integration**: Business processes with AI-powered service tasks
- **Distributed Memory**: Erlang/OTP-based fault-tolerant memory service
- **Enterprise Ready**: Built on proven Erlang/OTP supervision principles

## 🏗️ Architecture

```
┌─ BPMN Process Engine ─────────────────────────┐
│  Business process orchestration with AI tasks │
└─────────────────┬──────────────────────────────┘
                  │
┌─ AI Framework Agnostic Layer ─────────────────┐
│  ├── Custom AIFlow (Primary - Erlang/OTP)     │
│  ├── LangChain (Compatibility)                │
│  ├── CrewAI (Compatibility)                   │
│  └── MCP Federation (Tool Access)             │
└─────────────────┬──────────────────────────────┘
                  │
┌─ Dynamic Sandbox Framework ───────────────────┐
│  ├── E2B Cloud Sandboxes                      │
│  ├── Firecracker MicroVMs                     │
│  └── Modal GPU Containers                     │
└─────────────────┬──────────────────────────────┘
                  │
┌─ Core Services (Erlang/OTP) ──────────────────┐
│  ├── Memory Service (Distributed)             │
│  ├── FACT Service (Knowledge Verification)    │
│  └── Database Manager (PostgreSQL)            │
└────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Erlang/OTP 26+
- Rust 1.70+
- Python 3.11+
- PostgreSQL 16+
- Docker (for sandboxing)

### Installation & Development Environment

**🚀 Quick Start with Nix (Recommended):**

```bash
git clone https://github.com/Singularity124343/singularity-engine.git
cd singularity-engine

# Enter development environment (includes Elixir 1.18 + OTP 28 + Gleam)
nix develop

# ✅ Environment ready! All dependencies automatically available:
#    - Elixir 1.18 with OTP 28
#    - Gleam latest (1.11.1+)
#    - PostgreSQL 16
#    - Build tools (Mix, Rebar3)
```

**🤖 GitHub Copilot Ready:**
The repository is pre-configured for GitHub Copilot Coding Agent with automatic environment detection.

**🔧 Manual Setup (Alternative):**

```bash
# For Gleam services (hex-server, security-service)
cd active-services/hex-server
gleam deps download
gleam build

# For Elixir services (storage-service, development-service)
cd active-services/storage-service
mix deps.get
mix compile
```

### Basic Usage

```rust
// Execute AI task with automatic sandboxing
let platform = SingularityPlatform::new(config);
let task = AgentTask {
    role: "Data Analyst",
    goal: "Analyze sales data and generate insights",
    // ...
};

let result = platform.execute(task).await?;
// Result includes fact-checked response + validated code
```

## 📊 Implementation Status

Current progress: **11.1%** (1/9 core tasks completed)

- ✅ Memory Service Supervisor
- 🔄 Memory Shard Management
- ⏳ Database Manager Core
- ⏳ FACT Service Core
- ⏳ Custom AIFlow Implementation
- ⏳ Sandbox Framework
- ⏳ BPMN Engine

Track progress: `python3 platform/implementation/task_tracker.py dashboard`

## 🧪 Unique Features

### 1. Automatic Fact Checking

Every AI response is automatically verified:

```erlang
%% Built into Custom AIFlow
{ok, Response} = claude_flow:execute(Query),
{ok, FactChecked} = fact_service:verify(Response),
```

### 2. Framework-Agnostic AI

Same code works with different AI frameworks:

```rust
// Customer brings LangChain
platform.execute_with("langchain", task).await

// Or use our optimized Custom AIFlow
platform.execute_with("custom", task).await
```

### 3. Dynamic Sandboxing

Generated code is automatically sandboxed:

- **Simple Python script** → E2B cloud sandbox
- **Untrusted binary** → Firecracker microVM
- **GPU ML model** → Modal container

### 4. BPMN + AI Integration

Business processes with AI service tasks:

```xml
<bpmn:serviceTask id="analyze" name="AI Analysis">
  <ai:agentTask framework="auto">
    <ai:role>Data Scientist</ai:role>
    <ai:goal>Analyze customer churn</ai:goal>
  </ai:agentTask>
</bpmn:serviceTask>
```

## 🛠️ Development

### Project Structure

```
platform/
├── scaffold/              # Core implementation
├── implementation/        # Task tracking & guides
├── memory-service/       # Distributed memory (Erlang)
├── fact-service/         # Knowledge verification (Erlang)
├── ai-providers/         # Framework adapters
└── sandbox-framework/    # Security layer
```

### Contributing

1. Check available tasks: `python3 platform/implementation/task_tracker.py dashboard`
2. Pick a task: `python3 platform/implementation/task_tracker.py start PLAT-XXX`
3. Follow TDD: Write tests first
4. Implement incrementally
5. Mark complete: `python3 platform/implementation/task_tracker.py complete PLAT-XXX 5.5`

## 📄 License

[Your chosen license]

## 🤝 Acknowledgments

Built on the shoulders of giants:

- **Erlang/OTP**: Battle-tested fault tolerance
- **LangChain/CrewAI**: AI framework ecosystem
- **E2B**: Secure cloud sandboxing
- **Firecracker**: AWS's microVM technology

<!-- Triggering CI run at $(date) -->
