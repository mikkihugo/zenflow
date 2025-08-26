# 🔒 TIER 2 PRIVATE PACKAGE

## ⚠️ INTERNAL IMPLEMENTATION ONLY

**This is a PRIVATE implementation package. DO NOT import directly.**

### 🎯 Package Role:

AI-powered TypeScript/JavaScript linter implementation - accessed via @claude-zen/development facade only.

### 🚫 FORBIDDEN:

- Direct imports from user code
- Public API exposure
- Breaking changes without facade updates

### 📋 Access Pattern:

```typescript
// ✅ CORRECT - Use facade
import { getAILinter } from '@claude-zen/development';

// ❌ WRONG - Direct import forbidden
// import { AILinter } from '@claude-zen/ai-linter';
```

---

**Tier 2 Private Implementation - Facade Access Only**
