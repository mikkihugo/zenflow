#!/bin/bash

echo "Fixing TypeScript syntax issues systematically..."

# Fix common string literal corruptions
find src -name "*.ts" -exec sed -i 's/\`$/'"'"'/g' {} +
find src -name "*.ts" -exec sed -i 's/\`, /, /g' {} +
find src -name "*.ts" -exec sed -i 's/\`);/'"'"');/g' {} +
find src -name "*.ts" -exec sed -i 's/\`}/'"'"'}/g' {} +
find src -name "*.ts" -exec sed -i 's/\`:/'"'"':/g' {} +
find src -name "*.ts" -exec sed -i 's/\`;/'"'"';/g' {} +
find src -name "*.ts" -exec sed -i 's/\`\./'"'"'./g' {} +

# Fix specific problematic patterns
find src -name "*.ts" -exec sed -i 's/escalation\`/escalation'"'"'/g' {} +
find src -name "*.ts" -exec sed -i 's/warning\`/warning'"'"'/g' {} +
find src -name "*.ts" -exec sed -i 's/error\`/error'"'"'/g' {} +
find src -name "*.ts" -exec sed -i 's/info\`/info'"'"'/g' {} +

# Fix template literal markers that should be strings
find src -name "*.ts" -exec sed -i 's/type: '"'"'\([^'"'"']*\)\`/type: '"'"'\1'"'"'/g' {} +

# Fix array and object literal endings
find src -name "*.ts" -exec sed -i 's/\]\`/]'"'"'/g' {} +
find src -name "*.ts" -exec sed -i 's/}\`/}'"'"'/g' {} +

echo "Basic syntax fixes applied."