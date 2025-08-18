# Complete TypeScript Setup Guide

This comprehensive guide will help you set up TypeScript in a new project, from basic setup to production-ready configuration.

## 🚀 Quick Start (30 seconds)

For experienced developers who want to get started immediately:

```bash
# Complete setup in one command block
mkdir my-ts-project && cd my-ts-project
npm init -y
npm install -D typescript @types/node tsx
mkdir src
echo 'console.log("Hello TypeScript!");' > src/index.ts
npx tsc --init --target ES2022 --module ESNext --outDir dist --rootDir src --strict
npm pkg set scripts.dev="tsx src/index.ts"
npm pkg set scripts.build="tsc"
npm run dev
```

**Done!** Your TypeScript project is ready. Continue reading for detailed explanations and advanced setup.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Basic Setup](#1-initialize-project)
- [TypeScript Configuration](#3-create-typescript-configuration)
- [Development Scripts](#4-update-packagejson-scripts)
- [Project Structure](#5-create-source-files)
- [Build and Run](#6-build-and-run)
- [Linting and Formatting](#7-optional-add-linting-and-formatting)
- [Testing Setup](#2-modern-testing-setup-with-vitest)
- [Advanced Configuration](#advanced-typescript-configuration)
- [Production Best Practices](#production-best-practices)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js (version 16+ recommended)
- npm or yarn package manager

## 1. Initialize Project

```bash
# Create project directory
mkdir my-typescript-project
cd my-typescript-project

# Initialize npm project (creates package.json)
npm init -y
```

## 2. Install TypeScript

```bash
# Core TypeScript dependencies
npm install -D typescript @types/node

# Modern development tools (recommended)
npm install -D tsx           # Fast TypeScript execution (replaces ts-node)
npm install -D vitest        # Fast testing framework (replaces Jest)
npm install -D @vitest/ui    # Testing UI

# Code quality tools
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier

# Optional but useful
npm install -D nodemon       # File watching (tsx watch is better)
npm install -D rimraf        # Cross-platform file deletion
```

**Why these dependencies?**
- `typescript`: The TypeScript compiler and language server
- `@types/node`: Type definitions for Node.js APIs and built-ins
- `tsx`: Fast TypeScript execution engine (modern replacement for ts-node)
- `vitest`: Fast testing framework with native TypeScript support
- `eslint` + `@typescript-eslint/*`: Code linting and style checking
- `prettier`: Code formatting and style consistency
- `rimraf`: Cross-platform file/directory deletion

## 3. Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    // Language and Environment
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    
    // Output
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    
    // JavaScript Support
    "allowJs": false,
    "checkJs": false,
    
    // Emit Rules
    "noEmit": false,
    "noEmitOnError": true,
    
    // Interop Constraints
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    
    // Type Checking (Strict Mode)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    
    // Performance
    "skipLibCheck": true,
    "incremental": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

## 4. Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "dev:watch": "tsx watch src/index.ts",
    "watch": "tsc --watch",
    "clean": "rm -rf dist && rm -f tsconfig.tsbuildinfo",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

**Script explanations:**
- `build`: Compile TypeScript to JavaScript
- `start`: Run the compiled JavaScript
- `dev`: Run TypeScript directly using tsx (faster than ts-node)
- `dev:watch`: Run TypeScript with auto-restart on file changes using tsx
- `watch`: Compile TypeScript in watch mode
- `clean`: Remove compiled files and build cache
- `type-check`: Check types without generating files
- `lint`: Check code style and errors with ESLint
- `lint:fix`: Automatically fix linting issues
- `format`: Format code with Prettier
- `test`: Run tests with Vitest
- `test:coverage`: Run tests with coverage reporting

## 5. Create Source Files

Create `src/index.ts`:

```typescript
// src/index.ts
console.log("Hello, TypeScript!");

interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};

console.log(greetUser(user));
```

## 6. Project Structure

Organize your TypeScript project with this recommended structure:

```
my-typescript-project/
├── src/                  # Source code
│   ├── index.ts         # Main entry point
│   ├── types/           # Type definitions
│   │   └── index.ts     # Exported types
│   ├── utils/           # Utility functions
│   │   └── helpers.ts   # Helper functions
│   ├── lib/             # Core library code
│   ├── config/          # Configuration files
│   └── services/        # Service layer
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── dist/               # Compiled output (auto-generated)
├── docs/               # Documentation
├── .vscode/            # VS Code settings
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

**Create the basic structure:**
```bash
mkdir -p src/{types,utils,lib,config,services} tests/{unit,integration} docs .vscode
```

### VS Code Configuration (Recommended)

Create `.vscode/settings.json` for optimal TypeScript development:

```json
{
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/*.tsbuildinfo": true
  }
}
```

Create `.vscode/extensions.json` for recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.eslint",
    "bradlc.vscode-tailwindcss",
    "vitest.explorer"
  ]
}
```

### .gitignore Configuration

Create `.gitignore` for TypeScript projects:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
dist/
build/
*.tsbuildinfo
*.d.ts.map

# Testing
coverage/
.nyc_output

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock
```

## 7. Build and Run

```bash
# Development: Run with auto-restart (recommended for development)
npm run dev:watch

# Development: Single run
npm run dev

# Production: Compile and run
npm run build
npm start

# Type checking only (no compilation)
npm run type-check
```

**Development workflow:**
1. Use `npm run dev:watch` during development
2. Use `npm run type-check` to verify types
3. Use `npm run build` for production builds

## 7. Optional: Add Linting and Formatting

```bash
# Install ESLint and Prettier
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

Create `.eslintrc.js`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Quick Start Commands

For experienced developers, here's the complete setup in one go:

```bash
# Full setup script
mkdir my-typescript-project && cd my-typescript-project
npm init -y
npm install -D typescript @types/node ts-node nodemon

# Create tsconfig.json
npx tsc --init --target ES2020 --module commonjs --outDir dist --rootDir src --strict --esModuleInterop

# Create directory and sample file
mkdir src
cat > src/index.ts << 'EOF'
interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: "TypeScript User" };
console.log(`Hello, ${user.name}!`);
EOF

# Add npm scripts (manually edit package.json or use this one-liner)
npm pkg set scripts.dev="ts-node src/index.ts"
npm pkg set scripts.dev:watch="nodemon --exec ts-node src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"

# Test the setup
npm run dev
```

**🎉 You're ready to go! Use `npm run dev:watch` to start developing.**

## Common tsconfig.json Options

| Option | Description | Recommended Value |
|--------|-------------|-------------------|
| `target` | JavaScript version to compile to | `ES2020` |
| `module` | Module system | `commonjs` or `ESNext` |
| `strict` | Enable all strict type checking | `true` |
| `outDir` | Output directory for compiled files | `./dist` |
| `rootDir` | Root directory of source files | `./src` |
| `sourceMap` | Generate source maps | `true` |
| `declaration` | Generate .d.ts files | `true` |

## Troubleshooting

### Common Issues

**Error: Cannot find module 'typescript'**
```bash
# Install TypeScript locally
npm install -D typescript
```

**Error: tsc command not found**
```bash
# Use npx to run local TypeScript
npx tsc

# Or install globally (not recommended)
npm install -g typescript
```

**Import/export issues**
- For Node.js projects: Use `"module": "commonjs"` in tsconfig.json
- For modern projects: Use `"module": "ESNext"` and add `"type": "module"` to package.json
- Use `import` syntax consistently: `import { something } from './module'`

**Types not found**
```bash
# Install missing type definitions
npm install -D @types/package-name

# Example for Express
npm install -D @types/express
```

**File not found errors in imports**
```bash
# Always include file extensions in imports when using ES modules
import { utils } from './utils.js'  // Note: .js extension even for .ts files
```

**nodemon not restarting**
- Check your `nodemon.json` configuration
- Make sure you're watching the right file extensions
- Use: `nodemon --ext ts,js --exec ts-node src/index.ts`

### VS Code Setup (Recommended)

1. Install the "TypeScript Importer" extension
2. Add to your VS Code settings:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true
}
```

## Next Steps

- **Testing**: Add Jest with `npm install -D jest @types/jest ts-jest`
- **Web Development**: Consider Vite for frontend projects
- **API Development**: Add Express types with `npm install -D @types/express`
- **Linting**: Set up ESLint with TypeScript rules (see section 7 above)

That's it! You now have a comprehensive TypeScript setup ready for development. 🚀

## Advanced TypeScript Configuration

### For Modern Projects (ES Modules)

If you prefer ES modules, update your configuration:

**package.json:**
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/index.js"
  }
}
```

**tsconfig.json for ES Modules:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "noEmitOnError": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

### Path Mapping and Aliases

Add path aliases for cleaner imports:

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

Install and configure `tsc-alias`:
```bash
npm install -D tsc-alias
```

### Type-Only Imports (TypeScript 3.8+)

Use type-only imports for better performance:

```typescript
import type { User } from './types';
import { processUser } from './utils';

// For namespace imports
import type * as Types from './types';
```

## Development Environment Enhancements

### 1. Hot Reload with tsx (Recommended)

```bash
# Install tsx - faster alternative to ts-node
npm install -D tsx

# Update package.json scripts
npm pkg set scripts.dev="tsx watch src/index.ts"
```

### 2. Modern Testing Setup with Vitest

```bash
npm install -D vitest @vitest/ui c8
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  }
});
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 3. Modern Build Tools

**Using esbuild for faster builds:**
```bash
npm install -D esbuild

# Add build script
npm pkg set scripts.build:fast="esbuild src/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js"
```

**Using Vite for development:**
```bash
npm install -D vite

# vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node18',
    ssr: true,
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        format: 'esm'
      }
    }
  }
});
```

## Production Best Practices

### 1. Strict TypeScript Configuration

**tsconfig.json for production:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true
  }
}
```

### 2. Multiple TypeScript Configurations

Create separate configs for different environments:

**tsconfig.build.json:**
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "tests/**/*"]
}
```

**tsconfig.test.json:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

### 3. Package Publishing Setup

**package.json for libraries:**
```json
{
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "prepublishOnly": "npm run build && npm run test",
    "build": "tsup src/index.ts --format cjs,esm --dts"
  }
}
```

## Development Workflow Automation

### 1. Git Hooks with Husky

```bash
npm install -D husky lint-staged

# Initialize husky
npx husky init

# Add pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
```

**package.json:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### 2. Continuous Integration

**.github/workflows/ci.yml:**
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## Debugging Setup

### VS Code Configuration

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug TypeScript",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "runtimeArgs": ["--loader", "tsx/esm"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**.vscode/settings.json:**
```json
{
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  }
}
```

## Useful Type Utilities

Create `src/types/utils.ts`:

```typescript
// Utility types for better TypeScript development

// Make all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make specific properties required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Create a type with only specific properties
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

// Create result type for error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Extract array element type
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Extract promise value type
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// Create branded types for better type safety
export type Brand<T, B> = T & { __brand: B };
export type UserId = Brand<string, 'UserId'>;
export type Email = Brand<string, 'Email'>;

// Function type helpers
export type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;
```

## Performance Considerations

### 1. TypeScript Performance

- Use `skipLibCheck: true` for faster compilation
- Enable incremental compilation with `"incremental": true`
- Use project references for large codebases
- Consider using `@typescript-eslint/no-unnecessary-type-assertion`

### 2. Bundle Analysis

```bash
npm install -D @typescript-eslint/parser typescript-eslint-language-service

# Add script to analyze bundle
npm pkg set scripts.analyze="npx tsc --listFiles --skipLibCheck false | wc -l"
```

### 3. Memory Optimization

**tsconfig.json optimizations:**
```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "ts-node": {
    "transpileOnly": true,
    "files": true
  }
}
```

## Conclusion

This comprehensive guide covers everything from basic setup to advanced production configurations. Choose the configuration that best fits your project needs:

- **Simple projects**: Use the basic setup from the beginning of this guide
- **Modern applications**: Use ES modules with tsx and Vitest
- **Libraries**: Use the publishing setup with multiple output formats
- **Enterprise projects**: Use strict TypeScript config with comprehensive tooling

Remember to always start simple and add complexity as your project grows! 🚀