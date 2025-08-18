# Simple TypeScript Setup - Quick Start

This is a minimal TypeScript setup guide for getting started quickly.

## 1. Quick Setup (5 minutes)

```bash
# Create and enter project directory
mkdir my-ts-project && cd my-ts-project

# Initialize npm project
npm init -y

# Install TypeScript dependencies
npm install -D typescript @types/node ts-node

# Generate TypeScript config
npx tsc --init
```

## 2. Basic Project Structure

```bash
# Create source directory and main file
mkdir src
echo 'console.log("Hello TypeScript!");' > src/index.ts
```

## 3. Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## 4. Simple tsconfig.json

Replace generated config with this minimal version:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

## 5. Test Your Setup

```bash
# Run in development
npm run dev

# Build for production
npm run build
npm start
```

## Sample TypeScript Code

Replace `src/index.ts` with this example:

```typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

const user: User = {
  name: "TypeScript Developer",
  age: 25
};

console.log(greet(user));

// Type safety example
// user.age = "twenty-five"; // This would cause a TypeScript error!
```

## That's It! 🎉

You now have a working TypeScript setup. Your project structure should look like:

```
my-ts-project/
├── src/
│   └── index.ts
├── dist/           (created after build)
├── node_modules/
├── package.json
└── tsconfig.json
```

## Next Steps

- Use `npm run dev` for development
- Use `npm run build` then `npm start` for production
- For more advanced features, see the [comprehensive setup guide](./typescript-setup-guide.md)

## Common Commands

```bash
npm run dev      # Run TypeScript directly
npm run build    # Compile to JavaScript
npm start        # Run compiled JavaScript
npx tsc --watch  # Auto-compile on file changes
```

That's the essentials! You're ready to start coding with TypeScript. 🚀