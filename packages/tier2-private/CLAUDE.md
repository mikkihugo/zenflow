# 🔒 TIER 2: PRIVATE IMPLEMENTATION PACKAGES

## ⚠️ CRITICAL: PRIVATE PACKAGE PROTECTION

**These are PRIVATE implementation packages. DO NOT modify unless explicitly instructed and confirmed.**

### 🎯 What This Tier Contains:
Standard business logic implementation packages:
- `database`, `memory`, `event-system`
- `agent-monitoring`, `agent-registry`
- `documentation`, `exporters`, `interfaces`
- `telemetry`, `system-monitoring`, `load-balancing`
- And other core implementation packages

### ✅ ALLOWED Operations:
- **Read files** for understanding implementation details
- **Analyze code** for debugging or optimization
- **Answer questions** about internal functionality

### 🚫 FORBIDDEN Operations (Unless Explicitly Instructed):
- **Creating new files** in any private package
- **Modifying existing code** in implementation packages
- **Changing package.json** privacy or dependency settings
- **Exposing private APIs** to public tier

### 🔐 Privacy Enforcement:
- All packages marked `"private": true` in package.json
- **NOT** included in workspace catalog
- Only accessible via Tier 1 facades
- Implementation details hidden from users

### 📋 Instructions for Claude Code:
1. **CONFIRM FIRST**: Always ask before modifying private packages
2. **READ-ONLY DEFAULT**: Analyze and understand, don't modify
3. **RESPECT BOUNDARIES**: Don't expose private APIs publicly
4. **USE VIA FACADES**: Access only through Tier 1 strategic facades

---
**This protection maintains clean separation between public API and private implementation.**