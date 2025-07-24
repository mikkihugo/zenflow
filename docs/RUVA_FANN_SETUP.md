# ruv-FANN-zen Setup Instructions

## 🏗️ Separate Repository Structure Complete

The ruv-FANN coordination backend has been set up as a separate repository following the same pattern as our claude-flow integration.

## 📁 **Current Structure:**

```
/home/mhugo/code/
├── claude-code-flow/        (This repo - claude-zen orchestration)
│   ├── src/cli/             (CLI and orchestration logic)
│   ├── templates/           (Project templates)
│   └── tracks: ruvnet/claude-flow
│
└── ruv-FANN-zen/           (Separate repo - coordination backend)
    ├── ruv-swarm/           (MCP tools and coordination)
    ├── crates/              (Rust implementation)
    └── tracks: ruvnet/ruv-FANN
```

## ⚡ **Next Steps to Complete Setup:**

### 1. **Set up ruv-FANN-zen remote tracking:**
```bash
cd /home/mhugo/code/ruv-FANN-zen
git remote rename origin upstream
git remote add origin https://github.com/mikkihugo/ruv-FANN-zen.git
```

### 2. **Create UPSTREAM_SYNC.md in ruv-FANN-zen:**
```markdown
# Upstream Sync Status - ruv-FANN

| Metric | Our Version | Upstream Version | Status |
|--------|-------------|------------------|---------|
| **Version** | `1.0.10` | `1.0.10` | 🟢 Synced |
| **Last Sync** | Today | Today | 🟢 Current |

## Tracking: ruvnet/ruv-FANN
- Focus: MCP tools, queen coordinator, swarm coordination
- Strategy: Cherry-pick improvements for claude-zen integration
```

### 3. **Create branch for our queen system work:**
```bash
cd /home/mhugo/code/ruv-FANN-zen
git checkout -b claude-zen-queen-integration
```

## 🎯 **Integration Points:**

### **claude-zen (This repo) provides:**
- Template system (`claude-zen init`)
- CLI orchestration 
- Project initialization
- Plugin architecture

### **ruv-FANN-zen (Separate repo) provides:**
- Queen coordinator system
- MCP tools for swarm coordination
- Neural patterns and learning
- Advanced coordination features

## 🔄 **Development Workflow:**

1. **Work on orchestration** → `claude-code-flow` repo
2. **Work on coordination** → `ruv-FANN-zen` repo  
3. **Test integration** → Use both together
4. **Contribute upstream** → Send PRs to both parent projects

## ✅ **Completed:**
- ✅ Cleaned ruv-FANN from claude-zen templates
- ✅ Created separate ruv-FANN-zen repository 
- ✅ Fixed MCP parameter validation issues (PR #164)
- ✅ Established dual upstream tracking strategy

## 🚀 **Ready for Queen Coordinator Development:**

The ruv-FANN-zen repo is now ready for implementing the Queen Coordinator system that we discovered in issue #161. We can build it specifically for claude-zen integration while contributing valuable features back upstream.

**Next Phase**: Implement Queen Coordinator in ruv-FANN-zen that works perfectly with claude-zen orchestration!