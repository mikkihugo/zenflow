# 🚨 LOGGING MIGRATION RULES - DO NOT REVERT

## ✅ CORRECT LogTape Migration Pattern (PRESERVE THESE):

```typescript
// ✅ CORRECT: Use centralized logging-config
import { getLogger } from '../config/logging-config';
const logger = getLogger('ComponentName');

// ✅ CORRECT: LogTape-compatible calls
logger.info('message', meta);
logger.warn('message', meta);
logger.error('message', meta);
```

## ❌ OLD Patterns (DO NOT REVERT TO THESE):

```typescript
// ❌ DO NOT USE: Old createLogger pattern
import { createLogger } from '../core/logger';
const logger = createLogger({ prefix: 'ComponentName' });

// ❌ DO NOT USE: Direct LogTape imports (except in logging-config.ts)
import { getLogger } from '@logtape/logtape';

// ❌ DO NOT USE: Object-style logger calls
logger.info({ message: 'text', meta: data });
```

## 🎯 Migration Rules for AI Tools:

1. **PRESERVE** all `import { getLogger } from '../config/logging-config'` imports
2. **PRESERVE** all `getLogger('ComponentName')` calls
3. **DO NOT** convert back to `createLogger({ prefix: 'name' })`
4. **DO NOT** add direct `@logtape/logtape` imports (except in logging-config.ts)
5. **PRESERVE** string-first logger calls: `logger.info('message', meta)`

## 📍 Exception:
- Only `/src/config/logging-config.ts` should import from `@logtape/logtape` directly
- All other files must use the centralized logging-config

## 🔄 Status: MIGRATION COMPLETE ✅
**The LogTape migration is COMPLETE. Do not revert these patterns.**