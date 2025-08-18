# Simple TypeScript Setup Guide

A minimal, practical guide to get TypeScript running in 5 minutes or less.

## 🚀 Quick Start (30 seconds)

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

**Done!** Your TypeScript project is ready.

## Step-by-Step Setup

### 1. Create Project
```bash
mkdir my-typescript-project
cd my-typescript-project
npm init -y
```

### 2. Install TypeScript
```bash
npm install -D typescript @types/node tsx
```

### 3. Create Configuration
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Add Scripts to package.json
```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "dev:watch": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  }
}
```

### 5. Create Your First TypeScript File
Create `src/index.ts`:
```typescript
// Basic TypeScript example
interface User {
  name: string;
  age: number;
  email?: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

const user: User = {
  name: "Alice",
  age: 30
};

console.log(greetUser(user));
```

### 6. Run Your Project
```bash
# Development (runs TypeScript directly)
npm run dev

# Development with auto-restart on file changes
npm run dev:watch

# Production (compile then run)
npm run build
npm start

# Type checking only (no compilation)
npm run type-check

# Clean build files
npm run clean
```

## Essential TypeScript Features

### Type Annotations
```typescript
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;
let numbers: number[] = [1, 2, 3];
```

### Interfaces
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category?: string; // Optional
}
```

### Functions
```typescript
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;
```

### Classes
```typescript
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
console.log(calc.add(2, 3)); // 5
```

## Project Structure
```
my-typescript-project/
├── src/
│   └── index.ts
├── dist/           (generated)
├── package.json
└── tsconfig.json
```

## Common Commands
```bash
# Development
npm run dev          # Run with tsx (fast)

# Building
npm run build        # Compile to JavaScript
npm start           # Run compiled JavaScript

# Type checking
npx tsc --noEmit    # Check types without building
```

## Tips
1. **Use strict mode**: Keep `"strict": true` in tsconfig.json
2. **Start simple**: Add types gradually as you learn
3. **Use VS Code**: Best TypeScript support out of the box
4. **Read error messages**: TypeScript errors are usually helpful

## Next Steps
- Add testing with Vitest: `npm install -D vitest`
- Add linting with ESLint: `npm install -D eslint @typescript-eslint/parser`
- Add formatting with Prettier: `npm install -D prettier`

That's it! You now have a working TypeScript setup. Happy coding! 🚀