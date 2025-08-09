# Deprecated DAO Directory

This `daos/` directory is deprecated in favor of the canonical implementations in `../dao/`.

Temporary shims are kept to avoid breaking dynamic imports while migrating:
- CoordinationDAO -> CoordinationDao
- GraphDAO -> GraphDao
- MemoryDAO -> MemoryDao
- RelationalDAO -> RelationalDao
- VectorDAO -> VectorDao

Removal Plan:
1. Update all imports to use `database/dao/*`
2. Remove these shims after one release cycle.
