# 🌟 PUBLIC API PACKAGES

## ⚠️ CRITICAL: READ-ONLY ENFORCEMENT

**These are PUBLIC API packages. DO NOT modify unless explicitly instructed and confirmed.**

### 🎯 What This Tier Contains:

- **Core**: Foundation utilities (`@claude-zen/foundation`)
- **Facades**: Strategic delegation interfaces (intelligence, infrastructure, enterprise, operations, development)
- **Integrations**: User-facing integrations (llm-providers, repo-analyzer)

### ✅ ALLOWED Operations:

- **Read files** to understand interfaces and usage
- **Analyze code** for documentation or debugging
- **Answer questions** about functionality

### 🚫 FORBIDDEN Operations (Unless Explicitly Instructed):

- **Creating new files** in any package
- **Modifying existing files** in any package
- **Adding dependencies** to package.json files
- **Changing package structure** or exports

### 🔒 Architecture Enforcement:

These packages are the **ONLY** ones users should import from. They provide:

- Stable public interfaces that never break
- Strategic delegation to implementation packages
- Lazy loading and graceful degradation
- Centralized utilities through foundation

### 📋 Instructions for Claude Code:

1. **ASK FIRST**: Before any write operation, confirm with user
2. **READ ONLY**: Default to read-only operations unless confirmed
3. **RESPECT TIERS**: Never import from implementation packages directly
4. **USE FACADES**: All functionality through strategic facades

---

**This protection prevents accidental breaking changes to public APIs.**
