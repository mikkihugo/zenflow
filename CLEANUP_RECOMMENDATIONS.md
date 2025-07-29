# 🧹 Claude-Zen Cleanup Recommendations

## What Can Be Safely Cleaned

### 1. **Test Artifacts** (Immediate cleanup - Safe)
```bash
# Root directory test files from our verification
kuzu-integration-test*        # 4KB + 13KB WAL file
kuzu-test.db                  # 16KB
test-kuzu-*                   # Multiple test directories
working-kuzu-test*            # 4KB
verification-kuzu-test*       # 4KB
e2e-test-workspace/          # Empty directory
final-verification-92.js     # 7KB test script
test-working-kuzu.js         # 3KB test script
test-kuzu-integration.js     # 3KB test script
minimal-kuzu-test.js         # Created during testing
```
**Total: ~50KB** ✅ Safe to remove

### 2. **Log Files** (Safe to clean)
```bash
find . -name "*.log" -not -path "./node_modules/*"
```
**Depends on logs present** ✅ Safe to remove

### 3. **Build Artifacts** (Can be regenerated)
```bash
dist/                        # TypeScript build output
build/                       # General build directory
.cache/                      # Build cache
```
**Size varies** ✅ Safe to remove, will be regenerated on build

### 4. **Rust Target Directory** (LARGE - Can be regenerated)
```bash
ruv-FANN/target/            # Rust build artifacts
```
**Size: Likely 100MB+** ⚠️ Safe but will need recompilation

### 5. **Duplicate package-lock.json Files**
```bash
./ruv-FANN/cuda-wasm/package-lock.json
./ruv-FANN/package-lock.json
./ruv-FANN/ruv-swarm/npm/package-lock.json
./claude-zen-mcp/package-lock.json
```
**Several MB each** ✅ Safe if not actively developing those modules

### 6. **Runtime Data** (CAUTION - Contains state)
```bash
.swarm/                     # 13MB - Swarm memory and state
.hive-mind/                 # 576KB - Hive coordination data
```
**Total: ~14MB** ⚠️ **CAUTION**: Contains persistent memory and state

## Quick Cleanup Commands

### Safe Minimal Cleanup (~50KB)
```bash
# Remove test artifacts only
rm -rf kuzu-integration-test* kuzu-test.db test-kuzu-* working-kuzu-test* 
rm -rf verification-kuzu-test* e2e-test-workspace minimal-kuzu-test*
rm -f final-verification-92.js test-working-kuzu.js test-kuzu-integration.js
```

### Recommended Cleanup (~100MB+)
```bash
# Use the provided script
./cleanup-project.sh
# Select option 4 (Everything except runtime data)
```

### Full Cleanup (Resets system)
```bash
# WARNING: Removes all state and memory
./cleanup-project.sh
# Select option 5 (Full clean including runtime data)
```

## What NOT to Clean

1. **Main `package-lock.json`** - Required for consistent dependencies
2. **`.git/`** - Version control (obviously!)
3. **`node_modules/`** - Use `npm ci` to reinstall if needed
4. **Source code** in `src/`
5. **Documentation** (`*.md` files)
6. **Configuration** (`.claude/`, `jest.config.js`, etc.)

## Space Savings Estimate

- **Minimal cleanup**: ~50KB-1MB
- **Recommended cleanup**: ~100MB+ (if Rust target exists)
- **Full cleanup**: ~115MB+ (includes runtime data)

## Post-Cleanup Actions

After cleanup, you may need to:
1. Run `npm run build` to regenerate TypeScript output
2. Run `cd ruv-FANN && cargo build --release` to rebuild Rust binaries
3. System will recreate `.swarm/` and `.hive-mind/` on next run

---

**Recommendation**: Run `./cleanup-project.sh` and select option 4 for a safe, comprehensive cleanup that preserves your runtime state.