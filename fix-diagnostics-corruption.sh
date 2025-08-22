#!/bin/bash

echo "🔧 Fixing diagnostics.ts corruption patterns..."

TARGET_FILE="/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/coordination/diagnostics/diagnostics.ts"

# Fix logger initialization corruption
sed -i "s/getLogger('diagnostics, { level: DEBUG' ')/getLogger('diagnostics', { level: 'DEBUG' })/g" "$TARGET_FILE"

# Fix process method calls
sed -i 's/process?.memoryUsage/process.memoryUsage()/g' "$TARGET_FILE"
sed -i 's/process?.cpuUsage/process.cpuUsage()/g' "$TARGET_FILE"
sed -i 's/process?.uptime/process.uptime()/g' "$TARGET_FILE"
sed -i 's/performance?.now/performance.now()/g' "$TARGET_FILE"

# Fix optional chaining issues
sed -i 's/?\.shift()/.shift();/g' "$TARGET_FILE"
sed -i 's/?\.toISOString()/.toISOString();/g' "$TARGET_FILE"
sed -i 's/?\.getHours()/.getHours()/g' "$TARGET_FILE"

# Fix missing function calls
sed -i 's/this\.stopMonitoring;/this.stopMonitoring();/g' "$TARGET_FILE"
sed -i 's/this\.collectSample;/this.collectSample();/g' "$TARGET_FILE"
sed -i 's/this\.system?.startMonitoring()/this.system.startMonitoring();/g' "$TARGET_FILE"
sed -i 's/this\.system?.stopMonitoring()/this.system.stopMonitoring();/g' "$TARGET_FILE"
sed -i 's/this\.connection?.generateReport/this.connection.generateReport()/g' "$TARGET_FILE"
sed -i 's/this\.performance?.getSlowOperations/this.performance.getSlowOperations()/g' "$TARGET_FILE"
sed -i 's/this\.system?.getSystemHealth/this.system.getSystemHealth()/g' "$TARGET_FILE"
sed -i 's/await this\.collectRecentLogs/await this.collectRecentLogs()/g' "$TARGET_FILE"

# Fix test method calls
sed -i 's/await this\.testMemoryAllocation/await this.testMemoryAllocation()/g' "$TARGET_FILE"
sed -i 's/await this\.testFileSystem/await this.testFileSystem()/g' "$TARGET_FILE"
sed -i 's/await this\.testWasmLoading/await this.testWasmLoading()/g' "$TARGET_FILE"

# Fix union types corruption  
sed -i "s/'healthy | warning' | 'critical | unknown'/'healthy' | 'warning' | 'critical' | 'unknown'/g" "$TARGET_FILE"

# Fix string template issues
sed -i "s/{ component: 'system, message:/{ component: 'system', message:/g" "$TARGET_FILE"
sed -i "s/component: 'memory, message:/component: 'memory', message:/g" "$TARGET_FILE"
sed -i "s/component: 'handles, message:/component: 'handles', message:/g" "$TARGET_FILE"

# Fix path construction
sed -i "s/process?.cwd, 'logs,/process.cwd(), 'logs',/g" "$TARGET_FILE"
sed -i "s/process?.cwd, 'wasm,/process.cwd(), 'wasm',/g" "$TARGET_FILE"

# Fix environment variable access
sed -i "s/process.env\['LOG_TO_FILE\]/process.env\['LOG_TO_FILE'\]/g" "$TARGET_FILE"

# Fix property access
sed -i 's/process?.memoryUsage\.heapUsed/process.memoryUsage().heapUsed/g' "$TARGET_FILE"

# Fix new Date issues
sed -i 's/new Date()?\.toISOString/new Date().toISOString()/g' "$TARGET_FILE"

echo "✅ Fixed diagnostics.ts corruption patterns"