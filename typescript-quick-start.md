# TypeScript Quick Start Guide

Get TypeScript running in 5 minutes with zero configuration hassles.

## Prerequisites
- Node.js 18+ installed
- Basic JavaScript knowledge

## 1. Create Project & Install Dependencies

```bash
# Create project
mkdir my-ts-project && cd my-ts-project
npm init -y

# Install essentials (one command)
npm install -D typescript @types/node tsx
```

**What we installed:**
- `typescript` - The TypeScript compiler
- `@types/node` - Node.js type definitions
- `tsx` - Modern TypeScript runner (faster than ts-node)

## 2. Basic Configuration

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 3. Add Scripts to package.json

```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "dev:watch": "tsx --watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## 4. Create Your First TypeScript File

Create `src/index.ts`:
```typescript
// Basic types
interface User {
  id: number;
  name: string;
  email: string;
  active?: boolean; // Optional property
}

// Function with proper typing
function createUser(name: string, email: string): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    active: true
  };
}

function greetUser(user: User): string {
  return `Hello, ${user.name}! Your email is ${user.email}`;
}

// Usage
const user = createUser("Alice", "alice@example.com");
console.log(greetUser(user));

// Array of users
const users: User[] = [
  createUser("Bob", "bob@example.com"),
  createUser("Charlie", "charlie@example.com")
];

console.log(`We have ${users.length} users`);
```

## 5. Run Your Code

```bash
# Development (with auto-restart on file changes)
npm run dev:watch

# Single run
npm run dev

# Build for production
npm run build
npm start
```

## Essential TypeScript Concepts

### Basic Types
```typescript
// Primitives
const message: string = "Hello";
const count: number = 42;
const isActive: boolean = true;

// Arrays
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["Alice", "Bob"];

// Objects
const person: { name: string; age: number } = {
  name: "John",
  age: 30
};
```

### Union Types
```typescript
type Status = "pending" | "approved" | "rejected";
type ID = string | number;

function updateStatus(status: Status): void {
  console.log(`Status: ${status}`);
}

updateStatus("approved"); // ✅ Works
// updateStatus("invalid"); // ❌ TypeScript error
```

### Functions
```typescript
// Regular function
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

// Default parameters
function createUrl(host: string, port: number = 3000): string {
  return `http://${host}:${port}`;
}
```

### Error Handling Pattern
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function parseNumber(input: string): Result<number> {
  const num = Number(input);
  if (isNaN(num)) {
    return { success: false, error: "Invalid number" };
  }
  return { success: true, data: num };
}

// Usage
const result = parseNumber("123");
if (result.success) {
  console.log(result.data); // TypeScript knows this is a number
} else {
  console.error(result.error);
}
```

## Real-World Example: Simple API

```bash
# Install Express
npm install express
npm install -D @types/express
```

Create `src/server.ts`:
```typescript
import express from 'express';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const app = express();
app.use(express.json());

let todos: Todo[] = [
  { id: 1, title: "Learn TypeScript", completed: false },
  { id: 2, title: "Build an app", completed: false }
];

// GET /todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// POST /todos
app.post('/todos', (req, res) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTodo: Todo = {
    id: todos.length + 1,
    title,
    completed: false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

Run with: `npm run dev:watch`

## Common Commands

```bash
# Development
npm run dev          # Run once
npm run dev:watch    # Run with auto-restart

# Type checking
npx tsc --noEmit     # Check types without building

# Building
npm run build        # Compile to JavaScript
npm start           # Run compiled code
```

## Next Steps

Once comfortable with basics:

1. **Add testing**: `npm install -D vitest`
2. **Add linting**: `npm install -D @biomejs/biome`
3. **Learn generics**: For reusable components
4. **Explore utility types**: `Partial<T>`, `Pick<T>`, `Omit<T>`

## Troubleshooting

**"Cannot find module" errors:**
```bash
npm install -D @types/package-name
```

**Import issues:**
- Use `import/export` syntax consistently
- Check file extensions in imports

**VS Code not working:**
- Install "TypeScript Importer" extension
- Reload window (Cmd/Ctrl + Shift + P → "Reload Window")

That's it! You now have a working TypeScript setup. Start with simple types and gradually add complexity as you learn. 🚀

## Directory Structure

```
my-ts-project/
├── src/
│   ├── index.ts      # Your main file
│   └── server.ts     # API example (optional)
├── dist/             # Compiled JavaScript (auto-generated)
├── node_modules/     # Dependencies
├── package.json      # Project configuration
└── tsconfig.json     # TypeScript configuration
```

Happy coding! 🎉