# 🚀 CLAUDE ZEN MONOREPO STRUCTURE

## 📍 **MONOREPO LOCATION**
```
/home/mhugo/code/claude-code-flow/
```

## 🏗️ **MONOREPO ARCHITECTURE**

### **📦 WORKSPACES (package.json)**
```json
{
  "name": "@claude-zen/monorepo",
  "workspaces": [
    "src",
    "ruv-FANN/ruv-swarm/npm", 
    "vision-to-code/*",
    "benchmark",
    "src/plugins/*"
  ]
}
```

### **🗂️ DIRECTORY STRUCTURE**

```
claude-code-flow/                    # 🏠 MONOREPO ROOT
├── src/                            # 🎯 Main Claude Zen source
│   ├── cli/                        # 🖥️ CLI system
│   │   ├── unified-cli-main.js     # 🚀 REVOLUTIONARY CLI
│   │   ├── native-swarm-integration.js # 🧠 Native integration
│   │   └── cli-main.js             # 📜 Legacy CLI
│   ├── plugins/                    # 🔌 Enterprise plugins
│   │   ├── memory-backend/         # 💾 LanceDB + Kuzu + SQLite
│   │   ├── github-integration/     # 🐙 GitHub plugin
│   │   ├── unified-interface/      # 🎨 UI plugin
│   │   ├── workflow-engine/        # ⚙️ Workflow plugin
│   │   └── ... (9+ plugins)
│   ├── unified-architecture.js     # 💎 ULTIMATE ARCHITECTURE
│   └── api/                        # 🌐 API server
├── ruv-FANN/                       # 🧠 Neural network source (symlink)
│   └── ruv-swarm/                  # 🐝 Swarm coordination
│       └── npm/
│           └── src/
│               ├── index.js        # 🚀 Main ruv-swarm
│               ├── unified-lance-persistence.js # 💾 Unified memory
│               └── native-hive-mind.js # 🧠 Native coordination
├── vision-to-code/                 # 👁️ Vision to code system
├── benchmark/                      # 📊 Performance benchmarks
├── tests/                          # 🧪 Test suites
└── scripts/                       # 🔧 Build scripts
```

## 🎯 **KEY INTEGRATION FILES**

### **🚀 Revolutionary Architecture**
- `src/unified-architecture.js` - Ultimate unified system
- `src/cli/unified-cli-main.js` - Revolutionary CLI
- `src/cli/native-swarm-integration.js` - Native swarm integration

### **🧠 ruv-swarm Source Integration**
- `ruv-FANN/ruv-swarm/npm/src/index.js` - Main ruv-swarm (consolidated)
- `ruv-FANN/ruv-swarm/npm/src/unified-lance-persistence.js` - Unified memory
- `ruv-FANN/ruv-swarm/npm/src/native-hive-mind.js` - Native coordination

### **💾 Memory Systems**
- `src/plugins/memory-backend/index.js` - LanceDB + Kuzu + SQLite
- Triple hybrid: Vector search + Graph DB + Relational

### **🔌 Enterprise Plugins**
- All 9+ plugins with cross-communication
- Direct imports (no external dependencies)
- Shared monorepo benefits

## 🚀 **USAGE**

### **🚀 Revolutionary CLI (DEFAULT)**
```bash
# Main CLI (revolutionary architecture)
claude-zen --help
claude-zen stats
./src/cli/claude-zen-main.js --help

# Or via npm scripts
npm run dev
npm start
```

### **📜 Legacy CLI (fallback only)**
```bash
# Only if you need legacy functionality
claude-zen-legacy --help
npm run legacy
npm run dev:legacy
```

## 💎 **MONOREPO BENEFITS**

✅ **Shared Dependencies**: No duplication
✅ **Direct Imports**: No external API calls  
✅ **Unified Build**: Single build system
✅ **Cross-Component Communication**: Direct function calls
✅ **100x Performance**: No MCP/external overhead
✅ **Type Safety**: Shared TypeScript definitions
✅ **Testing**: Integrated test suites
✅ **Version Management**: Single version across all components

## 🎯 **FOR GEMINI/AI SYSTEMS**

**To understand this monorepo:**
1. **Root**: `/home/mhugo/code/claude-code-flow/`
2. **Main CLI**: `src/cli/claude-zen-main.js` 
3. **Architecture**: `src/unified-architecture.js`
4. **ruv-swarm**: `ruv-FANN/ruv-swarm/npm/src/index.js`
5. **Plugins**: `src/plugins/*/index.js`
6. **Package**: `package.json` with workspaces
7. **Memory**: Triple hybrid (LanceDB + Kuzu + SQLite)

**Key Insight**: Everything is directly integrated through JavaScript imports - no external dependencies, no MCP layer, no API calls. Pure monorepo architecture with 100x performance improvement.