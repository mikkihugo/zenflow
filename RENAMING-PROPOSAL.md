# Claude-Zen Renaming Proposal: ruv-FANN → ruv-FANN-zen

## 🎯 **System Identity Clarification**

**Current State:**
- Directory: `claude-code-flow` (misleading name)
- Package: `@claude-zen/monorepo` v2.0.0-alpha.73
- Neural Framework: `ruv-FANN` (extensively modified)
- Architecture: Enhanced multi-Queen AI platform with Hive Mind

**Proposed Changes:**

### 1. **ruv-FANN → ruv-FANN-zen**

**Why rename?**
- Extensive Claude-Zen specific modifications
- Neural intelligence integrated with Queen system
- Custom optimizations for Hive Mind architecture
- Differentiate from upstream ruv-FANN

**Files to update:**
```bash
# Core package files
ruv-FANN/Cargo.toml               → Update package name to "ruv-fann-zen"
ruv-FANN/README.md                → Update title and branding
ruv-FANN/package.json             → Update npm package name

# Documentation updates
ruv-FANN/docs/                    → All references to ruv-FANN
ruv-FANN/ruv-swarm/               → Update swarm integration docs

# Source code references
ruv-FANN/src/                     → Update internal references
src/neural/                       → Update imports and references
```

### 2. **Directory Structure Cleanup**

**Proposed structure:**
```
claude-zen-monorepo/              ← Rename from claude-code-flow
├── ruv-FANN-zen/               ← Rename from ruv-FANN
│   ├── ruv-swarm-zen/          ← Rename from ruv-swarm
│   └── neuro-divergent-zen/    ← Zen-specific forecasting
├── src/                        ← Claude-Zen core (unchanged)
└── package.json                ← Already correct (@claude-zen/monorepo)
```

### 3. **Branding Updates**

**ruv-FANN-zen Identity:**
```toml
# ruv-FANN-zen/Cargo.toml
[package]
name = "ruv-fann-zen"
version = "0.2.0-zen.1"
description = "Neural Intelligence Framework for Claude-Zen - Enhanced multi-Queen AI platform"
repository = "https://github.com/ruvnet/claude-zen"
keywords = ["neural-network", "claude-zen", "hive-mind", "queen-ai", "multi-agent"]
```

**README Updates:**
```markdown
# ruv-FANN-zen: Neural Intelligence for Claude-Zen 🧠👑

**The neural intelligence framework powering Claude-Zen's multi-Queen AI platform.**

## Integration with Claude-Zen
- **Queen Neural Networks**: Specialized networks for each Queen type
- **Hive Mind Coordination**: Neural-enhanced Queen communication
- **Real-time Learning**: Adaptive intelligence for dynamic tasks
```

## 🚀 **Implementation Plan**

### Phase 1: Core Renaming (1-2 hours)
1. **Update Cargo.toml and package.json**
2. **Rename core directories**
3. **Update internal imports**

### Phase 2: Documentation (30 minutes)  
1. **Update README files**
2. **Revise API documentation**
3. **Update examples**

### Phase 3: Integration Testing (1 hour)
1. **Verify Claude-Zen integration**
2. **Test Queen neural networks**
3. **Validate build process**

## 🔧 **Technical Considerations**

### Import Updates Needed:
```typescript
// Before
import { NeuralNetwork } from 'ruv-fann';

// After  
import { NeuralNetwork } from 'ruv-fann-zen';
```

### Build Script Updates:
```json
{
  "workspaces": [
    "ruv-FANN-zen/ruv-swarm-zen/npm"
  ]
}
```

### Git History Preservation:
```bash
# Preserve commit history
git mv ruv-FANN ruv-FANN-zen
git mv ruv-FANN-zen/ruv-swarm ruv-FANN-zen/ruv-swarm-zen
```

## 📊 **Benefits of Renaming**

1. **Clear Identity**: Reflects Claude-Zen specific enhancements
2. **Avoid Confusion**: Distinguishes from upstream ruv-FANN
3. **Proper Branding**: Aligns with @claude-zen/monorepo identity
4. **Documentation Clarity**: Makes architecture relationships obvious
5. **Future-Proofing**: Allows independent evolution from upstream

## 🎯 **Next Steps**

1. **Approve this proposal**
2. **Execute renaming in controlled manner**
3. **Update TDD tests to reflect new names**
4. **Continue London School TDD implementation**

---

**Note:** This renaming acknowledges the extensive modifications made to ruv-FANN for Claude-Zen integration while preserving the original vision and functionality.