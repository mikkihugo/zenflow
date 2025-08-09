# Bracket Notation Transformer

The bracket notation transformer converts dot notation property access to bracket notation for objects that require it, targeting TypeScript error TS4111: "Property 'X' of type 'Y' must be accessed with bracket notation."

## Usage

```bash
# Apply transformations
npm run fix:bracket-notation

# Dry run (show what would be changed without modifying files)
npm run fix:bracket-notation:dry

# Verbose output (see detailed transformations)
npm run fix:bracket-notation:verbose
```

## What it transforms

### Object Patterns
The transformer identifies objects that typically require bracket notation:

- **HTTP Headers**: `headers`, `requestHeaders`, `responseHeaders`, `httpHeaders`
- **Configuration**: `config`, `options`, `settings`, `env`, `params`
- **WASM/Modules**: `wasm*`, `module`, `exports`, `instance`
- **Events/Data**: `event`, `message`, `data`, `payload`
- **Generic**: `obj`, `object`, `props`, `attributes`, `metadata`

### Property Patterns
The transformer identifies properties that typically require bracket notation:

- **HTTP Headers**: `Authorization`, `Content-Type`, `Content-Length`, `User-Agent`, etc.
- **Environment Variables**: All caps with underscores (e.g., `API_KEY`, `NODE_ENV`)
- **Special Characters**: Properties with dashes (`Content-Type`)
- **WASM Functions**: Underscore-prefixed (`_privateFunc`) or snake_case (`func_name`)
- **Numeric Properties**: Properties that are numbers

## Examples

### Before
```typescript
// HTTP headers
const auth = headers.Authorization;
const contentType = headers['Content-Type']; // Already bracket notation - left alone

// Configuration
const apiKey = config.API_KEY;
const port = config.PORT;

// WASM module
const func = wasmModule._privateFunc;
const result = wasmModule.snake_case_func();

// Optional chaining
const header = headers?.Authorization;
```

### After
```typescript
// HTTP headers
const auth = headers['Authorization'];
const contentType = headers['Content-Type']; // Unchanged

// Configuration  
const apiKey = config['API_KEY'];
const port = config['PORT'];

// WASM module
const func = wasmModule['_privateFunc'];
const result = wasmModule['snake_case_func']();

// Optional chaining
const header = headers?.['Authorization'];
```

## What it doesn't transform

### Safe Properties
Common safe properties that don't need bracket notation:

- **Array methods**: `length`, `forEach`, `map`, `filter`, `reduce`, etc.
- **Object methods**: `toString`, `valueOf`, `constructor`, `prototype`
- **Built-in methods**: `entries`, `keys`, `values`, `hasOwnProperty`
- **DOM properties**: `id`, `name`, `type`, `className`, `style`
- **Console methods**: `log`, `warn`, `error`, `info`, `debug`

### Built-in Objects
Built-in and global objects are excluded:

- **JavaScript Built-ins**: `Object`, `Array`, `String`, `Number`, `Date`, etc.
- **Node.js Globals**: `console`, `process`, `Buffer`, `global`
- **Browser Globals**: `window`, `document`, `fetch`, `Response`
- **ES6+ Types**: `Set`, `Map`, `Promise`, `Symbol`, `BigInt`

## Configuration

The transformer can be configured by modifying the patterns in `bracket-notation-fixer.cjs`:

### BRACKET_NOTATION_PATTERNS
Add regex patterns for object names that require bracket notation:

```javascript
const BRACKET_NOTATION_PATTERNS = [
  /^headers?$/i,     // headers, header
  /^config$/i,       // config
  /^wasm/i,          // wasmModule, wasmInstance, etc.
  // Add your patterns here
];
```

### PROPERTY_PATTERNS  
Add regex patterns for property names that require bracket notation:

```javascript
const PROPERTY_PATTERNS = [
  /^Authorization$/,  // HTTP Authorization header
  /^[A-Z_]+$/,       // ALL_CAPS_WITH_UNDERSCORES
  /^.*-.*$/,         // properties-with-dashes
  // Add your patterns here
];
```

## When to use

This transformer is particularly useful for:

1. **Fixing TS4111 errors** when working with objects that have index signatures
2. **HTTP request/response handling** where headers need bracket notation
3. **WASM integration** where function names often require bracket notation
4. **Configuration objects** with environment variable-style keys
5. **Dynamic property access** where TypeScript requires explicit bracket notation

## TypeScript Context

The TS4111 error occurs when:

1. An object has an index signature like `{ [key: string]: any }`
2. Properties are accessed using dot notation
3. TypeScript cannot guarantee the property exists at compile time

Example that triggers TS4111:
```typescript
interface Headers {
  [key: string]: string;
}

declare const headers: Headers;
const auth = headers.Authorization; // TS4111: Property 'Authorization' must be accessed with bracket notation
```

Fixed with bracket notation:
```typescript
const auth = headers['Authorization']; // ✅ No error
```

## Integration with other tools

This transformer works well with:

- **ESLint**: Run before ESLint to fix bracket notation issues
- **TypeScript**: Resolves TS4111 compilation errors
- **Process env fixer**: Complements the existing process.env bracket fixer
- **Naming convention fixer**: Can be run together for comprehensive fixes

## Advanced Usage

### Target specific files
```bash
npx jscodeshift --transform=scripts/transformers/bracket-notation-fixer.cjs --parser=tsx src/specific-file.ts
```

### Custom options
```bash
npx jscodeshift --transform=scripts/transformers/bracket-notation-fixer.cjs --parser=tsx --verbose=2 --dry src/**/*.ts
```

### Run in series
```bash
npm run fix:process-env && npm run fix:bracket-notation && npm run lint
```