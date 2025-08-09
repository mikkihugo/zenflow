# Optional Chaining Fixer Transformer

A jscodeshift transformer that automatically adds optional chaining operators (`?.`) to property access patterns that might fail with TS2532 "Object is possibly 'undefined'" errors.

## Usage

```bash
# Apply the transformation
npm run fix:optional-chaining

# Preview changes without modifying files
npm run fix:optional-chaining:dry

# Show detailed transformation logs
npm run fix:optional-chaining:verbose
```

## What it transforms

### ✅ Will Transform

```typescript
// Function parameters that might be undefined
function test(params: SomeType, options?: any) {
  const value = params.config.value;        // → params?.config?.value
  const setting = options.debug;            // → options?.debug
}

// Array access results
const first = items[0].property;            // → items[0]?.property

// Method results that might return undefined
const found = array.find(x => x.id === 1);
const name = found.name;                    // → found?.name

// Chained property access
const deep = data.nested.deep.value;       // → data?.nested?.deep?.value
```

### ❌ Won't Transform (Safe patterns)

```typescript
// Static class properties/methods
ConfigurationManager.instance              // ✅ Safe - singleton pattern
Logger.getInstance()                       // ✅ Safe - static method

// Global objects
console.log()                             // ✅ Safe - global object
process.env.NODE_ENV                      // ✅ Safe - global object

// Array/string length
items.length                              // ✅ Safe - length property
buffer.byteLength                         // ✅ Safe - length property

// 'this' references
this.method()                            // ✅ Safe - method context

// Already optional
data?.property                           // ✅ Safe - already using optional chaining
```

## Targeted Patterns

The transformer focuses on common patterns that cause TS2532 errors:

1. **Function parameters** - `params`, `options`, `config`, `props`
2. **API responses** - `result`, `response`, `data`
3. **Search results** - Variables from `find()`, `match()`, `get()` methods
4. **Nested object access** - Deep property chains
5. **Array element access** - `array[index].property`

## Command Line Options

- `--dry` - Preview changes without modifying files
- `--verbose` - Show detailed transformation logs  
- `--extensions=ts,tsx` - File extensions to transform

## Integration

The transformer is integrated into the project's fix scripts:

- Included in `npm run fix:zen:quality` for comprehensive code quality improvements
- Can be run standalone for focused optional chaining fixes
- Supports dry-run mode for safe testing

## Safety Features

- Excludes static class methods and properties
- Preserves existing optional chaining
- Skips global objects and built-ins
- Avoids transforming safe property access patterns
- Provides detailed logging for transparency