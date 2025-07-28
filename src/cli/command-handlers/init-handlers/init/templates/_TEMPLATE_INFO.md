# 📁 TEMPLATE FILES DIRECTORY

## ⚠️ IMPORTANT: THESE ARE TEMPLATE FILES

**This directory contains TEMPLATE files that get copied to user projects when they run `npx claude-zen init`.**

### 🎯 Purpose
- **Source Location**: `/src/cli/command-handlers/init-handlers/init/templates/`
- **Destination**: User project directories (when they run `claude-zen init`)
- **Function**: Provides initial configuration files for new claude-zen projects

### 📂 Template Files Include:
- **`CLAUDE.md`** → Copied to user project root as `CLAUDE.md`
- **`settings.json`** → Copied to user project `.claude/settings.json`
- **Other template files** → Various locations in user projects

### 🚫 What These Files Are NOT:
- **NOT** for this development project
- **NOT** the same as `.claude/` directory in this repo
- **NOT** used by claude-code-flow development

### ✅ When to Modify Templates:
- To change what new users get when they run `claude-zen init`
- To update default configurations for new projects
- To add new template files for user projects

### 🔧 Template Architecture:
```
Templates (this directory)     →     User Projects
├── CLAUDE.md                 →     ./CLAUDE.md
├── settings.json             →     ./.claude/settings.json
└── other-templates.md        →     ./other-locations/
```

### 🎯 Key Principle:
**Template files show claude-zen MCP tools because:**
1. Most users should use the abstracted interface
2. ruv-swarm is claude-zen's internal implementation
3. Power users can find direct ruv-swarm docs in `/ruv-FANN/CLAUDE.md`
4. This maintains proper separation of concerns

---

**REMEMBER: Modifying files here affects what NEW users get, not this development project.**